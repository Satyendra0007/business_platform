import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth — consume the AuthContext from any component.
 *
 * Returns: { user, login, logout, updateUser }
 *
 * Usage:
 *   const { user, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
