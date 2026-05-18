// Reusable UI primitives + sparkline

const Sparkline = ({ data, width = 120, height = 32, stroke = 'currentColor', fill = true, dot = true }) => {
  if (!data || !data.length) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => [i * stepX, height - 4 - ((v - min) / range) * (height - 8)]);
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  const last = points[points.length - 1];
  return (
    <svg className="spark" width={width} height={height} style={{ color: stroke }}>
      {fill && <path className="area" d={area} />}
      <path className="line" d={line} />
      {dot && <circle className="pt" cx={last[0]} cy={last[1]} r="2" />}
    </svg>
  );
};

const Sparkbar = ({ data, width = 120, height = 32, color = 'currentColor' }) => {
  const max = Math.max(...data) || 1;
  const gap = 2;
  const bw = (width - gap * (data.length - 1)) / data.length;
  return (
    <svg className="spark" width={width} height={height} style={{ color }}>
      {data.map((v, i) => {
        const h = (v / max) * (height - 4);
        return <rect key={i} x={i * (bw + gap)} y={height - h} width={bw} height={h} fill="currentColor" opacity={i === data.length - 1 ? 1 : 0.55} rx="1" />;
      })}
    </svg>
  );
};

const Field = ({ label, required, optional, hint, children, span }) => (
  <div className={`field ${span === 2 ? 'col-span-2' : ''}`}>
    {label && <label className="field-label">{label} {required && <span className="req">*</span>} {optional && <span className="opt">optional</span>}</label>}
    {children}
    {hint && <div className="field-hint">{hint}</div>}
  </div>
);

const Input = (p) => <input className="input" {...p} />;
const Select = ({ children, ...p }) => <select className="select" {...p}>{children}</select>;
const Textarea = (p) => <textarea className="input textarea" {...p} />;

const Checkbox = ({ checked, onChange, label }) => (
  <label className={`checkbox-row ${checked ? 'checked' : ''}`} onClick={() => onChange && onChange(!checked)}>
    <span className="checkbox"><Icon.CheckSm /></span>
    {label && <span>{label}</span>}
  </label>
);

const Radio = ({ checked, label, onClick }) => (
  <label className="checkbox-row" onClick={onClick} style={{ cursor: 'pointer' }}>
    <span className={`radio ${checked ? 'checked' : ''}`} />
    {label && <span>{label}</span>}
  </label>
);

const Badge = ({ tone = '', dot = true, children }) => (
  <span className={`badge ${tone} ${dot ? 'dot' : ''}`}>{children}</span>
);

const Section = ({ title, desc, children }) => (
  <div className="section">
    <div>
      <h3 className="section-title">{title}</h3>
      {desc && <div className="section-desc">{desc}</div>}
    </div>
    <div className="section-fields">{children}</div>
  </div>
);

// ----- DatePicker -----
const _DP_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const _DP_DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const DatePicker = ({ value, onChange, disabled }) => {
  const [open, setOpen]             = React.useState(false);
  const ref                         = React.useRef(null);
  const parsed                      = value ? new Date(value + 'T00:00:00') : null;
  const [viewYear, setViewYear]     = React.useState(parsed?.getFullYear() || new Date().getFullYear());
  const [viewMonth, setViewMonth]   = React.useState(parsed?.getMonth() ?? new Date().getMonth());

  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const pickDay = (day) => {
    onChange(`${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`);
    setOpen(false);
  };
  const pickToday = () => { const t = new Date(); setViewYear(t.getFullYear()); setViewMonth(t.getMonth()); pickDay(t.getDate()); };

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells       = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const today       = new Date();

  const isSel   = (d) => parsed && d && parsed.getFullYear() === viewYear && parsed.getMonth() === viewMonth && parsed.getDate() === d;
  const isTodayD = (d) => d && today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;

  const label = parsed ? parsed.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : 'Pick a date';

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button type="button" className="input" disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        style={{ display:'flex', alignItems:'center', gap:8, width:'100%', textAlign:'left', cursor: disabled ? 'default' : 'pointer', justifyContent:'space-between', userSelect:'none' }}>
        <span style={{ color: parsed ? 'var(--text-1)' : 'var(--text-3)', fontSize:14 }}>{label}</span>
        <Icon.Calendar size={14} style={{ color:'var(--text-3)', flexShrink:0 }} />
      </button>
      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, zIndex:300, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, boxShadow:'0 6px 24px rgba(0,0,0,.13)', padding:14, width:252 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <button type="button" className="icon-btn" onClick={prevMonth}><Icon.ChevronLeft size={14} /></button>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--text-1)' }}>{_DP_MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" className="icon-btn" onClick={nextMonth}><Icon.ChevronRight size={14} /></button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
            {_DP_DAYS.map(d => <div key={d} style={{ textAlign:'center', fontSize:11, color:'var(--text-3)', fontWeight:600, padding:'2px 0' }}>{d}</div>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
            {cells.map((day, i) => (
              <button key={i} type="button" disabled={!day} onClick={day ? () => pickDay(day) : undefined}
                style={{ width:32, height:32, borderRadius:6, border:'none', background: isSel(day) ? 'var(--accent)' : 'transparent', color: isSel(day) ? 'var(--accent-fg,#fff)' : isTodayD(day) ? 'var(--accent)' : day ? 'var(--text-1)' : 'transparent', fontSize:13, fontWeight: isSel(day) || isTodayD(day) ? 600 : 400, cursor: day ? 'pointer' : 'default', outline: isTodayD(day) && !isSel(day) ? '1.5px solid var(--accent)' : 'none', outlineOffset:'-1px', transition:'background .1s' }}
                onMouseEnter={e => { if (day && !isSel(day)) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { if (day && !isSel(day)) e.currentTarget.style.background = 'transparent'; }}
              >{day || ''}</button>
            ))}
          </div>
          <div style={{ borderTop:'1px solid var(--border)', marginTop:10, paddingTop:10 }}>
            <button type="button" className="btn btn-sm" style={{ width:'100%' }} onClick={pickToday}>Today</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ----- TagInput -----
const _tagPalette = [
  { bg:'rgba(99,102,241,.15)',  color:'#4f46e5' },
  { bg:'rgba(34,197,94,.13)',   color:'#15803d' },
  { bg:'rgba(234,179,8,.15)',   color:'#a16207' },
  { bg:'rgba(239,68,68,.12)',   color:'#dc2626' },
  { bg:'rgba(59,130,246,.12)',  color:'#2563eb' },
  { bg:'rgba(168,85,247,.12)', color:'#9333ea' },
  { bg:'rgba(20,184,166,.13)', color:'#0d9488' },
  { bg:'rgba(249,115,22,.13)', color:'#c2410c' },
];
const tagColor = (tag) => {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) & 0xffff;
  return _tagPalette[h % _tagPalette.length];
};
window.tagColor = tagColor;

const TagInput = ({ value = [], onChange, suggestions = [], disabled = false, placeholder = 'Add a tag…' }) => {
  const [inputVal, setInputVal] = React.useState('');
  const [open, setOpen]         = React.useState(false);
  const inputRef                = React.useRef(null);
  const wrapRef                 = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const q        = inputVal.trim().toLowerCase();
  const filtered = q
    ? suggestions.filter(s => s.toLowerCase().includes(q) && !value.includes(s))
    : suggestions.filter(s => !value.includes(s));

  const addTag = (tag) => {
    const t = tag.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInputVal('');
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const removeTag = (tag) => onChange(value.filter(v => v !== tag));

  const onKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && inputVal.trim()) { e.preventDefault(); addTag(inputVal); }
    else if (e.key === 'Backspace' && !inputVal && value.length) removeTag(value[value.length - 1]);
    else if (e.key === 'Escape') { setInputVal(''); setOpen(false); }
  };

  return (
    <div ref={wrapRef} style={{ position:'relative' }}>
      <div
        style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:4, border:'1px solid var(--border)', borderRadius:6, padding:'5px 8px', background: disabled ? 'var(--surface-2)' : 'var(--bg-2)', minHeight:36, cursor: disabled ? 'default' : 'text' }}
        onClick={() => { if (!disabled) { inputRef.current?.focus(); setOpen(true); } }}
      >
        {value.map(tag => {
          const { bg, color } = tagColor(tag);
          return (
            <span key={tag} style={{ display:'inline-flex', alignItems:'center', gap:3, borderRadius:999, padding:'2px 8px', fontSize:11.5, fontWeight:500, background:bg, color, lineHeight:1.5, flexShrink:0 }}>
              {tag}
              {!disabled && (
                <button onMouseDown={e => { e.preventDefault(); e.stopPropagation(); removeTag(tag); }}
                  style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:'inherit', opacity:.6, lineHeight:1, display:'inline-flex', marginLeft:1 }}>
                  <Icon.X size={10} />
                </button>
              )}
            </span>
          );
        })}
        {!disabled && (
          <input
            ref={inputRef}
            value={inputVal}
            onChange={e => { setInputVal(e.target.value); setOpen(true); }}
            onKeyDown={onKeyDown}
            onFocus={() => setOpen(true)}
            placeholder={value.length === 0 ? placeholder : ''}
            style={{ border:'none', background:'transparent', outline:'none', fontSize:12.5, color:'var(--text-1)', minWidth:100, flex:1, padding:0 }}
          />
        )}
      </div>
      {open && !disabled && filtered.length > 0 && (
        <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, boxShadow:'0 4px 16px rgba(0,0,0,.10)', zIndex:100, overflow:'hidden' }}>
          {filtered.slice(0, 8).map(s => {
            const { bg, color } = tagColor(s);
            return (
              <div key={s} onMouseDown={() => addTag(s)}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 12px', cursor:'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize:11, background:bg, color, borderRadius:999, padding:'1px 7px', fontWeight:600 }}>{s}</span>
              </div>
            );
          })}
          {q && !suggestions.includes(inputVal.trim()) && (
            <div onMouseDown={() => addTag(inputVal)}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 12px', cursor:'pointer', borderTop: filtered.length ? '1px solid var(--border)' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Icon.Plus size={11} style={{ color:'var(--text-3)' }} />
              <span style={{ fontSize:12.5, color:'var(--text-2)' }}>Create tag <strong>"{inputVal.trim()}"</strong></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── ViewMenu — reusable column-visibility toggler ────────────────────────────
// cols: [{ field, label }]   visible: Set<string>   onChange: (Set) => void
const ViewMenu = ({ cols, visible, onChange }) => {
  const [open,  setOpen]  = React.useState(false);
  const [query, setQuery] = React.useState('');
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery(''); } };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const q = query.toLowerCase().trim();
  const shown = q ? cols.filter(c => c.label.toLowerCase().includes(q)) : cols;

  const toggle = (field) => {
    const next = new Set(visible);
    if (next.has(field)) next.delete(field); else next.add(field);
    onChange(next);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="btn" onClick={() => setOpen(o => !o)}>
        <Icon.Eye size={14} /> View
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: 222,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, boxShadow: '0 4px 24px rgba(0,0,0,.14)', zIndex: 300, overflow: 'hidden',
        }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ position: 'relative' }}>
              <Icon.Search size={12} style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search columns…"
                style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 22, paddingRight: 8, paddingTop: 5, paddingBottom: 5, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-2)', color: 'var(--text-1)', fontSize: 12.5, outline: 'none', fontFamily: 'inherit' }} />
            </div>
          </div>
          <div style={{ maxHeight: 290, overflowY: 'auto' }}>
            {shown.map(col => {
              const on = visible.has(col.field);
              return (
                <button key={col.field} onClick={() => toggle(col.field)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: 13, color: on ? 'var(--text-1)' : 'var(--text-3)', fontWeight: on ? 500 : 400 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  {col.label}
                  {on && <Icon.Check size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const fmtINR = (n, opts = {}) => {
  const { compact = false, prefix = '₹' } = opts;
  if (compact) {
    if (n >= 10000000) return `${prefix}${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `${prefix}${(n / 100000).toFixed(2)} L`;
    if (n >= 1000) return `${prefix}${(n / 1000).toFixed(1)}K`;
    return `${prefix}${n}`;
  }
  return `${prefix}${n.toLocaleString('en-IN')}`;
};
const fmtNum = (n) => n.toLocaleString('en-IN');

window.UI = { Sparkline, Sparkbar, Field, Input, Select, Textarea, Checkbox, Radio, Badge, Section, DatePicker, TagInput, fmtINR, fmtNum, ViewMenu };
