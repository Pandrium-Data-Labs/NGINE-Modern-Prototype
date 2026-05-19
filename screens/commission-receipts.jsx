// Commission Receipts — payments received against commission invoices

const { Field, Input, Select, Badge, Section, DatePicker, fmtNum, fmtINR, ViewMenu } = window.UI;
const { CONFIRMATIONS, COMM_INVOICES, COMM_RECEIPTS, fmtDateShort, fmtDate } = window.NCData;
const { useTableControls, SortableHeader } = window.TableFilters;

const _crcToday = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
})();

const CRCPill = ({ status }) => {
  const cfg = {
    credited: { color:'#15803d', bg:'rgba(34,197,94,.12)',  label:'Credited' },
    cleared:  { color:'#2563eb', bg:'rgba(37,99,235,.1)',   label:'Cleared'  },
    reversed: { color:'#dc2626', bg:'rgba(239,68,68,.12)',  label:'Reversed' },
    pending:  { color:'#a16207', bg:'rgba(234,179,8,.15)',  label:'Pending'  },
  }[status] || { color:'var(--text-3)', bg:'var(--surface-2)', label: status };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, borderRadius:999, padding:'2px 9px', fontSize:11.5, fontWeight:500, background:cfg.bg, color:cfg.color, whiteSpace:'nowrap' }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:cfg.color, flexShrink:0 }} />{cfg.label}
    </span>
  );
};

// ─── New receipt form ────────────────────────────────────────────────────────
const _NewReceipt = ({ onClose, onCmd }) => {
  const [form, setForm] = React.useState({
    no: 'CRC-26-0005', date: _crcToday,
    ciNo: '', party: '', partyName: '', confNo: '',
    amount: '', mode: 'RTGS', ref: '', status: 'credited', notes: '',
  });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target?.value ?? e }));

  const linkedCI   = COMM_INVOICES.find(ci => ci.no === form.ciNo);
  const linkedConf = linkedCI ? CONFIRMATIONS.find(c => c.no === linkedCI.confNo) : null;

  React.useEffect(() => {
    if (linkedCI) {
      setForm(f => ({
        ...f,
        party:     linkedCI.party,
        partyName: linkedCI.partyName,
        confNo:    linkedCI.confNo,
        amount:    String(linkedCI.balance || linkedCI.amount),
      }));
    }
  }, [form.ciNo]);

  const maxAmount = linkedCI ? linkedCI.balance : 0;

  return (
    <div className="content-inner wide">
      <div className="page-header">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <button className="btn btn-sm btn-ghost" onClick={onClose}><Icon.ChevronLeft size={14}/> Back</button>
            <Badge tone="info">New</Badge>
          </div>
          <h1 className="page-title">Record commission receipt</h1>
          <div className="page-sub">Record a payment received against a commission invoice.</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={onClose}><Icon.X size={14}/> Cancel</button>
          <button className="btn" onClick={() => { onCmd({ action:'saved:draft' }); onClose(); }}><Icon.Save size={14}/> Save draft</button>
          <button className="btn btn-primary" onClick={() => { onCmd({ action:'saved' }); onClose(); }}><Icon.Check size={14}/> Save receipt</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 260px', gap:20, alignItems:'start' }}>
        <div className="card">
          <div className="card-body" style={{ padding:'6px 20px 16px' }}>

            <Section title="Document">
              <div className="form-grid">
                <Field label="Receipt No.">
                  <Input value={form.no} readOnly style={{ color:'var(--text-3)', background:'var(--surface-2)' }} />
                </Field>
                <Field label="Date" required>
                  <DatePicker value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />
                </Field>
              </div>
            </Section>

            <Section title="Commission invoice">
              <div className="form-grid">
                <Field label="Commission invoice no." required span={2}>
                  <Select value={form.ciNo} onChange={set('ciNo')}>
                    <option value="">Select commission invoice…</option>
                    {COMM_INVOICES.filter(ci => ci.status !== 'paid').map(ci => (
                      <option key={ci.no} value={ci.no}>
                        {ci.no} · {ci.partyName} · Balance {fmtINR(ci.balance, { compact:true })}
                      </option>
                    ))}
                    <optgroup label="─── Paid (for reference) ───">
                      {COMM_INVOICES.filter(ci => ci.status === 'paid').map(ci => (
                        <option key={ci.no} value={ci.no}>{ci.no} · {ci.partyName}</option>
                      ))}
                    </optgroup>
                  </Select>
                </Field>
                <Field label="Billed to">
                  <Input value={form.partyName || '—'} readOnly style={{ color:'var(--text-3)', background:'var(--surface-2)' }} />
                </Field>
                <Field label="Party type">
                  <Input value={form.party ? (form.party.charAt(0).toUpperCase() + form.party.slice(1)) : '—'} readOnly style={{ color:'var(--text-3)', background:'var(--surface-2)', textTransform:'capitalize' }} />
                </Field>
              </div>
            </Section>

            <Section title="Payment">
              <div className="form-grid">
                <Field label="Amount received (₹)" required hint={maxAmount > 0 ? `Outstanding: ₹${fmtNum(maxAmount)}` : undefined}>
                  <div className="input-group">
                    <span className="input-prefix">₹</span>
                    <Input type="number" value={form.amount} onChange={set('amount')} className="input tnum" placeholder="0" />
                  </div>
                </Field>
                <Field label="Payment mode" required>
                  <Select value={form.mode} onChange={set('mode')}>
                    <option value="RTGS">RTGS</option>
                    <option value="NEFT">NEFT</option>
                    <option value="IMPS">IMPS</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                  </Select>
                </Field>
                <Field label="Reference / UTR no." optional span={2}>
                  <Input value={form.ref} onChange={set('ref')} placeholder="UTR / cheque / transaction no." />
                </Field>
                <Field label="Status">
                  <Select value={form.status} onChange={set('status')}>
                    <option value="credited">Credited</option>
                    <option value="cleared">Cleared</option>
                    <option value="pending">Pending</option>
                    <option value="reversed">Reversed</option>
                  </Select>
                </Field>
              </div>
            </Section>

            <Section title="Notes">
              <div className="form-grid">
                <Field label="Internal notes" optional span={2}>
                  <textarea className="input textarea" rows="3" placeholder="Remarks, deductions, payment reference…" value={form.notes} onChange={set('notes')} />
                </Field>
              </div>
            </Section>
          </div>
          <div className="card-footer">
            <div className="row-flex">
              <button className="btn btn-primary btn-sm" onClick={() => { onCmd({ action:'saved' }); onClose(); }}>Save receipt <span className="kbd-hint">⌘↵</span></button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position:'sticky', top:16, display:'flex', flexDirection:'column', gap:12 }}>
          {linkedCI ? (
            <>
              <div className="card">
                <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
                  <div className="card-title" style={{ fontSize:12 }}>Commission invoice</div>
                  <span className="cell-mono muted" style={{ fontSize:11 }}>{linkedCI.no}</span>
                </div>
                <div className="card-body" style={{ padding:'8px 16px 14px', display:'flex', flexDirection:'column', gap:8, fontSize:12.5 }}>
                  {[
                    ['Party',    linkedCI.partyName],
                    ['Type',     linkedCI.party.charAt(0).toUpperCase() + linkedCI.party.slice(1)],
                    ['Candies',  parseFloat(linkedCI.candies).toFixed(2)],
                    ['Rate',     `₹${linkedCI.rate}/candy`],
                    ['Invoice',  fmtINR(linkedCI.amount, { compact:true })],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'var(--text-3)' }}>{k}</span>
                      <span style={{ fontWeight:500, textAlign:'right', maxWidth:150 }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--border)', paddingTop:8 }}>
                    <span style={{ color:'var(--text-3)' }}>Balance due</span>
                    <span className="tnum" style={{ fontWeight:700, color: linkedCI.balance > 0 ? 'var(--negative)' : 'var(--positive)' }}>
                      {linkedCI.balance > 0 ? fmtINR(linkedCI.balance, { compact:true }) : 'Cleared'}
                    </span>
                  </div>
                </div>
              </div>
              {linkedConf && (
                <div className="card">
                  <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
                    <div className="card-title" style={{ fontSize:12 }}>Linked confirmation</div>
                    <span className="cell-mono muted" style={{ fontSize:11 }}>{linkedConf.no}</span>
                  </div>
                  <div className="card-body" style={{ padding:'8px 16px 14px', display:'flex', flexDirection:'column', gap:8, fontSize:12.5 }}>
                    {[['Buyer', linkedConf.buyer], ['Seller', linkedConf.seller], ['Station', linkedConf.station]].map(([k, v]) => (
                      <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ color:'var(--text-3)' }}>{k}</span>
                        <span style={{ fontWeight:500, textAlign:'right', maxWidth:150 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card">
              <div className="card-body" style={{ padding:'24px 16px', textAlign:'center', color:'var(--text-3)' }}>
                <Icon.Receipt size={20} />
                <div style={{ marginTop:8, fontSize:12.5, fontWeight:500, color:'var(--text-2)' }}>Select a commission invoice</div>
                <div style={{ marginTop:4, fontSize:12 }}>Invoice details will appear here.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Column definitions ──────────────────────────────────────────────────────
const _CRC_COLS = [
  { field:'no',        label:'Receipt No.',  defaultOn:true  },
  { field:'date',      label:'Date',         defaultOn:true  },
  { field:'ciNo',      label:'CI No.',       defaultOn:true  },
  { field:'confNo',    label:'Conf No.',     defaultOn:false },
  { field:'party',     label:'Party',        defaultOn:true  },
  { field:'amount',    label:'Amount',       defaultOn:true  },
  { field:'mode',      label:'Mode',         defaultOn:true  },
  { field:'ref',       label:'Reference',    defaultOn:false },
  { field:'status',    label:'Status',       defaultOn:true  },
];

const _CRC_SORT_COLS = [
  { field:'no',     label:'Receipt No.',  type:'text'   },
  { field:'date',   label:'Date',         type:'date'   },
  { field:'ciNo',   label:'CI No.',       type:'text'   },
  { field:'party',  label:'Party',        type:'text'   },
  { field:'amount', label:'Amount',       type:'number' },
  { field:'mode',   label:'Mode',         type:'text'   },
  { field:'status', label:'Status',       type:'select', options:['credited','cleared','pending','reversed'] },
];

// ─── Main dashboard ──────────────────────────────────────────────────────────
const CommissionReceipts = ({ onCmd }) => {
  const [view,        setView]        = React.useState('list');
  const [tab,         setTab]         = React.useState('all');
  const [search,      setSearch]      = React.useState('');
  const [exportMode,  setExportMode]  = React.useState(false);
  const [exportSel,   setExportSel]   = React.useState([]);
  const [fmtOpen,     setFmtOpen]     = React.useState(false);
  const [visibleCols, setVisibleCols] = React.useState(
    () => new Set(_CRC_COLS.filter(c => c.defaultOn).map(c => c.field))
  );
  const vis  = f => visibleCols.has(f);
  const ctrl = useTableControls(_CRC_SORT_COLS);

  if (view === 'new') return <_NewReceipt onClose={() => setView('list')} onCmd={onCmd} />;

  const allReceipts = COMM_RECEIPTS;

  // KPIs
  const totalReceived  = allReceipts.reduce((s, r) => s + (r.amount || 0), 0);
  const totalOutstanding = COMM_INVOICES.reduce((s, ci) => s + (ci.balance || 0), 0);
  const totalInvoiced  = COMM_INVOICES.reduce((s, ci) => s + (ci.amount  || 0), 0);
  const collRate = totalInvoiced > 0 ? Math.round((totalReceived / totalInvoiced) * 100) : 0;

  const TABS = [
    { id:'all',      label:'All'      },
    { id:'credited', label:'Credited' },
    { id:'cleared',  label:'Cleared'  },
    { id:'pending',  label:'Pending'  },
    { id:'reversed', label:'Reversed' },
  ];

  const filtered = React.useMemo(() => {
    let rows = allReceipts;
    if (tab !== 'all') rows = rows.filter(r => r.status === tab);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        r.no.toLowerCase().includes(q)              ||
        r.ciNo.toLowerCase().includes(q)            ||
        r.partyName.toLowerCase().includes(q)       ||
        (r.ref    || '').toLowerCase().includes(q)  ||
        (r.confNo || '').toLowerCase().includes(q)
      );
    }
    return ctrl.sortData(rows);
  }, [allReceipts, tab, search, ctrl.sortKey, ctrl.sortDir]);

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
      { h:'Receipt No.', v: r => r.no           },
      { h:'Date',        v: r => fmtDateShort(r.date) },
      { h:'CI No.',      v: r => r.ciNo          },
      { h:'Conf No.',    v: r => r.confNo || '—' },
      { h:'Party',       v: r => r.partyName     },
      { h:'Type',        v: r => r.party         },
      { h:'Amount',      v: r => r.amount        },
      { h:'Mode',        v: r => r.mode          },
      { h:'Reference',   v: r => r.ref || '—'   },
      { h:'Status',      v: r => r.status        },
    ];
    const rows = filtered.filter(r => exportSel.includes(r.no));
    const esc  = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    if (fmt === 'csv') {
      _dl([cols.map(c => esc(c.h)).join(','), ...rows.map(r => cols.map(c => esc(c.v(r))).join(','))].join('\r\n'), 'commission-receipts.csv', 'text/csv');
    } else if (fmt === 'excel') {
      const th = `<tr>${cols.map(c => `<th>${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(r => `<tr>${cols.map(c => `<td>${c.v(r)}</td>`).join('')}</tr>`).join('');
      _dl(`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/></head><body><table>${th}${tb}</table></body></html>`, 'commission-receipts.xls', 'application/vnd.ms-excel');
    } else if (fmt === 'pdf') {
      const th = `<tr>${cols.map(c => `<th style="padding:8px;border:1px solid #ddd;background:#f5f5f5;text-align:left">${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(r => `<tr>${cols.map(c => `<td style="padding:8px;border:1px solid #ddd">${c.v(r)}</td>`).join('')}</tr>`).join('');
      const w = window.open('', '_blank');
      w.document.write(`<!DOCTYPE html><html><head><title>Commission Receipts</title><style>body{font-family:sans-serif;padding:24px}table{border-collapse:collapse;width:100%}@media print{button{display:none}}</style></head><body><h2>Commission Receipts</h2><table>${th}${tb}</table><script>setTimeout(()=>window.print(),400)<\/script></body></html>`);
      w.document.close();
    } else if (fmt === 'word') {
      const th = `<tr>${cols.map(c => `<th>${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(r => `<tr>${cols.map(c => `<td>${c.v(r)}</td>`).join('')}</tr>`).join('');
      _dl(`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"/></head><body><h2>Commission Receipts</h2><table border="1">${th}${tb}</table></body></html>`, 'commission-receipts.doc', 'application/msword');
    }
    setFmtOpen(false); setExportMode(false); setExportSel([]);
  };

  // CI-level collection summary
  const ciSummary = COMM_INVOICES.map(ci => {
    const receipts = allReceipts.filter(r => r.ciNo === ci.no);
    const received = receipts.reduce((s, r) => s + (r.amount || 0), 0);
    return { ...ci, received, receiptCount: receipts.length };
  });

  return (
    <div className="content-inner wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">Commission Receipts</h1>
          <div className="page-sub">Payments received against commission invoices · {allReceipts.length} receipts</div>
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
              <button className="btn btn-primary" onClick={() => setView('new')}><Icon.Plus size={14}/> Record receipt</button>
            </>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Total invoiced',   value: fmtINR(totalInvoiced,   { compact:true }), color:'var(--text-1)'   },
          { label:'Amount received',  value: fmtINR(totalReceived,   { compact:true }), color:'var(--positive)' },
          { label:'Outstanding',      value: fmtINR(totalOutstanding,{ compact:true }), color: totalOutstanding > 0 ? 'var(--negative)' : 'var(--text-3)' },
          { label:'Collection rate',  value: `${collRate}%`,                             color: collRate >= 80 ? 'var(--positive)' : collRate >= 50 ? 'var(--warn,#a16207)' : 'var(--negative)' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="card-body" style={{ padding:'12px 16px' }}>
              <div className="muted" style={{ fontSize:11, marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:20, fontWeight:700, letterSpacing:'-.01em', color:s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 280px', gap:16, alignItems:'start' }}>

        {/* Receipts table */}
        <div className="card">
          <div className="card-header" style={{ gap:8, flexWrap:'wrap' }}>
            <div className="card-title">Receipts</div>
            <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginLeft:8 }}>
              {TABS.map(t => {
                const count = t.id === 'all' ? allReceipts.length : allReceipts.filter(r => r.status === t.id).length;
                if (count === 0 && t.id !== 'all') return null;
                return (
                  <button key={t.id} className={`btn btn-sm ${tab === t.id ? '' : 'btn-ghost'}`}
                    style={tab !== t.id ? { border:'none' } : {}}
                    onClick={() => setTab(t.id)}>
                    {t.label}
                    <span style={{ marginLeft:5, fontSize:11, fontWeight:600, color: tab === t.id ? 'inherit' : 'var(--text-3)' }}>{count}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
              <label style={{ display:'flex', alignItems:'center', gap:7, border:'1px solid var(--border)', borderRadius:6, background:'var(--bg-2)', padding:'0 10px', cursor:'text' }}
                onFocusCapture={e => e.currentTarget.style.borderColor='var(--accent)'}
                onBlurCapture={e => e.currentTarget.style.borderColor='var(--border)'}
              >
                <Icon.Search size={13} style={{ color:'var(--text-3)', flexShrink:0 }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search receipts…"
                  style={{ flex:1, border:'none', background:'transparent', padding:'6px 0', outline:'none', fontSize:13, color:'var(--text-1)', fontFamily:'inherit', minWidth:0, width:160 }} />
                {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:'var(--text-3)', padding:2, flexShrink:0 }}><Icon.X size={12}/></button>}
              </label>
              <ViewMenu cols={_CRC_COLS} visible={visibleCols} onChange={setVisibleCols} />
            </div>
          </div>

          <table className="tbl">
            <thead>
              <tr>
                {exportMode && <th style={{ width:36, paddingLeft:14 }}><input type="checkbox" checked={allExpSelected} onChange={e => setExportSel(e.target.checked ? filtered.map(r => r.no) : [])} /></th>}
                {vis('no')     && <SortableHeader field="no"     label="Receipt No." ctrl={ctrl} />}
                {vis('date')   && <SortableHeader field="date"   label="Date"        ctrl={ctrl} />}
                {vis('ciNo')   && <SortableHeader field="ciNo"   label="CI No."      ctrl={ctrl} />}
                {vis('confNo') && <th>Conf No.</th>}
                {vis('party')  && <SortableHeader field="party"  label="Party"       ctrl={ctrl} />}
                {vis('amount') && <SortableHeader field="amount" label="Amount"      ctrl={ctrl} className="num" align="right" />}
                {vis('mode')   && <th>Mode</th>}
                {vis('ref')    && <th>Reference</th>}
                {vis('status') && <th>Status</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={100} style={{ textAlign:'center', padding:'40px 32px', color:'var(--text-3)', fontSize:13 }}>No receipts match.</td></tr>
              )}
              {filtered.map(r => (
                <tr key={r.no}
                  onClick={() => exportMode && setExportSel(prev => prev.includes(r.no) ? prev.filter(x => x !== r.no) : [...prev, r.no])}
                  style={{ cursor: exportMode ? 'default' : undefined }}>
                  {exportMode && (
                    <td onClick={ev => ev.stopPropagation()} style={{ paddingLeft:14 }}>
                      <input type="checkbox" checked={exportSel.includes(r.no)}
                        onChange={() => setExportSel(prev => prev.includes(r.no) ? prev.filter(x => x !== r.no) : [...prev, r.no])} />
                    </td>
                  )}
                  {vis('no')     && <td className="cell-mono cell-strong">{r.no}</td>}
                  {vis('date')   && <td className="muted">{fmtDateShort(r.date)}</td>}
                  {vis('ciNo')   && <td className="cell-mono muted">{r.ciNo}</td>}
                  {vis('confNo') && <td className="cell-mono muted">{r.confNo || '—'}</td>}
                  {vis('party')  && (
                    <td>
                      <div style={{ fontWeight:500 }}>{r.partyName}</div>
                      <div style={{ fontSize:11, color:'var(--text-3)', textTransform:'capitalize', marginTop:1 }}>{r.party}</div>
                    </td>
                  )}
                  {vis('amount') && <td className="num tnum cell-strong">{fmtINR(r.amount, { compact:true })}</td>}
                  {vis('mode')   && <td><span style={{ fontSize:12, background:'var(--surface-2)', borderRadius:4, padding:'2px 7px', fontWeight:500, color:'var(--text-2)' }}>{r.mode}</span></td>}
                  {vis('ref')    && <td className="cell-mono muted" style={{ fontSize:12 }}>{r.ref || '—'}</td>}
                  {vis('status') && <td><CRCPill status={r.status} /></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CI collection sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div className="card">
            <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
              <div className="card-title" style={{ fontSize:12 }}>Collection by invoice</div>
            </div>
            <div className="card-body" style={{ padding:'8px 12px 12px', display:'flex', flexDirection:'column', gap:6 }}>
              {ciSummary.map(ci => {
                const pct = ci.amount > 0 ? Math.round(ci.received / ci.amount * 100) : 0;
                return (
                  <div key={ci.no} style={{ padding:'8px 10px', borderRadius:8, background:'var(--surface-2)', border:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                      <span className="cell-mono" style={{ fontSize:12, fontWeight:600, color:'var(--text-1)' }}>{ci.no}</span>
                      <CRCPill status={ci.status === 'paid' ? 'cleared' : ci.balance > 0 ? (ci.received > 0 ? 'credited' : 'pending') : 'cleared'} />
                    </div>
                    <div style={{ fontSize:11.5, color:'var(--text-3)', marginBottom:6 }}>
                      {ci.partyName}
                      <span style={{ textTransform:'capitalize', marginLeft:5, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:4, padding:'1px 5px', fontSize:10.5 }}>{ci.party}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:5 }}>
                      <span style={{ color:'var(--text-3)' }}>Received / Invoiced</span>
                      <span className="tnum" style={{ fontWeight:600 }}>{fmtINR(ci.received, { compact:true })} / {fmtINR(ci.amount, { compact:true })}</span>
                    </div>
                    <div style={{ height:3, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background: pct >= 100 ? 'var(--positive)' : pct >= 50 ? '#f59e0b' : 'var(--negative)', borderRadius:2, transition:'width .4s' }} />
                    </div>
                    <div style={{ fontSize:10, color:'var(--text-3)', marginTop:2, textAlign:'right' }}>{pct}% collected</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
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

window.CommissionReceipts = CommissionReceipts;
