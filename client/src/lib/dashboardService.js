/**
 * dashboardService.js
 * GET /api/dashboard/stats — fetches real role-specific counts in one request.
 */
import api from './api';

/**
 * @returns {Promise<Object>} role-specific stats object
 *
 * buyer:          { totalProducts, myRFQs, myDeals, transportTenders }
 * supplier:       { myProducts, incomingRFQs, myDeals, transportTenders }
 * shipping_agent: { openTenders, awardedShipments, totalProducts }
 * admin:          { totalUsers, totalCompanies, totalDeals, pendingCompanies }
 */
export async function getDashboardStats() {
  const { data } = await api.get('/dashboard/stats');
  if (!data.success) throw new Error(data.message || 'Failed to load stats');
  return data.data;
}
