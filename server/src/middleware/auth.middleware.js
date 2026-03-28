const jwt = require('jsonwebtoken');
const User = require('../modules/user/user.model');

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tradafy_super_secret_fallback');
      
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ success: false, message: 'Account has been deactivated by Admin' });
      }
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user has at least one of the required roles
    const hasRole = req.user.roles.some(role => roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ 
        success: false, 
        message: `User roles [${req.user.roles.join(', ')}] are not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
