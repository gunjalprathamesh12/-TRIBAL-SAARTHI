import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('tribal_saarthi_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user data on startup if token is present
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.success && res.data) {
          setUser(res.data.user);
          setProfile(res.data.profile);
        }
      } catch (err) {
        console.error('Session restore failed:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      localStorage.setItem('tribal_saarthi_token', res.data.token);
      setToken(res.data.token);
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        mobile: res.data.mobile,
        role: res.data.role,
        department: res.data.department,
        designation: res.data.designation,
        isDemoAccount: res.data.isDemoAccount,
      });
      return res.data;
    }
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.data) {
      localStorage.setItem('tribal_saarthi_token', res.data.token);
      setToken(res.data.token);
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        mobile: res.data.mobile,
        role: res.data.role,
      });
      return res.data;
    }
  };

  // Instant one-click demo role switcher for SIH evaluators
  const switchDemoRole = async (targetRole) => {
    try {
      const res = await api.post('/auth/demo-switch', { role: targetRole });
      if (res.success && res.data) {
        localStorage.setItem('tribal_saarthi_token', res.data.token);
        setToken(res.data.token);
        setUser({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          mobile: res.data.mobile,
          role: res.data.role,
          department: res.data.department,
          designation: res.data.designation,
          isDemoAccount: true,
        });
        return res.data;
      }
    } catch (err) {
      console.error('Failed to switch demo role:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('tribal_saarthi_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
