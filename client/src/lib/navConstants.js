import { LayoutDashboard, Package, ReceiptText, BriefcaseBusiness, ShieldCheck, ShipWheel } from 'lucide-react';

export const privatePaths = ['/dashboard', '/request-quote', '/my-rfqs', '/incoming-rfqs', '/deals', '/deal', '/transport-bids', '/admin', '/supplier/products'];

export const navByRole = {
  buyer: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Products', path: '/products' },
    { label: 'My RFQs', path: '/my-rfqs' },
    { label: 'My Deals', path: '/deals' },
    { label: 'Transport Bids', path: '/transport-bids' },
  ],
  supplier: [
    { label: 'Dashboard',     path: '/dashboard' },
    { label: 'Products',      path: '/products' },
    { label: 'Incoming RFQs', path: '/incoming-rfqs' },
    { label: 'My Deals',      path: '/deals' },
    { label: 'Transport Bids',path: '/transport-bids' },
  ],
  shipping_agent: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Transport Bids', path: '/transport-bids' },
    { label: 'Shipment Deals', path: '/deals' },
    { label: 'Products', path: '/products' },
  ],
  admin: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Admin Workspace', path: '/admin' },
    { label: 'Products', path: '/products' },
  ],
};

export const pageCopy = {
  buyer: 'Buyer Workspace',
  supplier: 'Supplier Workspace',
  shipping_agent: 'Shipping Workspace',
  admin: 'Admin Control',
};

export const productGradients = [
  'from-amber-200 via-orange-100 to-white',
  'from-sky-200 via-cyan-100 to-white',
  'from-slate-200 via-zinc-100 to-white',
  'from-emerald-200 via-lime-100 to-white',
];

export function getNavIcon(path) {
  if (path === '/dashboard') return LayoutDashboard;
  if (path === '/products' || path === '/supplier/products') return Package;
  if (path === '/my-rfqs' || path === '/incoming-rfqs') return ReceiptText;
  if (path === '/transport-bids') return ShipWheel;
  if (path === '/deals' || path === '/deal') return BriefcaseBusiness;
  if (path === '/admin') return ShieldCheck;
  return LayoutDashboard;
}
