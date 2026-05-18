// Table filter + sort system — reusable across all NCotton list screens

const _TF_OPS = {
  text: [
    { id:'contains',     label:'contains'         },
    { id:'not_contains', label:'does not contain' },
    { id:'is',           label:'is exactly'       },
    { id:'is_not',       label:'is not'           },
    { id:'starts',       label:'starts with'      },
    { id:'empty',        label:'is empty'         },
    { id:'not_empty',    label:'is not empty'     },
  ],
  number: [
    { id:'eq',       label:'='           },
    { id:'neq',      label:'≠'           },
    { id:'gt',       label:'>'           },
    { id:'lt',       label:'<'           },
    { id:'gte',      label:'≥'           },
    { id:'lte',      label:'≤'           },
    { id:'empty',    label:'is empty'    },
    { id:'not_empty',label:'is not empty'},
  ],
  date: [
    { id:'eq',       label:'is'          },
    { id:'before',   label:'is before'   },
    { id:'after',    label:'is after'    },
    { id:'empty',    label:'is empty'    },
    { id:'not_empty',label:'is not empty'},
  ],
  select: [
    { id:'is',     label:'is'     },
    { id:'is_not', label:'is not' },
  ],
};

const _tfApplyOp = (val, op, fv, type) => {
  switch (op) {
    case 'contains':     return String(val).toLowerCase().includes(String(fv).toLowerCase());
    case 'not_contains': return !String(val).toLowerCase().includes(String(fv).toLowerCase());
    case 'is': case 'eq':    return String(val).toLowerCase() === String(fv).toLowerCase();
    case 'is_not': case 'neq': return String(val).toLowerCase() !== String(fv).toLowerCase();
    case 'starts':  return String(val).toLowerCase().startsWith(String(fv).toLowerCase());
    case 'gt': case 'after':  return type === 'number' ? Number(val) > Number(fv) : String(val) > String(fv);
    case 'lt': case 'before': return type === 'number' ? Number(val) < Number(fv) : String(val) < String(fv);
    case 'gte':     return type === 'number' ? Number(val) >= Number(fv) : String(val) >= String(fv);
    case 'lte':     return type === 'number' ? Number(val) <= Number(fv) : String(val) <= String(fv);
    case 'empty':    return val === null || val === undefined || val === '' || val === 0;
    case 'not_empty':return !(val === null || val === undefined || val === '' || val === 0);
    default: return true;
  }
};

// ---- hook ----
const useTableControls = (columnDefs) => {
  const [sorts,      setSorts]      = React.useState([]);
  const [filters,    setFilters]    = React.useState([]);
  const [sortOpen,   setSortOpen]   = React.useState(false);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [advOpen,    setAdvOpen]    = React.useState(false);
  const [cmdOpen,    setCmdOpen]    = React.useState(false);
  const [cmdQuery,   setCmdQuery]   = React.useState('');

  const toggleSort = (field) => setSorts(prev => {
    const ex = prev.find(s => s.field === field);
    if (!ex)              return [...prev, { field, dir:'asc' }];
    if (ex.dir === 'asc') return prev.map(s => s.field === field ? { ...s, dir:'desc' } : s);
    return prev.filter(s => s.field !== field);
  });

  const getSortDir = (field) => sorts.find(s => s.field === field)?.dir || null;

  const sortData = (data) => {
    if (!sorts.length) return data;
    return [...data].sort((a, b) => {
      for (const { field, dir } of sorts) {
        const col = columnDefs.find(c => c.field === field);
        let av = a[field], bv = b[field];
        if (col?.type === 'date') {
          av = av instanceof Date ? av.getTime() : 0;
          bv = bv instanceof Date ? bv.getTime() : 0;
        } else if (col?.type === 'number') {
          av = Number(av) || 0; bv = Number(bv) || 0;
        } else {
          av = String(av || '').toLowerCase(); bv = String(bv || '').toLowerCase();
        }
        if (av < bv) return dir === 'asc' ? -1 : 1;
        if (av > bv) return dir === 'asc' ?  1 : -1;
      }
      return 0;
    });
  };

  const filterData = (data) => {
    // Advanced filters
    const active = filters.filter(f => f.field && f.op && (f.value !== '' || f.op === 'empty' || f.op === 'not_empty'));
    // Command query
    const q = cmdQuery.trim();
    let result = data;

    if (active.length) {
      result = result.filter(row => active.every(f => {
        const col = columnDefs.find(c => c.field === f.field);
        const type = col?.type || 'text';
        let val = row[f.field];
        if (type === 'date') val = val instanceof Date ? val.toISOString().slice(0, 10) : '';
        return _tfApplyOp(val, f.op, f.value, type);
      }));
    }

    if (q) {
      result = result.filter(row => {
        // parse "field:value" tokens
        const tokens = q.split(/\s+/);
        return tokens.every(tok => {
          const colonIdx = tok.indexOf(':');
          if (colonIdx > 0) {
            const key = tok.slice(0, colonIdx).toLowerCase();
            const val = tok.slice(colonIdx + 1);
            const col = columnDefs.find(c =>
              c.field.toLowerCase().startsWith(key) || c.label.toLowerCase().startsWith(key)
            );
            if (col) return _tfApplyOp(row[col.field], 'contains', val, col.type || 'text');
          }
          // plain text — match any text column
          return columnDefs
            .filter(c => !c.type || c.type === 'text' || c.type === 'select')
            .some(c => _tfApplyOp(row[c.field], 'contains', tok, 'text'));
        });
      });
    }

    return result;
  };

  const addFilter    = () => setFilters(prev => [...prev, { id: Date.now(), field: columnDefs[0]?.field || '', op: 'contains', value: '' }]);
  const updateFilter = (id, patch) => setFilters(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  const removeFilter = (id) => setFilters(prev => prev.filter(f => f.id !== id));
  const clearAll     = () => { setSorts([]); setFilters([]); setCmdQuery(''); };

  const activeFilterCount = filters.filter(f => f.field && f.op && (f.value !== '' || f.op === 'empty' || f.op === 'not_empty')).length + (cmdQuery.trim() ? 1 : 0);

  return {
    sorts, setSorts, filters, setFilters,
    sortOpen, setSortOpen, filterOpen, setFilterOpen,
    advOpen, setAdvOpen, cmdOpen, setCmdOpen, cmdQuery, setCmdQuery,
    toggleSort, getSortDir, sortData, filterData,
    addFilter, updateFilter, removeFilter, clearAll,
    activeFilterCount,
  };
};

// ---- SortableHeader ----
const SortableHeader = ({ field, label, ctrl, align = 'left', className = '', style = {} }) => {
  const dir = ctrl.getSortDir(field);
  const idx = ctrl.sorts.findIndex(s => s.field === field);
  return (
    <th className={className} style={style}>
      <button
        onClick={() => ctrl.toggleSort(field)}
        style={{ display:'inline-flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', padding:0, fontSize:'inherit', fontWeight:'inherit', color:'inherit', letterSpacing:'inherit', textTransform:'inherit', width:'100%', justifyContent: align === 'right' ? 'flex-end' : 'flex-start', whiteSpace:'nowrap' }}
      >
        {label}
        {dir === 'asc'  ? <Icon.ArrowUp   size={11} style={{ opacity:.85, flexShrink:0 }} />
        : dir === 'desc' ? <Icon.ArrowDown size={11} style={{ opacity:.85, flexShrink:0 }} />
        : <Icon.ChevUpDown size={11} style={{ opacity:.22, flexShrink:0 }} />}
        {ctrl.sorts.length > 1 && idx >= 0 && (
          <span style={{ fontSize:9, background:'var(--accent)', color:'#fff', borderRadius:99, padding:'1px 4px', fontWeight:700, lineHeight:1.5, flexShrink:0 }}>{idx + 1}</span>
        )}
      </button>
    </th>
  );
};

// ---- Grip handle icon (6-dot drag affordance) ----
const _GripIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ opacity:.4 }}>
    <circle cx="9"  cy="6"  r="1.6"/><circle cx="15" cy="6"  r="1.6"/>
    <circle cx="9"  cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/>
    <circle cx="9"  cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/>
  </svg>
);

// ---- SortPanel (dropdown) ----
const SortPanel = ({ ctrl, columnDefs }) => {
  if (!ctrl.sortOpen) return null;
  return (
    <>
      <div style={{ position:'fixed', inset:0, zIndex:249 }} onClick={() => ctrl.setSortOpen(false)} />
      <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, zIndex:250, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, boxShadow:'0 4px 8px rgba(0,0,0,.08),0 16px 40px rgba(0,0,0,.18)', width:400, padding:'16px 16px 12px' }}>

        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-1)', marginBottom:14 }}>Sort by</div>

        {ctrl.sorts.length === 0 && (
          <div style={{ fontSize:12.5, color:'var(--text-3)', padding:'2px 0 12px' }}>
            No active sorts. Click a column header or add a rule below.
          </div>
        )}

        {ctrl.sorts.map((s, i) => (
          <div key={s.field + i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            {/* field */}
            <select
              value={s.field}
              onChange={e => ctrl.setSorts(prev => prev.map((x, j) => j === i ? { ...x, field: e.target.value } : x))}
              className="input"
              style={{ flex:1, fontSize:13, padding:'7px 10px', height:'auto', borderRadius:7 }}>
              {columnDefs.map(c => <option key={c.field} value={c.field}>{c.label}</option>)}
            </select>

            {/* direction */}
            <select
              value={s.dir}
              onChange={e => ctrl.setSorts(prev => prev.map((x, j) => j === i ? { ...x, dir: e.target.value } : x))}
              className="input"
              style={{ width:100, fontSize:13, padding:'7px 10px', height:'auto', borderRadius:7 }}>
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>

            {/* delete */}
            <button
              onClick={() => ctrl.setSorts(prev => prev.filter((_, j) => j !== i))}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', background:'none', border:'1px solid var(--border)', borderRadius:7, cursor:'pointer', color:'var(--text-3)', padding:'7px 9px', lineHeight:1, flexShrink:0, transition:'border-color .15s,color .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--negative)'; e.currentTarget.style.color='var(--negative)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)';   e.currentTarget.style.color='var(--text-3)'; }}>
              <Icon.Trash size={13} />
            </button>

            {/* grip */}
            <div style={{ cursor:'grab', flexShrink:0, display:'flex', alignItems:'center', paddingRight:2 }}>
              <_GripIcon />
            </div>
          </div>
        ))}

        {/* footer buttons */}
        <div style={{ display:'flex', gap:8, marginTop: ctrl.sorts.length ? 10 : 0 }}>
          <button
            className="btn btn-sm"
            style={{ gap:5 }}
            onClick={() => ctrl.setSorts(prev => [...prev, { field: columnDefs[0]?.field || '', dir:'asc' }])}>
            <Icon.Plus size={12} /> Add sort
          </button>
          {ctrl.sorts.length > 0 && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => ctrl.setSorts([])}>
              Reset sorting
            </button>
          )}
        </div>

      </div>
    </>
  );
};

// ---- Single filter row ----
const _FilterRow = ({ f, columnDefs, onUpdate, onRemove }) => {
  const col   = columnDefs.find(c => c.field === f.field);
  const type  = col?.type || 'text';
  const ops   = _TF_OPS[type] || _TF_OPS.text;
  const noVal = f.op === 'empty' || f.op === 'not_empty';

  const handleFieldChange = (field) => {
    const newCol  = columnDefs.find(c => c.field === field);
    const newType = newCol?.type || 'text';
    onUpdate({ field, op: (_TF_OPS[newType]?.[0]?.id || 'contains'), value: '' });
  };

  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
      <select value={f.field} onChange={e => handleFieldChange(e.target.value)}
        className="input" style={{ flex:'0 0 120px', fontSize:12, padding:'4px 6px', height:'auto' }}>
        {columnDefs.map(c => <option key={c.field} value={c.field}>{c.label}</option>)}
      </select>
      <select value={f.op} onChange={e => onUpdate({ op: e.target.value })}
        className="input" style={{ flex:'0 0 140px', fontSize:12, padding:'4px 6px', height:'auto' }}>
        {ops.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      {!noVal && type === 'select' ? (
        <select value={f.value} onChange={e => onUpdate({ value: e.target.value })}
          className="input" style={{ flex:1, fontSize:12, padding:'4px 6px', height:'auto' }}>
          <option value="">—</option>
          {(col.options || []).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : !noVal ? (
        <input
          type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
          value={f.value}
          onChange={e => onUpdate({ value: e.target.value })}
          placeholder="Value…"
          className="input"
          style={{ flex:1, fontSize:12, padding:'4px 8px' }}
        />
      ) : <div style={{ flex:1 }} />}
      <button onClick={onRemove} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', padding:'2px 4px', lineHeight:1, flexShrink:0 }}>
        <Icon.X size={12} />
      </button>
    </div>
  );
};

// ---- FilterPanel (dropdown) ----
const FilterPanel = ({ ctrl, columnDefs }) => {
  if (!ctrl.filterOpen) return null;
  return (
    <>
      <div style={{ position:'fixed', inset:0, zIndex:249 }} onClick={() => ctrl.setFilterOpen(false)} />
      <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, zIndex:250, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, boxShadow:'0 4px 6px rgba(0,0,0,.06),0 12px 32px rgba(0,0,0,.14)', width:490, padding:14 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <span style={{ fontSize:12, fontWeight:600, color:'var(--text-2)' }}>Filter conditions</span>
          {ctrl.filters.length > 0 && <button onClick={() => ctrl.setFilters([])} style={{ fontSize:11, background:'none', border:'none', cursor:'pointer', color:'var(--negative)', padding:0, fontFamily:'inherit' }}>Clear all</button>}
        </div>
        {ctrl.filters.length === 0 && (
          <div style={{ fontSize:12, color:'var(--text-3)', padding:'4px 0 8px' }}>No active filters. Add a condition below to narrow results.</div>
        )}
        {ctrl.filters.map(f => (
          <_FilterRow key={f.id} f={f} columnDefs={columnDefs}
            onUpdate={(patch) => ctrl.updateFilter(f.id, patch)}
            onRemove={() => ctrl.removeFilter(f.id)} />
        ))}
        <button onClick={ctrl.addFilter}
          style={{ display:'flex', alignItems:'center', gap:5, marginTop:8, background:'none', border:'none', cursor:'pointer', color:'var(--accent)', fontSize:12, padding:0, fontFamily:'inherit', fontWeight:500 }}>
          <Icon.Plus size={12} /> Add condition
        </button>
      </div>
    </>
  );
};

// ---- AdvancedFilterPanel (full-width inline panel) ----
const AdvancedFilterPanel = ({ ctrl, columnDefs }) => (
  <div style={{ border:'1px solid var(--border)', borderRadius:10, background:'var(--surface)', padding:'14px 16px', marginBottom:10 }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <Icon.Filter size={13} style={{ color:'var(--text-3)' }} />
        <span style={{ fontSize:12.5, fontWeight:600, color:'var(--text-1)' }}>Advanced filters</span>
        {ctrl.activeFilterCount > 0 && <span style={{ fontSize:10, background:'var(--accent)', color:'#fff', borderRadius:99, padding:'1px 6px', fontWeight:700 }}>{ctrl.activeFilterCount}</span>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {ctrl.filters.length > 0 && <button onClick={() => ctrl.setFilters([])} style={{ fontSize:11.5, background:'none', border:'none', cursor:'pointer', color:'var(--negative)', padding:0, fontFamily:'inherit' }}>Clear filters</button>}
        <button onClick={() => ctrl.setAdvOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', padding:'2px 4px', lineHeight:1 }}>
          <Icon.X size={13} />
        </button>
      </div>
    </div>
    {ctrl.filters.length === 0 && (
      <div style={{ fontSize:12, color:'var(--text-3)', padding:'2px 0 8px' }}>No conditions yet. Each row must match all conditions (AND logic).</div>
    )}
    {ctrl.filters.map(f => (
      <_FilterRow key={f.id} f={f} columnDefs={columnDefs}
        onUpdate={(patch) => ctrl.updateFilter(f.id, patch)}
        onRemove={() => ctrl.removeFilter(f.id)} />
    ))}
    <button onClick={ctrl.addFilter}
      style={{ display:'flex', alignItems:'center', gap:5, marginTop:8, background:'none', border:'none', cursor:'pointer', color:'var(--accent)', fontSize:12, padding:0, fontFamily:'inherit', fontWeight:500 }}>
      <Icon.Plus size={12} /> Add filter condition
    </button>
  </div>
);

// ---- CommandFilterPanel (inline smart search) ----
const CommandFilterPanel = ({ ctrl, columnDefs }) => (
  <div style={{ border:'1px solid var(--border)', borderRadius:10, background:'var(--surface)', padding:'10px 14px', marginBottom:10 }}>
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <Icon.Search size={13} style={{ color:'var(--text-3)', flexShrink:0 }} />
      <input
        autoFocus
        type="text"
        value={ctrl.cmdQuery}
        onChange={e => ctrl.setCmdQuery(e.target.value)}
        placeholder={`Search… or use field:value  (e.g. buyer:Arvind  status:paid  tag:export)`}
        style={{ flex:1, border:'none', background:'transparent', outline:'none', fontSize:12.5, color:'var(--text-1)', fontFamily:'inherit' }}
      />
      {ctrl.cmdQuery && (
        <button onClick={() => ctrl.setCmdQuery('')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', padding:'2px 4px', lineHeight:1 }}>
          <Icon.X size={12} />
        </button>
      )}
    </div>
    {ctrl.cmdQuery && (
      <div style={{ marginTop:8, paddingTop:8, borderTop:'1px solid var(--border)', fontSize:11.5, color:'var(--text-3)', display:'flex', flexWrap:'wrap', gap:6 }}>
        {columnDefs.filter(c => !c.type || c.type === 'text' || c.type === 'select').map(c => (
          <span key={c.field} style={{ background:'var(--surface-2)', borderRadius:4, padding:'1px 6px' }}>{c.field.toLowerCase()}:</span>
        ))}
        <span style={{ marginLeft:4 }}>— prefix with field name to filter that column specifically</span>
      </div>
    )}
  </div>
);

// ---- FilterToolbar (main export) ----
const FilterToolbar = ({ ctrl, columnDefs, totalCount, filteredCount }) => {
  const activeSorts = ctrl.sorts.length;
  const hasAny      = activeSorts > 0 || ctrl.activeFilterCount > 0;

  return (
    <div>
      {/* Row 1 — Advanced + Command */}
      <div style={{ display:'flex', gap:6, marginBottom:8 }}>
        <button
          className={`btn btn-sm ${ctrl.advOpen ? '' : 'btn-ghost'}`}
          style={{ gap:6, border: ctrl.advOpen ? undefined : 'none' }}
          onClick={() => { ctrl.setAdvOpen(o => !o); ctrl.setCmdOpen(false); }}>
          <Icon.Filter size={12} />
          Advanced filters
          {ctrl.activeFilterCount > 0 && (
            <span style={{ fontSize:10, background:'var(--accent)', color:'#fff', borderRadius:99, padding:'1px 5px', fontWeight:700 }}>{ctrl.activeFilterCount}</span>
          )}
        </button>
        <button
          className={`btn btn-sm ${ctrl.cmdOpen ? '' : 'btn-ghost'}`}
          style={{ gap:6, border: ctrl.cmdOpen ? undefined : 'none' }}
          onClick={() => { ctrl.setCmdOpen(o => !o); ctrl.setAdvOpen(false); }}>
          <Icon.Search size={12} />
          Command filters
          <span style={{ fontSize:10, opacity:.45, letterSpacing:'.02em' }}>⌘F</span>
          {ctrl.cmdQuery && (
            <span style={{ fontSize:10, background:'var(--accent)', color:'#fff', borderRadius:99, padding:'1px 5px', fontWeight:700 }}>1</span>
          )}
        </button>
      </div>

      {/* Inline panels */}
      {ctrl.advOpen && <AdvancedFilterPanel ctrl={ctrl} columnDefs={columnDefs} />}
      {ctrl.cmdOpen && <CommandFilterPanel  ctrl={ctrl} columnDefs={columnDefs} />}

      {/* Row 2 — Sort · Filter · Clear · count */}
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
        <div style={{ position:'relative' }}>
          <button
            className={`btn btn-sm ${activeSorts > 0 || ctrl.sortOpen ? '' : 'btn-ghost'}`}
            style={{ gap:5, border: activeSorts > 0 || ctrl.sortOpen ? undefined : 'none' }}
            onClick={() => { ctrl.setSortOpen(o => !o); ctrl.setFilterOpen(false); }}>
            <Icon.ChevUpDown size={12} />
            {activeSorts > 0 ? `Sort ${activeSorts}` : 'Sort'}
          </button>
          <SortPanel ctrl={ctrl} columnDefs={columnDefs} />
        </div>

        <div style={{ position:'relative' }}>
          <button
            className={`btn btn-sm ${ctrl.activeFilterCount > 0 && !ctrl.advOpen ? '' : 'btn-ghost'}`}
            style={{ gap:5, border: ctrl.activeFilterCount > 0 && !ctrl.advOpen ? undefined : 'none' }}
            onClick={() => { ctrl.setFilterOpen(o => !o); ctrl.setSortOpen(false); }}>
            <Icon.Filter size={12} />
            Filter
            {ctrl.activeFilterCount > 0 && !ctrl.advOpen && (
              <span style={{ fontSize:10, fontWeight:700, background:'var(--surface-2)', borderRadius:99, padding:'1px 5px' }}>{ctrl.activeFilterCount}</span>
            )}
          </button>
          <FilterPanel ctrl={ctrl} columnDefs={columnDefs} />
        </div>

        {hasAny && (
          <button className="btn btn-sm btn-ghost" style={{ border:'none', color:'var(--text-3)', gap:4 }} onClick={ctrl.clearAll}>
            <Icon.X size={11} /> Clear
          </button>
        )}

        <div style={{ flex:1 }} />

        {typeof filteredCount === 'number' && typeof totalCount === 'number' && (
          <span style={{ fontSize:12, color:'var(--text-3)', whiteSpace:'nowrap' }}>
            {filteredCount !== totalCount || hasAny ? `${filteredCount} of ${totalCount}` : `${totalCount} rows`}
          </span>
        )}
      </div>
    </div>
  );
};

window.TableFilters = { useTableControls, SortableHeader, FilterToolbar };
