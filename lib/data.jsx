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
  { no: 'SC-26-0146', date: dDays(0), buyer: 'Trident Group',      seller: 'Patel Ginning Mills',        station: 'Rajkot',   variety: 'Shankar-6', balesMin: 300, balesMax: 320, candyRt: 56500, status: 'open', delivered: 0,   invoiced: false, payment: 'pending', tags: ['priority'] },
  { no: 'SC-26-0145', date: dDays(0), buyer: 'Arvind Mills Ltd.',   seller: 'Vasant Cotton Industries',   station: 'Adilabad', variety: 'MCU-5',     balesMin: 250, balesMax: 260, candyRt: 58300, status: 'open', delivered: 0,   invoiced: false, payment: 'pending', tags: ['export'] },
  { no: 'SC-26-0144', date: dDays(1), buyer: 'Welspun India',       seller: 'Sri Lakshmi Cotton Ginning', station: 'Guntur',   variety: 'Bunny',     balesMin: 180, balesMax: 200, candyRt: 56000, status: 'open', delivered: 0,   invoiced: false, payment: 'pending', tags: [] },
  { no: 'SC-26-0143', date: dDays(1), buyer: 'Raymond Ltd.',        seller: 'Shree Krishna Cotex',        station: 'Yavatmal', variety: 'DCH-32',    balesMin: 100, balesMax: 120, candyRt: 61200, status: 'open', delivered: 0,   invoiced: false, payment: 'pending', tags: ['domestic'] },
  { no: 'SC-26-0142', date: dDays(2), buyer: 'Arvind Mills Ltd.', seller: 'Sri Lakshmi Cotton Ginning', station: 'Guntur', variety: 'Shankar-6', balesMin: 200, balesMax: 220, candyRt: 56250, status: 'open', delivered: 145, invoiced: false, payment: 'pending', tags: ['priority', 'export'] },
  { no: 'SC-26-0141', date: dDays(3), buyer: 'Welspun India', seller: 'Patel Ginning Mills', station: 'Rajkot', variety: 'Shankar-6', balesMin: 350, balesMax: 350, candyRt: 56400, status: 'open', delivered: 350, invoiced: true, payment: 'partial', tags: ['priority'] },
  { no: 'SC-26-0140', date: dDays(4), buyer: 'Vardhman Textiles', seller: 'Vasant Cotton Industries', station: 'Adilabad', variety: 'MCU-5', balesMin: 180, balesMax: 200, candyRt: 58100, status: 'open', delivered: 180, invoiced: true, payment: 'paid', tags: ['domestic'] },
  { no: 'SC-26-0139', date: dDays(5), buyer: 'Raymond Ltd.', seller: 'Shree Krishna Cotex', station: 'Yavatmal', variety: 'DCH-32', balesMin: 120, balesMax: 120, candyRt: 60750, status: 'closed', delivered: 120, invoiced: true, payment: 'paid', tags: ['domestic', 'Q4-2025'] },
  { no: 'SC-26-0138', date: dDays(6), buyer: 'Trident Group', seller: 'Sri Lakshmi Cotton Ginning', station: 'Guntur', variety: 'Bunny', balesMin: 250, balesMax: 280, candyRt: 55980, status: 'open', delivered: 80, invoiced: false, payment: 'pending', tags: ['export', 'bulk'] },
  { no: 'SC-26-0137', date: dDays(7), buyer: 'Arvind Mills Ltd.', seller: 'Patel Ginning Mills', station: 'Rajkot', variety: 'Shankar-6', balesMin: 400, balesMax: 400, candyRt: 56120, status: 'open', delivered: 400, invoiced: true, payment: 'pending', tags: [] },
  { no: 'SC-26-0136', date: dDays(8), buyer: 'Welspun India', seller: 'Vasant Cotton Industries', station: 'Adilabad', variety: 'MCU-5', balesMin: 160, balesMax: 180, candyRt: 58000, status: 'open', delivered: 160, invoiced: true, payment: 'paid', tags: ['domestic'] },
  { no: 'SC-26-0135', date: dDays(10), buyer: 'Raymond Ltd.', seller: 'Shree Krishna Cotex', station: 'Yavatmal', variety: 'J-34', balesMin: 90, balesMax: 100, candyRt: 54200, status: 'closed', delivered: 100, invoiced: true, payment: 'paid', tags: ['Q4-2025', 'bulk'] },
  { no: 'SC-26-0134', date: dDays(11), buyer: 'Arvind Mills Ltd.', seller: 'Vasant Cotton Industries', station: 'Adilabad', variety: 'MCU-5', balesMin: 300, balesMax: 320, candyRt: 57800, status: 'open', delivered: 300, invoiced: false, payment: 'pending', tags: ['bulk'] },
  { no: 'SC-26-0133', date: dDays(12), buyer: 'Trident Group', seller: 'Patel Ginning Mills', station: 'Rajkot', variety: 'Shankar-6', balesMin: 450, balesMax: 450, candyRt: 56000, status: 'open', delivered: 450, invoiced: true, payment: 'partial', tags: ['export'] },
  { no: 'SC-26-0132', date: dDays(14), buyer: 'Welspun India', seller: 'Shree Krishna Cotex', station: 'Yavatmal', variety: 'DCH-32', balesMin: 140, balesMax: 160, candyRt: 61000, status: 'open', delivered: 140, invoiced: true, payment: 'paid', tags: ['priority', 'domestic'] },
  { no: 'SC-26-0131', date: dDays(15), buyer: 'Vardhman Textiles', seller: 'Sri Lakshmi Cotton Ginning', station: 'Guntur', variety: 'Shankar-6', balesMin: 250, balesMax: 250, candyRt: 55750, status: 'closed', delivered: 250, invoiced: true, payment: 'paid', tags: ['Q4-2025'] },
  { no: 'SC-26-0130', date: dDays(16), buyer: 'Raymond Ltd.', seller: 'Vasant Cotton Industries', station: 'Adilabad', variety: 'J-34', balesMin: 100, balesMax: 120, candyRt: 54500, status: 'open', delivered: 100, invoiced: false, payment: 'pending', tags: [] },
  { no: 'SC-26-0129', date: dDays(18), buyer: 'Arvind Mills Ltd.', seller: 'Shree Krishna Cotex', station: 'Yavatmal', variety: 'Bunny', balesMin: 380, balesMax: 400, candyRt: 55600, status: 'open', delivered: 380, invoiced: true, payment: 'pending', tags: ['export', 'priority'] },
  { no: 'SC-26-0128', date: dDays(19), buyer: 'Trident Group', seller: 'Vasant Cotton Industries', station: 'Adilabad', variety: 'MCU-5', balesMin: 200, balesMax: 220, candyRt: 57900, status: 'closed', delivered: 220, invoiced: true, payment: 'paid', tags: ['domestic', 'Q4-2025'] },
  { no: 'SC-26-0127', date: dDays(21), buyer: 'Welspun India', seller: 'Sri Lakshmi Cotton Ginning', station: 'Guntur', variety: 'Shankar-6', balesMin: 320, balesMax: 350, candyRt: 56200, status: 'open', delivered: 320, invoiced: true, payment: 'partial', tags: ['bulk'] },
  { no: 'SC-26-0126', date: dDays(22), buyer: 'Raymond Ltd.', seller: 'Patel Ginning Mills', station: 'Rajkot', variety: 'H-4', balesMin: 80, balesMax: 80, candyRt: 53800, status: 'closed', delivered: 80, invoiced: true, payment: 'paid', tags: ['Q4-2025'] },
  { no: 'SC-26-0125', date: dDays(24), buyer: 'Vardhman Textiles', seller: 'Shree Krishna Cotex', station: 'Yavatmal', variety: 'DCH-32', balesMin: 160, balesMax: 180, candyRt: 60500, status: 'open', delivered: 160, invoiced: true, payment: 'paid', tags: ['domestic'] },
  { no: 'SC-26-0124', date: dDays(25), buyer: 'Arvind Mills Ltd.', seller: 'Sri Lakshmi Cotton Ginning', station: 'Guntur', variety: 'Shankar-6', balesMin: 500, balesMax: 500, candyRt: 55900, status: 'open', delivered: 300, invoiced: false, payment: 'pending', tags: ['bulk', 'export'] },
  { no: 'SC-26-0123', date: dDays(27), buyer: 'Trident Group', seller: 'Shree Krishna Cotex', station: 'Yavatmal', variety: 'Bunny', balesMin: 220, balesMax: 240, candyRt: 56100, status: 'open', delivered: 220, invoiced: true, payment: 'pending', tags: [] },
  { no: 'SC-26-0122', date: dDays(28), buyer: 'Welspun India', seller: 'Patel Ginning Mills', station: 'Rajkot', variety: 'Shankar-6', balesMin: 280, balesMax: 300, candyRt: 56350, status: 'closed', delivered: 300, invoiced: true, payment: 'paid', tags: ['Q4-2025', 'export'] },
  { no: 'SC-26-0121', date: dDays(30), buyer: 'Vardhman Textiles', seller: 'Vasant Cotton Industries', station: 'Adilabad', variety: 'MCU-5', balesMin: 140, balesMax: 140, candyRt: 58200, status: 'open', delivered: 140, invoiced: true, payment: 'partial', tags: ['domestic'] },
  { no: 'SC-26-0120', date: dDays(32), buyer: 'Raymond Ltd.', seller: 'Sri Lakshmi Cotton Ginning', station: 'Guntur', variety: 'J-34', balesMin: 110, balesMax: 120, candyRt: 54000, status: 'closed', delivered: 120, invoiced: true, payment: 'paid', tags: ['Q4-2025'] },
  { no: 'SC-26-0119', date: dDays(34), buyer: 'Arvind Mills Ltd.', seller: 'Patel Ginning Mills', station: 'Rajkot', variety: 'Shankar-6', balesMin: 360, balesMax: 380, candyRt: 56000, status: 'open', delivered: 360, invoiced: true, payment: 'pending', tags: ['export'] },
  { no: 'SC-26-0118', date: dDays(36), buyer: 'Trident Group', seller: 'Vasant Cotton Industries', station: 'Adilabad', variety: 'MCU-5', balesMin: 190, balesMax: 200, candyRt: 57600, status: 'closed', delivered: 200, invoiced: true, payment: 'paid', tags: ['domestic', 'bulk'] },
];

const DELIVERIES = [
  { id: 'DL-26-0312', conf: 'SC-26-0142', date: dDays(1),  bales: 145, gross: 25840,  tare: 412,  net: 25428,  status: 'In transit'  },
  { id: 'DL-26-0311', conf: 'SC-26-0141', date: dDays(2),  bales: 350, gross: 62380,  tare: 1050, net: 61330,  status: 'Delivered'   },
  { id: 'DL-26-0310', conf: 'SC-26-0140', date: dDays(3),  bales: 180, gross: 32140,  tare: 540,  net: 31600,  status: 'Delivered'   },
  { id: 'DL-26-0309', conf: 'SC-26-0138', date: dDays(4),  bales: 80,  gross: 14280,  tare: 240,  net: 14040,  status: 'Mill passing' },
  { id: 'DL-26-0308', conf: 'SC-26-0137', date: dDays(5),  bales: 400, gross: 71280,  tare: 1200, net: 70080,  status: 'Delivered'   },
  { id: 'DL-26-0307', conf: 'SC-26-0136', date: dDays(7),  bales: 160, gross: 28560,  tare: 480,  net: 28080,  status: 'Delivered'   },
  { id: 'DL-26-0306', conf: 'SC-26-0135', date: dDays(10), bales: 100, gross: 17820,  tare: 300,  net: 17520,  status: 'Delivered'   },
  { id: 'DL-26-0305', conf: 'SC-26-0134', date: dDays(11), bales: 300, gross: 53460,  tare: 900,  net: 52560,  status: 'Delivered'   },
  { id: 'DL-26-0304', conf: 'SC-26-0133', date: dDays(12), bales: 450, gross: 80190,  tare: 1350, net: 78840,  status: 'Delivered'   },
  { id: 'DL-26-0303', conf: 'SC-26-0132', date: dDays(14), bales: 140, gross: 24948,  tare: 420,  net: 24528,  status: 'Delivered'   },
  { id: 'DL-26-0302', conf: 'SC-26-0131', date: dDays(15), bales: 250, gross: 44550,  tare: 750,  net: 43800,  status: 'Delivered'   },
  { id: 'DL-26-0301', conf: 'SC-26-0130', date: dDays(16), bales: 100, gross: 17820,  tare: 300,  net: 17520,  status: 'Delivered'   },
  { id: 'DL-26-0300', conf: 'SC-26-0129', date: dDays(18), bales: 380, gross: 67716,  tare: 1140, net: 66576,  status: 'Delivered'   },
  { id: 'DL-26-0299', conf: 'SC-26-0128', date: dDays(19), bales: 220, gross: 39204,  tare: 660,  net: 38544,  status: 'Delivered'   },
  { id: 'DL-26-0298', conf: 'SC-26-0127', date: dDays(21), bales: 320, gross: 57024,  tare: 960,  net: 56064,  status: 'Delivered'   },
  { id: 'DL-26-0297', conf: 'SC-26-0126', date: dDays(22), bales: 80,  gross: 14256,  tare: 240,  net: 14016,  status: 'Delivered'   },
  { id: 'DL-26-0296', conf: 'SC-26-0125', date: dDays(24), bales: 160, gross: 28512,  tare: 480,  net: 28032,  status: 'Delivered'   },
  { id: 'DL-26-0295', conf: 'SC-26-0124', date: dDays(25), bales: 300, gross: 53460,  tare: 900,  net: 52560,  status: 'Delivered'   },
  { id: 'DL-26-0294', conf: 'SC-26-0123', date: dDays(27), bales: 220, gross: 39182,  tare: 660,  net: 38522,  status: 'Delivered'   },
  { id: 'DL-26-0293', conf: 'SC-26-0122', date: dDays(28), bales: 300, gross: 53430,  tare: 900,  net: 52530,  status: 'Delivered'   },
  { id: 'DL-26-0292', conf: 'SC-26-0121', date: dDays(30), bales: 140, gross: 24934,  tare: 420,  net: 24514,  status: 'Delivered'   },
  { id: 'DL-26-0291', conf: 'SC-26-0120', date: dDays(32), bales: 120, gross: 21396,  tare: 360,  net: 21036,  status: 'Delivered'   },
  { id: 'DL-26-0290', conf: 'SC-26-0119', date: dDays(34), bales: 360, gross: 64152,  tare: 1080, net: 63072,  status: 'Delivered'   },
  { id: 'DL-26-0289', conf: 'SC-26-0118', date: dDays(36), bales: 200, gross: 35640,  tare: 600,  net: 35040,  status: 'Delivered'   },
];

const INVOICES = [
  { no: 'INV-26-0892', conf: 'SC-26-0141', date: dDays(2),  buyer: 'Welspun India',      seller: 'Patel Ginning Mills',        amount: 19740000, balance: 9740000,  status: 'partial' },
  { no: 'INV-26-0891', conf: 'SC-26-0140', date: dDays(3),  buyer: 'Vardhman Textiles',   seller: 'Vasant Cotton Industries',   amount: 10458000, balance: 0,        status: 'paid'    },
  { no: 'INV-26-0890', conf: 'SC-26-0139', date: dDays(5),  buyer: 'Raymond Ltd.',        seller: 'Shree Krishna Cotex',        amount: 7290000,  balance: 0,        status: 'paid'    },
  { no: 'INV-26-0889', conf: 'SC-26-0137', date: dDays(7),  buyer: 'Arvind Mills Ltd.',   seller: 'Patel Ginning Mills',        amount: 22448000, balance: 22448000, status: 'unpaid'  },
  { no: 'INV-26-0888', conf: 'SC-26-0136', date: dDays(8),  buyer: 'Welspun India',       seller: 'Vasant Cotton Industries',   amount: 9280000,  balance: 0,        status: 'paid'    },
  { no: 'INV-26-0887', conf: 'SC-26-0135', date: dDays(10), buyer: 'Raymond Ltd.',        seller: 'Shree Krishna Cotex',        amount: 5420000,  balance: 0,        status: 'paid'    },
  { no: 'INV-26-0886', conf: 'SC-26-0133', date: dDays(12), buyer: 'Trident Group',       seller: 'Patel Ginning Mills',        amount: 25200000, balance: 12600000, status: 'partial' },
  { no: 'INV-26-0885', conf: 'SC-26-0132', date: dDays(14), buyer: 'Welspun India',       seller: 'Shree Krishna Cotex',        amount: 8540000,  balance: 0,        status: 'paid'    },
  { no: 'INV-26-0884', conf: 'SC-26-0131', date: dDays(15), buyer: 'Vardhman Textiles',   seller: 'Sri Lakshmi Cotton Ginning', amount: 13937500, balance: 0,        status: 'paid'    },
  { no: 'INV-26-0883', conf: 'SC-26-0129', date: dDays(18), buyer: 'Arvind Mills Ltd.',   seller: 'Shree Krishna Cotex',        amount: 21128000, balance: 21128000, status: 'unpaid'  },
  { no: 'INV-26-0882', conf: 'SC-26-0128', date: dDays(19), buyer: 'Trident Group',       seller: 'Vasant Cotton Industries',   amount: 12738000, balance: 0,        status: 'paid'    },
  { no: 'INV-26-0881', conf: 'SC-26-0127', date: dDays(21), buyer: 'Welspun India',       seller: 'Sri Lakshmi Cotton Ginning', amount: 17984000, balance: 8992000,  status: 'partial' },
  { no: 'INV-26-0880', conf: 'SC-26-0126', date: dDays(22), buyer: 'Raymond Ltd.',        seller: 'Patel Ginning Mills',        amount: 4304000,  balance: 0,        status: 'paid'    },
  { no: 'INV-26-0879', conf: 'SC-26-0125', date: dDays(24), buyer: 'Vardhman Textiles',   seller: 'Shree Krishna Cotex',        amount: 9680000,  balance: 0,        status: 'paid'    },
  { no: 'INV-26-0878', conf: 'SC-26-0123', date: dDays(27), buyer: 'Trident Group',       seller: 'Shree Krishna Cotex',        amount: 12342000, balance: 12342000, status: 'unpaid'  },
  { no: 'INV-26-0877', conf: 'SC-26-0122', date: dDays(28), buyer: 'Welspun India',       seller: 'Patel Ginning Mills',        amount: 16905000, balance: 0,        status: 'paid'    },
  { no: 'INV-26-0876', conf: 'SC-26-0121', date: dDays(30), buyer: 'Vardhman Textiles',   seller: 'Vasant Cotton Industries',   amount: 8148000,  balance: 4074000,  status: 'partial' },
  { no: 'INV-26-0875', conf: 'SC-26-0120', date: dDays(32), buyer: 'Raymond Ltd.',        seller: 'Sri Lakshmi Cotton Ginning', amount: 6480000,  balance: 0,        status: 'paid'    },
  { no: 'INV-26-0874', conf: 'SC-26-0119', date: dDays(34), buyer: 'Arvind Mills Ltd.',   seller: 'Patel Ginning Mills',        amount: 20160000, balance: 20160000, status: 'unpaid'  },
  { no: 'INV-26-0873', conf: 'SC-26-0118', date: dDays(36), buyer: 'Trident Group',       seller: 'Vasant Cotton Industries',   amount: 11520000, balance: 0,        status: 'paid'    },
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
  { no:'CD-26-0034', date:dDays(1),  type:'credit', reason:'mill-weight',      invoice:'INV-26-0892', conf:'SC-26-0141', buyer:'Welspun India',      description:'Mill weight variance — net weight 2.1% below station weight on INV-26-0892',      amount:42800,  approvedBy:'Karthik R', status:'issued'  },
  { no:'CD-26-0033', date:dDays(3),  type:'debit',  reason:'price-correction', invoice:'INV-26-0892', conf:'SC-26-0141', buyer:'Welspun India',      description:'Rate revision agreed on 08 May 2026 for SC-26-0141',                              amount:87500,  approvedBy:'Karthik R', status:'settled' },
  { no:'CD-26-0032', date:dDays(5),  type:'credit', reason:'bale-return',      invoice:'INV-26-0891', conf:'SC-26-0140', buyer:'Vardhman Textiles',  description:'22 bales returned — downgraded to Grade B at mill per inspection report',          amount:128700, approvedBy:'Karthik R', status:'issued'  },
  { no:'CD-26-0031', date:dDays(8),  type:'credit', reason:'mill-weight',      invoice:'INV-26-0889', conf:'SC-26-0137', buyer:'Arvind Mills Ltd.',  description:'Pending mill weight confirmation — shortage flagged on invoice',                    amount:18400,  approvedBy:'',          status:'draft'   },
  { no:'CD-26-0030', date:dDays(12), type:'debit',  reason:'other',            invoice:'INV-26-0889', conf:'SC-26-0137', buyer:'Arvind Mills Ltd.',  description:'Fumigation and handling charges passed through per agreement',                      amount:54000,  approvedBy:'Karthik R', status:'settled' },
  { no:'CD-26-0029', date:dDays(13), type:'credit', reason:'mill-weight',      invoice:'INV-26-0886', conf:'SC-26-0133', buyer:'Trident Group',      description:'450 bales — mill weight 0.56% below station weight at Rajkot mill gate',           amount:63500,  approvedBy:'Karthik R', status:'issued'  },
  { no:'CD-26-0028', date:dDays(16), type:'credit', reason:'quality',          invoice:'INV-26-0884', conf:'SC-26-0131', buyer:'Vardhman Textiles',  description:'12 bales downgraded to Grade B — staple length short per Guntur mill report',      amount:95200,  approvedBy:'Karthik R', status:'settled' },
  { no:'CD-26-0027', date:dDays(19), type:'debit',  reason:'price-correction', invoice:'INV-26-0883', conf:'SC-26-0129', buyer:'Arvind Mills Ltd.',  description:'Price adjustment for 380 bales — rate revised per addendum dated 22 Apr 2026',     amount:142000, approvedBy:'Karthik R', status:'issued'  },
  { no:'CD-26-0026', date:dDays(20), type:'credit', reason:'mill-weight',      invoice:'INV-26-0882', conf:'SC-26-0128', buyer:'Trident Group',      description:'Mill weight shortfall — 220 bales at Adilabad, 0.48% variance, settled amicably', amount:58000,  approvedBy:'Karthik R', status:'settled' },
  { no:'CD-26-0025', date:dDays(22), type:'credit', reason:'mill-weight',      invoice:'INV-26-0881', conf:'SC-26-0127', buyer:'Welspun India',      description:'Net weight shortfall at Anjar mill — 320 bales, 0.6% variance per certificate',   amount:52800,  approvedBy:'Karthik R', status:'settled' },
  { no:'CD-26-0024', date:dDays(25), type:'debit',  reason:'other',            invoice:'INV-26-0879', conf:'SC-26-0125', buyer:'Vardhman Textiles',  description:'Statutory levy and cess charges on DCH-32 variety — passed through per contract', amount:24200,  approvedBy:'Karthik R', status:'settled' },
  { no:'CD-26-0023', date:dDays(31), type:'credit', reason:'bale-return',      invoice:'INV-26-0876', conf:'SC-26-0121', buyer:'Vardhman Textiles',  description:'18 bales rejected — contamination found at Adilabad gin point during QC check',   amount:78400,  approvedBy:'Karthik R', status:'settled' },
  { no:'CD-26-0022', date:dDays(35), type:'debit',  reason:'price-correction', invoice:'INV-26-0874', conf:'SC-26-0119', buyer:'Arvind Mills Ltd.',  description:'Season closing rate revision — Shankar-6 Rajkot rate adjusted per market index',  amount:36500,  approvedBy:'',          status:'draft'   },
  { no:'CD-26-0021', date:dDays(28), type:'credit', reason:'mill-weight',      invoice:'INV-26-0877', conf:'SC-26-0122', buyer:'Welspun India',      description:'Rajkot mill certificate variance — 300 bales, net 0.5% below weighbridge weight', amount:41200,  approvedBy:'Karthik R', status:'settled' },
  { no:'CD-26-0020', date:dDays(37), type:'credit', reason:'quality',          invoice:'INV-26-0873', conf:'SC-26-0118', buyer:'Trident Group',      description:'8 bales of MCU-5 from Adilabad failed moisture test — price allowance agreed',    amount:29800,  approvedBy:'Karthik R', status:'settled' },
];

const ADVANCE_PAYMENTS = [
  { no:'ADV-26-0012', date:dDays(2),  buyer:'Arvind Mills Ltd.',  amount:5000000,  utilised:3200000,  balance:1800000, mode:'RTGS',   ref:'HDFC26050100234', status:'partial',  notes:'Against SC-26-0142 and future bookings'       },
  { no:'ADV-26-0011', date:dDays(5),  buyer:'Welspun India',      amount:8000000,  utilised:8000000,  balance:0,       mode:'NEFT',   ref:'ICIC26042800945', status:'utilised', notes:'Advance for season bookings'                   },
  { no:'ADV-26-0010', date:dDays(9),  buyer:'Trident Group',      amount:3500000,  utilised:0,        balance:3500000, mode:'RTGS',   ref:'HDFC26042201234', status:'open',     notes:''                                              },
  { no:'ADV-26-0009', date:dDays(14), buyer:'Vardhman Textiles',  amount:2000000,  utilised:2000000,  balance:0,       mode:'Cheque', ref:'CHQ-001294',      status:'utilised', notes:'Cleared against SC-26-0140'                    },
  { no:'ADV-26-0008', date:dDays(18), buyer:'Raymond Ltd.',       amount:1500000,  utilised:800000,   balance:700000,  mode:'NEFT',   ref:'AXIS26041500392', status:'partial',  notes:'Partial utilisation against SC-26-0139'        },
  { no:'ADV-26-0007', date:dDays(22), buyer:'Welspun India',      amount:6000000,  utilised:6000000,  balance:0,       mode:'RTGS',   ref:'HDFC26041801567', status:'utilised', notes:'Season advance cleared against INV-26-0881'     },
  { no:'ADV-26-0006', date:dDays(27), buyer:'Trident Group',      amount:4000000,  utilised:4000000,  balance:0,       mode:'NEFT',   ref:'ICIC26041301022', status:'utilised', notes:'Cleared against INV-26-0882 and INV-26-0878'   },
  { no:'ADV-26-0005', date:dDays(31), buyer:'Arvind Mills Ltd.',  amount:7500000,  utilised:7500000,  balance:0,       mode:'RTGS',   ref:'HDFC26040901834', status:'utilised', notes:'Applied to INV-26-0883 partially'               },
  { no:'ADV-26-0004', date:dDays(35), buyer:'Raymond Ltd.',       amount:1000000,  utilised:500000,   balance:500000,  mode:'Cheque', ref:'CHQ-001186',      status:'partial',  notes:'Balance pending utilisation against SC-26-0120' },
  { no:'ADV-26-0003', date:dDays(38), buyer:'Vardhman Textiles',  amount:3000000,  utilised:0,        balance:3000000, mode:'RTGS',   ref:'HDFC26040201248', status:'open',     notes:'Advance for next quarter bookings'              },
  { no:'ADV-26-0002', date:dDays(43), buyer:'Welspun India',      amount:5000000,  utilised:5000000,  balance:0,       mode:'NEFT',   ref:'ICIC26032801789', status:'utilised', notes:'Cleared against INV-26-0877 and INV-26-0885'   },
  { no:'ADV-26-0001', date:dDays(49), buyer:'Arvind Mills Ltd.',  amount:10000000, utilised:10000000, balance:0,       mode:'RTGS',   ref:'HDFC26032201456', status:'utilised', notes:'Season opening advance — fully utilised'        },
];

const CHARITY_CHEQUES = [
  { no:'CHQ-26-0028', date:dDays(2),  conf:'SC-26-0142', buyer:'Arvind Mills Ltd.',  seller:'Sri Lakshmi Cotton Ginning', bales:145, ratePerBale:10, amount:1450, payTo:'Guntur Cotton Samiti',           status:'issued'  },
  { no:'CHQ-26-0027', date:dDays(3),  conf:'SC-26-0141', buyer:'Welspun India',      seller:'Patel Ginning Mills',        bales:350, ratePerBale:10, amount:3500, payTo:'Rajkot Cotton Association',      status:'cleared' },
  { no:'CHQ-26-0026', date:dDays(4),  conf:'SC-26-0140', buyer:'Vardhman Textiles',  seller:'Vasant Cotton Industries',   bales:180, ratePerBale:10, amount:1800, payTo:'Adilabad Ginners Association',   status:'cleared' },
  { no:'CHQ-26-0025', date:dDays(6),  conf:'SC-26-0138', buyer:'Trident Group',      seller:'Sri Lakshmi Cotton Ginning', bales:80,  ratePerBale:10, amount:800,  payTo:'Guntur Cotton Samiti',           status:'pending' },
  { no:'CHQ-26-0024', date:dDays(7),  conf:'SC-26-0137', buyer:'Arvind Mills Ltd.',  seller:'Patel Ginning Mills',        bales:400, ratePerBale:10, amount:4000, payTo:'Rajkot Cotton Association',      status:'cleared' },
  { no:'CHQ-26-0023', date:dDays(9),  conf:'SC-26-0136', buyer:'Welspun India',      seller:'Vasant Cotton Industries',   bales:160, ratePerBale:10, amount:1600, payTo:'Adilabad Ginners Association',   status:'cleared' },
  { no:'CHQ-26-0022', date:dDays(10), conf:'SC-26-0135', buyer:'Raymond Ltd.',       seller:'Shree Krishna Cotex',        bales:100, ratePerBale:10, amount:1000, payTo:'Yavatmal Sheti Sahakari Mandal', status:'cleared' },
  { no:'CHQ-26-0021', date:dDays(11), conf:'SC-26-0134', buyer:'Arvind Mills Ltd.',  seller:'Vasant Cotton Industries',   bales:200, ratePerBale:10, amount:2000, payTo:'Adilabad Ginners Association',   status:'issued'  },
  { no:'CHQ-26-0020', date:dDays(12), conf:'SC-26-0133', buyer:'Trident Group',      seller:'Patel Ginning Mills',        bales:450, ratePerBale:10, amount:4500, payTo:'Rajkot Cotton Association',      status:'cleared' },
  { no:'CHQ-26-0019', date:dDays(14), conf:'SC-26-0132', buyer:'Welspun India',      seller:'Shree Krishna Cotex',        bales:140, ratePerBale:10, amount:1400, payTo:'Yavatmal Sheti Sahakari Mandal', status:'cleared' },
  { no:'CHQ-26-0018', date:dDays(15), conf:'SC-26-0131', buyer:'Vardhman Textiles',  seller:'Sri Lakshmi Cotton Ginning', bales:250, ratePerBale:10, amount:2500, payTo:'Guntur Cotton Samiti',           status:'cleared' },
  { no:'CHQ-26-0017', date:dDays(16), conf:'SC-26-0130', buyer:'Raymond Ltd.',       seller:'Vasant Cotton Industries',   bales:60,  ratePerBale:10, amount:600,  payTo:'Adilabad Ginners Association',   status:'pending' },
  { no:'CHQ-26-0016', date:dDays(18), conf:'SC-26-0129', buyer:'Arvind Mills Ltd.',  seller:'Shree Krishna Cotex',        bales:380, ratePerBale:10, amount:3800, payTo:'Yavatmal Sheti Sahakari Mandal', status:'cleared' },
  { no:'CHQ-26-0015', date:dDays(19), conf:'SC-26-0128', buyer:'Trident Group',      seller:'Vasant Cotton Industries',   bales:220, ratePerBale:10, amount:2200, payTo:'Adilabad Ginners Association',   status:'cleared' },
  { no:'CHQ-26-0014', date:dDays(21), conf:'SC-26-0127', buyer:'Welspun India',      seller:'Sri Lakshmi Cotton Ginning', bales:320, ratePerBale:10, amount:3200, payTo:'Guntur Cotton Samiti',           status:'cleared' },
  { no:'CHQ-26-0013', date:dDays(22), conf:'SC-26-0126', buyer:'Raymond Ltd.',       seller:'Patel Ginning Mills',        bales:80,  ratePerBale:10, amount:800,  payTo:'Rajkot Cotton Association',      status:'cleared' },
  { no:'CHQ-26-0012', date:dDays(24), conf:'SC-26-0125', buyer:'Vardhman Textiles',  seller:'Shree Krishna Cotex',        bales:160, ratePerBale:10, amount:1600, payTo:'Yavatmal Sheti Sahakari Mandal', status:'cleared' },
  { no:'CHQ-26-0011', date:dDays(25), conf:'SC-26-0124', buyer:'Arvind Mills Ltd.',  seller:'Sri Lakshmi Cotton Ginning', bales:300, ratePerBale:10, amount:3000, payTo:'Guntur Cotton Samiti',           status:'cleared' },
  { no:'CHQ-26-0010', date:dDays(27), conf:'SC-26-0123', buyer:'Trident Group',      seller:'Shree Krishna Cotex',        bales:220, ratePerBale:10, amount:2200, payTo:'Yavatmal Sheti Sahakari Mandal', status:'cleared' },
  { no:'CHQ-26-0009', date:dDays(28), conf:'SC-26-0122', buyer:'Welspun India',      seller:'Patel Ginning Mills',        bales:300, ratePerBale:10, amount:3000, payTo:'Rajkot Cotton Association',      status:'cleared' },
  { no:'CHQ-26-0008', date:dDays(30), conf:'SC-26-0121', buyer:'Vardhman Textiles',  seller:'Vasant Cotton Industries',   bales:140, ratePerBale:10, amount:1400, payTo:'Adilabad Ginners Association',   status:'cleared' },
  { no:'CHQ-26-0007', date:dDays(32), conf:'SC-26-0120', buyer:'Raymond Ltd.',       seller:'Sri Lakshmi Cotton Ginning', bales:120, ratePerBale:10, amount:1200, payTo:'Guntur Cotton Samiti',           status:'cleared' },
  { no:'CHQ-26-0006', date:dDays(34), conf:'SC-26-0119', buyer:'Arvind Mills Ltd.',  seller:'Patel Ginning Mills',        bales:360, ratePerBale:10, amount:3600, payTo:'Rajkot Cotton Association',      status:'cleared' },
  { no:'CHQ-26-0005', date:dDays(36), conf:'SC-26-0118', buyer:'Trident Group',      seller:'Vasant Cotton Industries',   bales:200, ratePerBale:10, amount:2000, payTo:'Adilabad Ginners Association',   status:'cleared' },
];

const ALLOWANCES = [
  { no:'ALW-26-0019', date:dDays(2),  type:'freight',  conf:'SC-26-0142', buyer:'Arvind Mills Ltd.',  seller:'Sri Lakshmi Cotton Ginning', description:'Freight charges from Guntur to Ahmedabad per contract terms',               amount:18500, createdBy:'Karthik R', status:'pending' },
  { no:'ALW-26-0018', date:dDays(3),  type:'handling', conf:'SC-26-0141', buyer:'Welspun India',      seller:'Patel Ginning Mills',        description:'Mill gate handling charges — 350 bales at ₹25/bale',                       amount:8750,  createdBy:'Karthik R', status:'applied' },
  { no:'ALW-26-0017', date:dDays(5),  type:'quality',  conf:'SC-26-0140', buyer:'Vardhman Textiles',  seller:'Vasant Cotton Industries',   description:'MCU-5 bales — staple length below contract specification, 22 bales',       amount:22000, createdBy:'Karthik R', status:'pending' },
  { no:'ALW-26-0016', date:dDays(8),  type:'loading',  conf:'SC-26-0138', buyer:'Trident Group',      seller:'Sri Lakshmi Cotton Ginning', description:'Station loading charges — open yard delivery per standing agreement',        amount:6000,  createdBy:'Karthik R', status:'applied' },
  { no:'ALW-26-0015', date:dDays(12), type:'other',    conf:'SC-26-0137', buyer:'Arvind Mills Ltd.',  seller:'Patel Ginning Mills',        description:'Miscellaneous charges per addendum dated 06 May 2026',                      amount:3200,  createdBy:'Karthik R', status:'applied' },
  { no:'ALW-26-0014', date:dDays(14), type:'freight',  conf:'SC-26-0136', buyer:'Welspun India',      seller:'Vasant Cotton Industries',   description:'Freight reimbursement — buyer arranged transport from gin point',            amount:11200, createdBy:'Karthik R', status:'applied' },
  { no:'ALW-26-0013', date:dDays(13), type:'freight',  conf:'SC-26-0133', buyer:'Trident Group',      seller:'Patel Ginning Mills',        description:'Freight from Rajkot to Barnala — 450 bales truck hire per standing rate',   amount:21600, createdBy:'Karthik R', status:'applied' },
  { no:'ALW-26-0012', date:dDays(19), type:'quality',  conf:'SC-26-0129', buyer:'Arvind Mills Ltd.',  seller:'Shree Krishna Cotex',        description:'Bunny variety — fibre uniformity below spec for 28 bales at Yavatmal',     amount:38400, createdBy:'Karthik R', status:'applied' },
  { no:'ALW-26-0011', date:dDays(22), type:'handling', conf:'SC-26-0127', buyer:'Welspun India',      seller:'Sri Lakshmi Cotton Ginning', description:'Mill gate handling charges — 320 bales at ₹25/bale, Anjar mill',           amount:8000,  createdBy:'Karthik R', status:'applied' },
  { no:'ALW-26-0010', date:dDays(16), type:'loading',  conf:'SC-26-0131', buyer:'Vardhman Textiles',  seller:'Sri Lakshmi Cotton Ginning', description:'Open yard loading charges at Guntur station — 250 bales',                   amount:5000,  createdBy:'Karthik R', status:'applied' },
  { no:'ALW-26-0009', date:dDays(20), type:'freight',  conf:'SC-26-0128', buyer:'Trident Group',      seller:'Vasant Cotton Industries',   description:'Freight from Adilabad to Barnala — 220 bales, buyer rate as agreed',       amount:15500, createdBy:'Karthik R', status:'applied' },
  { no:'ALW-26-0008', date:dDays(25), type:'quality',  conf:'SC-26-0125', buyer:'Vardhman Textiles',  seller:'Shree Krishna Cotex',        description:'DCH-32 bales — 14 bales below minimum fibre length at Ludhiana mill',     amount:18200, createdBy:'Karthik R', status:'applied' },
  { no:'ALW-26-0007', date:dDays(29), type:'handling', conf:'SC-26-0122', buyer:'Welspun India',      seller:'Patel Ginning Mills',        description:'Rajkot mill gate labour charges — 300 bales @ ₹25/bale',                  amount:7500,  createdBy:'Karthik R', status:'applied' },
  { no:'ALW-26-0006', date:dDays(35), type:'other',    conf:'SC-26-0119', buyer:'Arvind Mills Ltd.',  seller:'Patel Ginning Mills',        description:'Fumigation and pest control charges — Rajkot station, 360 bales',          amount:4800,  createdBy:'Karthik R', status:'applied' },
  { no:'ALW-26-0005', date:dDays(31), type:'freight',  conf:'SC-26-0121', buyer:'Vardhman Textiles',  seller:'Vasant Cotton Industries',   description:'Freight reimbursement — buyer arranged transport Adilabad to Ludhiana',    amount:9600,  createdBy:'Karthik R', status:'applied' },
  { no:'ALW-26-0004', date:dDays(37), type:'loading',  conf:'SC-26-0118', buyer:'Trident Group',      seller:'Vasant Cotton Industries',   description:'Station loading at Adilabad — 200 bales, standard charges as per contract', amount:3500,  createdBy:'Karthik R', status:'applied' },
];

const MILLWEIGHTS = [
  { no:'MW-26-0041', date:dDays(2),  conf:'SC-26-0142', delivery:'DL-26-0312', buyer:'Arvind Mills Ltd.',  bales:145, origNet:25428, millNet:25284, diff:-144, diffPct:-0.57, status:'accepted', notes:'Mill weight accepted within tolerance'          },
  { no:'MW-26-0040', date:dDays(3),  conf:'SC-26-0141', delivery:'DL-26-0311', buyer:'Welspun India',      bales:350, origNet:61330, millNet:61050, diff:-280, diffPct:-0.46, status:'accepted', notes:''                                               },
  { no:'MW-26-0039', date:dDays(4),  conf:'SC-26-0140', delivery:'DL-26-0310', buyer:'Vardhman Textiles',  bales:180, origNet:31600, millNet:31200, diff:-400, diffPct:-1.27, status:'disputed', notes:'Difference exceeds 1% — buyer raised objection'  },
  { no:'MW-26-0038', date:dDays(6),  conf:'SC-26-0138', delivery:'DL-26-0309', buyer:'Trident Group',      bales:80,  origNet:14040, millNet:13980, diff:-60,  diffPct:-0.43, status:'pending',  notes:'Mill certificate awaited'                       },
  { no:'MW-26-0037', date:dDays(7),  conf:'SC-26-0137', delivery:'DL-26-0308', buyer:'Arvind Mills Ltd.',  bales:400, origNet:70080, millNet:69780, diff:-300, diffPct:-0.43, status:'accepted', notes:''                                               },
  { no:'MW-26-0036', date:dDays(9),  conf:'SC-26-0136', delivery:'DL-26-0307', buyer:'Welspun India',      bales:160, origNet:28080, millNet:27940, diff:-140, diffPct:-0.50, status:'accepted', notes:''                                               },
  { no:'MW-26-0035', date:dDays(11), conf:'SC-26-0135', delivery:'DL-26-0306', buyer:'Raymond Ltd.',       bales:100, origNet:17520, millNet:17438, diff:-82,  diffPct:-0.47, status:'accepted', notes:''                                               },
  { no:'MW-26-0034', date:dDays(12), conf:'SC-26-0134', delivery:'DL-26-0305', buyer:'Arvind Mills Ltd.',  bales:200, origNet:35080, millNet:34924, diff:-156, diffPct:-0.44, status:'accepted', notes:''                                               },
  { no:'MW-26-0033', date:dDays(13), conf:'SC-26-0133', delivery:'DL-26-0304', buyer:'Trident Group',      bales:450, origNet:78840, millNet:78396, diff:-444, diffPct:-0.56, status:'accepted', notes:''                                               },
  { no:'MW-26-0032', date:dDays(15), conf:'SC-26-0132', delivery:'DL-26-0303', buyer:'Welspun India',      bales:140, origNet:24528, millNet:24312, diff:-216, diffPct:-0.88, status:'pending',  notes:'Awaiting final certificate from Yavatmal mill'  },
  { no:'MW-26-0031', date:dDays(16), conf:'SC-26-0131', delivery:'DL-26-0302', buyer:'Vardhman Textiles',  bales:250, origNet:43800, millNet:43326, diff:-474, diffPct:-1.08, status:'disputed', notes:'Variance over 1% — under review with buyer'     },
  { no:'MW-26-0030', date:dDays(17), conf:'SC-26-0130', delivery:'DL-26-0301', buyer:'Raymond Ltd.',       bales:60,  origNet:10512, millNet:10460, diff:-52,  diffPct:-0.49, status:'pending',  notes:'In transit — mill cert will be raised on arrival'},
  { no:'MW-26-0029', date:dDays(19), conf:'SC-26-0129', delivery:'DL-26-0300', buyer:'Arvind Mills Ltd.',  bales:380, origNet:66576, millNet:66276, diff:-300, diffPct:-0.45, status:'accepted', notes:''                                               },
  { no:'MW-26-0028', date:dDays(20), conf:'SC-26-0128', delivery:'DL-26-0299', buyer:'Trident Group',      bales:220, origNet:38544, millNet:38366, diff:-178, diffPct:-0.46, status:'accepted', notes:''                                               },
  { no:'MW-26-0027', date:dDays(22), conf:'SC-26-0127', delivery:'DL-26-0298', buyer:'Welspun India',      bales:320, origNet:56064, millNet:55762, diff:-302, diffPct:-0.54, status:'accepted', notes:''                                               },
  { no:'MW-26-0026', date:dDays(23), conf:'SC-26-0126', delivery:'DL-26-0297', buyer:'Raymond Ltd.',       bales:80,  origNet:14016, millNet:13958, diff:-58,  diffPct:-0.41, status:'accepted', notes:''                                               },
  { no:'MW-26-0025', date:dDays(25), conf:'SC-26-0125', delivery:'DL-26-0296', buyer:'Vardhman Textiles',  bales:160, origNet:28032, millNet:27816, diff:-216, diffPct:-0.77, status:'accepted', notes:''                                               },
  { no:'MW-26-0024', date:dDays(26), conf:'SC-26-0124', delivery:'DL-26-0295', buyer:'Arvind Mills Ltd.',  bales:300, origNet:52560, millNet:52034, diff:-526, diffPct:-1.00, status:'pending',  notes:'Borderline variance — cert under final review'  },
  { no:'MW-26-0023', date:dDays(28), conf:'SC-26-0123', delivery:'DL-26-0294', buyer:'Trident Group',      bales:220, origNet:38522, millNet:38350, diff:-172, diffPct:-0.45, status:'accepted', notes:''                                               },
  { no:'MW-26-0022', date:dDays(29), conf:'SC-26-0122', delivery:'DL-26-0293', buyer:'Welspun India',      bales:300, origNet:52530, millNet:52268, diff:-262, diffPct:-0.50, status:'accepted', notes:''                                               },
  { no:'MW-26-0021', date:dDays(31), conf:'SC-26-0121', delivery:'DL-26-0292', buyer:'Vardhman Textiles',  bales:140, origNet:24514, millNet:24390, diff:-124, diffPct:-0.51, status:'accepted', notes:''                                               },
  { no:'MW-26-0020', date:dDays(33), conf:'SC-26-0120', delivery:'DL-26-0291', buyer:'Raymond Ltd.',       bales:120, origNet:21036, millNet:20910, diff:-126, diffPct:-0.60, status:'accepted', notes:''                                               },
  { no:'MW-26-0019', date:dDays(35), conf:'SC-26-0119', delivery:'DL-26-0290', buyer:'Arvind Mills Ltd.',  bales:360, origNet:63072, millNet:62736, diff:-336, diffPct:-0.53, status:'accepted', notes:''                                               },
  { no:'MW-26-0018', date:dDays(37), conf:'SC-26-0118', delivery:'DL-26-0289', buyer:'Trident Group',      bales:200, origNet:35040, millNet:34882, diff:-158, diffPct:-0.45, status:'accepted', notes:''                                               },
];

const GST_RECEIPTS = [
  { no:'GSTR-26-0021', date:dDays(3),  buyer:'Welspun India',      seller:'Patel Ginning Mills',        conf:'SC-26-0141', invoice:'INV-26-0892', taxableAmt:19740000, gstRate:0, gstAmt:0, certNo:'GJ-2026-0341', status:'received', notes:'Raw cotton — 0% GST per notification' },
  { no:'GSTR-26-0020', date:dDays(4),  buyer:'Vardhman Textiles',  seller:'Vasant Cotton Industries',   conf:'SC-26-0140', invoice:'INV-26-0891', taxableAmt:10458000, gstRate:0, gstAmt:0, certNo:'TS-2026-0214', status:'received', notes:'' },
  { no:'GSTR-26-0019', date:dDays(6),  buyer:'Raymond Ltd.',       seller:'Shree Krishna Cotex',        conf:'SC-26-0139', invoice:'INV-26-0890', taxableAmt:7290000,  gstRate:0, gstAmt:0, certNo:'MH-2026-0092', status:'received', notes:'' },
  { no:'GSTR-26-0018', date:dDays(8),  buyer:'Arvind Mills Ltd.',  seller:'Patel Ginning Mills',        conf:'SC-26-0137', invoice:'INV-26-0889', taxableAmt:22448000, gstRate:0, gstAmt:0, certNo:null,           status:'pending',  notes:'Certificate pending from buyer' },
  { no:'GSTR-26-0017', date:dDays(9),  buyer:'Welspun India',      seller:'Vasant Cotton Industries',   conf:'SC-26-0136', invoice:'INV-26-0888', taxableAmt:9280000,  gstRate:0, gstAmt:0, certNo:'TS-2026-0198', status:'received', notes:'' },
  { no:'GSTR-26-0016', date:dDays(11), buyer:'Raymond Ltd.',       seller:'Shree Krishna Cotex',        conf:'SC-26-0135', invoice:'INV-26-0887', taxableAmt:5420000,  gstRate:0, gstAmt:0, certNo:'MH-2026-0081', status:'received', notes:'' },
  { no:'GSTR-26-0015', date:dDays(13), buyer:'Trident Group',      seller:'Patel Ginning Mills',        conf:'SC-26-0133', invoice:'INV-26-0886', taxableAmt:25200000, gstRate:0, gstAmt:0, certNo:'GJ-2026-0274', status:'received', notes:'' },
  { no:'GSTR-26-0014', date:dDays(15), buyer:'Welspun India',      seller:'Shree Krishna Cotex',        conf:'SC-26-0132', invoice:'INV-26-0885', taxableAmt:8540000,  gstRate:0, gstAmt:0, certNo:'MH-2026-0075', status:'received', notes:'' },
  { no:'GSTR-26-0013', date:dDays(16), buyer:'Vardhman Textiles',  seller:'Sri Lakshmi Cotton Ginning', conf:'SC-26-0131', invoice:'INV-26-0884', taxableAmt:13937500, gstRate:0, gstAmt:0, certNo:'AP-2026-0112', status:'received', notes:'' },
  { no:'GSTR-26-0012', date:dDays(19), buyer:'Arvind Mills Ltd.',  seller:'Shree Krishna Cotex',        conf:'SC-26-0129', invoice:'INV-26-0883', taxableAmt:21128000, gstRate:0, gstAmt:0, certNo:null,           status:'pending',  notes:'Certificate pending — invoice unpaid' },
  { no:'GSTR-26-0011', date:dDays(20), buyer:'Trident Group',      seller:'Vasant Cotton Industries',   conf:'SC-26-0128', invoice:'INV-26-0882', taxableAmt:12738000, gstRate:0, gstAmt:0, certNo:'TS-2026-0185', status:'received', notes:'' },
  { no:'GSTR-26-0010', date:dDays(22), buyer:'Welspun India',      seller:'Sri Lakshmi Cotton Ginning', conf:'SC-26-0127', invoice:'INV-26-0881', taxableAmt:17984000, gstRate:0, gstAmt:0, certNo:'AP-2026-0104', status:'received', notes:'Partial payment — GST cert issued for full invoice' },
  { no:'GSTR-26-0009', date:dDays(23), buyer:'Raymond Ltd.',       seller:'Patel Ginning Mills',        conf:'SC-26-0126', invoice:'INV-26-0880', taxableAmt:4304000,  gstRate:0, gstAmt:0, certNo:'GJ-2026-0261', status:'received', notes:'' },
  { no:'GSTR-26-0008', date:dDays(25), buyer:'Vardhman Textiles',  seller:'Shree Krishna Cotex',        conf:'SC-26-0125', invoice:'INV-26-0879', taxableAmt:9680000,  gstRate:0, gstAmt:0, certNo:'MH-2026-0069', status:'received', notes:'' },
  { no:'GSTR-26-0007', date:dDays(28), buyer:'Trident Group',      seller:'Shree Krishna Cotex',        conf:'SC-26-0123', invoice:'INV-26-0878', taxableAmt:12342000, gstRate:0, gstAmt:0, certNo:null,           status:'pending',  notes:'Certificate pending — invoice unpaid' },
  { no:'GSTR-26-0006', date:dDays(29), buyer:'Welspun India',      seller:'Patel Ginning Mills',        conf:'SC-26-0122', invoice:'INV-26-0877', taxableAmt:16905000, gstRate:0, gstAmt:0, certNo:'GJ-2026-0248', status:'received', notes:'' },
  { no:'GSTR-26-0005', date:dDays(31), buyer:'Vardhman Textiles',  seller:'Vasant Cotton Industries',   conf:'SC-26-0121', invoice:'INV-26-0876', taxableAmt:8148000,  gstRate:0, gstAmt:0, certNo:'TS-2026-0172', status:'received', notes:'Partial payment — GST cert issued for full invoice' },
  { no:'GSTR-26-0004', date:dDays(33), buyer:'Raymond Ltd.',       seller:'Sri Lakshmi Cotton Ginning', conf:'SC-26-0120', invoice:'INV-26-0875', taxableAmt:6480000,  gstRate:0, gstAmt:0, certNo:'AP-2026-0096', status:'received', notes:'' },
  { no:'GSTR-26-0003', date:dDays(35), buyer:'Arvind Mills Ltd.',  seller:'Patel Ginning Mills',        conf:'SC-26-0119', invoice:'INV-26-0874', taxableAmt:20160000, gstRate:0, gstAmt:0, certNo:null,           status:'pending',  notes:'Certificate pending — invoice unpaid' },
  { no:'GSTR-26-0002', date:dDays(37), buyer:'Trident Group',      seller:'Vasant Cotton Industries',   conf:'SC-26-0118', invoice:'INV-26-0873', taxableAmt:11520000, gstRate:0, gstAmt:0, certNo:'TS-2026-0158', status:'received', notes:'' },
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
