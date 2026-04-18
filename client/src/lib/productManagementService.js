/**
 * productManagementService.js
 * Supplier CRUD for own products. Uses the same axios instance as
 * everything else — no new config needed.
 *
 * create  POST /api/products
 * update  PUT  /api/products/:id
 * delete  DELETE /api/products/:id
 */
import api from './api';

function handleError(error, fallback) {
  const msg = error.response?.data?.message || error.message || fallback;
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
