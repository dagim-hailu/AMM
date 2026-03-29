import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const AUTH_STORAGE_KEY = 'amm_auth';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const authData = JSON.parse(stored) as AuthResponse;
        setUser(authData.user);
        
        // Validate token with backend
        validateToken(authData.accessToken).catch(() => {
          // Token invalid, clear storage
          logout();
        });
      } catch (err) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const authData = await response.json();
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      setUser(authData.user);
      return authData;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: string = 'staff'
  ): Promise<{ message: string; user: User }> => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    // Optional: Call backend logout endpoint
    fetch(`${API_URL}/auth/logout`, { method: 'POST' }).catch(console.error);
  };

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token }),
      });

      if (!response.ok) return false;
      
      const result = await response.json();
      return result.isValid;
    } catch {
      return false;
    }
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const hasRole = (requiredRole: string | string[]) => {
    if (!user) return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  };

  const hasAnyRole = (roles: string[]) => {
    return hasRole(roles);
  };

  const hasAllRoles = (roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };
}