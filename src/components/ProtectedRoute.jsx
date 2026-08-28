import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2, Mail } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-nyora-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm animate-pulse font-medium">Verifying Nyora Session...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login, preserving intended path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.email_verified) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-yellow-500/30 text-center">
          <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
            <Mail className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Email Verification Required</h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Please verify your email address (<strong className="text-nyora-300">{user.email}</strong>) to access the Nyora Assignment Helper dashboard and tools.
          </p>
          <div className="flex flex-col gap-3">
            <a 
              href={`/verify-email?email=${encodeURIComponent(user.email)}`}
              className="bg-nyora-600 hover:bg-nyora-500 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-nyora-600/25"
            >
              Check Verification Status
            </a>
            <a 
              href="/login" 
              className="text-slate-400 hover:text-slate-200 text-xs mt-2 transition-colors"
            >
              Return to Log In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-nyora-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">Checking Admin Authorization...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-red-500/30 text-center">
          <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-300 text-sm mb-6">
            Administrator privileges are required to view the Admin Dashboard.
          </p>
          <a 
            href="/dashboard" 
            className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-4 rounded-xl inline-block transition-colors"
          >
            Return to User Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};
