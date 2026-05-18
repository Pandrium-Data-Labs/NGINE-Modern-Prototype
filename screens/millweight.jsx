// Millweight screen

const { Field, Input, Select, Badge, Section, fmtINR, fmtNum, ViewMenu } = window.UI;
const { CONFIRMATIONS, DELIVERIES, BUYERS, MILLWEIGHTS, fmtDate, fmtDateShort } = window.NCData;

// ── helpers ──────────────────────────────────────────────────────────────────

const _statusTone = (s) =>
  s === 'accepted' ? 'success' : s === 'disputed' ? 'danger' : 'default';

const _diffColor = (pct) => {
  const abs = Math.abs(pct || 0);
  if (abs < 0.5)  return 'var(--text-3)';
  if (abs < 1.0)  return 'var(--warn, #b45309)';
  return 'var(--negative, #dc2626)';
};

const _fmtDiff = (kg) => {
  if (kg == null) return '—';
  const sign = kg <= 0 ? '−' : '+';
  return `${sign}${Math.abs(kg).toLocaleString('en-IN')} kg`;
};

const _fmtDiffPct = (pct) => {
  if (pct == null) return '—';
  const sign = pct <= 0 ? '−' : '+';
  return `${sign}${Math.abs(pct).toFixed(2)}%`;
};

// ── KPI stat card ─────────────────────────────────────────────────────────────

const _Card = ({ label, value, sub, subTone, accent }) => (
  <div className="card" style={{ padding: 0 }}>
    <div className="card-body" style={{ padding: '16px 18px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em', color: accent || 'var(--text-1)', lineHeight: 1.1 }}>{value}</div>
      {sub && (
        <div style={{
          fontSize: 12,
          color: subTone === 'danger'    ? 'var(--negative)' :
                 subTone === 'positive'  ? 'var(--positive)' :
                 subTone === 'warn'      ? 'var(--warn)'     : 'var(--text-3)',
        }}>{sub}</div>
      )}
    </div>
  </div>
);

// ── Column definitions ────────────────────────────────────────────────────────

const _MW_COLS = [
  { field: 'no',       label: 'MW No',        defaultOn: true  },
  { field: 'date',     label: 'Date',          defaultOn: true  },
  { field: 'conf',     label: 'Conf',          defaultOn: true  },
  { field: 'delivery', label: 'Delivery',      defaultOn: true  },
  { field: 'buyer',    label: 'Buyer',         defaultOn: true  },
  { field: 'bales',    label: 'Bales',         defaultOn: false },
  { field: 'origNet',  label: 'Orig wt (kg)',  defaultOn: true  },
  { field: 'millNet',  label: 'Mill wt (kg)',  defaultOn: true  },
  { field: 'diff',     label: 'Diff (kg)',     defaultOn: true  },
  { field: 'diffPct',  label: 'Diff %',        defaultOn: true  },
  { field: 'status',   label: 'Status',        defaultOn: true  },
];

// ── Millweight form ───────────────────────────────────────────────────────────

const _MWForm = ({ onClose, onSave, prefill }) => {
  const [confNo,   setConfNo]   = React.useState(prefill?.conf     || '');
  const [delivery, setDelivery] = React.useState(prefill?.delivery || '');
  const [bales,    setBales]    = React.useState(prefill?.bales != null ? String(prefill.bales) : '');
  const [origNet,  setOrigNet]  = React.useState(prefill?.origNet  != null ? String(prefill.origNet) : '');
  const [millNet,  setMillNet]  = React.useState(prefill?.millNet  != null ? String(prefill.millNet) : '');
  const [notes,    setNotes]    = React.useState(prefill?.notes    || '');
  const [confOpen, setConfOpen] = React.useState(false);
  const [confQ,    setConfQ]    = React.useState('');
  const confRef = React.useRef(null);

  // Derived records
  const selConf     = CONFIRMATIONS.find(c => c.no === confNo);
  const confDeliveries = confNo ? DELIVERIES.filter(d => d.conf === confNo) : [];
  const selDelivery = DELIVERIES.find(d => d.id === delivery);
  const buyer       = selConf?.buyer || prefill?.buyer || '';

  // Auto-populate delivery fields when delivery changes
  React.useEffect(() => {
    if (selDelivery) {
      setBales(String(selDelivery.bales));
      setOrigNet(String(selDelivery.net));
    }
  }, [delivery]);

  // Reset delivery/fields when conf changes (unless prefilling)
  React.useEffect(() => {
    if (!prefill) {
      setDelivery('');
      setBales('');
      setOrigNet('');
      setMillNet('');
    }
  }, [confNo]);

  // Computed diff
  const origNetNum = parseFloat(origNet) || 0;
  const millNetNum = parseFloat(millNet) || 0;
  const diff       = millNet !== '' && origNet !== '' ? millNetNum - origNetNum : null;
  const diffPct    = diff !== null && origNetNum > 0 ? (diff / origNetNum) * 100 : null;

  // Conf search suggestions
  const confSuggestions = CONFIRMATIONS.filter(c => {
    const q = confQ.toLowerCase();
    return !q || c.no.toLowerCase().includes(q) || c.buyer.toLowerCase().includes(q);
  }).slice(0, 8);

  // Next MW number
  const allMW = window.NCData.MILLWEIGHTS || [];
  const nextNo = (() => {
    const last = allMW[0]?.no || 'MW-26-0041';
    const num  = parseInt(last.split('-')[2] || '41') + 1;
    return `MW-26-${String(num).padStart(4, '0')}`;
  })();

  const canSave = confNo && millNet && parseFloat(millNet) > 0;

  const handleSave = () => {
    onSave({
      no:       prefill?.no || nextNo,
      date:     new Date(),
      conf:     confNo,
      delivery: delivery || null,
      buyer,
      bales:    parseInt(bales)    || 0,
      origNet:  origNetNum,
      millNet:  millNetNum,
      diff:     diff ?? 0,
      diffPct:  diffPct ?? 0,
      status:   'pending',
      notes,
    });
  };

  // Visual diff bar (for sidebar)
  const diffBarPct = origNetNum > 0 ? Math.min(100, (millNetNum / origNetNum) * 100) : 0;

  return (
    <div className="content-inner">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <button className="btn btn-sm btn-ghost" onClick={onClose}><Icon.ChevronLeft size={14} /> Back</button>
            <Badge tone="info">Draft record</Badge>
          </div>
          <h1 className="page-title">Record Millweight</h1>
          <div className="page-sub">Enter the weight recorded at the mill after bale arrival.</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={onClose}><Icon.X size={14} /> Discard</button>
          <button className="btn" onClick={handleSave}><Icon.Save size={14} /> Save draft</button>
          <button className="btn btn-primary" disabled={!canSave} onClick={handleSave}>
            <Icon.Check size={14} /> Save record
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 16 }}>

        {/* ── Main form ── */}
        <div className="card">
          <div className="card-body" style={{ padding: '8px 24px 20px' }}>

            <Section title="Delivery details" desc="Link this mill-weight record to a sale confirmation and delivery note.">
              <div className="form-grid">

                {/* Confirmation search */}
                <Field label="Sale confirmation" required>
                  <div style={{ position: 'relative' }} ref={confRef}>
                    <div style={{ position: 'relative' }}>
                      <Icon.Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
                      <input
                        value={confQ || confNo}
                        onChange={e => { setConfQ(e.target.value); setConfNo(''); setConfOpen(true); }}
                        onFocus={() => { setConfOpen(true); if (confNo) setConfQ(''); }}
                        onBlur={() => setTimeout(() => setConfOpen(false), 150)}
                        placeholder="Search by conf no or buyer…"
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
                      <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,.12)', zIndex: 50, overflow: 'hidden' }}>
                        {confSuggestions.map(c => (
                          <div key={c.no}
                            onMouseDown={() => { setConfNo(c.no); setConfQ(''); setConfOpen(false); }}
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

                {/* Delivery */}
                <Field label="Delivery note">
                  <Select value={delivery} onChange={e => setDelivery(e.target.value)} disabled={!confNo}>
                    <option value="">— select delivery —</option>
                    {confDeliveries.map(d => (
                      <option key={d.id} value={d.id}>{d.id} — {d.bales} bales, net {d.net.toLocaleString('en-IN')} kg</option>
                    ))}
                  </Select>
                </Field>

                {/* Buyer (auto-fill, read-only display) */}
                <Field label="Buyer">
                  <input
                    readOnly
                    value={buyer}
                    placeholder="Auto-filled from confirmation"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '7px 10px', border: '1px solid var(--border)',
                      borderRadius: 6, background: 'var(--surface-2)',
                      color: buyer ? 'var(--text-1)' : 'var(--text-3)',
                      fontSize: 13, outline: 'none', fontFamily: 'inherit',
                    }}
                  />
                </Field>

                {/* Bales */}
                <Field label="Bales">
                  <Input
                    type="number"
                    value={bales}
                    onChange={e => setBales(e.target.value)}
                    placeholder="Auto-filled from delivery"
                  />
                </Field>
              </div>
            </Section>

            <Section title="Weight details" desc="Enter the weights. Difference is calculated automatically.">
              <div className="form-grid">

                {/* Original net weight */}
                <Field label="Original net weight (kg)">
                  <Input
                    type="number"
                    value={origNet}
                    onChange={e => setOrigNet(e.target.value)}
                    placeholder="Auto-filled from delivery"
                  />
                </Field>

                {/* Mill net weight */}
                <Field label="Mill net weight (kg)" required>
                  <Input
                    type="number"
                    value={millNet}
                    onChange={e => setMillNet(e.target.value)}
                    placeholder="Weight recorded at the mill"
                  />
                </Field>

                {/* Difference — calculated, read-only */}
                <Field label="Difference (kg)">
                  <input
                    readOnly
                    value={diff !== null ? _fmtDiff(diff) : ''}
                    placeholder="Auto-calculated"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '7px 10px', border: '1px solid var(--border)',
                      borderRadius: 6, background: 'var(--surface-2)',
                      color: diff !== null ? (diff < 0 ? 'var(--negative)' : diff > 0 ? 'var(--positive)' : 'var(--text-2)') : 'var(--text-3)',
                      fontSize: 13, fontWeight: diff !== null ? 600 : 400,
                      outline: 'none', fontFamily: 'monospace',
                    }}
                  />
                </Field>

                {/* Diff % — calculated */}
                <Field label="Difference %">
                  <input
                    readOnly
                    value={diffPct !== null ? _fmtDiffPct(diffPct) : ''}
                    placeholder="Auto-calculated"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '7px 10px', border: '1px solid var(--border)',
                      borderRadius: 6, background: 'var(--surface-2)',
                      color: diffPct !== null ? _diffColor(diffPct) : 'var(--text-3)',
                      fontSize: 13, fontWeight: diffPct !== null ? 600 : 400,
                      outline: 'none', fontFamily: 'monospace',
                    }}
                  />
                </Field>

                {/* Notes */}
                <Field label="Notes" span={2}>
                  <Input
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any remarks about this mill-weight record…"
                  />
                </Field>
              </div>
            </Section>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Confirmation detail */}
          {selConf ? (
            <div className="card">
              <div className="card-header"><div className="card-title">Confirmation</div></div>
              <div className="card-body" style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['No',      selConf.no],
                  ['Date',    fmtDateShort(selConf.date)],
                  ['Buyer',   selConf.buyer],
                  ['Seller',  selConf.seller],
                  ['Variety', selConf.variety],
                  ['Bales',   `${selConf.balesMin}–${selConf.balesMax}`],
                  ['Rate',    `₹${selConf.candyRt.toLocaleString('en-IN')}/candy`],
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
                <Icon.Search size={20} style={{ color: 'var(--text-3)', display: 'block', margin: '0 auto 8px' }} />
                <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Select a confirmation to see details here.</div>
              </div>
            </div>
          )}

          {/* Weight comparison card */}
          {selDelivery && (
            <div className="card">
              <div className="card-header"><div className="card-title">Weight comparison</div></div>
              <div className="card-body" style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Orig weight */}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>Original (bilty)</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'monospace', letterSpacing: '-.01em' }}>
                    {origNetNum > 0 ? origNetNum.toLocaleString('en-IN') : selDelivery.net.toLocaleString('en-IN')} kg
                  </div>
                </div>

                {/* Mill weight */}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>Mill weight</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: millNet ? 'var(--text-1)' : 'var(--text-3)', fontFamily: 'monospace', letterSpacing: '-.01em' }}>
                    {millNet ? parseFloat(millNet).toLocaleString('en-IN') + ' kg' : '— kg'}
                  </div>
                </div>

                {/* Visual diff bar */}
                {millNet && origNetNum > 0 && (
                  <div>
                    <div style={{ height: 8, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden', position: 'relative' }}>
                      {/* Full bar (orig) */}
                      <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'rgba(239,68,68,.15)' }} />
                      {/* Mill portion */}
                      <div style={{ height: '100%', width: `${Math.min(100, diffBarPct)}%`, borderRadius: 999, background: diff < 0 ? 'var(--negative, #dc2626)' : 'var(--positive, #16a34a)', transition: 'width .3s' }} />
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
                      <span style={{ color: 'var(--text-3)' }}>Mill / orig ratio</span>
                      <span style={{ fontWeight: 600, fontFamily: 'monospace', color: _diffColor(diffPct) }}>{diffBarPct.toFixed(1)}%</span>
                    </div>
                  </div>
                )}

                {/* Diff summary */}
                {diff !== null && (
                  <div style={{
                    borderRadius: 8, padding: '10px 14px',
                    background: diff < 0 ? 'rgba(239,68,68,.06)' : 'rgba(34,197,94,.06)',
                    border: `1px solid ${diff < 0 ? 'rgba(239,68,68,.20)' : 'rgba(34,197,94,.20)'}`,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: diff < 0 ? 'var(--negative)' : 'var(--positive)', marginBottom: 4 }}>
                      {diff < 0 ? 'Weight loss' : diff > 0 ? 'Weight gain' : 'No difference'}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'monospace', color: diff < 0 ? 'var(--negative)' : 'var(--positive)' }}>
                      {_fmtDiff(diff)}
                    </div>
                    {diffPct !== null && (
                      <div style={{ fontSize: 12, color: _diffColor(diffPct), marginTop: 2, fontFamily: 'monospace' }}>
                        {_fmtDiffPct(diffPct)} of original
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty delivery state */}
          {!selDelivery && confNo && (
            <div className="card">
              <div className="card-body" style={{ padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Select a delivery to see the weight comparison.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main dashboard ─────────────────────────────────────────────────────────────

const Millweight = ({ onCmd }) => {
  const [showForm,     setShowForm]     = React.useState(false);
  const [formPrefill,  setFormPrefill]  = React.useState(null);
  const [extraRecords, setExtraRecords] = React.useState([]);
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [search,       setSearch]       = React.useState('');
  const [visibleCols,  setVisibleCols]  = React.useState(
    () => new Set(_MW_COLS.filter(c => c.defaultOn).map(c => c.field))
  );
  const vis = (f) => visibleCols.has(f);

  if (showForm) {
    return (
      <_MWForm
        prefill={formPrefill}
        onClose={() => { setShowForm(false); setFormPrefill(null); }}
        onSave={(rec) => {
          setExtraRecords(prev => [rec, ...prev]);
          setShowForm(false);
          setFormPrefill(null);
        }}
      />
    );
  }

  const allRecords = [...extraRecords, ...MILLWEIGHTS];

  // KPIs
  const avgDiffPct = allRecords.length > 0
    ? allRecords.reduce((s, r) => s + (r.diffPct || 0), 0) / allRecords.length
    : 0;
  const acceptedCount = allRecords.filter(r => r.status === 'accepted').length;
  const disputedCount = allRecords.filter(r => r.status === 'disputed').length;

  // Filters
  const filtered = allRecords.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.no.toLowerCase().includes(q)           ||
      r.conf.toLowerCase().includes(q)          ||
      (r.delivery || '').toLowerCase().includes(q) ||
      r.buyer.toLowerCase().includes(q)
    );
  });

  return (
    <div className="content-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">Millweight</h1>
          <div className="page-sub">{allRecords.length} record{allRecords.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="page-actions">
          <ViewMenu cols={_MW_COLS} visible={visibleCols} onChange={setVisibleCols} />
          <button className="btn btn-primary" onClick={() => { setFormPrefill(null); setShowForm(true); }}>
            <Icon.Plus size={14} /> Record millweight
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
        <_Card
          label="Total records"
          value={allRecords.length}
          sub={`${allRecords.filter(r => r.status === 'pending').length} pending`}
          subTone={allRecords.filter(r => r.status === 'pending').length > 0 ? 'warn' : undefined}
        />
        <_Card
          label="Avg weight loss"
          value={`−${Math.abs(avgDiffPct).toFixed(2)}%`}
          sub="across all records"
          accent="var(--negative)"
        />
        <_Card
          label="Accepted"
          value={acceptedCount}
          sub={`${Math.round((acceptedCount / (allRecords.length || 1)) * 100)}% of total`}
          subTone="positive"
          accent="var(--positive)"
        />
        <_Card
          label="Disputed"
          value={disputedCount}
          sub={disputedCount > 0 ? 'Requires resolution' : 'None outstanding'}
          subTone={disputedCount > 0 ? 'danger' : undefined}
          accent={disputedCount > 0 ? 'var(--negative)' : undefined}
        />
      </div>

      {/* Filters + search */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Status pills */}
        <div style={{ display: 'flex', gap: 3 }}>
          {['all', 'pending', 'accepted', 'disputed'].map(s => (
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
            placeholder="Search by MW no, conf, delivery or buyer…"
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
              {vis('no')       && <th>MW No</th>}
              {vis('date')     && <th>Date</th>}
              {vis('conf')     && <th>Conf</th>}
              {vis('delivery') && <th>Delivery</th>}
              {vis('buyer')    && <th>Buyer</th>}
              {vis('bales')    && <th className="num">Bales</th>}
              {vis('origNet')  && <th className="num">Orig wt (kg)</th>}
              {vis('millNet')  && <th className="num">Mill wt (kg)</th>}
              {vis('diff')     && <th className="num">Diff (kg)</th>}
              {vis('diffPct')  && <th className="num">Diff %</th>}
              {vis('status')   && <th>Status</th>}
              <th style={{ width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', color: 'var(--text-3)', padding: '28px 0', fontSize: 13 }}>
                  No millweight records found{search ? ` for "${search}"` : ''}.
                </td>
              </tr>
            ) : filtered.map(r => (
              <tr key={r.no}>
                {vis('no')       && <td className="cell-mono cell-strong">{r.no}</td>}
                {vis('date')     && <td className="muted">{fmtDateShort(r.date)}</td>}
                {vis('conf')     && <td><span className="cell-mono" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{r.conf}</span></td>}
                {vis('delivery') && <td><span className="cell-mono" style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{r.delivery || '—'}</span></td>}
                {vis('buyer')    && <td style={{ fontSize: 12.5 }}>{r.buyer}</td>}
                {vis('bales')    && <td className="num tnum" style={{ fontSize: 12.5 }}>{r.bales != null ? r.bales.toLocaleString('en-IN') : '—'}</td>}
                {vis('origNet')  && <td className="num tnum" style={{ fontSize: 12.5 }}>{r.origNet != null ? r.origNet.toLocaleString('en-IN') : '—'}</td>}
                {vis('millNet')  && <td className="num tnum" style={{ fontSize: 12.5 }}>{r.millNet != null ? r.millNet.toLocaleString('en-IN') : '—'}</td>}
                {vis('diff')     && (
                  <td className="num tnum cell-strong" style={{ color: r.diff < 0 ? 'var(--negative)' : r.diff > 0 ? 'var(--positive)' : 'var(--text-2)', fontSize: 12.5 }}>
                    {_fmtDiff(r.diff)}
                  </td>
                )}
                {vis('diffPct')  && (
                  <td className="num tnum" style={{ color: _diffColor(r.diffPct), fontWeight: 600, fontSize: 12.5 }}>
                    {_fmtDiffPct(r.diffPct)}
                  </td>
                )}
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

window.Millweight = Millweight;
