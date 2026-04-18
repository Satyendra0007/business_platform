const mongoose = require('mongoose');
const Product = require('./product.model');
const Company = require('../company/company.model');
const { matchedData } = require('express-validator');

// @desc    Create a new product listing
// @route   POST /api/products
// @access  Private (Verified Company Users only)
const createProduct = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ['body'] });

    // SECURITY: User must have a company attached
    if (!req.user.companyId) {
      return res.status(403).json({ success: false, message: 'You must be linked to a Company before listing products.' });
    }

    // IMPROVEMENT 7 + IMPROVEMENT 4: Only select the field we need to check — avoids fetching the full document
    const company = await Company.findById(req.user.companyId).select('verificationStatus').lean();
    if (!company || company.verificationStatus !== 'verified') {
      return res.status(403).json({ success: false, message: 'Your company must be verified before creating product listings.' });
    }

    const product = await Product.create({
      ...data,
      companyId: req.user.companyId
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    // IMPROVEMENT 6: Never expose internal stack traces to the client
    console.error('[createProduct]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Get paginated product listings with optimized filters
// @desc    Get paginated product listings with filters
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, companyId, minPrice, maxPrice } = req.query;

    let query = { isDeleted: false, isActive: true };
    let sortOption = { createdAt: -1 };

    // Case-insensitive regex search across key fields — supports partial matching
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { category: regex },
        { countryOfOrigin: regex },
      ];
    }

    // Exact category match (case-insensitive using regex for safer DB matching)
    if (category && category.trim()) {
      query.category = new RegExp(`^${category.trim()}$`, 'i');
    }

    if (companyId) query.companyId = companyId;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const limitValue = Math.min(parseInt(limit), 50);
    const pageValue  = Math.max(parseInt(page), 1);
    const skip       = (pageValue - 1) * limitValue;

    const [products, total] = await Promise.all([
      Product.find(query)
        .select('title price unit MOQ images category countryOfOrigin companyId leadTime isActive')

        .skip(skip)
        .limit(limitValue)
        .sort(sortOption)
        .lean(),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limitValue) || 1;

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages,
      page: pageValue,
      data: products
    });
  } catch (error) {
    console.error('[getProducts]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Get distinct product categories from the live DB
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isDeleted: false, isActive: true });
    res.json({ success: true, data: categories.filter(Boolean).sort() });
  } catch (error) {
    console.error('[getCategories]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    // IMPROVEMENT 1: Guard against malformed ObjectId crashing mongoose findById
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    // IMPROVEMENT 3: .select() to strip internal Mongoose versioning field from response
    const product = await Product.findById(req.params.id)
      .select('-__v')
      .lean();

    if (!product || product.isDeleted) {
      return res.status(404).json({ success: false, message: 'Product not found or has been removed.' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('[getProductById]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Owner Company Only)
const updateProduct = async (req, res) => {
  try {
    // IMPROVEMENT 1: Guard against invalid ObjectId before any DB call
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    const data = matchedData(req, { locations: ['body'] });

    // IMPROVEMENT 2: Prevent unnecessary DB writes if payload is empty
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
    }

    const product = await Product.findById(req.params.id).lean();

    if (!product || product.isDeleted) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const isCompanyUser = req.user.companyId && req.user.companyId.toString() === product.companyId.toString();
    const isAdmin = req.user.roles.includes('admin');

    if (!isCompanyUser && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this product.' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    ).lean();

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error('[updateProduct]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Soft Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Owner Company Only)
const deleteProduct = async (req, res) => {
  try {
    // IMPROVEMENT 1: Guard against invalid ObjectId before any DB call
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    const product = await Product.findById(req.params.id);

    if (!product || product.isDeleted) {
      return res.status(404).json({ success: false, message: 'Product not found or already archived.' });
    }

    const isCompanyUser = req.user.companyId && req.user.companyId.toString() === product.companyId.toString();
    const isAdmin = req.user.roles.includes('admin');

    if (!isCompanyUser && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this product.' });
    }

    product.isDeleted = true;
    product.isActive = false;
    await product.save();

    res.json({ success: true, message: 'Product successfully archived.' });
  } catch (error) {
    console.error('[deleteProduct]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getCategories };

