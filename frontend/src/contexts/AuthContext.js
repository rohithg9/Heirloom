import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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

  // Create api instance with useMemo to recreate when token changes
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
    });
    
    // Add token to headers if exists
    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    return instance;
  }, [token]);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
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
        // Clear invalid data
        localStorage.removeItem('heirloom_token');
        localStorage.removeItem('heirloom_user');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, [token]);

  const createVault = async (data) => {
    const response = await axios.post(`${API_URL}/vaults/create`, data);
    const { token: newToken, ...userData } = response.data;
    
    // Save to localStorage first
    localStorage.setItem('heirloom_token', newToken);
    localStorage.setItem('heirloom_user', JSON.stringify(userData));
    
    // Then update state
    setToken(newToken);
    setUser(userData);
    
    return response.data;
  };

  const joinVault = async (data) => {
    const response = await axios.post(`${API_URL}/vaults/join`, data);
    const { token: newToken, ...userData } = response.data;
    
    localStorage.setItem('heirloom_token', newToken);
    localStorage.setItem('heirloom_user', JSON.stringify(userData));
    
    setToken(newToken);
    setUser(userData);
    
    return response.data;
  };

  const login = async (data) => {
    const response = await axios.post(`${API_URL}/vaults/login`, data);
    const { token: newToken, ...userData } = response.data;
    
    localStorage.setItem('heirloom_token', newToken);
    localStorage.setItem('heirloom_user', JSON.stringify(userData));
    
    setToken(newToken);
    setUser(userData);
    
    return response.data;
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('heirloom_token');
    localStorage.removeItem('heirloom_user');
  }, []);

  const isAuthenticated = !!token && !!user;

  const value = useMemo(() => ({
    user,
    token,
    loading,
    api,
    createVault,
    joinVault,
    login,
    logout,
    isAuthenticated,
  }), [user, token, loading, api, logout, isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
