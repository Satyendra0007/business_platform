/**
 * productService.js — Product API wrappers
 *
 * GET /api/products          → getProducts(params)
 * GET /api/products/:id      → getProductById(id)
 * POST /api/products         → createProduct(data)   [requires auth + verified company]
 */

import api from './api';

/**
 * Fetch paginated product listings.
 * @param {{ page?, limit?, search?, category?, minPrice?, maxPrice? }} params
 * @returns {{ data: Product[], total, totalPages, page }}
 */
export const getProducts = async (params = {}) => {
  try {
    const { data: res } = await api.get('/products', { params });
    if (res.success) {
      return {
        products: res.data,
        total: res.total,
        totalPages: res.totalPages,
        page: res.page,
      };
    }
    throw new Error(res.message || 'Failed to load products');
  } catch (error) {
    const msg = error.response?.data?.message || error.response?.data?.message || error.message || 'Failed to load products.';
    throw new Error(msg);
  }
};

/**
 * Fetch a single product by ID.
 * @param {string} id
 * @returns {Object} product document
 */
export const getProductById = async (id) => {
  try {
    const { data: res } = await api.get(`/products/${id}`);
    if (res.success) return res.data;
    throw new Error(res.message || 'Product not found');
  } catch (error) {
    const msg = error.response?.data?.message || error.response?.data?.message || error.message || 'Failed to load product.';
    throw new Error(msg);
  }
};

/**
 * Create a new product (requires auth + verified company).
 * @param {{ title, category, price?, unit?, MOQ?, countryOfOrigin?, description?, leadTime?, images? }} data
 * @returns {Object} created product document
 */
export const createProduct = async (data) => {
  try {
    const { data: res } = await api.post('/products', data);
    if (res.success) return res.data;
    throw new Error(res.message || 'Failed to create product');
  } catch (error) {
    const msg = error.response?.data?.message || error.response?.data?.message || error.message || 'Failed to create product.';
    throw new Error(msg);
  }
};

/**
 * Fetch all distinct categories from live DB data.
 * @returns {string[]} sorted category names
 */
export const getCategories = async () => {
  try {
    const { data: res } = await api.get('/products/categories');
    if (res.success) return res.data;
    return [];
  } catch {
    return [];
  }
};

