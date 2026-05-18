// Buyer master file — sub-tab heavy form

const { Field, Input, Select, Textarea, Checkbox, Radio, Badge, Section, Sparkline, fmtINR, fmtNum } = window.UI;
const { BUYERS, STATIONS, STATES, fmtDate } = window.NCData;
const { useTableControls, SortableHeader, FilterToolbar } = window.TableFilters;

const BUYER_COLS = [
  { field:'id',          label:'ID',          type:'text'   },
  { field:'name',        label:'Name',        type:'text'   },
  { field:'station',     label:'Station',     type:'text'   },
  { field:'state',       label:'State',       type:'text'   },
  { field:'gstin',       label:'GSTIN',       type:'text'   },
  { field:'outstanding', label:'Outstanding', type:'number' },
  { field:'conf',        label:'Confs',       type:'number' },
  { field:'status',      label:'Status',      type:'select', options:['active','deferred'] },
];

const Buyer = ({ onClose, onCmd, prefill }) => {
  const buyer = prefill || BUYERS[0];
  const [tab, setTab] = React.useState('general');
  const [contacts, setContacts] = React.useState([
    { name: 'Rajesh Mehta', desig: 'GM Procurement', mobile: '+91 98250 12345', email: 'rajesh.mehta@arvind.com' },
    { name: 'Priya Shah', desig: 'AGM Quality', mobile: '+91 98253 88102', email: 'priya.shah@arvind.com' },
  ]);
  const [wishes, setWishes] = React.useState([
    { name: 'Rajesh Mehta', rel: 'Self', date: '1976-04-22', birthday: true, anniv: false },
  ]);

  const TABS = [
    { id: 'general', label: 'General' },
    { id: 'contacts', label: 'Contacts & bank' },
    { id: 'wishes', label: 'Wishes' },
    { id: 'word', label: 'Word format' },
    { id: 'footer', label: 'Confirmation footer' },
    { id: 'kyc', label: 'KYC' },
  ];

  return (
    <div className="content-inner">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <button className="btn btn-sm btn-ghost" onClick={onClose}><Icon.ChevronLeft size={14} /> Buyers</button>
            <Badge tone="success">Active</Badge>
            <span className="cell-mono muted" style={{ fontSize: 11 }}>{buyer.id}</span>
          </div>
          <h1 className="page-title">{buyer.name}</h1>
          <div className="page-sub">{buyer.station} · {buyer.state} · GSTIN <span className="cell-mono">{buyer.gstin}</span></div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon.Mail size={14} /> Email</button>
          <button className="btn"><Icon.FileText size={14} /> Statement</button>
          <button className="btn btn-primary"><Icon.Save size={14} /> Save <span className="kbd-hint">F2</span></button>
        </div>
      </div>

      {/* Mini stats strip */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 }}>
        <div className="kpi" style={{ minHeight: 96 }}>
          <div className="kpi-label">Outstanding</div>
          <div className="kpi-value">{fmtINR(buyer.outstanding, { compact: true })}</div>
          <div className="kpi-meta"><span className="muted">Across {buyer.conf} confirmations</span></div>
        </div>
        <div className="kpi" style={{ minHeight: 96 }}>
          <div className="kpi-label">YTD volume</div>
          <div className="kpi-value">{fmtNum(8420)} <span className="muted" style={{ fontSize: 12, fontWeight: 400 }}>bales</span></div>
          <div className="kpi-meta"><span className="kpi-delta up">↑ 18%</span><span className="muted">vs last year</span></div>
        </div>
        <div className="kpi" style={{ minHeight: 96 }}>
          <div className="kpi-label">Avg DSO</div>
          <div className="kpi-value">19 <span className="muted" style={{ fontSize: 12, fontWeight: 400 }}>days</span></div>
          <div className="kpi-meta"><span className="muted">Better than peers</span></div>
        </div>
        <div className="kpi" style={{ minHeight: 96 }}>
          <div className="kpi-label">Comm. realised (FY)</div>
          <div className="kpi-value">{fmtINR(2840000, { compact: true })}</div>
          <div className="kpi-meta"><span className="muted">@ {buyer.commPct}% rate</span></div>
        </div>
      </div>

      <div className="subnav">
        {TABS.map(t => (
          <button key={t.id} className={`subnav-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="card">
          <div className="card-body" style={{ padding: '8px 28px 16px' }}>
            <Section title="Identity" desc="Name on contracts, addresses, registered state.">
              <div className="form-grid">
                <Field label="Legal name" required><Input defaultValue={buyer.name} /></Field>
                <Field label="Print name" required hint="On printed confirmations"><Input defaultValue={buyer.name} /></Field>
                <Field label="Short name"><Input defaultValue={buyer.short} /></Field>
                <Field label="Group"><Input defaultValue="Lalbhai Group" /></Field>
                <Field label="Station"><Select defaultValue={buyer.station}>{STATIONS.map(s => <option key={s}>{s}</option>)}</Select></Field>
                <Field label="State" required><Select defaultValue={buyer.state}>{STATES.map(s => <option key={s}>{s}</option>)}</Select></Field>
                <Field label="Office address" span={2}><Textarea rows="2" defaultValue="Naroda Road, Ahmedabad — 382 330, Gujarat" /></Field>
                <Field label="Delivery address" span={2}><Textarea rows="2" defaultValue="Same as office" /></Field>
              </div>
            </Section>

            <Section title="Reach" desc="Primary contact channels for the buyer.">
              <div className="form-grid">
                <Field label="Phone"><Input defaultValue={buyer.phone} /></Field>
                <Field label="Mobile"><Input defaultValue={buyer.mobile} /></Field>
                <Field label="Fax"><Input defaultValue="+91 79 2680 1599" /></Field>
                <Field label="Email"><Input defaultValue={buyer.email} type="email" /></Field>
                <Field label="Website" span={2}><Input defaultValue="www.arvind.com" /></Field>
              </div>
            </Section>

            <Section title="Tax & legal" desc="Identifiers used on invoices and statutory filings.">
              <div className="form-grid">
                <Field label="GSTIN"><Input defaultValue={buyer.gstin} className="cell-mono" /></Field>
                <Field label="PAN"><Input defaultValue={buyer.pan} className="cell-mono" /></Field>
                <Field label="CST No. & date"><Input placeholder="CST/AHM/2018/4421 · 12 Apr 2018" /></Field>
                <Field label="Insurance no."><Input defaultValue="ICICI-2024-COT-8841" /></Field>
                <Field label="Note" span={2}><Textarea rows="2" placeholder="Any internal-only notes about this buyer." /></Field>
              </div>
            </Section>

            <Section title="Commission terms" desc="Default rates applied to new confirmations.">
              <div className="form-grid">
                <Field label="Commission %"><div className="input-group"><Input defaultValue={buyer.commPct} className="tnum" /><span className="input-prefix" style={{ borderLeft: 'none', borderRight: '1px solid var(--border-strong)', borderRadius: '0 6px 6px 0' }}>%</span></div></Field>
                <Field label="Bale commission"><div className="input-group"><span className="input-prefix">₹</span><Input defaultValue={buyer.baleComm} className="tnum" /></div></Field>
                <Field label="Charity participation" span={2}><Checkbox checked label="Buyer participates in charity scheme · 0.10% deduction at invoice" onChange={() => {}} /></Field>
                <Field label="Status">
                  <div style={{ display: 'flex', gap: 16, paddingTop: 6 }}>
                    <Radio checked label="Active" />
                    <Radio label="Deferred" />
                  </div>
                </Field>
                <Field label="Company">
                  <Select><option>Aravind Cotton Co.</option><option>Aravind Exports Pvt Ltd</option></Select>
                </Field>
              </div>
            </Section>
          </div>
        </div>
      )}

      {tab === 'contacts' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Contacts</div>
              <button className="btn btn-sm btn-ghost"><Icon.Plus size={12} /> Add</button>
            </div>
            <div className="card-body">
              {contacts.map((c, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: '1px dashed var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="strong">{c.name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{c.desig}</div>
                    </div>
                    <button className="icon-btn"><Icon.More size={14} /></button>
                  </div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 12 }}>
                    <span className="muted"><Icon.Phone size={12} /> {c.mobile}</span>
                    <span className="muted"><Icon.Mail size={12} /> {c.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Bank details</div>
              <button className="btn btn-sm btn-ghost"><Icon.Plus size={12} /> Add</button>
            </div>
            <div className="card-body" style={{ padding: '8px 18px 18px' }}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <Field label="Bank name"><Input defaultValue="HDFC Bank" /></Field>
                <Field label="Branch"><Input defaultValue="Naroda Industrial Estate" /></Field>
                <Field label="Account no."><Input defaultValue="50100412889722" className="cell-mono" /></Field>
                <Field label="IFSC code"><Input defaultValue="HDFC0001442" className="cell-mono" /></Field>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'wishes' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Greetings & relationship dates</div>
            <button className="btn btn-sm btn-ghost"><Icon.Plus size={12} /> Add wish</button>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Name</th><th>Relationship</th><th>Date</th><th>Birthday</th><th>Wedding day</th><th></th>
              </tr>
            </thead>
            <tbody>
              {wishes.map((w, i) => (
                <tr key={i}>
                  <td className="cell-strong">{w.name}</td>
                  <td>{w.rel}</td>
                  <td className="muted">{fmtDate(new Date(w.date))}</td>
                  <td><Checkbox checked={w.birthday} onChange={() => {}} /></td>
                  <td><Checkbox checked={w.anniv} onChange={() => {}} /></td>
                  <td><button className="icon-btn"><Icon.More size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'word' && (
        <div className="card">
          <div className="card-body">
            <Field label="Word format template" hint="Used in printed letters and email salutation. Use {name}, {company}, {variety}.">
              <Textarea rows="6" defaultValue={`Dear {name},\n\nWe confirm our trade for {bales} bales of {variety} cotton at ₹{candy_rate} per candy. The lot will be despatched ex-{station} as per standard NCotton terms.\n\nWith regards,\n{company}`} />
            </Field>
            <div style={{ marginTop: 16 }}>
              <Field label="Email / SMS short text"><Textarea rows="3" defaultValue="NCotton: Conf {conf_no} confirmed for {bales} bales {variety} @ ₹{candy_rate}/candy. Delivery from {station}." /></Field>
            </div>
          </div>
        </div>
      )}

      {tab === 'footer' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Confirmation footer</div>
            <button className="btn btn-sm">Load default</button>
          </div>
          <div className="card-body">
            <Textarea rows="8" defaultValue={`1. All sales are subject to NCotton's standard contract terms (Rev. 2024).\n2. Payment to be made strictly per agreed terms — Net 30 from date of invoice.\n3. Quality disputes to be raised within 7 days of mill receipt.\n4. Subject to ${'{station}'} jurisdiction only.\n5. Insurance to be borne by buyer unless explicitly noted.`} />
          </div>
        </div>
      )}

      {tab === 'kyc' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">KYC documents</div>
              <div className="card-sub">PAN, GSTIN certificate, signed agreement, address proof</div>
            </div>
            <button className="btn btn-sm"><Icon.Upload size={12} /> Upload</button>
          </div>
          <div className="card-body" style={{ padding: 18 }}>
            {[
              { name: 'PAN_AABCA1234F.pdf', size: '244 KB', date: '12 Mar 2024' },
              { name: 'GST_24AABCA1234F1Z5.pdf', size: '512 KB', date: '12 Mar 2024' },
              { name: 'Signed_Agreement_2024.pdf', size: '1.2 MB', date: '02 Apr 2024' },
              { name: 'Address_Proof_Naroda.pdf', size: '380 KB', date: '02 Apr 2024' },
            ].map(f => (
              <div key={f.name} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px dashed var(--border)' }}>
                <Icon.File size={18} />
                <div>
                  <div className="strong" style={{ fontSize: 12.5 }}>{f.name}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{f.size} · uploaded {f.date}</div>
                </div>
                <button className="icon-btn"><Icon.Eye size={14} /></button>
                <button className="icon-btn"><Icon.More size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Buyer list ----
const BuyersList = ({ onOpen, onCmd }) => {
  const ctrl = useTableControls(BUYER_COLS);
  const [exportMode, setExportMode] = React.useState(false);
  const [exportSel,  setExportSel]  = React.useState([]);
  const [fmtOpen,    setFmtOpen]    = React.useState(false);

  const filtered  = ctrl.sortData(ctrl.filterData(BUYERS));
  const allExpSel = filtered.length > 0 && filtered.every(b => exportSel.includes(b.id));

  const _dl = (content, filename, mime) => {
    const blob = new Blob(['﻿', content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const doExport = (fmt) => {
    const cols = [
      { h:'ID',          v: b => b.id },
      { h:'Name',        v: b => b.name },
      { h:'Station',     v: b => b.station },
      { h:'State',       v: b => b.state },
      { h:'GSTIN',       v: b => b.gstin },
      { h:'Outstanding', v: b => b.outstanding },
      { h:'Confs',       v: b => b.conf },
      { h:'Status',      v: b => b.status },
    ];
    const rows = filtered.filter(b => exportSel.includes(b.id));
    const esc  = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    if (fmt === 'csv') {
      _dl([cols.map(c => esc(c.h)).join(','), ...rows.map(b => cols.map(c => esc(c.v(b))).join(','))].join('\r\n'), 'buyers.csv', 'text/csv');
    } else if (fmt === 'excel') {
      const th = `<tr>${cols.map(c => `<th>${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(b => `<tr>${cols.map(c => `<td>${c.v(b)}</td>`).join('')}</tr>`).join('');
      _dl(`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"/></head><body><table>${th}${tb}</table></body></html>`, 'buyers.xls', 'application/vnd.ms-excel');
    } else if (fmt === 'word') {
      const th = `<tr>${cols.map(c => `<th>${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(b => `<tr>${cols.map(c => `<td>${c.v(b)}</td>`).join('')}</tr>`).join('');
      _dl(`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"/></head><body><h2>Buyers</h2><table border="1">${th}${tb}</table></body></html>`, 'buyers.doc', 'application/msword');
    } else if (fmt === 'pdf') {
      const th = `<tr>${cols.map(c => `<th style="padding:8px;border:1px solid #ddd;background:#f5f5f5;text-align:left">${c.h}</th>`).join('')}</tr>`;
      const tb = rows.map(b => `<tr>${cols.map(c => `<td style="padding:8px;border:1px solid #ddd">${c.v(b)}</td>`).join('')}</tr>`).join('');
      const w = window.open('', '_blank');
      w.document.write(`<!DOCTYPE html><html><head><title>Buyers</title><style>body{font-family:sans-serif;padding:24px}table{border-collapse:collapse;width:100%}@media print{button{display:none}}</style></head><body><h2>Buyers</h2><table>${th}${tb}</table><script>setTimeout(()=>window.print(),400)<\/script></body></html>`);
      w.document.close();
    }
    setFmtOpen(false); setExportMode(false); setExportSel([]);
  };

  return (
    <div className="content-inner wide">
      <div className="page-header">
        <div>
          <h1 className="page-title">Buyers</h1>
          <div className="page-sub">{BUYERS.length} active · ₹3.7 Cr total outstanding</div>
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
              <button className="btn" onClick={() => setExportMode(true)}><Icon.Download size={14} /> Export</button>
              <button className="btn btn-primary" onClick={() => onCmd('new:buyer')}><Icon.Plus size={14} /> New buyer</button>
            </>
          )}
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Buyers</div>
        </div>
        <div style={{ padding:'0 16px 4px' }}>
          <FilterToolbar ctrl={ctrl} columnDefs={BUYER_COLS} totalCount={BUYERS.length} filteredCount={filtered.length} />
        </div>
        <table className="tbl">
          <thead>
            <tr>
              {exportMode && (
                <th style={{ width:36, paddingLeft:14 }}>
                  <input type="checkbox" checked={allExpSel} onChange={e => setExportSel(e.target.checked ? filtered.map(b => b.id) : [])} />
                </th>
              )}
              <SortableHeader field="id"          label="ID"          ctrl={ctrl} style={{ width:90 }} />
              <SortableHeader field="name"        label="Name"        ctrl={ctrl} />
              <SortableHeader field="station"     label="Station"     ctrl={ctrl} />
              <SortableHeader field="state"       label="State"       ctrl={ctrl} />
              <SortableHeader field="gstin"       label="GSTIN"       ctrl={ctrl} />
              <SortableHeader field="outstanding" label="Outstanding" ctrl={ctrl} className="num" align="right" />
              <SortableHeader field="conf"        label="Confs"       ctrl={ctrl} className="num" align="right" />
              <th>30-day trend</th>
              <SortableHeader field="status"      label="Status"      ctrl={ctrl} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={exportMode ? 10 : 9} style={{ textAlign:'center', padding:'40px 32px', color:'var(--text-3)', fontSize:13 }}>
                  No buyers match.
                </td>
              </tr>
            )}
            {filtered.map(b => (
              <tr key={b.id} style={{ cursor:'pointer' }}
                onClick={() => exportMode
                  ? setExportSel(prev => prev.includes(b.id) ? prev.filter(x => x !== b.id) : [...prev, b.id])
                  : onOpen('buyer', b)}>
                {exportMode && (
                  <td onClick={e => e.stopPropagation()} style={{ paddingLeft:14 }}>
                    <input type="checkbox" checked={exportSel.includes(b.id)}
                      onChange={() => setExportSel(prev => prev.includes(b.id) ? prev.filter(x => x !== b.id) : [...prev, b.id])} />
                  </td>
                )}
                <td className="cell-mono cell-strong">{b.id}</td>
                <td className="cell-strong">{b.name}</td>
                <td>{b.station}</td>
                <td className="muted">{b.state}</td>
                <td className="cell-mono muted">{b.gstin}</td>
                <td className="num tnum cell-strong">{b.outstanding > 0 ? fmtINR(b.outstanding, { compact: true }) : '—'}</td>
                <td className="num tnum">{b.conf}</td>
                <td style={{ color: b.outstanding > 1000000 ? 'var(--warn)' : 'var(--positive)' }}>
                  <Sparkline data={Array.from({length:14},(_,i)=>10+Math.sin(i+b.conf)*4+i*0.4)} width={90} height={20} dot={false} />
                </td>
                <td><Badge tone="success">{b.status}</Badge></td>
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
            <div style={{ fontSize:12.5, color:'var(--text-3)', marginBottom:20 }}>Exporting {exportSel.length} buyer{exportSel.length !== 1 ? 's' : ''}</div>
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

window.Buyer = Buyer;
window.BuyersList = BuyersList;
