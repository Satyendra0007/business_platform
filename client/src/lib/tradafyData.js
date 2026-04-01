const DATA_KEY = 'tradafy-demo-data-v5';
const USER_KEY = 'tradafy-demo-user-v4';

const roleProfiles = {
  buyer: {
    name: 'Amina Hassan',
    company: 'FreshMart LLC',
    location: 'Dubai, UAE',
    title: 'Procurement Lead',
    avatar: 'AH',
  },
  supplier: {
    name: 'Ivan Petrov',
    company: 'UkrOil Group',
    location: 'Kyiv, Ukraine',
    title: 'Export Director',
    avatar: 'IP',
  },
  shipping_agent: {
    name: 'Lina Roy',
    company: 'Global Shipping Co',
    location: 'Singapore',
    title: 'Logistics Manager',
    avatar: 'LR',
  },
  admin: {
    name: 'Admin User',
    company: 'TRADAFY',
    location: 'Global',
    title: 'System Administrator',
    avatar: 'AU',
  },
};

const products = [
  {
    id: 'sunflower-oil',
    name: 'Sunflower Oil',
    category: 'Edible Oils',
    origin: 'Ukraine',
    supplierCompany: 'UkrOil Group',
    price: '$850 / MT',
    minOrder: '1,000 MT',
    description: 'Refined sunflower oil with export-ready documentation, ideal for wholesale grocery, food service, and industrial distribution.',
    leadTime: '15 to 20 days after agreement',
    specs: ['FFA 0.05% max', 'Moisture 0.10% max', 'Halal certified', 'Packed in flexitanks or drums'],
    badge: 'Most active deal',
  },
  {
    id: 'sugar-icumsa-45',
    name: 'Sugar ICUMSA 45',
    category: 'Commodities',
    origin: 'Brazil',
    supplierCompany: 'Brazil Sugar Co',
    price: '$500 / MT',
    minOrder: '5,000 MT',
    description: 'Bulk refined sugar for large import programs with SGS support and flexible shipment windows.',
    leadTime: '20 to 25 days after confirmation',
    specs: ['ICUMSA 45', 'Polarization 99.8%', 'Ocean freight support', 'Bulk and bagged options'],
    badge: 'High volume',
  },
  {
    id: 'steel-pipes',
    name: 'Steel Pipes',
    category: 'Metals',
    origin: 'Germany',
    supplierCompany: 'Steel Masters',
    price: '$1,200 / MT',
    minOrder: '100 MT',
    description: 'High-quality steel pipes for construction, water supply, and industrial applications with ISO certification.',
    leadTime: '30 to 45 days after order',
    specs: ['ASTM compliant', 'Custom diameters', 'Mill test certificates', 'Export packaging'],
    badge: 'Project cargo',
  },
  {
    id: 'olive-oil',
    name: 'Organic Olive Oil',
    category: 'Edible Oils',
    origin: 'Spain',
    supplierCompany: 'Mediterranean Farms',
    price: '$3,200 / MT',
    minOrder: '200 MT',
    description: 'Premium extra virgin olive oil for gourmet retail, hospitality, and private-label export programs.',
    leadTime: '12 to 18 days after label approval',
    specs: ['Extra virgin', 'Organic certified', 'Private label ready', 'Glass and bulk formats'],
    badge: 'Premium',
  },
];

const companies = [
  { id: 'freshmart', name: 'FreshMart LLC', role: 'buyer', location: 'Dubai, UAE', verified: true },
  { id: 'ukroil', name: 'UkrOil Group', role: 'supplier', location: 'Kyiv, Ukraine', verified: true },
  { id: 'brazil-sugar', name: 'Brazil Sugar Co', role: 'supplier', location: 'Sao Paulo, Brazil', verified: true },
  { id: 'steel-masters', name: 'Steel Masters', role: 'supplier', location: 'Essen, Germany', verified: true },
  { id: 'mediterranean-farms', name: 'Mediterranean Farms', role: 'supplier', location: 'Barcelona, Spain', verified: true },
  { id: 'global-shipping', name: 'Global Shipping Co', role: 'shipping_agent', location: 'Singapore', verified: true },
];

const statusSteps = [
  { key: 'inquiry', label: 'Inquiry' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'completed', label: 'Completed' },
];

const users = Object.entries(roleProfiles).map(([role, profile]) => ({ id: role, role, active: true, ...profile }));

const defaultRFQs = [
  {
    id: 'rfq-001',
    productId: 'sunflower-oil',
    productName: 'Sunflower Oil',
    buyerCompany: 'FreshMart LLC',
    supplierCompany: 'UkrOil Group',
    quantity: '2,500 MT',
    targetPrice: '$825 / MT',
    deliveryLocation: 'Jebel Ali, UAE',
    notes: 'Looking for a clean first shipment with flexible packing preference.',
    createdAt: '2026-03-10',
    status: 'converted',
    dealId: 'deal-001',
  },
  {
    id: 'rfq-002',
    productId: 'sugar-icumsa-45',
    productName: 'Sugar ICUMSA 45',
    buyerCompany: 'FreshMart LLC',
    supplierCompany: 'Brazil Sugar Co',
    quantity: '8,000 MT',
    targetPrice: '$495 / MT',
    deliveryLocation: 'Kandla, India',
    notes: 'Buyer requests shipment split over two windows with SGS verification.',
    createdAt: '2026-03-14',
    status: 'pending',
    dealId: null,
  },
];

const defaultDeals = [
  {
    id: 'deal-001',
    rfqId: 'rfq-001',
    productId: 'sunflower-oil',
    productName: 'Sunflower Oil',
    buyerCompany: 'FreshMart LLC',
    supplierCompany: 'UkrOil Group',
    shippingCompany: 'Global Shipping Co',
    quantity: '2,500 MT',
    price: '$830 / MT',
    status: 'shipping',
    deliveryLocation: 'Jebel Ali, UAE',
    deliveryDate: '2026-04-22',
    shipment: {
      containerNumber: 'MSCU-482190-3',
      shippingStatus: 'In Transit',
      mode: 'Sea Freight',
      eta: '2026-04-22',
    },
    timeline: [
      { id: 't1', title: 'Inquiry opened', description: 'Buyer created RFQ and supplier details were attached automatically.', date: '2026-03-10' },
      { id: 't2', title: 'Negotiation aligned', description: 'Buyer and supplier aligned on quantity, pricing, and documentation.', date: '2026-03-11' },
      { id: 't3', title: 'Shipping started', description: 'Shipping team booked cargo and moved the deal into shipment execution.', date: '2026-03-18' },
    ],
    messages: [
      { id: 'm1', sender: 'Amina Hassan', body: 'Please confirm updated ETA once vessel booking is finalized.', date: '2026-03-18' },
      { id: 'm2', sender: 'Lina Roy', body: 'Booking is in progress and I will post the vessel details today.', date: '2026-03-19' },
    ],
  },
];

const safeRead = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
};

const saveDemoData = () => {
  const demoData = {
    products,
    companies,
    roleProfiles,
    rfqs: defaultRFQs,
    deals: defaultDeals,
    users,
    statusSteps,
  };
  localStorage.setItem(DATA_KEY, JSON.stringify(demoData));
  return demoData;
};

const loadDemoData = () => safeRead(DATA_KEY);

const ensureSeedData = () => {
  const existing = loadDemoData();
  if (existing?.products && existing?.rfqs && existing?.deals) return existing;
  return saveDemoData();
};

const getData = () => ensureSeedData();

const setData = (updater) => {
  const next = updater(getData());
  localStorage.setItem(DATA_KEY, JSON.stringify(next));
  return next;
};

const getCurrentUser = () => safeRead(USER_KEY);

const setCurrentUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearCurrentUser = () => {
  localStorage.removeItem(USER_KEY);
};

const loginAsRole = (role) => {
  const user = { role, ...roleProfiles[role] };
  setCurrentUser(user);
  return user;
};

const getAllProducts = () => getData().products;

const getProductById = (id) => getAllProducts().find((product) => product.id === id);

const getProductsForUser = (user) => {
  if (!user || user.role === 'buyer' || user.role === 'shipping_agent' || user.role === 'admin') return getAllProducts();
  return getAllProducts().filter((product) => product.supplierCompany === user.company);
};

const getAllCompanies = () => getData().companies;

const getRFQs = () => getData().rfqs;

const getRFQsForUser = (user) => {
  if (!user) return [];
  if (user.role === 'buyer') return getRFQs().filter((rfq) => rfq.buyerCompany === user.company);
  if (user.role === 'supplier') return getRFQs().filter((rfq) => rfq.supplierCompany === user.company);
  if (user.role === 'admin') return getRFQs();
  return getRFQs().filter((rfq) => rfq.dealId);
};

const getIncomingRFQsForUser = (user) => {
  if (!user) return [];
  return getRFQs().filter((rfq) => rfq.supplierCompany === user.company);
};

const createRFQ = (productId, form, user) => {
  const product = getProductById(productId);
  if (!product || !user) return null;

  const rfq = {
    id: `rfq-${Date.now()}`,
    productId,
    productName: product.name,
    buyerCompany: user.company,
    supplierCompany: product.supplierCompany,
    quantity: form.quantity,
    targetPrice: form.targetPrice,
    deliveryLocation: form.deliveryLocation,
    notes: form.notes,
    createdAt: new Date().toISOString().slice(0, 10),
    status: 'pending',
    dealId: null,
  };

  setData((current) => ({ ...current, rfqs: [rfq, ...current.rfqs] }));
  return rfq;
};

const getDeals = () => getData().deals;

const getDealsForUser = (user) => {
  if (!user) return [];
  if (user.role === 'buyer') return getDeals().filter((deal) => deal.buyerCompany === user.company);
  if (user.role === 'supplier') return getDeals().filter((deal) => deal.supplierCompany === user.company);
  if (user.role === 'shipping_agent') return getDeals().filter((deal) => deal.shippingCompany === user.company);
  return getDeals();
};

const getDealById = (id) => getDeals().find((deal) => deal.id === id);

const convertRFQToDeal = (rfqId) => {
  const data = getData();
  const rfq = data.rfqs.find((item) => item.id === rfqId);
  if (!rfq) return null;
  const existing = data.deals.find((deal) => deal.rfqId === rfqId);
  if (existing) return existing;

  const today = new Date().toISOString().slice(0, 10);
  const deal = {
    id: `deal-${Date.now()}`,
    rfqId: rfq.id,
    productId: rfq.productId,
    productName: rfq.productName,
    buyerCompany: rfq.buyerCompany,
    supplierCompany: rfq.supplierCompany,
    shippingCompany: 'Global Shipping Co',
    quantity: rfq.quantity,
    price: rfq.targetPrice || getProductById(rfq.productId)?.price || '$0',
    status: 'inquiry',
    deliveryLocation: rfq.deliveryLocation,
    deliveryDate: '2026-05-05',
    shipment: {
      containerNumber: '',
      shippingStatus: 'Preparing Shipment',
      mode: 'Sea Freight',
      eta: '2026-05-05',
    },
    timeline: [
      { id: `timeline-${Date.now()}-1`, title: 'Deal created', description: 'Buyer converted the RFQ into a shared deal workspace for both parties.', date: today },
    ],
    messages: [
      { id: `message-${Date.now()}-1`, sender: 'System', body: 'Deal workspace created. Chat, timeline, and shipment updates are now active.', date: today },
    ],
  };

  setData((current) => ({
    ...current,
    rfqs: current.rfqs.map((item) => (item.id === rfqId ? { ...item, status: 'converted', dealId: deal.id } : item)),
    deals: [deal, ...current.deals],
  }));

  return deal;
};

const sendDealMessage = (dealId, sender, body) => {
  setData((current) => ({
    ...current,
    deals: current.deals.map((deal) =>
      deal.id === dealId
        ? {
            ...deal,
            messages: [...deal.messages, { id: `message-${Date.now()}`, sender, body, date: new Date().toISOString().slice(0, 10) }],
          }
        : deal
    ),
  }));
};

const updateDealStatus = (dealId, status) => {
  const label = statusSteps.find((step) => step.key === status)?.label || status;
  setData((current) => ({
    ...current,
    deals: current.deals.map((deal) =>
      deal.id === dealId
        ? {
            ...deal,
            status,
            timeline: [{ id: `timeline-${Date.now()}`, title: label, description: `Deal moved to ${label}.`, date: new Date().toISOString().slice(0, 10) }, ...deal.timeline],
          }
        : deal
    ),
  }));
};

const moveDealToNextStep = (dealId) => {
  const deal = getDealById(dealId);
  if (!deal) return null;
  const currentIndex = statusSteps.findIndex((step) => step.key === deal.status);
  const next = statusSteps[Math.min(currentIndex + 1, statusSteps.length - 1)];
  if (!next || next.key === deal.status) return deal;
  updateDealStatus(dealId, next.key);
  return getDealById(dealId);
};

const updateShipmentDetails = (dealId, shipment) => {
  setData((current) => ({
    ...current,
    deals: current.deals.map((deal) =>
      deal.id === dealId
        ? {
            ...deal,
            shipment: {
              ...deal.shipment,
              ...shipment,
            },
            timeline: [
              {
                id: `timeline-${Date.now()}`,
                title: 'Shipment updated',
                description: `Shipment details were updated${shipment.shippingStatus ? ` to ${shipment.shippingStatus}` : ''}.`,
                date: new Date().toISOString().slice(0, 10),
              },
              ...deal.timeline,
            ],
          }
        : deal
    ),
  }));
};

const toggleUserActive = (userId) => {
  setData((current) => ({
    ...current,
    users: current.users.map((user) => (user.id === userId ? { ...user, active: !user.active } : user)),
  }));
};

const toggleCompanyVerified = (companyId) => {
  setData((current) => ({
    ...current,
    companies: current.companies.map((company) => (company.id === companyId ? { ...company, verified: !company.verified } : company)),
  }));
};

const getAdminSnapshot = () => {
  const data = getData();
  return {
    users: data.users,
    companies: data.companies,
    rfqs: data.rfqs,
    deals: data.deals,
  };
};

const getStatusSteps = () => getData().statusSteps || statusSteps;

const formatDate = (dateString) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString));

export {
  clearCurrentUser,
  convertRFQToDeal,
  createRFQ,
  ensureSeedData,
  formatDate,
  getAdminSnapshot,
  getAllCompanies,
  getAllProducts,
  getCurrentUser,
  getDealById,
  getDealsForUser,
  getIncomingRFQsForUser,
  getProductById,
  getProductsForUser,
  getRFQsForUser,
  getStatusSteps,
  loadDemoData,
  loginAsRole,
  moveDealToNextStep,
  sendDealMessage,
  toggleCompanyVerified,
  toggleUserActive,
  updateDealStatus,
  updateShipmentDetails,
};
