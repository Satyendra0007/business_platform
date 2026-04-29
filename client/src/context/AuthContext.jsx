import React, { createContext, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getUser, saveUser, clearSession } from '../lib/api';
import { getPrimaryRole } from '../lib/userRole';

// ─── Context ──────────────────────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());
  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    try {
      if (!user) return; // Don't fetch if not logged in
      const res = await api.get(`/auth/me?_t=${Date.now()}`);
      
      const freshUser = res.data?.data || res.data?.user || res.data;
      if (freshUser) {
        // Map plan to subscriptionPlan for the frontend, but keep original plan
        freshUser.subscriptionPlan = freshUser.plan;
        freshUser.role = getPrimaryRole(freshUser);
        
        // Preserve token if the server didn't return one
        if (user?.token && !freshUser.token) {
          freshUser.token = user.token;
        }

        saveUser(freshUser);
        setUser(freshUser);
      }
    } catch (err) {
      console.error('Failed to sync user data:', err);
    }
  }, [user]);

  // Sync user data on mount
  useEffect(() => {
    fetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    navigate('/login', { replace: true, state: { justLoggedOut: true } });
  }, [navigate]);

  /**
   * Call this after any operation that changes the user object
   */
  const updateUser = useCallback((updatedUser) => {
    saveUser(updatedUser);
    setUser(updatedUser);
  }, []);

  const value = { user, login, logout, updateUser, fetchUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
