/**
 * dealService.js — Deal API wrappers
 *
 * GET    /api/deals              → getDeals(params)
 * GET    /api/deals/:id          → getDealById(id)
 * PATCH  /api/deals/:id/status   → advanceDealStatus(id, status, notes?)
 * PATCH  /api/deals/:id/shipment → updateDealShipment(id, data)
 *
 * Messages (per-deal chat):
 * GET    /api/messages?dealId=   → getMessages(dealId, params)
 * POST   /api/messages           → sendMessage(dealId, text)
 */
import api from './api';

// ─── Helper ───────────────────────────────────────────────────────────────────

function handleError(error, fallback) {
  const msg = error.response?.data?.message || error.response?.data?.message || error.message || fallback;
  throw new Error(msg);
}

// ─── Deals ────────────────────────────────────────────────────────────────────

/**
 * Fetch all deals the current user participates in (buyer or supplier).
 * @param {{ page?, limit?, status? }} params
 */
export const getDeals = async (params = {}) => {
  try {
    const { data: res } = await api.get('/deals', { params });
    if (res.success) {
      return { deals: res.data, total: res.total, totalPages: res.totalPages, page: res.page };
    }
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to load deals.'); }
};

/**
 * Fetch a single deal by ID (participants only).
 */
export const getDealById = async (id) => {
  try {
    const { data: res } = await api.get(`/deals/${id}`);
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to load deal.'); }
};

/**
 * Update core trade details of a deal during negotiation.
 * @param {string} id
 * @param {object} data
 */
export const updateDeal = async (id, data) => {
  try {
    const { data: res } = await api.put(`/deals/${id}`, data);
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to update deal.'); }
};

/**
 * Advance the deal to the next lifecycle stage.
 * @param {string} id
 * @param {string} status  — target stage e.g. 'negotiation', 'agreement'
 * @param {string} notes   — optional notes logged in timeline
 */
export const advanceDealStatus = async (id, status, notes = '') => {
  try {
    const { data: res } = await api.patch(`/deals/${id}/status`, { status, notes });
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to advance deal status.'); }
};

/**
 * Update shipment progress for the assigned shipping agent.
 * @param {string} id
 * @param {{ status?: string, notes?: string }} data
 */
export const updateDealShipment = async (id, data) => {
  try {
    const { data: res } = await api.patch(`/deals/${id}/shipment`, data);
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to update shipment.'); }
};

// ─── Messages ─────────────────────────────────────────────────────────────────

/**
 * Fetch paginated messages for a deal thread.
 * Returns newest-first from the API; the UI reverses for chronological display.
 * @param {string} dealId
 * @param {{ page?, limit? }} params
 */
export const getMessages = async (dealId, params = {}) => {
  try {
    const { data: res } = await api.get('/messages', { params: { dealId, ...params } });
    if (res.success) {
      return { messages: res.data, total: res.total, totalPages: res.totalPages };
    }
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to load messages.'); }
};

/**
 * Send a text message to a deal thread.
 * @param {string} dealId
 * @param {string} text
 */
export const sendMessage = async (dealId, text) => {
  try {
    const { data: res } = await api.post('/messages', { dealId, text });
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to send message.'); }
};
