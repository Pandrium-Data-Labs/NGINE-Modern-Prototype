// Sample data for NCotton

const today = new Date('2026-05-10');
const dDays = (n) => {
  const d = new Date(today); d.setDate(d.getDate() - n); return d;
};
const fmtDate = (d) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateShort = (d) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

const STATIONS = ['Guntur', 'Adilabad', 'Khammam', 'Warangal', 'Karimnagar', 'Yavatmal', 'Akola', 'Rajkot', 'Ahmedabad'];
const VARIETIES = ['Shankar-6', 'MCU-5', 'DCH-32', 'Bunny', 'Suvin', 'J-34', 'H-4', 'LRA-5166'];
const STATES = ['Andhra Pradesh', 'Telangana', 'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Madhya Pradesh', 'Punjab'];
const COMPANIES = ['Aravind Cotton Co.', 'Aravind Exports Pvt Ltd', 'Aravind Brokerage'];

const BUYERS = [
  { id: 'B-1042', name: 'Arvind Mills Ltd.', short: 'Arvind', station: 'Ahmedabad', state: 'Gujarat', gstin: '24AABCA1234F1Z5', pan: 'AABCA1234F', phone: '+91 79 2680 1500', mobile: '+91 98250 12345', email: 'cotton@arvind.com', commPct: 1.5, baleComm: 0, status: 'active', outstanding: 1842500, conf: 12 },
  { id: 'B-1067', name: 'Welspun India', short: 'Welspun', station: 'Anjar', state: 'Gujarat', gstin: '24AAACW3456D1Z2', pan: 'AAACW3456D', phone: '+91 2836 661 111', mobile: '+91 98245 67890', email: 'procurement@welspun.com', commPct: 1.25, baleComm: 0, status: 'active', outstanding: 940000, conf: 8 },
  { id: 'B-1108', name: 'Trident Group', short: 'Trident', station: 'Barnala', state: 'Punjab', gstin: '03AABCT2345B1Z9', pan: 'AABCT2345B', phone: '+91 1679 244 800', mobile: '+91 99880 11223', email: 'cotton@tridentindia.com', commPct: 1.5, baleComm: 0, status: 'active', outstanding: 0, conf: 6 },
  { id: 'B-1133', name: 'Vardhman Textiles', short: 'Vardhman', station: 'Ludhiana', state: 'Punjab', gstin: '03AAACV5678R1Z3', pan: 'AAACV5678R', phone: '+91 161 280 8000', mobile: '+91 98140 33445', email: 'cotton@vardhman.com', commPct: 1.5, baleComm: 0, status: 'active', outstanding: 612000, conf: 4 },
  { id: 'B-1145', name: 'Raymond Ltd.', short: 'Raymond', station: 'Mumbai', state: 'Maharashtra', gstin: '27AAACR1234M1Z8', pan: 'AAACR1234M', phone: '+91 22 4036 6600', mobile: '+91 98200 56677', email: 'cotton@raymond.in', commPct: 1.25, baleComm: 0, status: 'active', outstanding: 285000, conf: 3 },
];

const SELLERS = [
  { id: 'S-2014', name: 'Sri Lakshmi Cotton Ginning', short: 'Sri Lakshmi', station: 'Guntur', state: 'Andhra Pradesh', commPct: 0.5 },
  { id: 'S-2025', name: 'Vasant Cotton Industries', short: 'Vasant', station: 'Adilabad', state: 'Telangana', commPct: 0.5 },
  { id: 'S-2036', name: 'Patel Ginning Mills', short: 'Patel', station: 'Rajkot', state: 'Gujarat', commPct: 0.75 },
  { id: 'S-2049', name: 'Shree Krishna Cotex', short: 'Krishna', station: 'Yavatmal', state: 'Maharashtra', commPct: 0.5 },
];

const CONFIRMATIONS = [
  { no: 'SC-26-0142', date: dDays(2), buyer: 'Arvind Mills Ltd.', seller: 'Sri Lakshmi Cotton Ginning', station: 'Guntur', variety: 'Shankar-6', balesMin: 200, balesMax: 220, candyRt: 56250, status: 'open', delivered: 145, invoiced: false, payment: 'pending', tags: ['priority', 'export'] },
  { no: 'SC-26-0141', date: dDays(3), buyer: 'Welspun India', seller: 'Patel Ginning Mills', station: 'Rajkot', variety: 'Shankar-6', balesMin: 350, balesMax: 350, candyRt: 56400, status: 'open', delivered: 350, invoiced: true, payment: 'partial', tags: ['priority'] },
  { no: 'SC-26-0140', date: dDays(4), buyer: 'Vardhman Textiles', seller: 'Vasant Cotton Industries', station: 'Adilabad', variety: 'MCU-5', balesMin: 180, balesMax: 200, candyRt: 58100, status: 'open', delivered: 180, invoiced: true, payment: 'paid', tags: ['domestic'] },
  { no: 'SC-26-0139', date: dDays(5), buyer: 'Raymond Ltd.', seller: 'Shree Krishna Cotex', station: 'Yavatmal', variety: 'DCH-32', balesMin: 120, balesMax: 120, candyRt: 60750, status: 'closed', delivered: 120, invoiced: true, payment: 'paid', tags: ['domestic', 'Q4-2025'] },
  { no: 'SC-26-0138', date: dDays(6), buyer: 'Trident Group', seller: 'Sri Lakshmi Cotton Ginning', station: 'Guntur', variety: 'Bunny', balesMin: 250, balesMax: 280, candyRt: 55980, status: 'open', delivered: 80, invoiced: false, payment: 'pending', tags: ['export', 'bulk'] },
  { no: 'SC-26-0137', date: dDays(7), buyer: 'Arvind Mills Ltd.', seller: 'Patel Ginning Mills', station: 'Rajkot', variety: 'Shankar-6', balesMin: 400, balesMax: 400, candyRt: 56120, status: 'open', delivered: 400, invoiced: true, payment: 'pending', tags: [] },
  { no: 'SC-26-0136', date: dDays(8), buyer: 'Welspun India', seller: 'Vasant Cotton Industries', station: 'Adilabad', variety: 'MCU-5', balesMin: 160, balesMax: 180, candyRt: 58000, status: 'open', delivered: 160, invoiced: true, payment: 'paid', tags: ['domestic'] },
  { no: 'SC-26-0135', date: dDays(10), buyer: 'Raymond Ltd.', seller: 'Shree Krishna Cotex', station: 'Yavatmal', variety: 'J-34', balesMin: 90, balesMax: 100, candyRt: 54200, status: 'closed', delivered: 100, invoiced: true, payment: 'paid', tags: ['Q4-2025', 'bulk'] },
];

const DELIVERIES = [
  { id: 'DL-26-0312', conf: 'SC-26-0142', date: dDays(1), bales: 145, gross: 25840, tare: 412, net: 25428, status: 'In transit' },
  { id: 'DL-26-0311', conf: 'SC-26-0141', date: dDays(2), bales: 350, gross: 62380, tare: 1050, net: 61330, status: 'Delivered' },
  { id: 'DL-26-0310', conf: 'SC-26-0140', date: dDays(3), bales: 180, gross: 32140, tare: 540, net: 31600, status: 'Delivered' },
  { id: 'DL-26-0309', conf: 'SC-26-0138', date: dDays(4), bales: 80, gross: 14280, tare: 240, net: 14040, status: 'Mill passing' },
  { id: 'DL-26-0308', conf: 'SC-26-0137', date: dDays(5), bales: 400, gross: 71280, tare: 1200, net: 70080, status: 'Delivered' },
  { id: 'DL-26-0307', conf: 'SC-26-0136', date: dDays(7), bales: 160, gross: 28560, tare: 480, net: 28080, status: 'Delivered' },
];

const INVOICES = [
  { no: 'INV-26-0892', conf: 'SC-26-0141', date: dDays(2), buyer: 'Welspun India', seller: 'Patel Ginning Mills', amount: 19740000, balance: 9740000, status: 'partial' },
  { no: 'INV-26-0891', conf: 'SC-26-0140', date: dDays(3), buyer: 'Vardhman Textiles', seller: 'Vasant Cotton Industries', amount: 10458000, balance: 0, status: 'paid' },
  { no: 'INV-26-0890', conf: 'SC-26-0139', date: dDays(5), buyer: 'Raymond Ltd.', seller: 'Shree Krishna Cotex', amount: 7290000, balance: 0, status: 'paid' },
  { no: 'INV-26-0889', conf: 'SC-26-0137', date: dDays(7), buyer: 'Arvind Mills Ltd.', seller: 'Patel Ginning Mills', amount: 22448000, balance: 22448000, status: 'unpaid' },
  { no: 'INV-26-0888', conf: 'SC-26-0136', date: dDays(8), buyer: 'Welspun India', seller: 'Vasant Cotton Industries', amount: 9280000, balance: 0, status: 'paid' },
];

// 60-day candy-rate price line
const PRICE_TREND = (() => {
  let v = 55400; const out = [];
  for (let i = 0; i < 60; i++) {
    v += (Math.sin(i / 7) * 80) + (Math.random() - 0.4) * 120;
    if (i > 35) v += 18; // recent uptrend
    out.push(Math.round(v));
  }
  return out;
})();

const SPARKS = {
  arrivals: [840, 920, 880, 1100, 1240, 1180, 1320, 1280, 1410, 1380, 1520, 1480, 1610, 1560],
  inventory: [4200, 4350, 4280, 4420, 4380, 4510, 4480, 4620, 4550, 4720, 4680, 4810, 4750, 4880],
  payments: [820000, 940000, 1020000, 880000, 1180000, 1340000, 1280000, 1420000, 1380000, 1560000, 1480000, 1620000, 1580000, 1740000],
  outstanding: [42, 44, 43, 45, 47, 46, 48, 49, 47, 48, 49, 50, 49, 48],
};

const ACTIVITY = [
  { dot: 'success', text: <span><strong>Patel Ginning Mills</strong> delivered 350 bales for <strong>SC-26-0141</strong></span>, time: '2h ago' },
  { dot: 'info', text: <span><strong>Welspun India</strong> paid ₹10.0 L on <strong>INV-26-0892</strong></span>, time: '4h ago' },
  { dot: 'default', text: <span>New confirmation <strong>SC-26-0142</strong> created — Arvind Mills, 200/220 bales @ ₹56,250</span>, time: '5h ago' },
  { dot: 'warn', text: <span>Shortage flagged on <strong>DL-26-0309</strong> — 1.2% over tolerance</span>, time: '7h ago' },
  { dot: 'default', text: <span><strong>You</strong> issued CR/DR Note <strong>CD-26-0034</strong> for ₹42,800</span>, time: '1d ago' },
  { dot: 'info', text: <span><strong>Trident Group</strong> KYC document re-verified</span>, time: '1d ago' },
];

const PAYMENT_TERMS = [
  { id: 'PT-001', name: 'Cash on Delivery',        short: 'COD',    days: 0,   status: 'active',   used: 84,  updated: '2 May 2026' },
  { id: 'PT-002', name: 'Net 7 Days',              short: 'NET7',   days: 7,   status: 'active',   used: 142, updated: '2 May 2026' },
  { id: 'PT-003', name: 'Net 15 Days',             short: 'NET15',  days: 15,  status: 'active',   used: 218, updated: '28 Apr 2026' },
  { id: 'PT-004', name: 'Net 21 Days',             short: 'NET21',  days: 21,  status: 'active',   used: 96,  updated: '21 Apr 2026' },
  { id: 'PT-005', name: 'Net 30 Days',             short: 'NET30',  days: 30,  status: 'active',   used: 184, updated: '14 Apr 2026' },
  { id: 'PT-006', name: 'Net 45 Days',             short: 'NET45',  days: 45,  status: 'active',   used: 53,  updated: '08 Apr 2026' },
  { id: 'PT-007', name: 'Net 60 Days',             short: 'NET60',  days: 60,  status: 'deferred', used: 11,  updated: '01 Apr 2026' },
  { id: 'PT-008', name: 'Net 90 Days',             short: 'NET90',  days: 90,  status: 'deferred', used: 6,   updated: '24 Mar 2026' },
  { id: 'PT-009', name: 'Advance — 100%',          short: 'ADV100', days: -1,  status: 'active',   used: 28,  updated: '18 Mar 2026' },
  { id: 'PT-010', name: 'Advance — 50% / Net 30',  short: 'ADV50',  days: 30,  status: 'active',   used: 47,  updated: '11 Mar 2026' },
  { id: 'PT-011', name: 'Letter of Credit (LC)',   short: 'LC',     days: 30,  status: 'active',   used: 14,  updated: '04 Mar 2026' },
  { id: 'PT-012', name: 'Bill Discounting',        short: 'BILLD',  days: 60,  status: 'active',   used: 19,  updated: '26 Feb 2026' },
  { id: 'PT-013', name: 'Cash on Bilty',           short: 'COB',    days: 1,   status: 'active',   used: 22,  updated: '19 Feb 2026' },
  { id: 'PT-014', name: 'Pay on Receipt',          short: 'PYR',    days: 3,   status: 'deferred', used: 4,   updated: '12 Feb 2026' },
];

const CR_DR_NOTES = [
  { no:'CD-26-0034', date:dDays(1),  type:'credit', reason:'mill-weight',      invoice:'INV-26-0892', conf:'SC-26-0141', buyer:'Welspun India',     description:'Mill weight variance — net weight 2.1% below station weight on INV-26-0892', amount:42800,  approvedBy:'Karthik R', status:'issued'  },
  { no:'CD-26-0033', date:dDays(3),  type:'debit',  reason:'price-correction', invoice:'INV-26-0892', conf:'SC-26-0141', buyer:'Welspun India',     description:'Rate revision agreed on 08 May 2026 for SC-26-0141',                         amount:87500,  approvedBy:'Karthik R', status:'settled' },
  { no:'CD-26-0032', date:dDays(5),  type:'credit', reason:'bale-return',      invoice:'INV-26-0891', conf:'SC-26-0140', buyer:'Vardhman Textiles', description:'22 bales returned — downgraded to Grade B at mill per inspection report',    amount:128700, approvedBy:'Karthik R', status:'issued'  },
  { no:'CD-26-0031', date:dDays(8),  type:'credit', reason:'mill-weight',      invoice:'INV-26-0889', conf:'SC-26-0137', buyer:'Arvind Mills Ltd.', description:'Pending mill weight confirmation — shortage flagged on invoice',              amount:18400,  approvedBy:'',          status:'draft'   },
  { no:'CD-26-0030', date:dDays(12), type:'debit',  reason:'other',            invoice:'INV-26-0889', conf:'SC-26-0137', buyer:'Arvind Mills Ltd.', description:'Fumigation and handling charges passed through per agreement',                amount:54000,  approvedBy:'Karthik R', status:'settled' },
];

const ADVANCE_PAYMENTS = [
  { no:'ADV-26-0012', date:dDays(2),  buyer:'Arvind Mills Ltd.',  amount:5000000, utilised:3200000, balance:1800000, mode:'RTGS',   ref:'HDFC26050100234', status:'partial',  notes:'Against SC-26-0142 and future bookings' },
  { no:'ADV-26-0011', date:dDays(5),  buyer:'Welspun India',      amount:8000000, utilised:8000000, balance:0,       mode:'NEFT',   ref:'ICIC26042800945', status:'utilised', notes:'Advance for season bookings' },
  { no:'ADV-26-0010', date:dDays(9),  buyer:'Trident Group',      amount:3500000, utilised:0,       balance:3500000, mode:'RTGS',   ref:'HDFC26042201234', status:'open',     notes:'' },
  { no:'ADV-26-0009', date:dDays(14), buyer:'Vardhman Textiles',  amount:2000000, utilised:2000000, balance:0,       mode:'Cheque', ref:'CHQ-001294',      status:'utilised', notes:'Cleared against SC-26-0140' },
  { no:'ADV-26-0008', date:dDays(18), buyer:'Raymond Ltd.',       amount:1500000, utilised:800000,  balance:700000,  mode:'NEFT',   ref:'AXIS26041500392', status:'partial',  notes:'Partial utilisation against SC-26-0139' },
];

const CHARITY_CHEQUES = [
  { no:'CHQ-26-0028', date:dDays(2),  conf:'SC-26-0142', buyer:'Arvind Mills Ltd.',  seller:'Sri Lakshmi Cotton Ginning', bales:145, ratePerBale:10, amount:1450,  payTo:'Guntur Cotton Samiti',          status:'issued'  },
  { no:'CHQ-26-0027', date:dDays(3),  conf:'SC-26-0141', buyer:'Welspun India',      seller:'Patel Ginning Mills',         bales:350, ratePerBale:10, amount:3500,  payTo:'Rajkot Cotton Association',     status:'cleared' },
  { no:'CHQ-26-0026', date:dDays(4),  conf:'SC-26-0140', buyer:'Vardhman Textiles',  seller:'Vasant Cotton Industries',    bales:180, ratePerBale:10, amount:1800,  payTo:'Adilabad Ginners Association',  status:'cleared' },
  { no:'CHQ-26-0025', date:dDays(6),  conf:'SC-26-0138', buyer:'Trident Group',      seller:'Sri Lakshmi Cotton Ginning',  bales:80,  ratePerBale:10, amount:800,   payTo:'Guntur Cotton Samiti',          status:'pending' },
  { no:'CHQ-26-0024', date:dDays(7),  conf:'SC-26-0137', buyer:'Arvind Mills Ltd.',  seller:'Patel Ginning Mills',         bales:400, ratePerBale:10, amount:4000,  payTo:'Rajkot Cotton Association',     status:'cleared' },
  { no:'CHQ-26-0023', date:dDays(9),  conf:'SC-26-0136', buyer:'Welspun India',      seller:'Vasant Cotton Industries',    bales:160, ratePerBale:10, amount:1600,  payTo:'Adilabad Ginners Association',  status:'cleared' },
];

const ALLOWANCES = [
  { no:'ALW-26-0019', date:dDays(2),  type:'freight',  conf:'SC-26-0142', buyer:'Arvind Mills Ltd.',  seller:'Sri Lakshmi Cotton Ginning', description:'Freight charges from Guntur to Ahmedabad per contract terms',            amount:18500, createdBy:'Karthik R', status:'pending' },
  { no:'ALW-26-0018', date:dDays(3),  type:'handling', conf:'SC-26-0141', buyer:'Welspun India',      seller:'Patel Ginning Mills',         description:'Mill gate handling charges — 350 bales at ₹25/bale',                    amount:8750,  createdBy:'Karthik R', status:'applied' },
  { no:'ALW-26-0017', date:dDays(5),  type:'quality',  conf:'SC-26-0140', buyer:'Vardhman Textiles',  seller:'Vasant Cotton Industries',    description:'MCU-5 bales — staple length below contract specification, 22 bales',    amount:22000, createdBy:'Karthik R', status:'pending' },
  { no:'ALW-26-0016', date:dDays(8),  type:'loading',  conf:'SC-26-0138', buyer:'Trident Group',      seller:'Sri Lakshmi Cotton Ginning',  description:'Station loading charges — open yard delivery per standing agreement',   amount:6000,  createdBy:'Karthik R', status:'applied' },
  { no:'ALW-26-0015', date:dDays(12), type:'other',    conf:'SC-26-0137', buyer:'Arvind Mills Ltd.',  seller:'Patel Ginning Mills',         description:'Miscellaneous charges per addendum dated 06 May 2026',                  amount:3200,  createdBy:'Karthik R', status:'applied' },
  { no:'ALW-26-0014', date:dDays(14), type:'freight',  conf:'SC-26-0136', buyer:'Welspun India',      seller:'Vasant Cotton Industries',    description:'Freight reimbursement — buyer arranged transport from gin point',       amount:11200, createdBy:'Karthik R', status:'applied' },
];

const MILLWEIGHTS = [
  { no:'MW-26-0041', date:dDays(2),  conf:'SC-26-0142', delivery:'DL-26-0312', buyer:'Arvind Mills Ltd.',  bales:145, origNet:25428, millNet:25284, diff:-144, diffPct:-0.57, status:'accepted',  notes:'Mill weight accepted within tolerance' },
  { no:'MW-26-0040', date:dDays(3),  conf:'SC-26-0141', delivery:'DL-26-0311', buyer:'Welspun India',      bales:350, origNet:61330, millNet:61050, diff:-280, diffPct:-0.46, status:'accepted',  notes:'' },
  { no:'MW-26-0039', date:dDays(4),  conf:'SC-26-0140', delivery:'DL-26-0310', buyer:'Vardhman Textiles',  bales:180, origNet:31600, millNet:31200, diff:-400, diffPct:-1.27, status:'disputed',  notes:'Difference exceeds 1% — buyer raised objection' },
  { no:'MW-26-0038', date:dDays(6),  conf:'SC-26-0138', delivery:'DL-26-0309', buyer:'Trident Group',      bales:80,  origNet:14040, millNet:13980, diff:-60,  diffPct:-0.43, status:'pending',   notes:'Mill certificate awaited' },
  { no:'MW-26-0037', date:dDays(7),  conf:'SC-26-0137', delivery:'DL-26-0308', buyer:'Arvind Mills Ltd.',  bales:400, origNet:70080, millNet:69780, diff:-300, diffPct:-0.43, status:'accepted',  notes:'' },
  { no:'MW-26-0036', date:dDays(9),  conf:'SC-26-0136', delivery:'DL-26-0307', buyer:'Welspun India',      bales:160, origNet:28080, millNet:27940, diff:-140, diffPct:-0.50, status:'accepted',  notes:'' },
];

const GST_RECEIPTS = [
  { no:'GSTR-26-0021', date:dDays(3),  buyer:'Welspun India',     seller:'Patel Ginning Mills',        conf:'SC-26-0141', invoice:'INV-26-0892', taxableAmt:19740000, gstRate:0, gstAmt:0, certNo:'GJ-2026-0341',  status:'received', notes:'Raw cotton — 0% GST per notification' },
  { no:'GSTR-26-0020', date:dDays(4),  buyer:'Vardhman Textiles', seller:'Vasant Cotton Industries',   conf:'SC-26-0140', invoice:'INV-26-0891', taxableAmt:10458000, gstRate:0, gstAmt:0, certNo:'AP-2026-0128',  status:'received', notes:'' },
  { no:'GSTR-26-0019', date:dDays(6),  buyer:'Raymond Ltd.',      seller:'Shree Krishna Cotex',        conf:'SC-26-0139', invoice:'INV-26-0890', taxableAmt:7290000,  gstRate:0, gstAmt:0, certNo:'MH-2026-0092',  status:'received', notes:'' },
  { no:'GSTR-26-0018', date:dDays(8),  buyer:'Arvind Mills Ltd.', seller:'Patel Ginning Mills',        conf:'SC-26-0137', invoice:'INV-26-0889', taxableAmt:22448000, gstRate:0, gstAmt:0, certNo:null,            status:'pending',  notes:'Certificate pending from buyer' },
  { no:'GSTR-26-0017', date:dDays(9),  buyer:'Welspun India',     seller:'Vasant Cotton Industries',   conf:'SC-26-0136', invoice:'INV-26-0888', taxableAmt:9280000,  gstRate:0, gstAmt:0, certNo:'GJ-2026-0289',  status:'received', notes:'' },
  { no:'GSTR-26-0016', date:dDays(12), buyer:'Trident Group',     seller:'Sri Lakshmi Cotton Ginning', conf:'SC-26-0135', invoice:null,          taxableAmt:5580000,  gstRate:0, gstAmt:0, certNo:null,            status:'pending',  notes:'Invoice not yet raised' },
];

const COMM_INVOICES = [
  { no:'CI-26-0006', date:dDays(2),  confNo:'SC-26-0141', party:'buyer',  partyName:'Welspun India',              candies:172.28, rate:150, amount:25842, balance:25842, status:'unpaid'  },
  { no:'CI-26-0005', date:dDays(3),  confNo:'SC-26-0140', party:'buyer',  partyName:'Vardhman Textiles',           candies:88.76,  rate:150, amount:13314, balance:0,     status:'paid'    },
  { no:'CI-26-0004', date:dDays(5),  confNo:'SC-26-0137', party:'buyer',  partyName:'Arvind Mills Ltd.',           candies:196.85, rate:150, amount:29528, balance:14764, status:'partial' },
  { no:'CI-26-0003', date:dDays(7),  confNo:'SC-26-0136', party:'buyer',  partyName:'Welspun India',              candies:78.88,  rate:150, amount:11832, balance:0,     status:'paid'    },
  { no:'CI-26-0002', date:dDays(2),  confNo:'SC-26-0142', party:'seller', partyName:'Sri Lakshmi Cotton Ginning', candies:71.43,  rate:100, amount:7143,  balance:7143,  status:'unpaid'  },
  { no:'CI-26-0001', date:dDays(9),  confNo:'SC-26-0135', party:'seller', partyName:'Shree Krishna Cotex',        candies:49.44,  rate:100, amount:4944,  balance:0,     status:'paid'    },
];

const SUB_BROKERS = [
  { id:'SB-001', name:'Ramesh Patel Associates',  short:'Ramesh Patel', phone:'+91 98250 11234', email:'ramesh@rpatel.in',  commShare:30, city:'Rajkot',   state:'Gujarat',       status:'active'   },
  { id:'SB-002', name:'Krishna Broker Services',  short:'Krishna',      phone:'+91 97000 22345', email:'krishna@kbs.in',    commShare:25, city:'Guntur',   state:'Andhra Pradesh', status:'active'   },
  { id:'SB-003', name:'M/s Ganesh Trading Agents',short:'Ganesh',       phone:'+91 98140 33456', email:'ganesh@gta.in',     commShare:20, city:'Yavatmal', state:'Maharashtra',   status:'active'   },
  { id:'SB-004', name:'Suresh Brokerage',          short:'Suresh',       phone:'+91 99880 44567', email:'suresh@sb.in',      commShare:30, city:'Adilabad', state:'Telangana',     status:'inactive' },
];

const SUB_BROKER_LEDGER = [
  { no:'SBL-26-0008', date:dDays(3),  broker:'Ramesh Patel Associates',  brokerId:'SB-001', confNo:'SC-26-0140', ciNo:'CI-26-0005', totalComm:13314, shareAmt:3994, paid:3994, balance:0,    status:'paid',    notes:'' },
  { no:'SBL-26-0007', date:dDays(5),  broker:'Krishna Broker Services',   brokerId:'SB-002', confNo:'SC-26-0137', ciNo:'CI-26-0004', totalComm:29528, shareAmt:7382, paid:0,    balance:7382, status:'pending', notes:'Awaiting buyer payment clearance' },
  { no:'SBL-26-0006', date:dDays(7),  broker:'Ramesh Patel Associates',   brokerId:'SB-001', confNo:'SC-26-0136', ciNo:'CI-26-0003', totalComm:11832, shareAmt:3550, paid:3550, balance:0,    status:'paid',    notes:'' },
  { no:'SBL-26-0005', date:dDays(8),  broker:'M/s Ganesh Trading Agents', brokerId:'SB-003', confNo:'SC-26-0141', ciNo:'CI-26-0006', totalComm:25842, shareAmt:5168, paid:0,    balance:5168, status:'pending', notes:'' },
  { no:'SBL-26-0004', date:dDays(9),  broker:'Krishna Broker Services',   brokerId:'SB-002', confNo:'SC-26-0135', ciNo:'CI-26-0001', totalComm:4944,  shareAmt:1236, paid:1236, balance:0,    status:'paid',    notes:'' },
  { no:'SBL-26-0003', date:dDays(12), broker:'M/s Ganesh Trading Agents', brokerId:'SB-003', confNo:'SC-26-0142', ciNo:'CI-26-0002', totalComm:7143,  shareAmt:1429, paid:0,    balance:1429, status:'pending', notes:'Pending invoice settlement' },
];

const COMM_RECEIPTS = [
  { no:'CRC-26-0004', date:dDays(3),  ciNo:'CI-26-0005', party:'buyer',  partyName:'Vardhman Textiles',  confNo:'SC-26-0140', amount:13314, mode:'RTGS',   ref:'HDFC26050702345', status:'credited', notes:'' },
  { no:'CRC-26-0003', date:dDays(5),  ciNo:'CI-26-0004', party:'buyer',  partyName:'Arvind Mills Ltd.',  confNo:'SC-26-0137', amount:14764, mode:'NEFT',   ref:'ICIC26050500156', status:'credited', notes:'Partial payment — balance ₹14,764 pending' },
  { no:'CRC-26-0002', date:dDays(7),  ciNo:'CI-26-0003', party:'buyer',  partyName:'Welspun India',      confNo:'SC-26-0136', amount:11832, mode:'RTGS',   ref:'HDFC26050303478', status:'credited', notes:'' },
  { no:'CRC-26-0001', date:dDays(9),  ciNo:'CI-26-0001', party:'seller', partyName:'Shree Krishna Cotex',confNo:'SC-26-0135', amount:4944,  mode:'Cheque', ref:'CHQ-004521',      status:'cleared',  notes:'' },
];

window.NCData = { today, dDays, fmtDate, fmtDateShort, STATIONS, VARIETIES, STATES, COMPANIES, BUYERS, SELLERS, CONFIRMATIONS, DELIVERIES, INVOICES, PAYMENT_TERMS, PRICE_TREND, SPARKS, ACTIVITY, CR_DR_NOTES, ADVANCE_PAYMENTS, CHARITY_CHEQUES, ALLOWANCES, MILLWEIGHTS, GST_RECEIPTS, COMM_INVOICES, SUB_BROKERS, SUB_BROKER_LEDGER, COMM_RECEIPTS };
