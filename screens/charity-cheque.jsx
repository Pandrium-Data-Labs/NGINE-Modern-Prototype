// Charity Cheque screen

const { Field, Input, Select, Badge, Section, fmtINR, fmtNum, ViewMenu } = window.UI;
const { CONFIRMATIONS, BUYERS, SELLERS, CHARITY_CHEQUES, fmtDate, fmtDateShort } = window.NCData;

// ── helpers ───────────────────────────────────────────────────────────────────

const _chqStatusTone = (s) =>
  s === 'cleared' ? 'success' : s === 'issued' ? 'info' : 'warn';

// ── stat card ─────────────────────────────────────────────────────────────────

const _KpiCard = ({ label, value, sub, subTone, accent }) => (
  <div className="card" style={{ padding: 0 }}>
    <div className="card-body" style={{ padding: '16px 18px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em', color: accent || 'var(--text-1)', lineHeight: 1.1 }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 12, color: subTone === 'danger' ? 'var(--negative)' : subTone === 'positive' ? 'var(--positive)' : subTone === 'warn' ? 'var(--warn)' : 'var(--text-3)' }}>
          {sub}
        </div>
      )}
    </div>
  </div>
);

// ── column definitions ────────────────────────────────────────────────────────

const _CHEQUE_COLS = [
  { field: 'no',     label: 'Cheque No',  defaultOn: true  },
  { field: 'date',   label: 'Date',       defaultOn: true  },
  { field: 'conf',   label: 'Conf',       defaultOn: true  },
  { field: 'buyer',  label: 'Buyer',      defaultOn: true  },
  { field: 'seller', label: 'Seller',     defaultOn: false },
  { field: 'bales',  label: 'Bales',      defaultOn: true  },
  { field: 'rate',   label: 'Rate/Bale',  defaultOn: false },
  { field: 'amount', label: 'Amount',     defaultOn: true  },
  { field: 'payTo',  label: 'Pay To',     defaultOn: true  },
  { field: 'status', label: 'Status',     defaultOn: true  },
];

// ── form view ─────────────────────────────────────────────────────────────────

const _ChequeForm = ({ onClose, onSave }) => {
  const [confNo,      setConfNo]      = React.useState('');
  const [confQ,       setConfQ]       = React.useState('');
  const [confOpen,    setConfOpen]    = React.useState(false);
  const [buyer,       setBuyer]       = React.useState('');
  const [seller,      setSeller]      = React.useState('');
  const [date,        setDate]        = React.useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [bales,       setBales]       = React.useState('');
  const [ratePerBale, setRatePerBale] = React.useState('10');
  const [payTo,       setPayTo]       = React.useState('');
  const [notes,       setNotes]       = React.useState('');

  const confRef = React.useRef(null);

  const selConf = CONFIRMATIONS.find(c => c.no === confNo);

  // Auto-fill buyer and seller when conf is selected
  React.useEffect(() => {
    if (selConf) {
      setBuyer(selConf.buyer);
      setSeller(selConf.seller);
    } else {
      setBuyer('');
      setSeller('');
    }
  }, [confNo]);

  const confSuggestions = CONFIRMATIONS.filter(c => {
    const q = confQ.toLowerCase();
    return !q || c.no.toLowerCase().includes(q) || c.buyer.toLowerCase().includes(q) || c.seller.toLowerCase().includes(q);
  }).slice(0, 8);

  const balesNum      = parseInt(bales) || 0;
  const rateNum       = parseFloat(ratePerBale) || 0;
  const calcAmount    = balesNum * rateNum;

  const nextNo = `CHQ-26-${String(
    parseInt((CHARITY_CHEQUES[0]?.no?.split('-')[2] || '0027')) + 1
  ).padStart(4, '0')}`;

  const canSave = confNo && balesNum > 0 && rateNum > 0 && payTo.trim();

  const handleSave = () => {
    onSave({
      no: nextNo,
      date: new Date(date),
      conf: confNo,
      buyer,
      seller,
      bales: balesNum,
      ratePerBale: rateNum,
      amount: calcAmount,
      payTo: payTo.trim(),
      status: 'pending',
      notes,
    });
  };

  return (
    <div className="content-inner">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <button className="btn btn-sm btn-ghost" onClick={onClose}>
              <Icon.ChevronLeft size={14} /> Back
            </button>
            <Badge tone="warn">Draft</Badge>
          </div>
          <h1 className="page-title">Issue Charity Cheque</h1>
          <div className="page-sub">Create a new charity cheque against a sale confirmation.</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={onClose}><Icon.X size={14} /> Discard</button>
          <button className="btn" onClick={handleSave}><Icon.Save size={14} /> Save draft</button>
          <button className="btn btn-primary" disabled={!canSave} onClick={handleSave}>
            <Icon.Check size={14} /> Issue cheque
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 16 }}>

        {/* Main form */}
        <div className="card">
          <div className="card-body" style={{ padding: '8px 24px 20px' }}>
            <Section title="Cheque details" desc="Fill in the confirmation, bale details and payee to generate the charity cheque.">
              <div className="form-grid">

                {/* Conf searchable dropdown */}
                <Field label="Sale confirmation" required>
                  <div style={{ position: 'relative' }} ref={confRef}>
                    <div style={{ position: 'relative' }}>
                      <Icon.Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
                      <input
                        value={confQ || confNo}
                        onChange={e => { setConfQ(e.target.value); setConfNo(''); setConfOpen(true); }}
                        onFocus={() => { setConfOpen(true); if (confNo) setConfQ(''); }}
                        onBlur={() => setTimeout(() => setConfOpen(false), 150)}
                        placeholder="Search by conf no, buyer or seller…"
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          paddingLeft: 28, paddingRight: 10, paddingTop: 7, paddingBottom: 7,
                          border: '1px solid var(--border)', borderRadius: 6,
                          background: 'var(--bg-2)', color: 'var(--text-1)',
                          fontSize: 13, outline: 'none', fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => e.target.style.borderColor = 'var(--accent)'}
                        onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                    {confOpen && confSuggestions.length > 0 && (
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,.12)',
                        zIndex: 50, overflow: 'hidden',
                      }}>
                        {confSuggestions.map(c => (
                          <div
                            key={c.no}
                            onMouseDown={() => { setConfNo(c.no); setConfQ(''); setConfOpen(false); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span style={{ fontSize: 11.5, color: 'var(--accent)', fontWeight: 700, fontFamily: 'monospace', minWidth: 96 }}>{c.no}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12.5, color: 'var(--text-1)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.buyer}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.seller} · {c.variety} · {fmtDateShort(c.date)}</div>
                            </div>
                            <Badge tone={c.status === 'closed' ? 'default' : 'info'}>{c.status}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>

                {/* Buyer — read-only */}
                <Field label="Buyer">
                  <Input value={buyer} readOnly placeholder="Auto-filled from conf" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }} />
                </Field>

                {/* Seller — read-only */}
                <Field label="Seller">
                  <Input value={seller} readOnly placeholder="Auto-filled from conf" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }} />
                </Field>

                {/* Date */}
                <Field label="Date" required>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </Field>

                {/* Bales */}
                <Field label="Bales" required>
                  <Input type="number" value={bales} onChange={e => setBales(e.target.value)} placeholder="e.g. 145" min="1" />
                </Field>

                {/* Rate per bale */}
                <Field label="Rate per Bale (₹)" required>
                  <Input type="number" value={ratePerBale} onChange={e => setRatePerBale(e.target.value)} placeholder="10" min="1" />
                </Field>

                {/* Amount — auto-calculated */}
                <Field label="Amount (auto-calculated)">
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--text-3)', fontSize: 13, pointerEvents: 'none',
                    }}>₹</span>
                    <Input
                      type="text"
                      value={calcAmount > 0 ? calcAmount.toLocaleString('en-IN') : ''}
                      readOnly
                      placeholder="0"
                      style={{ paddingLeft: 22, background: 'var(--surface-2)', color: 'var(--text-2)', fontFamily: 'monospace' }}
                    />
                  </div>
                </Field>

                {/* Pay To */}
                <Field label="Pay To" required>
                  <Input value={payTo} onChange={e => setPayTo(e.target.value)} placeholder="e.g. Guntur Cotton Samiti" />
                </Field>

                {/* Notes */}
                <Field label="Notes" span={2}>
                  <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional remarks…" />
                </Field>

              </div>
            </Section>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Conf detail card */}
          {selConf ? (
            <div className="card">
              <div className="card-header"><div className="card-title">Confirmation</div></div>
              <div className="card-body" style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['No',       selConf.no],
                  ['Date',     fmtDateShort(selConf.date)],
                  ['Buyer',    selConf.buyer],
                  ['Seller',   selConf.seller],
                  ['Variety',  selConf.variety],
                  ['Bales',    `${selConf.balesMin}–${selConf.balesMax}`],
                  ['Rate',     `₹${selConf.candyRt.toLocaleString('en-IN')}/candy`],
                  ['Status',   selConf.status],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12.5 }}>
                    <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>{k}</span>
                    <span style={{ color: 'var(--text-1)', fontWeight: 500, textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body" style={{ padding: '24px 16px', textAlign: 'center' }}>
                <Icon.IndianRupee size={20} style={{ color: 'var(--text-3)', display: 'block', margin: '0 auto 8px' }} />
                <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Select a confirmation to see details here.</div>
              </div>
            </div>
          )}

          {/* Amount preview */}
          {calcAmount > 0 && (
            <div className="card" style={{ border: '2px solid var(--accent)', background: 'rgba(var(--accent-rgb, 99,102,241),.04)' }}>
              <div className="card-body" style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--accent)', marginBottom: 6 }}>
                  Cheque amount
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-.02em' }}>
                  {fmtINR(calcAmount, { compact: true })}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                  {balesNum} bale{balesNum !== 1 ? 's' : ''} × ₹{rateNum}/bale
                </div>
                {payTo && (
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 6, fontWeight: 500 }}>
                    Pay to: {payTo}
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

// ── main dashboard ─────────────────────────────────────────────────────────────

const CharityCheque = ({ onCmd }) => {
  const [showForm,     setShowForm]     = React.useState(false);
  const [extraRecords, setExtraRecords] = React.useState([]);
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [search,       setSearch]       = React.useState('');
  const [page,         setPage]         = React.useState(1);
  const [pageSize,     setPageSize]     = React.useState(10);
  const [visibleCols,  setVisibleCols]  = React.useState(
    () => new Set(_CHEQUE_COLS.filter(c => c.defaultOn).map(c => c.field))
  );
  const vis = (f) => visibleCols.has(f);

  React.useEffect(() => { setPage(1); }, [search, filterStatus]);

  if (showForm) {
    return (
      <_ChequeForm
        onClose={() => setShowForm(false)}
        onSave={(rec) => {
          setExtraRecords(prev => [rec, ...prev]);
          setShowForm(false);
        }}
      />
    );
  }

  const allCheques = [...extraRecords, ...CHARITY_CHEQUES];

  // KPIs
  const totalAmount  = allCheques.reduce((s, c) => s + c.amount, 0);
  const pendingCount = allCheques.filter(c => c.status === 'pending').length;
  const clearedCount = allCheques.filter(c => c.status === 'cleared').length;

  const filtered = allCheques.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.no.toLowerCase().includes(q)     ||
      c.conf.toLowerCase().includes(q)   ||
      c.buyer.toLowerCase().includes(q)  ||
      c.seller.toLowerCase().includes(q) ||
      c.payTo.toLowerCase().includes(q)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="content-inner">

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Charity Cheques</h1>
          <div className="page-sub">
            {allCheques.length} cheque{allCheques.length !== 1 ? 's' : ''} · {fmtINR(totalAmount, { compact: true })} total
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Icon.Plus size={14} /> Issue cheque
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        <_KpiCard
          label="Total Cheques"
          value={allCheques.length}
          sub="all time"
        />
        <_KpiCard
          label="Total Amount"
          value={fmtINR(totalAmount, { compact: true })}
          sub={`${allCheques.length} cheques`}
          accent="var(--accent)"
        />
        <_KpiCard
          label="Pending"
          value={pendingCount}
          sub={pendingCount > 0 ? 'awaiting issue' : 'none pending'}
          subTone={pendingCount > 0 ? 'warn' : 'positive'}
          accent={pendingCount > 0 ? 'var(--warn)' : undefined}
        />
        <_KpiCard
          label="Cleared"
          value={clearedCount}
          sub={`${allCheques.filter(c => c.status === 'issued').length} issued`}
          subTone="positive"
          accent={clearedCount > 0 ? 'var(--positive)' : undefined}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="card-header">
          <div style={{ display:'flex', gap:4 }}>
            {[
              { id:'all',     label:'All'     },
              { id:'pending', label:'Pending', bg:'rgba(234,179,8,.13)',  color:'#92400e', bd:'rgba(234,179,8,.5)'  },
              { id:'issued',  label:'Issued',  bg:'rgba(59,130,246,.14)', color:'#1d4ed8', bd:'rgba(59,130,246,.5)' },
              { id:'cleared', label:'Cleared', bg:'rgba(34,197,94,.14)',  color:'#15803d', bd:'rgba(34,197,94,.5)'  },
            ].map(({ id, label, bg, color, bd }) => {
              const active = filterStatus === id;
              return (
                <button key={id} onClick={() => setFilterStatus(id)} style={{
                  padding:'4px 11px', borderRadius:999, cursor:'pointer', fontSize:12, fontWeight:500,
                  border:'1px solid', transition:'all .12s',
                  background:  active && bg  ? bg    : active ? 'var(--accent)' : 'transparent',
                  color:       active && color ? color : active ? '#fff'        : 'var(--text-2)',
                  borderColor: active && bd   ? bd    : active ? 'var(--accent)': 'var(--border)',
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
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cheques…"
                style={{ flex:1, border:'none', background:'transparent', padding:'5px 0', outline:'none', fontSize:12.5, color:'var(--text-1)', fontFamily:'inherit', minWidth:0 }} />
              {search && <button onClick={() => setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:'var(--text-3)', padding:2, flexShrink:0 }}><Icon.X size={11} /></button>}
            </label>
            <ViewMenu cols={_CHEQUE_COLS} visible={visibleCols} onChange={setVisibleCols} />
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              {vis('no')     && <th>Cheque No</th>}
              {vis('date')   && <th>Date</th>}
              {vis('conf')   && <th>Conf</th>}
              {vis('buyer')  && <th>Buyer</th>}
              {vis('seller') && <th>Seller</th>}
              {vis('bales')  && <th className="num">Bales</th>}
              {vis('rate')   && <th className="num">Rate/Bale</th>}
              {vis('amount') && <th className="num">Amount</th>}
              {vis('payTo')  && <th>Pay To</th>}
              {vis('status') && <th>Status</th>}
              <th style={{ width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', color: 'var(--text-3)', padding: '28px 0', fontSize: 13 }}>
                  No charity cheques found{search ? ` for "${search}"` : ''}.
                </td>
              </tr>
            ) : paginated.map(c => (
              <tr key={c.no}>
                {vis('no') && (
                  <td className="cell-mono cell-strong">{c.no}</td>
                )}
                {vis('date') && (
                  <td className="muted">{fmtDateShort(c.date)}</td>
                )}
                {vis('conf') && (
                  <td>
                    <span className="cell-mono" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{c.conf}</span>
                  </td>
                )}
                {vis('buyer') && (
                  <td style={{ fontSize: 12.5 }}>{c.buyer}</td>
                )}
                {vis('seller') && (
                  <td style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{c.seller}</td>
                )}
                {vis('bales') && (
                  <td className="num tnum" style={{ fontSize: 12.5 }}>{c.bales.toLocaleString('en-IN')}</td>
                )}
                {vis('rate') && (
                  <td className="num tnum" style={{ fontSize: 12.5 }}>₹{c.ratePerBale}</td>
                )}
                {vis('amount') && (
                  <td className="num tnum cell-strong">{fmtINR(c.amount, { compact: true })}</td>
                )}
                {vis('payTo') && (
                  <td style={{ fontSize: 12.5 }}>{c.payTo}</td>
                )}
                {vis('status') && (
                  <td><Badge tone={_chqStatusTone(c.status)}>{c.status}</Badge></td>
                )}
                <td>
                  <button className="btn btn-sm btn-ghost" style={{ padding: '2px 6px' }}>
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

window.CharityCheque = CharityCheque;
