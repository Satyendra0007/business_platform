/**
 * adminService.js — Admin API wrappers (admin role only)
 *
 * Users:
 *  GET   /api/admin/users                      → getUsers(params)
 *  PATCH /api/admin/users/:id/toggle-status    → toggleUserStatus(id)
 *
 * Companies:
 *  GET   /api/admin/companies                  → getCompanies(params)
 *  PATCH /api/admin/companies/:id/verify       → verifyCompany(id, status)
 *
 * Deals (read-only monitor):
 *  GET   /api/admin/deals                      → getAdminDeals(params)
 *
 * RFQs (read-only monitor):
 *  GET   /api/admin/rfq                        → getAdminRFQs(params)
 *
 * Products:
 *  GET   /api/admin/products                   → getAdminProducts(params)
 */
import api from './api';

function handleError(error, fallback) {
  const msg = error.response?.data?.message || error.response?.data?.message || error.message || fallback;
  throw new Error(msg);
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const getUsers = async (params = {}) => {
  try {
    const { data: res } = await api.get('/admin/users', { params });
    if (res.success) return { users: res.data, total: res.total, totalPages: res.totalPages };
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to load users.'); }
};

export const toggleUserStatus = async (id) => {
  try {
    const { data: res } = await api.patch(`/admin/users/${id}/toggle-status`);
    if (res.success) return res.data;  // { _id, email, isActive }
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to toggle user status.'); }
};

// ─── Companies ────────────────────────────────────────────────────────────────

export const getCompanies = async (params = {}) => {
  try {
    const { data: res } = await api.get('/admin/companies', { params });
    if (res.success) return { companies: res.data, total: res.total, totalPages: res.totalPages };
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to load companies.'); }
};

/**
 * @param {string} id  company _id
 * @param {'pending'|'verified'|'rejected'} status
 */
export const verifyCompany = async (id, status) => {
  try {
    const { data: res } = await api.patch(`/admin/companies/${id}/verify`, { verificationStatus: status });
    if (res.success) return res.data;  // { _id, name, verificationStatus }
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to update company verification.'); }
};

// ─── Deals (monitor) ──────────────────────────────────────────────────────────

export const getAdminDeals = async (params = {}) => {
  try {
    const { data: res } = await api.get('/admin/deals', { params });
    if (res.success) return { deals: res.data, total: res.total, totalPages: res.totalPages };
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to load deals.'); }
};

// ─── RFQs (monitor) ───────────────────────────────────────────────────────────

export const getAdminRFQs = async (params = {}) => {
  try {
    const { data: res } = await api.get('/admin/rfq', { params });
    if (res.success) return { rfqs: res.data, total: res.total, totalPages: res.totalPages };
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to load RFQs.'); }
};

// ─── Products (admin) ────────────────────────────────────────────────────────

export const getAdminProducts = async (params = {}) => {
  try {
    const { data: res } = await api.get('/admin/products', { params });
    if (res.success) return { products: res.data, total: res.total, totalPages: res.totalPages };
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to load products.'); }
};
