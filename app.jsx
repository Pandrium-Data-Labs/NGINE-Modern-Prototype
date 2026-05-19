// App shell — sidebar + topbar + screen routing + Tweaks + Cmd+K

const { useState, useEffect, useCallback } = React;

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace', fontSize: 13, color: '#dc2626', background: '#fff7f7', minHeight: '100vh', boxSizing: 'border-box' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#b91c1c' }}>App render error — check console for details</div>
          <pre style={{ background: '#fff', padding: 16, borderRadius: 8, overflow: 'auto', border: '1px solid #fca5a5', fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {String(this.state.error)}{'\n\n'}{this.state.error && this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "graphite",
  "sidebar": "expanded",
  "density": "comfortable",
  "font": "inter",
  "avatar": "av01",
  "userName": "Karthik R",
  "company": "aravind"
}/*EDITMODE-END*/;

const _COMPANY_DEFAULTS = [
  { id:'aravind', name:'Aravind Cotton Co.',        short:'Aravind', fy:'FY 2025–26', gst:'37AABCA1234F1Z5', pan:'AABCA1234F', phone:'', email:'', address:'Guntur, Andhra Pradesh', state:'Andhra Pradesh', industry:'Cotton Brokerage' },
  { id:'bharat',  name:'Bharat Textiles Pvt. Ltd.', short:'Bharat',  fy:'FY 2025–26', gst:'', pan:'', phone:'', email:'', address:'', state:'', industry:'' },
  { id:'lakshmi', name:'Sri Lakshmi Mills',          short:'Lakshmi', fy:'FY 2025–26', gst:'', pan:'', phone:'', email:'', address:'', state:'', industry:'' },
  { id:'ganesh',  name:'Ganesh Cotton Traders',      short:'Ganesh',  fy:'FY 2025–26', gst:'', pan:'', phone:'', email:'', address:'', state:'', industry:'' },
];

const NAV = [
  { section: 'Workspace', items: [
    { id: 'dashboard',         label: 'Dashboard',           icon: 'Home'        },
  ]},
  { section: 'Sales', items: [
    { id: 'confirmations',     label: 'Confirmations',        icon: 'Receipt'     },
    { id: 'delivery-invoices', label: 'Delivery & Invoices',  icon: 'Truck'       },
    { id: 'payment',           label: 'Payments',             icon: 'Wallet'      },
    { id: 'cr-dr-notes',       label: 'CR / DR Notes',        icon: 'FileText'    },
    { id: 'advance-payment',   label: 'Advance Payment',      icon: 'Banknote'    },
    { id: 'charity-cheque',    label: 'Charity Cheque',       icon: 'IndianRupee' },
    { id: 'allowances',        label: 'Allowances',           icon: 'Tag'         },
    { id: 'millweight',        label: 'Millweight',           icon: 'Bale'        },
    { id: 'gst-receipt',       label: 'GST Cert. Receipt',    icon: 'File'        },
  ]},
  { section: 'Commission', items: [
    { id: 'commission',         label: 'Commission Invoices',  icon: 'Coins'       },
    { id: 'sub-broker-ledger',  label: 'Sub-broker Ledger',    icon: 'Users'       },
    { id: 'comm-receipts',      label: 'Commission Receipts',  icon: 'BadgeCheck'  },
  ]},
  { section: 'Metadata', items: [
    { id: 'masters',           label: 'Masters',              icon: 'Archive'     },
  ]},
  { section: 'Insights', items: [
    { id: 'analytics',         label: 'Analytics',            icon: 'ChartLine'   },
    { id: 'activity',          label: 'Activity',             icon: 'Activity'    },
  ]},
  { section: 'Administration', items: [
    { id: 'company-settings',  label: 'Company Settings',     icon: 'Building'    },
  ]},
];

const _loadLS = (key) => {
  try {
    return (JSON.parse(localStorage.getItem(key)) || []).map(r => ({ ...r, date: new Date(r.date) }));
  } catch { return []; }
};
const _saveLS = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
};

const App = () => {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  const [route,               setRoute]               = useState({ name: window.__NGINE_INITIAL_ROUTE || 'dashboard', data: null });
  const [cmdkOpen,            setCmdkOpen]            = useState(false);
  const [avatarPickerOpen,    setAvatarPickerOpen]    = useState(false);
  const [companySwitcherOpen, setCompanySwitcherOpen] = useState(false);
  const [profileMenuOpen,     setProfileMenuOpen]     = useState(false);
  const [toast,               setToast]               = useState(null);

  // Companies — persisted in localStorage, CRUD'd in Company Settings screen
  const [companies, setCompanies] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('ncotton_companies'));
      if (s && s.length) return s;
    } catch {}
    return _COMPANY_DEFAULTS;
  });

  const currentCompany = companies.find(c => c.id === tweaks.company) || companies[0];

  const [extraConfirmations, setExtraConfirmations] = useState(() => _loadLS('ncotton_confs'));
  const [extraDeliveries,    setExtraDeliveries]    = useState(() => _loadLS('ncotton_deliveries'));
  const [extraInvoices,      setExtraInvoices]      = useState(() => _loadLS('ncotton_invoices'));
  const [extraCommInvoices,  setExtraCommInvoices]  = useState(() => _loadLS('ncotton_comm'));

  useEffect(() => { _saveLS('ncotton_confs',      extraConfirmations); }, [extraConfirmations]);
  useEffect(() => { _saveLS('ncotton_deliveries', extraDeliveries);    }, [extraDeliveries]);
  useEffect(() => { _saveLS('ncotton_invoices',   extraInvoices);      }, [extraInvoices]);
  useEffect(() => { _saveLS('ncotton_comm',       extraCommInvoices);  }, [extraCommInvoices]);
  useEffect(() => {
    try { localStorage.setItem('ncotton_companies', JSON.stringify(companies)); } catch {}
  }, [companies]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme   = tweaks.theme;
    root.dataset.accent  = tweaks.accent;
    root.dataset.density = tweaks.density;
    root.dataset.font    = tweaks.font;
  }, [tweaks.theme, tweaks.accent, tweaks.density, tweaks.font]);

  const collapsed = tweaks.sidebar === 'collapsed';
  useEffect(() => {
    const app = document.querySelector('.app');
    if (app) app.dataset.collapsed = String(collapsed);
  }, [collapsed]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmdkOpen(o => !o); }
      if (e.key === '/' && document.activeElement === document.body) { e.preventDefault(); setCmdkOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }, []);

  const handleCmd = (cmdOrAction) => {
    const action = typeof cmdOrAction === 'string' ? cmdOrAction : cmdOrAction.action;
    if (!action) return;
    if (action.startsWith('nav:')) {
      setRoute({ name: action.slice(4), data: null });
    } else if (action.startsWith('new:')) {
      const t = action.slice(4);
      if (t === 'confirmation') setRoute({ name: 'confirmation', data: null });
      else if (t === 'delivery') setRoute({ name: 'delivery-invoices', data: { openNewDelivery: true, confNo: cmdOrAction.confNo } });
      else if (t === 'buyer')   setRoute({ name: 'buyer', data: null });
      else if (t === 'payment') setRoute({ name: 'payment', data: null });
      else if (t === 'crdr')    setRoute({ name: 'cr-dr-notes', data: { confNo: cmdOrAction.confNo, noteType: cmdOrAction.noteType } });
      else showToast(`Quick-add: ${t}`);
    } else if (action.startsWith('open:invoice:')) {
      setRoute({ name: 'invoices', data: { invNo: action.slice('open:invoice:'.length) } });
    } else if (action.startsWith('open:')) {
      showToast(`Opening ${action.slice(5)}…`);
    } else if (action === 'set:theme') {
      setTweak('theme', tweaks.theme === 'light' ? 'dark' : 'light');
    } else if (action === 'set:tweaks') {
      window.postMessage({ type: '__activate_edit_mode' }, '*');
    } else if (action === 'saved:confirmation') {
      const f = cmdOrAction.data;
      const record = {
        no: f.confNo, date: new Date(f.date), buyer: f.buyer, seller: f.seller, station: f.station,
        variety: f.variety, balesMin: parseInt(f.balesMin) || 0, balesMax: parseInt(f.balesMax) || 0,
        candyRt: parseInt(f.candyRt) || 0, status: 'open', delivered: 0, invoiced: false, payment: 'pending', tags: f.tags || [],
      };
      if (f.isNew) {
        setExtraConfirmations(prev => [record, ...prev]);
      } else {
        setExtraConfirmations(prev => {
          const idx = prev.findIndex(c => c.no === f.confNo);
          if (idx >= 0) { const next = [...prev]; next[idx] = record; return next; }
          return [record, ...prev];
        });
      }
      setRoute({ name: 'confirmations' });
      showToast('Confirmation saved');
    } else if (action === 'saved:delivery') {
      const f = cmdOrAction.data;
      setExtraDeliveries(prev => [{
        id: f.deliveryId, conf: f.confNo, date: new Date(f.date),
        bales: parseInt(f.bales) || 0, gross: parseInt(f.gross) || 0, tare: parseInt(f.tare) || 0,
        net: (parseInt(f.gross) || 0) - (parseInt(f.tare) || 0), status: f.status, tags: f.tags || [],
      }, ...prev]);
      showToast('Delivery saved');
    } else if (action === 'saved:invoice') {
      const f = cmdOrAction.data;
      setExtraInvoices(prev => [{
        no: f.invoiceNo, date: new Date(f.date), conf: f.confNo, deliv: f.deliveryId, seller: f.seller,
        amount: parseInt(f.amount) || 0, balance: parseInt(f.amount) || 0, status: f.status || 'unpaid', tags: [],
      }, ...prev]);
      showToast('Invoice saved');
    } else if (action === 'saved:commissions') {
      const invoices = cmdOrAction.data;
      const records = invoices.map(f => ({
        no: f.ciNo, date: new Date(f.date), confNo: f.confNo, party: f.party, partyName: f.partyName,
        candies: parseFloat(f.candies) || 0, rate: parseInt(f.rate) || 0,
        amount: parseInt(f.amount) || 0, balance: parseInt(f.amount) || 0, status: f.status || 'unpaid',
      }));
      setExtraCommInvoices(prev => [...records, ...prev]);
      showToast(invoices.length + ' commission invoices saved');
    } else if (action === 'saved:commission') {
      const f = cmdOrAction.data;
      setExtraCommInvoices(prev => [{
        no: f.ciNo, date: new Date(f.date), confNo: f.confNo, party: f.party, partyName: f.partyName,
        candies: parseFloat(f.candies) || 0, rate: parseInt(f.rate) || 0,
        amount: parseInt(f.amount) || 0, balance: parseInt(f.amount) || 0, status: f.status || 'unpaid',
      }, ...prev]);
      showToast('Commission invoice saved');
    } else if (action === 'saved:draft') {
      showToast('Draft saved');
    } else if (action === 'saved') {
      showToast('Saved');
    } else if (action === 'export') {
      showToast('Exporting…');
    } else {
      showToast(action);
    }
  };

  const openScreen = (name, data) => setRoute({ name, data });

  const renderScreen = () => {
    switch (route.name) {
      case 'dashboard':         return <window.Dashboard onOpen={openScreen} onCmd={handleCmd} userName={tweaks.userName} companyFY={currentCompany.fy} />;
      case 'confirmations':     return <window.ConfirmationsList extraConfirmations={extraConfirmations} onOpen={openScreen} onCmd={handleCmd} />;
      case 'confirmation':      return <window.SaleConfirmation prefill={route.data} extraConfirmations={extraConfirmations} onNavigate={(conf) => setRoute({ name: 'confirmation', data: conf })} onClose={() => setRoute({ name: 'confirmations' })} onCmd={handleCmd} />;
      case 'delivery-invoices': return <window.DeliveryInvoices extraDeliveries={extraDeliveries} extraInvoices={extraInvoices} onCmd={handleCmd} initialView={route.data?.openNewDelivery ? 'new-delivery' : undefined} initialConfNo={route.data?.confNo} />;
      case 'delivery':          return <window.Delivery onClose={() => setRoute({ name: 'dashboard' })} onCmd={handleCmd} />;
      case 'invoices':          return <window.InvoicesList onCmd={handleCmd} />;
      case 'payment':           return <window.CottonPayment onClose={() => setRoute({ name: 'dashboard' })} onCmd={handleCmd} />;
      case 'masters':           return <window.Masters onOpen={openScreen} onCmd={handleCmd} />;
      case 'buyers':            return <window.BuyersList onOpen={openScreen} onCmd={handleCmd} />;
      case 'buyer':             return <window.Buyer prefill={route.data} onClose={() => setRoute({ name: 'masters' })} onCmd={handleCmd} />;
      case 'commission':          return <window.CommissionInvoices extraCommInvoices={extraCommInvoices} onCmd={handleCmd} />;
      case 'sub-broker-ledger':  return <window.SubBrokerLedger onCmd={handleCmd} />;
      case 'comm-receipts':      return <window.CommissionReceipts onCmd={handleCmd} />;
      case 'company-settings':  return <window.CompanySettings companies={companies} setCompanies={setCompanies} currentId={tweaks.company} setCurrentCompany={(id) => setTweak('company', id)} onCmd={handleCmd} />;
      case 'cr-dr-notes':  return <window.CrDrNotes onCmd={handleCmd} initialConfNo={route.data?.confNo} initialType={route.data?.noteType} />;
      case 'advance-payment': return <window.AdvancePayment onCmd={handleCmd} />;
      case 'charity-cheque': return <window.CharityCheque onCmd={handleCmd} />;
      case 'millweight':   return <window.Millweight onCmd={handleCmd} />;
      case 'gst-receipt':  return <window.GstReceipt onCmd={handleCmd} />;
      case 'allowances':   return <window.Allowances onCmd={handleCmd} />;
      case 'sellers':     case 'varieties':         case 'stations':
      case 'analytics':   case 'activity':
        return <ComingSoon name={route.name} onClose={() => setRoute({ name: 'dashboard' })} />;
      default: return <window.Dashboard onOpen={openScreen} onCmd={handleCmd} />;
    }
  };

  const breadcrumb = () => {
    const r = (label, to) => ({ label, route: to });
    const t = (label) => ({ label });
    const map = {
      dashboard:           [r('Workspace', 'dashboard'),       t('Dashboard')],
      confirmations:       [t('Confirmations')],
      'delivery-invoices': [t('Delivery & Invoices')],
      confirmation:        [r('Confirmations', 'confirmations'), t(route.data?.no || 'New')],
      delivery:            [r('Sales', 'delivery-invoices'),   t('Delivery')],
      invoices:            [r('Sales', 'delivery-invoices'),   t('Invoices')],
      payment:             [r('Sales', 'payment'),             t('Cotton Payment')],
      masters:             [r('Metadata', 'masters'),          t('Masters')],
      buyers:              [r('Metadata', 'masters'),          t('Masters')],
      buyer:               [r('Metadata', 'masters'), r('Masters', 'masters'), t(route.data?.short || route.data?.name || 'New buyer')],
      commission:            [r('Commission', 'commission'),       t('Commission Invoices')],
      'sub-broker-ledger':   [r('Commission', 'sub-broker-ledger'), t('Sub-broker Ledger')],
      'comm-receipts':       [r('Commission', 'comm-receipts'),     t('Commission Receipts')],
      'company-settings':  [r('Administration', 'company-settings'), t('Company Settings')],
      'cr-dr-notes':       [r('Sales', 'cr-dr-notes'),         t('CR / DR Notes')],
      'advance-payment':   [r('Sales', 'advance-payment'),     t('Advance Payment')],
      'charity-cheque':    [r('Sales', 'charity-cheque'),      t('Charity Cheque')],
      'allowances':        [r('Sales', 'allowances'),          t('Allowances')],
      'millweight':        [r('Sales', 'millweight'),          t('Millweight')],
      'gst-receipt':       [r('Sales', 'gst-receipt'),         t('GST Cert. Receipt')],
      analytics:           [r('Insights', 'analytics'),        t('Analytics')],
      activity:            [r('Insights', 'activity'),         t('Activity')],
    };
    return map[route.name] || [t('Workspace')];
  };

  const crumbs = breadcrumb();

  const currentAv   = (window.AVATAR_LIST || []).find(a => a.id === tweaks.avatar);
  const userInitials = (tweaks.userName || 'KR').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // ─── Shared dropdown button style helper ────────────────────────────────
  const menuBtn = (extra = {}) => ({
    display:'flex', alignItems:'center', gap:9, width:'100%', padding:'8px 14px',
    background:'none', border:'none', cursor:'pointer', fontSize:12.5,
    color:'var(--text-1)', fontFamily:'inherit', textAlign:'left', ...extra,
  });

  return (
    <div className="app" data-collapsed={String(collapsed)} data-screen-label="NCotton">

      {/* ── Sidebar ── */}
      <aside className="sidebar">

        {/* Brand */}
        <div className="brand" onClick={() => setRoute({ name: 'dashboard' })}>
          <div className="brand-mark">N</div>
          <div className="brand-text">NCotton <small>OS</small></div>
        </div>

        {/* Company switcher */}
        <div style={{ position:'relative' }}>
          <div
            className="workspace"
            style={{ cursor:'pointer' }}
            onClick={() => { setCompanySwitcherOpen(o => !o); setProfileMenuOpen(false); }}
          >
            <div style={{ width:32, height:32, borderRadius:8, background:'var(--accent)', display:'grid', placeItems:'center', color:'#fff', fontWeight:700, fontSize:15, flexShrink:0 }}>
              {currentCompany.name.charAt(0).toUpperCase()}
            </div>
            <div className="ws-text" style={{ flex:1, minWidth:0 }}>
              <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontWeight:500 }}>{currentCompany.name}</div>
              <div>{currentCompany.fy}</div>
            </div>
            <span className="ws-arrows"><Icon.ChevUpDown size={12} /></span>
          </div>

          {companySwitcherOpen && (
            <>
              <div style={{ position:'fixed', inset:0, zIndex:149 }} onClick={() => setCompanySwitcherOpen(false)} />
              <div style={{ position:'absolute', left:'calc(100% + 10px)', top:0, width:250, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, boxShadow:'0 4px 6px rgba(0,0,0,.06), 0 12px 32px rgba(0,0,0,.18)', zIndex:150, overflow:'hidden' }}>

                <div style={{ padding:'8px 13px 6px', fontSize:10.5, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em' }}>
                  Switch workspace
                </div>

                {companies.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setTweak('company', c.id); setCompanySwitcherOpen(false); }}
                    style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'8px 12px', background:'none', border:'none', borderTop:'1px solid var(--border)', cursor:'pointer', fontSize:12.5, color:'var(--text-1)', textAlign:'left', fontFamily:'inherit' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover,rgba(0,0,0,.04))'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <div style={{ width:27, height:27, borderRadius:7, background: c.id === tweaks.company ? 'var(--accent)' : 'var(--surface-2)', display:'grid', placeItems:'center', color: c.id === tweaks.company ? '#fff' : 'var(--text-3)', fontWeight:700, fontSize:13, flexShrink:0 }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight: c.id === tweaks.company ? 600 : 400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</div>
                      <div style={{ fontSize:10.5, color:'var(--text-3)', marginTop:1 }}>{c.fy}</div>
                    </div>
                    {c.id === tweaks.company && <Icon.Check size={13} style={{ color:'var(--accent)', flexShrink:0 }} />}
                  </button>
                ))}

                <div style={{ borderTop:'1px solid var(--border)', padding:'4px 0' }}>
                  <button
                    onClick={() => { setRoute({ name:'company-settings' }); setCompanySwitcherOpen(false); }}
                    style={menuBtn({ color:'var(--text-2)', padding:'7px 13px' })}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover,rgba(0,0,0,.04))'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <Icon.Settings size={13} style={{ color:'var(--text-3)' }} /> Company Settings
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search */}
        <button className="search-trigger" onClick={() => setCmdkOpen(true)}>
          <Icon.Search size={13} />
          <span>Search or jump to…</span>
          <span className="kbd">⌘K</span>
        </button>

        {/* Nav */}
        <nav className="nav">
          {NAV.map(group => (
            <div className="nav-section" key={group.section}>
              <div className="nav-label">{group.section}</div>
              {group.items.map(item => {
                const Ic = Icon[item.icon] || Icon.Tag;
                const active = route.name === item.id
                  || (item.id === 'confirmations'   && route.name === 'confirmation')
                  || (item.id === 'masters'          && (route.name === 'buyer' || route.name === 'buyers'));
                return (
                  <button key={item.id} className={`nav-item ${active ? 'active' : ''}`} onClick={() => setRoute({ name: item.id, data: null })} title={item.label}>
                    <Ic size={16} />
                    <span className="label">{item.label}</span>
                    {item.badge && <span className="badge">{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer — user profile */}
        <div className="sidebar-footer" style={{ position:'relative' }}>

          {/* Profile menu */}
          {profileMenuOpen && (
            <>
              <div style={{ position:'fixed', inset:0, zIndex:149 }} onClick={() => setProfileMenuOpen(false)} />
              <div style={{ position:'absolute', bottom:'calc(100% + 8px)', left:4, right:4, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, boxShadow:'0 -4px 6px rgba(0,0,0,.04), 0 4px 24px rgba(0,0,0,.16)', zIndex:150, overflow:'hidden' }}>

                {/* User info */}
                <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)', display:'flex', gap:10, alignItems:'center' }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', overflow:'hidden', flexShrink:0, border:'2px solid var(--border)' }}>
                    {currentAv
                      ? <img src={currentAv.src} style={{ width:'100%', height:'100%', display:'block' }} alt={currentAv.name} />
                      : <div style={{ width:'100%', height:'100%', background:'var(--accent)', display:'grid', placeItems:'center', color:'#fff', fontWeight:700, fontSize:14 }}>{userInitials}</div>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tweaks.userName || 'Karthik R'}</div>
                    <div style={{ fontSize:11, color:'var(--text-3)' }}>Trading Desk · {currentCompany.short || currentCompany.name.split(' ')[0]}</div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ padding:'4px 0' }}>
                  {[
                    { icon:'Edit',     label:'Edit Profile',  action: () => { setAvatarPickerOpen(true); setProfileMenuOpen(false); } },
                    { icon:'Settings', label:'Preferences',   action: () => { window.postMessage({ type:'__activate_edit_mode' }, '*'); setProfileMenuOpen(false); } },
                  ].map(item => {
                    const Ic = Icon[item.icon] || Icon.Tag;
                    return (
                      <button key={item.label} onClick={item.action}
                        style={menuBtn()}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover,rgba(0,0,0,.04))'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <Ic size={14} style={{ color:'var(--text-3)' }} /> {item.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ borderTop:'1px solid var(--border)', padding:'4px 0' }}>
                  <button
                    style={menuBtn({ color:'var(--negative)' })}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <Icon.LogOut size={14} /> Sign out
                  </button>
                </div>
              </div>
            </>
          )}

          {/* User chip — click to open profile menu */}
          <div
            className="user-chip"
            onClick={() => { setProfileMenuOpen(o => !o); setCompanySwitcherOpen(false); }}
            style={{ cursor:'pointer' }}
          >
            <div className="user-avatar" style={{ overflow:'hidden', padding:0, flexShrink:0 }}>
              {currentAv
                ? <img src={currentAv.src} style={{ width:'100%', height:'100%', borderRadius:'50%', display:'block' }} alt={currentAv.name} />
                : <span>{userInitials}</span>}
            </div>
            <div>
              <div className="user-name">{tweaks.userName || 'Karthik R'}</div>
              <div className="user-role">Trading Desk</div>
            </div>
          </div>

          <button className="icon-btn" onClick={() => setTweak('sidebar', collapsed ? 'expanded' : 'collapsed')} title="Toggle sidebar">
            <Icon.Sidebar size={14} />
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main">
        <header className="topbar">
          <div className="crumbs">
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                <span
                  className={`crumb ${i === crumbs.length - 1 ? 'active' : ''}`}
                  style={c.route ? { cursor:'pointer' } : {}}
                  onClick={c.route ? () => setRoute({ name: c.route, data: null }) : undefined}
                >
                  {c.label}
                </span>
                {i < crumbs.length - 1 && <span className="crumb-sep"><Icon.ChevronRight size={11} /></span>}
              </React.Fragment>
            ))}
          </div>
          <div className="topbar-spacer" />
          <button className="topbar-action" onClick={() => setTweak('theme', tweaks.theme === 'light' ? 'dark' : 'light')}>
            {tweaks.theme === 'light' ? <Icon.Moon size={14} /> : <Icon.Sun size={14} />}
          </button>
          <button className="topbar-action"><Icon.Bell size={14} /></button>
          <button className="topbar-action"><Icon.HelpCircle size={14} /> Help</button>
          <button className="topbar-action" onClick={() => setCmdkOpen(true)}>
            <Icon.Search size={14} /> <span>Search</span> <span className="kbd-hint">⌘K</span>
          </button>
        </header>

        <main className="content">
          <ErrorBoundary key={route.name}>
            {renderScreen()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Avatar Picker modal */}
      {avatarPickerOpen && (
        <window.AvatarPicker
          currentId={tweaks.avatar}
          onSelect={(id) => setTweak('avatar', id)}
          onClose={() => setAvatarPickerOpen(false)}
          currentName={tweaks.userName || ''}
          onNameChange={(n) => setTweak('userName', n)}
        />
      )}

      {/* Cmd+K */}
      <window.CmdK open={cmdkOpen} onClose={() => setCmdkOpen(false)} onCommand={handleCmd} />

      {/* Tweaks */}
      <Tweaks tweaks={tweaks} setTweak={setTweak} />

      {/* Toast */}
      {toast && (
        <div className="toast-wrap">
          <div className="toast"><Icon.Check size={14} /> {toast}</div>
        </div>
      )}
    </div>
  );
};

const ComingSoon = ({ name, onClose }) => (
  <div className="content-inner narrow">
    <div className="page-header">
      <div>
        <h1 className="page-title" style={{ textTransform:'capitalize' }}>{name}</h1>
        <div className="page-sub">This module is part of NCotton — not yet wired into the prototype.</div>
      </div>
    </div>
    <div className="card">
      <div className="card-body" style={{ padding:36, textAlign:'center' }}>
        <Icon.Sparkles size={20} />
        <div style={{ marginTop:10, fontSize:14, fontWeight:500 }}>Available on request</div>
        <div className="muted" style={{ marginTop:4, fontSize:12.5, maxWidth:380, margin:'4px auto 0' }}>
          Ping the design team to prioritise this surface.
        </div>
        <button className="btn btn-primary" style={{ marginTop:18 }} onClick={onClose}><Icon.ArrowRight size={13} /> Back to dashboard</button>
      </div>
    </div>
  </div>
);

const ACCENT_HEX = {
  graphite:'#18181b', indigo:'#4f46e5', emerald:'#047857', amber:'#b45309', rose:'#be123c',
};
const HEX_TO_ACCENT = Object.fromEntries(Object.entries(ACCENT_HEX).map(([k, v]) => [v, k]));

const Tweaks = ({ tweaks, setTweak }) => {
  const { TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakSelect } = window;
  return (
    <TweaksPanel title="NCotton Tweaks">
      <TweakSection label="Theme">
        <TweakRadio label="Mode" value={tweaks.theme} options={['light', 'dark']} onChange={(v) => setTweak('theme', v)} />
      </TweakSection>
      <TweakSection label="Accent">
        <TweakColor label="Color" value={ACCENT_HEX[tweaks.accent]} options={Object.values(ACCENT_HEX)} onChange={(hex) => setTweak('accent', HEX_TO_ACCENT[hex] || 'graphite')} />
      </TweakSection>
      <TweakSection label="Layout">
        <TweakRadio label="Sidebar" value={tweaks.sidebar} options={['expanded', 'collapsed']} onChange={(v) => setTweak('sidebar', v)} />
        <TweakRadio label="Density" value={tweaks.density} options={['comfortable', 'compact']} onChange={(v) => setTweak('density', v)} />
      </TweakSection>
      <TweakSection label="Type">
        <TweakSelect label="Font" value={tweaks.font} options={[
          { value:'inter', label:'Inter' },
          { value:'sf',    label:'SF Pro' },
          { value:'ibm',   label:'IBM Plex Sans' },
        ]} onChange={(v) => setTweak('font', v)} />
      </TweakSection>
    </TweaksPanel>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary><App /></ErrorBoundary>
);
