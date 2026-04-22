/**
 * rfqService.js — RFQ API wrappers
 *
 * All routes are protected (JWT required).
 *
 * POST   /api/rfq                   → createRFQ(data)
 * GET    /api/rfq                   → getMyRFQs(params)          [buyer view]
 * GET    /api/rfq?incoming=true     → getIncomingRFQs(params)    [supplier view]
 * GET    /api/rfq/:id               → getRFQById(id)
 * POST   /api/rfq/:id/convert       → convertRFQToDeal(id)
 * PATCH  /api/rfq/:id/close         → closeRFQ(id)
 */

import api from './api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function handleError(error, fallback) {
  const msg = error.response?.data?.message || error.response?.data?.message || error.message || fallback;
  throw new Error(msg);
}

function normalise(res, fallback) {
  if (res.data.success) return res.data;
  throw new Error(res.data.message || fallback);
}

// ─── Create (buyer) ───────────────────────────────────────────────────────────

/**
 * Create a new RFQ.  productId is optional (manual RFQs use productName instead).
 * @param {{
 *   productId?, productName?, category?,
 *   quantity, targetPrice?,
 *   destinationCountry?, deliveryTimeline?, incoterm?,
 *   specifications?, remarks?
 * }} data
 */
export const createRFQ = async (data) => {
  try {
    const res = await api.post('/rfq', data);
    return normalise(res, 'Failed to create RFQ').data;
  } catch (error) { handleError(error, 'Failed to create RFQ.'); }
};

// ─── Update (buyer) ───────────────────────────────────────────────────────────

export const updateRFQ = async (id, data) => {
  try {
    const res = await api.put(`/rfq/${id}`, data);
    return normalise(res, 'Failed to update RFQ').data;
  } catch (error) { handleError(error, 'Failed to update RFQ.'); }
};

// ─── List — buyer view ────────────────────────────────────────────────────────

/**
 * Get RFQs created by the current user's company.
 * @param {{ page?, limit?, status? }} params
 */
export const getMyRFQs = async (params = {}) => {
  try {
    const res = await api.get('/rfq', { params });
    const body = normalise(res, 'Failed to load RFQs');
    return { rfqs: body.data, total: body.total, totalPages: body.totalPages, page: body.page };
  } catch (error) { handleError(error, 'Failed to load your RFQs.'); }
};

// ─── List — supplier (incoming) view ─────────────────────────────────────────

/**
 * Get RFQs where this user's company is the supplier.
 * The backend keyed on supplierCompanyId, so we pass incoming=true as a hint.
 * @param {{ page?, limit?, status? }} params
 */
export const getIncomingRFQs = async (params = {}) => {
  try {
    const res = await api.get('/rfq', { params: { ...params, incoming: true } });
    const body = normalise(res, 'Failed to load incoming RFQs');
    return { rfqs: body.data, total: body.total, totalPages: body.totalPages, page: body.page };
  } catch (error) { handleError(error, 'Failed to load incoming RFQs.'); }
};

// ─── Single RFQ ───────────────────────────────────────────────────────────────

export const getRFQById = async (id) => {
  try {
    const res = await api.get(`/rfq/${id}`);
    return normalise(res, 'RFQ not found').data;
  } catch (error) { handleError(error, 'Failed to load RFQ.'); }
};

// ─── Convert to Deal (buyer) ──────────────────────────────────────────────────

/**
 * Convert an open/in_progress RFQ into a Deal.
 * Returns { rfqId, deal }.
 */
export const convertRFQToDeal = async (rfqId) => {
  try {
    const res = await api.post(`/rfq/${rfqId}/convert`);
    return normalise(res, 'Failed to convert RFQ').data;
  } catch (error) { handleError(error, 'Failed to convert RFQ to deal.'); }
};

// ─── Close (buyer) ────────────────────────────────────────────────────────────

export const closeRFQ = async (rfqId) => {
  try {
    const res = await api.patch(`/rfq/${rfqId}/close`);
    return normalise(res, 'Failed to close RFQ').data;
  } catch (error) { handleError(error, 'Failed to close RFQ.'); }
};
