// CR / DR Notes screen — post-invoice adjustments

const { Field, Input, Select, Badge, Section, DatePicker, fmtINR, fmtNum, ViewMenu } = window.UI;
const { CONFIRMATIONS, INVOICES, CR_DR_NOTES, fmtDate, fmtDateShort } = window.NCData;

const REASON_LABELS = {
  'bale-return':      'Bale Return',
  'price-correction': 'Price Correction',
  'mill-weight':      'Mill Weight Variance',
  'duplicate-inv':    'Duplicate Invoice',
  'other':            'Other',
};

const REASON_COLORS = {
  'bale-return':      '#f59e0b',
  'price-correction': '#3b82f6',
  'mill-weight':      '#8b5cf6',
  'duplicate-inv':    '#ef4444',
  'other':            '#6b7280',
};

const _typeBadge = (type) => (
  <span style={{
    display:'inline-flex', alignItems:'center', padding:'2px 9px', borderRadius:999,
    fontSize:11, fontWeight:700, letterSpacing:'.05em',
    background: type === 'credit' ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.10)',
    color:       type === 'credit' ? '#15803d'             : '#dc2626',
  }}>
    {type === 'credit' ? 'CR' : 'DR'}
  </span>
);

const _statusTone = (s) => s === 'settled' ? 'success' : s === 'issued' ? 'info' : 'default';

const _KpiCard = ({ label, value, sub, subTone, accent }) => (
  <div className="card" style={{ padding:0 }}>
    <div className="card-body" style={{ padding:'16px 18px 14px', display:'flex', flexDirection:'column', gap:4 }}>
      <div style={{ fontSize:11, color:'var(--text-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em' }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:700, letterSpacing:'-.02em', color:accent||'var(--text-1)', lineHeight:1.1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:subTone==='danger'?'var(--negative)':subTone==='positive'?'var(--positive)':subTone==='warn'?'var(--warn)':'var(--text-3)' }}>{sub}</div>}
    </div>
  </div>
);

// ── new note form ─────────────────────────────────────────────────────────────

const _NoteForm = ({ onClose, onSave, prefill, filterConfNo }) => {
  const todayStr = new Date().toISOString().slice(0,10);
  const [type,       setType]       = React.useState(prefill?.type        || 'credit');
  const [invoiceNo,  setInvoiceNo]  = React.useState(prefill?.invoice     || '');
  const [reason,     setReason]     = React.useState(prefill?.reason      || 'mill-weight');
  const [description,setDescription]= React.useState(prefill?.description || '');
  const [amount,     setAmount]     = React.useState(prefill?.amount      ? String(prefill.amount) : '');
  const [date,       setDate]       = React.useState(prefill?.date        ? (prefill.date instanceof Date ? prefill.date.toISOString().slice(0,10) : prefill.date) : todayStr);
  const [approvedBy, setApprovedBy] = React.useState(prefill?.approvedBy  || '');

  const invoiceList = filterConfNo ? INVOICES.filter(i => i.conf === filterConfNo) : INVOICES;
  const selInvoice  = INVOICES.find(i => i.no === invoiceNo);
  const selConf     = selInvoice ? CONFIRMATIONS.find(c => c.no === selInvoice.conf) : null;
  const buyerName   = selInvoice?.buyer || '';
  const confNo      = selInvoice?.conf  || '';

  const noteAmt     = parseFloat(amount) || 0;
  const invAmt      = selInvoice?.amount || 0;
  const revisedNet  = type === 'credit' ? invAmt - noteAmt : invAmt + noteAmt;

  const nextNo  = `CD-26-${String(parseInt((CR_DR_NOTES[0]?.no?.split('-')[2] || '0034')) + 1).padStart(4,'0')}`;
  const canSave = invoiceNo && description.trim() && noteAmt > 0;

  const handleSave = () => {
    onSave({
      no: nextNo, date: new Date(date), type, reason,
      invoice: invoiceNo, conf: confNo, buyer: buyerName,
      description: description.trim(), amount: noteAmt,
      approvedBy: approvedBy.trim(), status: 'draft',
    });
  };

  const crColor = '#15803d'; const drColor = '#dc2626';
  const noteColor = type === 'credit' ? crColor : drColor;
  const noteBg    = type === 'credit' ? 'rgba(34,197,94,.06)' : 'rgba(239,68,68,.06)';
  const noteBorder= type === 'credit' ? '#16a34a' : '#dc2626';

  return (
    <div className="content-inner">
      <div className="page-header">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <button className="btn btn-sm btn-ghost" onClick={onClose}><Icon.ChevronLeft size={14} /> Back</button>
            <Badge tone="info">Draft</Badge>
          </div>
          <h1 className="page-title">New CR / DR Note</h1>
          <div className="page-sub">Record a post-invoice adjustment against an issued invoice.</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={onClose}><Icon.X size={14} /> Discard</button>
          <button className="btn" disabled={!canSave} onClick={handleSave}><Icon.Save size={14} /> Save draft</button>
          <button className="btn btn-primary" disabled={!canSave} onClick={handleSave}><Icon.Check size={14} /> Issue note</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 300px', gap:16 }}>
        <div className="card">
          <div className="card-body" style={{ padding:'8px 24px 20px' }}>

            {/* Note type toggle */}
            <Section title="Note type" desc="Credit notes reduce the buyer's outstanding. Debit notes increase it.">
              <div style={{ display:'flex', gap:10 }}>
                {['credit', 'debit'].map(t => (
                  <button key={t} onClick={() => setType(t)} style={{
                    flex:1, padding:'12px 0', borderRadius:10, cursor:'pointer', fontWeight:600, fontSize:14,
                    border:'2px solid', fontFamily:'inherit', transition:'all .12s',
                    background:   type === t ? (t==='credit'?'rgba(34,197,94,.10)':'rgba(239,68,68,.08)') : 'var(--surface-2)',
                    borderColor:  type === t ? (t==='credit'?'#16a34a':'#dc2626') : 'var(--border)',
                    color:        type === t ? (t==='credit'?crColor:drColor) : 'var(--text-2)',
                  }}>
                    {t === 'credit' ? 'Credit Note (CR)' : 'Debit Note (DR)'}
                  </button>
                ))}
              </div>
            </Section>

            {/* Invoice link (primary) */}
            <Section title="Invoice" desc="Select the invoice this note adjusts. Contract and buyer are auto-filled.">
              <div className="form-grid">
                <Field label="Invoice no." required span={2}>
                  <Select value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)}>
                    <option value="">Select invoice…</option>
                    {invoiceList.map(i => (
                      <option key={i.no} value={i.no}>
                        {i.no} · {i.buyer} · {fmtINR(i.amount, { compact:true })} · {i.status}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Linked contract">
                  <Input value={confNo} readOnly disabled placeholder="Auto-filled from invoice" />
                </Field>

                <Field label="Buyer">
                  <Input value={buyerName} readOnly disabled placeholder="Auto-filled from invoice" />
                </Field>
              </div>
            </Section>

            {/* Details */}
            <Section title="Adjustment details" desc="Specify reason, amount, and description of the adjustment.">
              <div className="form-grid">
                <Field label="Reason" required>
                  <Select value={reason} onChange={e => setReason(e.target.value)}>
                    {Object.entries(REASON_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </Select>
                </Field>

                <Field label="Note amount (₹)" required>
                  <div className="input-group">
                    <span className="input-prefix">₹</span>
                    <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input tnum" placeholder="0" min="0" />
                  </div>
                </Field>

                <Field label="Description" required span={2}>
                  <textarea className="input textarea" rows="3"
                    placeholder="Describe the reason and basis for this adjustment…"
                    value={description} onChange={e => setDescription(e.target.value)} />
                </Field>

                <Field label="Date" required>
                  <DatePicker value={date} onChange={setDate} />
                </Field>

                <Field label="Approved by">
                  <Input value={approvedBy} onChange={e => setApprovedBy(e.target.value)} placeholder="Approver name" />
                </Field>
              </div>
            </Section>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {selInvoice ? (
            <div className="card">
              <div className="card-header"><div className="card-title">Invoice details</div></div>
              <div className="card-body" style={{ padding:'4px 16px 16px', display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  ['Invoice no.', selInvoice.no],
                  ['Date',        fmtDateShort(selInvoice.date)],
                  ['Buyer',       selInvoice.buyer],
                  ['Seller',      selInvoice.seller],
                  ['Contract',    selInvoice.conf],
                ].map(([k, v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', gap:8, fontSize:12.5 }}>
                    <span style={{ color:'var(--text-3)', fontWeight:500 }}>{k}</span>
                    <span style={{ color:'var(--text-1)', fontWeight:500, textAlign:'right' }}>{v}</span>
                  </div>
                ))}
                <div style={{ borderTop:'1px solid var(--border)', paddingTop:8, display:'flex', justifyContent:'space-between', fontSize:12.5 }}>
                  <span style={{ color:'var(--text-3)', fontWeight:500 }}>Invoice amount</span>
                  <span style={{ fontWeight:700, fontSize:13 }}>{fmtINR(selInvoice.amount, { compact:true })}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12.5 }}>
                  <span style={{ color:'var(--text-3)', fontWeight:500 }}>Payment status</span>
                  <Badge tone={selInvoice.status==='paid'?'success':selInvoice.status==='partial'?'warn':'danger'}>{selInvoice.status}</Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body" style={{ padding:'24px 16px', textAlign:'center' }}>
                <Icon.Receipt size={20} style={{ color:'var(--text-3)', display:'block', margin:'0 auto 8px' }} />
                <div style={{ fontSize:12.5, color:'var(--text-3)' }}>Select an invoice to see details and adjustment preview.</div>
              </div>
            </div>
          )}

          {selInvoice && noteAmt > 0 && (
            <div className="card" style={{ border:`2px solid ${noteBorder}`, background:noteBg }}>
              <div className="card-body" style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:noteColor }}>
                  Adjustment preview
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:12.5 }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--text-3)' }}>Original invoice</span>
                    <span style={{ fontWeight:600 }}>{fmtINR(invAmt, { compact:true })}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--text-3)' }}>{type === 'credit' ? 'Credit note (−)' : 'Debit note (+)'}</span>
                    <span style={{ fontWeight:700, color:noteColor }}>{type==='credit'?'−':'+'}{ fmtINR(noteAmt, { compact:true })}</span>
                  </div>
                  <div style={{ borderTop:`1px solid ${noteBorder}40`, paddingTop:8, display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontWeight:600, color:'var(--text-1)' }}>Revised net payable</span>
                    <span style={{ fontSize:15, fontWeight:700, color: revisedNet < 0 ? 'var(--negative)' : 'var(--text-1)' }}>
                      {fmtINR(Math.abs(revisedNet), { compact:true })}
                      {revisedNet < 0 && <span style={{ fontSize:11, fontWeight:600, marginLeft:4, color:'var(--negative)' }}>OVERPAID</span>}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── column definitions ────────────────────────────────────────────────────────

const _CRDR_COLS = [
  { field:'no',          label:'Note No',      defaultOn:true  },
  { field:'type',        label:'Type',         defaultOn:true  },
  { field:'date',        label:'Date',         defaultOn:true  },
  { field:'reason',      label:'Reason',       defaultOn:true  },
  { field:'invoice',     label:'Invoice',      defaultOn:true  },
  { field:'conf',        label:'Contract',     defaultOn:true  },
  { field:'buyer',       label:'Buyer',        defaultOn:true  },
  { field:'description', label:'Description',  defaultOn:false },
  { field:'amount',      label:'Amount',       defaultOn:true  },
  { field:'approvedBy',  label:'Approved by',  defaultOn:false },
  { field:'status',      label:'Status',       defaultOn:true  },
];

// ── main list ──────────────────────────────────────────────────────────────────

const CrDrNotes = ({ onCmd, initialConfNo, initialType }) => {
  const [view,         setView]        = React.useState(() => initialConfNo ? 'new' : 'list');
  const [formPrefill,  setFormPrefill] = React.useState(() => initialType ? { type: initialType } : null);
  const [formConfNo,   setFormConfNo]  = React.useState(initialConfNo || null);
  const [extraNotes,   setExtraNotes]  = React.useState([]);
  const [search,       setSearch]      = React.useState('');
  const [visibleCols,  setVisibleCols] = React.useState(
    () => new Set(_CRDR_COLS.filter(c => c.defaultOn).map(c => c.field))
  );
  const vis = (f) => visibleCols.has(f);

  if (view === 'new') {
    return (
      <_NoteForm
        prefill={formPrefill}
        filterConfNo={formConfNo}
        onClose={() => { setView('list'); setFormPrefill(null); setFormConfNo(null); }}
        onSave={(note) => { setExtraNotes(prev => [note, ...prev]); setView('list'); setFormPrefill(null); setFormConfNo(null); }}
      />
    );
  }

  const allNotes = [...extraNotes, ...CR_DR_NOTES];
  const filtered = allNotes.filter(n => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      n.no.toLowerCase().includes(q)                         ||
      (n.invoice     || '').toLowerCase().includes(q)        ||
      (n.conf        || '').toLowerCase().includes(q)        ||
      n.buyer.toLowerCase().includes(q)                      ||
      (REASON_LABELS[n.reason] || '').toLowerCase().includes(q) ||
      (n.description || '').toLowerCase().includes(q)
    );
  });

  // KPIs
  const totalCR   = allNotes.filter(n => n.type === 'credit').reduce((s, n) => s + n.amount, 0);
  const totalDR   = allNotes.filter(n => n.type === 'debit').reduce((s, n) => s + n.amount, 0);
  const netImpact = totalDR - totalCR;
  const pending   = allNotes.filter(n => n.status !== 'settled').length;

  return (
    <div className="content-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">CR / DR Notes</h1>
          <div className="page-sub">Post-invoice adjustments · {allNotes.length} notes · {pending} pending settlement</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => onCmd('nav:payment')}><Icon.Wallet size={14} /> Record Payment</button>
          <button className="btn btn-primary" onClick={() => { setFormPrefill(null); setFormConfNo(null); setView('new'); }}><Icon.Plus size={14} /> New CR / DR Note</button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:16 }}>
        <_KpiCard label="Total Credit Notes (CR)" value={fmtINR(totalCR, { compact:true })}
          sub={`${allNotes.filter(n=>n.type==='credit').length} notes`} subTone="positive" accent="var(--positive)" />
        <_KpiCard label="Total Debit Notes (DR)" value={fmtINR(totalDR, { compact:true })}
          sub={`${allNotes.filter(n=>n.type==='debit').length} notes`} subTone="danger" accent="var(--negative)" />
        <_KpiCard label="Net impact"
          value={(netImpact >= 0 ? '+' : '−') + fmtINR(Math.abs(netImpact), { compact:true })}
          sub={netImpact >= 0 ? 'Net debit position' : 'Net credit position'}
          accent={netImpact >= 0 ? 'var(--negative)' : 'var(--positive)'} />
        <_KpiCard label="Pending settlement" value={pending}
          sub={`${allNotes.filter(n=>n.status==='draft').length} drafts, ${allNotes.filter(n=>n.status==='issued').length} issued`}
          subTone={pending > 0 ? 'warn' : 'positive'} />
      </div>

      {/* Search */}
      {/* Table */}
      <div className="card" style={{ padding:0 }}>
        <div className="card-header">
          <div className="card-title">CR / DR Notes</div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
            <label
              style={{ display:'flex', alignItems:'center', gap:6, border:'1px solid var(--border)', borderRadius:6, background:'var(--bg-2)', padding:'0 8px', cursor:'text', transition:'border-color .12s', width:200 }}
              onFocusCapture={e => e.currentTarget.style.borderColor='var(--accent)'}
              onBlurCapture={e => e.currentTarget.style.borderColor='var(--border)'}
            >
              <Icon.Search size={12} style={{ color:'var(--text-3)', flexShrink:0 }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes…"
                style={{ flex:1, border:'none', background:'transparent', padding:'5px 0', outline:'none', fontSize:12.5, color:'var(--text-1)', fontFamily:'inherit', minWidth:0 }} />
              {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:'var(--text-3)', padding:2, flexShrink:0 }}><Icon.X size={11} /></button>}
            </label>
            <ViewMenu cols={_CRDR_COLS} visible={visibleCols} onChange={setVisibleCols} />
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              {vis('no')          && <th>Note No</th>}
              {vis('type')        && <th style={{ width:40 }}>Type</th>}
              {vis('date')        && <th>Date</th>}
              {vis('reason')      && <th>Reason</th>}
              {vis('invoice')     && <th>Invoice</th>}
              {vis('conf')        && <th>Contract</th>}
              {vis('buyer')       && <th>Buyer</th>}
              {vis('description') && <th>Description</th>}
              {vis('amount')      && <th className="num">Amount</th>}
              {vis('approvedBy')  && <th>Approved by</th>}
              {vis('status')      && <th>Status</th>}
              <th style={{ width:36 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={12} style={{ textAlign:'center', color:'var(--text-3)', padding:'28px 0', fontSize:13 }}>
                No notes found{search ? ` for "${search}"` : ''}.
              </td></tr>
            ) : filtered.map(n => {
              const invRecord = INVOICES.find(i => i.no === n.invoice);
              return (
                <tr key={n.no}>
                  {vis('no')          && <td className="cell-mono cell-strong">{n.no}</td>}
                  {vis('type')        && <td>{_typeBadge(n.type)}</td>}
                  {vis('date')        && <td className="muted">{fmtDateShort(n.date)}</td>}
                  {vis('reason')      && <td style={{ fontSize:12.5 }}>{REASON_LABELS[n.reason] || n.reason}</td>}
                  {vis('invoice')     && <td>
                    {n.invoice
                      ? <span className="cell-mono" style={{ fontSize:12, color:'var(--accent)', fontWeight:600 }}>{n.invoice}</span>
                      : <span style={{ color:'var(--text-3)' }}>—</span>}
                  </td>}
                  {vis('conf')        && <td><span className="cell-mono" style={{ fontSize:11.5, color:'var(--text-2)' }}>{n.conf||'—'}</span></td>}
                  {vis('buyer')       && <td style={{ fontSize:12.5 }}>{n.buyer}</td>}
                  {vis('description') && <td style={{ fontSize:12, color:'var(--text-2)', maxWidth:200 }}><span style={{ display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.description||'—'}</span></td>}
                  {vis('amount')      && (
                    <td className="num">
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:1 }}>
                        <span className="tnum cell-strong" style={{ color:n.type==='credit'?'var(--positive)':'var(--negative)' }}>
                          {n.type==='credit'?'−':'+'}{ fmtINR(n.amount, { compact:true })}
                        </span>
                        {invRecord && (
                          <span className="tnum" style={{ fontSize:11, color:'var(--text-3)' }}>
                            → {fmtINR(n.type==='credit'?invRecord.amount-n.amount:invRecord.amount+n.amount, { compact:true })}
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                  {vis('approvedBy')  && <td style={{ fontSize:12.5 }}>{n.approvedBy||<span style={{ color:'var(--text-3)' }}>—</span>}</td>}
                  {vis('status')      && <td><Badge tone={_statusTone(n.status)}>{n.status}</Badge></td>}
                  <td>
                    <button className="btn btn-sm btn-ghost" style={{ padding:'2px 6px' }}
                      onClick={() => { setFormPrefill(n); setFormConfNo(n.conf || null); setView('new'); }}>
                      <Icon.Edit size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Analytics */}
      {allNotes.length > 0 && (() => {
        const totalAll = allNotes.reduce((s, n) => s + n.amount, 0);

        const reasonEntries = Object.entries(REASON_LABELS)
          .map(([key, label]) => ({
            key, label, color: REASON_COLORS[key] || '#6b7280',
            cnt: allNotes.filter(n => n.reason === key).length,
            amt: allNotes.filter(n => n.reason === key).reduce((s, n) => s + n.amount, 0),
          }))
          .filter(r => r.cnt > 0)
          .sort((a, b) => b.amt - a.amt);

        const byInvoice = {};
        allNotes.forEach(n => {
          const key = n.invoice || '(no invoice)';
          if (!byInvoice[key]) byInvoice[key] = { amt:0, count:0, crCount:0, drCount:0, conf:n.conf, buyer:n.buyer };
          byInvoice[key].amt += n.amount;
          byInvoice[key].count++;
          if (n.type === 'credit') byInvoice[key].crCount++; else byInvoice[key].drCount++;
        });
        const invoiceEntries = Object.entries(byInvoice).sort((a, b) => b[1].amt - a[1].amt);

        return (
          <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:14, marginTop:14 }}>
            <div className="card" style={{ padding:0 }}>
              <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontWeight:600, fontSize:13.5, color:'var(--text-1)' }}>Breakdown by reason</div>
                <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>{fmtINR(totalAll, { compact:true })} total adjustments</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:0 }}>
                {reasonEntries.map((r, i) => {
                  const pct = totalAll > 0 ? Math.round((r.amt / totalAll) * 100) : 0;
                  const isOdd = i % 2 === 0;
                  const isLast2 = i >= reasonEntries.length - (reasonEntries.length % 2 === 0 ? 2 : 1);
                  return (
                    <div key={r.key} style={{ padding:'16px 20px', borderRight:isOdd && i < reasonEntries.length-1?'1px solid var(--border)':'none', borderBottom:!isLast2?'1px solid var(--border)':'none', display:'flex', flexDirection:'column', gap:8 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          <span style={{ width:8, height:8, borderRadius:'50%', background:r.color, display:'inline-block' }} />
                          <span style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.04em' }}>{r.label}</span>
                        </div>
                        <span style={{ fontSize:11, fontWeight:700, color:r.color, background:`${r.color}18`, borderRadius:999, padding:'2px 8px' }}>{r.cnt} note{r.cnt!==1?'s':''}</span>
                      </div>
                      <div style={{ fontSize:22, fontWeight:700, color:'var(--text-1)', lineHeight:1 }}>{fmtINR(r.amt, { compact:true })}</div>
                      <div>
                        <div style={{ height:4, borderRadius:999, background:'var(--surface-2)', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, borderRadius:999, background:r.color }} />
                        </div>
                        <div style={{ fontSize:11, color:'var(--text-3)', marginTop:4 }}>{pct}% of total</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{ padding:0 }}>
              <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontWeight:600, fontSize:13.5, color:'var(--text-1)' }}>Affected invoices</div>
                <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>{invoiceEntries.length} invoice{invoiceEntries.length!==1?'s':''} with adjustments</div>
              </div>
              <div style={{ padding:'4px 0' }}>
                {invoiceEntries.map(([inv, data], i) => {
                  const invRecord = INVOICES.find(r => r.no === inv);
                  return (
                    <div key={inv} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom:i < invoiceEntries.length-1?'1px solid var(--border)':'none', transition:'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background='var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <div style={{ width:24, height:24, borderRadius:'50%', background:'var(--surface-2)', border:'1px solid var(--border)', display:'grid', placeItems:'center', fontSize:11, fontWeight:700, color:'var(--text-3)', flexShrink:0 }}>{i+1}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                          <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:'var(--accent)' }}>{inv}</span>
                          {data.crCount > 0 && <span style={{ fontSize:10, fontWeight:700, color:'#15803d', background:'rgba(34,197,94,.12)', borderRadius:999, padding:'1px 7px' }}>CR ×{data.crCount}</span>}
                          {data.drCount > 0 && <span style={{ fontSize:10, fontWeight:700, color:'#dc2626', background:'rgba(239,68,68,.10)', borderRadius:999, padding:'1px 7px' }}>DR ×{data.drCount}</span>}
                        </div>
                        <div style={{ fontSize:11.5, color:'var(--text-3)' }}>
                          {data.buyer}{invRecord ? ` · ${invRecord.seller}` : ''}
                          {data.conf ? ` · ${data.conf}` : ''}
                        </div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:14, fontWeight:700, color:'var(--text-1)' }}>{fmtINR(data.amt, { compact:true })}</div>
                        <div style={{ fontSize:11, color:'var(--text-3)', marginTop:1 }}>{data.count} note{data.count!==1?'s':''}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

window.CrDrNotes = CrDrNotes;
