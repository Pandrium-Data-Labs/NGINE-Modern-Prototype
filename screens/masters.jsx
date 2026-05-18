// Masters screen — Buyers, Sellers, Varieties, Stations, Payment Terms

const { Badge, Field, Input, Select, fmtINR, fmtNum, ViewMenu } = window.UI;
const { BUYERS, SELLERS, VARIETIES, STATIONS, STATES, PAYMENT_TERMS } = window.NCData;
const { useTableControls, SortableHeader, FilterToolbar } = window.TableFilters;

const MASTER_COL_DEFS = {
  buyers: [
    { field:'id',      label:'ID',       type:'text'   },
    { field:'name',    label:'Name',     type:'text'   },
    { field:'station', label:'Station',  type:'text'   },
    { field:'state',   label:'State',    type:'text'   },
    { field:'commPct', label:'Comm %',   type:'number' },
    { field:'conf',    label:'Confs',    type:'number' },
    { field:'status',  label:'Status',   type:'select', options:['active','deferred'] },
  ],
  sellers: [
    { field:'id',      label:'ID',       type:'text'   },
    { field:'name',    label:'Name',     type:'text'   },
    { field:'station', label:'Station',  type:'text'   },
    { field:'state',   label:'State',    type:'text'   },
    { field:'commPct', label:'Comm %',   type:'number' },
  ],
  varieties: [
    { field:'id',   label:'ID',      type:'text' },
    { field:'name', label:'Variety', type:'text' },
  ],
  stations: [
    { field:'id',   label:'ID',      type:'text' },
    { field:'name', label:'Station', type:'text' },
  ],
  'payment-terms': [
    { field:'name',   label:'Payment Term', type:'text'   },
    { field:'short',  label:'Short Name',   type:'text'   },
    { field:'days',   label:'Days',         type:'number' },
    { field:'status', label:'Status',       type:'select', options:['active','deferred'] },
    { field:'used',   label:'Contracts',    type:'number' },
  ],
};

// ---- Column-visibility specs (one per tab) ----
const _BUYERS_COLS = [
  { field: 'id',      label: 'ID',      defaultOn: false },
  { field: 'name',    label: 'Name',    defaultOn: true  },
  { field: 'station', label: 'Station', defaultOn: true  },
  { field: 'state',   label: 'State',   defaultOn: true  },
  { field: 'commPct', label: 'Comm %',  defaultOn: true  },
  { field: 'conf',    label: 'Confs',   defaultOn: true  },
  { field: 'status',  label: 'Status',  defaultOn: true  },
];

const _SELLERS_COLS = [
  { field: 'id',      label: 'ID',      defaultOn: false },
  { field: 'name',    label: 'Name',    defaultOn: true  },
  { field: 'station', label: 'Station', defaultOn: true  },
  { field: 'state',   label: 'State',   defaultOn: true  },
  { field: 'commPct', label: 'Comm %',  defaultOn: true  },
];

const _VARIETIES_COLS = [
  { field: 'id',   label: 'ID',      defaultOn: false },
  { field: 'name', label: 'Variety', defaultOn: true  },
];

const _STATIONS_COLS = [
  { field: 'id',   label: 'ID',      defaultOn: false },
  { field: 'name', label: 'Station', defaultOn: true  },
];

const _PT_COLS = [
  { field: 'name',    label: 'Payment Term', defaultOn: true  },
  { field: 'days',    label: 'Days',         defaultOn: true  },
  { field: 'status',  label: 'Status',       defaultOn: true  },
  { field: 'used',    label: 'Contracts',    defaultOn: true  },
  { field: 'updated', label: 'Last Edited',  defaultOn: true  },
];

const _VIS_SPECS = {
  buyers:          _BUYERS_COLS,
  sellers:         _SELLERS_COLS,
  varieties:       _VARIETIES_COLS,
  stations:        _STATIONS_COLS,
  'payment-terms': _PT_COLS,
};

const _defaultVis = (spec) => new Set(spec.filter(c => c.defaultOn).map(c => c.field));

const MASTER_TABS = [
  {
    id: 'buyers',
    label: 'Buyers',
    icon: 'Users',
    desc: 'Cotton mills, textile companies, and spinning units.',
    columns: [
      { key: 'id',      label: 'ID',      render: r => <span className="cell-mono">{r.id}</span> },
      { key: 'name',    label: 'Name',    render: r => <span className="cell-strong">{r.name}</span> },
      { key: 'station', label: 'Station', render: r => <span>{r.station}</span> },
      { key: 'state',   label: 'State',   render: r => <span className="muted">{r.state}</span> },
      { key: 'commPct', label: 'Comm %',  render: r => <span className="tnum">{r.commPct}%</span> },
      { key: 'conf',    label: 'Confs',   render: r => <span className="tnum">{r.conf}</span> },
      { key: 'status',  label: 'Status',  render: r => <Badge tone={r.status === 'active' ? 'success' : ''}>{r.status}</Badge> },
    ],
  },
  {
    id: 'sellers',
    label: 'Sellers',
    icon: 'Building',
    desc: 'Ginning factories, farmers, and agents supplying cotton.',
    columns: [
      { key: 'id',      label: 'ID',      render: r => <span className="cell-mono">{r.id}</span> },
      { key: 'name',    label: 'Name',    render: r => <span className="cell-strong">{r.name}</span> },
      { key: 'station', label: 'Station', render: r => <span>{r.station}</span> },
      { key: 'state',   label: 'State',   render: r => <span className="muted">{r.state}</span> },
      { key: 'commPct', label: 'Comm %',  render: r => <span className="tnum">{r.commPct}%</span> },
    ],
  },
  {
    id: 'varieties',
    label: 'Varieties',
    icon: 'Tag',
    desc: 'Cotton varieties and hybrids in your trading book.',
    columns: [
      { key: 'id',   label: 'ID',      render: r => <span className="cell-mono">{r.id}</span> },
      { key: 'name', label: 'Variety', render: r => <span className="cell-strong">{r.name}</span> },
    ],
  },
  {
    id: 'stations',
    label: 'Stations',
    icon: 'MapPin',
    desc: 'Trading hubs and ginning locations across regions.',
    columns: [
      { key: 'id',   label: 'ID',      render: r => <span className="cell-mono">{r.id}</span> },
      { key: 'name', label: 'Station', render: r => <span className="cell-strong">{r.name}</span> },
    ],
  },
  {
    id: 'payment-terms',
    label: 'Payment Terms',
    icon: 'IndianRupee',
    desc: 'Payment conditions used on contracts and invoices.',
    columns: [
      { key: 'name', label: 'Payment Term', render: r => (
        <span>
          <span className="cell-strong">{r.name}</span>
          <span className="cell-mono muted" style={{ display: 'block', fontSize: 11, marginTop: 1 }}>{r.short}</span>
        </span>
      )},
      { key: 'days', label: 'Days', render: r => (
        r.days < 0
          ? <Badge tone="info">Advance</Badge>
          : r.days === 0
          ? <span className="tnum">0 <span className="muted" style={{ fontSize: 11 }}>(immediate)</span></span>
          : <span className="tnum">{r.days} <span className="muted" style={{ fontSize: 11 }}>days</span></span>
      )},
      { key: 'status',  label: 'Status',     render: r => <Badge tone={r.status === 'active' ? 'success' : 'warn'}>{r.status}</Badge> },
      { key: 'used',    label: 'Contracts',  render: r => <span className="tnum">{r.used}</span> },
      { key: 'updated', label: 'Last Edited', render: r => <span className="muted">{r.updated}</span> },
    ],
  },
];

// ---- Shared drawer shell ----
const DrawerShell = ({ open, title, subtitle, onClose, onSave, saving, canSave, saveLabel, children }) => {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(12,10,9,0.38)',
        backdropFilter: 'blur(2px)', zIndex: 200,
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(520px, 100vw)',
        background: 'var(--bg)', boxShadow: 'var(--shadow-lg)',
        zIndex: 201, display: 'flex', flexDirection: 'column',
        borderLeft: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '18px 20px', background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 3, lineHeight: 1.4 }}>{subtitle}</div>}
          </div>
          <button className="btn btn-sm btn-ghost" onClick={onClose}><Icon.X size={14} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {children}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface)',
        }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={onSave} disabled={saving || !canSave}>
            <Icon.Check size={14} />{saving ? 'Saving…' : saveLabel}
          </button>
        </div>
      </div>
    </>
  );
};

// ---- Status toggle (reused by Buyer & PT) ----
const StatusToggle = ({ value, onChange }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
    {[
      { key: 'active',   label: 'Active',   sub: 'Available for new contracts', color: 'var(--positive)', accent: 'var(--accent)', accentFaint: 'var(--accent-faint)', borderColor: 'var(--accent)' },
      { key: 'deferred', label: 'Deferred', sub: 'Hidden from new contracts',   color: '#f59e0b',          accent: '#b45309',        accentFaint: 'rgba(245,158,11,0.07)', borderColor: '#f59e0b' },
    ].map(opt => {
      const on = value === opt.key;
      return (
        <button key={opt.key} type="button" onClick={() => onChange(opt.key)} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
          border: on ? `1.5px solid ${opt.borderColor}` : '1px solid var(--border)',
          background: on ? opt.accentFaint : 'var(--surface)',
          boxShadow: on ? `0 0 0 3px ${opt.accentFaint}` : 'none',
          transition: 'all 0.15s',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: on ? opt.color : 'var(--text-4)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: on ? opt.accent : 'var(--text-1)' }}>{opt.label}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 1 }}>{opt.sub}</div>
          </div>
          {on && <Icon.Check size={13} />}
        </button>
      );
    })}
  </div>
);

// ---- Buyer form ----
const BuyerForm = ({ form, setForm }) => {
  const upd = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  return (
    <>
      <div className="card">
        <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="card-title">Identity</div>
          <div className="card-sub">Name on contracts and registered details.</div>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <Field label="Legal name" required span={2}>
              <Input placeholder="e.g. Arvind Mills Ltd." value={form.name} onChange={upd('name')} autoFocus />
            </Field>
            <Field label="Short name">
              <Input placeholder="e.g. Arvind" value={form.short} onChange={upd('short')} />
            </Field>
            <div />
            <Field label="Station">
              <Select value={form.station} onChange={upd('station')}>
                {STATIONS.map(s => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="State" required>
              <Select value={form.state} onChange={upd('state')}>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="card-title">Contact</div>
          <div className="card-sub">Primary contact channels for the buyer.</div>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <Field label="Phone">
              <Input placeholder="+91 79 2680 1500" value={form.phone} onChange={upd('phone')} />
            </Field>
            <Field label="Mobile">
              <Input placeholder="+91 98250 12345" value={form.mobile} onChange={upd('mobile')} />
            </Field>
            <Field label="Email" span={2}>
              <Input type="email" placeholder="cotton@buyer.com" value={form.email} onChange={upd('email')} />
            </Field>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="card-title">Tax & Legal</div>
          <div className="card-sub">Identifiers used on invoices and statutory filings.</div>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <Field label="GSTIN">
              <Input placeholder="24AABCA1234F1Z5" value={form.gstin} onChange={upd('gstin')}
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }} />
            </Field>
            <Field label="PAN">
              <Input placeholder="AABCA1234F" value={form.pan} onChange={upd('pan')}
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }} />
            </Field>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="card-title">Commission & Status</div>
          <div className="card-sub">Default rate applied to new confirmations.</div>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Commission %">
            <div style={{ display: 'flex' }}>
              <Input type="number" step="0.25" value={form.commPct} className="tnum"
                style={{ borderRadius: 'var(--radius) 0 0 var(--radius)', width: 90 }}
                onChange={(e) => setForm(f => ({ ...f, commPct: parseFloat(e.target.value) || 0 }))} />
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '0 10px',
                height: 'var(--field-h)', border: '1px solid var(--border-strong)', borderLeft: 'none',
                borderRadius: '0 var(--radius) var(--radius) 0', background: 'var(--surface-2)',
                color: 'var(--text-3)', fontSize: 12, fontWeight: 500,
              }}>%</span>
            </div>
          </Field>
          <StatusToggle value={form.status} onChange={(v) => setForm(f => ({ ...f, status: v }))} />
        </div>
      </div>
    </>
  );
};

// ---- Seller form ----
const SellerForm = ({ form, setForm }) => {
  const upd = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  return (
    <>
      <div className="card">
        <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="card-title">Identity</div>
          <div className="card-sub">Name on contracts and registered details.</div>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <Field label="Legal name" required span={2}>
              <Input placeholder="e.g. Patel Ginning Mills" value={form.name} onChange={upd('name')} autoFocus />
            </Field>
            <Field label="Short name">
              <Input placeholder="e.g. Patel" value={form.short} onChange={upd('short')} />
            </Field>
            <div />
            <Field label="Station">
              <Select value={form.station} onChange={upd('station')}>
                {STATIONS.map(s => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="State" required>
              <Select value={form.state} onChange={upd('state')}>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="card-title">Commission</div>
          <div className="card-sub">Default rate applied to new confirmations.</div>
        </div>
        <div className="card-body">
          <Field label="Commission %">
            <div style={{ display: 'flex' }}>
              <Input type="number" step="0.25" value={form.commPct} className="tnum"
                style={{ borderRadius: 'var(--radius) 0 0 var(--radius)', width: 90 }}
                onChange={(e) => setForm(f => ({ ...f, commPct: parseFloat(e.target.value) || 0 }))} />
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '0 10px',
                height: 'var(--field-h)', border: '1px solid var(--border-strong)', borderLeft: 'none',
                borderRadius: '0 var(--radius) var(--radius) 0', background: 'var(--surface-2)',
                color: 'var(--text-3)', fontSize: 12, fontWeight: 500,
              }}>%</span>
            </div>
          </Field>
        </div>
      </div>
    </>
  );
};

// ---- Simple form (Variety or Station) ----
const SimpleForm = ({ form, setForm, label }) => (
  <div className="card">
    <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="card-title">{label} Details</div>
    </div>
    <div className="card-body">
      <Field label={`${label} name`} required>
        <Input
          placeholder={label === 'Variety' ? 'e.g. Shankar-6' : 'e.g. Guntur'}
          value={form.name}
          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          autoFocus
        />
      </Field>
    </div>
  </div>
);

// ---- Entity drawer (Buyer / Seller / Variety / Station) ----
const EntityDrawer = ({ type, open, editing, form, setForm, onClose, onSave, saving }) => {
  const LABELS = { buyer: 'Buyer', seller: 'Seller', variety: 'Variety', station: 'Station' };
  const label = LABELS[type] || '';
  return (
    <DrawerShell
      open={open}
      title={editing ? `Edit ${label}` : `Add ${label}`}
      subtitle={editing ? `Updating details for ${editing.name}.` : `Add a new ${label.toLowerCase()} to your trading book.`}
      onClose={onClose}
      onSave={onSave}
      saving={saving}
      canSave={form.name && form.name.trim()}
      saveLabel={editing ? `Update ${label}` : `Add ${label}`}
    >
      {type === 'buyer'   && <BuyerForm  form={form} setForm={setForm} />}
      {type === 'seller'  && <SellerForm form={form} setForm={setForm} />}
      {(type === 'variety' || type === 'station') && <SimpleForm form={form} setForm={setForm} label={label} />}
    </DrawerShell>
  );
};

// ---- Payment Terms drawer ----
const PTDrawer = ({ open, editing, form, setForm, onClose, onSave, saving }) => {
  const QUICK = [0, 7, 15, 30, 45, 60, 90];
  const stepBtn = {
    width: 32, height: 32, border: '1px solid var(--border)', background: 'var(--surface)',
    borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 15, color: 'var(--text-1)',
    display: 'grid', placeItems: 'center',
  };
  return (
    <DrawerShell
      open={open}
      title={editing ? 'Edit Payment Term' : 'Add Payment Term'}
      subtitle={editing
        ? `Update '${editing.name}' — changes apply to new contracts immediately.`
        : 'Define a new payment condition usable on contracts and invoices.'}
      onClose={onClose}
      onSave={onSave}
      saving={saving}
      canSave={form.name && form.name.trim() && form.short && form.short.trim()}
      saveLabel={editing ? 'Update Term' : 'Add Term'}
    >
      <div className="card">
        <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon.FileText size={13} />Terms Configuration
          </div>
          <div className="card-sub">How this payment condition appears on documents.</div>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Payment Term" required hint="Full name shown on contracts and invoices.">
            <Input placeholder="e.g. Net 30 Days" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
          </Field>
          <Field label="Short Name" required hint="Used in dropdowns & reports. 3–8 characters.">
            <Input placeholder="e.g. NET30" maxLength={8} value={form.short}
              onChange={e => setForm({ ...form, short: e.target.value.toUpperCase() })}
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }} />
          </Field>
          <Field label="Days" required hint="Number of days from invoice date to due date.">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button style={stepBtn} type="button"
                onClick={() => setForm(f => ({ ...f, days: Math.max(0, (f.days | 0) - 1) }))}>−</button>
              <Input type="number" value={form.days}
                style={{ width: 80, textAlign: 'center', fontFamily: 'var(--font-mono)' }}
                onChange={e => setForm({ ...form, days: parseInt(e.target.value) || 0 })} />
              <button style={stepBtn} type="button"
                onClick={() => setForm(f => ({ ...f, days: (f.days | 0) + 1 }))}>+</button>
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>days from invoice</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {QUICK.map(d => (
                <button key={d} type="button"
                  className={`btn btn-sm ${form.days === d ? 'btn-primary' : ''}`}
                  onClick={() => setForm({ ...form, days: d })}
                  style={{ fontFamily: 'var(--font-mono)', minWidth: 40 }}>
                  {d === 0 ? 'COD' : `${d}d`}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="card-title">Status</div>
          <div className="card-sub">Deferred terms won't appear in new contract dropdowns.</div>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <StatusToggle value={form.status} onChange={(v) => setForm({ ...form, status: v })} />
          <div style={{
            background: 'var(--surface-2)', border: '1px dashed var(--border)',
            borderRadius: 10, overflow: 'hidden',
          }}>
            <div style={{
              padding: '6px 14px', background: 'var(--surface)',
              borderBottom: '1px dashed var(--border)',
              fontSize: 10, color: 'var(--text-3)', letterSpacing: '.1em', fontWeight: 600,
            }}>PREVIEW</div>
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[['Subtotal', '₹ 12,50,000.00'], ['GST (5%)', '₹ 62,500.00']].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-2)', fontVariantNumeric: 'tabular-nums' }}>
                  <span>{l}</span><span>{v}</span>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between', fontSize: 13,
                fontWeight: 600, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums',
                borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4,
              }}>
                <span>Total Payable</span><span>₹ 13,12,500.00</span>
              </div>
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--border)', fontSize: 12, color: 'var(--text-2)' }}>
                Payment due in{' '}
                <strong>{form.days < 0 ? '— advance —' : form.days === 0 ? 'cash on delivery' : `${form.days} days`}</strong>
                <span style={{ color: 'var(--text-3)' }}> · {form.short || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DrawerShell>
  );
};

// ---- Entity defaults & helpers ----
const ENTITY_EMPTY = {
  buyer:   { name: '', short: '', station: STATIONS[0] || '', state: STATES ? STATES[0] : '', gstin: '', pan: '', phone: '', mobile: '', email: '', commPct: 1.5, status: 'active' },
  seller:  { name: '', short: '', station: STATIONS[0] || '', state: STATES ? STATES[0] : '', commPct: 0.5 },
  variety: { name: '' },
  station: { name: '' },
};

const fillEntityForm = (type, r) => {
  if (!r) return { ...ENTITY_EMPTY[type] };
  if (type === 'buyer')  return { name: r.name, short: r.short || '', station: r.station, state: r.state, gstin: r.gstin || '', pan: r.pan || '', phone: r.phone || '', mobile: r.mobile || '', email: r.email || '', commPct: r.commPct, status: r.status || 'active' };
  if (type === 'seller') return { name: r.name, short: r.short || '', station: r.station, state: r.state, commPct: r.commPct };
  return { name: r.name };
};

const TAB_TYPE = { buyers: 'buyer', sellers: 'seller', varieties: 'variety', stations: 'station' };

// ---- Masters screen ----
const Masters = ({ onOpen, onCmd }) => {
  const [activeTab, setActiveTab] = React.useState('buyers');
  const ctrl = useTableControls(MASTER_COL_DEFS[activeTab] || []);
  const [exportMode, setExportMode] = React.useState(false);
  const [exportSel,  setExportSel]  = React.useState([]);
  const [fmtOpen,    setFmtOpen]    = React.useState(false);

  React.useEffect(() => { ctrl.clearAll(); setExportMode(false); setExportSel([]); }, [activeTab]);

  // Local data (mutable copies)
  const [buyers, setBuyers] = React.useState(BUYERS);
  const [sellers, setSellers] = React.useState(SELLERS);
  const [localVarieties, setLocalVarieties] = React.useState(
    () => VARIETIES.map((v, i) => ({ id: `VAR-${String(i + 1).padStart(3, '0')}`, name: v }))
  );
  const [localStations, setLocalStations] = React.useState(
    () => STATIONS.map((s, i) => ({ id: `STN-${String(i + 1).padStart(3, '0')}`, name: s }))
  );

  // Entity drawer state (buyers / sellers / varieties / stations)
  const [entityDrawerOpen, setEntityDrawerOpen] = React.useState(false);
  const [entityType, setEntityType] = React.useState(null);
  const [entityEditing, setEntityEditing] = React.useState(null);
  const [entityForm, setEntityForm] = React.useState({});
  const [entitySaving, setEntitySaving] = React.useState(false);

  // Payment Terms state
  const [ptTerms, setPtTerms] = React.useState(PAYMENT_TERMS);
  const [ptDrawerOpen, setPtDrawerOpen] = React.useState(false);
  const [ptEditing, setPtEditing] = React.useState(null);
  const [ptForm, setPtForm] = React.useState({ name: '', short: '', days: 30, status: 'active' });
  const [ptSaving, setPtSaving] = React.useState(false);

  // ---- Column visibility state (one Set per tab) ----
  const [buyerVis,   setBuyerVis]   = React.useState(() => _defaultVis(_BUYERS_COLS));
  const [sellerVis,  setSellerVis]  = React.useState(() => _defaultVis(_SELLERS_COLS));
  const [varietyVis, setVarietyVis] = React.useState(() => _defaultVis(_VARIETIES_COLS));
  const [stationVis, setStationVis] = React.useState(() => _defaultVis(_STATIONS_COLS));
  const [ptVis,      setPtVis]      = React.useState(() => _defaultVis(_PT_COLS));

  const _visMap = {
    buyers:          { vis: buyerVis,   setVis: setBuyerVis   },
    sellers:         { vis: sellerVis,  setVis: setSellerVis  },
    varieties:       { vis: varietyVis, setVis: setVarietyVis },
    stations:        { vis: stationVis, setVis: setStationVis },
    'payment-terms': { vis: ptVis,      setVis: setPtVis      },
  };

  // ---- Unified data map ----
  const localData = { buyers, sellers, varieties: localVarieties, stations: localStations, 'payment-terms': ptTerms };

  const tab     = MASTER_TABS.find(t => t.id === activeTab);
  const tabData = localData[activeTab] || [];
  const colDefs = MASTER_COL_DEFS[activeTab] || [];
  const filtered = ctrl.sortData(ctrl.filterData(tabData));
  const allExpSel = filtered.length > 0 && filtered.every(r => exportSel.includes(r.id || r.name));

  const _dl = (content, filename, mime) => {
    const blob = new Blob(['﻿', content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const doExport = (fmt) => {
    const rows = filtered.filter(r => exportSel.includes(r.id || r.name));
    const cols = colDefs.map(c => ({ h: c.label, v: r => r[c.field] ?? '' }));
    const esc  = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    if (fmt === 'csv') {
      _dl([cols.map(c => esc(c.h)).join(','), ...rows.map(r => cols.map(c => esc(c.v(r))).join(','))].join('\r\n'), `${activeTab}.csv`, 'text/csv');
    } else if (fmt === 'excel') {
      const th = `<tr>${cols.map(c => `<th>${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(r => `<tr>${cols.map(c => `<td>${c.v(r)}</td>`).join('')}</tr>`).join('');
      _dl(`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/></head><body><table>${th}${tb}</table></body></html>`, `${activeTab}.xls`, 'application/vnd.ms-excel');
    } else if (fmt === 'word') {
      const th = `<tr>${cols.map(c => `<th>${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(r => `<tr>${cols.map(c => `<td>${c.v(r)}</td>`).join('')}</tr>`).join('');
      _dl(`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"/></head><body><h2>${tab.label}</h2><table border="1">${th}${tb}</table></body></html>`, `${activeTab}.doc`, 'application/msword');
    } else if (fmt === 'pdf') {
      const th = `<tr>${cols.map(c => `<th style="padding:8px;border:1px solid #ddd;background:#f5f5f5;text-align:left">${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(r => `<tr>${cols.map(c => `<td style="padding:8px;border:1px solid #ddd">${c.v(r)}</td>`).join('')}</tr>`).join('');
      const w = window.open('', '_blank');
      w.document.write(`<!DOCTYPE html><html><head><title>${tab.label}</title><style>body{font-family:sans-serif;padding:24px}table{border-collapse:collapse;width:100%}@media print{button{display:none}}</style></head><body><h2>${tab.label}</h2><table>${th}${tb}</table><script>setTimeout(()=>window.print(),400)<\/script></body></html>`);
      w.document.close();
    }
    setFmtOpen(false); setExportMode(false); setExportSel([]);
  };

  // ---- Entity drawer handlers ----
  const openEntityDrawer = (type, r) => {
    setEntityType(type);
    setEntityEditing(r);
    setEntityForm(fillEntityForm(type, r));
    setEntityDrawerOpen(true);
  };

  const saveEntity = () => {
    setEntitySaving(true);
    setTimeout(() => {
      const form = entityForm;
      const id = entityEditing?.id;
      if (entityType === 'buyer') {
        if (id) setBuyers(prev => prev.map(b => b.id === id ? { ...b, ...form } : b));
        else     setBuyers(prev => [...prev, { id: `B-${1100 + prev.length}`, ...form, outstanding: 0, conf: 0, baleComm: 0 }]);
      } else if (entityType === 'seller') {
        if (id) setSellers(prev => prev.map(s => s.id === id ? { ...s, ...form } : s));
        else     setSellers(prev => [...prev, { id: `S-${2060 + prev.length}`, ...form }]);
      } else if (entityType === 'variety') {
        if (id) setLocalVarieties(prev => prev.map(v => v.id === id ? { ...v, ...form } : v));
        else     setLocalVarieties(prev => [...prev, { id: `VAR-${String(prev.length + 1).padStart(3, '0')}`, ...form }]);
      } else if (entityType === 'station') {
        if (id) setLocalStations(prev => prev.map(s => s.id === id ? { ...s, ...form } : s));
        else     setLocalStations(prev => [...prev, { id: `STN-${String(prev.length + 1).padStart(3, '0')}`, ...form }]);
      }
      setEntitySaving(false);
      setEntityDrawerOpen(false);
    }, 400);
  };

  // ---- PT drawer handlers ----
  const openAddPT = () => { setPtEditing(null); setPtForm({ name: '', short: '', days: 30, status: 'active' }); setPtDrawerOpen(true); };
  const openEditPT = (r) => { setPtEditing(r); setPtForm({ name: r.name, short: r.short, days: r.days, status: r.status }); setPtDrawerOpen(true); };
  const savePT = () => {
    setPtSaving(true);
    setTimeout(() => {
      if (ptEditing) setPtTerms(ts => ts.map(t => t.id === ptEditing.id ? { ...t, ...ptForm, updated: 'Just now' } : t));
      else { const id = 'PT-' + String(ptTerms.length + 1).padStart(3, '0'); setPtTerms(ts => [{ id, ...ptForm, used: 0, updated: 'Just now' }, ...ts]); }
      setPtSaving(false);
      setPtDrawerOpen(false);
    }, 500);
  };

  // ---- Handlers ----
  const addLabel = { buyers: 'Buyer', sellers: 'Seller', varieties: 'Variety', stations: 'Station', 'payment-terms': 'Payment Term' }[activeTab];

  const handleAdd = () => {
    if (activeTab === 'payment-terms') openAddPT();
    else if (TAB_TYPE[activeTab]) openEntityDrawer(TAB_TYPE[activeTab], null);
  };

  const handleRowClick = (r) => {
    if (activeTab === 'payment-terms') openEditPT(r);
    else if (TAB_TYPE[activeTab]) openEntityDrawer(TAB_TYPE[activeTab], r);
  };

  const isClickable = !!TAB_TYPE[activeTab] || activeTab === 'payment-terms';

  return (
    <div className="content-inner wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">Masters</h1>
          <div className="page-sub">Manage buyers, sellers, varieties, stations, and payment terms across the platform.</div>
        </div>
        <div className="page-actions">
          {exportMode ? (
            <>
              <button className="btn btn-primary" disabled={exportSel.length === 0} onClick={() => setFmtOpen(true)}>
                <Icon.Download size={14} /> {exportSel.length > 0 ? `Export ${exportSel.length}` : 'Export'}
              </button>
              <button className="btn" onClick={() => { setExportMode(false); setExportSel([]); }}>
                <Icon.X size={14} /> Cancel
              </button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => setExportMode(true)}><Icon.Download size={14} /> Export</button>
              <button className="btn btn-primary" onClick={handleAdd}><Icon.Plus size={14} /> Add {addLabel}</button>
            </>
          )}
        </div>
      </div>

      {/* Tab selector — 5 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {MASTER_TABS.map(t => {
          const Ic = Icon[t.icon] || Icon.Tag;
          const isActive = t.id === activeTab;
          const count = (localData[t.id] || []).length;
          return (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setSearch(''); }} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 10, textAlign: 'left',
              border: isActive ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              background: isActive ? 'var(--accent-faint)' : 'var(--surface)',
              cursor: 'pointer', transition: 'all 0.15s',
              boxShadow: isActive ? '0 0 0 3px var(--accent-faint)' : 'none',
            }}>
              <span style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                background: isActive ? 'var(--accent)' : 'var(--surface-2)',
                color: isActive ? 'var(--accent-text)' : 'var(--text-2)',
                display: 'grid', placeItems: 'center', transition: 'all 0.15s',
              }}>
                <Ic size={15} />
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <span style={{
                  fontWeight: 600, fontSize: 12.5, color: isActive ? 'var(--accent)' : 'var(--text-1)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{t.label}</span>
                <span style={{ fontSize: 11, color: isActive ? 'var(--accent)' : 'var(--text-3)' }}>
                  {count} records
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Table card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">{tab.label}</div>
          <ViewMenu
            cols={_VIS_SPECS[activeTab]}
            visible={_visMap[activeTab].vis}
            onChange={_visMap[activeTab].setVis}
          />
        </div>
        <div style={{ padding:'0 16px 4px' }}>
          <FilterToolbar ctrl={ctrl} columnDefs={colDefs} totalCount={tabData.length} filteredCount={filtered.length} />
        </div>

        {(() => {
          const activeVis = _visMap[activeTab].vis;
          const visibleCols = tab.columns.filter(c => activeVis.has(c.key));
          return (
            <table className="tbl">
              <thead>
                <tr>
                  {exportMode && (
                    <th style={{ width:36, paddingLeft:14 }}>
                      <input type="checkbox" checked={allExpSel}
                        onChange={e => setExportSel(e.target.checked ? filtered.map(r => r.id || r.name) : [])} />
                    </th>
                  )}
                  {visibleCols.map(c => {
                    const def = colDefs.find(d => d.field === c.key);
                    return def
                      ? <SortableHeader key={c.key} field={c.key} label={c.label} ctrl={ctrl} />
                      : <th key={c.key}>{c.label}</th>;
                  })}
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const rowKey = r.id || r.name;
                  return (
                    <tr key={rowKey} style={{ cursor: isClickable ? 'pointer' : 'default' }}
                      onClick={() => exportMode
                        ? setExportSel(prev => prev.includes(rowKey) ? prev.filter(x => x !== rowKey) : [...prev, rowKey])
                        : handleRowClick(r)}>
                      {exportMode && (
                        <td onClick={e => e.stopPropagation()} style={{ paddingLeft:14 }}>
                          <input type="checkbox" checked={exportSel.includes(rowKey)}
                            onChange={() => setExportSel(prev => prev.includes(rowKey) ? prev.filter(x => x !== rowKey) : [...prev, rowKey])} />
                        </td>
                      )}
                      {visibleCols.map(c => <td key={c.key}>{c.render(r)}</td>)}
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-sm btn-ghost"
                          style={{ visibility: isClickable ? 'visible' : 'hidden' }}
                          onClick={e => { e.stopPropagation(); handleRowClick(r); }}>
                          <Icon.Edit size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={visibleCols.length + (exportMode ? 2 : 1)} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)', fontSize: 13 }}>
                      No {tab.label.toLowerCase()} match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          );
        })()}
      </div>

      {fmtOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
             onClick={() => setFmtOpen(false)}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:24, width:400, maxWidth:'100%', boxShadow:'0 8px 40px rgba(0,0,0,.18)' }}
               onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:700, fontSize:15, color:'var(--text-1)', marginBottom:6 }}>Choose export format</div>
            <div style={{ fontSize:12.5, color:'var(--text-3)', marginBottom:20 }}>Exporting {exportSel.length} {tab.label.toLowerCase()} record{exportSel.length !== 1 ? 's' : ''}</div>
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

      <EntityDrawer
        type={entityType}
        open={entityDrawerOpen}
        editing={entityEditing}
        form={entityForm}
        setForm={setEntityForm}
        onClose={() => setEntityDrawerOpen(false)}
        onSave={saveEntity}
        saving={entitySaving}
      />

      <PTDrawer
        open={ptDrawerOpen}
        editing={ptEditing}
        form={ptForm}
        setForm={setPtForm}
        onClose={() => setPtDrawerOpen(false)}
        onSave={savePT}
        saving={ptSaving}
      />
    </div>
  );
};

window.Masters = Masters;
