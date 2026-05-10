const ACCENT_MAP = {
  'Food & Agriculture': 'from-emerald-400/20 to-emerald-600/10',
  'Metals & Mining': 'from-slate-400/20 to-slate-600/10',
  'Energy & Petrochemicals': 'from-amber-400/20 to-amber-600/10',
  'Industrial Equipment': 'from-sky-400/20 to-sky-600/10',
  'Electronics & Technology': 'from-violet-400/20 to-violet-600/10',
  'Textiles & Apparel': 'from-pink-400/20 to-pink-600/10',
  'Chemicals': 'from-lime-400/20 to-lime-600/10',
  'Shipping & Logistics': 'from-blue-400/20 to-blue-600/10',
};

const EMOJI_MAP = {
  'Food & Agriculture': '🌾',
  'Metals & Mining': '⚙️',
  'Energy & Petrochemicals': '🛢️',
  'Industrial Equipment': '🏭',
  'Electronics & Technology': '💡',
  'Textiles & Apparel': '🧵',
  'Chemicals': '🧪',
  'Shipping & Logistics': '🚢',
};

export function fmtPrice(price, unit) {
  if (price == null) return '—';
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(price);
  return unit ? `${formatted} / ${unit}` : formatted;
}

export function categoryAccent(cat = '') {
  return ACCENT_MAP[cat] || 'from-slate-300/20 to-slate-400/10';
}

export function categoryEmoji(cat = '') {
  return EMOJI_MAP[cat] || '📦';
}
