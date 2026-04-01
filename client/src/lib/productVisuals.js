import sunflowerOilImage from '../assets/product-sunflower-oil.svg';
import sugarImage from '../assets/product-sugar.svg';
import steelPipesImage from '../assets/product-steel-pipes.svg';
import oliveOilImage from '../assets/product-olive-oil.svg';

const productVisuals = {
  'sunflower-oil': {
    image: sunflowerOilImage,
    alt: 'Sunflower oil export bottle and sunflower illustration',
    accent: 'from-amber-100 via-orange-50 to-yellow-50',
  },
  'sugar-icumsa-45': {
    image: sugarImage,
    alt: 'Refined sugar illustration with premium packaging silhouette',
    accent: 'from-fuchsia-100 via-violet-50 to-white',
  },
  'steel-pipes': {
    image: steelPipesImage,
    alt: 'Industrial steel pipe bundle illustration',
    accent: 'from-slate-200 via-slate-50 to-white',
  },
  'olive-oil': {
    image: oliveOilImage,
    alt: 'Olive oil bottle and olive branch illustration',
    accent: 'from-lime-100 via-emerald-50 to-white',
  },
};

export function getProductVisual(productId) {
  return (
    productVisuals[productId] || {
      image: sunflowerOilImage,
      alt: 'Product visual',
      accent: 'from-slate-100 via-white to-slate-50',
    }
  );
}
