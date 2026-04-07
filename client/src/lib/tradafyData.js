const DATA_KEY = 'tradafy-demo-data-v7';
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
    name: 'Extra Virgin Olive Oil',
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
  {
    id: 'agri-commodities',
    name: 'Agri Commodities Pack',
    category: 'Food & Agriculture',
    origin: 'India',
    supplierCompany: 'Global Agri Solutions',
    price: '$620 / MT',
    minOrder: '800 MT',
    description: 'Mixed agricultural export program including grains, rice, corn, edible oils, and dry pantry staples for wholesale importers.',
    leadTime: '14 to 20 days after booking',
    specs: ['Bulk grains and rice', 'Export packing ready', 'Flexible shipment mix', 'Inspection support available'],
    badge: 'Fast moving',
  },
  {
    id: 'metals-alloys',
    name: 'Metals & Alloy Inventory',
    category: 'Metals & Construction',
    origin: 'Turkey',
    supplierCompany: 'Anatolia Metals',
    price: '$1,480 / MT',
    minOrder: '2,000 MT',
    description: 'Bulk metals and alloy inventory for industrial buyers needing sheets, coils, rods, and mixed warehouse-ready stock.',
    leadTime: '18 to 28 days after confirmation',
    specs: ['Sheet, rod, and coil formats', 'Warehouse consolidation', 'Export certificates', 'Industrial-grade packaging'],
    badge: 'Warehouse stock',
  },
  {
    id: 'heavy-machinery',
    name: 'Heavy Machinery Systems',
    category: 'Industrial Equipment',
    origin: 'Japan',
    supplierCompany: 'Industrial Solutions Global',
    price: '$18,000 / unit',
    minOrder: '10 Units',
    description: 'Heavy machinery export packages for infrastructure, factory, and industrial service programs with parts support.',
    leadTime: '30 to 45 days after technical approval',
    specs: ['Industrial machines and tooling', 'Spare parts support', 'Export crating', 'Technical documentation included'],
    badge: 'Industrial priority',
  },
  {
    id: 'consumer-electronics',
    name: 'Consumer Electronics Lots',
    category: 'Electronics',
    origin: 'Shenzhen',
    supplierCompany: 'Pacific Circuit Supply',
    price: '$95 / unit',
    minOrder: '2,500 Units',
    description: 'Bulk electronics lots spanning mobile devices, audio accessories, smart components, and export-ready consumer SKUs.',
    leadTime: '10 to 18 days after PO release',
    specs: ['Multi-category electronics', 'Retail and bulk packaging', 'QC inspection available', 'OEM/ODM support'],
    badge: 'High demand',
  },
  {
    id: 'bulk-apparel',
    name: 'Bulk Apparel & Fabrics',
    category: 'Textiles & Apparel',
    origin: 'Bangladesh',
    supplierCompany: 'Dhaka Apparel Export',
    price: '$14 / piece',
    minOrder: '20,000 Pieces',
    description: 'Bulk apparel and textile programs covering garments, fabrics, and export production runs for retail sourcing teams.',
    leadTime: '25 to 35 days after tech-pack approval',
    specs: ['Garments and fabric rolls', 'Private label production', 'Color assortment support', 'Retail export packaging'],
    badge: 'Retail ready',
  },
  {
    id: 'homeware-export',
    name: 'Homeware Export Collection',
    category: 'Home & Kitchen',
    origin: 'Vietnam',
    supplierCompany: 'Global Homeware Trade',
    price: '$22 / set',
    minOrder: '3,000 Sets',
    description: 'Premium homeware export assortment with cookware, tableware, appliances, and coordinated retail-ready sets.',
    leadTime: '16 to 24 days after assortment confirmation',
    specs: ['Kitchenware and tableware', 'Appliance bundles', 'Retail-ready cartonization', 'Mixed container programs'],
    badge: 'Lifestyle export',
  },
  {
    id: 'cosmetics-private-label',
    name: 'Private Label Cosmetics',
    category: 'Health & Beauty',
    origin: 'South Korea',
    supplierCompany: 'Aqua Cosmetics Export',
    price: '$7.20 / unit',
    minOrder: '15,000 Units',
    description: 'Private-label beauty assortment including skincare, makeup, and personal-care export batches with branding support.',
    leadTime: '12 to 20 days after artwork approval',
    specs: ['Private-label SKUs', 'Skincare and makeup mix', 'Export cartonization', 'Compliance documentation'],
    badge: 'Brandable',
  },
  {
    id: 'personal-care-bulk',
    name: 'Personal Care Bulk Essentials',
    category: 'Health & Beauty',
    origin: 'UAE',
    supplierCompany: 'Apollo Care Goods',
    price: '$4.80 / unit',
    minOrder: '10,000 Units',
    description: 'Bulk personal-care export line with sanitizers, soaps, shampoos, and daily-use retail packs for international distribution.',
    leadTime: '8 to 14 days after confirmation',
    specs: ['Soap and sanitizer lines', 'Shampoo and lotion packs', 'Retail and wholesale formats', 'Fast replenishment'],
    badge: 'High rotation',
  },
];

const companies = [
  { id: 'freshmart', name: 'FreshMart LLC', role: 'buyer', location: 'Dubai, UAE', verified: true },
  { id: 'ukroil', name: 'UkrOil Group', role: 'supplier', location: 'Kyiv, Ukraine', verified: true },
  { id: 'brazil-sugar', name: 'Brazil Sugar Co', role: 'supplier', location: 'Sao Paulo, Brazil', verified: true },
  { id: 'steel-masters', name: 'Steel Masters', role: 'supplier', location: 'Essen, Germany', verified: true },
  { id: 'mediterranean-farms', name: 'Mediterranean Farms', role: 'supplier', location: 'Barcelona, Spain', verified: true },
  { id: 'global-agri-solutions', name: 'Global Agri Solutions', role: 'supplier', location: 'Mumbai, India', verified: true },
  { id: 'anatolia-metals', name: 'Anatolia Metals', role: 'supplier', location: 'Istanbul, Turkey', verified: true },
  { id: 'industrial-solutions-global', name: 'Industrial Solutions Global', role: 'supplier', location: 'Osaka, Japan', verified: true },
  { id: 'pacific-circuit-supply', name: 'Pacific Circuit Supply', role: 'supplier', location: 'Shenzhen, China', verified: true },
  { id: 'dhaka-apparel-export', name: 'Dhaka Apparel Export', role: 'supplier', location: 'Dhaka, Bangladesh', verified: true },
  { id: 'global-homeware-trade', name: 'Global Homeware Trade', role: 'supplier', location: 'Ho Chi Minh City, Vietnam', verified: true },
  { id: 'aqua-cosmetics-export', name: 'Aqua Cosmetics Export', role: 'supplier', location: 'Seoul, South Korea', verified: true },
  { id: 'apollo-care-goods', name: 'Apollo Care Goods', role: 'supplier', location: 'Dubai, UAE', verified: true },
  { id: 'global-shipping', name: 'Global Shipping Co', role: 'shipping_agent', location: 'Singapore', verified: true },
  { id: 'oceanbridge', name: 'OceanBridge Freight', role: 'shipping_agent', location: 'Rotterdam, Netherlands', verified: true },
  { id: 'bluewave', name: 'BlueWave Cargo', role: 'shipping_agent', location: 'Dubai, UAE', verified: true },
];

const statusSteps = [
  { key: 'inquiry', label: 'Inquiry' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'transport-bidding', label: 'Transport Bidding' },
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
    shippingCompany: '',
    quantity: '2,500 MT',
    price: '$830 / MT',
    status: 'transport-bidding',
    deliveryLocation: 'Jebel Ali, UAE',
    deliveryDate: '2026-04-22',
    transport: {
      lane: 'Odesa Port, Ukraine -> Jebel Ali, UAE',
      cargoReadyDate: '2026-04-12',
      preferredMode: 'Sea Freight',
      incoterm: 'CIF Jebel Ali',
      biddingClosesOn: '2026-04-10',
      acceptedBidId: '',
      bids: [
        {
          id: 'bid-001',
          company: 'OceanBridge Freight',
          contactName: 'Sophie van Dijk',
          price: '$118 / MT',
          transitTime: '19 days',
          mode: 'Sea Freight',
          validUntil: '2026-04-10',
          notes: 'Includes port handling, documentation, and cargo insurance coordination.',
          status: 'submitted',
          createdAt: '2026-04-06',
        },
        {
          id: 'bid-002',
          company: 'BlueWave Cargo',
          contactName: 'Omar Rahman',
          price: '$124 / MT',
          transitTime: '16 days',
          mode: 'Sea Freight Express',
          validUntil: '2026-04-09',
          notes: 'Priority loading window with direct vessel allocation.',
          status: 'submitted',
          createdAt: '2026-04-07',
        },
      ],
    },
    shipment: {
      containerNumber: '',
      shippingStatus: 'Waiting for carrier bids',
      mode: 'Sea Freight',
      eta: '2026-04-22',
    },
    timeline: [
      { id: 't1', title: 'Inquiry opened', description: 'Buyer created RFQ and supplier details were attached automatically.', date: '2026-03-10' },
      { id: 't2', title: 'Negotiation aligned', description: 'Buyer and supplier aligned on quantity, pricing, and documentation.', date: '2026-03-11' },
      { id: 't3', title: 'Transport tender opened', description: 'Approved deal is now collecting freight bids from verified shipping agents.', date: '2026-04-07' },
    ],
    messages: [
      { id: 'm1', sender: 'Amina Hassan', body: 'Commercial terms are signed. We are now inviting shipping agents to quote the transport lane.', date: '2026-04-07' },
      { id: 'm2', sender: 'System', body: 'Transport bidding is live. Buyer and supplier can compare freight offers before booking the shipment.', date: '2026-04-07' },
    ],
  },
  {
    id: 'deal-002',
    rfqId: 'rfq-legacy-002',
    productId: 'steel-pipes',
    productName: 'Steel Pipes',
    buyerCompany: 'FreshMart LLC',
    supplierCompany: 'Steel Masters',
    shippingCompany: 'Global Shipping Co',
    quantity: '1,000 MT',
    price: '$1,180 / MT',
    status: 'shipping',
    deliveryLocation: 'Mundra Port, India',
    deliveryDate: '2026-04-29',
    transport: {
      lane: 'Hamburg, Germany -> Mundra Port, India',
      cargoReadyDate: '2026-04-01',
      preferredMode: 'Sea Freight',
      incoterm: 'CFR Mundra',
      biddingClosesOn: '2026-03-27',
      acceptedBidId: 'bid-003',
      bids: [
        {
          id: 'bid-003',
          company: 'Global Shipping Co',
          contactName: 'Lina Roy',
          price: '$146 / MT',
          transitTime: '24 days',
          mode: 'Sea Freight',
          validUntil: '2026-03-27',
          notes: 'Carrier selected with consolidated export handling and customs support.',
          status: 'accepted',
          createdAt: '2026-03-26',
        },
      ],
    },
    shipment: {
      containerNumber: 'MSCU-482190-3',
      shippingStatus: 'In Transit',
      mode: 'Sea Freight',
      eta: '2026-04-29',
    },
    timeline: [
      { id: 't4', title: 'Inquiry opened', description: 'Buyer requested export-ready steel pipes with delivery to India.', date: '2026-03-19' },
      { id: 't5', title: 'Negotiation aligned', description: 'Commercial terms and inspection requirements were aligned.', date: '2026-03-22' },
      { id: 't6', title: 'Carrier selected', description: 'Global Shipping Co won the freight bid and confirmed vessel planning.', date: '2026-03-26' },
      { id: 't7', title: 'Shipping started', description: 'Cargo moved into live shipment execution with container tracking enabled.', date: '2026-04-02' },
    ],
    messages: [
      { id: 'm3', sender: 'Ivan Petrov', body: 'Mill certificates are ready. Please keep the buyer posted as soon as the container numbers are assigned.', date: '2026-04-01' },
      { id: 'm4', sender: 'Lina Roy', body: 'Container release is complete. Tracking will stay updated inside this deal workspace.', date: '2026-04-02' },
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

const createDealFromProduct = (productId, user) => {
  const product = getProductById(productId);
  if (!product || !user) return null;

  const existing = getDeals().find(
    (deal) =>
      deal.productId === productId &&
      deal.buyerCompany === user.company &&
      deal.status !== 'completed'
  );
  if (existing) return existing;

  const today = new Date().toISOString().slice(0, 10);
  const deal = {
    id: `deal-${Date.now()}`,
    rfqId: null,
    productId: product.id,
    productName: product.name,
    buyerCompany: user.company,
    supplierCompany: product.supplierCompany,
    shippingCompany: '',
    quantity: product.minOrder,
    price: product.price,
    status: 'inquiry',
    deliveryLocation: user.location || 'Destination to be confirmed',
    deliveryDate: '2026-05-20',
    transport: {
      lane: `${product.origin} -> ${user.location || 'Destination to be confirmed'}`,
      cargoReadyDate: '2026-05-10',
      preferredMode: 'Sea Freight',
      incoterm: 'CIF',
      biddingClosesOn: '2026-05-02',
      acceptedBidId: '',
      bids: [],
    },
    shipment: {
      containerNumber: '',
      shippingStatus: 'Awaiting commercial approval',
      mode: 'Sea Freight',
      eta: '2026-05-20',
    },
    timeline: [
      {
        id: `timeline-${Date.now()}-product`,
        title: 'Deal opened from product catalog',
        description: `${user.name} opened a live deal workspace directly from ${product.name}. Commercial details were prefilled from the product listing.`,
        date: today,
      },
    ],
    messages: [
      {
        id: `message-${Date.now()}-product`,
        sender: 'System',
        body: `Deal workspace created from product listing. Supplier ${product.supplierCompany}, origin ${product.origin}, target commercial terms, and shipment planning are ready for collaboration.`,
        date: today,
      },
    ],
  };

  setData((current) => ({
    ...current,
    deals: [deal, ...current.deals],
  }));

  return deal;
};

const getTransportBidOpportunities = (user) => {
  const deals = getDeals();
  if (!user) return [];
  if (user.role === 'shipping_agent') {
    return deals.filter((deal) => deal.status === 'transport-bidding');
  }
  if (user.role === 'buyer') {
    return deals.filter((deal) => deal.buyerCompany === user.company && deal.transport?.bids?.length);
  }
  if (user.role === 'supplier') {
    return deals.filter((deal) => deal.supplierCompany === user.company && deal.transport?.bids?.length);
  }
  return deals.filter((deal) => deal.transport?.bids?.length);
};

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
    shippingCompany: '',
    quantity: rfq.quantity,
    price: rfq.targetPrice || getProductById(rfq.productId)?.price || '$0',
    status: 'inquiry',
    deliveryLocation: rfq.deliveryLocation,
    deliveryDate: '2026-05-05',
    transport: {
      lane: `${product.origin} -> ${rfq.deliveryLocation}`,
      cargoReadyDate: '2026-05-01',
      preferredMode: 'Sea Freight',
      incoterm: 'CIF',
      biddingClosesOn: '2026-04-25',
      acceptedBidId: '',
      bids: [],
    },
    shipment: {
      containerNumber: '',
      shippingStatus: 'Awaiting transport tender',
      mode: 'Sea Freight',
      eta: '2026-05-05',
    },
    timeline: [
      { id: `timeline-${Date.now()}-1`, title: 'Deal created', description: 'Buyer converted the RFQ into a shared deal workspace for both parties.', date: today },
    ],
    messages: [
      { id: `message-${Date.now()}-1`, sender: 'System', body: 'Deal workspace created. Once commercial terms are agreed, shipping agents can submit transport bids here.', date: today },
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
  if (next.key === 'shipping' && !deal.transport?.acceptedBidId) return deal;
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

const submitTransportBid = (dealId, bid, user) => {
  const today = new Date().toISOString().slice(0, 10);
  setData((current) => ({
    ...current,
    deals: current.deals.map((deal) => {
      if (deal.id !== dealId) return deal;

      const nextBid = {
        id: `bid-${Date.now()}`,
        company: user.company,
        contactName: user.name,
        price: bid.price,
        transitTime: bid.transitTime,
        mode: bid.mode,
        validUntil: bid.validUntil,
        notes: bid.notes,
        status: 'submitted',
        createdAt: today,
      };

      const withoutExisting = (deal.transport?.bids || []).filter((item) => item.company !== user.company);
      return {
        ...deal,
        transport: {
          ...deal.transport,
          bids: [nextBid, ...withoutExisting],
        },
        timeline: [
          {
            id: `timeline-${Date.now()}`,
            title: 'Transport bid submitted',
            description: `${user.company} submitted a freight offer for ${bid.price} with ${bid.transitTime} transit.`,
            date: today,
          },
          ...deal.timeline,
        ],
      };
    }),
  }));
};

const acceptTransportBid = (dealId, bidId, actorName = 'System') => {
  const today = new Date().toISOString().slice(0, 10);
  setData((current) => ({
    ...current,
    deals: current.deals.map((deal) => {
      if (deal.id !== dealId) return deal;
      const acceptedBid = (deal.transport?.bids || []).find((bid) => bid.id === bidId);
      if (!acceptedBid) return deal;

      return {
        ...deal,
        status: 'shipping',
        shippingCompany: acceptedBid.company,
        transport: {
          ...deal.transport,
          acceptedBidId: bidId,
          bids: (deal.transport?.bids || []).map((bid) => ({
            ...bid,
            status: bid.id === bidId ? 'accepted' : 'submitted',
          })),
        },
        shipment: {
          ...deal.shipment,
          mode: acceptedBid.mode || deal.shipment?.mode || 'Sea Freight',
          shippingStatus: 'Carrier Selected',
        },
        timeline: [
          {
            id: `timeline-${Date.now()}`,
            title: 'Transport bid awarded',
            description: `${actorName} accepted ${acceptedBid.company}'s offer at ${acceptedBid.price}. Shipment execution is now live.`,
            date: today,
          },
          ...deal.timeline,
        ],
        messages: [
          ...deal.messages,
          {
            id: `message-${Date.now()}`,
            sender: 'System',
            body: `${acceptedBid.company} won the transport bid. Shipment coordination has started inside this deal workspace.`,
            date: today,
          },
        ],
      };
    }),
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
  createDealFromProduct,
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
  getTransportBidOpportunities,
  loadDemoData,
  loginAsRole,
  moveDealToNextStep,
  acceptTransportBid,
  sendDealMessage,
  submitTransportBid,
  toggleCompanyVerified,
  toggleUserActive,
  updateDealStatus,
  updateShipmentDetails,
};
