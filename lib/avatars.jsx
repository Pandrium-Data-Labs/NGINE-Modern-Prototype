// Avatar illustrations + picker

const _enc = (svg) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;

const _human = ({ bg, body, skin, hair, hairPath, extras = '' }) => _enc(`
<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="20" fill="${bg}"/>
  <ellipse cx="20" cy="33" rx="13" ry="9" fill="${body}"/>
  <circle cx="20" cy="17" r="10" fill="${skin}"/>
  <path d="${hairPath}" fill="${hair}"/>
  <circle cx="16.5" cy="17" r="1.5" fill="#1a0a00"/>
  <circle cx="23.5" cy="17" r="1.5" fill="#1a0a00"/>
  <circle cx="16.9" cy="16.5" r="0.5" fill="white"/>
  <circle cx="23.9" cy="16.5" r="0.5" fill="white"/>
  <path d="M17 20.8 Q20 22.5 23 20.8" stroke="#b06040" stroke-width="1.1" fill="none" stroke-linecap="round"/>
  ${extras}
</svg>`);

// Short hair cap
const _capShort = 'M10 17 Q10 7.5 20 6.5 Q30 7.5 30 17 Q26 13.5 20 14 Q14 13.5 10 17Z';
// Short thin hair
const _capThin  = 'M11 16 Q11 9 20 8 Q29 9 29 16 Q26 14 20 14.5 Q14 14 11 16Z';
// Long hair (cap + side strands)
const _capLong  = 'M10 17 Q10 6.5 20 5.5 Q30 6.5 30 17 Q26 13 20 13.5 Q14 13 10 17Z';
const _longL    = 'M10 17 L7.5 28 Q9 32 11.5 29 L13 14Z';
const _longR    = 'M30 17 L32.5 28 Q31 32 28.5 29 L27 14Z';
// Curly bumps
const _curly    = 'M10 17 Q9 9 13 7 Q11 4 16 5 Q14 8 17 9 Q18.5 5.5 20 5 Q21.5 5.5 23 9 Q26 8 24 5 Q29 4 27 7 Q31 9 30 17 Q26 13 20 13.5 Q14 13 10 17Z';
// Bun / updo
const _bun      = 'M10 17 Q10 8 20 7 Q30 8 30 17 Q26 14 20 14 Q14 14 10 17Z M17 7 Q20 2 23 7 Q20 5.5 17 7Z';

const AVATAR_LIST = [
  // 1 — Dark-hair woman, blue
  {
    id: 'av01', name: 'Priya',
    src: _human({ bg:'#dbeafe', body:'#3b82f6', skin:'#fcd7aa', hair:'#1a0800',
      hairPath: _capLong + ' ' + _longL + ' ' + _longR }),
  },
  // 2 — Brown-hair man, green
  {
    id: 'av02', name: 'Arjun',
    src: _human({ bg:'#dcfce7', body:'#16a34a', skin:'#fcd7aa', hair:'#7c3a0a',
      hairPath: _capThin }),
  },
  // 3 — Blonde woman, purple
  {
    id: 'av03', name: 'Meera',
    src: _human({ bg:'#ede9fe', body:'#7c3aed', skin:'#ffe4c4', hair:'#d4a017',
      hairPath: _capLong + ' ' + _longL + ' ' + _longR }),
  },
  // 4 — Black-hair man, orange
  {
    id: 'av04', name: 'Rahul',
    src: _human({ bg:'#fff7ed', body:'#ea580c', skin:'#c68642', hair:'#0a0500',
      hairPath: _capShort }),
  },
  // 5 — Red-hair woman, teal
  {
    id: 'av05', name: 'Kavya',
    src: _human({ bg:'#ccfbf1', body:'#0d9488', skin:'#ffe4c4', hair:'#9b1c1c',
      hairPath: _capLong + ' ' + _longL + ' ' + _longR }),
  },
  // 6 — Grey-hair man, slate
  {
    id: 'av06', name: 'Kumar',
    src: _human({ bg:'#f1f5f9', body:'#475569', skin:'#fcd7aa', hair:'#94a3b8',
      hairPath: _capThin }),
  },
  // 7 — Curly hair, medium skin, amber
  {
    id: 'av07', name: 'Divya',
    src: _human({ bg:'#fef3c7', body:'#d97706', skin:'#c87941', hair:'#1a0800',
      hairPath: _curly }),
  },
  // 8 — Short dark, dark skin, coral
  {
    id: 'av08', name: 'Kiran',
    src: _human({ bg:'#fce7f3', body:'#db2777', skin:'#6b3520', hair:'#0a0500',
      hairPath: _capThin }),
  },
  // 9 — Bun / updo, indigo
  {
    id: 'av09', name: 'Ananya',
    src: _human({ bg:'#e0e7ff', body:'#4f46e5', skin:'#fcd7aa', hair:'#1a0800',
      hairPath: _bun }),
  },
  // 10 — Robot
  {
    id: 'av10', name: 'Robot',
    src: _enc(`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="20" fill="#0f172a"/>
  <rect x="10" y="21" width="20" height="13" rx="4" fill="#1e3a5f"/>
  <rect x="13" y="10" width="14" height="13" rx="3" fill="#1e3a5f"/>
  <line x1="20" y1="7" x2="20" y2="10" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"/>
  <circle cx="20" cy="6" r="1.8" fill="#60a5fa"/>
  <rect x="15" y="13" width="4" height="3.5" rx="1" fill="#38bdf8"/>
  <rect x="21" y="13" width="4" height="3.5" rx="1" fill="#38bdf8"/>
  <rect x="14" y="18.5" width="12" height="2" rx="1" fill="#0f172a"/>
  <circle cx="16" cy="27" r="3" fill="#38bdf8" opacity=".55"/>
  <circle cx="24" cy="27" r="3" fill="#38bdf8" opacity=".55"/>
  <rect x="8" y="22" width="2.5" height="7" rx="1.2" fill="#1e3a5f"/>
  <rect x="29.5" y="22" width="2.5" height="7" rx="1.2" fill="#1e3a5f"/>
</svg>`),
  },
  // 11 — Cat
  {
    id: 'av11', name: 'Cat',
    src: _enc(`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="20" fill="#fef9c3"/>
  <ellipse cx="20" cy="33" rx="12" ry="8" fill="#fb923c"/>
  <circle cx="20" cy="19" r="11" fill="#fdba74"/>
  <polygon points="10,14 7,4 16,12" fill="#ea580c"/>
  <polygon points="30,14 33,4 24,12" fill="#ea580c"/>
  <ellipse cx="16" cy="19" rx="2.5" ry="3.2" fill="#86efac"/>
  <ellipse cx="24" cy="19" rx="2.5" ry="3.2" fill="#86efac"/>
  <ellipse cx="16" cy="19.5" rx="1" ry="2.2" fill="#1a0a00"/>
  <ellipse cx="24" cy="19.5" rx="1" ry="2.2" fill="#1a0a00"/>
  <ellipse cx="20" cy="22.5" rx="1.8" ry="1.2" fill="#fda4af"/>
  <line x1="20" y1="22.5" x2="13" y2="21.5" stroke="#1a0a00" stroke-width="0.7"/>
  <line x1="20" y1="22.5" x2="27" y2="21.5" stroke="#1a0a00" stroke-width="0.7"/>
  <line x1="20" y1="22.5" x2="12" y2="23.5" stroke="#1a0a00" stroke-width="0.7"/>
  <line x1="20" y1="22.5" x2="28" y2="23.5" stroke="#1a0a00" stroke-width="0.7"/>
  <path d="M17.5 25 Q20 26.5 22.5 25" stroke="#c07050" stroke-width="1" fill="none" stroke-linecap="round"/>
</svg>`),
  },
  // 12 — Bear
  {
    id: 'av12', name: 'Bear',
    src: _enc(`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="20" fill="#fef2f2"/>
  <ellipse cx="20" cy="33" rx="12" ry="8" fill="#92400e"/>
  <circle cx="11" cy="13" r="5.5" fill="#78350f"/>
  <circle cx="29" cy="13" r="5.5" fill="#78350f"/>
  <circle cx="20" cy="20" r="12" fill="#92400e"/>
  <ellipse cx="11" cy="13" r="3" fill="#a16207"/>
  <ellipse cx="29" cy="13" r="3" fill="#a16207"/>
  <ellipse cx="20" cy="23" rx="6" ry="5" fill="#b45309"/>
  <circle cx="16" cy="19" r="2.2" fill="#1a0a00"/>
  <circle cx="24" cy="19" r="2.2" fill="#1a0a00"/>
  <circle cx="16.7" cy="18.3" r="0.7" fill="white"/>
  <circle cx="24.7" cy="18.3" r="0.7" fill="white"/>
  <ellipse cx="20" cy="23.5" rx="2.2" ry="1.5" fill="#1a0a00"/>
  <path d="M17 26.5 Q20 28 23 26.5" stroke="#1a0a00" stroke-width="1.1" fill="none" stroke-linecap="round"/>
</svg>`),
  },
];

// ----- Avatar Picker modal -----
const AvatarPicker = ({ currentId, onSelect, onClose, currentName = '', onNameChange }) => (
  <div
    style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
    onClick={onClose}
  >
    <div
      style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:'22px 28px 22px', width:360, boxShadow:'0 20px 60px rgba(0,0,0,.22)' }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ fontWeight:700, fontSize:15, color:'var(--text-1)', marginBottom:4 }}>Profile</div>
      <div style={{ fontSize:12.5, color:'var(--text-3)', marginBottom:18 }}>Set your name and choose an avatar</div>

      <div style={{ marginBottom:20 }}>
        <label style={{ display:'block', fontSize:11.5, fontWeight:600, color:'var(--text-2)', marginBottom:6 }}>Your name</label>
        <input
          type="text"
          value={currentName}
          onChange={e => onNameChange && onNameChange(e.target.value)}
          placeholder="Enter your name…"
          style={{ width:'100%', boxSizing:'border-box', padding:'8px 11px', border:'1px solid var(--border)', borderRadius:8, fontSize:13.5, color:'var(--text-1)', background:'var(--surface)', outline:'none', fontFamily:'inherit' }}
          onClick={e => e.stopPropagation()}
        />
      </div>

      <label style={{ display:'block', fontSize:11.5, fontWeight:600, color:'var(--text-2)', marginBottom:10 }}>Avatar</label>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {AVATAR_LIST.map(av => {
          const selected = currentId === av.id;
          return (
            <button
              key={av.id}
              title={av.name}
              onClick={() => onSelect(av.id)}
              style={{ padding:0, background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center' }}
            >
              <span style={{
                display:'block', borderRadius:'50%', padding:3,
                border: selected ? '2.5px solid var(--accent)' : '2.5px solid transparent',
                boxShadow: selected ? '0 0 0 1px var(--accent)' : 'none',
                transition:'box-shadow .15s, border-color .15s, transform .12s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img src={av.src} style={{ width:52, height:52, borderRadius:'50%', display:'block' }} alt={av.name} />
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end', marginTop:22 }}>
        <button className="btn btn-sm" onClick={onClose}>Done</button>
      </div>
    </div>
  </div>
);

window.AVATAR_LIST   = AVATAR_LIST;
window.AvatarPicker  = AvatarPicker;
