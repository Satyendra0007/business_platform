import heroShip from '../assets/hero-ship.png';
import productOilBulk from '../assets/product-oil-bulk.jpg';
import productPipesBulk from '../assets/product-pipes-bulk.jpg';
import productAgriBulk from '../assets/product-agri-bulk.png';
import productMetalsBulk from '../assets/product-metals-bulk.png';
import productHeavyMachineryBulk from '../assets/product-heavy-machinery-bulk.png';
import productElectronicsBulk from '../assets/product-electronics-bulk.png';
import productApparelBulk from '../assets/product-apparel-bulk.png';
import productHomewareBulk from '../assets/product-homeware-bulk.png';
import productHealthBeautyA from '../assets/product-health-beauty-a.png';
import productHealthBeautyB from '../assets/product-health-beauty-b.png';
import productSugarGemini from '../assets/product-sugar-gemini.png';
import productOliveGemini from '../assets/product-olive-gemini.png';

const productVisuals = {
  'sunflower-oil': {
    image: productOilBulk,
    alt: 'Bulk sunflower oil export inventory',
    accent: 'from-amber-500/20 via-white to-amber-500/10',
  },
  'sugar-icumsa-45': {
    image: productSugarGemini,
    alt: 'Bulk sugar export bags staged at port beside cargo vessel',
    accent: 'from-blue-500/20 via-white to-blue-500/10',
  },
  'steel-pipes': {
    image: productPipesBulk,
    alt: 'Industrial steel pipes prepared for export shipment',
    accent: 'from-slate-500/20 via-white to-slate-500/10',
  },
  'olive-oil': {
    image: productOliveGemini,
    alt: 'Extra virgin olive oil export pallets in warehouse with shipping container',
    accent: 'from-emerald-500/20 via-white to-emerald-500/10',
  },
  'agri-commodities': {
    image: productAgriBulk,
    alt: 'Bulk agricultural commodity assortment for export',
    accent: 'from-lime-500/20 via-white to-amber-500/10',
  },
  'metals-alloys': {
    image: productMetalsBulk,
    alt: 'Metals and alloy warehouse inventory',
    accent: 'from-slate-500/20 via-white to-zinc-500/10',
  },
  'heavy-machinery': {
    image: productHeavyMachineryBulk,
    alt: 'Heavy machinery systems in industrial export facility',
    accent: 'from-sky-500/20 via-white to-slate-500/10',
  },
  'consumer-electronics': {
    image: productElectronicsBulk,
    alt: 'Consumer electronics lots and components arranged for bulk export',
    accent: 'from-cyan-500/20 via-white to-blue-500/10',
  },
  'bulk-apparel': {
    image: productApparelBulk,
    alt: 'Bulk apparel and fabrics showroom for export sourcing',
    accent: 'from-fuchsia-500/15 via-white to-rose-500/10',
  },
  'homeware-export': {
    image: productHomewareBulk,
    alt: 'Homeware export collection with kitchen and lifestyle products',
    accent: 'from-indigo-500/15 via-white to-sky-500/10',
  },
  'cosmetics-private-label': {
    image: productHealthBeautyA,
    alt: 'Private label cosmetics and beauty export collection',
    accent: 'from-blue-500/15 via-white to-cyan-500/10',
  },
  'personal-care-bulk': {
    image: productHealthBeautyB,
    alt: 'Bulk personal care essentials for export',
    accent: 'from-sky-500/15 via-white to-blue-500/10',
  },
};

export function getProductVisual(productId) {
  const visual = productVisuals[productId] || {
    image: heroShip,
    alt: 'Bulk Cargo Logistics',
    accent: 'from-slate-100 via-white to-slate-50',
  };
  return visual;
}
