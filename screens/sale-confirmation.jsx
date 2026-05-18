// Sale Confirmation — trade entry form + workflow sidebar

const { Field, Input, Select, Textarea, Checkbox, Radio, Badge, Section, DatePicker, TagInput, fmtINR, fmtNum } = window.UI;

// ----- Workflow sidebar -----
const ConfSidebar = ({ prefill, deliveries, invoices, onCmd, form, onTagsChange, editMode }) => {
  const pct          = prefill.balesMin ? Math.round(((prefill.delivered || 0) / prefill.balesMin) * 100) : 0;
  const deliveryDone = pct >= 100;
  const invoiced     = prefill.invoiced;
  const paid         = prefill.payment === 'paid';
  const partial      = prefill.payment === 'partial';

  const totalBalesDelivered = deliveries.reduce((s, d) => s + (d.bales || 0), 0);
  const totalInvoiced       = invoices.reduce((s, i) => s + (i.amount || 0), 0);

  const f = form || prefill;
  const balesVal = f.balesMin && f.balesMax && String(f.balesMin) !== String(f.balesMax)
    ? `${fmtNum(parseInt(f.balesMin))} – ${fmtNum(parseInt(f.balesMax))}`
    : fmtNum(parseInt(f.balesMin || prefill.balesMin || 0));

  const DEAL_ITEMS = [
    { bg:'rgba(37,99,235,.12)',   color:'#2563eb', icon:'Bale',        label:'Bales',        value: balesVal },
    { bg:'rgba(234,179,8,.12)',   color:'#a16207', icon:'IndianRupee', label:'Candy rate',   value: f.candyRt ? `₹${fmtNum(parseInt(f.candyRt))} per candy` : '—' },
    { bg:'rgba(139,92,246,.12)',  color:'#7c3aed', icon:'Tag',         label:'Terms',        value: f.paymentTerms || '—' },
    { bg:'rgba(16,185,129,.12)',  color:'#059669', icon:'Lock',        label:'Transit risk', value: f.delivery === 'Mill door' ? "Buyer's a/c" : f.delivery ? "Seller's a/c" : '—' },
  ];

  // First incomplete step drives the primary CTA (invoice is auto-generated with delivery)
  const primary = !deliveryDone ? 'delivery' : (!paid && !partial) ? 'payment' : null;

  const ActionBtn = ({ id, icon: Ic, label, done, onClick }) => (
    <button
      className={`btn${primary === id ? ' btn-primary' : ''}`}
      style={{ justifyContent:'flex-start', width:'100%', gap:8 }}
      onClick={onClick}
    >
      <Ic size={13} />
      <span style={{ flex:1 }}>{label}</span>
      {done && <Icon.Check size={11} style={{ opacity:.7 }} />}
    </button>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

      {/* Quick actions */}
      <div className="card">
        <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
          <div className="card-title" style={{ fontSize:12 }}>Quick actions</div>
        </div>
        <div className="card-body" style={{ padding:'8px 12px 12px', display:'flex', flexDirection:'column', gap:6 }}>
          <ActionBtn id="delivery" icon={Icon.Truck}  label="Record delivery" done={deliveryDone} onClick={() => onCmd({ action:'new:delivery', confNo: prefill.no })} />
          <ActionBtn id="payment"  icon={Icon.Wallet} label="Record payment"  done={paid}         onClick={() => onCmd('nav:payment')} />
          <div style={{ borderTop:'1px solid var(--border)', margin:'2px 0' }} />
          <button className="btn btn-ghost" style={{ justifyContent:'flex-start', width:'100%', gap:8 }} onClick={() => onCmd('export')}>
            <Icon.Download size={13} /> Print confirmation
          </button>
        </div>
      </div>

      {/* Activity — right after Quick actions */}
      <div className="card">
        <div className="card-body" style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ fontSize:11, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', fontWeight:600, marginBottom:2 }}>Activity</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div style={{ background:'var(--surface-2)', borderRadius:8, padding:'10px 12px' }}>
              <div style={{ fontSize:10, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', fontWeight:600, marginBottom:4 }}>Bales delivered</div>
              <div style={{ fontSize:22, fontWeight:700, color:'var(--text-1)', lineHeight:1 }}>{fmtNum(totalBalesDelivered)}</div>
              <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>{deliveries.length} delivery</div>
            </div>
            <div style={{ background:'var(--surface-2)', borderRadius:8, padding:'10px 12px' }}>
              <div style={{ fontSize:10, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', fontWeight:600, marginBottom:4 }}>Total invoiced</div>
              <div style={{ fontSize:18, fontWeight:700, color:'var(--text-1)', lineHeight:1 }}>{totalInvoiced ? fmtINR(totalInvoiced, { compact:true }) : '₹0'}</div>
              <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Deal at a Glance + Overview — combined */}
      <div className="card">
        <div className="card-body" style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ fontSize:11, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', fontWeight:600, marginBottom:2 }}>Deal at a Glance</div>
          {DEAL_ITEMS.map((item) => {
            const IconComp = Icon[item.icon] || Icon.Tag;
            return (
              <div key={item.label} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:item.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <IconComp size={12} style={{ color:item.color }} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:10, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', fontWeight:600 }}>{item.label}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.value}</div>
                </div>
              </div>
            );
          })}

          {/* Overview — merged below */}
          <div style={{ borderTop:'1px solid var(--border)', paddingTop:10, marginTop:2, display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ fontSize:11, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', fontWeight:600, marginBottom:2 }}>Overview</div>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:12.5, color:'var(--text-2)' }}>Delivery</span>
                <span style={{ fontSize:12.5, fontWeight:600, color: deliveryDone ? 'var(--positive)' : 'var(--text-1)' }}>{pct}%</span>
              </div>
              <div style={{ height:4, background:'var(--surface-2)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ width:`${Math.min(pct,100)}%`, height:'100%', background: deliveryDone ? 'var(--positive)' : 'var(--accent)', borderRadius:2 }} />
              </div>
              <div style={{ fontSize:11, color:'var(--text-3)', marginTop:4 }}>{prefill.delivered} of {prefill.balesMin} bales</div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:2, borderTop:'1px solid var(--border)' }}>
              <span style={{ fontSize:12.5, color:'var(--text-2)' }}>Invoice</span>
              <span style={{ fontSize:12, fontWeight:500, color: invoiced ? 'var(--positive)' : 'var(--text-3)' }}>
                {invoiced ? 'Raised' : 'Not raised'}
              </span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid var(--border)', paddingTop:2 }}>
              <span style={{ fontSize:12.5, color:'var(--text-2)' }}>Payment</span>
              <Badge tone={paid ? 'success' : partial ? 'warn' : ''}>
                {paid ? 'Paid' : partial ? 'Partial' : 'Pending'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Linked records */}
      {(deliveries.length > 0 || invoices.length > 0) && (
        <div className="card">
          <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
            <div className="card-title" style={{ fontSize:12 }}>Linked records</div>
          </div>
          <div className="card-body" style={{ padding:'4px 16px 10px' }}>
            {deliveries.length > 0 && (
              <div
                style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom: invoices.length ? '1px solid var(--border)' : 'none', cursor:'pointer' }}
                onClick={() => document.getElementById('sc-deliveries')?.scrollIntoView({ behavior:'smooth', block:'start' })}
              >
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <Icon.Truck size={12} style={{ color:'var(--text-3)' }} />
                  <span style={{ fontSize:13, color:'var(--accent)' }}>Deliveries</span>
                </div>
                <span style={{ fontSize:13, fontWeight:600 }}>{deliveries.length}</span>
              </div>
            )}
            {invoices.length > 0 && (
              <div
                style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', cursor:'pointer' }}
                onClick={() => document.getElementById('sc-invoices')?.scrollIntoView({ behavior:'smooth', block:'start' })}
              >
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <Icon.Receipt size={12} style={{ color:'var(--text-3)' }} />
                  <span style={{ fontSize:13, color:'var(--accent)' }}>Invoices</span>
                </div>
                <span style={{ fontSize:13, fontWeight:600 }}>{invoices.length}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags — editable only in edit mode */}
      <div className="card">
        <div className="card-body" style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ fontSize:11, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', fontWeight:600 }}>Tags</div>
          <TagInput
            value={f.tags || []}
            onChange={onTagsChange || (() => {})}
            suggestions={[...new Set([...window.NCData.CONFIRMATIONS.flatMap(c => c.tags || [])])]}
            placeholder={editMode ? 'Add tags…' : ''}
            disabled={!editMode}
          />
          {!editMode && (!f.tags || f.tags.length === 0) && (
            <span style={{ fontSize:12, color:'var(--text-3)' }}>No tags</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ----- Sale Confirmation form -----
const SaleConfirmation = ({ onClose, onCmd, prefill, extraConfirmations = [], onNavigate }) => {
  const isNew = !prefill;
  const [editMode, setEditMode]   = React.useState(isNew);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [tab, setTab]             = React.useState('details');

  // Previous / Next navigation
  const allConfs   = [...extraConfirmations, ...window.NCData.CONFIRMATIONS];
  const currentIdx = prefill ? allConfs.findIndex(c => c.no === prefill.no) : -1;
  const hasPrev    = !editMode && currentIdx > 0;
  const hasNext    = !editMode && currentIdx < allConfs.length - 1;
  const goPrev     = () => hasPrev && onNavigate && onNavigate(allConfs[currentIdx - 1]);
  const goNext     = () => hasNext && onNavigate && onNavigate(allConfs[currentIdx + 1]);

  const [form, setForm] = React.useState({
    confNo:          prefill?.no || 'SC-26-0143',
    date:            prefill?.date ? `${prefill.date.getFullYear()}-${String(prefill.date.getMonth()+1).padStart(2,'0')}-${String(prefill.date.getDate()).padStart(2,'0')}` : '2026-05-12',
    buyer:           prefill?.buyer || '',
    seller:          prefill?.seller || '',
    station:         prefill?.station || '',
    variety:         prefill?.variety || '',
    balesMin:        prefill?.balesMin || '',
    balesMax:        prefill?.balesMax || '',
    candyRt:         prefill?.candyRt || '',
    paymentTerms:    'Net 30',
    delivery:        'Mill door',
    company:         'Aravind Cotton Co.',
    insurance:       true,
    charity:         true,
    weighmentSeller: '',
    weighmentBuyer:  '',
    commPctBuyer:    1.5,
    commPctSeller:   0.5,
    baleCommBuyer:   0,
    baleCommSeller:  0,
    notes:           '',
    remarks:         '',
    tags:            prefill?.tags || [],
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }));

  const bales      = parseInt(form.balesMin || 0);
  const candyRt    = parseInt(form.candyRt || 0);
  const grossValue = bales * candyRt * 0.356;
  const commBuyer  = grossValue * (form.commPctBuyer / 100);
  const commSeller = grossValue * (form.commPctSeller / 100);

  const TABS = [
    { id: 'details',     label: 'Confirmation' },
    { id: 'commission',  label: 'Commission' },
    { id: 'notes',       label: 'Notes' },
    { id: 'attachments', label: 'Attachments' },
    { id: 'remarks',     label: 'Additional' },
  ];

  const invoices   = window.NCData.INVOICES.filter(inv => inv.conf === form.confNo);
  const deliveries = window.NCData.DELIVERIES.filter(d => d.conf === form.confNo);

  const handleInvoiceClick = (invNo) => { if (onCmd) onCmd(`open:invoice:${invNo}`); };
  const handleCancelEdit   = () => { if (isNew) onClose(); else setEditMode(false); };

  const badgeTone  = isNew ? 'info'  : editMode ? 'warn'    : 'success';
  const badgeLabel = isNew ? 'Draft' : editMode ? 'Editing' : 'Confirmed';

  const viewWrap = !editMode ? { pointerEvents:'none' } : {};

  return (
    <div className="content-inner wide">

      {/* Alert dialog */}
      {alertOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'24px 28px', width:420, maxWidth:'100%', boxShadow:'0 8px 40px rgba(0,0,0,.18)' }}>
            <div style={{ fontWeight:700, fontSize:16, color:'var(--text-1)', marginBottom:10 }}>Edit this confirmation?</div>
            <div style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.65, marginBottom:24 }}>
              This confirmation has already been issued. Editing it may affect linked invoices and deliveries. Make sure all parties are informed of any changes before proceeding.
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
              <button className="btn" onClick={() => setAlertOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setAlertOpen(false); setEditMode(true); }}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="page-header">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <h1 className="page-title" style={{ margin:0 }}>{prefill ? `Sale confirmation · ${prefill.no}` : 'New sale confirmation'}</h1>
            <Badge tone={badgeTone}>{badgeLabel}</Badge>
            {editMode && <span className="muted" style={{ fontSize:12 }}>Auto-saved 2 min ago</span>}
          </div>
          <div className="page-sub">Lock in a trade between buyer and seller. Fields marked <span style={{ color:'var(--negative)' }}>*</span> are required.</div>
        </div>
        <div className="page-actions">
          {!editMode && prefill && (
            <div className="doc-nav" style={{ display:'flex', alignItems:'center' }}>
              <button title="Previous confirmation" disabled={!hasPrev} onClick={goPrev}><Icon.ChevronLeft size={14} /></button>
              <span style={{ fontSize:11.5, color:'var(--text-3)', width:36, textAlign:'center', lineHeight:1, userSelect:'none', flexShrink:0 }}>{currentIdx + 1} / {allConfs.length}</span>
              <button title="Next confirmation" disabled={!hasNext} onClick={goNext}><Icon.ChevronRight size={14} /></button>
            </div>
          )}
          {!editMode ? (
            <button className="btn btn-primary" onClick={() => setAlertOpen(true)}><Icon.Edit size={14} /> Edit</button>
          ) : (
            <>
              <button className="btn" onClick={handleCancelEdit}><Icon.X size={14} /> Cancel</button>
              <button className="btn btn-primary" onClick={() => onCmd({ action:'saved:confirmation', data:{ ...form, isNew } })}><Icon.Check size={14} /> Save <span className="kbd-hint">F2</span></button>
            </>
          )}
        </div>
      </div>

      {/* Sub-nav */}
      <div className="subnav">
        {TABS.map(t => (
          <button key={t.id} className={`subnav-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Two-column layout: form | sidebar */}
      <div style={{ display:'grid', gridTemplateColumns: prefill ? 'minmax(0,1fr) 260px' : '1fr', gap:20, alignItems:'start' }}>

        {/* Left — tab content */}
        <div>
          {tab === 'details' && (
            <>
              <div style={viewWrap}>
                <div className="card">
                  <div className="card-body" style={{ padding:'6px 20px 10px' }}>
                    <Section title="Document">
                      <div className="form-grid">
                        <Field label="Confirmation no." required>
                          <Input value={form.confNo} onChange={set('confNo')} />
                        </Field>
                        <Field label="Date" required>
                          <DatePicker value={form.date} onChange={(v) => setForm(f => ({ ...f, date: v }))} disabled={!editMode} />
                        </Field>
                        <Field label="Company" required>
                          <Select value={form.company} onChange={set('company')}>
                            {window.NCData.COMPANIES.map(c => <option key={c}>{c}</option>)}
                          </Select>
                        </Field>
                        <Field label="Status">
                          <div style={{ display:'flex', gap:16, paddingTop:6 }}>
                            <Radio checked label="Active" />
                            <Radio label="Deferred" />
                          </div>
                        </Field>
                      </div>
                    </Section>

                    {isNew && (
                      <Section title="Tags">
                        <div className="form-grid">
                          <Field label="Tags" span={2} hint="Tags are inherited by all deliveries and invoices under this confirmation.">
                            <TagInput
                              value={form.tags}
                              onChange={(tags) => setForm(f => ({ ...f, tags }))}
                              suggestions={[...new Set([...window.NCData.CONFIRMATIONS.flatMap(c => c.tags || [])])]}
                              placeholder="Add tags… (press Enter or comma)"
                            />
                          </Field>
                        </div>
                      </Section>
                    )}

                    <Section title="Parties">
                      <div className="form-grid">
                        <Field label="Buyer" required span={2}>
                          <Select value={form.buyer} onChange={set('buyer')}>
                            <option value="">Select buyer…</option>
                            {window.NCData.BUYERS.map(b => <option key={b.id} value={b.name}>{b.name} · {b.station}</option>)}
                          </Select>
                        </Field>
                        <Field label="Seller" required span={2}>
                          <Select value={form.seller} onChange={set('seller')}>
                            <option value="">Select seller…</option>
                            {window.NCData.SELLERS.map(s => <option key={s.id} value={s.name}>{s.name} · {s.station}</option>)}
                          </Select>
                        </Field>
                        <Field label="Sub-broker" optional>
                          <Select><option>—</option><option>Mahesh Brokers</option><option>K R Cotton Agency</option></Select>
                        </Field>
                        <Field label="Station" required>
                          <Select value={form.station} onChange={set('station')}>
                            <option value="">Select station…</option>
                            {window.NCData.STATIONS.map(s => <option key={s}>{s}</option>)}
                          </Select>
                        </Field>
                      </div>
                    </Section>

                    <Section title="Lot">
                      <div className="form-grid">
                        <Field label="Cotton variety" required>
                          <Select value={form.variety} onChange={set('variety')}>
                            <option value="">Select variety…</option>
                            {window.NCData.VARIETIES.map(v => <option key={v}>{v}</option>)}
                          </Select>
                        </Field>
                        <Field label="Candy rate" required hint="₹ per candy of 356 kg">
                          <div className="input-group">
                            <span className="input-prefix">₹</span>
                            <Input type="number" placeholder="56,250" value={form.candyRt} onChange={set('candyRt')} className="input tnum" />
                          </div>
                        </Field>
                        <Field label="Bales · min" required>
                          <Input type="number" placeholder="200" value={form.balesMin} onChange={set('balesMin')} className="input tnum" />
                        </Field>
                        <Field label="Bales · max" optional hint="Same as min if fixed">
                          <Input type="number" placeholder="220" value={form.balesMax} onChange={set('balesMax')} className="input tnum" />
                        </Field>
                        <Field label="Payment terms" required>
                          <Select value={form.paymentTerms} onChange={set('paymentTerms')}>
                            <option>Net 7</option><option>Net 15</option><option>Net 30</option><option>Net 45</option><option>LC at sight</option>
                          </Select>
                        </Field>
                        <Field label="Delivery basis">
                          <Select value={form.delivery} onChange={set('delivery')}>
                            <option>Mill door</option><option>Ex-station</option><option>FOR destination</option>
                          </Select>
                        </Field>
                      </div>
                    </Section>

                    <Section title="Weighment & charges">
                      <div className="form-grid">
                        <Field label="Buyer weighment">
                          <Select><option>Mill weight</option><option>Station weight</option></Select>
                        </Field>
                        <Field label="Seller weighment">
                          <Select><option>Station weight</option><option>Mill weight</option></Select>
                        </Field>
                        <Field label="Insurance">
                          <Checkbox checked={form.insurance} onChange={(v) => setForm(f => ({ ...f, insurance:v }))} label="Insurance applicable" />
                        </Field>
                        <Field label="Charity">
                          <Checkbox checked={form.charity} onChange={(v) => setForm(f => ({ ...f, charity:v }))} label="Buyer participates in charity scheme" />
                        </Field>
                      </div>
                    </Section>
                  </div>

                  <div className="card-footer">
                    <div className="row-flex" style={{ gap:16 }}>
                      <div>
                        <div className="muted" style={{ fontSize:11 }}>Estimated gross value</div>
                        <div className="tnum strong" style={{ fontSize:18, letterSpacing:'-.01em' }}>
                          {bales && candyRt ? fmtINR(Math.round(grossValue), { compact:true }) : '—'}
                        </div>
                      </div>
                      <div>
                        <div className="muted" style={{ fontSize:11 }}>Buyer comm. ({form.commPctBuyer}%)</div>
                        <div className="tnum strong" style={{ fontSize:14 }}>{commBuyer ? fmtINR(Math.round(commBuyer)) : '—'}</div>
                      </div>
                      <div>
                        <div className="muted" style={{ fontSize:11 }}>Seller comm. ({form.commPctSeller}%)</div>
                        <div className="tnum strong" style={{ fontSize:14 }}>{commSeller ? fmtINR(Math.round(commSeller)) : '—'}</div>
                      </div>
                    </div>
                    {editMode && (
                      <div className="row-flex">
                        <button className="btn btn-primary btn-sm" onClick={() => onCmd({ action:'saved:confirmation', data:{ ...form, isNew } })}>Save & continue <span className="kbd-hint">⌘↵</span></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Deliveries — always interactive */}
              {deliveries.length > 0 && (
                <div id="sc-deliveries" className="card" style={{ marginTop:16 }}>
                  <div className="card-header">
                    <div className="card-title">Deliveries</div>
                    <span className="muted" style={{ fontSize:12 }}>{deliveries.length} lot{deliveries.length !== 1 ? 's' : ''}</span>
                  </div>
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th style={{ width:120 }}>Delivery ID</th>
                        <th>Date</th>
                        <th className="num">Bales</th>
                        <th className="num">Gross (kg)</th>
                        <th className="num">Tare (kg)</th>
                        <th className="num">Net (kg)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveries.map(d => (
                        <tr key={d.id}>
                          <td className="cell-mono cell-strong">{d.id}</td>
                          <td className="muted">{window.NCData.fmtDateShort(d.date)}</td>
                          <td className="num tnum">{d.bales}</td>
                          <td className="num tnum">{fmtNum(d.gross)}</td>
                          <td className="num tnum muted">{fmtNum(d.tare)}</td>
                          <td className="num tnum cell-strong">{fmtNum(d.net)}</td>
                          <td>
                            <Badge tone={d.status === 'Delivered' ? 'success' : d.status === 'In transit' ? 'info' : 'warn'}>
                              {d.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Seller Invoices — always interactive */}
              {invoices.length > 0 && (
                <div id="sc-invoices" className="card" style={{ marginTop:16 }}>
                  <div className="card-header">
                    <div className="card-title">Seller Invoices</div>
                    <span className="muted" style={{ fontSize:12 }}>{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</span>
                  </div>
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th style={{ width:130 }}>Invoice No</th>
                        <th>Date</th>
                        <th>Seller</th>
                        <th className="num">Amount</th>
                        <th className="num">Balance</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map(inv => (
                        <tr key={inv.no} style={{ cursor:'pointer' }} onClick={() => handleInvoiceClick(inv.no)}>
                          <td className="cell-mono cell-strong">{inv.no}</td>
                          <td className="muted">{window.NCData.fmtDateShort(inv.date)}</td>
                          <td className="cell-strong">{inv.seller}</td>
                          <td className="num tnum">{fmtINR(inv.amount, { compact:true })}</td>
                          <td className="num tnum cell-strong">{inv.balance ? fmtINR(inv.balance, { compact:true }) : '—'}</td>
                          <td><Badge tone={inv.status === 'paid' ? 'success' : inv.status === 'partial' ? 'warn' : 'danger'}>{inv.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {tab === 'commission' && (
            <div style={viewWrap}>
              <div className="card">
                <div className="card-body" style={{ padding:'6px 20px 16px' }}>
                  <Section title="Buyer commission">
                    <div className="form-grid">
                      <Field label="Commission %"><Input value={form.commPctBuyer} onChange={set('commPctBuyer')} className="input tnum" /></Field>
                      <Field label="Bale commission (₹/bale)"><Input value={form.baleCommBuyer} onChange={set('baleCommBuyer')} className="input tnum" /></Field>
                      <Field label="Agent / Sub-broker"><Select><option>—</option><option>Mahesh Brokers</option></Select></Field>
                      <Field label="Split %"><Input defaultValue="100" className="input tnum" /></Field>
                    </div>
                  </Section>
                  <Section title="Seller commission">
                    <div className="form-grid">
                      <Field label="Commission %"><Input value={form.commPctSeller} onChange={set('commPctSeller')} className="input tnum" /></Field>
                      <Field label="Bale commission (₹/bale)"><Input value={form.baleCommSeller} onChange={set('baleCommSeller')} className="input tnum" /></Field>
                      <Field label="Agent / Sub-broker"><Select><option>—</option></Select></Field>
                      <Field label="Split %"><Input defaultValue="100" className="input tnum" /></Field>
                    </div>
                  </Section>
                </div>
              </div>
            </div>
          )}

          {tab === 'notes' && (
            <div style={viewWrap}>
              <div className="card">
                <div className="card-body">
                  <Field label="Internal notes" hint="Visible to your team. Not printed on confirmation.">
                    <Textarea rows="6" placeholder="Trade history, special instructions, customer asks…" value={form.notes} onChange={set('notes')} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {tab === 'attachments' && (
            <div className="card">
              <div className="card-body">
                <div style={{ border:'1px dashed var(--border-strong)', borderRadius:8, padding:'40px 24px', textAlign:'center', color:'var(--text-3)' }}>
                  <Icon.Upload size={20} />
                  <div style={{ marginTop:8, fontSize:13, color:'var(--text-1)', fontWeight:500 }}>Drop files or click to browse</div>
                  <div style={{ marginTop:4, fontSize:12 }}>Signed contract PDF, quality reports, lab samples — up to 10 MB each</div>
                </div>
              </div>
            </div>
          )}

          {tab === 'remarks' && (
            <div style={viewWrap}>
              <div className="card">
                <div className="card-body">
                  <Field label="Additional remarks" hint="Will appear on the printed confirmation footer.">
                    <Textarea rows="4" placeholder="e.g. Delivery to commence within 7 days of confirmation. Seller to provide arrival samples…" value={form.remarks} onChange={set('remarks')} />
                  </Field>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right — sticky sidebar (existing confirmations only) */}
        {prefill && (
          <div style={{ position:'sticky', top:16 }}>
            <ConfSidebar prefill={prefill} deliveries={deliveries} invoices={invoices} onCmd={onCmd} form={form} onTagsChange={(tags) => setForm(f => ({ ...f, tags }))} editMode={editMode} />
          </div>
        )}
      </div>
    </div>
  );
};

window.SaleConfirmation = SaleConfirmation;
