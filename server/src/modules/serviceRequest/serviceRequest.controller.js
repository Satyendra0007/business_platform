const mongoose = require('mongoose');
const ServiceRequest = require('./serviceRequest.model');
const { STATUSES } = require('./serviceRequest.model');
const { validateServiceRequest } = require('./serviceRequest.validator');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getPagination = (query) => {
  const page = Math.max(parseInt(query.page || 1), 1);
  const limitValue = Math.min(parseInt(query.limit || 20), 50);
  const skip = (page - 1) * limitValue;
  return { page, limitValue, skip };
};

// ═══════════════════════════════════════════════════════════════════════════════
// USER ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════════

// @route   POST /api/service-requests
// @desc    Submit a new service request (authenticated users only)
const createServiceRequest = async (req, res) => {
  try {
    const { category, formData, attachments } = req.body;

    // Validate
    const errors = validateServiceRequest({ category, formData, attachments });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    const serviceRequest = await ServiceRequest.create({
      createdBy: req.user._id,
      companyId: req.user.companyId || null,
      category,
      formData,
      attachments: attachments || [],
    });

    return res.status(201).json({
      success: true,
      message: 'Your request has been submitted successfully.',
      data: { _id: serviceRequest._id, category: serviceRequest.category, status: serviceRequest.status },
    });
  } catch (error) {
    console.error('[serviceRequest.create]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

// @route   GET /api/admin/service-requests
// @desc    List all service requests with optional filters
const getServiceRequests = async (req, res) => {
  try {
    const { page, limitValue, skip } = getPagination(req.query);
    const { category, status } = req.query;

    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    const [requests, total] = await Promise.all([
      ServiceRequest.find(query)
        .populate('createdBy', 'firstName lastName email phone')
        .populate('companyId', 'name country city')
        .skip(skip)
        .limit(limitValue)
        .sort({ createdAt: -1 })
        .lean(),
      ServiceRequest.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: requests.length,
      total,
      totalPages: Math.ceil(total / limitValue),
      page,
      data: requests,
    });
  } catch (error) {
    console.error('[serviceRequest.getAll]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   GET /api/admin/service-requests/:id
// @desc    Get a single service request with full detail
const getServiceRequestById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid request ID.' });
    }

    const request = await ServiceRequest.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email phone')
      .populate('companyId', 'name country city')
      .lean();

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found.' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    console.error('[serviceRequest.getById]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @route   PATCH /api/admin/service-requests/:id/status
// @desc    Update service request status
const updateServiceRequestStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid request ID.' });
    }

    const { status } = req.body;
    if (!status || !STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${STATUSES.join(', ')}.`,
      });
    }

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found.' });
    }

    request.status = status;
    await request.save();

    res.json({
      success: true,
      message: `Request status updated to '${status}'.`,
      data: { _id: request._id, status: request.status },
    });
  } catch (error) {
    console.error('[serviceRequest.updateStatus]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createServiceRequest,
  getServiceRequests,
  getServiceRequestById,
  updateServiceRequestStatus,
};
