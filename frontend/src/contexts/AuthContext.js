import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('heirloom_token'));
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  // Update axios headers when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      localStorage.setItem('heirloom_token', token);
    } else {
      delete api.defaults.headers.Authorization;
      localStorage.removeItem('heirloom_token');
    }
  }, [token, api.defaults.headers]);

  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const stored = localStorage.getItem('heirloom_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const createVault = async (data) => {
    const response = await api.post('/vaults/create', data);
    const { token: newToken, ...userData } = response.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('heirloom_user', JSON.stringify(userData));
    return response.data;
  };

  const joinVault = async (data) => {
    const response = await api.post('/vaults/join', data);
    const { token: newToken, ...userData } = response.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('heirloom_user', JSON.stringify(userData));
    return response.data;
  };

  const login = async (data) => {
    const response = await api.post('/vaults/login', data);
    const { token: newToken, ...userData } = response.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('heirloom_user', JSON.stringify(userData));
    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('heirloom_token');
    localStorage.removeItem('heirloom_user');
  };

  const value = {
    user,
    token,
    loading,
    api,
    createVault,
    joinVault,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
