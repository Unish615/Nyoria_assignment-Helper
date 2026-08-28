import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

export const LoginPage = () => {
  const { login, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUnverified(false);
    setResendMsg('');

    if (!formData.email || !formData.password) {
      setError('Invalid email or password.');
      return;
    }

    try {
      setLoading(true);
      await login({
        email: formData.email.trim(),
        password: formData.password
      });

      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.message || 'Invalid email or password.';
      setError(msg);
      if (msg.toLowerCase().includes('verify your email')) {
        setIsUnverified(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendMsg('Sending verification link...');
      await resendVerification(formData.email.trim());
      setResendMsg('Verification email sent! Check your inbox or Dev Email Inbox drawer.');
    } catch (err) {
      setResendMsg(err.message || 'Failed to resend verification link.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-nyora-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-nyora-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-nyora-500/20 border border-nyora-400/30">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-outfit">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Log in to access your saved assignments & study tools.
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-red-400 text-xs leading-relaxed animate-shake">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{error}</span>
                  {isUnverified && (
                    <div className="mt-2 pt-2 border-t border-red-500/20 flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={handleResend}
                        className="text-nyora-300 hover:text-nyora-200 underline text-xs font-medium text-left flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend Verification Email</span>
                      </button>
                      {resendMsg && <p className="text-slate-300 text-[11px]">{resendMsg}</p>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  required
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-nyora-500 focus:ring-1 focus:ring-nyora-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-nyora-400 hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-nyora-500 focus:ring-1 focus:ring-nyora-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-nyora-600 to-nyora-500 hover:from-nyora-500 hover:to-nyora-400 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-nyora-600/30 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? 'Logging In...' : 'Log In'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Create Account Link */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-nyora-400 font-semibold hover:underline">
                  Create an Account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
