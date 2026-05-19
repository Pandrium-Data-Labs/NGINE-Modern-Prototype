// Advance Payment screen

const { Field, Input, Select, Badge, Section, fmtINR, fmtNum, ViewMenu } = window.UI;
const { BUYERS, ADVANCE_PAYMENTS, fmtDate, fmtDateShort } = window.NCData;

// ── helpers ───────────────────────────────────────────────────────────────────

const _advStatusTone = (s) => s === 'utilised' ? 'success' : s === 'partial' ? 'warn' : 'info';

const _today = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const _nextNo = (allRecords) => {
  const maxSeq = allRecords.reduce((mx, r) => {
    const n = parseInt((r.no || '').split('-')[2] || '0');
    return n > mx ? n : mx;
  }, 12);
  return `ADV-26-${String(maxSeq + 1).padStart(4, '0')}`;
};

// ── KPI stat card ─────────────────────────────────────────────────────────────

const _KpiCard = ({ label, value, sub, accent, icon: IconComp }) => (
  <div className="card" style={{ padding: 0 }}>
    <div className="card-body" style={{ padding: '16px 18px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
        {IconComp && <IconComp size={15} style={{ color: accent || 'var(--text-3)', opacity: .6 }} />}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em', color: accent || 'var(--text-1)', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{sub}</div>}
    </div>
  </div>
);

// ── sidebar row helper ────────────────────────────────────────────────────────

const _SideRow = ({ label, value, valueStyle }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '5px 0', fontSize: 12.5 }}>
    <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>{label}</span>
    <span style={{ color: 'var(--text-1)', fontWeight: 500, textAlign: 'right', ...valueStyle }}>{value}</span>
  </div>
);

// ── column definitions ────────────────────────────────────────────────────────

const _ADV_COLS = [
  { field: 'no',       label: 'Advance No', defaultOn: true  },
  { field: 'date',     label: 'Date',       defaultOn: true  },
  { field: 'buyer',    label: 'Buyer',      defaultOn: true  },
  { field: 'amount',   label: 'Amount',     defaultOn: true  },
  { field: 'utilised', label: 'Utilised',   defaultOn: true  },
  { field: 'balance',  label: 'Balance',    defaultOn: true  },
  { field: 'mode',     label: 'Mode',       defaultOn: false },
  { field: 'ref',      label: 'Ref / UTR',  defaultOn: false },
  { field: 'status',   label: 'Status',     defaultOn: true  },
];

// ── form view ─────────────────────────────────────────────────────────────────

const _AdvanceForm = ({ onClose, onSave, prefill, allRecords }) => {
  const [buyer,  setBuyer]  = React.useState(prefill?.buyer  || '');
  const [date,   setDate]   = React.useState(prefill?.date
    ? (prefill.date instanceof Date ? prefill.date.toISOString().slice(0, 10) : prefill.date)
    : _today());
  const [amount, setAmount] = React.useState(prefill?.amount   != null ? String(prefill.amount)   : '');
  const [mode,   setMode]   = React.useState(prefill?.mode    || 'RTGS');
  const [ref,    setRef]    = React.useState(prefill?.ref     || '');
  const [notes,  setNotes]  = React.useState(prefill?.notes   || '');

  const isEdit   = !!prefill?.no;
  const canSave  = buyer && amount && parseFloat(amount) > 0;
  const amtVal   = parseFloat(amount) || 0;

  // Buyer's existing advances
  const buyerAdvances = buyer
    ? allRecords.filter(r => r.buyer === buyer && (!isEdit || r.no !== prefill.no))
    : [];
  const buyerAdvCount   = buyerAdvances.length;
  const buyerAdvBalance = buyerAdvances.reduce((s, r) => s + r.balance, 0);

  const handleSave = () => {
    const rec = {
      no:       isEdit ? prefill.no : _nextNo(allRecords),
      date:     new Date(date),
      buyer,
      amount:   amtVal,
      utilised: isEdit ? prefill.utilised : 0,
      balance:  isEdit ? prefill.balance  : amtVal,
      mode,
      ref,
      status:   isEdit ? prefill.status : 'open',
      notes,
    };
    onSave(rec);
  };

  return (
    <div className="content-inner">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <button className="btn btn-sm btn-ghost" onClick={onClose}><Icon.ChevronLeft size={14} /> Back</button>
            <Badge tone="info">Draft advance</Badge>
          </div>
          <h1 className="page-title">{isEdit ? 'Edit advance' : 'Record advance'}</h1>
          <div className="page-sub">Record an advance payment received from a buyer.</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={onClose}><Icon.X size={14} /> Discard</button>
          <button className="btn" onClick={handleSave}><Icon.Save size={14} /> Save draft</button>
          <button className="btn btn-primary" disabled={!canSave} onClick={handleSave}>
            <Icon.Check size={14} /> Post advance
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 16 }}>

        {/* Main form card */}
        <div className="card">
          <div className="card-body" style={{ padding: '8px 24px 20px' }}>
            <Section title="Advance details" desc="Enter the buyer, payment date, amount, and reference details for this advance.">
              <div className="form-grid">

                <Field label="Buyer" required>
                  <Select value={buyer} onChange={e => setBuyer(e.target.value)}>
                    <option value="">Select buyer…</option>
                    {BUYERS.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </Select>
                </Field>

                <Field label="Date" required>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </Field>

                <Field label="Amount" required>
                  <div className="input-group">
                    <span className="input-prefix">₹</span>
                    <Input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="input tnum"
                      placeholder="0"
                    />
                  </div>
                </Field>

                <Field label="Mode">
                  <Select value={mode} onChange={e => setMode(e.target.value)}>
                    <option>RTGS</option>
                    <option>NEFT</option>
                    <option>DD</option>
                    <option>Cheque</option>
                    <option>Cash</option>
                  </Select>
                </Field>

                <Field label="Reference / UTR">
                  <Input
                    value={ref}
                    onChange={e => setRef(e.target.value)}
                    placeholder="e.g. HDFC26050100234"
                    className="cell-mono"
                  />
                </Field>

                <Field label="Notes" span={2}>
                  <Input
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any notes about this advance…"
                  />
                </Field>

              </div>
            </Section>
          </div>
        </div>

        {/* Sidebar summary */}
        <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 16 }}>
          <div className="card-header">
            <div className="card-title">Summary</div>
          </div>
          <div className="card-body" style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>

            <_SideRow label="Buyer" value={buyer || '—'} />
            <_SideRow
              label="Amount"
              value={amtVal > 0 ? fmtINR(amtVal, { compact: true }) : '—'}
              valueStyle={amtVal > 0 ? { color: 'var(--accent)', fontWeight: 700 } : {}}
            />
            <_SideRow label="Mode" value={mode} />
            {ref && <_SideRow label="Reference" value={ref} />}

            {buyer && (
              <>
                <div style={{ borderTop: '1px solid var(--border)', margin: '10px 0 8px' }} />
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>
                  {buyer}'s existing advances
                </div>
                {buyerAdvCount === 0 ? (
                  <div style={{ fontSize: 12.5, color: 'var(--text-3)', fontStyle: 'italic' }}>No prior advances on record.</div>
                ) : (
                  <>
                    <_SideRow label="Advances on record" value={buyerAdvCount} />
                    <_SideRow
                      label="Available balance"
                      value={fmtINR(buyerAdvBalance, { compact: true })}
                      valueStyle={{ color: buyerAdvBalance > 0 ? 'var(--positive)' : 'var(--text-3)' }}
                    />
                  </>
                )}
              </>
            )}

            {amtVal > 0 && (
              <>
                <div style={{ borderTop: '1px solid var(--border)', margin: '10px 0 8px' }} />
                <div style={{
                  background: 'rgba(99,102,241,.07)', border: '1px solid rgba(99,102,241,.18)',
                  borderRadius: 8, padding: '12px 14px',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--accent)', marginBottom: 4 }}>
                    New advance
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-.02em' }}>
                    {fmtINR(amtVal, { compact: true })}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                    {mode} · {date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date'}
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

// ── main dashboard ────────────────────────────────────────────────────────────

const AdvancePayment = ({ onCmd }) => {
  const [showForm,      setShowForm]    = React.useState(false);
  const [formPrefill,   setFormPrefill] = React.useState(null);
  const [extraRecords,  setExtraRecords] = React.useState([]);
  const [filterStatus,  setFilterStatus] = React.useState('all');
  const [search,        setSearch]      = React.useState('');
  const [page,          setPage]        = React.useState(1);
  const [pageSize,      setPageSize]    = React.useState(10);
  const [visibleCols,   setVisibleCols] = React.useState(
    () => new Set(_ADV_COLS.filter(c => c.defaultOn).map(c => c.field))
  );
  const vis = (f) => visibleCols.has(f);

  React.useEffect(() => { setPage(1); }, [search, filterStatus]);

  const allRecords = [...extraRecords, ...ADVANCE_PAYMENTS];

  if (showForm) {
    return (
      <_AdvanceForm
        prefill={formPrefill}
        allRecords={allRecords}
        onClose={() => { setShowForm(false); setFormPrefill(null); }}
        onSave={(rec) => {
          setExtraRecords(prev => {
            // replace if editing
            const idx = prev.findIndex(r => r.no === rec.no);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = rec;
              return next;
            }
            return [rec, ...prev];
          });
          setShowForm(false);
          setFormPrefill(null);
        }}
      />
    );
  }

  // KPIs
  const totalReceived  = allRecords.reduce((s, r) => s + r.amount,   0);
  const totalUtilised  = allRecords.reduce((s, r) => s + r.utilised, 0);
  const totalBalance   = allRecords.reduce((s, r) => s + r.balance,  0);
  const openCount      = allRecords.filter(r => r.status !== 'utilised').length;

  const filtered = allRecords.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.no.toLowerCase().includes(q)            ||
      r.buyer.toLowerCase().includes(q)         ||
      (r.ref  || '').toLowerCase().includes(q)  ||
      (r.mode || '').toLowerCase().includes(q)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="content-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">Advance Payments</h1>
          <div className="page-sub">{allRecords.length} advances · {fmtINR(totalBalance, { compact: true })} available balance</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => onCmd('nav:payment')}><Icon.Wallet size={14} /> Record Payment</button>
          <button className="btn btn-primary" onClick={() => { setFormPrefill(null); setShowForm(true); }}>
            <Icon.Plus size={14} /> Record advance
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        <_KpiCard
          label="Total Received"
          value={fmtINR(totalReceived, { compact: true })}
          sub={`${allRecords.length} advance${allRecords.length !== 1 ? 's' : ''}`}
          icon={Icon.Wallet}
          accent="var(--accent)"
        />
        <_KpiCard
          label="Total Utilised"
          value={fmtINR(totalUtilised, { compact: true })}
          sub={`${allRecords.filter(r => r.status === 'utilised').length} fully utilised`}
          icon={Icon.TrendingUp}
        />
        <_KpiCard
          label="Available Balance"
          value={fmtINR(totalBalance, { compact: true })}
          sub={`${allRecords.filter(r => r.balance > 0).length} with remaining balance`}
          accent={totalBalance > 0 ? 'var(--positive)' : undefined}
          icon={Icon.TrendingUp}
        />
        <_KpiCard
          label="Open Advances"
          value={openCount}
          sub={`${allRecords.filter(r => r.status === 'partial').length} partial · ${allRecords.filter(r => r.status === 'open').length} fully open`}
          accent={openCount > 0 ? 'var(--warn)' : undefined}
          icon={Icon.AlertCircle}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="card-header">
          <div style={{ display:'flex', gap:4 }}>
            {[
              { id:'all',      label:'All'      },
              { id:'open',     label:'Open',     bg:'rgba(59,130,246,.14)', color:'#1d4ed8', bd:'rgba(59,130,246,.5)' },
              { id:'partial',  label:'Partial',  bg:'rgba(234,179,8,.13)',  color:'#92400e', bd:'rgba(234,179,8,.5)'  },
              { id:'utilised', label:'Utilised', bg:'rgba(34,197,94,.14)',  color:'#15803d', bd:'rgba(34,197,94,.5)'  },
            ].map(({ id, label, bg, color, bd }) => {
              const active = filterStatus === id;
              return (
                <button key={id} onClick={() => setFilterStatus(id)} style={{
                  padding:'4px 11px', borderRadius:999, cursor:'pointer', fontSize:12, fontWeight:500,
                  border:'1px solid', transition:'all .12s',
                  background:  active && bg    ? bg    : active ? 'var(--accent)' : 'transparent',
                  color:       active && color  ? color : active ? '#fff'         : 'var(--text-2)',
                  borderColor: active && bd     ? bd    : active ? 'var(--accent)': 'var(--border)',
                }}>
                  {label}
                </button>
              );
            })}
          </div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
            <label
              style={{ display:'flex', alignItems:'center', gap:6, border:'1px solid var(--border)', borderRadius:6, background:'var(--bg-2)', padding:'0 8px', cursor:'text', transition:'border-color .12s', width:200 }}
              onFocusCapture={e => e.currentTarget.style.borderColor='var(--accent)'}
              onBlurCapture={e => e.currentTarget.style.borderColor='var(--border)'}
            >
              <Icon.Search size={12} style={{ color:'var(--text-3)', flexShrink:0 }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search advances…"
                style={{ flex:1, border:'none', background:'transparent', padding:'5px 0', outline:'none', fontSize:12.5, color:'var(--text-1)', fontFamily:'inherit', minWidth:0 }} />
              {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:'var(--text-3)', padding:2, flexShrink:0 }}><Icon.X size={11} /></button>}
            </label>
            <ViewMenu cols={_ADV_COLS} visible={visibleCols} onChange={setVisibleCols} />
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              {vis('no')       && <th>Advance No</th>}
              {vis('date')     && <th>Date</th>}
              {vis('buyer')    && <th>Buyer</th>}
              {vis('amount')   && <th className="num">Amount</th>}
              {vis('utilised') && <th className="num">Utilised</th>}
              {vis('balance')  && <th className="num">Balance</th>}
              {vis('mode')     && <th>Mode</th>}
              {vis('ref')      && <th>Ref / UTR</th>}
              {vis('status')   && <th>Status</th>}
              <th style={{ width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={_ADV_COLS.length + 1} style={{ textAlign: 'center', color: 'var(--text-3)', padding: '28px 0', fontSize: 13 }}>
                  No advance payments found{search ? ` for "${search}"` : ''}.
                </td>
              </tr>
            ) : paginated.map(r => (
              <tr key={r.no}>
                {vis('no')       && <td className="cell-mono cell-strong">{r.no}</td>}
                {vis('date')     && <td className="muted">{fmtDateShort(r.date)}</td>}
                {vis('buyer')    && <td style={{ fontSize: 13 }}>{r.buyer}</td>}
                {vis('amount')   && <td className="num tnum">{fmtINR(r.amount, { compact: true })}</td>}
                {vis('utilised') && <td className="num tnum">{r.utilised > 0 ? fmtINR(r.utilised, { compact: true }) : <span className="muted">—</span>}</td>}
                {vis('balance')  && (
                  <td className="num tnum" style={{ fontWeight: 600, color: r.balance > 0 ? 'var(--positive)' : 'var(--text-3)' }}>
                    {r.balance > 0 ? fmtINR(r.balance, { compact: true }) : <span className="muted">—</span>}
                  </td>
                )}
                {vis('mode')     && <td><span className="muted" style={{ fontSize: 12 }}>{r.mode || '—'}</span></td>}
                {vis('ref')      && <td><span className="cell-mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>{r.ref || '—'}</span></td>}
                {vis('status')   && <td><Badge tone={_advStatusTone(r.status)}>{r.status}</Badge></td>}
                <td>
                  <button
                    className="btn btn-sm btn-ghost"
                    style={{ padding: '2px 6px' }}
                    onClick={() => { setFormPrefill(r); setShowForm(true); }}
                  >
                    <Icon.Edit size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', borderTop:'1px solid var(--border)', gap:12, flexWrap:'wrap' }}>
          <span style={{ fontSize:12, color:'var(--text-3)', whiteSpace:'nowrap' }}>
            {filtered.length === 0 ? 'No results' : <><strong style={{ color:'var(--text-1)', fontWeight:600 }}>{(safePage-1)*pageSize+1}–{Math.min(safePage*pageSize,filtered.length)}</strong>{' '}<span>of {filtered.length} results</span></>}
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:12, color:'var(--text-3)' }}>Show</span>
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                style={{ padding:'5px 24px 5px 9px', border:'1px solid var(--border)', borderRadius:6, background:'var(--bg-2)', color:'var(--text-1)', fontSize:12.5, fontFamily:'inherit', cursor:'pointer', outline:'none', appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 7px center', transition:'border-color .12s' }}
                onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'}>
                <option value={5}>5</option><option value={10}>10</option><option value={25}>25</option>
              </select>
              <span style={{ fontSize:12, color:'var(--text-3)' }}>/ page</span>
            </div>
            <div style={{ width:1, height:18, background:'var(--border)' }} />
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <button disabled={safePage===1} onClick={() => setPage(p => Math.max(1,p-1))}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-2)', cursor:safePage===1?'default':'pointer', color:safePage===1?'var(--text-3)':'var(--text-1)', fontSize:12, fontFamily:'inherit', fontWeight:500, opacity:safePage===1?0.45:1, transition:'border-color .12s,background .12s', whiteSpace:'nowrap' }}
                onMouseEnter={e => { if(safePage!==1){ e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='var(--surface-2,var(--bg-2))'; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-2)'; }}>
                <Icon.ChevronLeft size={12}/> Prev
              </button>
              <div style={{ padding:'5px 12px', borderRadius:7, border:'1px solid var(--border)', background:'var(--surface)', fontSize:12, fontWeight:600, color:'var(--text-1)', whiteSpace:'nowrap', minWidth:64, textAlign:'center' }}>
                {safePage} <span style={{ fontWeight:400, color:'var(--text-3)' }}>/ {totalPages}</span>
              </div>
              <button disabled={safePage===totalPages} onClick={() => setPage(p => Math.min(totalPages,p+1))}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-2)', cursor:safePage===totalPages?'default':'pointer', color:safePage===totalPages?'var(--text-3)':'var(--text-1)', fontSize:12, fontFamily:'inherit', fontWeight:500, opacity:safePage===totalPages?0.45:1, transition:'border-color .12s,background .12s', whiteSpace:'nowrap' }}
                onMouseEnter={e => { if(safePage!==totalPages){ e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='var(--surface-2,var(--bg-2))'; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-2)'; }}>
                Next <Icon.ChevronRight size={12}/>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

window.AdvancePayment = AdvancePayment;
