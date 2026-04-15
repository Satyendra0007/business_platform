import React, { createContext, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, saveUser, clearSession } from '../lib/api';

// ─── Context ──────────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());
  const navigate = useNavigate();

  /** Called after a successful login API response. */
  const login = useCallback((userData) => {
    // userData is already saved to localStorage by authService.login()
    setUser(userData);
    navigate('/dashboard');
  }, [navigate]);

  /** Clears session and sends user to the landing page. */
  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    navigate('/');
  }, [navigate]);

  /**
   * Call this after any operation that changes the user object
   * (e.g. profile update, company link). Pass the updated user
   * object directly to avoid a stale localStorage read.
   */
  const updateUser = useCallback((updatedUser) => {
    saveUser(updatedUser);
    setUser(updatedUser);
  }, []);

  const value = { user, login, logout, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
