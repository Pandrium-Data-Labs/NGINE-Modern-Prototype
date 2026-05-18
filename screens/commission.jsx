// Commission Invoices — broker brokerage billing

const { Field, Input, Select, Badge, Section, DatePicker, fmtNum, fmtINR, ViewMenu } = window.UI;
const { DELIVERIES, CONFIRMATIONS, COMM_INVOICES, fmtDateShort, fmtDate } = window.NCData;
const { useTableControls, SortableHeader, FilterToolbar } = window.TableFilters;

const _ciTodayStr = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
})();
const _ciToDateStr = (d) => d
  ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  : _ciTodayStr;

const CI_COLS = [
  { field:'no',        label:'Invoice No.', type:'text'   },
  { field:'confNo',    label:'Conf No.',    type:'text'   },
  { field:'date',      label:'Date',        type:'date'   },
  { field:'partyName', label:'Party',       type:'text'   },
  { field:'party',     label:'Billed to',   type:'select', options:['buyer','seller'] },
  { field:'candies',   label:'Candies',     type:'number' },
  { field:'amount',    label:'Amount',      type:'number' },
  { field:'balance',   label:'Balance',     type:'number' },
  { field:'status',    label:'Status',      type:'select', options:['unpaid','partial','paid'] },
];

// ----- Shared primitives -----

const CIPill = ({ status }) => {
  const cfg = {
    'paid':    { color:'#15803d', bg:'rgba(34,197,94,.12)',  label:'Paid'    },
    'partial': { color:'#a16207', bg:'rgba(234,179,8,.15)',  label:'Partial' },
    'unpaid':  { color:'#dc2626', bg:'rgba(239,68,68,.12)',  label:'Unpaid'  },
  }[status] || { color:'var(--text-3)', bg:'var(--surface-2)', label:status };
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, borderRadius:999, padding:'2px 9px', fontSize:11.5, fontWeight:500, background:cfg.bg, color:cfg.color, whiteSpace:'nowrap' }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:cfg.color, flexShrink:0 }} />{cfg.label}
    </span>
  );
};

const CIAlertDialog = ({ title, body, onCancel, onConfirm }) => (
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

const CISearchBox = ({ value, onChange, placeholder }) => (
  <div style={{ display:'flex', alignItems:'center', gap:6, border:'1px solid var(--border)', borderRadius:6, padding:'3px 8px', background:'var(--bg-2)', width:210 }}>
    <Icon.Search size={13} style={{ color:'var(--text-3)', flexShrink:0 }} />
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ border:'none', background:'transparent', outline:'none', fontSize:12.5, color:'var(--text-1)', flex:1, minWidth:0 }} />
    <button onClick={() => onChange('')} style={{ border:'none', background:'transparent', cursor: value ? 'pointer' : 'default', padding:0, lineHeight:1, color:'var(--text-3)', opacity: value ? 1 : 0, pointerEvents: value ? 'auto' : 'none', transition:'opacity 0.15s' }}>
      <Icon.X size={12} />
    </button>
  </div>
);

// ----- New Commission Invoice form -----
const NewCommissionInvoice = ({ onClose, onCmd }) => {
  const [form, setForm] = React.useState({
    ciNo:        'CI-26-0007',
    date:        _ciTodayStr,
    confNo:      '',
    party:       'buyer',
    partyName:   '',
    candies:     '',
    rate:        '150',
    amount:      '',
    buyerRate:   '150',
    buyerAmount: '',
    sellerRate:  '100',
    sellerAmount:'',
    status:      'unpaid',
    notes:       '',
  });
  const [amountEdited,    setAmountEdited]    = React.useState(false);
  const [buyerAmtEdited,  setBuyerAmtEdited]  = React.useState(false);
  const [sellerAmtEdited, setSellerAmtEdited] = React.useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }));

  const linkedConf     = CONFIRMATIONS.find(c => c.no === form.confNo);
  const confDeliveries = DELIVERIES.filter(d => d.conf === form.confNo);
  const totalNet       = confDeliveries.reduce((s, d) => s + (d.net || 0), 0);
  const totalBales     = confDeliveries.reduce((s, d) => s + (d.bales || 0), 0);
  const calcCandies    = totalNet > 0 ? totalNet / 356 : 0;
  const calcAmount       = parseFloat(form.candies) > 0 && parseInt(form.rate) > 0
    ? Math.round(parseFloat(form.candies) * parseInt(form.rate)) : 0;
  const calcBuyerAmount  = parseFloat(form.candies) > 0 && parseInt(form.buyerRate) > 0
    ? Math.round(parseFloat(form.candies) * parseInt(form.buyerRate)) : 0;
  const calcSellerAmount = parseFloat(form.candies) > 0 && parseInt(form.sellerRate) > 0
    ? Math.round(parseFloat(form.candies) * parseInt(form.sellerRate)) : 0;

  // Auto-fill party name when conf or party type changes
  React.useEffect(() => {
    const conf = CONFIRMATIONS.find(c => c.no === form.confNo);
    if (conf) setForm(f => ({ ...f, partyName: f.party === 'buyer' ? conf.buyer : conf.seller }));
  }, [form.confNo, form.party]);

  // Auto-fill candies from deliveries when conf changes
  React.useEffect(() => {
    if (calcCandies > 0) setForm(f => ({ ...f, candies: calcCandies.toFixed(2) }));
  }, [form.confNo]);

  // Auto-fill amount from candies × rate (unless user manually edited it)
  React.useEffect(() => {
    if (calcAmount > 0 && !amountEdited) setForm(f => ({ ...f, amount: String(calcAmount) }));
  }, [calcAmount, amountEdited]);
  React.useEffect(() => {
    if (calcBuyerAmount > 0 && !buyerAmtEdited) setForm(f => ({ ...f, buyerAmount: String(calcBuyerAmount) }));
  }, [calcBuyerAmount, buyerAmtEdited]);
  React.useEffect(() => {
    if (calcSellerAmount > 0 && !sellerAmtEdited) setForm(f => ({ ...f, sellerAmount: String(calcSellerAmount) }));
  }, [calcSellerAmount, sellerAmtEdited]);

  const handleSave = () => {
    if (form.party === 'both' && linkedConf) {
      const baseSeq = parseInt((form.ciNo.split('-')[2]) || '7');
      onCmd({ action: 'saved:commissions', data: [
        { ...form, party: 'buyer',  partyName: linkedConf.buyer,  rate: form.buyerRate,  amount: form.buyerAmount  },
        { ...form, ciNo: `CI-26-${String(baseSeq + 1).padStart(4, '0')}`, party: 'seller', partyName: linkedConf.seller, rate: form.sellerRate, amount: form.sellerAmount },
      ]});
    } else {
      onCmd({ action: 'saved:commission', data: form });
    }
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
          <h1 className="page-title">New commission invoice</h1>
          <div className="page-sub">Bill your brokerage commission to buyer, seller, or both in one step. Fields marked <span style={{ color:'var(--negative)' }}>*</span> are required.</div>
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
                  <Input value={form.ciNo} readOnly style={{ color:'var(--text-3)', background:'var(--surface-2)' }} />
                </Field>
                <Field label="Date" required>
                  <DatePicker value={form.date} onChange={(v) => setForm(f => ({ ...f, date: v }))} />
                </Field>
                <Field label="Confirmation no." required span={2}>
                  <Select value={form.confNo} onChange={set('confNo')}>
                    <option value="">Select confirmation…</option>
                    {CONFIRMATIONS.map(c => (
                      <option key={c.no} value={c.no}>{c.no} · {c.buyer} · {c.seller}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </Section>

            <Section title="Party">
              <div className="form-grid">
                <Field label="Billed to" required>
                  <Select value={form.party} onChange={set('party')}>
                    <option value="buyer">Buyer only</option>
                    <option value="seller">Seller only</option>
                    <option value="both">Both buyer &amp; seller</option>
                  </Select>
                </Field>
                {form.party !== 'both' && (
                  <Field label="Party name" required>
                    <Input value={form.partyName} onChange={set('partyName')} placeholder="Auto-filled from confirmation" />
                  </Field>
                )}
                {form.party === 'both' && linkedConf && (
                  <Field label="Parties">
                    <div style={{ fontSize:12.5, color:'var(--text-2)', padding:'7px 0', lineHeight:1.6 }}>
                      <div><span style={{ color:'var(--text-3)' }}>Buyer:</span> <strong>{linkedConf.buyer}</strong></div>
                      <div><span style={{ color:'var(--text-3)' }}>Seller:</span> <strong>{linkedConf.seller}</strong></div>
                    </div>
                  </Field>
                )}
              </div>
            </Section>

            <Section title="Commission">
              <div className="form-grid">
                <Field label="Candies" required hint="1 candy = 356 kg · auto-filled from deliveries">
                  <Input type="number" step="0.01" placeholder="0.00" value={form.candies}
                    onChange={e => { setAmountEdited(false); setBuyerAmtEdited(false); setSellerAmtEdited(false); setForm(f => ({ ...f, candies: e.target.value })); }}
                    className="input tnum" />
                </Field>
                {form.party !== 'both' ? (
                  <>
                    <Field label="Rate per candy (₹)" required>
                      <div className="input-group">
                        <span className="input-prefix">₹</span>
                        <Input type="number" placeholder="150" value={form.rate}
                          onChange={e => { setAmountEdited(false); set('rate')(e); }}
                          className="input tnum" />
                        <span className="input-suffix">/candy</span>
                      </div>
                    </Field>
                    <Field label="Commission amount (₹)" required hint={amountEdited && calcAmount > 0 ? `Calculated: ₹${fmtNum(calcAmount)}` : undefined}>
                      <div style={{ display:'flex', gap:6 }}>
                        <div className="input-group" style={{ flex:1 }}>
                          <span className="input-prefix">₹</span>
                          <Input type="number" placeholder="0" value={form.amount}
                            onChange={e => { setAmountEdited(true); set('amount')(e); }}
                            className="input tnum" />
                        </div>
                        {amountEdited && calcAmount > 0 && (
                          <button className="btn btn-sm" style={{ flexShrink:0, fontSize:11 }}
                            onClick={() => { setForm(f => ({ ...f, amount: String(calcAmount) })); setAmountEdited(false); }}>
                            Reset
                          </button>
                        )}
                      </div>
                    </Field>
                  </>
                ) : (
                  <div style={{ gridColumn:'span 2', display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    {/* Buyer */}
                    <div style={{ border:'1px solid var(--border)', borderRadius:8, padding:'14px 16px', background:'rgba(37,99,235,.03)' }}>
                      <div style={{ fontWeight:600, fontSize:12, color:'var(--text-2)', marginBottom:12, textTransform:'uppercase', letterSpacing:'.05em' }}>Buyer commission</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        <div>
                          <div style={{ fontSize:12, fontWeight:500, color:'var(--text-3)', marginBottom:4 }}>Rate per candy</div>
                          <div className="input-group">
                            <span className="input-prefix">₹</span>
                            <Input type="number" placeholder="150" value={form.buyerRate}
                              onChange={e => { setBuyerAmtEdited(false); setForm(f => ({ ...f, buyerRate: e.target.value })); }}
                              className="input tnum" />
                            <span className="input-suffix">/candy</span>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize:12, fontWeight:500, color:'var(--text-3)', marginBottom:4 }}>Amount (₹)</div>
                          <div style={{ display:'flex', gap:6 }}>
                            <div className="input-group" style={{ flex:1 }}>
                              <span className="input-prefix">₹</span>
                              <Input type="number" placeholder="0" value={form.buyerAmount}
                                onChange={e => { setBuyerAmtEdited(true); setForm(f => ({ ...f, buyerAmount: e.target.value })); }}
                                className="input tnum" />
                            </div>
                            {buyerAmtEdited && calcBuyerAmount > 0 && (
                              <button className="btn btn-sm" style={{ flexShrink:0, fontSize:11 }}
                                onClick={() => { setForm(f => ({ ...f, buyerAmount: String(calcBuyerAmount) })); setBuyerAmtEdited(false); }}>Reset</button>
                            )}
                          </div>
                          {!buyerAmtEdited && calcBuyerAmount > 0 && (
                            <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>Auto: ₹{fmtNum(calcBuyerAmount)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Seller */}
                    <div style={{ border:'1px solid var(--border)', borderRadius:8, padding:'14px 16px', background:'rgba(5,150,105,.03)' }}>
                      <div style={{ fontWeight:600, fontSize:12, color:'var(--text-2)', marginBottom:12, textTransform:'uppercase', letterSpacing:'.05em' }}>Seller commission</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        <div>
                          <div style={{ fontSize:12, fontWeight:500, color:'var(--text-3)', marginBottom:4 }}>Rate per candy</div>
                          <div className="input-group">
                            <span className="input-prefix">₹</span>
                            <Input type="number" placeholder="100" value={form.sellerRate}
                              onChange={e => { setSellerAmtEdited(false); setForm(f => ({ ...f, sellerRate: e.target.value })); }}
                              className="input tnum" />
                            <span className="input-suffix">/candy</span>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize:12, fontWeight:500, color:'var(--text-3)', marginBottom:4 }}>Amount (₹)</div>
                          <div style={{ display:'flex', gap:6 }}>
                            <div className="input-group" style={{ flex:1 }}>
                              <span className="input-prefix">₹</span>
                              <Input type="number" placeholder="0" value={form.sellerAmount}
                                onChange={e => { setSellerAmtEdited(true); setForm(f => ({ ...f, sellerAmount: e.target.value })); }}
                                className="input tnum" />
                            </div>
                            {sellerAmtEdited && calcSellerAmount > 0 && (
                              <button className="btn btn-sm" style={{ flexShrink:0, fontSize:11 }}
                                onClick={() => { setForm(f => ({ ...f, sellerAmount: String(calcSellerAmount) })); setSellerAmtEdited(false); }}>Reset</button>
                            )}
                          </div>
                          {!sellerAmtEdited && calcSellerAmount > 0 && (
                            <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>Auto: ₹{fmtNum(calcSellerAmount)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                  <textarea className="input textarea" rows="3" placeholder="Payment terms, reference number, remarks…" value={form.notes} onChange={set('notes')} />
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

        {/* Sidebar */}
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

              {confDeliveries.length > 0 ? (
                <div className="card">
                  <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
                    <div className="card-title" style={{ fontSize:12 }}>Delivery summary</div>
                    <span className="muted" style={{ fontSize:11 }}>{confDeliveries.length} lot{confDeliveries.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="card-body" style={{ padding:'8px 16px 14px', display:'flex', flexDirection:'column', gap:8, fontSize:12.5 }}>
                    {[
                      ['Total bales',   totalBales],
                      ['Net weight',    fmtNum(totalNet) + ' kg'],
                      ['Candies',       calcCandies.toFixed(3)],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ color:'var(--text-3)' }}>{k}</span>
                        <span className="tnum" style={{ fontWeight:500 }}>{v}</span>
                      </div>
                    ))}
                    {form.party !== 'both' ? (
                      parseInt(form.rate) > 0 && calcCandies > 0 && (
                        <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--border)', paddingTop:8 }}>
                          <span style={{ color:'var(--text-3)' }}>@ ₹{form.rate}/candy</span>
                          <span className="tnum" style={{ fontWeight:700, color:'var(--text-1)' }}>₹{fmtNum(calcAmount)}</span>
                        </div>
                      )
                    ) : (
                      calcCandies > 0 && (
                        <div style={{ display:'flex', flexDirection:'column', gap:4, borderTop:'1px solid var(--border)', paddingTop:8 }}>
                          {parseInt(form.buyerRate) > 0 && <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}><span style={{ color:'var(--text-3)' }}>Buyer @ ₹{form.buyerRate}</span><span className="tnum">₹{fmtNum(calcBuyerAmount)}</span></div>}
                          {parseInt(form.sellerRate) > 0 && <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}><span style={{ color:'var(--text-3)' }}>Seller @ ₹{form.sellerRate}</span><span className="tnum">₹{fmtNum(calcSellerAmount)}</span></div>}
                          <div style={{ display:'flex', justifyContent:'space-between', marginTop:2, borderTop:'1px solid var(--border)', paddingTop:4 }}>
                            <span style={{ color:'var(--text-3)', fontWeight:600 }}>Total</span>
                            <span className="tnum" style={{ fontWeight:700, color:'var(--text-1)' }}>₹{fmtNum(calcBuyerAmount + calcSellerAmount)}</span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="card-body" style={{ padding:'16px', textAlign:'center', color:'var(--text-3)', fontSize:12 }}>
                    <Icon.Truck size={16} />
                    <div style={{ marginTop:6 }}>No deliveries recorded yet for this confirmation.</div>
                    <div style={{ marginTop:3 }}>Enter candies manually above.</div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card">
              <div className="card-body" style={{ padding:'24px 16px', textAlign:'center', color:'var(--text-3)' }}>
                <Icon.Coins size={20} />
                <div style={{ marginTop:8, fontSize:12.5, fontWeight:500, color:'var(--text-2)' }}>Select a confirmation</div>
                <div style={{ marginTop:4, fontSize:12 }}>Confirmation details and delivery summary will appear here.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ----- Commission invoice detail / edit -----
const CommissionDetail = ({ invoice, allInvoices, onClose, onCmd, onNavigate }) => {
  const [editMode, setEditMode]   = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    no:        invoice.no,
    date:      _ciToDateStr(invoice.date),
    confNo:    invoice.confNo,
    party:     invoice.party,
    partyName: invoice.partyName,
    candies:   String(invoice.candies),
    rate:      String(invoice.rate),
    amount:    String(invoice.amount),
    balance:   String(invoice.balance || 0),
    status:    invoice.status,
    notes:     '',
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target?.value ?? e }));

  const linkedConf  = CONFIRMATIONS.find(c => c.no === form.confNo);
  const viewWrap    = !editMode ? { pointerEvents:'none' } : {};
  const idx         = allInvoices.findIndex(inv => inv.no === invoice.no);
  const hasPrev     = !editMode && idx > 0;
  const hasNext     = !editMode && idx < allInvoices.length - 1;
  const statusTone  = form.status === 'paid' ? 'success' : form.status === 'partial' ? 'warn' : 'danger';
  const calcAmount  = parseFloat(form.candies) > 0 && parseInt(form.rate) > 0
    ? Math.round(parseFloat(form.candies) * parseInt(form.rate)) : 0;

  return (
    <div className="content-inner wide">
      {alertOpen && <CIAlertDialog
        title="Edit this commission invoice?"
        body="This invoice has been issued. Editing it may affect financial records and reconciliation. Ensure all parties are informed before making changes."
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
          <div className="page-sub">
            Commission · {form.partyName}
            <span style={{ margin:'0 6px', color:'var(--text-3)' }}>·</span>
            <span style={{ textTransform:'capitalize' }}>{form.party}</span>
            <span style={{ margin:'0 6px', color:'var(--text-3)' }}>·</span>
            {fmtDate(invoice.date)}
          </div>
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
                  <Field label="Invoice No.">
                    <Input value={form.no} readOnly style={{ color:'var(--text-3)', background:'var(--surface-2)' }} />
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

              <Section title="Party">
                <div className="form-grid">
                  <Field label="Billed to">
                    <Select value={form.party} onChange={set('party')}>
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                    </Select>
                  </Field>
                  <Field label="Party name">
                    <Input value={form.partyName} onChange={set('partyName')} />
                  </Field>
                </div>
              </Section>

              <Section title="Commission">
                <div className="form-grid">
                  <Field label="Candies" hint="1 candy = 356 kg">
                    <Input type="number" step="0.01" value={form.candies} onChange={set('candies')} className="input tnum" />
                  </Field>
                  <Field label="Rate per candy (₹)">
                    <div className="input-group">
                      <span className="input-prefix">₹</span>
                      <Input type="number" value={form.rate} onChange={set('rate')} className="input tnum" />
                      <span className="input-suffix">/candy</span>
                    </div>
                  </Field>
                  <Field label="Invoice amount (₹)">
                    <div className="input-group">
                      <span className="input-prefix">₹</span>
                      <Input type="number" value={form.amount} onChange={set('amount')} className="input tnum" />
                    </div>
                  </Field>
                  <Field label="Balance due (₹)">
                    <div className="input-group">
                      <span className="input-prefix">₹</span>
                      <Input type="number" value={form.balance} onChange={set('balance')} className="input tnum" />
                    </div>
                  </Field>
                  <Field label="Payment status">
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
            </div>

            <div className="card-footer">
              <div style={{ display:'flex', gap:16 }}>
                <div>
                  <div className="muted" style={{ fontSize:11 }}>Commission amount</div>
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
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header" style={{ padding:'10px 16px', minHeight:'unset' }}>
              <div className="card-title" style={{ fontSize:12 }}>Calculation</div>
            </div>
            <div className="card-body" style={{ padding:'8px 16px 14px', display:'flex', flexDirection:'column', gap:8, fontSize:12.5 }}>
              {[
                ['Candies', parseFloat(form.candies || 0).toFixed(3)],
                ['Rate',    `₹${fmtNum(parseInt(form.rate) || 0)}/candy`],
              ].map(([k, v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'var(--text-3)' }}>{k}</span>
                  <span className="tnum" style={{ fontWeight:500 }}>{v}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--border)', paddingTop:8 }}>
                <span style={{ color:'var(--text-3)' }}>Calculated</span>
                <span className="tnum" style={{ fontWeight:700, color:'var(--text-1)' }}>₹{fmtNum(calcAmount)}</span>
              </div>
            </div>
          </div>

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

const _COMM_COLS = [
  { field:'no',      label:'Invoice No.', defaultOn:true  },
  { field:'conf',    label:'Conf No.',    defaultOn:true  },
  { field:'date',    label:'Date',        defaultOn:true  },
  { field:'party',   label:'Party',       defaultOn:true  },
  { field:'candies', label:'Candies',     defaultOn:true  },
  { field:'rate',    label:'Rate',        defaultOn:false },
  { field:'amount',  label:'Amount',      defaultOn:true  },
  { field:'balance', label:'Balance',     defaultOn:true  },
  { field:'status',  label:'Status',      defaultOn:true  },
];

// ----- Main list -----
const CommissionInvoices = ({ onCmd, extraCommInvoices = [] }) => {
  const [view, setView] = React.useState('list');
  const [tab,  setTab]  = React.useState('all');
  const ctrl = useTableControls(CI_COLS);
  const [exportMode, setExportMode] = React.useState(false);
  const [exportSel,  setExportSel]  = React.useState([]);
  const [fmtOpen,    setFmtOpen]    = React.useState(false);
  const [visibleCols, setVisibleCols] = React.useState(
    () => new Set(_COMM_COLS.filter(c => c.defaultOn).map(c => c.field))
  );
  const vis = (f) => visibleCols.has(f);

  const allInvoices = [...extraCommInvoices, ...COMM_INVOICES];

  if (view === 'new') {
    return <NewCommissionInvoice onClose={() => setView('list')} onCmd={onCmd} />;
  }
  if (view?.type === 'detail') {
    return <CommissionDetail key={view.item.no} invoice={view.item} allInvoices={allInvoices}
      onClose={() => setView('list')} onCmd={onCmd}
      onNavigate={(inv) => setView({ type:'detail', item:inv })} />;
  }

  // Stats
  const totalBilled  = allInvoices.reduce((s, i) => s + (i.amount  || 0), 0);
  const outstanding  = allInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.balance || 0), 0);
  const collected    = allInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount  || 0), 0);
  const totalCandies = allInvoices.reduce((s, i) => s + (i.candies || 0), 0);

  const TABS = [
    { id:'all',     label:'All'     },
    { id:'unpaid',  label:'Unpaid'  },
    { id:'partial', label:'Partial' },
    { id:'paid',    label:'Paid'    },
  ];

  const tabFiltered = allInvoices.filter(inv => tab === 'all' || inv.status === tab);
  const filtered    = ctrl.sortData(ctrl.filterData(tabFiltered));

  const _dl = (content, filename, mime) => {
    const blob = new Blob(['﻿', content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const exportRows   = filtered.filter(r => exportSel.includes(r.no));
  const allExpSelected = filtered.length > 0 && filtered.every(r => exportSel.includes(r.no));

  const doExport = (fmt) => {
    const cols = [
      { h:'Invoice No.', v: r => r.no },
      { h:'Conf No.',    v: r => r.confNo },
      { h:'Date',        v: r => r.date instanceof Date ? r.date.toLocaleDateString('en-IN') : r.date },
      { h:'Party',       v: r => r.partyName },
      { h:'Billed To',   v: r => r.party },
      { h:'Candies',     v: r => parseFloat(r.candies).toFixed(2) },
      { h:'Rate',        v: r => `${r.rate}/candy` },
      { h:'Amount',      v: r => r.amount },
      { h:'Balance',     v: r => r.balance },
      { h:'Status',      v: r => r.status },
    ];
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    if (fmt === 'csv') {
      _dl([cols.map(c => esc(c.h)).join(','), ...exportRows.map(r => cols.map(c => esc(c.v(r))).join(','))].join('\r\n'), 'commission-invoices.csv', 'text/csv');
    } else if (fmt === 'excel') {
      const th = `<tr>${cols.map(c => `<th>${c.h}</th>`).join('')}</tr>`;
      const tb = exportRows.map(r => `<tr>${cols.map(c => `<td>${c.v(r)}</td>`).join('')}</tr>`).join('');
      _dl(`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/></head><body><table>${th}${tb}</table></body></html>`, 'commission-invoices.xls', 'application/vnd.ms-excel');
    } else if (fmt === 'word') {
      const th = `<tr>${cols.map(c => `<th>${c.h}</th>`).join('')}</tr>`;
      const tb = exportRows.map(r => `<tr>${cols.map(c => `<td>${c.v(r)}</td>`).join('')}</tr>`).join('');
      _dl(`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"/></head><body><h2>Commission Invoices</h2><table border="1">${th}${tb}</table></body></html>`, 'commission-invoices.doc', 'application/msword');
    } else if (fmt === 'pdf') {
      const th = `<tr>${cols.map(c => `<th style="padding:8px;border:1px solid #ddd;background:#f5f5f5;text-align:left">${c.h}</th>`).join('')}</tr>`;
      const tb = exportRows.map(r => `<tr>${cols.map(c => `<td style="padding:8px;border:1px solid #ddd">${c.v(r)}</td>`).join('')}</tr>`).join('');
      const w = window.open('', '_blank');
      w.document.write(`<!DOCTYPE html><html><head><title>Commission Invoices</title><style>body{font-family:sans-serif;padding:24px}table{border-collapse:collapse;width:100%}@media print{button{display:none}}</style></head><body><h2>Commission Invoices</h2><table>${th}${tb}</table><script>setTimeout(()=>window.print(),400)<\/script></body></html>`);
      w.document.close();
    }
    setFmtOpen(false); setExportMode(false); setExportSel([]);
  };

  return (
    <div className="content-inner wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">Commission Invoices</h1>
          <div className="page-sub">Brokerage commission billed to buyers and sellers · {allInvoices.length} invoices</div>
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
              <ViewMenu cols={_COMM_COLS} visible={visibleCols} onChange={setVisibleCols} />
              <button className="btn" onClick={() => setExportMode(true)}><Icon.Download size={14} /> Export</button>
              <button className="btn btn-primary" onClick={() => setView('new')}><Icon.Plus size={14} /> New invoice</button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Total billed',  value: fmtINR(totalBilled, { compact:true }),  color:'var(--text-1)'   },
          { label:'Outstanding',   value: fmtINR(outstanding, { compact:true }),  color:'var(--negative)' },
          { label:'Collected',     value: fmtINR(collected,   { compact:true }),  color:'var(--positive)' },
          { label:'Total candies', value: totalCandies.toFixed(2),               color:'var(--text-1)'   },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="card-body" style={{ padding:'12px 16px' }}>
              <div className="muted" style={{ fontSize:11, marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:20, fontWeight:700, letterSpacing:'-.01em', color:s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header" style={{ gap:8, flexWrap:'wrap' }}>
          <div className="card-title">Commission Invoices</div>
          <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginLeft:8 }}>
            {TABS.map(t => (
              <button key={t.id} className={`btn btn-sm ${tab === t.id ? '' : 'btn-ghost'}`}
                style={tab !== t.id ? { border:'none' } : {}}
                onClick={() => setTab(t.id)}>
                {t.label}
                <span style={{ marginLeft:5, fontSize:11, fontWeight:600, color: tab === t.id ? 'inherit' : 'var(--text-3)' }}>
                  {t.id === 'all' ? allInvoices.length : allInvoices.filter(i => i.status === t.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding:'0 16px 4px' }}>
          <FilterToolbar ctrl={ctrl} columnDefs={CI_COLS} totalCount={tabFiltered.length} filteredCount={filtered.length} />
        </div>

        <table className="tbl">
          <thead>
            <tr>
              {exportMode && (
                <th style={{ width:36, paddingLeft:14 }}>
                  <input type="checkbox" checked={allExpSelected} onChange={e => setExportSel(e.target.checked ? filtered.map(r => r.no) : [])} />
                </th>
              )}
              {vis('no')      && <SortableHeader field="no"        label="Invoice No." ctrl={ctrl} />}
              {vis('conf')    && <SortableHeader field="confNo"    label="Conf No."    ctrl={ctrl} />}
              {vis('date')    && <SortableHeader field="date"      label="Date"        ctrl={ctrl} />}
              {vis('party')   && <SortableHeader field="partyName" label="Party"       ctrl={ctrl} />}
              {vis('candies') && <SortableHeader field="candies"   label="Candies"     ctrl={ctrl} className="num" align="right" />}
              {vis('rate')    && <th>Rate</th>}
              {vis('amount')  && <SortableHeader field="amount"    label="Amount"      ctrl={ctrl} className="num" align="right" />}
              {vis('balance') && <SortableHeader field="balance"   label="Balance"     ctrl={ctrl} className="num" align="right" />}
              {vis('status')  && <SortableHeader field="status"    label="Status"      ctrl={ctrl} />}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign:'center', padding:'40px 32px', color:'var(--text-3)', fontSize:13 }}>
                  No commission invoices match.
                </td>
              </tr>
            )}
            {filtered.map(inv => (
              <tr key={inv.no} style={{ cursor:'pointer' }}
                onClick={() => exportMode
                  ? setExportSel(prev => prev.includes(inv.no) ? prev.filter(x => x !== inv.no) : [...prev, inv.no])
                  : setView({ type:'detail', item:inv })}>
                {exportMode && (
                  <td onClick={e => e.stopPropagation()} style={{ paddingLeft:14 }}>
                    <input type="checkbox" checked={exportSel.includes(inv.no)}
                      onChange={() => setExportSel(prev => prev.includes(inv.no) ? prev.filter(x => x !== inv.no) : [...prev, inv.no])} />
                  </td>
                )}
                {vis('no')      && <td className="cell-mono cell-strong">{inv.no}</td>}
                {vis('conf')    && <td className="cell-mono muted">{inv.confNo}</td>}
                {vis('date')    && <td className="muted">{fmtDateShort(inv.date)}</td>}
                {vis('party')   && (
                  <td>
                    <div style={{ fontWeight:500 }}>{inv.partyName}</div>
                    <div style={{ fontSize:11, color:'var(--text-3)', textTransform:'capitalize', marginTop:1 }}>{inv.party}</div>
                  </td>
                )}
                {vis('candies') && <td className="num tnum">{parseFloat(inv.candies).toFixed(2)}</td>}
                {vis('rate')    && <td className="tnum muted" style={{ whiteSpace:'nowrap' }}>₹{inv.rate}/c</td>}
                {vis('amount')  && <td className="num tnum cell-strong">{fmtINR(inv.amount, { compact:true })}</td>}
                {vis('balance') && (
                  <td className="num tnum" style={{ color: inv.balance > 0 ? 'var(--negative)' : 'var(--text-3)' }}>
                    {inv.balance > 0 ? fmtINR(inv.balance, { compact:true }) : '—'}
                  </td>
                )}
                {vis('status')  && <td><CIPill status={inv.status} /></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {fmtOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
             onClick={() => setFmtOpen(false)}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:24, width:400, maxWidth:'100%', boxShadow:'0 8px 40px rgba(0,0,0,.18)' }}
               onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:700, fontSize:15, color:'var(--text-1)', marginBottom:6 }}>Choose export format</div>
            <div style={{ fontSize:12.5, color:'var(--text-3)', marginBottom:20 }}>Exporting {exportSel.length} row{exportSel.length !== 1 ? 's' : ''}</div>
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
    </div>
  );
};

window.CommissionInvoices = CommissionInvoices;
