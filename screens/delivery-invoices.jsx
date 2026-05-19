// Delivery & Invoices Combined Page

const { Field, Input, Select, Badge, Section, DatePicker, TagInput, fmtNum, fmtINR, ViewMenu } = window.UI;
const { DELIVERIES, CONFIRMATIONS, STATIONS, fmtDateShort, fmtDate, INVOICES } = window.NCData;
const { useTableControls, SortableHeader } = window.TableFilters;

const DELIVERY_COLS = [
  { field:'id',     label:'Delivery ID', type:'text'   },
  { field:'conf',   label:'Conf No.',    type:'text'   },
  { field:'date',   label:'Date',        type:'date'   },
  { field:'bales',  label:'Bales',       type:'number' },
  { field:'status', label:'Status',      type:'select', options:['In transit','Mill passing','Delivered'] },
];
const INVOICE_COLS = [
  { field:'no',     label:'Invoice No.', type:'text'   },
  { field:'conf',   label:'Conf No.',    type:'text'   },
  { field:'date',   label:'Date',        type:'date'   },
  { field:'seller', label:'Seller',      type:'text'   },
  { field:'amount', label:'Amount',      type:'number' },
  { field:'status', label:'Status',      type:'select', options:['unpaid','partial','paid'] },
];

const _DEL_COLS = [
  { field:'id',     label:'Delivery ID', defaultOn:true  },
  { field:'conf',   label:'Conf No.',    defaultOn:true  },
  { field:'date',   label:'Date',        defaultOn:true  },
  { field:'bales',  label:'Bales',       defaultOn:true  },
  { field:'gross',  label:'Gross wt',    defaultOn:false },
  { field:'tare',   label:'Tare',        defaultOn:false },
  { field:'net',    label:'Net wt',      defaultOn:false },
  { field:'tags',   label:'Tags',        defaultOn:true  },
  { field:'status', label:'Status',      defaultOn:true  },
];

const _INV_DI_COLS = [
  { field:'no',     label:'Invoice No.', defaultOn:true  },
  { field:'conf',   label:'Conf No.',    defaultOn:true  },
  { field:'date',   label:'Date',        defaultOn:true  },
  { field:'seller', label:'Seller',      defaultOn:true  },
  { field:'amount', label:'Amount',      defaultOn:true  },
  { field:'tags',   label:'Tags',        defaultOn:false },
  { field:'status', label:'Pay Status',  defaultOn:true  },
];

const SearchBox = ({ value, onChange, placeholder }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 6,
    border: '1px solid var(--border)', borderRadius: 6,
    padding: '3px 8px', background: 'var(--bg-2)', width: 210,
  }}>
    <Icon.Search size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        border: 'none', background: 'transparent', outline: 'none',
        fontSize: 12.5, color: 'var(--text-1)', flex: 1, minWidth: 0,
      }}
    />
    <button
      onClick={() => onChange('')}
      style={{
        border: 'none', background: 'transparent', cursor: value ? 'pointer' : 'default',
        padding: 0, lineHeight: 1, color: 'var(--text-3)',
        opacity: value ? 1 : 0, pointerEvents: value ? 'auto' : 'none',
        transition: 'opacity 0.15s',
      }}
    >
      <Icon.X size={12} />
    </button>
  </div>
);

const sortToTop = (items, matchFn) => {
  const matched = items.filter(matchFn);
  const rest = items.filter(i => !matchFn(i));
  return [...matched, ...rest];
};

// ----- New Delivery form -----
const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

const NewDelivery = ({ onClose, onCmd, prefillConfNo = '' }) => {
  const [form, setForm] = React.useState({
    deliveryId:    'DL-26-0313',
    date:          todayStr,
    confNo:        prefillConfNo,
    bales:         '',
    gross:         '',
    tare:          '',
    status:        'In transit',
    notes:         '',
    tags:          [],
    invoiceNo:     'INV-26-0893',
    invoiceAmount: '',
    invoiceStatus: 'unpaid',
  });
  const [amountEdited, setAmountEdited] = React.useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }));

  const net        = (parseInt(form.gross) || 0) - (parseInt(form.tare) || 0);
  const linkedConf = CONFIRMATIONS.find(c => c.no === form.confNo);
  const remaining  = linkedConf ? linkedConf.balesMin - (linkedConf.delivered || 0) : null;
  const pctDelivered = linkedConf && linkedConf.balesMin
    ? Math.round(((linkedConf.delivered || 0) / linkedConf.balesMin) * 100) : 0;

  // 1 candy = 356 kg; auto-calculate invoice amount when net weight and candy rate are known
  const calcAmount = linkedConf && net > 0 ? Math.round((net / 356) * linkedConf.candyRt) : 0;
  React.useEffect(() => {
    if (calcAmount > 0 && !amountEdited) {
      setForm(f => ({ ...f, invoiceAmount: String(calcAmount) }));
    }
  }, [calcAmount]);

  const handleSave = () => {
    onCmd({ action: 'saved:delivery', data: form });
    onCmd({ action: 'saved:invoice', data: {
      invoiceNo:  form.invoiceNo,
      date:       form.date,
      deliveryId: form.deliveryId,
      confNo:     form.confNo,
      seller:     linkedConf?.seller || '',
      amount:     form.invoiceAmount,
      status:     form.invoiceStatus,
    }});
    onClose();
  };

  return (
    <div className="content-inner wide">
      <div className="page-header">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <button className="btn btn-sm btn-ghost" onClick={onClose}><Icon.ChevronLeft size={14} /> Back</button>
            <Badge tone="info">Draft</Badge>
          </div>
          <h1 className="page-title">New delivery</h1>
          <div className="page-sub">Record a physical lot — an invoice is generated automatically. Fields marked <span style={{ color:'var(--negative)' }}>*</span> are required.</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={onClose}><Icon.X size={14} /> Cancel</button>
          <button className="btn" onClick={() => { onCmd({ action:'saved:draft' }); onClose(); }}><Icon.Save size={14} /> Save draft</button>
          <button className="btn btn-primary" onClick={handleSave}><Icon.Check size={14} /> Save delivery & invoice</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 260px', gap:20, alignItems:'start' }}>

        {/* Left — form */}
        <div className="card">
          <div className="card-body" style={{ padding:'6px 20px 16px' }}>

            <Section title="Document">
              <div className="form-grid">
                <Field label="Delivery ID">
                  <Input value={form.deliveryId} readOnly style={{ color:'var(--text-3)', background:'var(--surface-2)' }} />
                </Field>
                <Field label="Date" required>
                  <DatePicker value={form.date} onChange={(v) => setForm(f => ({ ...f, date: v }))} />
                </Field>
                <Field label="Confirmation no." required span={2}>
                  <Select value={form.confNo} onChange={set('confNo')}>
                    <option value="">Select confirmation…</option>
                    {CONFIRMATIONS.filter(c => c.status !== 'closed').map(c => (
                      <option key={c.no} value={c.no}>{c.no} · {c.buyer}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </Section>

            <Section title="Lot">
              <div className="form-grid">
                <Field label="Bales" required>
                  <Input type="number" placeholder="150" value={form.bales} onChange={set('bales')} className="input tnum" />
                </Field>
                <Field label="Status" required>
                  <Select value={form.status} onChange={set('status')}>
                    <option>In transit</option>
                    <option>Mill passing</option>
                    <option>Delivered</option>
                  </Select>
                </Field>
              </div>
            </Section>

            <Section title="Weighment">
              <div className="form-grid">
                <Field label="Gross weight (kg)" required>
                  <div className="input-group">
                    <Input type="number" placeholder="26,000" value={form.gross} onChange={set('gross')} className="input tnum" />
                    <span className="input-suffix">kg</span>
                  </div>
                </Field>
                <Field label="Tare weight (kg)" required>
                  <div className="input-group">
                    <Input type="number" placeholder="420" value={form.tare} onChange={set('tare')} className="input tnum" />
                    <span className="input-suffix">kg</span>
                  </div>
                </Field>
                <Field label="Net weight (kg)">
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div className="input tnum" style={{ flex:1, color:'var(--text-1)', fontWeight:600, background:'var(--surface-2)', userSelect:'none' }}>
                      {net > 0 ? fmtNum(net) : '—'}
                    </div>
                    {form.gross && form.tare && net > 0 && (
                      <span style={{ fontSize:11.5, color:'var(--text-3)' }}>
                        {((parseInt(form.tare) / parseInt(form.gross)) * 100).toFixed(2)}% tare
                      </span>
                    )}
                  </div>
                </Field>
                <Field label="Weighment slip no." optional>
                  <Input placeholder="WS-2026-0091" value={form.slipNo} onChange={set('slipNo')} />
                </Field>
              </div>
            </Section>

            <Section title="Notes">
              <div className="form-grid">
                <Field label="Internal notes" optional span={2}>
                  <textarea className="input textarea" rows="3" placeholder="Driver name, vehicle no., special handling…" value={form.notes} onChange={set('notes')} />
                </Field>
              </div>
            </Section>

            <Section title="Tags">
              <div className="form-grid">
                {linkedConf && (linkedConf.tags || []).length > 0 && (
                  <Field label="Inherited from confirmation" span={2}>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4, paddingTop:4 }}>
                      {(linkedConf.tags || []).map(tag => {
                        const { bg, color } = window.tagColor(tag);
                        return (
                          <span key={tag} style={{ display:'inline-flex', alignItems:'center', gap:4, borderRadius:999, padding:'3px 9px', fontSize:11.5, fontWeight:500, background:bg, color }}>
                            <Icon.Lock size={9} />{tag}
                          </span>
                        );
                      })}
                    </div>
                  </Field>
                )}
                <Field label="Delivery tags" span={2} hint="Additional tags for this delivery. Inherited tags cannot be removed.">
                  <TagInput
                    value={form.tags}
                    onChange={(tags) => setForm(f => ({ ...f, tags }))}
                    suggestions={[...new Set([...CONFIRMATIONS.flatMap(c => c.tags || [])])]}
                    placeholder="Add tags… (press Enter or comma)"
                  />
                </Field>
              </div>
            </Section>

            {/* Invoice — auto-generated alongside the delivery */}
            <div style={{ borderTop:'2px dashed var(--border)', margin:'16px 0 4px', paddingTop:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <Icon.Receipt size={14} style={{ color:'var(--text-3)' }} />
                <span style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.05em' }}>Auto-generated invoice</span>
                <span className="cell-mono muted" style={{ fontSize:11 }}>{form.invoiceNo}</span>
              </div>
              <div className="form-grid">
                <Field label="Invoice amount (₹)" required hint={calcAmount > 0 && amountEdited ? `Calculated: ₹${fmtNum(calcAmount)}` : undefined}>
                  <div style={{ display:'flex', gap:6 }}>
                    <div className="input-group" style={{ flex:1 }}>
                      <span className="input-prefix">₹</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={form.invoiceAmount}
                        onChange={e => { setAmountEdited(true); set('invoiceAmount')(e); }}
                        className="input tnum"
                      />
                    </div>
                    {amountEdited && calcAmount > 0 && (
                      <button className="btn btn-sm" style={{ flexShrink:0, fontSize:11 }}
                        onClick={() => { setForm(f => ({ ...f, invoiceAmount: String(calcAmount) })); setAmountEdited(false); }}>
                        Reset
                      </button>
                    )}
                  </div>
                </Field>
                <Field label="Payment status" required>
                  <Select value={form.invoiceStatus} onChange={set('invoiceStatus')}>
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </Select>
                </Field>
              </div>
            </div>

          </div>

          <div className="card-footer">
            <div className="row-flex">
              <button className="btn btn-primary btn-sm" onClick={handleSave}>Save delivery & invoice <span className="kbd-hint">⌘↵</span></button>
            </div>
          </div>
        </div>

        {/* Right — linked confirmation sidebar */}
        <div style={{ position:'sticky', top:16, display:'flex', flexDirection:'column', gap:12 }}>

          {linkedConf ? (
            <>
              <div className="card">
                <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
                  <div className="card-title" style={{ fontSize:12 }}>Linked confirmation</div>
                  <span className="cell-mono muted" style={{ fontSize:11 }}>{linkedConf.no}</span>
                </div>
                <div className="card-body" style={{ padding:'8px 16px 14px', display:'flex', flexDirection:'column', gap:8, fontSize:12.5 }}>
                  {[['Buyer', linkedConf.buyer], ['Seller', linkedConf.seller], ['Station', linkedConf.station], ['Variety', linkedConf.variety]].map(([k, v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'var(--text-3)' }}>{k}</span>
                      <span style={{ fontWeight:500, textAlign:'right', maxWidth:150 }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--border)', paddingTop:8 }}>
                    <span style={{ color:'var(--text-3)' }}>Candy rate</span>
                    <span className="tnum" style={{ fontWeight:600 }}>₹{fmtNum(linkedConf.candyRt)}</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
                  <div className="card-title" style={{ fontSize:12 }}>Delivery progress</div>
                </div>
                <div className="card-body" style={{ padding:'8px 16px 14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12.5 }}>
                    <span style={{ color:'var(--text-2)' }}>Delivered so far</span>
                    <span style={{ fontWeight:600 }}>{pctDelivered}%</span>
                  </div>
                  <div style={{ height:5, background:'var(--surface-2)', borderRadius:3, overflow:'hidden', marginBottom:6 }}>
                    <div style={{ width:`${Math.min(pctDelivered,100)}%`, height:'100%', background: pctDelivered >= 100 ? 'var(--positive)' : 'var(--accent)', borderRadius:3 }} />
                  </div>
                  <div style={{ fontSize:11.5, color:'var(--text-3)' }}>
                    {linkedConf.delivered} of {linkedConf.balesMin} bales · <span style={{ color: remaining > 0 ? 'var(--warn)' : 'var(--positive)', fontWeight:500 }}>{remaining > 0 ? `${remaining} remaining` : 'Complete'}</span>
                  </div>
                </div>
              </div>

              {net > 0 && (
                <div className="card">
                  <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
                    <div className="card-title" style={{ fontSize:12 }}>Invoice preview</div>
                  </div>
                  <div className="card-body" style={{ padding:'8px 16px 14px', display:'flex', flexDirection:'column', gap:8, fontSize:12.5 }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'var(--text-3)' }}>Net weight</span>
                      <span className="tnum" style={{ fontWeight:500 }}>{fmtNum(net)} kg</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'var(--text-3)' }}>Candies</span>
                      <span className="tnum" style={{ fontWeight:500 }}>{(net / 356).toFixed(3)}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--border)', paddingTop:8 }}>
                      <span style={{ color:'var(--text-3)' }}>Calculated amount</span>
                      <span className="tnum" style={{ fontWeight:700, color:'var(--text-1)' }}>₹{fmtNum(calcAmount)}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card">
              <div className="card-body" style={{ padding:'24px 16px', textAlign:'center', color:'var(--text-3)' }}>
                <Icon.FileText size={20} />
                <div style={{ marginTop:8, fontSize:12.5, fontWeight:500, color:'var(--text-2)' }}>Select a confirmation</div>
                <div style={{ marginTop:4, fontSize:12 }}>Confirmation details and invoice preview will appear here.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const toDateStr = (d) => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : todayStr;

// ----- Alert dialog (shared) -----
const AlertDialog = ({ title, body, onCancel, onConfirm }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'24px 28px', width:420, maxWidth:'100%', boxShadow:'0 8px 40px rgba(0,0,0,.18)' }}>
      <div style={{ fontWeight:700, fontSize:16, color:'var(--text-1)', marginBottom:10 }}>{title}</div>
      <div style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.65, marginBottom:24 }}>{body}</div>
      <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={onConfirm}>Continue</button>
      </div>
    </div>
  </div>
);

// ----- Delivery detail / edit -----
const DeliveryDetail = ({ delivery, allDeliveries, allInvoices, onClose, onCmd, onNavigate }) => {
  const [editMode, setEditMode]   = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    id:     delivery.id,
    date:   toDateStr(delivery.date),
    confNo: delivery.conf,
    bales:  delivery.bales,
    gross:  delivery.gross,
    tare:   delivery.tare,
    status: delivery.status,
    notes:  '',
    slipNo: '',
    tags:   delivery.tags || [],
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }));

  const net        = (parseInt(form.gross) || 0) - (parseInt(form.tare) || 0);
  const linkedConf = CONFIRMATIONS.find(c => c.no === form.confNo);
  const viewWrap   = !editMode ? { pointerEvents:'none' } : {};

  const idx     = allDeliveries.findIndex(d => d.id === delivery.id);
  const hasPrev = !editMode && idx > 0;
  const hasNext = !editMode && idx < allDeliveries.length - 1;

  return (
    <div className="content-inner wide">
      {alertOpen && <AlertDialog
        title="Edit this delivery?"
        body="This delivery has been recorded. Editing it may affect linked invoices and shortage calculations. Ensure all parties are informed before making changes."
        onCancel={() => setAlertOpen(false)}
        onConfirm={() => { setAlertOpen(false); setEditMode(true); }}
      />}

      <div className="page-header">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <button className="btn btn-sm btn-ghost" onClick={onClose}><Icon.ChevronLeft size={14} /> Back</button>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <h1 className="page-title">{delivery.id}</h1>
            <Badge tone={editMode ? 'warn' : 'success'}>{editMode ? 'Editing' : 'Recorded'}</Badge>
          </div>
          <div className="page-sub">Linked to <span className="cell-mono">{form.confNo}</span> · {fmtDate(delivery.date)}</div>
        </div>
        <div className="page-actions">
          {!editMode && (
            <div className="doc-nav" style={{ display:'flex', alignItems:'center' }}>
              <button disabled={!hasPrev} onClick={() => hasPrev && onNavigate(allDeliveries[idx - 1])}><Icon.ChevronLeft size={14} /></button>
              <span style={{ fontSize:11.5, color:'var(--text-3)', width:36, textAlign:'center', lineHeight:1, userSelect:'none', flexShrink:0 }}>{idx + 1} / {allDeliveries.length}</span>
              <button disabled={!hasNext} onClick={() => hasNext && onNavigate(allDeliveries[idx + 1])}><Icon.ChevronRight size={14} /></button>
            </div>
          )}
          {!editMode ? (
            <button className="btn btn-primary" onClick={() => setAlertOpen(true)}><Icon.Edit size={14} /> Edit</button>
          ) : (
            <>
              <button className="btn" onClick={() => setEditMode(false)}><Icon.X size={14} /> Cancel</button>
              <button className="btn btn-primary" onClick={() => { onCmd('saved'); setEditMode(false); }}><Icon.Check size={14} /> Save</button>
            </>
          )}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 260px', gap:20, alignItems:'start' }}>
        <div style={viewWrap}>
          <div className="card">
            <div className="card-body" style={{ padding:'6px 20px 16px' }}>
              <Section title="Document">
                <div className="form-grid">
                  <Field label="Delivery ID">
                    <Input value={form.id} readOnly style={{ color:'var(--text-3)', background:'var(--surface-2)' }} />
                  </Field>
                  <Field label="Date" required>
                    <DatePicker value={form.date} onChange={(v) => setForm(f => ({ ...f, date: v }))} disabled={!editMode} />
                  </Field>
                  <Field label="Confirmation no." required span={2}>
                    <Select value={form.confNo} onChange={set('confNo')}>
                      {CONFIRMATIONS.map(c => <option key={c.no} value={c.no}>{c.no} · {c.buyer}</option>)}
                    </Select>
                  </Field>
                </div>
              </Section>
              <Section title="Lot">
                <div className="form-grid">
                  <Field label="Bales" required>
                    <Input type="number" value={form.bales} onChange={set('bales')} className="input tnum" />
                  </Field>
                  <Field label="Status" required>
                    <Select value={form.status} onChange={set('status')}>
                      <option>In transit</option>
                      <option>Mill passing</option>
                      <option>Delivered</option>
                    </Select>
                  </Field>
                </div>
              </Section>
              <Section title="Weighment">
                <div className="form-grid">
                  <Field label="Gross weight (kg)" required>
                    <div className="input-group">
                      <Input type="number" value={form.gross} onChange={set('gross')} className="input tnum" />
                      <span className="input-suffix">kg</span>
                    </div>
                  </Field>
                  <Field label="Tare weight (kg)" required>
                    <div className="input-group">
                      <Input type="number" value={form.tare} onChange={set('tare')} className="input tnum" />
                      <span className="input-suffix">kg</span>
                    </div>
                  </Field>
                  <Field label="Net weight (kg)">
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div className="input tnum" style={{ flex:1, fontWeight:600, background:'var(--surface-2)', userSelect:'none' }}>
                        {net > 0 ? fmtNum(net) : '—'}
                      </div>
                      {net > 0 && form.gross && (
                        <span style={{ fontSize:11.5, color:'var(--text-3)' }}>
                          {((parseInt(form.tare) / parseInt(form.gross)) * 100).toFixed(2)}% tare
                        </span>
                      )}
                    </div>
                  </Field>
                  <Field label="Weighment slip no." optional>
                    <Input placeholder="WS-2026-0091" value={form.slipNo} onChange={set('slipNo')} />
                  </Field>
                </div>
              </Section>
              <Section title="Notes">
                <div className="form-grid">
                  <Field label="Internal notes" optional span={2}>
                    <textarea className="input textarea" rows="3" placeholder="Driver name, vehicle no., special handling…" value={form.notes} onChange={set('notes')} />
                  </Field>
                </div>
              </Section>
            </div>
            <div className="card-footer">
              <div style={{ display:'flex', gap:16 }}>
                <div>
                  <div className="muted" style={{ fontSize:11 }}>Net weight</div>
                  <div className="tnum strong" style={{ fontSize:18 }}>{net > 0 ? fmtNum(net) + ' kg' : '—'}</div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize:11 }}>Bales</div>
                  <div className="tnum strong" style={{ fontSize:14 }}>{form.bales || '—'}</div>
                </div>
              </div>
              {editMode && (
                <button className="btn btn-primary btn-sm" onClick={() => { onCmd('saved'); setEditMode(false); }}>Save <span className="kbd-hint">⌘↵</span></button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position:'sticky', top:16, display:'flex', flexDirection:'column', gap:12 }}>
          {linkedConf ? (
            <div className="card">
              <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
                <div className="card-title" style={{ fontSize:12 }}>Linked confirmation</div>
                <span className="cell-mono muted" style={{ fontSize:11 }}>{linkedConf.no}</span>
              </div>
              <div className="card-body" style={{ padding:'8px 16px 14px', display:'flex', flexDirection:'column', gap:8, fontSize:12.5 }}>
                {[['Buyer', linkedConf.buyer], ['Seller', linkedConf.seller], ['Station', linkedConf.station], ['Variety', linkedConf.variety]].map(([k, v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--text-3)' }}>{k}</span>
                    <span style={{ fontWeight:500, textAlign:'right', maxWidth:150 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--border)', paddingTop:8 }}>
                  <span style={{ color:'var(--text-3)' }}>Candy rate</span>
                  <span className="tnum" style={{ fontWeight:600 }}>₹{fmtNum(linkedConf.candyRt)}</span>
                </div>
                {(linkedConf.tags || []).length > 0 && (
                  <div style={{ borderTop:'1px solid var(--border)', paddingTop:8 }}>
                    <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.04em', fontWeight:600 }}>Inherited tags</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                      {(linkedConf.tags || []).map(tag => {
                        const { bg, color } = window.tagColor(tag);
                        return <span key={tag} style={{ display:'inline-flex', borderRadius:999, padding:'2px 8px', fontSize:11.5, fontWeight:500, background:bg, color }}>{tag}</span>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body" style={{ padding:'24px 16px', textAlign:'center', color:'var(--text-3)' }}>
                <Icon.FileText size={18} />
                <div style={{ marginTop:8, fontSize:12.5, color:'var(--text-2)', fontWeight:500 }}>No confirmation linked</div>
              </div>
            </div>
          )}
          {(() => {
            const relInvoices = (allInvoices || []).filter(i => i.conf === form.confNo);
            if (!relInvoices.length) return null;
            return (
              <div className="card">
                <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
                  <div className="card-title" style={{ fontSize:12 }}>Linked invoices</div>
                  <span style={{ fontSize:11, color:'var(--text-3)' }}>{relInvoices.length}</span>
                </div>
                <div className="card-body" style={{ padding:'8px 0 8px', display:'flex', flexDirection:'column' }}>
                  {relInvoices.map(inv => (
                    <div key={inv.no} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 16px', borderBottom:'1px solid var(--border)', fontSize:12.5 }}>
                      <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                        <span className="cell-mono" style={{ fontSize:11.5, fontWeight:600 }}>{inv.no}</span>
                        <span style={{ color:'var(--text-3)', fontSize:11 }}>{fmtDateShort(inv.date)}</span>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2 }}>
                        <span className="tnum" style={{ fontWeight:600, fontSize:12 }}>₹{fmtNum(inv.amount)}</span>
                        <IPill status={inv.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          <div className="card">
            <div className="card-body" style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ fontSize:11, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', fontWeight:600 }}>Tags</div>
              {linkedConf && (linkedConf.tags || []).length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {(linkedConf.tags || []).map(tag => {
                    const { bg, color } = window.tagColor(tag);
                    return (
                      <span key={tag} style={{ display:'inline-flex', alignItems:'center', gap:3, borderRadius:999, padding:'2px 8px', fontSize:11.5, fontWeight:500, background:bg, color }}>
                        <Icon.Lock size={9} />{tag}
                      </span>
                    );
                  })}
                </div>
              )}
              <TagInput
                value={form.tags}
                onChange={(tags) => setForm(f => ({ ...f, tags }))}
                suggestions={[...new Set([...CONFIRMATIONS.flatMap(c => c.tags || [])])]}
                disabled={!editMode}
                placeholder={editMode ? 'Add tags…' : ''}
              />
              {!editMode && (!form.tags || form.tags.length === 0) && (!linkedConf || !(linkedConf.tags || []).length) && (
                <span style={{ fontSize:12, color:'var(--text-3)' }}>No tags</span>
              )}
            </div>
          </div>
          <div className="card">
            <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
              <div className="card-title" style={{ fontSize:12 }}>Actions</div>
            </div>
            <div className="card-body" style={{ padding:'8px 12px 12px', display:'flex', flexDirection:'column', gap:6 }}>
              <button className="btn" style={{ justifyContent:'flex-start', width:'100%', gap:8 }} onClick={() => onCmd('new:invoice')}>
                <Icon.Receipt size={13} /> Raise invoice
              </button>
              <button className="btn btn-ghost" style={{ justifyContent:'flex-start', width:'100%', gap:8 }} onClick={() => onCmd('export')}>
                <Icon.Download size={13} /> Print delivery note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----- Invoice detail / edit -----
const InvoiceDetail = ({ invoice, allInvoices, onClose, onCmd, onNavigate }) => {
  const [editMode, setEditMode]   = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    no:      invoice.no,
    date:    toDateStr(invoice.date),
    confNo:  invoice.conf,
    seller:  invoice.seller,
    amount:  invoice.amount,
    balance: invoice.balance || 0,
    status:  invoice.status,
    notes:   '',
    tags:    invoice.tags || [],
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }));

  const linkedConf     = CONFIRMATIONS.find(c => c.no === form.confNo);
  const linkedDelivery = DELIVERIES.find(d => d.conf === form.confNo);
  const inheritedTags  = [...new Set([...(linkedConf?.tags || []), ...(linkedDelivery?.tags || [])])];
  const viewWrap   = !editMode ? { pointerEvents:'none' } : {};

  const idx     = allInvoices.findIndex(inv => inv.no === invoice.no);
  const hasPrev = !editMode && idx > 0;
  const hasNext = !editMode && idx < allInvoices.length - 1;

  const statusTone = form.status === 'paid' ? 'success' : form.status === 'partial' ? 'warn' : 'danger';

  return (
    <div className="content-inner wide">
      {alertOpen && <AlertDialog
        title="Edit this invoice?"
        body="This invoice has been issued. Editing it may affect payment records and reconciliation. Ensure all parties are informed before making changes."
        onCancel={() => setAlertOpen(false)}
        onConfirm={() => { setAlertOpen(false); setEditMode(true); }}
      />}

      <div className="page-header">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <button className="btn btn-sm btn-ghost" onClick={onClose}><Icon.ChevronLeft size={14} /> Back</button>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <h1 className="page-title">{invoice.no}</h1>
            <Badge tone={editMode ? 'warn' : statusTone}>{editMode ? 'Editing' : form.status}</Badge>
          </div>
          <div className="page-sub">Seller invoice · {form.seller} · {fmtDate(invoice.date)}</div>
        </div>
        <div className="page-actions">
          {!editMode && (
            <div className="doc-nav" style={{ display:'flex', alignItems:'center' }}>
              <button disabled={!hasPrev} onClick={() => hasPrev && onNavigate(allInvoices[idx - 1])}><Icon.ChevronLeft size={14} /></button>
              <span style={{ fontSize:11.5, color:'var(--text-3)', width:36, textAlign:'center', lineHeight:1, userSelect:'none', flexShrink:0 }}>{idx + 1} / {allInvoices.length}</span>
              <button disabled={!hasNext} onClick={() => hasNext && onNavigate(allInvoices[idx + 1])}><Icon.ChevronRight size={14} /></button>
            </div>
          )}
          {!editMode ? (
            <button className="btn btn-primary" onClick={() => setAlertOpen(true)}><Icon.Edit size={14} /> Edit</button>
          ) : (
            <>
              <button className="btn" onClick={() => setEditMode(false)}><Icon.X size={14} /> Cancel</button>
              <button className="btn btn-primary" onClick={() => { onCmd('saved'); setEditMode(false); }}><Icon.Check size={14} /> Save</button>
            </>
          )}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 260px', gap:20, alignItems:'start' }}>
        <div style={viewWrap}>
          <div className="card">
            <div className="card-body" style={{ padding:'6px 20px 16px' }}>
              <Section title="Document">
                <div className="form-grid">
                  <Field label="Invoice no.">
                    <Input value={form.no} readOnly style={{ color:'var(--text-3)', background:'var(--surface-2)' }} />
                  </Field>
                  <Field label="Date" required>
                    <DatePicker value={form.date} onChange={(v) => setForm(f => ({ ...f, date: v }))} disabled={!editMode} />
                  </Field>
                  <Field label="Confirmation no." required>
                    <Select value={form.confNo} onChange={set('confNo')}>
                      {CONFIRMATIONS.map(c => <option key={c.no} value={c.no}>{c.no} · {c.buyer}</option>)}
                    </Select>
                  </Field>
                  <Field label="Seller" required>
                    <Select value={form.seller} onChange={set('seller')}>
                      {window.NCData.SELLERS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </Select>
                  </Field>
                </div>
              </Section>
              <Section title="Amounts">
                <div className="form-grid">
                  <Field label="Invoice amount (₹)" required>
                    <div className="input-group">
                      <span className="input-prefix">₹</span>
                      <Input type="number" value={form.amount} onChange={set('amount')} className="input tnum" />
                    </div>
                  </Field>
                  <Field label="Balance due (₹)" required>
                    <div className="input-group">
                      <span className="input-prefix">₹</span>
                      <Input type="number" value={form.balance} onChange={set('balance')} className="input tnum" />
                    </div>
                  </Field>
                  <Field label="Payment status" required>
                    <Select value={form.status} onChange={set('status')}>
                      <option value="unpaid">Unpaid</option>
                      <option value="partial">Partial</option>
                      <option value="paid">Paid</option>
                    </Select>
                  </Field>
                </div>
              </Section>
              <Section title="Notes">
                <div className="form-grid">
                  <Field label="Internal notes" optional span={2}>
                    <textarea className="input textarea" rows="3" placeholder="Payment reference, remarks…" value={form.notes} onChange={set('notes')} />
                  </Field>
                </div>
              </Section>

              <Section title="Tags">
                <div className="form-grid">
                  {inheritedTags.length > 0 && (
                    <Field label="Inherited from delivery" span={2}>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:4, paddingTop:4 }}>
                        {inheritedTags.map(tag => {
                          const { bg, color } = window.tagColor(tag);
                          return (
                            <span key={tag} style={{ display:'inline-flex', alignItems:'center', gap:4, borderRadius:999, padding:'3px 9px', fontSize:11.5, fontWeight:500, background:bg, color }}>
                              <Icon.Lock size={9} />{tag}
                            </span>
                          );
                        })}
                      </div>
                    </Field>
                  )}
                  <Field label="Invoice tags" span={2} hint="Additional tags specific to this invoice. Inherited tags cannot be removed.">
                    <TagInput
                      value={form.tags}
                      onChange={(tags) => setForm(f => ({ ...f, tags }))}
                      suggestions={[...new Set([...CONFIRMATIONS.flatMap(c => c.tags || [])])]}
                      disabled={!editMode}
                      placeholder="Add tags… (press Enter or comma)"
                    />
                  </Field>
                </div>
              </Section>
            </div>
            <div className="card-footer">
              <div style={{ display:'flex', gap:16 }}>
                <div>
                  <div className="muted" style={{ fontSize:11 }}>Invoice amount</div>
                  <div className="tnum strong" style={{ fontSize:18 }}>{fmtINR(parseInt(form.amount) || 0, { compact:true })}</div>
                </div>
                <div>
                  <div className="muted" style={{ fontSize:11 }}>Balance due</div>
                  <div className="tnum strong" style={{ fontSize:14, color: parseInt(form.balance) > 0 ? 'var(--negative)' : 'var(--positive)' }}>
                    {parseInt(form.balance) > 0 ? fmtINR(parseInt(form.balance), { compact:true }) : 'Cleared'}
                  </div>
                </div>
              </div>
              {editMode && (
                <button className="btn btn-primary btn-sm" onClick={() => { onCmd('saved'); setEditMode(false); }}>Save <span className="kbd-hint">⌘↵</span></button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position:'sticky', top:16, display:'flex', flexDirection:'column', gap:12 }}>
          {linkedDelivery && (
            <div className="card">
              <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
                <div className="card-title" style={{ fontSize:12 }}>Linked delivery</div>
                <span className="cell-mono muted" style={{ fontSize:11 }}>{linkedDelivery.id}</span>
              </div>
              <div className="card-body" style={{ padding:'8px 16px 14px', display:'flex', flexDirection:'column', gap:8, fontSize:12.5 }}>
                {[
                  ['Date',       fmtDateShort(linkedDelivery.date)],
                  ['Bales',      linkedDelivery.bales],
                  ['Net weight', fmtNum(linkedDelivery.net) + ' kg'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--text-3)' }}>{k}</span>
                    <span style={{ fontWeight:500 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--border)', paddingTop:8 }}>
                  <span style={{ color:'var(--text-3)' }}>Status</span>
                  <DPill status={linkedDelivery.status} />
                </div>
              </div>
            </div>
          )}
          {linkedConf && (
            <div className="card">
              <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
                <div className="card-title" style={{ fontSize:12 }}>Linked confirmation</div>
                <span className="cell-mono muted" style={{ fontSize:11 }}>{linkedConf.no}</span>
              </div>
              <div className="card-body" style={{ padding:'8px 16px 14px', display:'flex', flexDirection:'column', gap:8, fontSize:12.5 }}>
                {[['Buyer', linkedConf.buyer], ['Seller', linkedConf.seller], ['Station', linkedConf.station], ['Variety', linkedConf.variety]].map(([k, v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ color:'var(--text-3)' }}>{k}</span>
                    <span style={{ fontWeight:500, textAlign:'right', maxWidth:150 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--border)', paddingTop:8 }}>
                  <span style={{ color:'var(--text-3)' }}>Candy rate</span>
                  <span className="tnum" style={{ fontWeight:600 }}>₹{fmtNum(linkedConf.candyRt)}</span>
                </div>
                {(linkedConf.tags || []).length > 0 && (
                  <div style={{ borderTop:'1px solid var(--border)', paddingTop:8 }}>
                    <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.04em', fontWeight:600 }}>Inherited tags</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                      {(linkedConf.tags || []).map(tag => {
                        const { bg, color } = window.tagColor(tag);
                        return <span key={tag} style={{ display:'inline-flex', borderRadius:999, padding:'2px 8px', fontSize:11.5, fontWeight:500, background:bg, color }}>{tag}</span>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="card">
            <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
              <div className="card-title" style={{ fontSize:12 }}>Actions</div>
            </div>
            <div className="card-body" style={{ padding:'8px 12px 12px', display:'flex', flexDirection:'column', gap:6 }}>
              <button className="btn" style={{ justifyContent:'flex-start', width:'100%', gap:8 }} onClick={() => onCmd('nav:payment')}>
                <Icon.Wallet size={13} /> Record payment
              </button>
              <button className="btn btn-ghost" style={{ justifyContent:'flex-start', width:'100%', gap:8 }} onClick={() => onCmd('export')}>
                <Icon.Download size={13} /> Print invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----- New Invoice form -----
const NewInvoice = ({ onClose, onCmd, allDeliveries }) => {
  const [form, setForm] = React.useState({
    invoiceNo: 'INV-26-0893',
    date:      todayStr,
    deliveryId: '',
    confNo:    '',
    seller:    '',
    amount:    '',
    status:    'unpaid',
    notes:     '',
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }));

  const handleDeliveryChange = (id) => {
    const dlv  = allDeliveries.find(d => d.id === id);
    const conf = dlv ? CONFIRMATIONS.find(c => c.no === dlv.conf) : null;
    setForm(f => ({ ...f, deliveryId: id, confNo: dlv?.conf || '', seller: conf?.seller || '' }));
  };

  const linkedDelivery = allDeliveries.find(d => d.id === form.deliveryId);
  const linkedConf     = linkedDelivery ? CONFIRMATIONS.find(c => c.no === linkedDelivery.conf) : null;
  const inheritedTags  = linkedConf?.tags || [];

  const handleSave = () => { onCmd({ action: 'saved:invoice', data: form }); onClose(); };

  return (
    <div className="content-inner wide">
      <div className="page-header">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <button className="btn btn-sm btn-ghost" onClick={onClose}><Icon.ChevronLeft size={14} /> Back</button>
            <Badge tone="info">Draft</Badge>
          </div>
          <h1 className="page-title">New invoice</h1>
          <div className="page-sub">Create an invoice against a delivery. Fields marked <span style={{ color:'var(--negative)' }}>*</span> are required.</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={onClose}><Icon.X size={14} /> Cancel</button>
          <button className="btn" onClick={() => { onCmd({ action:'saved:draft' }); onClose(); }}><Icon.Save size={14} /> Save draft</button>
          <button className="btn btn-primary" onClick={handleSave}><Icon.Check size={14} /> Save invoice</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 260px', gap:20, alignItems:'start' }}>
        <div className="card">
          <div className="card-body" style={{ padding:'6px 20px 16px' }}>
            <Section title="Document">
              <div className="form-grid">
                <Field label="Invoice No.">
                  <Input value={form.invoiceNo} readOnly style={{ color:'var(--text-3)', background:'var(--surface-2)' }} />
                </Field>
                <Field label="Date" required>
                  <DatePicker value={form.date} onChange={(v) => setForm(f => ({ ...f, date: v }))} />
                </Field>
                <Field label="Delivery" required span={2}>
                  <Select value={form.deliveryId} onChange={e => handleDeliveryChange(e.target.value)}>
                    <option value="">Select delivery…</option>
                    {allDeliveries.map(d => (
                      <option key={d.id} value={d.id}>{d.id} · {d.conf} · {fmtDateShort(d.date)} · {d.status}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Confirmation No." span={2}>
                  <Input value={form.confNo} readOnly style={{ color:'var(--text-3)', background:'var(--surface-2)' }} placeholder="Auto-filled from delivery" />
                </Field>
              </div>
            </Section>

            <Section title="Amounts">
              <div className="form-grid">
                <Field label="Invoice amount (₹)" required>
                  <div className="input-group">
                    <span className="input-prefix">₹</span>
                    <Input type="number" placeholder="0" value={form.amount} onChange={set('amount')} className="input tnum" />
                  </div>
                </Field>
                <Field label="Payment status" required>
                  <Select value={form.status} onChange={set('status')}>
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </Select>
                </Field>
              </div>
            </Section>

            <Section title="Notes">
              <div className="form-grid">
                <Field label="Internal notes" optional span={2}>
                  <textarea className="input textarea" rows="3" placeholder="Reference number, payment terms, remarks…" value={form.notes} onChange={set('notes')} />
                </Field>
              </div>
            </Section>
          </div>
          <div className="card-footer">
            <div className="row-flex">
              <button className="btn btn-primary btn-sm" onClick={handleSave}>Save & continue <span className="kbd-hint">⌘↵</span></button>
            </div>
          </div>
        </div>

        <div style={{ position:'sticky', top:16, display:'flex', flexDirection:'column', gap:12 }}>
          {linkedDelivery ? (
            <>
              <div className="card">
                <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
                  <div className="card-title" style={{ fontSize:12 }}>Linked delivery</div>
                  <span className="cell-mono muted" style={{ fontSize:11 }}>{linkedDelivery.id}</span>
                </div>
                <div className="card-body" style={{ padding:'8px 16px 14px', display:'flex', flexDirection:'column', gap:8, fontSize:12.5 }}>
                  {[
                    ['Date',       fmtDateShort(linkedDelivery.date)],
                    ['Bales',      linkedDelivery.bales],
                    ['Net weight', fmtNum(linkedDelivery.net) + ' kg'],
                    ['Status',     linkedDelivery.status],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'var(--text-3)' }}>{k}</span>
                      <span style={{ fontWeight:500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              {linkedConf && (
                <div className="card">
                  <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
                    <div className="card-title" style={{ fontSize:12 }}>Linked confirmation</div>
                    <span className="cell-mono muted" style={{ fontSize:11 }}>{linkedConf.no}</span>
                  </div>
                  <div className="card-body" style={{ padding:'8px 16px 14px', display:'flex', flexDirection:'column', gap:8, fontSize:12.5 }}>
                    {[['Buyer', linkedConf.buyer], ['Seller', linkedConf.seller], ['Variety', linkedConf.variety]].map(([k, v]) => (
                      <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ color:'var(--text-3)' }}>{k}</span>
                        <span style={{ fontWeight:500, textAlign:'right', maxWidth:150 }}>{v}</span>
                      </div>
                    ))}
                    {inheritedTags.length > 0 && (
                      <div style={{ borderTop:'1px solid var(--border)', paddingTop:8 }}>
                        <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.04em', fontWeight:600 }}>Inherited tags</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                          {inheritedTags.map(tag => {
                            const { bg, color } = window.tagColor(tag);
                            return <span key={tag} style={{ display:'inline-flex', alignItems:'center', gap:3, borderRadius:999, padding:'2px 8px', fontSize:11.5, fontWeight:500, background:bg, color }}><Icon.Lock size={9} />{tag}</span>;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card">
              <div className="card-body" style={{ padding:'24px 16px', textAlign:'center', color:'var(--text-3)' }}>
                <Icon.Receipt size={20} />
                <div style={{ marginTop:8, fontSize:12.5, fontWeight:500, color:'var(--text-2)' }}>Select a delivery</div>
                <div style={{ marginTop:4, fontSize:12 }}>Delivery and confirmation details will appear here.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ----- Status pills -----
const DPill = ({ status }) => {
  const cfg = {
    'In transit':   { color:'#2563eb', bg:'rgba(59,130,246,.12)' },
    'Delivered':    { color:'#15803d', bg:'rgba(34,197,94,.12)'  },
    'Mill passing': { color:'#a16207', bg:'rgba(234,179,8,.15)'  },
  }[status] || { color:'var(--text-3)', bg:'var(--surface-2)' };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, borderRadius:999, padding:'2px 9px', fontSize:11.5, fontWeight:500, background:cfg.bg, color:cfg.color, whiteSpace:'nowrap' }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:cfg.color, flexShrink:0 }} />{status}
    </span>
  );
};

const IPill = ({ status }) => {
  const cfg = {
    'paid':    { color:'#15803d', bg:'rgba(34,197,94,.12)',  label:'Paid'    },
    'partial': { color:'#a16207', bg:'rgba(234,179,8,.15)',  label:'Partial' },
    'unpaid':  { color:'#dc2626', bg:'rgba(239,68,68,.12)',  label:'Unpaid'  },
  }[status] || { color:'var(--text-3)', bg:'var(--surface-2)', label: status };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, borderRadius:999, padding:'2px 9px', fontSize:11.5, fontWeight:500, background:cfg.bg, color:cfg.color, whiteSpace:'nowrap' }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:cfg.color, flexShrink:0 }} />{cfg.label}
    </span>
  );
};

// ----- Delivery & Invoices list -----
const DeliveryInvoices = ({ onCmd, extraDeliveries = [], extraInvoices = [], initialView, initialConfNo }) => {
  const [view, setView] = React.useState(initialView || 'list');
  const [tab,  setTab]  = React.useState('all');
  const dCtrl = useTableControls(DELIVERY_COLS);
  const iCtrl = useTableControls(INVOICE_COLS);
  const [dSearch,   setDSearch]   = React.useState('');
  const [dShowSugg, setDShowSugg] = React.useState(false);
  const [iSearch,   setISearch]   = React.useState('');
  const [iShowSugg, setIShowSugg] = React.useState(false);
  const [dExpMode,     setDExpMode]     = React.useState(false);
  const [dExpSel,      setDExpSel]      = React.useState([]);
  const [dFmtOpen,     setDFmtOpen]     = React.useState(false);
  const [iExpMode,     setIExpMode]     = React.useState(false);
  const [iExpSel,      setIExpSel]      = React.useState([]);
  const [iFmtOpen,     setIFmtOpen]     = React.useState(false);
  const [expMenuOpen,  setExpMenuOpen]  = React.useState(false);

  const [dPage, setDPage]         = React.useState(1);
  const [dPageSize, setDPageSize] = React.useState(10);
  const [iPage, setIPage]         = React.useState(1);
  const [iPageSize, setIPageSize] = React.useState(10);

  React.useEffect(() => { setDPage(1); }, [dSearch, tab]);
  React.useEffect(() => { setIPage(1); }, [iSearch]);

  const cancelExport = () => { setDExpMode(false); setDExpSel([]); setIExpMode(false); setIExpSel([]); };

  const [delVisibleCols, setDelVisibleCols] = React.useState(
    () => new Set(_DEL_COLS.filter(c => c.defaultOn).map(c => c.field))
  );
  const delVis = (f) => delVisibleCols.has(f);

  const [invVisibleCols, setInvVisibleCols] = React.useState(
    () => new Set(_INV_DI_COLS.filter(c => c.defaultOn).map(c => c.field))
  );
  const invVis = (f) => invVisibleCols.has(f);

  const allDeliveries = [...extraDeliveries, ...DELIVERIES];
  const allInvoices   = [...extraInvoices, ...INVOICES];

  if (view === 'new-delivery') {
    return <NewDelivery onClose={() => setView('list')} onCmd={onCmd} prefillConfNo={initialConfNo} />;
  }
  if (view === 'new-invoice') {
    return <NewInvoice onClose={() => setView('list')} onCmd={onCmd} allDeliveries={allDeliveries} />;
  }
  if (view?.type === 'delivery') {
    return <DeliveryDetail delivery={view.item} allDeliveries={allDeliveries} allInvoices={allInvoices} onClose={() => setView('list')} onCmd={onCmd} onNavigate={(d) => setView({ type:'delivery', item:d })} />;
  }
  if (view?.type === 'invoice') {
    return <InvoiceDetail invoice={view.item} allInvoices={allInvoices} onClose={() => setView('list')} onCmd={onCmd} onNavigate={(inv) => setView({ type:'invoice', item:inv })} />;
  }

  // Stats
  const totalNet    = allDeliveries.reduce((s, d) => s + (d.net || 0), 0);
  const outstanding = allInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.balance || 0), 0);
  const settled     = allInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount || 0), 0);

  // Tab filter for deliveries
  const TABS = [
    { id:'all',             label:'All deliveries' },
    { id:'transit',         label:'In transit'     },
    { id:'delivered',       label:'Delivered'      },
    { id:'invoice-pending', label:'Invoice pending' },
    { id:'unpaid',          label:'Unpaid'         },
  ];
  const tabFiltered = allDeliveries.filter(d => {
    const invs = allInvoices.filter(i => i.conf === d.conf);
    return tab === 'all'             ? true
         : tab === 'transit'         ? d.status === 'In transit'
         : tab === 'delivered'       ? d.status === 'Delivered'
         : tab === 'invoice-pending' ? d.status === 'Delivered' && invs.length === 0
         : tab === 'unpaid'          ? invs.some(i => i.status !== 'paid')
         : true;
  });
  const dTextFiltered = !dSearch.trim() ? tabFiltered : (() => {
    const q = dSearch.toLowerCase();
    return tabFiltered.filter(d =>
      d.id.toLowerCase().includes(q) ||
      d.conf.toLowerCase().includes(q) ||
      (d.status || '').toLowerCase().includes(q)
    );
  })();
  const filtered = dCtrl.sortData(dTextFiltered);

  const dTotalPages = Math.max(1, Math.ceil(filtered.length / dPageSize));
  const dSafePage   = Math.min(dPage, dTotalPages);
  const dPaginated  = filtered.slice((dSafePage - 1) * dPageSize, dSafePage * dPageSize);

  const dSuggestions = !dSearch.trim() ? [] : (() => {
    const q = dSearch.toLowerCase(), seen = new Set(), items = [];
    allDeliveries.forEach(d => {
      if (!seen.has(d.id)   && d.id.toLowerCase().includes(q))   { seen.add(d.id);   items.push({ label:d.id,   sub:`${d.conf} · ${d.status}` }); }
      if (!seen.has(d.conf) && d.conf.toLowerCase().includes(q)) { seen.add(d.conf); items.push({ label:d.conf, sub:'Conf No.' }); }
    });
    return items.slice(0, 8);
  })();

  const iTextFiltered = !iSearch.trim() ? allInvoices : (() => {
    const q = iSearch.toLowerCase();
    return allInvoices.filter(inv =>
      inv.no.toLowerCase().includes(q) ||
      inv.conf.toLowerCase().includes(q) ||
      inv.seller.toLowerCase().includes(q) ||
      (inv.status || '').toLowerCase().includes(q)
    );
  })();
  const filteredInvoices = iCtrl.sortData(iTextFiltered);

  const iTotalPages = Math.max(1, Math.ceil(filteredInvoices.length / iPageSize));
  const iSafePage   = Math.min(iPage, iTotalPages);
  const iPaginated  = filteredInvoices.slice((iSafePage - 1) * iPageSize, iSafePage * iPageSize);

  const iSuggestions = !iSearch.trim() ? [] : (() => {
    const q = iSearch.toLowerCase(), seen = new Set(), items = [];
    allInvoices.forEach(inv => {
      if (!seen.has(inv.no)     && inv.no.toLowerCase().includes(q))     { seen.add(inv.no);     items.push({ label:inv.no,     sub:`${inv.conf} · ${inv.seller}` }); }
      if (!seen.has(inv.conf)   && inv.conf.toLowerCase().includes(q))   { seen.add(inv.conf);   items.push({ label:inv.conf,   sub:'Conf No.' }); }
      if (!seen.has(inv.seller) && inv.seller.toLowerCase().includes(q)) { seen.add(inv.seller); items.push({ label:inv.seller, sub:'Seller' }); }
    });
    return items.slice(0, 8);
  })();

  const _dl = (content, filename, mime) => {
    const blob = new Blob(['﻿', content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const dAllSel = filtered.length > 0 && filtered.every(r => dExpSel.includes(r.id));
  const iAllSel = filteredInvoices.length > 0 && filteredInvoices.every(r => iExpSel.includes(r.no));

  const doExportDeliveries = (fmt) => {
    const cols = [
      { h:'Delivery ID', v: r => r.id },
      { h:'Conf No.',    v: r => r.conf },
      { h:'Date',        v: r => r.date instanceof Date ? r.date.toLocaleDateString('en-IN') : r.date },
      { h:'Bales',       v: r => r.bales },
      { h:'Net (kg)',    v: r => r.net },
      { h:'Status',      v: r => r.status },
    ];
    const rows = filtered.filter(r => dExpSel.includes(r.id));
    const esc  = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    if (fmt === 'csv') {
      _dl([cols.map(c => esc(c.h)).join(','), ...rows.map(r => cols.map(c => esc(c.v(r))).join(','))].join('\r\n'), 'deliveries.csv', 'text/csv');
    } else if (fmt === 'excel') {
      const th = `<tr>${cols.map(c => `<th>${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(r => `<tr>${cols.map(c => `<td>${c.v(r)}</td>`).join('')}</tr>`).join('');
      _dl(`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/></head><body><table>${th}${tb}</table></body></html>`, 'deliveries.xls', 'application/vnd.ms-excel');
    } else if (fmt === 'word') {
      const th = `<tr>${cols.map(c => `<th>${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(r => `<tr>${cols.map(c => `<td>${c.v(r)}</td>`).join('')}</tr>`).join('');
      _dl(`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"/></head><body><h2>Deliveries</h2><table border="1">${th}${tb}</table></body></html>`, 'deliveries.doc', 'application/msword');
    } else if (fmt === 'pdf') {
      const th = `<tr>${cols.map(c => `<th style="padding:8px;border:1px solid #ddd;background:#f5f5f5;text-align:left">${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(r => `<tr>${cols.map(c => `<td style="padding:8px;border:1px solid #ddd">${c.v(r)}</td>`).join('')}</tr>`).join('');
      const w = window.open('', '_blank');
      w.document.write(`<!DOCTYPE html><html><head><title>Deliveries</title><style>body{font-family:sans-serif;padding:24px}table{border-collapse:collapse;width:100%}@media print{button{display:none}}</style></head><body><h2>Deliveries</h2><table>${th}${tb}</table><script>setTimeout(()=>window.print(),400)<\/script></body></html>`);
      w.document.close();
    }
    setDFmtOpen(false); setDExpMode(false); setDExpSel([]);
  };

  const doExportInvoices = (fmt) => {
    const cols = [
      { h:'Invoice No.', v: r => r.no },
      { h:'Conf No.',    v: r => r.conf },
      { h:'Date',        v: r => r.date instanceof Date ? r.date.toLocaleDateString('en-IN') : r.date },
      { h:'Seller',      v: r => r.seller },
      { h:'Amount',      v: r => r.amount },
      { h:'Balance',     v: r => r.balance || 0 },
      { h:'Status',      v: r => r.status },
    ];
    const rows = filteredInvoices.filter(r => iExpSel.includes(r.no));
    const esc  = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    if (fmt === 'csv') {
      _dl([cols.map(c => esc(c.h)).join(','), ...rows.map(r => cols.map(c => esc(c.v(r))).join(','))].join('\r\n'), 'invoices.csv', 'text/csv');
    } else if (fmt === 'excel') {
      const th = `<tr>${cols.map(c => `<th>${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(r => `<tr>${cols.map(c => `<td>${c.v(r)}</td>`).join('')}</tr>`).join('');
      _dl(`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/></head><body><table>${th}${tb}</table></body></html>`, 'invoices.xls', 'application/vnd.ms-excel');
    } else if (fmt === 'word') {
      const th = `<tr>${cols.map(c => `<th>${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(r => `<tr>${cols.map(c => `<td>${c.v(r)}</td>`).join('')}</tr>`).join('');
      _dl(`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"/></head><body><h2>Invoices</h2><table border="1">${th}${tb}</table></body></html>`, 'invoices.doc', 'application/msword');
    } else if (fmt === 'pdf') {
      const th = `<tr>${cols.map(c => `<th style="padding:8px;border:1px solid #ddd;background:#f5f5f5;text-align:left">${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(r => `<tr>${cols.map(c => `<td style="padding:8px;border:1px solid #ddd">${c.v(r)}</td>`).join('')}</tr>`).join('');
      const w = window.open('', '_blank');
      w.document.write(`<!DOCTYPE html><html><head><title>Invoices</title><style>body{font-family:sans-serif;padding:24px}table{border-collapse:collapse;width:100%}@media print{button{display:none}}</style></head><body><h2>Invoices</h2><table>${th}${tb}</table><script>setTimeout(()=>window.print(),400)<\/script></body></html>`);
      w.document.close();
    }
    setIFmtOpen(false); setIExpMode(false); setIExpSel([]);
  };

  const TagPills = ({ allTags, inherited }) => (
    <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
      {allTags.map(tag => {
        const { bg, color } = window.tagColor(tag);
        const isInherited   = inherited.includes(tag);
        return (
          <span key={tag} style={{ display:'inline-flex', alignItems:'center', gap:3, borderRadius:999, padding:'2px 7px', fontSize:11, fontWeight:500, background:bg, color, opacity: isInherited ? 0.8 : 1 }}>
            {isInherited && <Icon.Lock size={8} />}{tag}
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="content-inner wide">

      <div className="page-header">
        <div>
          <h1 className="page-title">Delivery & Invoices</h1>
          <div className="page-sub">Track lots from station weighment to mill door · {allDeliveries.length} deliveries · {allInvoices.length} invoices</div>
        </div>
        <div className="page-actions">
          {(dExpMode || iExpMode) ? (
            <>
              <button className="btn btn-primary"
                disabled={(dExpMode ? dExpSel.length : iExpSel.length) === 0}
                onClick={() => dExpMode ? setDFmtOpen(true) : setIFmtOpen(true)}>
                <Icon.Download size={14} />
                {dExpMode
                  ? (dExpSel.length > 0 ? `Export ${dExpSel.length} deliveries` : 'Select deliveries')
                  : (iExpSel.length > 0 ? `Export ${iExpSel.length} invoices`   : 'Select invoices')}
              </button>
              <button className="btn" onClick={cancelExport}><Icon.X size={14} /> Cancel</button>
            </>
          ) : (
            <>
              {/* Unified export dropdown */}
              <div style={{ position:'relative' }}
                onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setExpMenuOpen(false); }}
                tabIndex={-1}>
                <button className="btn" onClick={() => setExpMenuOpen(o => !o)}>
                  <Icon.Download size={14} /> Export <Icon.ChevronDown size={12} style={{ marginLeft:2 }} />
                </button>
                {expMenuOpen && (
                  <div style={{ position:'absolute', right:0, top:'calc(100% + 6px)', zIndex:400, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, boxShadow:'0 4px 6px rgba(0,0,0,.06),0 12px 32px rgba(0,0,0,.16)', width:230, overflow:'hidden' }}>
                    <div style={{ padding:'8px 12px 6px', fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em' }}>Choose dataset</div>
                    {[
                      { label:'Deliveries', sub:`${filtered.length} rows`, icon:'Truck',   action:() => { setDExpMode(true); setExpMenuOpen(false); } },
                      { label:'Invoices',   sub:`${filteredInvoices.length} rows`, icon:'Receipt', action:() => { setIExpMode(true); setExpMenuOpen(false); } },
                    ].map(opt => {
                      const Ic = Icon[opt.icon];
                      return (
                        <button key={opt.label} onClick={opt.action}
                          style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 12px', background:'none', border:'none', borderTop:'1px solid var(--border)', cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'background .1s' }}
                          onMouseEnter={e => e.currentTarget.style.background='var(--surface-2)'}
                          onMouseLeave={e => e.currentTarget.style.background='none'}>
                          <span style={{ width:30, height:30, borderRadius:8, background:'var(--bg-2)', border:'1px solid var(--border)', display:'grid', placeItems:'center', flexShrink:0 }}>
                            <Ic size={14} style={{ color:'var(--text-2)' }} />
                          </span>
                          <div>
                            <div style={{ fontSize:13, fontWeight:600, color:'var(--text-1)' }}>{opt.label}</div>
                            <div style={{ fontSize:11, color:'var(--text-3)', marginTop:1 }}>{opt.sub}</div>
                          </div>
                          <Icon.ChevronRight size={13} style={{ color:'var(--text-3)', marginLeft:'auto', flexShrink:0 }} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <button className="btn" onClick={() => setView('new-invoice')}><Icon.Receipt size={14} /> New invoice</button>
              <button className="btn btn-primary" onClick={() => setView('new-delivery')}><Icon.Truck size={14} /> New delivery</button>
            </>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Active deliveries', value: allDeliveries.filter(d => d.status !== 'Delivered').length, unit:'', color:'var(--text-1)' },
          { label:'Total net weight',  value: fmtNum(totalNet), unit:' kg', color:'var(--text-1)' },
          { label:'Outstanding',       value: fmtINR(outstanding, { compact:true }), unit:'', color:'var(--negative)' },
          { label:'Settled',           value: fmtINR(settled,     { compact:true }), unit:'', color:'var(--positive)' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="card-body" style={{ padding:'12px 16px' }}>
              <div className="muted" style={{ fontSize:11, marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:20, fontWeight:700, letterSpacing:'-.01em', color:s.color }}>{s.value}{s.unit}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Deliveries table */}
      {!iExpMode && <div className="card" style={{ marginBottom:20 }}>
        <div className="card-header" style={{ gap:8, flexWrap:'wrap' }}>
          <div className="card-title">Deliveries</div>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginLeft:8 }}>
            {TABS.map(t => (
              <button key={t.id} className={`btn btn-sm ${tab === t.id ? '' : 'btn-ghost'}`}
                style={tab !== t.id ? { border:'none' } : {}}
                onClick={() => setTab(t.id)}>
                {t.label}
                <span style={{ marginLeft:5, fontSize:11, fontWeight:600, color: tab === t.id ? 'inherit' : 'var(--text-3)' }}>
                  {(() => {
                    const invs = (d) => allInvoices.filter(i => i.conf === d.conf);
                    if (t.id === 'transit')         return allDeliveries.filter(d => d.status === 'In transit').length;
                    if (t.id === 'delivered')       return allDeliveries.filter(d => d.status === 'Delivered').length;
                    if (t.id === 'invoice-pending') return allDeliveries.filter(d => d.status === 'Delivered' && invs(d).length === 0).length;
                    if (t.id === 'unpaid')          return allDeliveries.filter(d => invs(d).some(i => i.status !== 'paid')).length;
                    return allDeliveries.length;
                  })()}
                </span>
              </button>
            ))}
          </div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <label
                style={{ display:'flex', alignItems:'center', gap:6, border:'1px solid var(--border)', borderRadius:6, background:'var(--bg-2)', padding:'0 8px', cursor:'text', transition:'border-color .12s', width:200 }}
                onFocusCapture={e => { e.currentTarget.style.borderColor='var(--accent)'; setDShowSugg(true); }}
                onBlurCapture={e => { e.currentTarget.style.borderColor='var(--border)'; setTimeout(() => setDShowSugg(false), 150); }}
              >
                <Icon.Search size={12} style={{ color:'var(--text-3)', flexShrink:0 }} />
                <input
                  value={dSearch}
                  onChange={e => { setDSearch(e.target.value); setDShowSugg(true); }}
                  onFocus={() => setDShowSugg(true)}
                  placeholder="Search deliveries…"
                  style={{ flex:1, border:'none', background:'transparent', padding:'5px 0', outline:'none', fontSize:12.5, color:'var(--text-1)', fontFamily:'inherit', minWidth:0 }}
                />
                {dSearch && (
                  <button onMouseDown={() => { setDSearch(''); setDShowSugg(false); }}
                    style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:'var(--text-3)', padding:2, flexShrink:0 }}>
                    <Icon.X size={11} />
                  </button>
                )}
              </label>
              {dShowSugg && dSuggestions.length > 0 && (
                <div style={{ position:'absolute', right:0, top:'calc(100% + 4px)', zIndex:300, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, boxShadow:'0 4px 6px rgba(0,0,0,.06),0 12px 32px rgba(0,0,0,.18)', width:280, overflow:'hidden' }}>
                  {dSuggestions.map((s, i) => (
                    <button key={i} onMouseDown={() => { setDSearch(s.label); setDShowSugg(false); }}
                      style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'7px 10px', background:'none', border:'none', borderBottom: i < dSuggestions.length - 1 ? '1px solid var(--border)' : 'none', cursor:'pointer', textAlign:'left', fontFamily:'inherit', transition:'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background='var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background='none'}>
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <Icon.Search size={11} style={{ color:'var(--text-3)', flexShrink:0 }} />
                        <span style={{ fontSize:12.5, color:'var(--text-1)', fontWeight:500 }}>{s.label}</span>
                      </div>
                      <span style={{ fontSize:11, color:'var(--text-3)' }}>{s.sub}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <ViewMenu cols={_DEL_COLS} visible={delVisibleCols} onChange={setDelVisibleCols} />
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              {dExpMode && (
                <th style={{ width:36, paddingLeft:14 }}>
                  <input type="checkbox" checked={dAllSel} onChange={e => setDExpSel(e.target.checked ? filtered.map(r => r.id) : [])} />
                </th>
              )}
              {delVis('id')     && <SortableHeader field="id"     label="Delivery ID" ctrl={dCtrl} />}
              {delVis('conf')   && <SortableHeader field="conf"   label="Conf No."    ctrl={dCtrl} />}
              {delVis('date')   && <SortableHeader field="date"   label="Date"        ctrl={dCtrl} />}
              {delVis('bales')  && <SortableHeader field="bales"  label="Bales"       ctrl={dCtrl} className="num" align="right" />}
              {delVis('gross')  && <th className="num">Gross wt</th>}
              {delVis('tare')   && <th className="num">Tare</th>}
              {delVis('net')    && <th className="num">Net wt</th>}
              {delVis('tags')   && <th>Tags</th>}
              {delVis('status') && <SortableHeader field="status" label="Status"      ctrl={dCtrl} />}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={100} style={{ textAlign:'center', padding:'40px 32px', color:'var(--text-3)', fontSize:13 }}>
                  No deliveries match.
                </td>
              </tr>
            )}
            {dPaginated.map(d => {
              const conf      = CONFIRMATIONS.find(c => c.no === d.conf);
              const inherited = conf?.tags || [];
              const own       = d.tags || [];
              const allTags   = [...new Set([...inherited, ...own])];
              return (
                <tr key={d.id} style={{ cursor:'pointer' }}
                  onClick={() => dExpMode
                    ? setDExpSel(prev => prev.includes(d.id) ? prev.filter(x => x !== d.id) : [...prev, d.id])
                    : setView({ type:'delivery', item:d })}>
                  {dExpMode && (
                    <td onClick={e => e.stopPropagation()} style={{ paddingLeft:14 }}>
                      <input type="checkbox" checked={dExpSel.includes(d.id)}
                        onChange={() => setDExpSel(prev => prev.includes(d.id) ? prev.filter(x => x !== d.id) : [...prev, d.id])} />
                    </td>
                  )}
                  {delVis('id')     && <td className="cell-mono cell-strong">{d.id}</td>}
                  {delVis('conf')   && <td className="cell-mono muted">{d.conf}</td>}
                  {delVis('date')   && <td className="muted">{fmtDateShort(d.date)}</td>}
                  {delVis('bales')  && <td className="tnum cell-strong">{d.bales}</td>}
                  {delVis('gross')  && <td className="num tnum">{d.gross != null ? fmtNum(d.gross) : '—'}</td>}
                  {delVis('tare')   && <td className="num tnum">{d.tare  != null ? fmtNum(d.tare)  : '—'}</td>}
                  {delVis('net')    && <td className="num tnum">{d.net   != null ? fmtNum(d.net)   : '—'}</td>}
                  {delVis('tags')   && <td><TagPills allTags={allTags} inherited={inherited} /></td>}
                  {delVis('status') && <td style={{ whiteSpace:'nowrap' }}><DPill status={d.status} /></td>}
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Pagination */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', borderTop:'1px solid var(--border)', gap:12, flexWrap:'wrap' }}>
          <span style={{ fontSize:12, color:'var(--text-3)', whiteSpace:'nowrap' }}>
            {filtered.length === 0 ? 'No results' : <><strong style={{ color:'var(--text-1)', fontWeight:600 }}>{(dSafePage-1)*dPageSize+1}–{Math.min(dSafePage*dPageSize,filtered.length)}</strong>{' '}<span>of {filtered.length} results</span></>}
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:12, color:'var(--text-3)' }}>Show</span>
              <select value={dPageSize} onChange={e => { setDPageSize(Number(e.target.value)); setDPage(1); }}
                style={{ padding:'5px 24px 5px 9px', border:'1px solid var(--border)', borderRadius:6, background:'var(--bg-2)', color:'var(--text-1)', fontSize:12.5, fontFamily:'inherit', cursor:'pointer', outline:'none', appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 7px center', transition:'border-color .12s' }}
                onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'}>
                <option value={5}>5</option><option value={10}>10</option><option value={25}>25</option>
              </select>
              <span style={{ fontSize:12, color:'var(--text-3)' }}>/ page</span>
            </div>
            <div style={{ width:1, height:18, background:'var(--border)' }} />
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <button disabled={dSafePage===1} onClick={() => setDPage(p => Math.max(1,p-1))}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-2)', cursor:dSafePage===1?'default':'pointer', color:dSafePage===1?'var(--text-3)':'var(--text-1)', fontSize:12, fontFamily:'inherit', fontWeight:500, opacity:dSafePage===1?0.45:1, transition:'border-color .12s,background .12s', whiteSpace:'nowrap' }}
                onMouseEnter={e => { if(dSafePage!==1){ e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='var(--surface-2,var(--bg-2))'; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-2)'; }}>
                <Icon.ChevronLeft size={12}/> Prev
              </button>
              <div style={{ padding:'5px 12px', borderRadius:7, border:'1px solid var(--border)', background:'var(--surface)', fontSize:12, fontWeight:600, color:'var(--text-1)', whiteSpace:'nowrap', minWidth:64, textAlign:'center' }}>
                {dSafePage} <span style={{ fontWeight:400, color:'var(--text-3)' }}>/ {dTotalPages}</span>
              </div>
              <button disabled={dSafePage===dTotalPages} onClick={() => setDPage(p => Math.min(dTotalPages,p+1))}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-2)', cursor:dSafePage===dTotalPages?'default':'pointer', color:dSafePage===dTotalPages?'var(--text-3)':'var(--text-1)', fontSize:12, fontFamily:'inherit', fontWeight:500, opacity:dSafePage===dTotalPages?0.45:1, transition:'border-color .12s,background .12s', whiteSpace:'nowrap' }}
                onMouseEnter={e => { if(dSafePage!==dTotalPages){ e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='var(--surface-2,var(--bg-2))'; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-2)'; }}>
                Next <Icon.ChevronRight size={12}/>
              </button>
            </div>
          </div>
        </div>
      </div>}

      {/* Invoices table */}
      {!dExpMode && <div className="card">
        <div className="card-header" style={{ gap:8 }}>
          <div className="card-title">Invoices</div>
          <div style={{ marginLeft:'auto', display:'flex', gap:6, alignItems:'center' }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <label
                style={{ display:'flex', alignItems:'center', gap:6, border:'1px solid var(--border)', borderRadius:6, background:'var(--bg-2)', padding:'0 8px', cursor:'text', transition:'border-color .12s', width:200 }}
                onFocusCapture={e => { e.currentTarget.style.borderColor='var(--accent)'; setIShowSugg(true); }}
                onBlurCapture={e => { e.currentTarget.style.borderColor='var(--border)'; setTimeout(() => setIShowSugg(false), 150); }}
              >
                <Icon.Search size={12} style={{ color:'var(--text-3)', flexShrink:0 }} />
                <input
                  value={iSearch}
                  onChange={e => { setISearch(e.target.value); setIShowSugg(true); }}
                  onFocus={() => setIShowSugg(true)}
                  placeholder="Search invoices…"
                  style={{ flex:1, border:'none', background:'transparent', padding:'5px 0', outline:'none', fontSize:12.5, color:'var(--text-1)', fontFamily:'inherit', minWidth:0 }}
                />
                {iSearch && (
                  <button onMouseDown={() => { setISearch(''); setIShowSugg(false); }}
                    style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:'var(--text-3)', padding:2, flexShrink:0 }}>
                    <Icon.X size={11} />
                  </button>
                )}
              </label>
              {iShowSugg && iSuggestions.length > 0 && (
                <div style={{ position:'absolute', right:0, top:'calc(100% + 4px)', zIndex:300, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, boxShadow:'0 4px 6px rgba(0,0,0,.06),0 12px 32px rgba(0,0,0,.18)', width:280, overflow:'hidden' }}>
                  {iSuggestions.map((s, i) => (
                    <button key={i} onMouseDown={() => { setISearch(s.label); setIShowSugg(false); }}
                      style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', padding:'7px 10px', background:'none', border:'none', borderBottom: i < iSuggestions.length - 1 ? '1px solid var(--border)' : 'none', cursor:'pointer', textAlign:'left', fontFamily:'inherit', transition:'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background='var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background='none'}>
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <Icon.Search size={11} style={{ color:'var(--text-3)', flexShrink:0 }} />
                        <span style={{ fontSize:12.5, color:'var(--text-1)', fontWeight:500 }}>{s.label}</span>
                      </div>
                      <span style={{ fontSize:11, color:'var(--text-3)' }}>{s.sub}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <ViewMenu cols={_INV_DI_COLS} visible={invVisibleCols} onChange={setInvVisibleCols} />
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              {iExpMode && (
                <th style={{ width:36, paddingLeft:14 }}>
                  <input type="checkbox" checked={iAllSel} onChange={e => setIExpSel(e.target.checked ? filteredInvoices.map(r => r.no) : [])} />
                </th>
              )}
              {invVis('no')     && <SortableHeader field="no"     label="Invoice No." ctrl={iCtrl} />}
              {invVis('conf')   && <SortableHeader field="conf"   label="Conf No."    ctrl={iCtrl} />}
              {invVis('date')   && <SortableHeader field="date"   label="Date"        ctrl={iCtrl} />}
              {invVis('seller') && <SortableHeader field="seller" label="Seller"      ctrl={iCtrl} />}
              {invVis('amount') && <SortableHeader field="amount" label="Amount"      ctrl={iCtrl} className="num" align="right" />}
              {invVis('tags')   && <th>Tags</th>}
              {invVis('status') && <SortableHeader field="status" label="Pay Status"  ctrl={iCtrl} />}
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={100} style={{ textAlign:'center', padding:'40px 32px', color:'var(--text-3)', fontSize:13 }}>
                  No invoices match.
                </td>
              </tr>
            )}
            {iPaginated.map(inv => {
              const conf      = CONFIRMATIONS.find(c => c.no === inv.conf);
              const dlv       = allDeliveries.find(d => d.conf === inv.conf);
              const inherited = [...new Set([...(conf?.tags || []), ...(dlv?.tags || [])])];
              const own       = inv.tags || [];
              const allTags   = [...new Set([...inherited, ...own])];
              return (
                <tr key={inv.no} style={{ cursor:'pointer' }}
                  onClick={() => iExpMode
                    ? setIExpSel(prev => prev.includes(inv.no) ? prev.filter(x => x !== inv.no) : [...prev, inv.no])
                    : setView({ type:'invoice', item:inv })}>
                  {iExpMode && (
                    <td onClick={e => e.stopPropagation()} style={{ paddingLeft:14 }}>
                      <input type="checkbox" checked={iExpSel.includes(inv.no)}
                        onChange={() => setIExpSel(prev => prev.includes(inv.no) ? prev.filter(x => x !== inv.no) : [...prev, inv.no])} />
                    </td>
                  )}
                  {invVis('no')     && <td className="cell-mono cell-strong">{inv.no}</td>}
                  {invVis('conf')   && <td className="cell-mono muted">{inv.conf}</td>}
                  {invVis('date')   && <td className="muted">{fmtDateShort(inv.date)}</td>}
                  {invVis('seller') && <td>{inv.seller}</td>}
                  {invVis('amount') && <td className="num tnum cell-strong">{fmtINR(inv.amount, { compact:true })}</td>}
                  {invVis('tags')   && <td><TagPills allTags={allTags} inherited={inherited} /></td>}
                  {invVis('status') && <td style={{ whiteSpace:'nowrap' }}><IPill status={inv.status} /></td>}
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Pagination */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', borderTop:'1px solid var(--border)', gap:12, flexWrap:'wrap' }}>
          <span style={{ fontSize:12, color:'var(--text-3)', whiteSpace:'nowrap' }}>
            {filteredInvoices.length === 0 ? 'No results' : <><strong style={{ color:'var(--text-1)', fontWeight:600 }}>{(iSafePage-1)*iPageSize+1}–{Math.min(iSafePage*iPageSize,filteredInvoices.length)}</strong>{' '}<span>of {filteredInvoices.length} results</span></>}
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:12, color:'var(--text-3)' }}>Show</span>
              <select value={iPageSize} onChange={e => { setIPageSize(Number(e.target.value)); setIPage(1); }}
                style={{ padding:'5px 24px 5px 9px', border:'1px solid var(--border)', borderRadius:6, background:'var(--bg-2)', color:'var(--text-1)', fontSize:12.5, fontFamily:'inherit', cursor:'pointer', outline:'none', appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 7px center', transition:'border-color .12s' }}
                onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'}>
                <option value={5}>5</option><option value={10}>10</option><option value={25}>25</option>
              </select>
              <span style={{ fontSize:12, color:'var(--text-3)' }}>/ page</span>
            </div>
            <div style={{ width:1, height:18, background:'var(--border)' }} />
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <button disabled={iSafePage===1} onClick={() => setIPage(p => Math.max(1,p-1))}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-2)', cursor:iSafePage===1?'default':'pointer', color:iSafePage===1?'var(--text-3)':'var(--text-1)', fontSize:12, fontFamily:'inherit', fontWeight:500, opacity:iSafePage===1?0.45:1, transition:'border-color .12s,background .12s', whiteSpace:'nowrap' }}
                onMouseEnter={e => { if(iSafePage!==1){ e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='var(--surface-2,var(--bg-2))'; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-2)'; }}>
                <Icon.ChevronLeft size={12}/> Prev
              </button>
              <div style={{ padding:'5px 12px', borderRadius:7, border:'1px solid var(--border)', background:'var(--surface)', fontSize:12, fontWeight:600, color:'var(--text-1)', whiteSpace:'nowrap', minWidth:64, textAlign:'center' }}>
                {iSafePage} <span style={{ fontWeight:400, color:'var(--text-3)' }}>/ {iTotalPages}</span>
              </div>
              <button disabled={iSafePage===iTotalPages} onClick={() => setIPage(p => Math.min(iTotalPages,p+1))}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-2)', cursor:iSafePage===iTotalPages?'default':'pointer', color:iSafePage===iTotalPages?'var(--text-3)':'var(--text-1)', fontSize:12, fontFamily:'inherit', fontWeight:500, opacity:iSafePage===iTotalPages?0.45:1, transition:'border-color .12s,background .12s', whiteSpace:'nowrap' }}
                onMouseEnter={e => { if(iSafePage!==iTotalPages){ e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='var(--surface-2,var(--bg-2))'; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-2)'; }}>
                Next <Icon.ChevronRight size={12}/>
              </button>
            </div>
          </div>
        </div>
      </div>}

      {[
        { open: dFmtOpen, onClose: () => setDFmtOpen(false), count: dExpSel.length, doExport: doExportDeliveries },
        { open: iFmtOpen, onClose: () => setIFmtOpen(false), count: iExpSel.length, doExport: doExportInvoices  },
      ].map((modal, mi) => modal.open && (
        <div key={mi} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
             onClick={modal.onClose}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:24, width:400, maxWidth:'100%', boxShadow:'0 8px 40px rgba(0,0,0,.18)' }}
               onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:700, fontSize:15, color:'var(--text-1)', marginBottom:6 }}>Choose export format</div>
            <div style={{ fontSize:12.5, color:'var(--text-3)', marginBottom:20 }}>Exporting {modal.count} row{modal.count !== 1 ? 's' : ''}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { fmt:'csv',   label:'CSV',   icon:'FileText', color:'#2563eb', desc:'Spreadsheet-compatible'   },
                { fmt:'excel', label:'Excel', icon:'Table',    color:'#16a34a', desc:'Opens directly in Excel' },
                { fmt:'pdf',   label:'PDF',   icon:'File',     color:'#dc2626', desc:'Print-ready document'    },
                { fmt:'word',  label:'Word',  icon:'FileEdit', color:'#7c3aed', desc:'Editable Word document'  },
              ].map(({ fmt, label, icon, color, desc }) => {
                const Ic = Icon[icon] || Icon.FileText;
                return (
                  <button key={fmt} onClick={() => modal.doExport(fmt)}
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
      ))}
    </div>
  );
};

window.DeliveryInvoices = DeliveryInvoices;
