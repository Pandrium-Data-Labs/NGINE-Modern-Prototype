// Company Settings — create / edit workspace companies

const { useState: _csUseState } = React;
const { Field, Input, Select, Textarea } = window.UI;

const _FY_OPTS       = ['FY 2023–24', 'FY 2024–25', 'FY 2025–26', 'FY 2026–27'];
const _INDUSTRY_OPTS = ['Cotton Brokerage', 'Cotton Trading', 'Ginning & Pressing', 'Textile Mills', 'Export House', 'Other'];
const _STATE_OPTS    = ['Andhra Pradesh', 'Telangana', 'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Madhya Pradesh', 'Rajasthan', 'Punjab', 'Haryana', 'Other'];

const CompanySettings = ({ companies, setCompanies, currentId, setCurrentCompany, onCmd }) => {
  const [editing,    setEditing]    = _csUseState(null); // null = list | 'new' | company.id
  const [form,       setForm]       = _csUseState({});
  const [delConfirm, setDelConfirm] = _csUseState(null);
  const [errors,     setErrors]     = _csUseState({});

  const F = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(er => ({ ...er, [k]: null }));
  };

  const openNew = () => {
    setForm({ id:'', name:'', short:'', fy:'FY 2025–26', gst:'', pan:'', phone:'', email:'', address:'', state:'', industry:'Cotton Brokerage' });
    setErrors({});
    setEditing('new');
  };

  const openEdit = (c) => {
    setForm({ ...c });
    setErrors({});
    setEditing(c.id);
  };

  const close = () => { setEditing(null); setForm({}); setErrors({}); };

  const validate = () => {
    const e = {};
    if (!form.name || !form.name.trim()) e.name = 'Company name is required';
    if (!form.fy)                         e.fy   = 'Fiscal year is required';
    if (form.gst && form.gst.length > 0 && form.gst.length !== 15)
      e.gst = 'GSTIN must be 15 characters';
    if (form.pan && form.pan.length > 0 && form.pan.length !== 10)
      e.pan = 'PAN must be 10 characters';
    return e;
  };

  const save = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    if (editing === 'new') {
      const id = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '').slice(0, 20)
               + '_' + Date.now().toString(36);
      setCompanies(prev => [...prev, { ...form, id }]);
    } else {
      setCompanies(prev => prev.map(c => c.id === editing ? { ...form } : c));
    }
    close();
    onCmd('saved');
  };

  const del = (id) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
    setDelConfirm(null);
    onCmd('saved');
  };

  const ErrMsg = ({ field }) => errors[field]
    ? <div style={{ fontSize:11.5, color:'var(--negative)', marginTop:4 }}>{errors[field]}</div>
    : null;

  // ── Form view ────────────────────────────────────────────────────────────
  if (editing !== null) {
    const isNew = editing === 'new';
    return (
      <div className="content-inner narrow">
        <div className="page-header">
          <div>
            <h1 className="page-title">{isNew ? 'New Company' : 'Edit Company'}</h1>
            <div className="page-sub">
              {isNew ? 'Register a new workspace for your trading desk' : `Editing details for ${form.name}`}
            </div>
          </div>
          <div className="page-actions">
            <button className="btn" onClick={close}><Icon.X size={14} /> Cancel</button>
            <button className="btn btn-primary" onClick={save}><Icon.Save size={14} /> Save company</button>
          </div>
        </div>

        {/* Identity */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Company identity</div>
            <div className="card-sub">Basic information shown in the workspace switcher</div>
          </div>
          <div className="card-body">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div style={{ gridColumn:'1 / -1' }}>
                <Field label="Company name" required>
                  <Input
                    value={form.name || ''}
                    onChange={F('name')}
                    placeholder="e.g. Aravind Cotton Co."
                    style={{ borderColor: errors.name ? 'var(--negative)' : undefined }}
                  />
                  <ErrMsg field="name" />
                </Field>
              </div>
              <Field label="Short name">
                <Input value={form.short || ''} onChange={F('short')} placeholder="e.g. Aravind (used in compact views)" />
              </Field>
              <Field label="Fiscal year" required>
                <Select value={form.fy || 'FY 2025–26'} onChange={F('fy')} style={{ borderColor: errors.fy ? 'var(--negative)' : undefined }}>
                  {_FY_OPTS.map(y => <option key={y} value={y}>{y}</option>)}
                </Select>
                <ErrMsg field="fy" />
              </Field>
              <Field label="Industry">
                <Select value={form.industry || ''} onChange={F('industry')}>
                  <option value="">— Select —</option>
                  {_INDUSTRY_OPTS.map(i => <option key={i} value={i}>{i}</option>)}
                </Select>
              </Field>
              <Field label="State">
                <Select value={form.state || ''} onChange={F('state')}>
                  <option value="">— Select —</option>
                  {_STATE_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
            </div>
          </div>
        </div>

        {/* Tax */}
        <div className="card" style={{ marginTop:14 }}>
          <div className="card-header">
            <div className="card-title">Tax &amp; compliance</div>
            <div className="card-sub">Used on invoices and commission documents</div>
          </div>
          <div className="card-body">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <Field label="GSTIN">
                <input
                  className="input cell-mono"
                  value={form.gst || ''}
                  onChange={F('gst')}
                  placeholder="37AABCA1234F1Z5"
                  maxLength={15}
                  style={{ textTransform:'uppercase', borderColor: errors.gst ? 'var(--negative)' : undefined }}
                />
                <ErrMsg field="gst" />
              </Field>
              <Field label="PAN">
                <input
                  className="input cell-mono"
                  value={form.pan || ''}
                  onChange={F('pan')}
                  placeholder="AABCA1234F"
                  maxLength={10}
                  style={{ textTransform:'uppercase', borderColor: errors.pan ? 'var(--negative)' : undefined }}
                />
                <ErrMsg field="pan" />
              </Field>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card" style={{ marginTop:14 }}>
          <div className="card-header">
            <div className="card-title">Contact &amp; address</div>
          </div>
          <div className="card-body">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <Field label="Phone">
                <Input value={form.phone || ''} onChange={F('phone')} placeholder="+91 XXXXX XXXXX" />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email || ''} onChange={F('email')} placeholder="contact@company.com" />
              </Field>
              <div style={{ gridColumn:'1 / -1' }}>
                <Field label="Address">
                  <Textarea value={form.address || ''} onChange={F('address')} placeholder="Street, City, State — PIN" rows={3} />
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:16 }}>
          <button className="btn" onClick={close}>Cancel</button>
          <button className="btn btn-primary" onClick={save}><Icon.Save size={14} /> Save company</button>
        </div>
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────
  return (
    <div className="content-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Settings</h1>
          <div className="page-sub">
            Manage workspace companies · {companies.length} registered
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openNew}>
            <Icon.Plus size={14} /> New company
          </button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16 }}>
        {companies.map(company => {
          const isActive = company.id === currentId;
          const hasDetails = company.gst || company.state || company.phone || company.email;
          return (
            <div key={company.id} className="card" style={{ border: isActive ? '2px solid var(--accent)' : '1px solid var(--border)', position:'relative' }}>

              {isActive && (
                <div style={{ position:'absolute', top:12, right:12, fontSize:10, fontWeight:700, letterSpacing:'.08em', color:'var(--accent)', background:'var(--surface-2)', padding:'2px 8px', borderRadius:99, textTransform:'uppercase' }}>
                  Active
                </div>
              )}

              <div className="card-body">
                {/* Identity */}
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                  <div style={{ width:46, height:46, borderRadius:11, background: isActive ? 'var(--accent)' : 'var(--surface-2)', display:'grid', placeItems:'center', fontSize:20, fontWeight:700, color: isActive ? '#fff' : 'var(--text-3)', flexShrink:0 }}>
                    {(company.short || company.name).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14, color:'var(--text-1)', lineHeight:1.3 }}>{company.name}</div>
                    <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>
                      {company.fy}
                      {company.industry ? <span> · {company.industry}</span> : null}
                    </div>
                  </div>
                </div>

                {/* Details */}
                {hasDetails ? (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 14px', marginBottom:14, padding:'10px 12px', background:'var(--surface-2)', borderRadius:8 }}>
                    {company.gst && (
                      <div>
                        <div style={{ fontSize:10, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em' }}>GSTIN</div>
                        <div className="cell-mono" style={{ fontSize:11.5, color:'var(--text-1)', marginTop:2 }}>{company.gst}</div>
                      </div>
                    )}
                    {company.state && (
                      <div>
                        <div style={{ fontSize:10, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em' }}>State</div>
                        <div style={{ fontSize:11.5, color:'var(--text-1)', marginTop:2 }}>{company.state}</div>
                      </div>
                    )}
                    {company.phone && (
                      <div>
                        <div style={{ fontSize:10, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em' }}>Phone</div>
                        <div style={{ fontSize:11.5, color:'var(--text-1)', marginTop:2 }}>{company.phone}</div>
                      </div>
                    )}
                    {company.email && (
                      <div>
                        <div style={{ fontSize:10, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em' }}>Email</div>
                        <div style={{ fontSize:11.5, color:'var(--text-1)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{company.email}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ marginBottom:14, padding:'8px 12px', background:'var(--surface-2)', borderRadius:8, fontSize:12, color:'var(--text-3)', fontStyle:'italic' }}>
                    No additional details — click Edit to fill in
                  </div>
                )}

                {/* Actions */}
                <div style={{ display:'flex', gap:7, justifyContent:'flex-end', alignItems:'center' }}>
                  {!isActive && (
                    <button className="btn btn-sm" onClick={() => { setCurrentCompany(company.id); onCmd('saved'); }}>
                      <Icon.Check size={12} /> Set active
                    </button>
                  )}
                  <button className="btn btn-sm" onClick={() => openEdit(company)}>
                    <Icon.Edit size={12} /> Edit
                  </button>
                  {companies.length > 1 && !isActive && (
                    <button
                      className="btn btn-sm"
                      style={{ color:'var(--negative)', borderColor:'rgba(239,68,68,.35)' }}
                      onClick={() => setDelConfirm(company.id)}
                    >
                      <Icon.Trash size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete confirmation modal */}
      {delConfirm && (() => {
        const target = companies.find(c => c.id === delConfirm);
        return (
          <div
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
            onClick={() => setDelConfirm(null)}
          >
            <div
              style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:24, width:380, boxShadow:'0 20px 60px rgba(0,0,0,.22)' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ fontWeight:700, fontSize:15, color:'var(--text-1)', marginBottom:8 }}>Remove company?</div>
              <div style={{ fontSize:13, color:'var(--text-3)', marginBottom:20, lineHeight:1.6 }}>
                <strong style={{ color:'var(--text-1)' }}>{target?.name}</strong> will be removed from your workspace list. Any data linked to this company will not be deleted.
              </div>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button className="btn" onClick={() => setDelConfirm(null)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  style={{ background:'var(--negative)', borderColor:'var(--negative)' }}
                  onClick={() => del(delConfirm)}
                >
                  <Icon.Trash size={13} /> Remove
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

window.CompanySettings = CompanySettings;
