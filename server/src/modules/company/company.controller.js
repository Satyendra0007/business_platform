const Company = require('./company.model');
const User = require('../user/user.model');
const { matchedData } = require('express-validator');

// @desc    Register a new Company profile
// @route   POST /api/companies
// @access  Private (Registered User)
const createCompany = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ['body'] });
    
    // Check if the user already has a company attached
    if (req.user.companyId) {
      return res.status(400).json({ success: false, message: 'User is already linked to an existing company' });
    }

    // AUTO-STATUS: If documents are provided at creation, advance status to 'submitted'
    // so admin can immediately see documents are ready for review.
    // Without documents, the profile stays 'draft' until the owner uploads them.
    const hasDocuments = Array.isArray(data.documents) && data.documents.length > 0;
    const verificationStatus = hasDocuments ? 'submitted' : 'draft';

    const company = await Company.create({
      ...data,
      verificationStatus
    });

    if (company) {
      // Tie the user specifically to this newly created B2B context
      await User.findByIdAndUpdate(req.user._id, { companyId: company._id });

      res.status(201).json({
        success: true,
        data: company
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid company data received' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during company creation' });
  }
};

// @desc    Update a Company profile
// @route   PUT /api/companies/:id
// @access  Private (Authorized Company User or Admin)
const updateCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    const data = matchedData(req, { locations: ['body'] });

    // Authorization Guard: Only the company's owner or an admin can edit
    const isCompanyUser = req.user.companyId && req.user.companyId.toString() === companyId;
    const isAdmin = req.user.roles.includes('admin');

    if (!isCompanyUser && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this company profile' });
    }

    const company = await Company.findById(companyId);
    if (!company || company.isDeleted) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Safety constraint: Prevent manual bypass of the verification workflow via arbitrary API payloads
    if (data.verificationStatus && !isAdmin) {
      delete data.verificationStatus;
    }

    // AUTO-STATUS: If documents are newly uploaded by the owner and the company isn't
    // already verified/rejected, auto-advance status to 'submitted' for admin review.
    // Admin-initiated updates are exempt — they manage status directly.
    const uploadingDocuments = Array.isArray(data.documents) && data.documents.length > 0;
    const notYetReviewed = ['draft', 'submitted'].includes(company.verificationStatus);
    if (uploadingDocuments && notYetReviewed && !isAdmin) {
      data.verificationStatus = 'submitted';
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      data,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedCompany });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during update' });
  }
};

// @desc    Get a single Company by ID
// @route   GET /api/companies/:id
// @access  Public
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company || company.isDeleted) {
      return res.status(404).json({ success: false, message: 'Company not found or suspended' });
    }

    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving company' });
  }
};

// @desc    Get multiple Companies (Search & Paginated)
// @route   GET /api/companies
// @access  Public
const getCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, country, status } = req.query;
    
    let query = { isDeleted: false }; // Never return soft-deleted companies

    if (search) {
      // Exploiting the Text Index established natively in MongoDB
      query.$text = { $search: search };
    }
    
    if (country) {
      query.country = country;
    }

    // By default, public API should only return 'verified' companies unless queried specifically by an admin
    if (status) {
      query.verificationStatus = status;
    } else {
      // Safe default for standard discovery pipelines
      query.verificationStatus = 'verified';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // NOTE: documents field intentionally excluded from public listing for privacy —
    // full documents are visible via GET /api/companies/:id and all /api/admin/companies endpoints.
    const companies = await Company.find(query)
      .select('-documents')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Company.countDocuments(query);

    res.json({
      success: true,
      count: companies.length,
      total,
      page: parseInt(page),
      data: companies
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving company list' });
  }
};

module.exports = { createCompany, getCompanyById, updateCompany, getCompanies };
