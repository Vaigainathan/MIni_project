import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode and validate the token
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        // Check if token is expired
        if (decoded.exp && decoded.exp < currentTime) {
          console.log("Token expired, logging out");
          localStorage.removeItem('token');
          setUser(null);
        } else {
          // Valid token, set user state with role information
          setUser({
            id: decoded.id,
            username: decoded.username,
            role: decoded.role || 'guest',
            token
          });
          console.log("Restored auth from token, role:", decoded.role);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (token) => {
    if (!token) {
      throw new Error("No token provided");
    }
    
    try {
      localStorage.setItem('token', token);
      
      const decoded = jwtDecode(token);
      console.log("Decoded token during login:", decoded);
      
      setUser({
        id: decoded.id,
        username: decoded.username,
        role: decoded.role || 'guest',
        token
      });
      
      console.log("Login successful, role:", decoded.role);
      return decoded.role;
    } catch (error) {
      console.error("Login processing error:", error);
      localStorage.removeItem('token');
      throw new Error("Invalid login token");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    console.log("Logged out successfully");
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
