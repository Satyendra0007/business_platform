/**
 * productManagementService.js
 * Supplier CRUD for own products. Uses the same axios instance as
 * everything else — no new config needed.
 *
 * manage  GET  /api/products/manage
 * create  POST /api/products
 * update  PUT  /api/products/:id
 * delete  DELETE /api/products/:id
 */
import api from './api';

function handleError(error, fallback) {
  const msg = error.response?.data?.message || error.response?.data?.message || error.message || fallback;
  throw new Error(msg);
}

/**
 * Create a new product. companyId is set server-side from the JWT.
 * @param {Object} data — fields from schema (title + category required)
 */
export const createProduct = async (data) => {
  try {
    const { data: res } = await api.post('/products', data);
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to create product.'); }
};

/**
 * Fetch products that the current user is allowed to manage.
 * Suppliers see their own company listings; admins see all products.
 * @param {Object} params
 */
export const getManagedProducts = async (params = {}) => {
  try {
    const { data: res } = await api.get('/products/manage', { params });
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
    handleError(error, 'Failed to load products.');
  }
};

/**
 * Update an existing product (owner company only).
 * @param {string} id — product._id
 * @param {Object} data — partial fields to update
 */
export const updateProduct = async (id, data) => {
  try {
    const { data: res } = await api.put(`/products/${id}`, data);
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to update product.'); }
};

/**
 * Soft-delete a product (owner company only).
 * @param {string} id — product._id
 */
export const deleteProduct = async (id) => {
  try {
    const { data: res } = await api.delete(`/products/${id}`);
    if (res.success) return true;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to delete product.'); }
};
