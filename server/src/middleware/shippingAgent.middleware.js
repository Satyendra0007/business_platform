// requireShippingAgent middleware
// Must be used AFTER protect — relies on req.user being set by the JWT middleware
const requireShippingAgent = (req, res, next) => {
  if (req.user && req.user.roles.includes('shipping_agent')) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Shipping agent privileges required.'
  });
};

// requireDealParticipant middleware for shipping routes
// Ensures only buyer or supplier of a deal can act on shipping requests
// NOTE: the controller is responsible for resolving the actual deal — this is
//       a lightweight role-guard to block shipping_agents from participant-only endpoints.
const requireParticipantRole = (req, res, next) => {
  const allowed = ['buyer', 'supplier', 'admin'];
  const hasRole = req.user && req.user.roles.some(r => allowed.includes(r));
  if (hasRole) return next();
  return res.status(403).json({
    success: false,
    message: 'Access denied. Only deal participants (buyer/supplier) can perform this action.'
  });
};

module.exports = { requireShippingAgent, requireParticipantRole };
