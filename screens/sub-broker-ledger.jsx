// Sub-broker Ledger — commission sharing with sub-brokers

const { Field, Input, Select, Badge, Section, DatePicker, fmtNum, fmtINR, ViewMenu } = window.UI;
const { CONFIRMATIONS, SUB_BROKERS, SUB_BROKER_LEDGER, COMM_INVOICES, fmtDateShort, fmtDate } = window.NCData;
const { useTableControls, SortableHeader } = window.TableFilters;

const _sblToday = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
})();

const SBLPill = ({ status }) => {
  const cfg = {
    paid:    { color:'#15803d', bg:'rgba(34,197,94,.12)',  label:'Paid'    },
    partial: { color:'#a16207', bg:'rgba(234,179,8,.15)',  label:'Partial' },
    pending: { color:'#dc2626', bg:'rgba(239,68,68,.12)',  label:'Pending' },
  }[status] || { color:'var(--text-3)', bg:'var(--surface-2)', label: status };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, borderRadius:999, padding:'2px 9px', fontSize:11.5, fontWeight:500, background:cfg.bg, color:cfg.color, whiteSpace:'nowrap' }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:cfg.color, flexShrink:0 }} />{cfg.label}
    </span>
  );
};

// ─── New ledger entry form ───────────────────────────────────────────────────
const _NewLedgerEntry = ({ onClose, onCmd }) => {
  const [confSearch, setConfSearch] = React.useState('');
  const [confOpen,   setConfOpen]   = React.useState(false);
  const confRef = React.useRef(null);

  const [form, setForm] = React.useState({
    no: 'SBL-26-0009', date: _sblToday,
    brokerId: '', broker: '', confNo: '', ciNo: '',
    totalComm: '', shareAmt: '', status: 'pending', notes: '',
  });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target?.value ?? e }));

  const selectedBroker = SUB_BROKERS.find(b => b.id === form.brokerId);
  const linkedConf     = CONFIRMATIONS.find(c => c.no === form.confNo);

  React.useEffect(() => {
    if (selectedBroker) setForm(f => ({ ...f, broker: selectedBroker.name }));
  }, [form.brokerId]);

  React.useEffect(() => {
    if (selectedBroker && form.totalComm) {
      const share = Math.round(parseFloat(form.totalComm) * selectedBroker.commShare / 100);
      setForm(f => ({ ...f, shareAmt: String(share) }));
    }
  }, [form.brokerId, form.totalComm]);

  React.useEffect(() => {
    const handle = e => { if (confRef.current && !confRef.current.contains(e.target)) setConfOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const confResults = confSearch
    ? CONFIRMATIONS.filter(c =>
        c.no.toLowerCase().includes(confSearch.toLowerCase()) ||
        c.buyer.toLowerCase().includes(confSearch.toLowerCase()) ||
        c.seller.toLowerCase().includes(confSearch.toLowerCase()))
    : CONFIRMATIONS.slice(0, 6);

  const handleConfPick = conf => {
    setForm(f => ({ ...f, confNo: conf.no }));
    setConfSearch(conf.no);
    setConfOpen(false);
    const ci = COMM_INVOICES.find(i => i.confNo === conf.no);
    if (ci) {
      setForm(f => ({ ...f, confNo: conf.no, ciNo: ci.no, totalComm: String(ci.amount) }));
    }
  };

  return (
    <div className="content-inner wide">
      <div className="page-header">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <button className="btn btn-sm btn-ghost" onClick={onClose}><Icon.ChevronLeft size={14}/> Back</button>
            <Badge tone="info">Draft</Badge>
          </div>
          <h1 className="page-title">New sub-broker entry</h1>
          <div className="page-sub">Record commission allocation for a sub-broker on a confirmation.</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={onClose}><Icon.X size={14}/> Cancel</button>
          <button className="btn" onClick={() => { onCmd({ action:'saved:draft' }); onClose(); }}><Icon.Save size={14}/> Save draft</button>
          <button className="btn btn-primary" onClick={() => { onCmd({ action:'saved' }); onClose(); }}><Icon.Check size={14}/> Save entry</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 260px', gap:20, alignItems:'start' }}>
        <div className="card">
          <div className="card-body" style={{ padding:'6px 20px 16px' }}>

            <Section title="Document">
              <div className="form-grid">
                <Field label="Entry No.">
                  <Input value={form.no} readOnly style={{ color:'var(--text-3)', background:'var(--surface-2)' }} />
                </Field>
                <Field label="Date" required>
                  <DatePicker value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />
                </Field>
              </div>
            </Section>

            <Section title="Sub-broker">
              <div className="form-grid">
                <Field label="Sub-broker" required span={2}>
                  <Select value={form.brokerId} onChange={set('brokerId')}>
                    <option value="">Select sub-broker…</option>
                    {SUB_BROKERS.filter(b => b.status === 'active').map(b => (
                      <option key={b.id} value={b.id}>{b.name} · {b.commShare}% share</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </Section>

            <Section title="Linked confirmation">
              <div className="form-grid">
                <Field label="Confirmation no." required span={2}>
                  <div style={{ position:'relative' }} ref={confRef}>
                    <label style={{ display:'flex', alignItems:'center', gap:7, border:'1px solid var(--border)', borderRadius:6, background:'var(--bg-2)', padding:'0 10px', cursor:'text' }}
                      onFocusCapture={e => e.currentTarget.style.borderColor='var(--accent)'}
                      onBlurCapture={e => e.currentTarget.style.borderColor='var(--border)'}
                    >
                      <Icon.Search size={13} style={{ color:'var(--text-3)', flexShrink:0 }} />
                      <input value={confSearch}
                        onChange={e => { setConfSearch(e.target.value); setConfOpen(true); setForm(f => ({ ...f, confNo:'' })); }}
                        onFocus={() => setConfOpen(true)}
                        placeholder="Search confirmation no., buyer, seller…"
                        style={{ flex:1, border:'none', background:'transparent', padding:'6px 0', outline:'none', fontSize:13, color:'var(--text-1)', fontFamily:'inherit', minWidth:0 }} />
                      {confSearch && <button type="button" onClick={() => { setConfSearch(''); setForm(f => ({ ...f, confNo:'', ciNo:'' })); }} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:'var(--text-3)', padding:2, flexShrink:0 }}><Icon.X size={12}/></button>}
                    </label>
                    {confOpen && (
                      <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, boxShadow:'0 6px 24px rgba(0,0,0,.12)', zIndex:50, maxHeight:220, overflowY:'auto' }}>
                        {confResults.length === 0
                          ? <div style={{ padding:'12px 14px', fontSize:12.5, color:'var(--text-3)' }}>No confirmations found</div>
                          : confResults.map(c => (
                            <button key={c.no} type="button" onMouseDown={() => handleConfPick(c)}
                              style={{ display:'block', width:'100%', textAlign:'left', padding:'10px 14px', background:'none', border:'none', borderBottom:'1px solid var(--border)', cursor:'pointer', fontFamily:'inherit' }}
                              onMouseEnter={e => e.currentTarget.style.background='var(--surface-hover,rgba(0,0,0,.04))'}
                              onMouseLeave={e => e.currentTarget.style.background='none'}
                            >
                              <div style={{ fontWeight:600, fontSize:13, fontFamily:'var(--font-mono,monospace)', color:'var(--text-1)' }}>{c.no}</div>
                              <div style={{ fontSize:11.5, color:'var(--text-3)', marginTop:2 }}>{c.buyer} · {c.seller}</div>
                            </button>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </Field>
                <Field label="Commission invoice no." optional>
                  <Input value={form.ciNo} onChange={set('ciNo')} placeholder="e.g. CI-26-0006" />
                </Field>
              </div>
            </Section>

            <Section title="Commission">
              <div className="form-grid">
                <Field label="Total commission (₹)" required hint="Total brokerage earned on this confirmation">
                  <div className="input-group">
                    <span className="input-prefix">₹</span>
                    <Input type="number" value={form.totalComm} onChange={set('totalComm')} className="input tnum" placeholder="0" />
                  </div>
                </Field>
                <Field label="Sub-broker share (₹)" required hint={selectedBroker ? `Auto-calc at ${selectedBroker.commShare}%` : 'Select broker to auto-calculate'}>
                  <div className="input-group">
                    <span className="input-prefix">₹</span>
                    <Input type="number" value={form.shareAmt} onChange={set('shareAmt')} className="input tnum" placeholder="0" />
                  </div>
                </Field>
                <Field label="Status">
                  <Select value={form.status} onChange={set('status')}>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </Select>
                </Field>
              </div>
            </Section>

            <Section title="Notes">
              <div className="form-grid">
                <Field label="Internal notes" optional span={2}>
                  <textarea className="input textarea" rows="3" placeholder="Remarks, payment references…" value={form.notes} onChange={set('notes')} />
                </Field>
              </div>
            </Section>
          </div>
          <div className="card-footer">
            <div className="row-flex">
              <button className="btn btn-primary btn-sm" onClick={() => { onCmd({ action:'saved' }); onClose(); }}>Save entry <span className="kbd-hint">⌘↵</span></button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position:'sticky', top:16, display:'flex', flexDirection:'column', gap:12 }}>
          {selectedBroker ? (
            <div className="card">
              <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
                <div className="card-title" style={{ fontSize:12 }}>Sub-broker</div>
                <span className="cell-mono muted" style={{ fontSize:11 }}>{selectedBroker.id}</span>
              </div>
              <div className="card-body" style={{ padding:'8px 16px 14px', display:'flex', flexDirection:'column', gap:8, fontSize:12.5 }}>
                {[['Name', selectedBroker.name], ['City', selectedBroker.city], ['State', selectedBroker.state], ['Phone', selectedBroker.phone]].map(([k, v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--text-3)' }}>{k}</span>
                    <span style={{ fontWeight:500, textAlign:'right', maxWidth:150 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--border)', paddingTop:8 }}>
                  <span style={{ color:'var(--text-3)' }}>Commission share</span>
                  <span className="tnum" style={{ fontWeight:700, color:'var(--accent)' }}>{selectedBroker.commShare}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body" style={{ padding:'24px 16px', textAlign:'center', color:'var(--text-3)' }}>
                <Icon.Users size={20} />
                <div style={{ marginTop:8, fontSize:12.5, fontWeight:500, color:'var(--text-2)' }}>Select a sub-broker</div>
                <div style={{ marginTop:4, fontSize:12 }}>Details and share % will appear here.</div>
              </div>
            </div>
          )}
          {linkedConf && (
            <div className="card">
              <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
                <div className="card-title" style={{ fontSize:12 }}>Linked confirmation</div>
                <span className="cell-mono muted" style={{ fontSize:11 }}>{linkedConf.no}</span>
              </div>
              <div className="card-body" style={{ padding:'8px 16px 14px', display:'flex', flexDirection:'column', gap:8, fontSize:12.5 }}>
                {[['Buyer', linkedConf.buyer], ['Seller', linkedConf.seller], ['Station', linkedConf.station], ['Variety', linkedConf.variety]].map(([k, v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--text-3)' }}>{k}</span>
                    <span style={{ fontWeight:500, textAlign:'right', maxWidth:150 }}>{v}</span>
                  </div>
                ))}
                {selectedBroker && form.totalComm && (
                  <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--border)', paddingTop:8 }}>
                    <span style={{ color:'var(--text-3)' }}>Share ({selectedBroker.commShare}%)</span>
                    <span className="tnum" style={{ fontWeight:700 }}>
                      {fmtINR(Math.round(parseFloat(form.totalComm || 0) * selectedBroker.commShare / 100), { compact:true })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Column definitions ──────────────────────────────────────────────────────
const _SBL_COLS = [
  { field:'no',        label:'Entry No.',    defaultOn:true  },
  { field:'date',      label:'Date',         defaultOn:true  },
  { field:'broker',    label:'Sub-broker',   defaultOn:true  },
  { field:'confNo',    label:'Conf No.',     defaultOn:true  },
  { field:'ciNo',      label:'CI No.',       defaultOn:false },
  { field:'totalComm', label:'Total Commission',  defaultOn:false },
  { field:'shareAmt',  label:'Share Amt.',   defaultOn:true  },
  { field:'paid',      label:'Paid',         defaultOn:true  },
  { field:'balance',   label:'Balance',      defaultOn:true  },
  { field:'status',    label:'Status',       defaultOn:true  },
];



const _SBL_SORT_COLS = [
  { field:'no', label:'Entry No.', type:'text' }, { field:'broker', label:'Sub-broker', type:'text' },
  { field:'confNo', label:'Conf No.', type:'text' }, { field:'date', label:'Date', type:'date' },
  { field:'shareAmt', label:'Share Amt.', type:'number' }, { field:'status', label:'Status', type:'select', options:['pending','partial','paid'] },
];

// ─── Main dashboard ──────────────────────────────────────────────────────────
const SubBrokerLedger = ({ onCmd }) => {
  const [view,        setView]        = React.useState('list');
  const [tab,         setTab]         = React.useState('all');
  const [search,      setSearch]      = React.useState('');
  const [brokerFilter,setBrokerFilter]= React.useState('all');
  const [exportMode,  setExportMode]  = React.useState(false);
  const [exportSel,   setExportSel]   = React.useState([]);
  const [fmtOpen,     setFmtOpen]     = React.useState(false);
  const [visibleCols, setVisibleCols] = React.useState(
    () => new Set(_SBL_COLS.filter(c => c.defaultOn).map(c => c.field))
  );
  const vis  = f => visibleCols.has(f);
  const ctrl = useTableControls(_SBL_SORT_COLS);

  const allEntries = SUB_BROKER_LEDGER;

  const filtered = React.useMemo(() => {
    let rows = allEntries;
    if (tab !== 'all')          rows = rows.filter(e => e.status === tab);
    if (brokerFilter !== 'all') rows = rows.filter(e => e.brokerId === brokerFilter);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(e =>
        e.no.toLowerCase().includes(q)           ||
        e.broker.toLowerCase().includes(q)       ||
        e.confNo.toLowerCase().includes(q)       ||
        (e.ciNo || '').toLowerCase().includes(q)
      );
    }
    return ctrl.sortData(rows);
  }, [allEntries, tab, brokerFilter, search, ctrl.sortKey, ctrl.sortDir]);

  if (view === 'new') return <_NewLedgerEntry onClose={() => setView('list')} onCmd={onCmd} />;

  // KPIs
  const totalPayable  = allEntries.reduce((s, e) => s + (e.shareAmt || 0), 0);
  const totalPaid     = allEntries.reduce((s, e) => s + (e.paid     || 0), 0);
  const totalPending  = allEntries.reduce((s, e) => s + (e.balance  || 0), 0);
  const activeBrokers = [...new Set(allEntries.map(e => e.broker))].length;

  // Per-broker summary for tiles
  const brokerTiles = SUB_BROKERS.map(b => {
    const entries = allEntries.filter(e => e.brokerId === b.id);
    return { ...b,
      totalShare:   entries.reduce((s, e) => s + (e.shareAmt || 0), 0),
      totalPaid:    entries.reduce((s, e) => s + (e.paid     || 0), 0),
      totalBalance: entries.reduce((s, e) => s + (e.balance  || 0), 0),
      entryCount:   entries.length,
    };
  }).filter(b => b.totalShare > 0 || b.status === 'active');

  const TABS = [
    { id:'all',     label:'All'     },
    { id:'pending', label:'Pending' },
    { id:'partial', label:'Partial' },
    { id:'paid',    label:'Paid'    },
  ];

  const allExpSelected = filtered.length > 0 && filtered.every(r => exportSel.includes(r.no));

  const _dl = (content, filename, mime) => {
    const blob = new Blob(['﻿', content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const doExport = (fmt) => {
    const cols = [
      { h:'Entry No.',    v: r => r.no            },
      { h:'Date',         v: r => fmtDateShort(r.date) },
      { h:'Sub-broker',   v: r => r.broker         },
      { h:'Conf No.',     v: r => r.confNo         },
      { h:'CI No.',       v: r => r.ciNo || '—'   },
      { h:'Total Commission',  v: r => r.totalComm      },
      { h:'Share Amt.',   v: r => r.shareAmt       },
      { h:'Paid',         v: r => r.paid           },
      { h:'Balance',      v: r => r.balance        },
      { h:'Status',       v: r => r.status         },
    ];
    const rows = filtered.filter(r => exportSel.includes(r.no));
    const esc  = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    if (fmt === 'csv') {
      _dl([cols.map(c => esc(c.h)).join(','), ...rows.map(r => cols.map(c => esc(c.v(r))).join(','))].join('\r\n'), 'sub-broker-ledger.csv', 'text/csv');
    } else if (fmt === 'excel') {
      const th = `<tr>${cols.map(c => `<th>${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(r => `<tr>${cols.map(c => `<td>${c.v(r)}</td>`).join('')}</tr>`).join('');
      _dl(`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/></head><body><table>${th}${tb}</table></body></html>`, 'sub-broker-ledger.xls', 'application/vnd.ms-excel');
    } else if (fmt === 'pdf') {
      const th = `<tr>${cols.map(c => `<th style="padding:8px;border:1px solid #ddd;background:#f5f5f5;text-align:left">${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(r => `<tr>${cols.map(c => `<td style="padding:8px;border:1px solid #ddd">${c.v(r)}</td>`).join('')}</tr>`).join('');
      const w = window.open('', '_blank');
      w.document.write(`<!DOCTYPE html><html><head><title>Sub-broker Ledger</title><style>body{font-family:sans-serif;padding:24px}table{border-collapse:collapse;width:100%}@media print{button{display:none}}</style></head><body><h2>Sub-broker Ledger</h2><table>${th}${tb}</table><script>setTimeout(()=>window.print(),400)<\/script></body></html>`);
      w.document.close();
    } else if (fmt === 'word') {
      const th = `<tr>${cols.map(c => `<th>${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(r => `<tr>${cols.map(c => `<td>${c.v(r)}</td>`).join('')}</tr>`).join('');
      _dl(`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"/></head><body><h2>Sub-broker Ledger</h2><table border="1">${th}${tb}</table></body></html>`, 'sub-broker-ledger.doc', 'application/msword');
    }
    setFmtOpen(false); setExportMode(false); setExportSel([]);
  };

  return (
    <div className="content-inner wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sub-broker Ledger</h1>
          <div className="page-sub">Commission sharing with sub-brokers · {allEntries.length} entries</div>
        </div>
        <div className="page-actions">
          {exportMode ? (
            <>
              <button className="btn btn-primary" disabled={exportSel.length === 0} onClick={() => setFmtOpen(true)}>
                <Icon.Download size={14}/> {exportSel.length > 0 ? `Export ${exportSel.length}` : 'Export'}
              </button>
              <button className="btn" onClick={() => { setExportMode(false); setExportSel([]); }}><Icon.X size={14}/> Cancel</button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => setExportMode(true)}><Icon.Download size={14}/> Export</button>
              <button className="btn btn-primary" onClick={() => setView('new')}><Icon.Plus size={14}/> New entry</button>
            </>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Active sub-brokers', value: activeBrokers,                              color:'var(--text-1)'   },
          { label:'Total payable',      value: fmtINR(totalPayable, { compact:true }),     color:'var(--text-1)'   },
          { label:'Total paid out',     value: fmtINR(totalPaid,    { compact:true }),     color:'var(--positive)' },
          { label:'Pending',            value: fmtINR(totalPending, { compact:true }),     color: totalPending > 0 ? 'var(--negative)' : 'var(--text-3)' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="card-body" style={{ padding:'12px 16px' }}>
              <div className="muted" style={{ fontSize:11, marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:20, fontWeight:700, letterSpacing:'-.01em', color:s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Broker tiles */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10, marginBottom:20 }}>
        {brokerTiles.map(b => {
          const active = brokerFilter === b.id;
          const pct    = b.totalShare > 0 ? Math.round(b.totalPaid / b.totalShare * 100) : 0;
          return (
            <div key={b.id} className="card" style={{ cursor:'pointer', transition:'border-color .15s, box-shadow .15s',
              borderColor: active ? 'var(--accent)' : 'var(--border)',
              boxShadow:   active ? '0 0 0 2px color-mix(in srgb,var(--accent) 20%,transparent)' : 'none' }}
              onClick={() => setBrokerFilter(prev => prev === b.id ? 'all' : b.id)}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'color-mix(in srgb,var(--accent) 60%,var(--border))'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div className="card-body" style={{ padding:'12px 14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:12.5, color:'var(--text-1)' }}>{b.short}</div>
                    <div style={{ fontSize:11, color:'var(--text-3)', marginTop:1 }}>{b.city} · {b.commShare}% share</div>
                  </div>
                  <span style={{ fontSize:10.5, borderRadius:999, padding:'2px 8px', fontWeight:500,
                    background: b.status === 'active' ? 'rgba(34,197,94,.12)' : 'rgba(113,113,122,.12)',
                    color:       b.status === 'active' ? '#15803d' : '#71717a' }}>
                    {b.status}
                  </span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11.5, marginBottom:4 }}>
                  <span style={{ color:'var(--text-3)' }}>Share</span>
                  <span className="tnum" style={{ fontWeight:600 }}>{fmtINR(b.totalShare, { compact:true })}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11.5 }}>
                  <span style={{ color:'var(--text-3)' }}>Balance</span>
                  <span className="tnum" style={{ fontWeight:600, color: b.totalBalance > 0 ? 'var(--negative)' : 'var(--text-3)' }}>
                    {b.totalBalance > 0 ? fmtINR(b.totalBalance, { compact:true }) : '—'}
                  </span>
                </div>
                {b.totalShare > 0 && (
                  <div style={{ marginTop:8 }}>
                    <div style={{ height:3, background:'var(--surface-2)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background:'var(--positive)', borderRadius:2, transition:'width .4s' }} />
                    </div>
                    <div style={{ fontSize:10, color:'var(--text-3)', marginTop:2, textAlign:'right' }}>{pct}% paid</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ledger table */}
      <div className="card">
        <div className="card-header" style={{ gap:8, flexWrap:'wrap' }}>
          <div className="card-title">Ledger Entries</div>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginLeft:8 }}>
            {TABS.map(t => (
              <button key={t.id} className={`btn btn-sm ${tab === t.id ? '' : 'btn-ghost'}`}
                style={tab !== t.id ? { border:'none' } : {}}
                onClick={() => setTab(t.id)}>
                {t.label}
                <span style={{ marginLeft:5, fontSize:11, fontWeight:600, color: tab === t.id ? 'inherit' : 'var(--text-3)' }}>
                  {t.id === 'all' ? allEntries.length : allEntries.filter(e => e.status === t.id).length}
                </span>
              </button>
            ))}
          </div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
            <label style={{ display:'flex', alignItems:'center', gap:7, border:'1px solid var(--border)', borderRadius:6, background:'var(--bg-2)', padding:'0 10px', cursor:'text' }}
              onFocusCapture={e => e.currentTarget.style.borderColor='var(--accent)'}
              onBlurCapture={e => e.currentTarget.style.borderColor='var(--border)'}
            >
              <Icon.Search size={13} style={{ color:'var(--text-3)', flexShrink:0 }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries…"
                style={{ flex:1, border:'none', background:'transparent', padding:'6px 0', outline:'none', fontSize:13, color:'var(--text-1)', fontFamily:'inherit', minWidth:0, width:160 }} />
              {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:'var(--text-3)', padding:2, flexShrink:0 }}><Icon.X size={12}/></button>}
            </label>
            <ViewMenu cols={_SBL_COLS} visible={visibleCols} onChange={setVisibleCols} />
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              {exportMode && <th style={{ width:36, paddingLeft:14 }}><input type="checkbox" checked={allExpSelected} onChange={e => setExportSel(e.target.checked ? filtered.map(r => r.no) : [])} /></th>}
              {vis('no')        && <SortableHeader field="no"        label="Entry No."   ctrl={ctrl} />}
              {vis('date')      && <SortableHeader field="date"      label="Date"        ctrl={ctrl} />}
              {vis('broker')    && <SortableHeader field="broker"    label="Sub-broker"  ctrl={ctrl} />}
              {vis('confNo')    && <SortableHeader field="confNo"    label="Conf No."    ctrl={ctrl} />}
              {vis('ciNo')      && <th>CI No.</th>}
              {vis('totalComm') && <SortableHeader field="totalComm" label="Total Commission" ctrl={ctrl} className="num" align="right" />}
              {vis('shareAmt')  && <SortableHeader field="shareAmt"  label="Share Amt."  ctrl={ctrl} className="num" align="right" />}
              {vis('paid')      && <SortableHeader field="paid"      label="Paid"        ctrl={ctrl} className="num" align="right" />}
              {vis('balance')   && <SortableHeader field="balance"   label="Balance"     ctrl={ctrl} className="num" align="right" />}
              {vis('status')    && <th>Status</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={100} style={{ textAlign:'center', padding:'40px 32px', color:'var(--text-3)', fontSize:13 }}>No ledger entries match.</td></tr>
            )}
            {filtered.map(e => (
              <tr key={e.no}
                onClick={() => exportMode && setExportSel(prev => prev.includes(e.no) ? prev.filter(x => x !== e.no) : [...prev, e.no])}
                style={{ cursor: exportMode ? 'default' : undefined }}>
                {exportMode && (
                  <td onClick={ev => ev.stopPropagation()} style={{ paddingLeft:14 }}>
                    <input type="checkbox" checked={exportSel.includes(e.no)}
                      onChange={() => setExportSel(prev => prev.includes(e.no) ? prev.filter(x => x !== e.no) : [...prev, e.no])} />
                  </td>
                )}
                {vis('no')        && <td className="cell-mono cell-strong">{e.no}</td>}
                {vis('date')      && <td className="muted">{fmtDateShort(e.date)}</td>}
                {vis('broker')    && <td style={{ fontWeight:500 }}>{e.broker}</td>}
                {vis('confNo')    && <td className="cell-mono muted">{e.confNo}</td>}
                {vis('ciNo')      && <td className="cell-mono muted">{e.ciNo || '—'}</td>}
                {vis('totalComm') && <td className="num tnum muted">{fmtINR(e.totalComm, { compact:true })}</td>}
                {vis('shareAmt')  && <td className="num tnum cell-strong">{fmtINR(e.shareAmt, { compact:true })}</td>}
                {vis('paid')      && <td className="num tnum" style={{ color: e.paid > 0 ? 'var(--positive)' : 'var(--text-3)' }}>{e.paid > 0 ? fmtINR(e.paid, { compact:true }) : '—'}</td>}
                {vis('balance')   && <td className="num tnum" style={{ color: e.balance > 0 ? 'var(--negative)' : 'var(--text-3)' }}>{e.balance > 0 ? fmtINR(e.balance, { compact:true }) : '—'}</td>}
                {vis('status')    && <td><SBLPill status={e.status} /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export format modal */}
      {fmtOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
             onClick={() => setFmtOpen(false)}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:24, width:400, maxWidth:'100%', boxShadow:'0 8px 40px rgba(0,0,0,.18)' }}
               onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:700, fontSize:15, color:'var(--text-1)', marginBottom:6 }}>Choose export format</div>
            <div style={{ fontSize:12.5, color:'var(--text-3)', marginBottom:20 }}>Exporting {exportSel.length} row{exportSel.length !== 1 ? 's' : ''}</div>
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

window.SubBrokerLedger = SubBrokerLedger;
