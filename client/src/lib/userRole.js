export function getUserRoles(user) {
  if (!user) return [];
  if (Array.isArray(user.roles)) return user.roles.filter(Boolean);
  if (typeof user.role === 'string' && user.role) return [user.role];
  return [];
}

export function hasRole(user, role) {
  return getUserRoles(user).includes(role);
}

export function getPrimaryRole(user) {
  const roles = getUserRoles(user);
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('supplier')) return 'supplier';
  if (roles.includes('shipping_agent')) return 'shipping_agent';
  if (roles.includes('buyer')) return 'buyer';
  return 'buyer';
}
