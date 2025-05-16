import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserRole, getToken, saveToken, removeToken } from '../utils/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing login on mount
  useEffect(() => {
    try {
      const token = getToken();
      if (token) {
        const role = getUserRole();
        setUser({ token, role });
      }
    } catch (error) {
      console.error('Error restoring auth state:', error);
      removeToken(); // Clear invalid token
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function that stores token and sets user state
  const login = async (token) => {
    try {
      if (!token) {
        throw new Error('Invalid token');
      }
      
      saveToken(token);
      const role = getUserRole();
      setUser({ token, role });
      return { token, role };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
