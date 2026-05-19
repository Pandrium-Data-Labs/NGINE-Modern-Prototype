// Advanced search with command-filter syntax for all table views

(function () {
  'use strict';

  // ── amount parser ────────────────────────────────────────────────────────────
  // Supports: 1cr=10M, 1L/1l=100K, 1k=1K, plain number
  function _parseAmt(val) {
    const s = String(val).toLowerCase().trim();
    const n = parseFloat(s);
    if (isNaN(n)) return NaN;
    if (s.endsWith('cr')) return n * 10_000_000;
    if (s.endsWith('l'))  return n * 100_000;
    if (s.endsWith('k'))  return n * 1_000;
    return n;
  }

  // ── query tokeniser ──────────────────────────────────────────────────────────
  // Parses "buyer:Welspun status:paid amount:>1cr some free text"
  // into [ {type:'field', key, op, val, raw}, {type:'text', val, raw}, … ]
  function _tokenise(query) {
    const tokens = [];
    const re = /(\w+):(>=|<=|>|<)?(\S+)|(\S+)/g;
    let m;
    while ((m = re.exec(query)) !== null) {
      if (m[1]) {
        tokens.push({ type: 'field', key: m[1].toLowerCase(), op: m[2] || '=', val: m[3], raw: m[0] });
      } else {
        tokens.push({ type: 'text', val: m[4].toLowerCase(), raw: m[4] });
      }
    }
    return tokens;
  }

  // ── single-token matcher ────────────────────────────────────────────────────
  function _match(record, token, fields) {
    if (token.type === 'text') {
      return fields.some(f => {
        if (f.type === 'amount' || f.type === 'date') return false;
        const v = f.get ? f.get(record) : (record[f.key] ?? '');
        return String(v).toLowerCase().includes(token.val);
      });
    }

    const fd = fields.find(f =>
      f.key.toLowerCase() === token.key ||
      f.label.toLowerCase() === token.key ||
      f.label.toLowerCase().replace(/[\s/]/g, '') === token.key
    );
    if (!fd) return true; // unknown field → don't filter out

    const raw = fd.get ? fd.get(record) : (record[fd.key] ?? '');
    const { op, val } = token;

    if (fd.type === 'amount') {
      const numRec = typeof raw === 'number' ? raw : parseFloat(raw) || 0;
      const target = _parseAmt(val);
      if (isNaN(target)) return true;
      if (op === '=')  return Math.abs(numRec - target) < 0.01;
      if (op === '>')  return numRec > target;
      if (op === '>=') return numRec >= target;
      if (op === '<')  return numRec < target;
      if (op === '<=') return numRec <= target;
      return true;
    }

    if (fd.type === 'date') {
      const dRec = raw instanceof Date ? raw : (raw ? new Date(raw) : null);
      if (!dRec || isNaN(dRec)) return true;
      const dTgt = new Date(val);
      if (isNaN(dTgt)) return true;
      if (op === '=')  return dRec.toDateString() === dTgt.toDateString();
      if (op === '>')  return dRec > dTgt;
      if (op === '>=') return dRec >= dTgt;
      if (op === '<')  return dRec < dTgt;
      if (op === '<=') return dRec <= dTgt;
      return true;
    }

    // text / select: op '=' means partial match; others don't apply
    return String(raw).toLowerCase().includes(val.toLowerCase());
  }

  function _applyFilters(data, tokens, fields) {
    if (!tokens.length) return data;
    return data.filter(r => tokens.every(t => _match(r, t, fields)));
  }

  // ── chip label ───────────────────────────────────────────────────────────────
  function _chipLabel(token, fields) {
    if (token.type === 'text') return `"${token.raw}"`;
    const fd = fields.find(f => f.key.toLowerCase() === token.key);
    const label = fd ? fd.label : token.key;
    const opStr = token.op && token.op !== '=' ? ` ${token.op}` : ':';
    return `${label}${opStr} ${token.val}`;
  }

  // ── rebuild raw query after token removal ───────────────────────────────────
  function _removeToken(query, idx) {
    const parts = (query.match(/(\w+:(?:>=|<=|>|<)?\S+|\S+)/g) || []);
    parts.splice(idx, 1);
    return parts.join(' ');
  }

  // ── component ────────────────────────────────────────────────────────────────
  const AdvancedSearch = ({ data, fields, onChange, placeholder }) => {
    const [query, setQuery] = React.useState('');
    const [focused, setFocused] = React.useState(false);
    const inputRef = React.useRef(null);

    const tokens   = React.useMemo(() => _tokenise(query),              [query]);
    const filtered = React.useMemo(() => _applyFilters(data, tokens, fields), [data, tokens, fields]);

    // Notify parent whenever filtered result changes
    const onChangeSt = React.useRef(onChange);
    React.useLayoutEffect(() => { onChangeSt.current = onChange; });
    React.useEffect(() => { onChangeSt.current(filtered); }, [filtered]);

    const clearAll    = () => { setQuery(''); inputRef.current?.focus(); };
    const removeToken = (i) => setQuery(q => _removeToken(q, i));
    const appendField = (key) => {
      setQuery(q => (q.trim() ? q.trim() + ' ' : '') + key + ':');
      inputRef.current?.focus();
    };

    const showHints = focused && !query.trim();
    const hasTokens = tokens.length > 0;
    const isFiltered = !!query.trim();

    const barStyle = {
      display: 'flex', alignItems: 'center', gap: 7,
      border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 6, background: 'var(--bg-2)', padding: '0 10px',
      cursor: 'text', transition: 'border-color .12s', flex: 1, minWidth: 220,
    };

    const hintStyle = {
      position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,.06),0 8px 24px rgba(0,0,0,.12)',
      padding: '10px 12px',
    };

    return (
      <div style={{ position: 'relative', display: 'flex', flex: 1, minWidth: 220 }}>
        <label style={barStyle} onClick={() => inputRef.current?.focus()}>
          <Icon.Search size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 180)}
            placeholder={placeholder || 'Search or type field: for filters…'}
            style={{
              flex: 1, border: 'none', background: 'transparent', padding: '6px 0',
              outline: 'none', fontSize: 13, color: 'var(--text-1)',
              fontFamily: 'inherit', minWidth: 0,
            }}
          />
          {isFiltered && (
            <span style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {filtered.length}/{data.length}
            </span>
          )}
          {query && (
            <button
              onMouseDown={e => { e.preventDefault(); clearAll(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-3)', padding: 2, flexShrink: 0 }}
            >
              <Icon.X size={12} />
            </button>
          )}
        </label>

        {/* Floating panel: field hints OR active token chips */}
        {(showHints || (hasTokens && focused)) && (
          <div style={hintStyle}>
            {showHints ? (
              <>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                  Filter by field
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {fields.map(f => (
                    <button
                      key={f.key}
                      onMouseDown={e => { e.preventDefault(); appendField(f.key); }}
                      style={{
                        padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 500,
                        border: '1px solid var(--border)', background: 'var(--surface-2)',
                        color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all .1s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
                    >
                      {f.label}:
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-3)' }}>
                  Tip: <code style={{ fontFamily: 'monospace', background: 'var(--surface-2)', padding: '1px 4px', borderRadius: 3 }}>buyer:Welspun</code>
                  {'  '}
                  <code style={{ fontFamily: 'monospace', background: 'var(--surface-2)', padding: '1px 4px', borderRadius: 3 }}>amount:&gt;1cr</code>
                  {'  '}
                  <code style={{ fontFamily: 'monospace', background: 'var(--surface-2)', padding: '1px 4px', borderRadius: 3 }}>status:paid</code>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                  Active filters
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
                  {tokens.map((t, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 8px 3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 500,
                      background: 'color-mix(in srgb,var(--accent) 10%,transparent)',
                      color: 'var(--accent)',
                      border: '1px solid color-mix(in srgb,var(--accent) 25%,transparent)',
                    }}>
                      {_chipLabel(t, fields)}
                      <button
                        onMouseDown={e => { e.preventDefault(); removeToken(i); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, color: 'inherit', opacity: .65, lineHeight: 1 }}
                      >
                        <Icon.X size={10} />
                      </button>
                    </span>
                  ))}
                  <button
                    onMouseDown={e => { e.preventDefault(); clearAll(); }}
                    style={{ fontSize: 11, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', textDecoration: 'underline', fontFamily: 'inherit' }}
                  >
                    Clear all
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  window.AdvancedSearch = AdvancedSearch;
})();
