/**
 * adminService.js — Admin API wrappers (admin role only)
 *
 * Users:
 *  GET   /api/admin/users                      → getUsers(params)
 *  GET   /api/admin/users/:id                  → getUserById(id)
 *  PUT   /api/admin/users/:id                  → updateUser(id, data)
 *  PATCH /api/admin/users/:id/toggle-status    → toggleUserStatus(id)
 *  PATCH /api/admin/users/:id/role             → updateUserRole(id, roles)
 *  PATCH /api/admin/users/:id/plan             → updateUserPlan(id, plan)
 *  PATCH /api/admin/users/:id/verify           → verifyUser(id, data)
 *
 * Companies:
 *  GET   /api/admin/companies                  → getCompanies(params)
 *  GET   /api/admin/companies/:id              → getCompanyById(id)
 *  PUT   /api/admin/companies/:id              → updateCompany(id, data)
 *  PATCH /api/admin/companies/:id/verify       → verifyCompany(id, status)
 *  PATCH /api/admin/companies/:id/toggle-status → toggleCompanyStatus(id)
 *
 * Deals:
 *  GET   /api/admin/deals                      → getAdminDeals(params)
 *  GET   /api/admin/deals/:id                  → getAdminDealById(id)
 *  PATCH /api/admin/deals/:id/status           → updateDealStatus(id, status, notes)
 *  PATCH /api/admin/deals/:id/shipment         → updateDealShipment(id, status, notes)
 *  PATCH /api/admin/deals/:id/resolve          → resolveDeal(id, notes)
 *
 * RFQs:
 *  GET   /api/admin/rfq                        → getAdminRFQs(params)
 *  GET   /api/admin/rfq/:id                    → getAdminRFQById(id)
 *  PUT   /api/admin/rfq/:id                    → updateRFQ(id, data)
 *  PATCH /api/admin/rfq/:id/close              → closeRFQ(id)
 *  PATCH /api/admin/rfq/:id/remove             → removeRFQ(id)
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

export const getUserById = async (id) => {
  try {
    const { data: res } = await api.get(`/admin/users/${id}`);
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to load user.'); }
};

export const updateUser = async (id, data) => {
  try {
    const { data: res } = await api.put(`/admin/users/${id}`, data);
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to update user.'); }
};

export const toggleUserStatus = async (id) => {
  try {
    const { data: res } = await api.patch(`/admin/users/${id}/toggle-status`);
    if (res.success) return res.data;  // { _id, email, isActive }
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to toggle user status.'); }
};

export const updateUserRole = async (id, roles) => {
  try {
    const { data: res } = await api.patch(`/admin/users/${id}/role`, { roles });
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to update user roles.'); }
};

export const updateUserPlan = async (id, plan) => {
  try {
    const { data: res } = await api.patch(`/admin/users/${id}/plan`, { plan });
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to update user plan.'); }
};

export const verifyUser = async (id, data) => {
  try {
    const { data: res } = await api.patch(`/admin/users/${id}/verify`, data);
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to update verification.'); }
};

// ─── Companies ────────────────────────────────────────────────────────────────

export const getCompanies = async (params = {}) => {
  try {
    const { data: res } = await api.get('/admin/companies', { params });
    if (res.success) return { companies: res.data, total: res.total, totalPages: res.totalPages };
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to load companies.'); }
};

export const getCompanyById = async (id) => {
  try {
    const { data: res } = await api.get(`/admin/companies/${id}`);
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to load company.'); }
};

export const updateCompanyAdmin = async (id, data) => {
  try {
    const { data: res } = await api.put(`/admin/companies/${id}`, data);
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to update company.'); }
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

export const toggleCompanyStatus = async (id) => {
  try {
    const { data: res } = await api.patch(`/admin/companies/${id}/toggle-status`);
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to toggle company status.'); }
};

// ─── Deals ────────────────────────────────────────────────────────────────────

export const getAdminDeals = async (params = {}) => {
  try {
    const { data: res } = await api.get('/admin/deals', { params });
    if (res.success) return { deals: res.data, total: res.total, totalPages: res.totalPages };
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to load deals.'); }
};

export const getAdminDealById = async (id) => {
  try {
    const { data: res } = await api.get(`/admin/deals/${id}`);
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to load deal.'); }
};

export const updateDealStatus = async (id, status, notes) => {
  try {
    const { data: res } = await api.patch(`/admin/deals/${id}/status`, { status, notes });
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to update deal status.'); }
};

export const updateDealShipment = async (id, status, notes) => {
  try {
    const { data: res } = await api.patch(`/admin/deals/${id}/shipment`, { status, notes });
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to update shipment.'); }
};

export const resolveDeal = async (id, notes) => {
  try {
    const { data: res } = await api.patch(`/admin/deals/${id}/resolve`, { notes });
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to resolve deal.'); }
};

// ─── RFQs ─────────────────────────────────────────────────────────────────────

export const getAdminRFQs = async (params = {}) => {
  try {
    const { data: res } = await api.get('/admin/rfq', { params });
    if (res.success) return { rfqs: res.data, total: res.total, totalPages: res.totalPages };
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to load RFQs.'); }
};

export const getAdminRFQById = async (id) => {
  try {
    const { data: res } = await api.get(`/admin/rfq/${id}`);
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to load RFQ.'); }
};

export const updateRFQ = async (id, data) => {
  try {
    const { data: res } = await api.put(`/admin/rfq/${id}`, data);
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to update RFQ.'); }
};

export const closeRFQ = async (id) => {
  try {
    const { data: res } = await api.patch(`/admin/rfq/${id}/close`);
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to close RFQ.'); }
};

export const removeRFQ = async (id) => {
  try {
    const { data: res } = await api.patch(`/admin/rfq/${id}/remove`);
    if (res.success) return true;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to remove RFQ.'); }
};
