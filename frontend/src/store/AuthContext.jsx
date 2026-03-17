import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const initialize = async () => {
    try {
      const response = await authService.me();
      setUser(response.user);
    } catch {
      setUser(null);
    } finally {
      setIsAuthReady(true);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const login = async (payload) => {
    const response = await authService.login(payload);
    if (response.token) {
      localStorage.setItem("atlasia_token", response.token);
    }
    setUser(response.user);
    setIsAuthReady(true);
    return response.user;
  };

  const register = async (payload) => {
    const response = await authService.register(payload);
    if (response.token) {
      localStorage.setItem("atlasia_token", response.token);
    }
    setUser(response.user);
    setIsAuthReady(true);
    return response.user;
  };

  const logout = async () => {
    localStorage.removeItem("atlasia_token");
    await authService.logout();
    setUser(null);
    setIsAuthReady(true);
  };

  const value = useMemo(
    () => ({ user, setUser, isAuthReady, initialize, login, register, logout }),
    [user, isAuthReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
