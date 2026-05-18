// GST Certificate Receipts screen

const { Field, Input, Select, Badge, Section, fmtINR, fmtNum, ViewMenu } = window.UI;
const { CONFIRMATIONS, INVOICES, BUYERS, SELLERS, GST_RECEIPTS, fmtDate, fmtDateShort } = window.NCData;

// ── column definitions ────────────────────────────────────────────────────────

const _GST_COLS = [
  { field: 'no',          label: 'Receipt No',   defaultOn: true  },
  { field: 'date',        label: 'Date',         defaultOn: true  },
  { field: 'conf',        label: 'Conf',         defaultOn: true  },
  { field: 'invoice',     label: 'Invoice',      defaultOn: true  },
  { field: 'buyer',       label: 'Buyer',        defaultOn: true  },
  { field: 'seller',      label: 'Seller',       defaultOn: false },
  { field: 'taxableAmt',  label: 'Taxable Amt',  defaultOn: true  },
  { field: 'gstRate',     label: 'GST %',        defaultOn: false },
  { field: 'certNo',      label: 'Cert No.',     defaultOn: true  },
  { field: 'status',      label: 'Status',       defaultOn: true  },
];

// ── helpers ───────────────────────────────────────────────────────────────────

const _statusTone = (s) => s === 'received' ? 'success' : 'warn';

const _KpiCard = ({ label, value, sub, accent }) => (
  <div className="card" style={{ padding: 0 }}>
    <div className="card-body" style={{ padding: '16px 18px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em', color: accent || 'var(--text-1)', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{sub}</div>}
    </div>
  </div>
);

// ── form view ─────────────────────────────────────────────────────────────────

const _GstForm = ({ onClose, onSave }) => {
  const [confNo,      setConfNo]      = React.useState('');
  const [confOpen,    setConfOpen]    = React.useState(false);
  const [confQ,       setConfQ]       = React.useState('');
  const [invoiceNo,   setInvoiceNo]   = React.useState('');
  const [date,        setDate]        = React.useState('');
  const [certNo,      setCertNo]      = React.useState('');
  const [taxableAmt,  setTaxableAmt]  = React.useState('');
  const [gstRate,     setGstRate]     = React.useState('0');
  const [notes,       setNotes]       = React.useState('');
  const confRef = React.useRef(null);

  const selConf    = CONFIRMATIONS.find(c => c.no === confNo);
  const confInvoices = confNo ? INVOICES.filter(i => i.conf === confNo) : [];
  const selInvoice   = INVOICES.find(i => i.no === invoiceNo);

  // Auto-fill taxable amount from invoice
  React.useEffect(() => {
    if (selInvoice) setTaxableAmt(String(selInvoice.amount));
    else setTaxableAmt('');
  }, [invoiceNo]);

  // Auto-set invoice when conf changes to single-invoice
  React.useEffect(() => {
    if (confInvoices.length === 1) setInvoiceNo(confInvoices[0].no);
    else setInvoiceNo('');
  }, [confNo]);

  const confSuggestions = CONFIRMATIONS.filter(c => {
    const q = confQ.toLowerCase();
    return !q || c.no.toLowerCase().includes(q) || c.buyer.toLowerCase().includes(q) || c.seller.toLowerCase().includes(q);
  }).slice(0, 8);

  const gstRateNum   = parseFloat(gstRate) || 0;
  const taxableNum   = parseFloat(taxableAmt) || 0;
  const gstAmt       = Math.round(taxableNum * gstRateNum / 100);

  const nextNo = `GSTR-26-${String(parseInt((GST_RECEIPTS[0]?.no?.split('-')[2] || '0021')) + 1).padStart(4, '0')}`;
  const canSave = confNo && date;

  const handleSave = () => {
    onSave({
      no: nextNo,
      date: new Date(date),
      buyer: selConf?.buyer || '',
      seller: selConf?.seller || '',
      conf: confNo,
      invoice: invoiceNo || null,
      taxableAmt: taxableNum,
      gstRate: gstRateNum,
      gstAmt,
      certNo: certNo.trim() || null,
      status: certNo.trim() ? 'received' : 'pending',
      notes,
    });
  };

  return (
    <div className="content-inner">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <button className="btn btn-sm btn-ghost" onClick={onClose}><Icon.ChevronLeft size={14} /> Back</button>
            <Badge tone="info">Draft record</Badge>
          </div>
          <h1 className="page-title">Record GST Certificate</h1>
          <div className="page-sub">Log a GST exemption certificate received from a buyer for a raw cotton purchase.</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={onClose}><Icon.X size={14} /> Discard</button>
          <button className="btn" onClick={handleSave}><Icon.Save size={14} /> Save draft</button>
          <button className="btn btn-primary" disabled={!canSave} onClick={handleSave}>
            <Icon.Check size={14} /> Save receipt
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 16 }}>

        {/* Main form */}
        <div className="card">
          <div className="card-body" style={{ padding: '8px 24px 20px' }}>

            <Section title="Invoice link" desc="Link this certificate to a sale confirmation and invoice.">
              <div className="form-grid">

                {/* Confirmation searchable dropdown */}
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
                          width: '100%', boxSizing: 'border-box', paddingLeft: 28, paddingRight: 10,
                          paddingTop: 7, paddingBottom: 7, border: '1px solid var(--border)',
                          borderRadius: 6, background: 'var(--bg-2)', color: 'var(--text-1)',
                          fontSize: 13, outline: 'none', fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => e.target.style.borderColor = 'var(--accent)'}
                        onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                    {confOpen && confSuggestions.length > 0 && (
                      <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,.12)', zIndex: 50, overflow: 'hidden' }}>
                        {confSuggestions.map(c => (
                          <div key={c.no} onMouseDown={() => { setConfNo(c.no); setConfQ(''); setConfOpen(false); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
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

                {/* Invoice */}
                <Field label="Invoice">
                  <Select value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} disabled={!confNo}>
                    <option value="">— none —</option>
                    {confInvoices.map(i => (
                      <option key={i.no} value={i.no}>{i.no} — {fmtINR(i.amount, { compact: true })} ({i.status})</option>
                    ))}
                  </Select>
                </Field>

                {/* Buyer — read-only auto-fill */}
                <Field label="Buyer">
                  <input
                    value={selConf?.buyer || ''}
                    readOnly
                    placeholder="Auto-filled from confirmation"
                    style={{
                      width: '100%', boxSizing: 'border-box', padding: '7px 10px',
                      border: '1px solid var(--border)', borderRadius: 6,
                      background: 'var(--surface-2)', color: selConf ? 'var(--text-1)' : 'var(--text-3)',
                      fontSize: 13, outline: 'none', fontFamily: 'inherit', cursor: 'default',
                    }}
                  />
                </Field>

                {/* Seller — read-only auto-fill */}
                <Field label="Seller">
                  <input
                    value={selConf?.seller || ''}
                    readOnly
                    placeholder="Auto-filled from confirmation"
                    style={{
                      width: '100%', boxSizing: 'border-box', padding: '7px 10px',
                      border: '1px solid var(--border)', borderRadius: 6,
                      background: 'var(--surface-2)', color: selConf ? 'var(--text-1)' : 'var(--text-3)',
                      fontSize: 13, outline: 'none', fontFamily: 'inherit', cursor: 'default',
                    }}
                  />
                </Field>

              </div>
            </Section>

            <Section title="Certificate details" desc="Enter the GST certificate received from the buyer and the applicable amounts.">
              <div className="form-grid">

                {/* Date */}
                <Field label="Date" required>
                  <Input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </Field>

                {/* Certificate number */}
                <Field label="GST Certificate No.">
                  <Input
                    value={certNo}
                    onChange={e => setCertNo(e.target.value)}
                    placeholder="e.g. GJ-2026-0341"
                  />
                </Field>

                {/* Taxable amount */}
                <Field label="Taxable Amount">
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: 13, pointerEvents: 'none' }}>₹</span>
                    <Input
                      type="number"
                      value={taxableAmt}
                      onChange={e => setTaxableAmt(e.target.value)}
                      className="input tnum"
                      placeholder="0"
                      style={{ paddingLeft: 22 }}
                    />
                  </div>
                </Field>

                {/* GST Rate */}
                <Field label="GST Rate %" hint="Raw cotton (unginned) is 0% GST. Ginned cotton is 5%.">
                  <Input
                    type="number"
                    value={gstRate}
                    onChange={e => setGstRate(e.target.value)}
                    className="input tnum"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                </Field>

                {/* GST Amount — auto-calculated, disabled */}
                <Field label="GST Amount (auto-calculated)">
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: 13, pointerEvents: 'none' }}>₹</span>
                    <input
                      type="text"
                      value={gstAmt > 0 ? gstAmt.toLocaleString('en-IN') : '0'}
                      readOnly
                      className="input tnum"
                      style={{
                        paddingLeft: 22, width: '100%', boxSizing: 'border-box',
                        background: 'var(--surface-2)', color: 'var(--text-3)',
                        border: '1px solid var(--border)', borderRadius: 6,
                        padding: '7px 10px 7px 22px', fontSize: 13, fontFamily: 'inherit',
                        cursor: 'default', outline: 'none',
                      }}
                    />
                  </div>
                </Field>

                {/* Notes */}
                <Field label="Notes" span={2}>
                  <Input
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any notes about this certificate…"
                  />
                </Field>

              </div>
            </Section>

          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Invoice detail card */}
          {selInvoice ? (
            <div className="card">
              <div className="card-header"><div className="card-title">Invoice</div></div>
              <div className="card-body" style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['Invoice No',  selInvoice.no],
                  ['Date',        fmtDateShort(selInvoice.date)],
                  ['Amount',      fmtINR(selInvoice.amount, { compact: true })],
                  ['Balance',     fmtINR(selInvoice.balance, { compact: true })],
                  ['Status',      selInvoice.status],
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
                <Icon.File size={20} style={{ color: 'var(--text-3)', display: 'block', margin: '0 auto 8px' }} />
                <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Select a confirmation and invoice to see details here.</div>
              </div>
            </div>
          )}

          {/* GST info card */}
          <div className="card" style={{ background: 'rgba(234,179,8,.05)', border: '1px solid rgba(234,179,8,.25)' }}>
            <div className="card-body" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <Icon.AlertCircle size={14} style={{ color: '#a16207', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#a16207', textTransform: 'uppercase', letterSpacing: '.05em' }}>GST Rates — Cotton</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  ['Raw cotton (unginned)', 'Nil GST (0%)'],
                  ['Ginned cotton', '5% GST'],
                  ['Cotton waste', '5% GST'],
                ].map(([type, rate]) => (
                  <div key={type} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-2)' }}>{type}</span>
                    <span style={{ fontWeight: 600, color: '#a16207', fontFamily: 'monospace' }}>{rate}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(234,179,8,.20)', fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.5 }}>
                Buyers must furnish Form 27C or state-specific GST exemption certificate for nil-rated purchases.
              </div>
            </div>
          </div>

          {/* Amount preview when taxable amount is set */}
          {taxableNum > 0 && (
            <div className="card" style={{ border: '2px solid var(--accent)', background: 'rgba(0,0,0,.02)' }}>
              <div className="card-body" style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 6 }}>
                  Taxable value
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-.02em' }}>
                  {fmtINR(taxableNum, { compact: true })}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                  GST {gstRateNum}% = {gstAmt > 0 ? fmtINR(gstAmt, { compact: true }) : 'Nil'}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ── dashboard view ────────────────────────────────────────────────────────────

const GstReceipt = ({ onCmd }) => {
  const [showForm,     setShowForm]     = React.useState(false);
  const [extraReceipts, setExtraReceipts] = React.useState([]);
  const [filterStatus, setFilterStatus]  = React.useState('all'); // all | received | pending
  const [search,       setSearch]        = React.useState('');
  const [bannerDismissed, setBannerDismissed] = React.useState(false);
  const [visibleCols,  setVisibleCols]   = React.useState(
    () => new Set(_GST_COLS.filter(c => c.defaultOn).map(c => c.field))
  );
  const vis = (f) => visibleCols.has(f);

  if (showForm) {
    return (
      <_GstForm
        onClose={() => setShowForm(false)}
        onSave={(record) => {
          setExtraReceipts(prev => [record, ...prev]);
          setShowForm(false);
        }}
      />
    );
  }

  const allReceipts = [...extraReceipts, ...GST_RECEIPTS];

  // KPIs
  const totalCount    = allReceipts.length;
  const receivedList  = allReceipts.filter(r => r.status === 'received');
  const pendingList   = allReceipts.filter(r => r.status === 'pending');
  const receivedSum   = receivedList.reduce((s, r) => s + r.taxableAmt, 0);
  const totalTaxable  = allReceipts.reduce((s, r) => s + r.taxableAmt, 0);
  const pendingCount  = pendingList.length;

  // Filtered rows
  const filtered = allReceipts.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.no.toLowerCase().includes(q)                       ||
      (r.conf || '').toLowerCase().includes(q)             ||
      (r.invoice || '').toLowerCase().includes(q)          ||
      r.buyer.toLowerCase().includes(q)                    ||
      r.seller.toLowerCase().includes(q)                   ||
      (r.certNo || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="content-inner">

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">GST Cert. Receipts</h1>
          <div className="page-sub">{totalCount} records · {pendingCount} certificate{pendingCount !== 1 ? 's' : ''} pending</div>
        </div>
        <div className="page-actions">
          <ViewMenu cols={_GST_COLS} visible={visibleCols} onChange={setVisibleCols} />
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Icon.Plus size={14} /> Record receipt
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        <_KpiCard
          label="Total Receipts"
          value={totalCount}
          sub={`${allReceipts.length} records tracked`}
        />
        <_KpiCard
          label="Received"
          value={receivedList.length}
          sub={fmtINR(receivedSum, { compact: true }) + ' taxable value'}
          accent="var(--positive)"
        />
        <_KpiCard
          label="Pending"
          value={pendingCount}
          sub={pendingCount > 0 ? 'Follow up with buyers' : 'All certificates in'}
          accent={pendingCount > 0 ? 'var(--negative)' : undefined}
        />
        <_KpiCard
          label="Total Taxable Value"
          value={fmtINR(totalTaxable, { compact: true })}
          sub={`across ${totalCount} invoice${totalCount !== 1 ? 's' : ''}`}
        />
      </div>

      {/* Pending banner */}
      {pendingCount > 0 && !bannerDismissed && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
          background: 'rgba(234,179,8,.10)', border: '1px solid rgba(234,179,8,.30)',
          borderRadius: 8, marginBottom: 14,
        }}>
          <Icon.AlertCircle size={15} style={{ color: '#a16207', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#92400e', flex: 1 }}>
            <strong>{pendingCount}</strong> certificate{pendingCount !== 1 ? 's' : ''} pending — follow up with buyers.
          </span>
          <button
            onClick={() => setBannerDismissed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a16207', display: 'flex', padding: 4, borderRadius: 4 }}
            title="Dismiss"
          >
            <Icon.X size={13} />
          </button>
        </div>
      )}

      {/* Filter pills + search */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: 3 }}>
          {['all', 'received', 'pending'].map(s => (
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

        {/* Inline search */}
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
            placeholder="Search by receipt no, conf, invoice, buyer, seller or cert no…"
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
              {vis('no')         && <th>Receipt No</th>}
              {vis('date')       && <th>Date</th>}
              {vis('conf')       && <th>Conf</th>}
              {vis('invoice')    && <th>Invoice</th>}
              {vis('buyer')      && <th>Buyer</th>}
              {vis('seller')     && <th>Seller</th>}
              {vis('taxableAmt') && <th className="num">Taxable Amt</th>}
              {vis('gstRate')    && <th className="num">GST %</th>}
              {vis('certNo')     && <th>Cert No.</th>}
              {vis('status')     && <th>Status</th>}
              <th style={{ width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', color: 'var(--text-3)', padding: '28px 0', fontSize: 13 }}>
                  No records found{search ? ` for "${search}"` : ''}.
                </td>
              </tr>
            ) : filtered.map(r => (
              <tr key={r.no}>
                {vis('no')         && <td className="cell-mono cell-strong">{r.no}</td>}
                {vis('date')       && <td className="muted">{fmtDateShort(r.date)}</td>}
                {vis('conf')       && <td>
                  <span className="cell-mono" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{r.conf}</span>
                </td>}
                {vis('invoice')    && <td>
                  {r.invoice
                    ? <span className="cell-mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>{r.invoice}</span>
                    : <span style={{ color: 'var(--text-3)', fontSize: 12 }}>—</span>}
                </td>}
                {vis('buyer')      && <td style={{ fontSize: 12.5 }}>{r.buyer}</td>}
                {vis('seller')     && <td style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{r.seller}</td>}
                {vis('taxableAmt') && <td className="num tnum cell-strong">{fmtINR(r.taxableAmt, { compact: true })}</td>}
                {vis('gstRate')    && <td className="num tnum" style={{ color: 'var(--text-3)', fontSize: 12.5 }}>{r.gstRate}%</td>}
                {vis('certNo')     && <td>
                  {r.certNo
                    ? <span className="cell-mono" style={{ fontSize: 12.5, fontWeight: 600 }}>{r.certNo}</span>
                    : <span style={{ color: 'var(--text-3)', fontSize: 12, fontStyle: 'italic' }}>— pending —</span>}
                </td>}
                {vis('status')     && <td><Badge tone={_statusTone(r.status)}>{r.status}</Badge></td>}
                <td>
                  <button className="btn btn-sm btn-ghost" style={{ padding: '2px 6px' }}
                    onClick={() => {}}>
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

window.GstReceipt = GstReceipt;
