import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [devEmails, setDevEmails] = useState([]);
  const [showDevDrawer, setShowDevDrawer] = useState(false);

  // 1. Check Session on Mount
  const checkSession = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Session check error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
    fetchDevEmails();
  }, []);

  // Fetch Dev Email logs
  const fetchDevEmails = async () => {
    try {
      const res = await fetch('/api/auth/dev-emails');
      if (res.ok) {
        const data = await res.json();
        setDevEmails(data.emails || []);
      }
    } catch (err) {
      console.error('Failed to fetch dev emails:', err);
    }
  };

  // Sign Up
  const signup = async ({ full_name, email, password, confirm_password }) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password, confirm_password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Signup failed');
    }
    await fetchDevEmails();
    setShowDevDrawer(true);
    return data;
  };

  // Login
  const login = async ({ email, password }) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    setUser(data.user);
    return data;
  };

  // Logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  // Verify Email
  const verifyEmail = async (token) => {
    const res = await fetch(`/api/auth/verify-email?token=${token}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Verification failed');
    }
    await checkSession();
    return data;
  };

  // Resend Verification Email
  const resendVerification = async (email) => {
    const res = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to resend verification email');
    }
    await fetchDevEmails();
    setShowDevDrawer(true);
    return data;
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to process request');
    }
    await fetchDevEmails();
    setShowDevDrawer(true);
    return data;
  };

  // Reset Password
  const resetPassword = async ({ token, new_password, confirm_password }) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password, confirm_password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to reset password');
    }
    return data;
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update profile');
    }
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        updateProfile,
        devEmails,
        fetchDevEmails,
        showDevDrawer,
        setShowDevDrawer,
        checkSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
