// Dashboard — cotton broker / agent command centre

const { Badge, fmtINR, fmtNum } = window.UI;
const { ACTIVITY, CONFIRMATIONS, INVOICES, DELIVERIES } = window.NCData;

const _DASH_COMM = [
  { no:'CI-26-0006', partyName:'Welspun India',              party:'buyer',  confNo:'SC-26-0141', amount:25842, balance:25842, status:'unpaid'  },
  { no:'CI-26-0005', partyName:'Vardhman Textiles',          party:'buyer',  confNo:'SC-26-0140', amount:13314, balance:0,     status:'paid'    },
  { no:'CI-26-0004', partyName:'Arvind Mills Ltd.',          party:'buyer',  confNo:'SC-26-0137', amount:29528, balance:14764, status:'partial' },
  { no:'CI-26-0003', partyName:'Welspun India',              party:'buyer',  confNo:'SC-26-0136', amount:11832, balance:0,     status:'paid'    },
  { no:'CI-26-0002', partyName:'Sri Lakshmi Cotton Ginning', party:'seller', confNo:'SC-26-0142', amount:7143,  balance:7143,  status:'unpaid'  },
  { no:'CI-26-0001', partyName:'Shree Krishna Cotex',        party:'seller', confNo:'SC-26-0135', amount:4944,  balance:0,     status:'paid'    },
];

// Widget metadata
const _W_SIZE_DEFAULTS = { kpi:'full', pipeline:'large', attention:'small', commission:'half', buyers:'half', confirmations:'large', activity:'small' };
const _W_LABEL         = { kpi:'KPI Cards', pipeline:'Deal Pipeline', attention:'Needs Attention', commission:'Commission Summary', buyers:'Buyer Balances', confirmations:'Recent Confirmations', activity:'Activity & Season' };
const _DEFAULT_ORDER   = ['kpi','pipeline','attention','commission','buyers','confirmations','activity'];
const _SIZE_UNITS      = { full:12, large:8, half:6, small:4 };
const _SIZE_LABELS     = { small:'S', half:'M', large:'L', full:'F' };
const _SIZE_CYCLE      = ['small','half','large','full'];

// ---- StatCard ----
const StatCard = ({ label, value, sub, subTone, accent }) => (
  <div className="card" style={{ padding:0 }}>
    <div className="card-body" style={{ padding:'16px 18px 14px', display:'flex', flexDirection:'column', gap:4 }}>
      <div style={{ fontSize:11, color:'var(--text-3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em' }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:700, letterSpacing:'-.02em', color: accent || 'var(--text-1)', lineHeight:1.1 }}>{value}</div>
      {sub && (
        <div style={{ fontSize:12, color: subTone==='danger'?'var(--negative)':subTone==='warn'?'var(--warn)':subTone==='positive'?'var(--positive)':'var(--text-3)' }}>
          {sub}
        </div>
      )}
    </div>
  </div>
);

// ---- Pipeline strip ----
const Pipeline = ({ stages }) => (
  <div style={{ display:'flex', gap:0, alignItems:'stretch', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
    {stages.map((s, i) => {
      const Ic = Icon[s.icon] || Icon.Circle;
      return (
        <React.Fragment key={s.id}>
          <div style={{ flex:1, padding:'16px 18px', background: s.count>0?`${s.color}0d`:'var(--surface)', borderLeft: i>0?'1px dashed var(--border)':'none', display:'flex', flexDirection:'column', gap:6, cursor: s.onClick?'pointer':'default', transition:'background .15s' }}
            onClick={s.onClick}
            onMouseEnter={e => { if(s.onClick) e.currentTarget.style.background=`${s.color}18`; }}
            onMouseLeave={e => { e.currentTarget.style.background = s.count>0?`${s.color}0d`:'var(--surface)'; }}
          >
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <span style={{ width:26, height:26, borderRadius:7, background: s.count>0?`${s.color}22`:'var(--surface-2)', display:'grid', placeItems:'center', color: s.count>0?s.color:'var(--text-3)', flexShrink:0 }}>
                <Ic size={12} />
              </span>
              <span style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', lineHeight:1.2 }}>{s.label}</span>
            </div>
            <div style={{ fontSize:30, fontWeight:700, letterSpacing:'-.03em', color: s.count>0?s.color:'var(--text-4, var(--border))', lineHeight:1 }}>{s.count}</div>
            <div style={{ fontSize:11.5, color:'var(--text-3)', lineHeight:1.4 }}>{s.detail}</div>
          </div>
        </React.Fragment>
      );
    })}
  </div>
);

// ---- ActionRow ----
const ActionRow = ({ dotColor, id, label, sub, value, valueTone, onClick }) => (
  <div onClick={onClick} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px dashed var(--border)', cursor: onClick?'pointer':'default' }}>
    <span style={{ width:7, height:7, borderRadius:'50%', background:dotColor, flexShrink:0, marginTop:1 }} />
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <span className="cell-mono" style={{ fontSize:12, fontWeight:600, color:'var(--text-1)' }}>{id}</span>
        <span style={{ fontSize:12, color:'var(--text-2)' }}>{label}</span>
      </div>
      {sub && <div style={{ fontSize:11, color:'var(--text-3)', marginTop:1 }}>{sub}</div>}
    </div>
    {value && (
      <div style={{ fontSize:12.5, fontWeight:600, color: valueTone==='danger'?'var(--negative)':valueTone==='warn'?'var(--warn)':'var(--text-2)', whiteSpace:'nowrap', flexShrink:0 }}>
        {value}
      </div>
    )}
  </div>
);

// ---- Commission donut ----
const CommDonut = ({ collected, partial, unpaid, total }) => {
  const r=36, cx=44, cy=44, stroke=10, circ=2*Math.PI*r;
  const pC=collected/total, pP=partial/total, pU=unpaid/total;
  return (
    <svg width={88} height={88} viewBox="0 0 88 88">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#16a34a" strokeWidth={stroke} strokeDasharray={`${pC*circ} ${circ-pC*circ}`} strokeDashoffset={circ*0.25} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f59e0b" strokeWidth={stroke} strokeDasharray={`${pP*circ} ${circ-pP*circ}`} strokeDashoffset={circ*(0.25-pC)} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#dc2626" strokeWidth={stroke} strokeDasharray={`${pU*circ} ${circ-pU*circ}`} strokeDashoffset={circ*(0.25-pC-pP)} />
      <text x={cx} y={cy-5} textAnchor="middle" style={{ fontSize:9, fill:'var(--text-3)', fontWeight:500 }}>COLLECTED</text>
      <text x={cx} y={cy+8} textAnchor="middle" style={{ fontSize:11, fill:'var(--text-1)', fontWeight:700 }}>{Math.round(pC*100)}%</text>
    </svg>
  );
};

// ========================
// Dashboard
// ========================
const Dashboard = ({ onOpen, onCmd, userName, companyFY }) => {
  const _hour      = new Date().getHours();
  const _greeting  = _hour<12?'Good morning':_hour<17?'Good afternoon':'Good evening';
  const _firstName = (userName||'there').split(' ')[0];
  const _todayStr  = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  // ---- Derived data ----
  const openConfs     = CONFIRMATIONS.filter(c => c.status==='open');
  const inTransit     = DELIVERIES.filter(d => d.status==='In transit');
  const atMill        = DELIVERIES.filter(d => d.status==='Mill passing');
  const balesInMotion = [...inTransit,...atMill].reduce((s,d) => s+d.bales, 0);

  const commMTD         = _DASH_COMM.reduce((s,i) => s+i.amount, 0);
  const commOutstanding = _DASH_COMM.filter(i=>i.status!=='paid').reduce((s,i) => s+i.balance, 0);
  const commCollected   = _DASH_COMM.filter(i=>i.status==='paid').reduce((s,i) => s+i.amount, 0);
  const commPartial     = _DASH_COMM.filter(i=>i.status==='partial').reduce((s,i) => s+(i.amount-i.balance), 0);
  const invOutstanding  = INVOICES.filter(i=>i.balance>0).reduce((s,i) => s+i.balance, 0);
  const openDealValue   = openConfs.reduce((s,c) => s+(c.balesMin*(c.candyRt/356*178)), 0);

  const stageNew     = openConfs.filter(c => (c.delivered||0)===0);
  const stageDeliv   = openConfs.filter(c => (c.delivered||0)>0 && (c.delivered||0)<c.balesMin);
  const stageReady   = openConfs.filter(c => (c.delivered||0)>=c.balesMin && !c.invoiced);
  const stagePayment = openConfs.filter(c => c.invoiced && c.payment!=='paid');
  const stageClosed  = CONFIRMATIONS.filter(c => c.status==='closed');

  const pipeline = [
    { id:'new',     label:'Confirmed',       count:stageNew.length,     detail:stageNew.length?`${stageNew.map(c=>c.balesMin).reduce((a,b)=>a+b,0)} bales booked`:'No new deals',         color:'#3b82f6', icon:'CheckSquare'  },
    { id:'deliv',   label:'In Delivery',     count:stageDeliv.length,   detail:stageDeliv.length?`${balesInMotion} bales in motion`:'All delivered',                                      color:'#f59e0b', icon:'Truck'        },
    { id:'ready',   label:'Invoice Ready',   count:stageReady.length,   detail:stageReady.length?'Raise invoice now':'Nothing pending',                                                   color:'#8b5cf6', icon:'Receipt'      },
    { id:'payment', label:'Payment Pending', count:stagePayment.length, detail:stagePayment.length?`₹${fmtINR(INVOICES.filter(i=>i.balance>0).reduce((s,i)=>s+i.balance,0),{compact:true})} due`:'All cleared', color:'#ef4444', icon:'Wallet' },
    { id:'closed',  label:'Closed',          count:stageClosed.length,  detail:'Season deals done',                                                                                       color:'#16a34a', icon:'CheckCircle2' },
  ];

  const attention = [
    ...openConfs.filter(c=>(c.delivered||0)<c.balesMin).map(c => ({
      key:c.no+'-d', dot:'#f59e0b', id:c.no,
      label:`${c.balesMin-(c.delivered||0)} bales still pending`,
      sub:`${c.buyer} · ${c.station} · ${c.variety}`,
      value:`${c.delivered||0}/${c.balesMin} bales`, valueTone:'',
      onClick:() => onOpen('confirmation',c),
    })),
    ...INVOICES.filter(i=>i.balance>0).map(i => ({
      key:i.no+'-i', dot:'#ef4444', id:i.no,
      label:'invoice unpaid', sub:i.buyer,
      value:fmtINR(i.balance,{compact:true}), valueTone:'danger',
      onClick:()=>{},
    })),
    ..._DASH_COMM.filter(i=>i.balance>0).map(i => ({
      key:i.no+'-c', dot:'#8b5cf6', id:i.no,
      label:'commission due', sub:`${i.partyName} · ${i.party}`,
      value:`₹${fmtNum(i.balance)}`, valueTone:'warn',
      onClick:() => onCmd('nav:commission'),
    })),
  ];

  const buyerBalances = window.NCData.BUYERS.filter(b=>b.outstanding>0).sort((a,b)=>b.outstanding-a.outstanding).slice(0,4);
  const recentConfs   = CONFIRMATIONS.slice(0,6);

  // ---- Attention pagination ----
  const [attPage,     setAttPage]     = React.useState(1);
  const [attPageSize, setAttPageSize] = React.useState(10);

  // ---- Edit mode state ----
  const [editMode, setEditMode] = React.useState(false);
  const [widgetOrder, setWidgetOrder] = React.useState(() => {
    try { const s=localStorage.getItem('ncotton_dash_order'); return s?JSON.parse(s):[..._DEFAULT_ORDER]; }
    catch { return [..._DEFAULT_ORDER]; }
  });
  const [widgetSizes, setWidgetSizes] = React.useState(() => {
    try { const s=localStorage.getItem('ncotton_dash_sizes'); return s?{..._W_SIZE_DEFAULTS,...JSON.parse(s)}:{..._W_SIZE_DEFAULTS}; }
    catch { return {..._W_SIZE_DEFAULTS}; }
  });
  const [dragSrc,  setDragSrc]  = React.useState(null);
  const [dragOver, setDragOver] = React.useState(null);
  const dragTargetRef = React.useRef(null);
  const gridRef       = React.useRef(null);

  React.useEffect(() => { localStorage.setItem('ncotton_dash_order', JSON.stringify(widgetOrder)); }, [widgetOrder]);
  React.useEffect(() => { localStorage.setItem('ncotton_dash_sizes', JSON.stringify(widgetSizes)); }, [widgetSizes]);

  // Auto-scroll while dragging — walks up DOM to find the real scroll container
  React.useEffect(() => {
    if (!editMode) return;
    const THRESHOLD = 120, SPEED = 16;
    let dir = 0, raf = null;

    const getScrollEl = () => {
      let el = gridRef.current;
      while (el && el !== document.body) {
        const ov = window.getComputedStyle(el).overflowY;
        if (ov === 'auto' || ov === 'scroll') return el;
        el = el.parentElement;
      }
      return document.documentElement;
    };

    const tick = () => {
      if (dir === 0) return;
      getScrollEl().scrollTop += dir * SPEED;
      raf = requestAnimationFrame(tick);
    };

    const onDragOver = (e) => {
      const newDir = e.clientY > window.innerHeight - THRESHOLD ? 1 : e.clientY < THRESHOLD ? -1 : 0;
      if (newDir !== dir) {
        dir = newDir;
        if (raf) cancelAnimationFrame(raf);
        if (dir !== 0) raf = requestAnimationFrame(tick);
      }
    };

    const stop = () => { dir = 0; if (raf) { cancelAnimationFrame(raf); raf = null; } };

    document.addEventListener('dragover', onDragOver);
    document.addEventListener('dragend',  stop);
    document.addEventListener('drop',     stop);
    return () => {
      document.removeEventListener('dragover', onDragOver);
      document.removeEventListener('dragend',  stop);
      document.removeEventListener('drop',     stop);
      stop();
    };
  }, [editMode]);

  // ---- DnD handlers — widgets reorder live on hover so no gap is ever left ----
  const _dStart = (e, id) => {
    setDragSrc(id);
    dragTargetRef.current = null;
    e.dataTransfer.effectAllowed = 'move';
    // Build a floating ghost image — elevated card with shadow + tilt
    const el = document.getElementById('widget-' + id);
    if (el) {
      const rect = el.getBoundingClientRect();
      const clone = el.cloneNode(true);
      Object.assign(clone.style, {
        position: 'fixed', top: '-9999px', left: '0',
        width: rect.width + 'px',
        transform: 'rotate(-1.8deg) scale(1.05)',
        boxShadow: '0 36px 90px rgba(0,0,0,.5)',
        borderRadius: '14px',
        opacity: '1',
        pointerEvents: 'none',
        background: 'var(--surface)',
      });
      document.body.appendChild(clone);
      e.dataTransfer.setDragImage(clone, rect.width / 2, 90);
      setTimeout(() => { if (document.body.contains(clone)) document.body.removeChild(clone); }, 0);
    }
  };

  const _dOver = (e, id) => {
    e.preventDefault();
    if (!dragSrc || dragSrc === id) return;
    if (dragTargetRef.current === id) return; // same target — skip to prevent position oscillation
    dragTargetRef.current = id;
    setWidgetOrder(prev => {
      const from = prev.indexOf(dragSrc);
      const to   = prev.indexOf(id);
      if (from < 0 || to < 0 || from === to) return prev;
      const arr = [...prev];
      arr.splice(from, 1);
      arr.splice(to, 0, dragSrc);
      return arr;
    });
    setDragOver(id);
  };

  // Drop only clears state — order is already correct from the live _dOver reorders
  const _dDrop  = (e) => { e.preventDefault(); setDragSrc(null); setDragOver(null); dragTargetRef.current = null; };
  const _dEnd   = () => { setDragSrc(null); setDragOver(null); dragTargetRef.current = null; };
  const _dLeave = (id) => {
    if (dragOver === id) setDragOver(null);
    if (dragTargetRef.current === id) dragTargetRef.current = null; // allow re-entry to trigger another reorder
  };

  const setSize     = (id, s) => setWidgetSizes(prev => ({...prev,[id]:s}));
  const resetLayout = () => {
    setWidgetOrder([..._DEFAULT_ORDER]);
    setWidgetSizes({..._W_SIZE_DEFAULTS});
    localStorage.removeItem('ncotton_dash_order');
    localStorage.removeItem('ncotton_dash_sizes');
    setEditMode(false);
  };

  // ---- Widget content ----
  const renderWidget = (id) => {
    switch (id) {

      case 'kpi': return (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          <StatCard label="Commission (MTD)"  value={fmtINR(commMTD,{compact:true})}        sub={commOutstanding>0?`₹${fmtNum(commOutstanding)} still due`:'All collected'}                              subTone={commOutstanding>0?'warn':'positive'} accent="var(--accent)" />
          <StatCard label="Open deal value"   value={fmtINR(openDealValue,{compact:true})}  sub={`${openConfs.length} active confirmation${openConfs.length!==1?'s':''}`} />
          <StatCard label="Bales in motion"   value={fmtNum(balesInMotion)}                 sub={balesInMotion>0?`${inTransit.length} in transit · ${atMill.length} at mill`:'None in transit'}          subTone={inTransit.length>0?'warn':''} />
          <StatCard label="Invoice receivable" value={fmtINR(invOutstanding,{compact:true})} sub={`${INVOICES.filter(i=>i.balance>0).length} invoice${INVOICES.filter(i=>i.balance>0).length!==1?'s':''} pending`} subTone={invOutstanding>0?'danger':''} accent={invOutstanding>0?'var(--negative)':undefined} />
        </div>
      );

      case 'pipeline': return (
        <div className="card" style={{ flex:1 }}>
          <div className="card-header" style={{ paddingBottom:12 }}>
            <div>
              <div className="card-title">Deal pipeline</div>
              <div className="card-sub">Where each open confirmation stands right now</div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => onOpen('confirmations')}>View all <Icon.ArrowRight size={12}/></button>
          </div>
          <div className="card-body" style={{ paddingTop:0 }}>
            <Pipeline stages={pipeline} />
            {stageDeliv.length > 0 && (
              <div style={{ marginTop:14, padding:'10px 14px', background:'rgba(245,158,11,.06)', border:'1px solid rgba(245,158,11,.2)', borderRadius:8 }}>
                <div style={{ fontSize:11, fontWeight:600, color:'#b45309', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Delivery in progress</div>
                {stageDeliv.map(c => (
                  <div key={c.no} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, fontSize:12.5 }}>
                    <span className="cell-mono" style={{ fontWeight:600, color:'var(--text-1)', minWidth:100 }}>{c.no}</span>
                    <span style={{ color:'var(--text-2)', flex:1 }}>{c.buyer}</span>
                    <span style={{ color:'var(--text-3)' }}>{c.variety}</span>
                    <span className="tnum" style={{ color:'#b45309', fontWeight:600 }}>{c.delivered||0}/{c.balesMin}</span>
                    <div style={{ width:60, height:4, background:'var(--surface-2)', borderRadius:4, overflow:'hidden' }}>
                      <div style={{ width:`${Math.round(((c.delivered||0)/c.balesMin)*100)}%`, height:'100%', background:'#f59e0b', borderRadius:4 }} />
                    </div>
                    <button className="btn btn-sm btn-ghost" style={{ fontSize:11, padding:'3px 8px', border:'none' }} onClick={() => onOpen('confirmation',c)}>Open</button>
                  </div>
                ))}
              </div>
            )}
            {stagePayment.length > 0 && (
              <div style={{ marginTop:10, padding:'10px 14px', background:'rgba(239,68,68,.05)', border:'1px solid rgba(239,68,68,.18)', borderRadius:8 }}>
                <div style={{ fontSize:11, fontWeight:600, color:'#b91c1c', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Awaiting payment</div>
                {INVOICES.filter(i=>i.balance>0).map(i => (
                  <div key={i.no} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, fontSize:12.5 }}>
                    <span className="cell-mono" style={{ fontWeight:600, color:'var(--text-1)', minWidth:100 }}>{i.no}</span>
                    <span style={{ color:'var(--text-2)', flex:1 }}>{i.buyer}</span>
                    <span className="tnum" style={{ color:'#b91c1c', fontWeight:700 }}>{fmtINR(i.balance,{compact:true})}</span>
                    <span style={{ fontSize:11, padding:'2px 8px', background:'rgba(239,68,68,.1)', color:'#b91c1c', borderRadius:99, fontWeight:600 }}>{i.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );

      case 'attention': {
        const attTotalPages = Math.max(1, Math.ceil(attention.length / attPageSize));
        const attSafePage   = Math.min(attPage, attTotalPages);
        const attPaginated  = attention.slice((attSafePage - 1) * attPageSize, attSafePage * attPageSize);
        return (
          <div className="card" style={{ flex:1 }}>
            <div className="card-header">
              <div>
                <div className="card-title">Needs attention</div>
                <div className="card-sub">Action items for today</div>
              </div>
              {attention.length > 0 && (
                <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:20, height:20, borderRadius:99, background:'var(--negative)', color:'#fff', fontSize:11, fontWeight:700, flexShrink:0 }}>
                  {attention.length}
                </span>
              )}
            </div>
            <div className="card-body" style={{ padding:'4px 18px 12px' }}>
              {attention.length === 0 ? (
                <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-3)' }}>
                  <Icon.CheckCircle2 size={28} style={{ marginBottom:10, color:'var(--positive)' }} />
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--text-2)' }}>All clear</div>
                  <div style={{ fontSize:12, marginTop:4 }}>No pending actions</div>
                </div>
              ) : attPaginated.map(a => <ActionRow key={a.key} {...a} />)}
            </div>
            {attention.length > 0 && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 14px', borderTop:'1px solid var(--border)', gap:10, flexWrap:'wrap' }}>
                <span style={{ fontSize:11.5, color:'var(--text-3)', whiteSpace:'nowrap' }}>
                  <strong style={{ color:'var(--text-1)', fontWeight:600 }}>{(attSafePage-1)*attPageSize+1}–{Math.min(attSafePage*attPageSize,attention.length)}</strong>{' of '}{attention.length}
                </span>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <span style={{ fontSize:11.5, color:'var(--text-3)' }}>Show</span>
                    <select value={attPageSize} onChange={e => { setAttPageSize(Number(e.target.value)); setAttPage(1); }}
                      style={{ padding:'3px 20px 3px 7px', border:'1px solid var(--border)', borderRadius:5, background:'var(--bg-2)', color:'var(--text-1)', fontSize:11.5, fontFamily:'inherit', cursor:'pointer', outline:'none', appearance:'none', backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 5px center', transition:'border-color .12s' }}
                      onFocus={e => e.target.style.borderColor='var(--accent)'} onBlur={e => e.target.style.borderColor='var(--border)'}>
                      <option value={5}>5</option><option value={10}>10</option><option value={25}>25</option>
                    </select>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                    <button disabled={attSafePage===1} onClick={() => setAttPage(p => Math.max(1,p-1))}
                      style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:5, border:'1px solid var(--border)', background:'var(--bg-2)', cursor:attSafePage===1?'default':'pointer', color:attSafePage===1?'var(--text-3)':'var(--text-1)', fontSize:11.5, fontFamily:'inherit', fontWeight:500, opacity:attSafePage===1?0.45:1, transition:'border-color .12s' }}
                      onMouseEnter={e => { if(attSafePage!==1) e.currentTarget.style.borderColor='var(--accent)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; }}>
                      <Icon.ChevronLeft size={11}/> Prev
                    </button>
                    <div style={{ padding:'3px 10px', borderRadius:5, border:'1px solid var(--border)', background:'var(--surface)', fontSize:11.5, fontWeight:600, color:'var(--text-1)', whiteSpace:'nowrap', minWidth:52, textAlign:'center' }}>
                      {attSafePage} <span style={{ fontWeight:400, color:'var(--text-3)' }}>/ {attTotalPages}</span>
                    </div>
                    <button disabled={attSafePage===attTotalPages} onClick={() => setAttPage(p => Math.min(attTotalPages,p+1))}
                      style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:5, border:'1px solid var(--border)', background:'var(--bg-2)', cursor:attSafePage===attTotalPages?'default':'pointer', color:attSafePage===attTotalPages?'var(--text-3)':'var(--text-1)', fontSize:11.5, fontFamily:'inherit', fontWeight:500, opacity:attSafePage===attTotalPages?0.45:1, transition:'border-color .12s' }}
                      onMouseEnter={e => { if(attSafePage!==attTotalPages) e.currentTarget.style.borderColor='var(--accent)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; }}>
                      Next <Icon.ChevronRight size={11}/>
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div style={{ borderTop:'1px solid var(--border)', padding:'10px 14px', display:'flex', gap:6, flexWrap:'wrap' }}>
              <button className="btn btn-sm btn-ghost" style={{ fontSize:11.5, gap:5, border:'none' }} onClick={() => onCmd('nav:delivery-invoices')}><Icon.Truck size={12}/> Deliveries</button>
              <button className="btn btn-sm btn-ghost" style={{ fontSize:11.5, gap:5, border:'none' }} onClick={() => onCmd('nav:delivery-invoices')}><Icon.Receipt size={12}/> Invoices</button>
              <button className="btn btn-sm btn-ghost" style={{ fontSize:11.5, gap:5, border:'none' }} onClick={() => onCmd('nav:commission')}><Icon.Coins size={12}/> Commission</button>
            </div>
          </div>
        );
      }

      case 'commission': return (
        <div className="card" style={{ flex:1 }}>
          <div className="card-header" style={{ paddingBottom:10 }}>
            <div>
              <div className="card-title">Commission summary</div>
              <div className="card-sub">MTD · {_DASH_COMM.length} invoices</div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => onCmd('nav:commission')}>View all <Icon.ArrowRight size={12}/></button>
          </div>
          <div className="card-body" style={{ padding:'8px 18px 14px', display:'flex', gap:16, alignItems:'center' }}>
            <CommDonut collected={commCollected} partial={commPartial} unpaid={commOutstanding} total={commMTD} />
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { label:'Collected', value:commCollected,               color:'#16a34a' },
                { label:'Partial',   value:commPartial,                 color:'#f59e0b' },
                { label:'Unpaid',    value:commOutstanding-commPartial, color:'#dc2626' },
              ].map(row => (
                <div key={row.label} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:row.color, flexShrink:0 }} />
                  <span style={{ flex:1, fontSize:12, color:'var(--text-2)' }}>{row.label}</span>
                  <span className="tnum" style={{ fontSize:12.5, fontWeight:600, color:'var(--text-1)' }}>{fmtINR(row.value,{compact:true})}</span>
                </div>
              ))}
              <div style={{ borderTop:'1px solid var(--border)', paddingTop:8, display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:12, color:'var(--text-3)' }}>Total billed</span>
                <span className="tnum" style={{ fontSize:13, fontWeight:700 }}>{fmtINR(commMTD,{compact:true})}</span>
              </div>
            </div>
          </div>
        </div>
      );

      case 'buyers': return (
        <div className="card" style={{ flex:1 }}>
          <div className="card-header" style={{ paddingBottom:10 }}>
            <div>
              <div className="card-title">Buyer balances</div>
              <div className="card-sub">Outstanding receivables</div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => onOpen('buyers')}>View all <Icon.ArrowRight size={12}/></button>
          </div>
          <div className="card-body" style={{ padding:'4px 18px 12px' }}>
            {buyerBalances.map(b => {
              const maxOut = Math.max(...window.NCData.BUYERS.map(x=>x.outstanding));
              const pct    = Math.round((b.outstanding/maxOut)*100);
              return (
                <div key={b.id} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:12.5, fontWeight:500, color:'var(--text-1)' }}>{b.short||b.name.split(' ')[0]}</span>
                    <span className="tnum" style={{ fontSize:12.5, fontWeight:700, color:b.outstanding>1500000?'var(--negative)':'var(--text-1)' }}>{fmtINR(b.outstanding,{compact:true})}</span>
                  </div>
                  <div style={{ height:4, background:'var(--surface-2)', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:b.outstanding>1500000?'var(--negative)':'var(--accent)', borderRadius:4, transition:'width .3s' }} />
                  </div>
                </div>
              );
            })}
            {buyerBalances.length===0 && (
              <div style={{ fontSize:12.5, color:'var(--text-3)', padding:'16px 0', textAlign:'center' }}>All balances cleared</div>
            )}
          </div>
        </div>
      );

      case 'confirmations': return (
        <div className="card" style={{ flex:1 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Recent confirmations</div>
              <div className="card-sub">Last 7 days · {CONFIRMATIONS.length} total this season</div>
            </div>
            <button className="btn btn-sm btn-ghost" onClick={() => onOpen('confirmations')}>View all <Icon.ArrowRight size={12}/></button>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width:120 }}>Conf No</th>
                <th>Buyer</th>
                <th>Variety · Station</th>
                <th className="num">Bales</th>
                <th className="num">₹/candy</th>
                <th>Delivery</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {recentConfs.map(c => {
                const delivPct = c.balesMin>0 ? Math.round(((c.delivered||0)/c.balesMin)*100) : 0;
                return (
                  <tr key={c.no} onClick={() => onOpen('confirmation',c)}>
                    <td className="cell-mono cell-strong">{c.no}</td>
                    <td style={{ maxWidth:130 }}>
                      <div style={{ fontWeight:500, fontSize:12.5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.buyer}</div>
                    </td>
                    <td>
                      <div style={{ fontSize:12.5 }}>{c.variety}</div>
                      <div style={{ fontSize:11, color:'var(--text-3)' }}>{c.station}</div>
                    </td>
                    <td className="num tnum">{c.balesMin}</td>
                    <td className="num tnum cell-strong">₹{fmtNum(c.candyRt)}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <div style={{ width:44, height:4, background:'var(--surface-2)', borderRadius:4, overflow:'hidden', flexShrink:0 }}>
                          <div style={{ width:`${Math.min(delivPct,100)}%`, height:'100%', background:delivPct>=100?'var(--positive)':'var(--accent)', borderRadius:4 }} />
                        </div>
                        <span className="tnum muted" style={{ fontSize:11 }}>{delivPct}%</span>
                      </div>
                    </td>
                    <td>
                      <Badge tone={c.payment==='paid'?'success':c.payment==='partial'?'warn':c.status==='closed'?'':'info'}>
                        {c.payment==='paid'?'Paid':c.payment==='partial'?'Partial':c.status==='closed'?'Closed':'Pending'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );

      case 'activity': return (
        <div className="card" style={{ flex:1 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Activity</div>
              <div className="card-sub">Recent events across all deals</div>
            </div>
          </div>
          <div className="card-body" style={{ padding:'8px 18px 14px' }}>
            {ACTIVITY.map((a,i) => (
              <div key={i} className="feed-item">
                <span className="feed-dot" style={{ background:a.dot==='success'?'var(--positive)':a.dot==='warn'?'var(--warn)':a.dot==='info'?'var(--info)':'var(--text-3)' }} />
                <div>{a.text}</div>
                <div className="feed-time">{a.time}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid var(--border)', padding:'12px 18px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { label:'Deals this FY',    value:CONFIRMATIONS.length },
              { label:'Sellers active',   value:[...new Set(CONFIRMATIONS.map(c=>c.seller))].length },
              { label:'Buyers active',    value:[...new Set(CONFIRMATIONS.map(c=>c.buyer))].length },
              { label:'Stations covered', value:[...new Set(CONFIRMATIONS.map(c=>c.station))].length },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:2 }}>{s.label}</div>
                <div style={{ fontSize:18, fontWeight:700, color:'var(--text-1)' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      );

      default: return null;
    }
  };

  // ---- Widget wrapper with edit bar ----
  const wrapWidget = (id) => {
    const span       = _SIZE_UNITS[widgetSizes[id]||'half'];
    const isDragging = dragSrc===id;
    const isTarget   = editMode && dragOver===id && dragSrc!==id;

    return (
      <div
        id={'widget-' + id}
        key={id}
        style={{
          gridColumn: `span ${span}`,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 12,
          outline: isTarget ? '2px dashed var(--accent)' : 'none',
          outlineOffset: 4,
          transition: 'opacity .1s',
          // Source disappears — ghost image (set in _dStart) carries the dragged visual
          opacity: isDragging ? 0 : 1,
        }}
        onDragOver={editMode ? (e) => _dOver(e,id) : undefined}
        onDrop={editMode ? (e) => _dDrop(e,id) : undefined}
        onDragLeave={editMode ? () => _dLeave(id) : undefined}
      >
        {editMode && (
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 10px', marginBottom:4, background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:8, userSelect:'none', flexShrink:0 }}>

            {/* Grip handle — only this element is draggable */}
            <div
              draggable
              onDragStart={(e) => _dStart(e,id)}
              onDragEnd={_dEnd}
              title="Drag to reorder"
              style={{ cursor:'grab', padding:'3px 5px', display:'flex', alignItems:'center', borderRadius:4, flexShrink:0 }}
              onMouseEnter={e => e.currentTarget.style.background='var(--surface)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <svg width="8" height="12" viewBox="0 0 8 12">
                {[0,1,2].flatMap(row => [0,1].map(col => (
                  <circle key={`${row}-${col}`} cx={col*4+2} cy={row*4+2} r="1.5" fill="var(--text-3)" />
                )))}
              </svg>
            </div>

            <span style={{ flex:1, fontSize:11, fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em' }}>
              {_W_LABEL[id]}
            </span>

            {/* Size selector */}
            <div style={{ display:'flex', alignItems:'center', gap:3 }}>
              <span style={{ fontSize:10, color:'var(--text-3)', marginRight:2, letterSpacing:'.04em' }}>SIZE</span>
              {_SIZE_CYCLE.map(s => (
                <button
                  key={s}
                  onClick={() => setSize(id,s)}
                  title={{ small:'Small (1/3)', half:'Medium (1/2)', large:'Large (2/3)', full:'Full width' }[s]}
                  style={{
                    fontSize:10, fontWeight:700, width:22, height:22, borderRadius:4,
                    border:'1px solid var(--border)',
                    background: widgetSizes[id]===s ? 'var(--accent)' : 'transparent',
                    color: widgetSizes[id]===s ? '#fff' : 'var(--text-3)',
                    cursor:'pointer', lineHeight:1, flexShrink:0,
                  }}
                >
                  {_SIZE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Card content — flex:1 fills row height; blurred in edit mode */}
        <div style={
          editMode
            ? { flex:1, display:'flex', flexDirection:'column', filter:'blur(1.2px)', opacity:0.72, pointerEvents:'none', transition:'filter .2s, opacity .2s', borderRadius:10 }
            : { flex:1, display:'flex', flexDirection:'column', transition:'filter .2s, opacity .2s' }
        }>
          {renderWidget(id)}
        </div>
      </div>
    );
  };

  // ========================
  // Render
  // ========================
  return (
    <div className="content-inner wide">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{_greeting}, {_firstName}</h1>
          <div className="page-sub">
            {_todayStr}
            {companyFY ? <span> · {companyFY}</span> : null}
            {' · '}
            <span style={{ color:'var(--accent)', fontWeight:500 }}>
              {openConfs.length} open deal{openConfs.length!==1?'s':''}
            </span>
            {' · '}
            <span style={{ color:invOutstanding>0?'var(--negative)':'var(--positive)', fontWeight:500 }}>
              {INVOICES.filter(i=>i.balance>0).length} invoice{INVOICES.filter(i=>i.balance>0).length!==1?'s':''} pending
            </span>
          </div>
        </div>
        <div className="page-actions">
          {editMode ? (
            <>
              <button className="btn" onClick={resetLayout}><Icon.X size={14}/> Reset layout</button>
              <button className="btn btn-primary" onClick={() => setEditMode(false)}><Icon.Check size={14}/> Done</button>
            </>
          ) : (
            <button className="btn" onClick={() => setEditMode(true)}><Icon.Edit size={14}/> Edit dashboard</button>
          )}
        </div>
      </div>

      {/* Edit mode hint banner */}
      {editMode && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', marginBottom:16, background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:10, fontSize:13, color:'var(--text-2)' }}>
          <Icon.Edit size={14} style={{ color:'var(--accent)', flexShrink:0 }} />
          <span>
            Grab the <strong style={{ color:'var(--text-1)' }}>grip (⠿)</strong> on any widget to drag and reorder ·
            use <strong style={{ color:'var(--text-1)' }}>S / M / L / F</strong> to set width —
            Small, Medium (½), Large (⅔), Full
          </span>
        </div>
      )}

      {/* 12-column widget grid — CSS auto-placement handles wrapping */}
      <div ref={gridRef} style={{ display:'grid', gridTemplateColumns:'repeat(12, 1fr)', gap:16 }}>
        {widgetOrder.map(id => wrapWidget(id))}
      </div>

    </div>
  );
};

window.Dashboard = Dashboard;
