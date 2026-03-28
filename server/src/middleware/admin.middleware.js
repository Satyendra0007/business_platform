// requireAdmin middleware
// Must be used AFTER protect — relies on req.user being set by the JWT middleware
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.roles.includes('admin')) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Administrator privileges required.'
  });
};

module.exports = { requireAdmin };
