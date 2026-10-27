import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount and verify token
  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = localStorage.getItem('smartslot_auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.token && parsed.user) {
            setUser(parsed.user);
            setToken(parsed.token);
            // Optionally refresh profile
            try {
              const res = await api.get('/auth/me');
              if (res.data?.user) {
                setUser(res.data.user);
              }
            } catch (e) {
              // Token expired or invalid
              localStorage.removeItem('smartslot_auth');
              setUser(null);
              setToken(null);
            }
          }
        }
      } catch (err) {
        console.error('Failed to restore auth', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('smartslot_auth', JSON.stringify({ user: data.user, token: data.token }));
      toast.success(`Welcome back, ${data.user.name}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('smartslot_auth', JSON.stringify({ user: data.user, token: data.token }));
      toast.success('Account created successfully!');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartslot_auth');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
