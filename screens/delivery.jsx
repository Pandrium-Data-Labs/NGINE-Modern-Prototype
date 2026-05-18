// Delivery / Mill Passing — list + detail

const { Sparkline, Sparkbar, Field, Input, Select, Badge, Section, fmtNum } = window.UI;
const { DELIVERIES, CONFIRMATIONS, fmtDateShort, fmtDate } = window.NCData;
const { useTableControls, SortableHeader, FilterToolbar } = window.TableFilters;

const DELIV_COLS = [
  { field:'id',     label:'ID',       type:'text'   },
  { field:'conf',   label:'Conf No',  type:'text'   },
  { field:'date',   label:'Date',     type:'date'   },
  { field:'bales',  label:'Bales',    type:'number' },
  { field:'net',    label:'Net (kg)', type:'number' },
  { field:'status', label:'Status',   type:'select', options:['In transit','Mill passing','Delivered'] },
];

const Delivery = ({ onClose, onCmd }) => {
  const [selected, setSelected] = React.useState(DELIVERIES[0]);
  const [filter, setFilter] = React.useState('all');
  const ctrl = useTableControls(DELIV_COLS);
  const [exportMode, setExportMode] = React.useState(false);
  const [exportSel,  setExportSel]  = React.useState([]);
  const [fmtOpen,    setFmtOpen]    = React.useState(false);

  const stats = {
    inTransit: DELIVERIES.filter(d => d.status === 'In transit').length,
    passing: DELIVERIES.filter(d => d.status === 'Mill passing').length,
    delivered: DELIVERIES.filter(d => d.status === 'Delivered').length,
  };

  const tabFiltered = filter === 'all' ? DELIVERIES : DELIVERIES.filter(d => d.status.toLowerCase().includes(filter));
  const filtered    = ctrl.sortData(ctrl.filterData(tabFiltered));
  const allExpSel   = filtered.length > 0 && filtered.every(d => exportSel.includes(d.id));

  const _dl = (content, filename, mime) => {
    const blob = new Blob(['﻿', content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const doExport = (fmt) => {
    const cols = [
      { h:'ID',       v: d => d.id },
      { h:'Conf No',  v: d => d.conf },
      { h:'Date',     v: d => d.date instanceof Date ? d.date.toLocaleDateString('en-IN') : d.date },
      { h:'Bales',    v: d => d.bales },
      { h:'Net (kg)', v: d => d.net },
      { h:'Status',   v: d => d.status },
    ];
    const rows = filtered.filter(d => exportSel.includes(d.id));
    const esc  = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    if (fmt === 'csv') {
      _dl([cols.map(c => esc(c.h)).join(','), ...rows.map(d => cols.map(c => esc(c.v(d))).join(','))].join('\r\n'), 'deliveries.csv', 'text/csv');
    } else if (fmt === 'excel') {
      const th = `<tr>${cols.map(c => `<th>${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(d => `<tr>${cols.map(c => `<td>${c.v(d)}</td>`).join('')}</tr>`).join('');
      _dl(`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/></head><body><table>${th}${tb}</table></body></html>`, 'deliveries.xls', 'application/vnd.ms-excel');
    } else if (fmt === 'word') {
      const th = `<tr>${cols.map(c => `<th>${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(d => `<tr>${cols.map(c => `<td>${c.v(d)}</td>`).join('')}</tr>`).join('');
      _dl(`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"/></head><body><h2>Deliveries</h2><table border="1">${th}${tb}</table></body></html>`, 'deliveries.doc', 'application/msword');
    } else if (fmt === 'pdf') {
      const th = `<tr>${cols.map(c => `<th style="padding:8px;border:1px solid #ddd;background:#f5f5f5;text-align:left">${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(d => `<tr>${cols.map(c => `<td style="padding:8px;border:1px solid #ddd">${c.v(d)}</td>`).join('')}</tr>`).join('');
      const w = window.open('', '_blank');
      w.document.write(`<!DOCTYPE html><html><head><title>Deliveries</title><style>body{font-family:sans-serif;padding:24px}table{border-collapse:collapse;width:100%}@media print{button{display:none}}</style></head><body><h2>Deliveries</h2><table>${th}${tb}</table><script>setTimeout(()=>window.print(),400)<\/script></body></html>`);
      w.document.close();
    }
    setFmtOpen(false); setExportMode(false); setExportSel([]);
  };

  return (
    <div className="content-inner wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">Delivery & mill passing</h1>
          <div className="page-sub">Track lots from station weighment to mill door · {DELIVERIES.length} active</div>
        </div>
        <div className="page-actions">
          {exportMode ? (
            <>
              <button className="btn btn-primary" disabled={exportSel.length === 0} onClick={() => setFmtOpen(true)}>
                <Icon.Download size={14} /> {exportSel.length > 0 ? `Export ${exportSel.length}` : 'Export'}
              </button>
              <button className="btn" onClick={() => { setExportMode(false); setExportSel([]); }}>
                <Icon.X size={14} /> Cancel
              </button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => setExportMode(true)}><Icon.Download size={14} /> Export</button>
              <button className="btn btn-primary" onClick={() => onCmd('new:delivery')}><Icon.Plus size={14} /> New delivery</button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">This week's lots</div>
              <div className="card-sub">{stats.inTransit} in transit · {stats.passing} passing · {stats.delivered} delivered</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
              <div>
                <div className="muted" style={{ fontSize: 11 }}>Net weight (kg)</div>
                <div className="tnum strong" style={{ fontSize: 24, letterSpacing: '-.01em' }}>{fmtNum(230558)}</div>
                <div className="kpi-delta up" style={{ fontSize: 12 }}>↑ 8.4% week-on-week</div>
              </div>
              <div style={{ flex: 1, color: 'var(--accent)' }}>
                <Sparkbar data={[18000,21000,19500,24000,22500,27000,28500,26000,31000,29500,33000,32000,34500,38000]} width={300} height={56} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Shortage radar</div>
              <div className="card-sub">Variance against confirmed weight</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: '14px 18px' }}>
            {[
              { id: 'DL-26-0309', pct: 1.24, tone: 'warn' },
              { id: 'DL-26-0312', pct: 0.62, tone: '' },
              { id: 'DL-26-0311', pct: 0.18, tone: '' },
              { id: 'DL-26-0310', pct: 0.04, tone: '' },
            ].map(r => (
              <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 60px', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                <div className="cell-mono cell-strong">{r.id}</div>
                <div className="bar"><div style={{ width: `${Math.min(r.pct * 30, 100)}%`, background: r.tone === 'warn' ? 'var(--warn)' : 'var(--accent)' }} /></div>
                <div className="tnum" style={{ textAlign: 'right', color: r.tone === 'warn' ? 'var(--warn)' : 'var(--text-2)', fontWeight: 500 }}>{r.pct.toFixed(2)}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', gap: 4 }}>
              {['all','transit','passing','delivered'].map(f => (
                <button key={f} className={`btn btn-sm ${filter === f ? '' : 'btn-ghost'}`} onClick={() => setFilter(f)} style={filter === f ? {} : { border: 'none' }}>
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding:'0 16px 4px' }}>
            <FilterToolbar ctrl={ctrl} columnDefs={DELIV_COLS} totalCount={tabFiltered.length} filteredCount={filtered.length} />
          </div>
          <table className="tbl">
            <thead>
              <tr>
                {exportMode && (
                  <th style={{ width:36, paddingLeft:14 }}>
                    <input type="checkbox" checked={allExpSel} onChange={e => setExportSel(e.target.checked ? filtered.map(d => d.id) : [])} />
                  </th>
                )}
                <SortableHeader field="id"     label="ID"       ctrl={ctrl} style={{ width:110 }} />
                <SortableHeader field="conf"   label="Conf No"  ctrl={ctrl} style={{ width:110 }} />
                <SortableHeader field="date"   label="Date"     ctrl={ctrl} />
                <SortableHeader field="bales"  label="Bales"    ctrl={ctrl} className="num" align="right" />
                <SortableHeader field="net"    label="Net (kg)" ctrl={ctrl} className="num" align="right" />
                <SortableHeader field="status" label="Status"   ctrl={ctrl} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={exportMode ? 7 : 6} style={{ textAlign:'center', padding:'32px', color:'var(--text-3)', fontSize:13 }}>
                    No deliveries match.
                  </td>
                </tr>
              )}
              {filtered.map(d => (
                <tr key={d.id} className={!exportMode && selected?.id === d.id ? 'selected' : ''}
                  onClick={() => exportMode
                    ? setExportSel(prev => prev.includes(d.id) ? prev.filter(x => x !== d.id) : [...prev, d.id])
                    : setSelected(d)}>
                  {exportMode && (
                    <td onClick={e => e.stopPropagation()} style={{ paddingLeft:14 }}>
                      <input type="checkbox" checked={exportSel.includes(d.id)}
                        onChange={() => setExportSel(prev => prev.includes(d.id) ? prev.filter(x => x !== d.id) : [...prev, d.id])} />
                    </td>
                  )}
                  <td className="cell-mono cell-strong">{d.id}</td>
                  <td className="cell-mono">{d.conf}</td>
                  <td className="muted">{fmtDateShort(d.date)}</td>
                  <td className="num tnum">{d.bales}</td>
                  <td className="num tnum cell-strong">{fmtNum(d.net)}</td>
                  <td>
                    <Badge tone={d.status === 'Delivered' ? 'success' : d.status === 'In transit' ? 'info' : 'warn'}>
                      {d.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="card" style={{ height: 'fit-content' }}>
            <div className="card-header">
              <div>
                <div className="card-title">{selected.id}</div>
                <div className="card-sub">Linked to <span className="cell-mono">{selected.conf}</span></div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="icon-btn" title="Edit"><Icon.Edit size={14} /></button>
                <button className="icon-btn" title="Email"><Icon.Mail size={14} /></button>
                <button className="icon-btn" title="More"><Icon.More size={14} /></button>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 12, columnGap: 16, fontSize: 12.5 }}>
                <span className="muted">Status</span>
                <Badge tone={selected.status === 'Delivered' ? 'success' : selected.status === 'In transit' ? 'info' : 'warn'}>{selected.status}</Badge>
                <span className="muted">Delivery date</span>
                <span className="strong">{fmtDate(selected.date)}</span>
                <span className="muted">Bale quantity</span>
                <span className="strong tnum">{selected.bales}</span>
              </div>

              <div className="divider" />

              <div style={{ fontSize: 11.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8, fontWeight: 500 }}>Weight (kg)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6 }}>
                  <div className="muted" style={{ fontSize: 11 }}>Gross</div>
                  <div className="tnum strong" style={{ fontSize: 15 }}>{fmtNum(selected.gross)}</div>
                </div>
                <div style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6 }}>
                  <div className="muted" style={{ fontSize: 11 }}>Tare</div>
                  <div className="tnum strong" style={{ fontSize: 15 }}>{fmtNum(selected.tare)}</div>
                </div>
                <div style={{ padding: '10px 12px', border: '1px solid var(--accent)', borderRadius: 6, background: 'var(--accent-faint)' }}>
                  <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 500 }}>Net</div>
                  <div className="tnum strong" style={{ fontSize: 15 }}>{fmtNum(selected.net)}</div>
                </div>
              </div>

              <div className="divider" />

              <div style={{ fontSize: 11.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8, fontWeight: 500 }}>Shortage</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="bar" style={{ flex: 1 }}><div style={{ width: '12%' }} /></div>
                <div className="tnum strong">0.42%</div>
              </div>
              <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>Within tolerance · auto-calculated from gross − tare</div>
            </div>
            <div className="card-footer">
              <button className="btn btn-ghost btn-sm"><Icon.FileText size={12} /> Print</button>
              <button className="btn btn-primary btn-sm" onClick={() => onCmd('open:invoice')}>Generate invoice <Icon.ArrowRight size={12} /></button>
            </div>
          </div>
        )}
      </div>
      {fmtOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
             onClick={() => setFmtOpen(false)}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:24, width:400, maxWidth:'100%', boxShadow:'0 8px 40px rgba(0,0,0,.18)' }}
               onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:700, fontSize:15, color:'var(--text-1)', marginBottom:6 }}>Choose export format</div>
            <div style={{ fontSize:12.5, color:'var(--text-3)', marginBottom:20 }}>Exporting {exportSel.length} delivery record{exportSel.length !== 1 ? 's' : ''}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { fmt:'csv',   label:'CSV',   icon:'FileText', color:'#2563eb', desc:'Spreadsheet-compatible'   },
                { fmt:'excel', label:'Excel', icon:'Table',    color:'#16a34a', desc:'Opens directly in Excel' },
                { fmt:'pdf',   label:'PDF',   icon:'File',     color:'#dc2626', desc:'Print-ready document'    },
                { fmt:'word',  label:'Word',  icon:'FileEdit', color:'#7c3aed', desc:'Editable Word document'  },
              ].map(({ fmt, label, icon, color, desc }) => {
                const Ic = Icon[icon] || Icon.FileText;
                return (
                  <button key={fmt} onClick={() => doExport(fmt)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', border:'1.5px solid var(--border)', borderRadius:10, cursor:'pointer', background:'var(--surface)', transition:'border-color .15s,box-shadow .15s', textAlign:'left' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=color; e.currentTarget.style.boxShadow=`0 0 0 3px ${color}22`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; }}>
                    <span style={{ width:36, height:36, borderRadius:8, background:`${color}18`, display:'grid', placeItems:'center', flexShrink:0, color }}>
                      <Ic size={17} />
                    </span>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13, color:'var(--text-1)' }}>{label}</div>
                      <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>{desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

window.Delivery = Delivery;
