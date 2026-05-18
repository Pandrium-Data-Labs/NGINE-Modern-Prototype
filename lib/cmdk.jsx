// Cmd+K palette — fully working (search, fuzzy, navigation)

const COMMANDS = [
  // navigation
  { id: 'nav.dashboard', label: 'Go to Dashboard', section: 'Navigation', icon: 'Home', shortcut: 'G D', action: 'nav:dashboard' },
  { id: 'nav.confirmations', label: 'Go to Sale Confirmations', section: 'Navigation', icon: 'Receipt', shortcut: 'G C', action: 'nav:confirmations' },
  { id: 'nav.delivery', label: 'Go to Delivery / Mill Passing', section: 'Navigation', icon: 'Truck', shortcut: 'G L', action: 'nav:delivery' },
  { id: 'nav.invoices', label: 'Go to Invoices', section: 'Navigation', icon: 'FileText', shortcut: 'G I', action: 'nav:invoices' },
  { id: 'nav.payment', label: 'Go to Cotton Payment', section: 'Navigation', icon: 'Wallet', shortcut: 'G P', action: 'nav:payment' },
  { id: 'nav.buyers', label: 'Go to Buyers', section: 'Navigation', icon: 'Users', shortcut: 'G B', action: 'nav:buyers' },
  { id: 'nav.commission', label: 'Go to Commission', section: 'Navigation', icon: 'Coins', action: 'nav:commission' },
  // create
  { id: 'new.confirmation', label: 'New Sale Confirmation', section: 'Create', icon: 'Plus', shortcut: 'C C', action: 'new:confirmation' },
  { id: 'new.delivery', label: 'New Delivery (Mill Passing)', section: 'Create', icon: 'Plus', action: 'new:delivery' },
  { id: 'new.invoice', label: 'New Seller Invoice', section: 'Create', icon: 'Plus', action: 'new:invoice' },
  { id: 'new.payment', label: 'New Cotton Payment', section: 'Create', icon: 'Plus', action: 'new:payment' },
  { id: 'new.buyer', label: 'New Buyer', section: 'Create', icon: 'Plus', shortcut: 'C B', action: 'new:buyer' },
  { id: 'new.seller', label: 'New Seller', section: 'Create', icon: 'Plus', action: 'new:seller' },
  { id: 'new.variety', label: 'New Cotton Variety', section: 'Create', icon: 'Plus', action: 'new:variety' },
  { id: 'new.station', label: 'New Station', section: 'Create', icon: 'Plus', action: 'new:station' },
  { id: 'new.crdr', label: 'New CR/DR Note', section: 'Create', icon: 'Edit', action: 'new:crdr' },
  // reports
  { id: 'rep.ginning', label: 'Run Ginning Report', section: 'Reports', icon: 'ChartLine', action: 'rep:ginning' },
  { id: 'rep.outstanding', label: 'Run Outstanding Report', section: 'Reports', icon: 'ChartLine', action: 'rep:outstanding' },
  { id: 'rep.commission', label: 'Run Commission Statement', section: 'Reports', icon: 'ChartLine', action: 'rep:commission' },
  // settings
  { id: 'set.theme', label: 'Toggle Theme (Light / Dark)', section: 'Settings', icon: 'Sun', action: 'set:theme' },
  { id: 'set.tweaks', label: 'Open Tweaks Panel', section: 'Settings', icon: 'Settings', action: 'set:tweaks' },
];

// Recent records
const RECENT = window.NCData ? [
  { id: 'r1', label: 'SC-26-0142 · Arvind Mills · 200/220 bales', section: 'Recent', icon: 'Receipt', action: 'open:SC-26-0142' },
  { id: 'r2', label: 'INV-26-0892 · Welspun India · ₹1.97 Cr', section: 'Recent', icon: 'FileText', action: 'open:INV-26-0892' },
  { id: 'r3', label: 'B-1042 · Arvind Mills Ltd.', section: 'Recent', icon: 'Building', action: 'open:B-1042' },
] : [];

const fuzzy = (q, str) => {
  if (!q) return 1;
  q = q.toLowerCase(); str = str.toLowerCase();
  if (str.includes(q)) return 10 - (str.indexOf(q) / 100);
  let qi = 0, score = 0, last = -2;
  for (let i = 0; i < str.length && qi < q.length; i++) {
    if (str[i] === q[qi]) { score += i - last === 1 ? 2 : 1; last = i; qi++; }
  }
  return qi === q.length ? score / 5 : 0;
};

const CmdK = ({ open, onClose, onCommand }) => {
  const [q, setQ] = React.useState('');
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef(null);
  const listRef = React.useRef(null);

  React.useEffect(() => {
    if (open) { setQ(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 30); }
  }, [open]);

  const all = React.useMemo(() => [...RECENT, ...COMMANDS], []);
  const filtered = React.useMemo(() => {
    if (!q.trim()) return all;
    return all.map(c => ({ c, s: fuzzy(q, c.label) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).map(x => x.c);
  }, [q, all]);

  const groups = React.useMemo(() => {
    const out = {};
    filtered.forEach(c => { (out[c.section] ||= []).push(c); });
    return out;
  }, [filtered]);

  const flat = filtered;

  React.useEffect(() => { if (active >= flat.length) setActive(0); }, [flat.length]);

  const onKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(flat.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (flat[active]) { onCommand(flat[active]); onClose(); } }
  };

  React.useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${active}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;
  let idx = -1;

  return (
    <div className="cmdk-overlay" onClick={onClose}>
      <div className="cmdk" onClick={(e) => e.stopPropagation()}>
        <div className="cmdk-input-row">
          <Icon.Search size={18} />
          <input
            ref={inputRef}
            className="cmdk-input"
            placeholder="Type a command or search…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            onKeyDown={onKey}
          />
          <span className="kbd-hint">esc</span>
        </div>
        <div className="cmdk-list" ref={listRef}>
          {Object.keys(groups).length === 0 && (
            <div className="cmdk-empty">No results for "{q}"</div>
          )}
          {Object.entries(groups).map(([section, items]) => (
            <div key={section}>
              <div className="cmdk-section-label">{section}</div>
              {items.map(c => {
                idx++;
                const my = idx;
                const Ic = Icon[c.icon] || Icon.Search;
                return (
                  <div
                    key={c.id}
                    data-idx={my}
                    className={`cmdk-item ${my === active ? 'active' : ''}`}
                    onMouseEnter={() => setActive(my)}
                    onClick={() => { onCommand(c); onClose(); }}
                  >
                    <Ic size={15} />
                    <span>{c.label}</span>
                    <span className="meta">
                      {c.shortcut && c.shortcut.split(' ').map((k, i) => <span key={i} className="kbd">{k}</span>)}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="cmdk-footer">
          <span><span className="kbd">↑↓</span> Navigate</span>
          <span><span className="kbd">↵</span> Select</span>
          <span><span className="kbd">esc</span> Close</span>
          <span style={{ marginLeft: 'auto' }}>NCotton · Cotton Trading OS</span>
        </div>
      </div>
    </div>
  );
};

window.CmdK = CmdK;
