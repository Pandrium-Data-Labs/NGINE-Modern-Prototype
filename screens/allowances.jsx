// Allowances screen — pre-agreed deductions against sale contracts

const { Field, Input, Select, Badge, Section, DatePicker, fmtINR, fmtNum, ViewMenu } = window.UI;
const { CONFIRMATIONS, ALLOWANCES, fmtDate, fmtDateShort } = window.NCData;

const TYPE_META = {
  freight:  { label: 'Freight',           color: '#f59e0b', bg: 'rgba(245,158,11,.12)'  },
  handling: { label: 'Handling',          color: '#3b82f6', bg: 'rgba(59,130,246,.12)'  },
  loading:  { label: 'Loading',           color: '#8b5cf6', bg: 'rgba(139,92,246,.12)'  },
  quality:  { label: 'Quality Deduction', color: '#ef4444', bg: 'rgba(239,68,68,.12)'   },
  other:    { label: 'Other',             color: '#6b7280', bg: 'rgba(107,114,128,.12)' },
};

const _typeBadge = (type) => {
  const m = TYPE_META[type] || { label: type, color: 'var(--text-3)', bg: 'var(--surface-2)' };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 9px', borderRadius:999, fontSize:11, fontWeight:700, letterSpacing:'.04em', background:m.bg, color:m.color }}>
      {m.label}
    </span>
  );
};

const _statusTone = (s) => s === 'applied' ? 'success' : s === 'pending' ? 'warn' : 'default';

const _KpiCard = ({ label, value, sub, subTone, accent }) => (
  <div className="card" style={{ padding:0 }}>
    <div className="card-body" style={{ padding:'16px 18px 14px', display:'flex', flexDirection:'column', gap:4 }}>
      <div style={{ fontSize:11, color:'var(--text-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em' }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:700, letterSpacing:'-.02em', color:accent||'var(--text-1)', lineHeight:1.1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color: subTone==='danger' ? 'var(--negative)' : subTone==='positive' ? 'var(--positive)' : subTone==='warn' ? 'var(--warn)' : 'var(--text-3)' }}>{sub}</div>}
    </div>
  </div>
);

// ── allowance form ─────────────────────────────────────────────────────────────

const _AllowanceForm = ({ onClose, onSave, prefill }) => {
  const todayStr = new Date().toISOString().slice(0,10);
  const [type,       setType]       = React.useState(prefill?.type        || 'freight');
  const [confNo,     setConfNo]     = React.useState(prefill?.conf        || '');
  const [description,setDescription]= React.useState(prefill?.description || '');
  const [amount,     setAmount]     = React.useState(prefill?.amount      ? String(prefill.amount) : '');
  const [date,       setDate]       = React.useState(prefill?.date        ? (prefill.date instanceof Date ? prefill.date.toISOString().slice(0,10) : prefill.date) : todayStr);
  const [createdBy,  setCreatedBy]  = React.useState(prefill?.createdBy   || 'Karthik R');
  const [confOpen,   setConfOpen]   = React.useState(false);
  const [confQ,      setConfQ]      = React.useState('');

  const selConf     = CONFIRMATIONS.find(c => c.no === confNo);
  const buyerName   = selConf?.buyer  || '';
  const sellerName  = selConf?.seller || '';

  const confSuggestions = CONFIRMATIONS.filter(c => {
    const q = confQ.toLowerCase();
    return !q || c.no.toLowerCase().includes(q) || c.buyer.toLowerCase().includes(q) || c.seller.toLowerCase().includes(q);
  }).slice(0, 8);

  const nextNo  = `ALW-26-${String(parseInt((ALLOWANCES[0]?.no?.split('-')[2] || '0019')) + 1).padStart(4,'0')}`;
  const canSave = confNo && description.trim() && parseFloat(amount) > 0;

  const handleSave = () => {
    onSave({
      no: nextNo, date: new Date(date), type, conf: confNo,
      buyer: buyerName, seller: sellerName,
      description: description.trim(), amount: parseFloat(amount) || 0,
      createdBy: createdBy.trim(), status: 'pending',
    });
  };

  const typeMeta = TYPE_META[type];

  return (
    <div className="content-inner">
      <div className="page-header">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <button className="btn btn-sm btn-ghost" onClick={onClose}><Icon.ChevronLeft size={14} /> Back</button>
            <Badge tone="warn">Pending</Badge>
          </div>
          <h1 className="page-title">New Allowance</h1>
          <div className="page-sub">Record a pre-agreed deduction against a sale contract.</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={onClose}><Icon.X size={14} /> Discard</button>
          <button className="btn" onClick={handleSave}><Icon.Save size={14} /> Save draft</button>
          <button className="btn btn-primary" disabled={!canSave} onClick={handleSave}><Icon.Check size={14} /> Apply allowance</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 300px', gap:16 }}>
        <div className="card">
          <div className="card-body" style={{ padding:'8px 24px 20px' }}>

            {/* Allowance type */}
            <Section title="Allowance type" desc="Select the category of deduction being applied.">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
                {Object.entries(TYPE_META).map(([t, m]) => (
                  <button key={t} onClick={() => setType(t)} style={{
                    padding:'10px 4px', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:12,
                    border:'2px solid', fontFamily:'inherit', transition:'all .12s', textAlign:'center',
                    background:   type === t ? m.bg   : 'var(--surface-2)',
                    borderColor:  type === t ? m.color : 'var(--border)',
                    color:        type === t ? m.color : 'var(--text-2)',
                  }}>
                    {m.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* Contract + parties */}
            <Section title="Contract" desc="Link this allowance to a sale contract.">
              <div className="form-grid">

                <Field label="Sale contract" required span={2}>
                  <div style={{ position:'relative' }}>
                    {confNo ? (
                      <div style={{ display:'flex', alignItems:'center', gap:10, border:'1.5px solid var(--accent)', borderRadius:7, padding:'9px 12px', background:'color-mix(in srgb,var(--accent) 5%,var(--bg-2))' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                            <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:'var(--accent)' }}>{confNo}</span>
                            <Badge tone={selConf?.status === 'closed' ? 'default' : 'info'}>{selConf?.status}</Badge>
                          </div>
                          <div style={{ fontSize:12, color:'var(--text-3)' }}>{selConf?.buyer} · {selConf?.seller} · {selConf && fmtDateShort(selConf.date)}</div>
                        </div>
                        <button type="button" onClick={() => { setConfNo(''); setConfQ(''); }}
                          style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', display:'flex', padding:5, borderRadius:5 }}>
                          <Icon.X size={14}/>
                        </button>
                      </div>
                    ) : (
                      <label style={{ display:'flex', alignItems:'center', gap:7, border:'1px solid var(--border)', borderRadius:6, background:'var(--bg-2)', padding:'0 10px', cursor:'text' }}
                        onFocusCapture={e => { e.currentTarget.style.borderColor='var(--accent)'; setConfOpen(true); }}
                        onBlurCapture={e => e.currentTarget.style.borderColor='var(--border)'}>
                        <Icon.Search size={13} style={{ color:'var(--text-3)', flexShrink:0 }} />
                        <input value={confQ} onChange={e => { setConfQ(e.target.value); setConfOpen(true); }}
                          onFocus={() => setConfOpen(true)} onBlur={() => setTimeout(() => setConfOpen(false), 150)}
                          placeholder="Search by contract no., buyer, or seller…"
                          style={{ flex:1, border:'none', background:'transparent', padding:'7px 0', outline:'none', fontSize:13, color:'var(--text-1)', fontFamily:'inherit', minWidth:0 }}
                        />
                      </label>
                    )}
                    {confOpen && !confNo && confSuggestions.length > 0 && (
                      <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, boxShadow:'0 6px 24px rgba(0,0,0,.12)', zIndex:50, overflow:'hidden' }}>
                        {confSuggestions.map(c => (
                          <button key={c.no} type="button" onMouseDown={() => { setConfNo(c.no); setConfQ(''); setConfOpen(false); }}
                            style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer', width:'100%', textAlign:'left', background:'none', border:'none', borderBottom:'1px solid var(--border)', fontFamily:'inherit' }}
                            onMouseEnter={e => e.currentTarget.style.background='var(--surface-2)'}
                            onMouseLeave={e => e.currentTarget.style.background='none'}>
                            <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:700, color:'var(--accent)', minWidth:90, flexShrink:0 }}>{c.no}</span>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:13, fontWeight:500, color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.buyer}</div>
                              <div style={{ fontSize:11.5, color:'var(--text-3)', marginTop:1 }}>{c.seller} · {c.variety} · {fmtDateShort(c.date)}</div>
                            </div>
                            <Badge tone={c.status === 'closed' ? 'default' : 'info'}>{c.status}</Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>

                <Field label="Buyer">
                  <Input value={buyerName} readOnly disabled placeholder="Auto-filled from contract" />
                </Field>

                <Field label="Seller">
                  <Input value={sellerName} readOnly disabled placeholder="Auto-filled from contract" />
                </Field>
              </div>
            </Section>

            {/* Details */}
            <Section title="Details" desc="Describe the allowance and enter the agreed amount.">
              <div className="form-grid">
                <Field label="Description" required span={2}>
                  <textarea className="input textarea" rows="3"
                    placeholder="Describe the reason and basis for this allowance…"
                    value={description} onChange={e => setDescription(e.target.value)} />
                </Field>

                <Field label="Amount (₹)" required>
                  <div className="input-group">
                    <span className="input-prefix">₹</span>
                    <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="input tnum" placeholder="0" min="0" />
                  </div>
                </Field>

                <Field label="Date" required>
                  <DatePicker value={date} onChange={setDate} />
                </Field>

                <Field label="Created by" required>
                  <Input value={createdBy} onChange={e => setCreatedBy(e.target.value)} placeholder="Your name" />
                </Field>
              </div>
            </Section>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {selConf ? (
            <div className="card">
              <div className="card-header"><div className="card-title">Contract details</div></div>
              <div className="card-body" style={{ padding:'4px 16px 16px', display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  ['No',      selConf.no],
                  ['Date',    fmtDateShort(selConf.date)],
                  ['Buyer',   selConf.buyer],
                  ['Seller',  selConf.seller],
                  ['Variety', selConf.variety],
                  ['Bales',   `${selConf.balesMin}–${selConf.balesMax}`],
                  ['Rate',    `₹${selConf.candyRt.toLocaleString('en-IN')}/candy`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', gap:8, fontSize:12.5 }}>
                    <span style={{ color:'var(--text-3)', fontWeight:500 }}>{k}</span>
                    <span style={{ color:'var(--text-1)', fontWeight:500, textAlign:'right' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body" style={{ padding:'24px 16px', textAlign:'center' }}>
                <Icon.FileText size={20} style={{ color:'var(--text-3)', display:'block', margin:'0 auto 8px' }} />
                <div style={{ fontSize:12.5, color:'var(--text-3)' }}>Select a contract to see details here.</div>
              </div>
            </div>
          )}

          {parseFloat(amount) > 0 && (
            <div className="card" style={{ border:`2px solid ${typeMeta.color}`, background:typeMeta.bg }}>
              <div className="card-body" style={{ padding:'14px 16px' }}>
                <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:typeMeta.color, marginBottom:6 }}>
                  {typeMeta.label} allowance
                </div>
                <div style={{ fontSize:28, fontWeight:700, color:typeMeta.color, letterSpacing:'-.02em' }}>
                  {fmtINR(parseFloat(amount), { compact:true })}
                </div>
                {selConf && (
                  <div style={{ fontSize:12, color:'var(--text-3)', marginTop:4 }}>
                    Deducted from net payable to seller
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

// ── column definitions ────────────────────────────────────────────────────────

const _ALW_COLS = [
  { field:'no',          label:'Allowance No', defaultOn:true  },
  { field:'type',        label:'Type',         defaultOn:true  },
  { field:'date',        label:'Date',         defaultOn:true  },
  { field:'conf',        label:'Contract',     defaultOn:true  },
  { field:'buyer',       label:'Buyer',        defaultOn:true  },
  { field:'seller',      label:'Seller',       defaultOn:false },
  { field:'description', label:'Description',  defaultOn:false },
  { field:'amount',      label:'Amount',       defaultOn:true  },
  { field:'createdBy',   label:'Created by',   defaultOn:false },
  { field:'status',      label:'Status',       defaultOn:true  },
];

// ── main list ──────────────────────────────────────────────────────────────────

const Allowances = ({ onCmd }) => {
  const [view,        setView]        = React.useState('list');
  const [formPrefill, setFormPrefill] = React.useState(null);
  const [extraAllow,  setExtraAllow]  = React.useState([]);
  const [search,      setSearch]      = React.useState('');
  const [visibleCols, setVisibleCols] = React.useState(
    () => new Set(_ALW_COLS.filter(c => c.defaultOn).map(c => c.field))
  );
  const vis = (f) => visibleCols.has(f);

  if (view === 'new') {
    return (
      <_AllowanceForm
        prefill={formPrefill}
        onClose={() => { setView('list'); setFormPrefill(null); }}
        onSave={(alw) => { setExtraAllow(prev => [alw, ...prev]); setView('list'); setFormPrefill(null); }}
      />
    );
  }

  const allAllowances = [...extraAllow, ...ALLOWANCES];
  const filtered = allAllowances.filter(a => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.no.toLowerCase().includes(q)              ||
      a.conf.toLowerCase().includes(q)            ||
      a.buyer.toLowerCase().includes(q)           ||
      (a.seller || '').toLowerCase().includes(q)  ||
      a.type.toLowerCase().includes(q)            ||
      (a.description || '').toLowerCase().includes(q)
    );
  });

  // KPIs
  const totalAmt      = allAllowances.reduce((s, a) => s + a.amount, 0);
  const appliedAmt    = allAllowances.filter(a => a.status === 'applied').reduce((s, a) => s + a.amount, 0);
  const pendingCount  = allAllowances.filter(a => a.status === 'pending').length;
  const contractCount = new Set(allAllowances.map(a => a.conf)).size;

  return (
    <div className="content-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">Allowances</h1>
          <div className="page-sub">Pre-agreed deductions against sale contracts · {allAllowances.length} entries · {fmtINR(totalAmt, { compact:true })} total</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => onCmd('nav:payment')}><Icon.Wallet size={14} /> Record Payment</button>
          <button className="btn btn-primary" onClick={() => setView('new')}><Icon.Plus size={14} /> New allowance</button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:16 }}>
        <_KpiCard label="Total allowances"    value={fmtINR(totalAmt, { compact:true })}   sub={`${allAllowances.length} entries`}   subTone="positive" />
        <_KpiCard label="Applied"             value={fmtINR(appliedAmt, { compact:true })} sub={`${allAllowances.filter(a=>a.status==='applied').length} applied`} subTone="positive" accent="var(--positive)" />
        <_KpiCard label="Pending"             value={pendingCount}                          sub={pendingCount > 0 ? 'Awaiting application' : 'None pending'} subTone={pendingCount > 0 ? 'warn' : 'positive'} />
        <_KpiCard label="Contracts affected"  value={contractCount}                         sub={`Across ${contractCount} contract${contractCount !== 1 ? 's' : ''}`} />
      </div>

      {/* Table */}
      <div className="card" style={{ padding:0 }}>
        <div className="card-header">
          <div className="card-title">Allowances</div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
            <label
              style={{ display:'flex', alignItems:'center', gap:6, border:'1px solid var(--border)', borderRadius:6, background:'var(--bg-2)', padding:'0 8px', cursor:'text', transition:'border-color .12s', width:200 }}
              onFocusCapture={e => e.currentTarget.style.borderColor='var(--accent)'}
              onBlurCapture={e => e.currentTarget.style.borderColor='var(--border)'}
            >
              <Icon.Search size={12} style={{ color:'var(--text-3)', flexShrink:0 }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search allowances…"
                style={{ flex:1, border:'none', background:'transparent', padding:'5px 0', outline:'none', fontSize:12.5, color:'var(--text-1)', fontFamily:'inherit', minWidth:0 }} />
              {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:'var(--text-3)', padding:2, flexShrink:0 }}><Icon.X size={11} /></button>}
            </label>
            <ViewMenu cols={_ALW_COLS} visible={visibleCols} onChange={setVisibleCols} />
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              {vis('no')          && <th>Allowance No</th>}
              {vis('type')        && <th>Type</th>}
              {vis('date')        && <th>Date</th>}
              {vis('conf')        && <th>Contract</th>}
              {vis('buyer')       && <th>Buyer</th>}
              {vis('seller')      && <th>Seller</th>}
              {vis('description') && <th>Description</th>}
              {vis('amount')      && <th className="num">Amount</th>}
              {vis('createdBy')   && <th>Created by</th>}
              {vis('status')      && <th>Status</th>}
              <th style={{ width:36 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={11} style={{ textAlign:'center', color:'var(--text-3)', padding:'28px 0', fontSize:13 }}>
                No allowances found{search ? ` for "${search}"` : ''}.
              </td></tr>
            ) : filtered.map(a => (
              <tr key={a.no}>
                {vis('no')          && <td className="cell-mono cell-strong">{a.no}</td>}
                {vis('type')        && <td>{_typeBadge(a.type)}</td>}
                {vis('date')        && <td className="muted">{fmtDateShort(a.date)}</td>}
                {vis('conf')        && <td><span className="cell-mono" style={{ fontSize:12, color:'var(--accent)', fontWeight:600 }}>{a.conf}</span></td>}
                {vis('buyer')       && <td style={{ fontSize:12.5 }}>{a.buyer}</td>}
                {vis('seller')      && <td style={{ fontSize:12.5, color:'var(--text-3)' }}>{a.seller||'—'}</td>}
                {vis('description') && <td style={{ fontSize:12, color:'var(--text-2)', maxWidth:240 }}><span style={{ display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.description||'—'}</span></td>}
                {vis('amount')      && <td className="num tnum cell-strong">{fmtINR(a.amount, { compact:true })}</td>}
                {vis('createdBy')   && <td style={{ fontSize:12.5 }}>{a.createdBy||'—'}</td>}
                {vis('status')      && <td><Badge tone={_statusTone(a.status)}>{a.status}</Badge></td>}
                <td>
                  <button className="btn btn-sm btn-ghost" style={{ padding:'2px 6px' }}
                    onClick={() => { setFormPrefill(a); setView('new'); }}>
                    <Icon.Edit size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Analytics */}
      {allAllowances.length > 0 && (() => {
        const totalAll = allAllowances.reduce((s, a) => s + a.amount, 0);

        const typeEntries = Object.entries(TYPE_META)
          .map(([key, m]) => ({
            key, label:m.label, color:m.color, bg:m.bg,
            cnt: allAllowances.filter(a => a.type === key).length,
            amt: allAllowances.filter(a => a.type === key).reduce((s, a) => s + a.amount, 0),
          }))
          .filter(r => r.cnt > 0)
          .sort((a, b) => b.amt - a.amt);

        const byConf = {};
        allAllowances.forEach(a => {
          if (!byConf[a.conf]) byConf[a.conf] = { amt:0, count:0, types:new Set() };
          byConf[a.conf].amt += a.amount;
          byConf[a.conf].count++;
          byConf[a.conf].types.add(a.type);
        });
        const confEntries = Object.entries(byConf).sort((a, b) => b[1].amt - a[1].amt);

        return (
          <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:14, marginTop:14 }}>
            <div className="card" style={{ padding:0 }}>
              <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontWeight:600, fontSize:13.5, color:'var(--text-1)' }}>Breakdown by type</div>
                <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>{fmtINR(totalAll, { compact:true })} total deductions</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:0 }}>
                {typeEntries.map((r, i) => {
                  const pct = totalAll > 0 ? Math.round((r.amt / totalAll) * 100) : 0;
                  const isOdd = i % 2 === 0;
                  const isLast2 = i >= typeEntries.length - (typeEntries.length % 2 === 0 ? 2 : 1);
                  return (
                    <div key={r.key} style={{ padding:'16px 20px', borderRight:isOdd && i < typeEntries.length-1?'1px solid var(--border)':'none', borderBottom:!isLast2?'1px solid var(--border)':'none', display:'flex', flexDirection:'column', gap:8 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          <span style={{ width:8, height:8, borderRadius:'50%', background:r.color, display:'inline-block' }} />
                          <span style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.04em' }}>{r.label}</span>
                        </div>
                        <span style={{ fontSize:11, fontWeight:700, color:r.color, background:r.bg, borderRadius:999, padding:'2px 8px' }}>{r.cnt}</span>
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
                <div style={{ fontWeight:600, fontSize:13.5, color:'var(--text-1)' }}>Affected contracts</div>
                <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>{confEntries.length} contract{confEntries.length !== 1 ? 's' : ''} with allowances</div>
              </div>
              <div style={{ padding:'4px 0' }}>
                {confEntries.map(([conf, data], i) => {
                  const confRecord = CONFIRMATIONS.find(c => c.no === conf);
                  return (
                    <div key={conf} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom:i < confEntries.length-1?'1px solid var(--border)':'none', transition:'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background='var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <div style={{ width:24, height:24, borderRadius:'50%', background:'var(--surface-2)', border:'1px solid var(--border)', display:'grid', placeItems:'center', fontSize:11, fontWeight:700, color:'var(--text-3)', flexShrink:0 }}>{i+1}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                          <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color:'var(--accent)' }}>{conf}</span>
                          {[...data.types].map(t => {
                            const m = TYPE_META[t];
                            return m ? <span key={t} style={{ fontSize:10, fontWeight:700, color:m.color, background:m.bg, borderRadius:999, padding:'1px 7px' }}>{m.label}</span> : null;
                          })}
                        </div>
                        {confRecord && <div style={{ fontSize:11.5, color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{confRecord.buyer} · {confRecord.seller}</div>}
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:14, fontWeight:700, color:'var(--text-1)' }}>{fmtINR(data.amt, { compact:true })}</div>
                        <div style={{ fontSize:11, color:'var(--text-3)', marginTop:1 }}>{data.count} allowance{data.count !== 1?'s':''}</div>
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

window.Allowances = Allowances;
