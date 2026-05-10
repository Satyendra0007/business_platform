import api from './api';

export async function submitDealSupportRequest(payload) {
  try {
    const { data } = await api.post('/deal-support/submit', payload);
    if (data.success) {
      if (data.deliveryMode === 'mailto' && data.mailtoHref && typeof window !== 'undefined') {
        window.location.href = data.mailtoHref;
      }
      return data;
    }

    throw new Error(data.message || 'Failed to submit request.');
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to submit request. Please try again.';
    throw new Error(message);
  }
}
