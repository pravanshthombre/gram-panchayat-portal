/**
 * AuthContext.jsx — Authentication State Management
 * Provides login, signup, logout, and user state across the app
 */
import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for existing token and fetch user
  useEffect(() => {
    const token = localStorage.getItem('gp_token');
    if (token) {
      API.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => { localStorage.removeItem('gp_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      if (!res.data || !res.data.token) {
        throw new Error('Invalid response from server.');
      }
      localStorage.setItem('gp_token', res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Login failed. Server may be unavailable.';
      const error = new Error(message);
      error.response = err.response;
      throw error;
    }
  };

  const signup = async (data) => {
    try {
      const res = await API.post('/auth/signup', data);
      if (!res.data || !res.data.token) {
        throw new Error('Invalid response from server.');
      }
      localStorage.setItem('gp_token', res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Registration failed. Server may be unavailable.';
      const error = new Error(message);
      error.response = err.response;
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('gp_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
