// Cotton Payment + Confirmations list + Invoices list

const { Field, Input, Select, Checkbox, Badge, Section, Sparkline, fmtINR, fmtNum, ViewMenu } = window.UI;
const { CONFIRMATIONS, INVOICES, DELIVERIES, BUYERS, SELLERS, fmtDate, fmtDateShort } = window.NCData;
const { useTableControls, SortableHeader, FilterToolbar } = window.TableFilters;

// ---- Payment stat card ----
const _PStatCard = ({ label, value, sub, subTone, accent }) => (
  <div className="card" style={{ padding:0 }}>
    <div className="card-body" style={{ padding:'16px 18px 14px', display:'flex', flexDirection:'column', gap:4 }}>
      <div style={{ fontSize:11, color:'var(--text-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em' }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:700, letterSpacing:'-.02em', color:accent||'var(--text-1)', lineHeight:1.1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:subTone==='danger'?'var(--negative)':subTone==='warn'?'var(--warn)':subTone==='positive'?'var(--positive)':'var(--text-3)' }}>{sub}</div>}
    </div>
  </div>
);

// ---- Payment form (record a payment against invoices) ----
const _PaymentForm = ({ onClose, onCmd }) => {
  const [buyer, setBuyer]   = React.useState('Welspun India');
  const [seller, setSeller] = React.useState('');
  const [date, setDate]     = React.useState('2026-05-12');
  const [amount, setAmount] = React.useState(15000000);
  const [mode, setMode]     = React.useState('RTGS');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState({ 'INV-26-0892': 9740000 });

  // Build DL-id → conf lookup once (all lowercase keys for case-insensitive match)
  const dlToConf = React.useMemo(() => {
    const m = {};
    DELIVERIES.forEach(d => { m[d.id.toLowerCase()] = d.conf; });
    return m;
  }, []);

  const pendingInvoices = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return INVOICES.filter(i => {
      if (i.status === 'paid') return false;
      if (buyer  && i.buyer  !== buyer)  return false;
      if (seller && i.seller !== seller) return false;
      if (!q) return true;
      if (i.no.toLowerCase().includes(q))                   return true;
      if (i.conf.toLowerCase().includes(q))                 return true;
      if (fmtDate(i.date).toLowerCase().includes(q))        return true;
      if (fmtDateShort(i.date).toLowerCase().includes(q))   return true;
      if (i.buyer.toLowerCase().includes(q))                return true;
      if (i.seller.toLowerCase().includes(q))               return true;
      // DL number → trace back to conf → find invoice
      const matchConf = Object.entries(dlToConf).find(([k]) => k.includes(q))?.[1];
      if (matchConf && i.conf === matchConf) return true;
      return false;
    });
  }, [buyer, seller, search, dlToConf]);

  // Returns the DL id that caused a match (for the "via DL-xxx" badge)
  const dlMatchFor = (inv) => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    const entry = Object.entries(dlToConf).find(([k, v]) => k.includes(q) && v === inv.conf);
    return entry ? entry[0].toUpperCase() : null;
  };

  const totalAllotted = Object.values(selected).reduce((a, b) => a + b, 0);
  const remaining = amount - totalAllotted;

  const toggleInvoice = (no, bal) => {
    setSelected(s => {
      const next = { ...s };
      if (next[no] !== undefined) delete next[no];
      else next[no] = Math.min(bal, Math.max(0, amount - Object.values(s).reduce((a, b) => a + b, 0)));
      return next;
    });
  };

  return (
    <div className="content-inner">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <button className="btn btn-sm btn-ghost" onClick={onClose}><Icon.ChevronLeft size={14} /> Back</button>
            <Badge tone="info">Draft payment</Badge>
          </div>
          <h1 className="page-title">Record cotton payment</h1>
          <div className="page-sub">Allot a payment against outstanding invoices for a buyer / seller pair.</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon.X size={14} /> Discard</button>
          <button className="btn btn-primary" disabled={remaining !== 0} onClick={() => onCmd('saved')}>
            <Icon.Check size={14} /> Post payment <span className="kbd-hint">F2</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 16 }}>
        <div className="card">
          <div className="card-body" style={{ padding: '8px 24px 16px' }}>
            <Section title="Header" desc="Pick the parties and the payment date.">
              <div className="form-grid">
                <Field label="Buyer" required>
                  <Select value={buyer} onChange={(e) => setBuyer(e.target.value)}>
                    <option value="">Select…</option>
                    {BUYERS.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </Select>
                </Field>
                <Field label="Seller" required>
                  <Select value={seller} onChange={(e) => setSeller(e.target.value)}>
                    <option value="">Select…</option>
                    {SELLERS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </Select>
                </Field>
                <Field label="Date" required>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </Field>
                <Field label="Payment mode">
                  <Select value={mode} onChange={(e) => setMode(e.target.value)}>
                    <option>RTGS</option><option>NEFT</option><option>DD</option><option>Cheque</option><option>Cash</option>
                  </Select>
                </Field>
                <Field label="Amount" required hint="Will be allotted across the invoices below">
                  <div className="input-group">
                    <span className="input-prefix">₹</span>
                    <Input type="number" value={amount} onChange={(e) => setAmount(parseInt(e.target.value || 0))} className="input tnum" />
                  </div>
                </Field>
                <Field label="Reference / UTR"><Input placeholder="HDFC25051200842311" className="cell-mono" /></Field>
                <Field label="Narration" span={2}>
                  <Input placeholder="Part payment toward INV-26-0892 (Patel Ginning, 350 bales)" />
                </Field>
              </div>
            </Section>

            <Section title="Allotment" desc="Search by DL no, sale confirmation, invoice no, date, buyer or seller — then click rows to select.">
              {/* Search bar */}
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <Icon.Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by DL no, sale confirmation, invoice no, date, buyer or seller…"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    paddingLeft: 30, paddingRight: search ? 28 : 10, paddingTop: 7, paddingBottom: 7,
                    border: '1px solid var(--border)', borderRadius: 6,
                    background: 'var(--bg-2)', color: 'var(--text-1)',
                    fontSize: 13, outline: 'none', fontFamily: 'inherit', transition: 'border-color .12s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                {search && (
                  <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', padding: 2 }}>
                    <Icon.X size={12} />
                  </button>
                )}
              </div>

              <table className="tbl" style={{ marginLeft: -10, marginRight: -10, width: 'calc(100% + 20px)' }}>
                <thead>
                  <tr>
                    <th style={{ width: 36 }}></th>
                    <th>Invoice</th>
                    <th>Date</th>
                    <th>Conf / DL</th>
                    <th>Buyer</th>
                    <th>Seller</th>
                    <th className="num">Balance</th>
                    <th className="num">Allot</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInvoices.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-3)', padding: '20px 0', fontSize: 13 }}>
                      No matching invoices{search ? ` for "${search}"` : ''}.
                    </td></tr>
                  ) : pendingInvoices.map(inv => {
                    const isSel = selected[inv.no] !== undefined;
                    const dlMatch = dlMatchFor(inv);
                    return (
                      <tr key={inv.no} className={isSel ? 'selected' : ''} onClick={() => toggleInvoice(inv.no, inv.balance)}>
                        <td><Checkbox checked={isSel} onChange={() => toggleInvoice(inv.no, inv.balance)} /></td>
                        <td className="cell-mono cell-strong">{inv.no}</td>
                        <td className="muted">{fmtDateShort(inv.date)}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <span className="cell-mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>{inv.conf}</span>
                            {dlMatch && <span style={{ fontSize: 10.5, color: 'var(--accent)', fontWeight: 600 }}>via {dlMatch}</span>}
                          </div>
                        </td>
                        <td style={{ fontSize: 12.5 }}>{inv.buyer}</td>
                        <td style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{inv.seller}</td>
                        <td className="num tnum cell-strong">{fmtINR(inv.balance, { compact: true })}</td>
                        <td className="num tnum" style={{ color: isSel ? 'var(--accent)' : 'var(--text-3)', fontWeight: isSel ? 600 : 400 }}>
                          {isSel ? fmtINR(selected[inv.no], { compact: true }) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Section>
          </div>
        </div>

        <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 16 }}>
          <div className="card-header">
            <div className="card-title">Allotment summary</div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', gap: 8 }}>
              <span className="muted">Payment</span>
              <span className="tnum strong">{fmtINR(amount, { compact: true })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', gap: 8 }}>
              <span className="muted">Allotted</span>
              <span className="tnum strong">{fmtINR(totalAllotted, { compact: true })}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', alignItems: 'center', gap: 8 }}>
              <span className="strong">Remaining</span>
              <span className="tnum" style={{ fontSize: 18, fontWeight: 600, color: remaining === 0 ? 'var(--positive)' : remaining < 0 ? 'var(--negative)' : 'var(--warn)' }}>
                {fmtINR(remaining, { compact: true })}
              </span>
            </div>
            {remaining > 0 && <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>Will be parked as advance against this buyer.</div>}
            {remaining < 0 && <div style={{ fontSize: 11.5, marginTop: 4, color: 'var(--negative)' }}>Allotment exceeds payment by {fmtINR(-remaining, { compact: true })}.</div>}
            {remaining === 0 && <div style={{ fontSize: 11.5, marginTop: 4, color: 'var(--positive)' }}><Icon.Check size={11} /> Fully allotted</div>}

            <div className="divider" />

            <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 500, marginBottom: 8 }}>{buyer || 'Buyer'} balance</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div className="tnum strong" style={{ fontSize: 16 }}>{fmtINR(940000, { compact: true })}</div>
                <div className="muted" style={{ fontSize: 11 }}>2 invoices outstanding</div>
              </div>
              <div style={{ color: 'var(--accent)' }}>
                <Sparkline data={[1820,1750,1680,1640,1580,1500,1420,1380,1320,1240,1180,1100,1040,940]} width={90} height={28} dot={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const _INV_REG_COLS = [
  { field:'no',      label:'Invoice',  defaultOn:true  },
  { field:'date',    label:'Date',     defaultOn:true  },
  { field:'conf',    label:'Conf',     defaultOn:true  },
  { field:'buyer',   label:'Buyer',    defaultOn:true  },
  { field:'seller',  label:'Seller',   defaultOn:false },
  { field:'amount',  label:'Amount',   defaultOn:true  },
  { field:'balance', label:'Balance',  defaultOn:true  },
  { field:'status',  label:'Status',   defaultOn:true  },
];

// ---- Payment dashboard (entry point) ----
const CottonPayment = ({ onClose, onCmd }) => {
  const [showForm, setShowForm] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [visibleCols, setVisibleCols] = React.useState(
    () => new Set(_INV_REG_COLS.filter(c => c.defaultOn).map(c => c.field))
  );
  const vis = (f) => visibleCols.has(f);

  if (showForm) {
    return <_PaymentForm onClose={() => setShowForm(false)} onCmd={onCmd} />;
  }

  const totalBilled      = INVOICES.reduce((s, i) => s + i.amount, 0);
  const totalOutstanding = INVOICES.reduce((s, i) => s + i.balance, 0);
  const totalReceived    = totalBilled - totalOutstanding;
  const collectionRate   = totalBilled > 0 ? Math.round((totalReceived / totalBilled) * 100) : 0;

  const countPaid    = INVOICES.filter(i => i.status === 'paid').length;
  const countPartial = INVOICES.filter(i => i.status === 'partial').length;
  const countUnpaid  = INVOICES.filter(i => i.status === 'unpaid').length;

  const buyerOut = {};
  INVOICES.forEach(i => { if (i.balance > 0) buyerOut[i.buyer] = (buyerOut[i.buyer] || 0) + i.balance; });
  const buyerOutArr = Object.entries(buyerOut).sort((a, b) => b[1] - a[1]);
  const maxBuyerOut  = buyerOutArr.length > 0 ? buyerOutArr[0][1] : 1;

  const filtered = filterStatus === 'all' ? INVOICES : INVOICES.filter(i => i.status === filterStatus);

  return (
    <div className="content-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <div className="page-sub">{INVOICES.length} invoices · ₹{fmtNum(totalOutstanding / 100000, { dp: 1 })} L outstanding</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Icon.Plus size={14} /> Record payment
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        <_PStatCard label="Total Invoiced"   value={fmtINR(totalBilled,      { compact: true })} sub={`${INVOICES.length} invoices`} />
        <_PStatCard label="Amount Received"  value={fmtINR(totalReceived,    { compact: true })} sub={`${countPaid} paid in full`}        subTone="positive" accent="var(--positive)" />
        <_PStatCard label="Outstanding"      value={fmtINR(totalOutstanding, { compact: true })} sub={`${countUnpaid + countPartial} invoices pending`} subTone="danger" accent="var(--negative)" />
        <_PStatCard label="Collection Rate"  value={`${collectionRate}%`}                        sub={collectionRate >= 70 ? 'On track' : 'Below target'} subTone={collectionRate >= 70 ? 'positive' : 'warn'} />
      </div>

      {/* Body: invoice table + sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 270px', gap: 14 }}>

        {/* Invoice register */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px 8px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>Invoice register</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['all', 'paid', 'partial', 'unpaid'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{
                  padding: '3px 10px', borderRadius: 999, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  border: '1px solid', transition: 'all .12s',
                  background:    filterStatus === s ? 'var(--accent)' : 'transparent',
                  color:         filterStatus === s ? '#fff' : 'var(--text-2)',
                  borderColor:   filterStatus === s ? 'var(--accent)' : 'var(--border)',
                }}>
                  {s === 'all' ? 'All' : s[0].toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <ViewMenu cols={_INV_REG_COLS} visible={visibleCols} onChange={setVisibleCols} />
          </div>
          <table className="tbl">
            <thead>
              <tr>
                {vis('no')      && <th>Invoice</th>}
                {vis('date')    && <th>Date</th>}
                {vis('conf')    && <th>Conf</th>}
                {vis('buyer')   && <th>Buyer</th>}
                {vis('seller')  && <th>Seller</th>}
                {vis('amount')  && <th className="num">Amount</th>}
                {vis('balance') && <th className="num">Balance</th>}
                {vis('status')  && <th>Status</th>}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.no}>
                  {vis('no')      && <td className="cell-mono cell-strong">{inv.no}</td>}
                  {vis('date')    && <td className="muted">{fmtDateShort(inv.date)}</td>}
                  {vis('conf')    && <td className="cell-mono muted">{inv.conf}</td>}
                  {vis('buyer')   && <td>{inv.buyer}</td>}
                  {vis('seller')  && <td style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{inv.seller}</td>}
                  {vis('amount')  && <td className="num tnum">{fmtINR(inv.amount, { compact: true })}</td>}
                  {vis('balance') && <td className="num tnum cell-strong">{inv.balance ? fmtINR(inv.balance, { compact: true }) : '—'}</td>}
                  {vis('status')  && <td><Badge tone={inv.status === 'paid' ? 'success' : inv.status === 'partial' ? 'warn' : 'danger'}>{inv.status}</Badge></td>}
                  <td style={{ width: 80, textAlign: 'right' }}>
                    {inv.status !== 'paid' && (
                      <button className="btn btn-sm" onClick={() => setShowForm(true)} style={{ fontSize: 11 }}>Record</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Status breakdown */}
          <div className="card">
            <div className="card-header"><div className="card-title">Status breakdown</div></div>
            <div className="card-body" style={{ padding: '4px 18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Paid',    count: countPaid,    color: 'var(--positive)' },
                { label: 'Partial', count: countPartial, color: 'var(--warn)' },
                { label: 'Unpaid',  count: countUnpaid,  color: 'var(--negative)' },
              ].map(row => (
                <div key={row.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12.5, color: 'var(--text-2)', fontWeight: 500 }}>{row.label}</span>
                    <span style={{ fontSize: 12.5, color: row.color, fontWeight: 600 }}>{row.count} / {INVOICES.length}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(row.count / INVOICES.length) * 100}%`, borderRadius: 999, background: row.color, transition: 'width .3s' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buyer outstanding */}
          <div className="card">
            <div className="card-header"><div className="card-title">Buyer outstanding</div></div>
            <div className="card-body" style={{ padding: '4px 18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {buyerOutArr.length === 0 ? (
                <div style={{ fontSize: 12.5, color: 'var(--text-3)', textAlign: 'center', padding: '12px 0' }}>All invoices settled</div>
              ) : buyerOutArr.map(([buyer, amt]) => (
                <div key={buyer}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{buyer}</span>
                    <span style={{ fontSize: 12, color: 'var(--negative)', fontWeight: 600 }}>{fmtINR(amt, { compact: true })}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(amt / maxBuyerOut) * 100}%`, borderRadius: 999, background: 'var(--negative)', transition: 'width .3s' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CONF_COLS = [
  { field:'no',      label:'Conf No.',  type:'text'   },
  { field:'date',    label:'Date',      type:'date'   },
  { field:'buyer',   label:'Buyer',     type:'text'   },
  { field:'seller',  label:'Seller',    type:'text'   },
  { field:'variety', label:'Variety',   type:'text'   },
  { field:'station', label:'Station',   type:'text'   },
  { field:'balesMin',label:'Bales',     type:'number' },
  { field:'status',  label:'Status',    type:'select', options:['open','closed'] },
  { field:'payment', label:'Payment',   type:'select', options:['pending','partial','paid'] },
];

// ----- Tag filter helpers -----
const getBadge = (c) =>
  c.payment === 'paid' ? 'paid' : c.payment === 'partial' ? 'partial' : c.status === 'closed' ? 'closed' : 'open';

// ----- Chip filter component -----
const TYPE_META = {
  status:  { prefix: 'Status',  bg: 'rgba(99,102,241,.13)',  color: 'var(--accent)' },
  variety: { prefix: 'Variety', bg: 'rgba(34,197,94,.12)',   color: '#15803d' },
  buyer:   { prefix: 'Buyer',   bg: 'rgba(59,130,246,.12)',  color: '#2563eb' },
  seller:  { prefix: 'Seller',  bg: 'rgba(168,85,247,.12)',  color: '#9333ea' },
  tag:     { prefix: 'Tag',     bg: 'rgba(234,179,8,.15)',   color: '#a16207' },
  text:    { prefix: '',        bg: 'var(--surface-2)',       color: 'var(--text-2)' },
};

const ChipFilter = ({ chips, onAdd, onRemove, uniqueBuyers, uniqueSellers, uniqueVarieties, uniqueTags }) => {
  const [query, setQuery]   = React.useState('');
  const [open, setOpen]     = React.useState(false);
  const [cursor, setCursor] = React.useState(-1);
  const inputRef = React.useRef(null);

  const q = query.toLowerCase().trim();
  const suggestions = q ? [
    ...['open','partial','paid','closed']
      .filter(s => s.includes(q) && !chips.find(c => c.type==='status' && c.value===s))
      .map(s => ({ type:'status', value:s, label: s[0].toUpperCase()+s.slice(1) })),
    ...uniqueVarieties
      .filter(v => v.toLowerCase().includes(q) && !chips.find(c => c.type==='variety' && c.value===v))
      .map(v => ({ type:'variety', value:v, label:v })),
    ...uniqueBuyers
      .filter(b => b.toLowerCase().includes(q) && !chips.find(c => c.type==='buyer' && c.value===b))
      .map(b => ({ type:'buyer', value:b, label:b })),
    ...uniqueSellers
      .filter(s => s.toLowerCase().includes(q) && !chips.find(c => c.type==='seller' && c.value===s))
      .map(s => ({ type:'seller', value:s, label:s })),
    ...(uniqueTags || [])
      .filter(t => t.toLowerCase().includes(q) && !chips.find(c => c.type==='tag' && c.value===t))
      .map(t => ({ type:'tag', value:t, label:t })),
  ] : [];

  React.useEffect(() => { setCursor(-1); }, [query]);

  const commit = (chip) => {
    onAdd({ ...chip, id: `${chip.type}-${chip.value}-${Date.now()}` });
    setQuery('');
    setCursor(-1);
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c+1, suggestions.length-1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c-1, 0)); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (cursor >= 0 && suggestions[cursor]) commit(suggestions[cursor]);
      else if (q) commit({ type:'text', value:q, label:q });
    }
    if (e.key === 'Backspace' && !query && chips.length > 0) onRemove(chips[chips.length-1].id);
    if (e.key === 'Escape') { setQuery(''); setOpen(false); }
  };

  return (
    <div
      style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:4, border:'1px solid var(--border)', borderRadius:6, padding:'3px 8px', background:'var(--bg-2)', minHeight:30, position:'relative', flex:1, maxWidth:480, cursor:'text' }}
      onClick={() => inputRef.current?.focus()}
    >
      <Icon.Search size={13} style={{ color:'var(--text-3)', flexShrink:0, alignSelf:'center' }} />
      {chips.map(chip => {
        const m = TYPE_META[chip.type] || TYPE_META.text;
        return (
          <span key={chip.id} style={{ display:'inline-flex', alignItems:'center', gap:3, borderRadius:999, padding:'1px 5px 1px 8px', fontSize:12, fontWeight:500, background:m.bg, color:m.color, lineHeight:1.6, flexShrink:0 }}>
            {m.prefix && <span style={{ fontSize:10, opacity:.65, textTransform:'uppercase', letterSpacing:'.04em', marginRight:2 }}>{m.prefix}:</span>}
            {chip.label}
            <button onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onRemove(chip.id); }} style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:'inherit', opacity:.55, lineHeight:1, display:'inline-flex', marginLeft:2 }}><Icon.X size={10}/></button>
          </span>
        );
      })}
      <input
        ref={inputRef}
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={chips.length ? '' : 'Filter by buyer, seller, variety, status…'}
        style={{ border:'none', background:'transparent', outline:'none', fontSize:12.5, color:'var(--text-1)', minWidth:100, flex:1 }}
      />
      {open && suggestions.length > 0 && (
        <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, boxShadow:'0 4px 16px rgba(0,0,0,.10)', zIndex:50, overflow:'hidden' }}>
          {suggestions.map((s, i) => {
            const m = TYPE_META[s.type] || TYPE_META.text;
            return (
              <div key={i} onMouseDown={() => commit(s)}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 12px', cursor:'pointer', background: cursor===i ? 'var(--surface-2)' : 'transparent' }}
                onMouseEnter={() => setCursor(i)}>
                <span style={{ fontSize:10, color:m.color, background:m.bg, borderRadius:999, padding:'1px 6px', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em', minWidth:48, textAlign:'center' }}>{m.prefix || 'Text'}</span>
                <span style={{ fontSize:13, color:'var(--text-1)' }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ALL_CONF_VIEW_COLS = [
  { field:'no',      label:'Conf No',  defaultOn:true  },
  { field:'date',    label:'Date',     defaultOn:true  },
  { field:'buyer',   label:'Buyer',    defaultOn:true  },
  { field:'seller',  label:'Seller',   defaultOn:true  },
  { field:'variety', label:'Variety',  defaultOn:false },
  { field:'station', label:'Station',  defaultOn:false },
  { field:'balesMin',label:'Bales',    defaultOn:false },
  { field:'tags',    label:'Tags',     defaultOn:true  },
  { field:'payment', label:'Payment',  defaultOn:false },
  { field:'status',  label:'Status',   defaultOn:true  },
];

// ----- Confirmations list -----
const ConfirmationsList = ({ onOpen, onCmd, extraConfirmations = [] }) => {
  const [tab, setTab]               = React.useState('all');
  const [deleteMode, setDeleteMode] = React.useState(false);
  const [selected, setSelected]     = React.useState([]);
  const [deletedNos, setDeletedNos] = React.useState([]);
  const ctrl = useTableControls(CONF_COLS);
  const [visibleCols, setVisibleCols] = React.useState(
    () => new Set(ALL_CONF_VIEW_COLS.filter(c => c.defaultOn).map(c => c.field))
  );
  const [viewOpen,   setViewOpen]   = React.useState(false);
  const [viewSearch, setViewSearch] = React.useState('');
  const vis = (field) => visibleCols.has(field);

  const extraNos = new Set(extraConfirmations.map(c => c.no));
  const allConfs = [...extraConfirmations, ...CONFIRMATIONS.filter(c => !extraNos.has(c.no))].filter(c => !deletedNos.includes(c.no));

  const tabCounts = {
    all:      allConfs.length,
    open:     allConfs.filter(c => c.status === 'open').length,
    closed:   allConfs.filter(c => c.status === 'closed').length,
    awaiting: allConfs.filter(c => c.payment === 'pending').length,
  };

  const tabFiltered = allConfs.filter(c => {
    if (tab === 'open'     && c.status  !== 'open')    return false;
    if (tab === 'closed'   && c.status  !== 'closed')  return false;
    if (tab === 'awaiting' && c.payment !== 'pending') return false;
    return true;
  });
  const filtered = ctrl.sortData(ctrl.filterData(tabFiltered));

  const clearAll = () => { ctrl.clearAll(); setTab('all'); };

  // Delete handlers
  const allFilteredSelected = filtered.length > 0 && filtered.every(c => selected.includes(c.no));
  const toggleRow = (no, e) => { e.stopPropagation(); setSelected(s => s.includes(no) ? s.filter(x=>x!==no) : [...s, no]); };
  const toggleAll = () => { if (allFilteredSelected) setSelected(s => s.filter(no => !filtered.find(c=>c.no===no))); else setSelected(s => [...new Set([...s, ...filtered.map(c=>c.no)])]); };
  const exitDeleteMode = () => { setDeleteMode(false); setSelected([]); };
  const confirmDelete  = () => { setDeletedNos(d => [...d, ...selected]); exitDeleteMode(); };

  // Export state
  const [exportMode, setExportMode] = React.useState(false);
  const [exportSel,  setExportSel]  = React.useState([]);
  const [fmtOpen,    setFmtOpen]    = React.useState(false);

  const exitExportMode = () => { setExportMode(false); setExportSel([]); setFmtOpen(false); };
  const toggleExportRow = (no) => setExportSel(s => s.includes(no) ? s.filter(x=>x!==no) : [...s, no]);
  const allExportSelected = filtered.length > 0 && filtered.every(c => exportSel.includes(c.no));
  const toggleExportAll = () => {
    if (allExportSelected) setExportSel(s => s.filter(no => !filtered.find(c=>c.no===no)));
    else setExportSel(s => [...new Set([...s, ...filtered.map(c=>c.no)])]);
  };

  // Download helper
  const _dl = (content, filename, mime) => {
    const blob = new Blob(['﻿', content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const doExport = (fmt) => {
    const rows = filtered.filter(c => exportSel.includes(c.no));
    const cols = ALL_CONF_VIEW_COLS;
    const cellVal = (row, col) => {
      if (col.field === 'date')  return row.date instanceof Date ? row.date.toLocaleDateString('en-IN') : (row.date || '');
      if (col.field === 'tags')  return (row.tags || []).join(', ');
      return String(row[col.field] ?? '');
    };

    if (fmt === 'csv') {
      const hdr  = cols.map(c => `"${c.label}"`).join(',');
      const body = rows.map(r => cols.map(c => `"${cellVal(r,c).replace(/"/g,'""')}"`).join(',')).join('\n');
      _dl(`${hdr}\n${body}`, 'sale-confirmations.csv', 'text/csv;charset=utf-8');
    }

    if (fmt === 'excel') {
      const tbl  = `<table><tr>${cols.map(c=>`<th>${c.label}</th>`).join('')}</tr>${rows.map(r=>`<tr>${cols.map(c=>`<td>${cellVal(r,c)}</td>`).join('')}</tr>`).join('')}</table>`;
      const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/></head><body>${tbl}</body></html>`;
      _dl(html, 'sale-confirmations.xls', 'application/vnd.ms-excel');
    }

    if (fmt === 'word') {
      const tbl  = `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:11pt"><tr style="background:#f3f4f6">${cols.map(c=>`<th style="font-weight:600;padding:6px 10px">${c.label}</th>`).join('')}</tr>${rows.map(r=>`<tr>${cols.map(c=>`<td style="padding:5px 10px">${cellVal(r,c)}</td>`).join('')}</tr>`).join('')}</table>`;
      const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"/><title>Sale Confirmations</title></head><body><h2 style="font-family:sans-serif;margin-bottom:14px">Sale Confirmations</h2>${tbl}</body></html>`;
      _dl(html, 'sale-confirmations.doc', 'application/msword');
    }

    if (fmt === 'pdf') {
      const tbl = `<table><tr>${cols.map(c=>`<th>${c.label}</th>`).join('')}</tr>${rows.map(r=>`<tr>${cols.map(c=>`<td>${cellVal(r,c)}</td>`).join('')}</tr>`).join('')}</table>`;
      const w   = window.open('', '_blank');
      w.document.write(`<!DOCTYPE html><html><head><title>Sale Confirmations</title><style>*{box-sizing:border-box}body{font-family:sans-serif;font-size:11px;padding:24px;color:#111}h2{margin:0 0 14px;font-size:15px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:5px 8px;text-align:left;vertical-align:top}th{background:#f3f4f6;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:.04em}tr:nth-child(even){background:#fafafa}@media print{@page{margin:1.2cm}button{display:none}}</style></head><body><h2>Sale Confirmations — ${rows.length} record${rows.length!==1?'s':''}</h2>${tbl}<script>window.onload=function(){window.print()}<\/script></body></html>`);
      w.document.close();
    }

    exitExportMode();
  };

  const TAB_FILTERS = [
    { id: 'all',      label: 'All',              count: tabCounts.all },
    { id: 'open',     label: 'Open',             count: tabCounts.open },
    { id: 'closed',   label: 'Closed',           count: tabCounts.closed },
    { id: 'awaiting', label: 'Awaiting payment', count: tabCounts.awaiting },
  ];

  return (
    <div className="content-inner wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sale confirmations</h1>
          <div className="page-sub">FY 2025–26 · {allConfs.length} active · ₹81.4 Cr in flight</div>
        </div>
        <div className="page-actions">
          {/* Export controls */}
          {!exportMode
            ? <button className="btn" onClick={() => { setExportMode(true); setDeleteMode(false); setSelected([]); }}><Icon.Download size={14} /> Export</button>
            : <>
                <button className="btn btn-primary" disabled={exportSel.length === 0} onClick={() => setFmtOpen(true)}>
                  <Icon.Download size={14} /> Export{exportSel.length > 0 ? ` ${exportSel.length}` : ''}
                </button>
                <button className="btn" onClick={exitExportMode}><Icon.X size={14} /> Cancel</button>
              </>
          }
          {/* Delete controls — hidden in export mode */}
          {!exportMode && (!deleteMode
            ? <button className="btn" style={{ color:'var(--negative)' }} onClick={() => setDeleteMode(true)}><Icon.Trash size={14} /> Delete</button>
            : <>
                <button className="btn" style={{ color:'var(--negative)', borderColor: selected.length ? 'var(--negative)' : undefined }} disabled={selected.length===0} onClick={confirmDelete}><Icon.Trash size={14} /> Delete{selected.length > 0 ? ` ${selected.length}` : ''}</button>
                <button className="btn" onClick={exitDeleteMode}><Icon.X size={14} /> Cancel</button>
              </>
          )}
          {!exportMode && <button className="btn btn-primary" onClick={() => onOpen('confirmation')}><Icon.Plus size={14} /> New confirmation</button>}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', gap:4, alignItems:'center', flexShrink:0 }}>
            {TAB_FILTERS.map(f => (
              <button key={f.id} className={`btn btn-sm ${tab===f.id ? '' : 'btn-ghost'}`} onClick={() => setTab(f.id)}>
                {f.label}
                <span style={{ marginLeft:5, fontSize:11, fontWeight:600, color: tab===f.id ? 'inherit' : 'var(--text-3)' }}>{f.count}</span>
              </button>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:'auto', flexShrink:0 }}>
            <button className="btn btn-sm btn-ghost" style={{ flexShrink:0 }}><Icon.Calendar size={13} /> May 2026</button>
            <div style={{ position:'relative' }}>
              <button
                className={`btn btn-sm ${viewOpen ? '' : 'btn-ghost'}`}
                style={{ gap:5 }}
                onClick={() => { setViewOpen(o => !o); setViewSearch(''); }}>
                <Icon.Eye size={13} /> View
              </button>
              {viewOpen && (
                <>
                  <div style={{ position:'fixed', inset:0, zIndex:299 }} onClick={() => setViewOpen(false)} />
                  <div style={{ position:'absolute', top:'calc(100% + 6px)', right:0, zIndex:300, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, boxShadow:'0 4px 6px rgba(0,0,0,.06),0 12px 32px rgba(0,0,0,.18)', width:216, padding:'8px 0' }}>
                    <div style={{ padding:'2px 8px 6px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, border:'1px solid var(--border)', borderRadius:6, padding:'5px 8px', background:'var(--surface-2)' }}>
                        <Icon.Search size={12} style={{ color:'var(--text-3)', flexShrink:0 }} />
                        <input
                          autoFocus
                          type="text"
                          value={viewSearch}
                          onChange={e => setViewSearch(e.target.value)}
                          placeholder="Search columns..."
                          style={{ border:'none', background:'transparent', outline:'none', fontSize:12.5, color:'var(--text-1)', flex:1, minWidth:0, fontFamily:'inherit' }}
                        />
                      </div>
                    </div>
                    {ALL_CONF_VIEW_COLS
                      .filter(c => !viewSearch || c.label.toLowerCase().includes(viewSearch.toLowerCase()))
                      .map(col => {
                        const on = visibleCols.has(col.field);
                        return (
                          <button
                            key={col.field}
                            onClick={() => setVisibleCols(prev => {
                              const next = new Set(prev);
                              if (next.has(col.field)) next.delete(col.field); else next.add(col.field);
                              return next;
                            })}
                            className="view-col-row"
                            style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'7px 12px', background:'none', border:'none', cursor:'pointer', fontSize:13, color: on ? 'var(--text-1)' : 'var(--text-3)', textAlign:'left', fontFamily:'inherit', transition:'background .1s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <span style={{ fontWeight: on ? 500 : 400 }}>{col.label}</span>
                            {on && <Icon.Check size={13} style={{ color:'var(--text-2)', flexShrink:0 }} />}
                          </button>
                        );
                      })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding:'0 16px 4px' }}>
          <FilterToolbar ctrl={ctrl} columnDefs={CONF_COLS} totalCount={tabFiltered.length} filteredCount={filtered.length} />
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width:36, visibility: (deleteMode || exportMode) ? 'visible' : 'hidden' }}>
                <input type="checkbox"
                  checked={deleteMode ? allFilteredSelected : allExportSelected}
                  onChange={deleteMode ? toggleAll : toggleExportAll}
                  style={{ cursor:'pointer', width:14, height:14, accentColor:'var(--accent)' }} />
              </th>
              {vis('no')      && <SortableHeader field="no"      label="Conf No"  ctrl={ctrl} style={{ width:130 }} />}
              {vis('date')    && <SortableHeader field="date"    label="Date"     ctrl={ctrl} />}
              {vis('buyer')   && <SortableHeader field="buyer"   label="Buyer"    ctrl={ctrl} />}
              {vis('seller')  && <SortableHeader field="seller"  label="Seller"   ctrl={ctrl} />}
              {vis('variety') && <SortableHeader field="variety" label="Variety"  ctrl={ctrl} />}
              {vis('station') && <SortableHeader field="station" label="Station"  ctrl={ctrl} />}
              {vis('balesMin')&& <SortableHeader field="balesMin"label="Bales"    ctrl={ctrl} className="num" align="right" />}
              {vis('tags')    && <th>Tags</th>}
              {vis('payment') && <SortableHeader field="payment" label="Payment"  ctrl={ctrl} />}
              {vis('status')  && <SortableHeader field="status"  label="Status"   ctrl={ctrl} />}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const isSel    = selected.includes(c.no);
              const isExpSel = exportSel.includes(c.no);
              const isActive = isSel || isExpSel;
              return (
                <tr key={c.no} className={isActive ? 'selected' : ''}
                  onClick={() => {
                    if (deleteMode)  return toggleRow(c.no, { stopPropagation:()=>{} });
                    if (exportMode)  return toggleExportRow(c.no);
                    onOpen('confirmation', c);
                  }}>
                  <td style={{ visibility: (deleteMode || exportMode) ? 'visible' : 'hidden' }}
                      onClick={e => { e.stopPropagation(); deleteMode ? toggleRow(c.no, e) : toggleExportRow(c.no); }}>
                    <input type="checkbox"
                      checked={deleteMode ? isSel : isExpSel}
                      onChange={() => {}}
                      style={{ cursor:(deleteMode||exportMode) ? 'pointer':'default', width:14, height:14, accentColor:'var(--accent)' }} />
                  </td>
                  {vis('no')      && <td className="cell-mono cell-strong">{c.no}</td>}
                  {vis('date')    && <td className="muted">{fmtDateShort(c.date)}</td>}
                  {vis('buyer')   && <td className="cell-strong">{c.buyer}</td>}
                  {vis('seller')  && <td>{c.seller}</td>}
                  {vis('variety') && <td className="muted">{c.variety || '—'}</td>}
                  {vis('station') && <td className="muted">{c.station || '—'}</td>}
                  {vis('balesMin')&& <td className="num tnum">{c.balesMin ?? '—'}</td>}
                  {vis('tags')    && (
                    <td>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
                        {(c.tags || []).map(tag => {
                          const { bg, color } = window.tagColor(tag);
                          return (
                            <span key={tag} style={{ display:'inline-flex', alignItems:'center', borderRadius:999, padding:'1px 7px', fontSize:11, fontWeight:500, background:bg, color }}>
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  )}
                  {vis('payment') && (
                    <td>
                      <Badge tone={c.payment==='paid' ? 'success' : c.payment==='partial' ? 'warn' : 'info'}>
                        {c.payment==='paid' ? 'Paid' : c.payment==='partial' ? 'Partial' : 'Pending'}
                      </Badge>
                    </td>
                  )}
                  {vis('status')  && (
                    <td>
                      <Badge tone={c.payment==='paid' ? 'success' : c.payment==='partial' ? 'warn' : c.status==='closed' ? '' : 'info'}>
                        {c.payment==='paid' ? 'Paid' : c.payment==='partial' ? 'Partial' : c.status==='closed' ? 'Closed' : 'Open'}
                      </Badge>
                    </td>
                  )}
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={1 + visibleCols.size} style={{ textAlign:'center', padding:'40px 32px' }}>
                  <div style={{ color:'var(--text-3)', fontSize:13 }}>No confirmations match the selected filters.</div>
                  <button className="btn btn-sm" style={{ marginTop:10 }} onClick={clearAll}><Icon.X size={12} /> Clear filters</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---- Export format picker modal ---- */}
      {fmtOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'28px 28px 20px', width:500, maxWidth:'100%', boxShadow:'0 8px 48px rgba(0,0,0,.28)' }}>

            {/* header */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontWeight:700, fontSize:17, color:'var(--text-1)', marginBottom:4 }}>Export confirmations</div>
              <div style={{ fontSize:13, color:'var(--text-3)' }}>
                {exportSel.length} confirmation{exportSel.length !== 1 ? 's' : ''} selected · choose a format to download
              </div>
            </div>

            {/* format cards */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:22 }}>
              {[
                { fmt:'csv',   icon: Icon.FileText, accent:'#2563eb', label:'CSV',         desc:'Universal plain-text format.\nOpens in any spreadsheet app.' },
                { fmt:'excel', icon: Icon.FileText, accent:'#15803d', label:'Excel (.xls)', desc:'Microsoft Excel & Google Sheets\ncompatible spreadsheet.' },
                { fmt:'pdf',   icon: Icon.FileText, accent:'#dc2626', label:'PDF',          desc:'Print-ready document.\nUse browser "Save as PDF" option.' },
                { fmt:'word',  icon: Icon.FileText, accent:'#7c3aed', label:'Word (.doc)',   desc:'Microsoft Word & Google Docs\ncompatible document.' },
              ].map(opt => (
                <button
                  key={opt.fmt}
                  onClick={() => doExport(opt.fmt)}
                  style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:10, padding:'16px 18px', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:10, cursor:'pointer', textAlign:'left', transition:'border-color .15s,box-shadow .15s', fontFamily:'inherit' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=opt.accent; e.currentTarget.style.boxShadow=`0 0 0 3px ${opt.accent}22`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:`${opt.accent}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <opt.icon size={16} style={{ color:opt.accent }} />
                    </div>
                    <span style={{ fontWeight:700, fontSize:13.5, color:'var(--text-1)' }}>{opt.label}</span>
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-3)', lineHeight:1.6, whiteSpace:'pre-line' }}>{opt.desc}</div>
                </button>
              ))}
            </div>

            {/* footer */}
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button className="btn" onClick={() => setFmtOpen(false)}><Icon.X size={13} /> Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const _INV_LIST_COLS = [
  { field:'no',      label:'Invoice', defaultOn:true  },
  { field:'date',    label:'Date',    defaultOn:true  },
  { field:'conf',    label:'Conf',    defaultOn:true  },
  { field:'buyer',   label:'Buyer',   defaultOn:true  },
  { field:'seller',  label:'Seller',  defaultOn:false },
  { field:'amount',  label:'Amount',  defaultOn:true  },
  { field:'balance', label:'Balance', defaultOn:true  },
  { field:'status',  label:'Status',  defaultOn:true  },
];

// ----- Invoices list -----
const InvoicesList = ({ onCmd, data }) => {
  const invNo = data?.invNo;
  const [visibleCols, setVisibleCols] = React.useState(
    () => new Set(_INV_LIST_COLS.filter(c => c.defaultOn).map(c => c.field))
  );
  const vis = (f) => visibleCols.has(f);

  React.useEffect(() => {
    if (invNo) {
      const row = document.getElementById(`invoice-row-${invNo}`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        row.classList.add('highlight');
        setTimeout(() => row.classList.remove('highlight'), 2000);
      }
    }
  }, [invNo]);
  return (
    <div className="content-inner wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <div className="page-sub">{INVOICES.length} invoices · ₹3.21 Cr outstanding</div>
        </div>
        <div className="page-actions">
          <ViewMenu cols={_INV_LIST_COLS} visible={visibleCols} onChange={setVisibleCols} />
          <button className="btn btn-primary"><Icon.Plus size={14} /> New invoice</button>
        </div>
      </div>
      <div className="card">
        <table className="tbl">
          <thead>
            <tr>
              {vis('no')      && <th style={{ width: 140 }}>Invoice</th>}
              {vis('date')    && <th>Date</th>}
              {vis('conf')    && <th>Conf</th>}
              {vis('buyer')   && <th>Buyer</th>}
              {vis('seller')  && <th>Seller</th>}
              {vis('amount')  && <th className="num">Amount</th>}
              {vis('balance') && <th className="num">Balance</th>}
              {vis('status')  && <th>Status</th>}
            </tr>
          </thead>
          <tbody>
            {INVOICES.map(i => (
              <tr key={i.no} id={`invoice-row-${i.no}`}>
                {vis('no')      && <td className="cell-mono cell-strong">{i.no}</td>}
                {vis('date')    && <td className="muted">{fmtDateShort(i.date)}</td>}
                {vis('conf')    && <td className="cell-mono muted">{i.conf}</td>}
                {vis('buyer')   && <td className="cell-strong">{i.buyer}</td>}
                {vis('seller')  && <td>{i.seller}</td>}
                {vis('amount')  && <td className="num tnum">{fmtINR(i.amount, { compact: true })}</td>}
                {vis('balance') && <td className="num tnum cell-strong">{i.balance ? fmtINR(i.balance, { compact: true }) : '—'}</td>}
                {vis('status')  && <td><Badge tone={i.status === 'paid' ? 'success' : i.status === 'partial' ? 'warn' : 'danger'}>{i.status}</Badge></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

window.CottonPayment = CottonPayment;
window.ConfirmationsList = ConfirmationsList;
window.InvoicesList = InvoicesList;
