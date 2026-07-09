/**
 * useAuth.jsx
 * -----------
 * Provides a small React context holding the current user and token,
 * plus login/register/logout actions. Wrap the app in <AuthProvider>
 * and call useAuth() anywhere to read auth state or trigger a login.
 */

import { createContext, useContext, useState, useCallback } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("aeromind_user");
    return raw ? JSON.parse(raw) : null;
  });

  const persist = (token, userData) => {
    localStorage.setItem("aeromind_token", token);
    localStorage.setItem("aeromind_user", JSON.stringify(userData));
    setUser(userData);
  };

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    persist(res.data.token, res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    persist(res.data.token, res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("aeromind_token");
    localStorage.removeItem("aeromind_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
