/**
 * companyService.js — Company API wrappers
 *
 * - createCompany(data)        → POST /api/companies
 * - getCompanyById(id)         → GET  /api/companies/:id
 * - updateMyCompany(id, data)  → PUT  /api/companies/:id
 */

import api from './api';

/**
 * Create a new company profile for the logged-in user.
 * After success, the backend links user.companyId automatically.
 * @param {{ name, country, city?, companyType?, industry?, description?, website? }} data
 * @returns {Object} company document
 */
export const createCompany = async (data) => {
  try {
    const { data: res } = await api.post('/companies', data);
    if (res.success) return res.data;
    throw new Error(res.message || 'Failed to create company');
  } catch (error) {
    const msg = error.response?.data?.message || error.response?.data?.message || error.message || 'Failed to create company.';
    throw new Error(msg);
  }
};

/**
 * Fetch a single company by its MongoDB ID.
 * @param {string} id
 * @returns {Object} company document
 */
export const getCompanyById = async (id) => {
  try {
    const { data: res } = await api.get(`/companies/${id}`);
    if (res.success) return res.data;
    throw new Error(res.message || 'Company not found');
  } catch (error) {
    const msg = error.response?.data?.message || error.response?.data?.message || error.message || 'Failed to fetch company.';
    throw new Error(msg);
  }
};

/**
 * Update the current user's company profile.
 * @param {string} id   — company._id
 * @param {Object} data — partial fields to update
 * @returns {Object} updated company document
 */
export const updateMyCompany = async (id, data) => {
  try {
    const { data: res } = await api.put(`/companies/${id}`, data);
    if (res.success) return res.data;
    throw new Error(res.message || 'Failed to update company');
  } catch (error) {
    const msg = error.response?.data?.message || error.response?.data?.message || error.message || 'Failed to update company.';
    throw new Error(msg);
  }
};
