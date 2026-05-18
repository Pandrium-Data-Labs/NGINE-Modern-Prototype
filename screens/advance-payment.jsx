// Advance Payment screen

const { Field, Input, Select, Badge, Section, fmtINR, fmtNum, ViewMenu } = window.UI;
const { BUYERS, ADVANCE_PAYMENTS, fmtDate, fmtDateShort } = window.NCData;

// ── helpers ───────────────────────────────────────────────────────────────────

const _statusTone = (s) => s === 'utilised' ? 'success' : s === 'partial' ? 'warn' : 'info';

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
  const [visibleCols,   setVisibleCols] = React.useState(
    () => new Set(_ADV_COLS.filter(c => c.defaultOn).map(c => c.field))
  );
  const vis = (f) => visibleCols.has(f);

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

  // Filters
  const filtered = allRecords.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.no.toLowerCase().includes(q)         ||
      r.buyer.toLowerCase().includes(q)      ||
      (r.ref   || '').toLowerCase().includes(q) ||
      (r.mode  || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="content-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">Advance Payments</h1>
          <div className="page-sub">{allRecords.length} advances · {fmtINR(totalBalance, { compact: true })} available balance</div>
        </div>
        <div className="page-actions">
          <ViewMenu cols={_ADV_COLS} visible={visibleCols} onChange={setVisibleCols} />
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

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>

        {/* Status pills */}
        <div style={{ display: 'flex', gap: 3 }}>
          {['all', 'open', 'partial', 'utilised'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: '4px 12px', borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 500,
              border: '1px solid', transition: 'all .12s',
              background:  filterStatus === s ? 'var(--accent)' : 'transparent',
              color:       filterStatus === s ? '#fff' : 'var(--text-2)',
              borderColor: filterStatus === s ? 'var(--accent)' : 'var(--border)',
            }}>
              {s === 'all' ? 'All' : s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <label style={{
          display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 220,
          border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-2)',
          padding: '0 10px', cursor: 'text', transition: 'border-color .12s',
        }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <Icon.Search size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by advance no, buyer, ref, mode…"
            style={{ flex: 1, border: 'none', background: 'transparent', padding: '6px 0', outline: 'none', fontSize: 13, color: 'var(--text-1)', fontFamily: 'inherit', minWidth: 0 }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-3)', padding: 2, flexShrink: 0 }}>
              <Icon.X size={12} />
            </button>
          )}
        </label>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
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
            ) : filtered.map(r => (
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
                {vis('status')   && <td><Badge tone={_statusTone(r.status)}>{r.status}</Badge></td>}
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
      </div>

    </div>
  );
};

window.AdvancePayment = AdvancePayment;
