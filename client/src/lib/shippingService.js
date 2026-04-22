/**
 * shippingService.js — Shipping API wrappers
 *
 * Buyer/Supplier actions:
 *  POST  /api/shipping/request         → createShippingRequest(data)
 *  GET   /api/shipping/request/:dealId → getShippingRequest(dealId)
 *  GET   /api/shipping/bids/:requestId → getShippingBids(requestId)
 *  POST  /api/shipping/bid/:id/accept  → acceptBid(bidId)
 *
 * Shipping Agent actions:
 *  GET   /api/shipping/requests → listOpenRequests(params)
 *  POST  /api/shipping/bid      → submitBid(data)
 */
import api from './api';

function handleError(error, fallback) {
  const msg = error.response?.data?.message || error.response?.data?.message || error.message || fallback;
  throw new Error(msg);
}

// ─── Buyer / Supplier ─────────────────────────────────────────────────────────

/**
 * Create a freight request for a deal in 'shipping_request' stage.
 * @param {{ dealId, origin, destination, cargoDetails?, quantity?, incoterm? }} data
 */
export const createShippingRequest = async (data) => {
  try {
    const { data: res } = await api.post('/shipping/request', data);
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to create shipping request.'); }
};

/**
 * Get the shipping request attached to a deal.
 * Returns null if no request exists yet (404 treated as null).
 */
export const getShippingRequest = async (dealId) => {
  try {
    const { data: res } = await api.get(`/shipping/request/${dealId}`);
    if (res.success) return res.data;
    return null;
  } catch (error) {
    if (error.response?.status === 404) return null;
    handleError(error, 'Failed to load shipping request.');
  }
};

/**
 * Get all bids submitted for a shipping request.
 */
export const getShippingBids = async (requestId) => {
  try {
    const { data: res } = await api.get(`/shipping/bids/${requestId}`);
    if (res.success) return { bids: res.data, total: res.total };
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to load shipping bids.'); }
};

/**
 * Accept a bid — deal automatically moves to 'shipping' stage.
 */
export const acceptBid = async (bidId) => {
  try {
    const { data: res } = await api.post(`/shipping/bid/${bidId}/accept`);
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to accept bid.'); }
};

// ─── Shipping Agent ───────────────────────────────────────────────────────────

/**
 * List all open freight requests (cargo details only — no deal pricing).
 */
export const listOpenRequests = async (params = {}) => {
  try {
    const { data: res } = await api.get('/shipping/requests', { params });
    if (res.success) return { requests: res.data, total: res.total, totalPages: res.totalPages };
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to load open freight requests.'); }
};

/**
 * Submit a freight bid as a shipping agent.
 * @param {{ shippingRequestId, price?, transportType?, transitTime?, validity?, notes? }} data
 */
export const submitBid = async (data) => {
  try {
    const { data: res } = await api.post('/shipping/bid', data);
    if (res.success) return res.data;
    throw new Error(res.message);
  } catch (error) { handleError(error, 'Failed to submit bid.'); }
};
