import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PasswordStrengthMeter, checkPasswordRequirements } from '../components/PasswordStrengthMeter';
import { BookOpen, User, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';

export const SignUpPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validateFrontend = () => {
    if (!formData.full_name.trim()) {
      return 'Please enter your full name.';
    }
    
    const email = formData.email.trim();
    // Strict email check matching requirements
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      return 'Please enter a valid email address.';
    }

    const reqs = checkPasswordRequirements(formData.password);
    if (!reqs.isValid) {
      return 'Password must contain at least 8 characters, including uppercase, lowercase and a number.';
    }

    if (formData.password !== formData.confirm_password) {
      return 'Passwords do not match.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    const clientError = validateFrontend();
    if (clientError) {
      setError(clientError);
      return;
    }

    try {
      setLoading(true);
      const res = await signup({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password
      });

      setSuccess({
        message: "We've sent a verification link to your email address.",
        email: formData.email.trim(),
        link: res.dev_verification_link
      });
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-nyora-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-nyora-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-nyora-500/20 border border-nyora-400/30">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-outfit">
            Create Your Account
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Welcome to <span className="text-nyora-300 font-semibold">Nyora</span> — Create smarter assignments with ease.
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl">
          {success ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white font-outfit">Verify Your Email</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                {success.message}
              </p>
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <p className="text-slate-400">Target Email Address:</p>
                <p className="font-semibold text-nyora-300 text-sm">{success.email}</p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  Click the link sent to your inbox, or use the <strong>Dev Email Inbox</strong> drawer at the bottom-right of your screen to activate your account.
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                {success.link && (
                  <a
                    href={success.link}
                    className="w-full bg-nyora-600 hover:bg-nyora-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-nyora-600/30 flex items-center justify-center gap-2 text-sm"
                  >
                    <span>Open Verification Link Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
                <Link
                  to="/login"
                  className="text-slate-400 hover:text-white text-xs font-medium transition-colors"
                >
                  Already verified? Proceed to Log In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Alert */}
              {error && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-red-400 text-xs leading-relaxed animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    required
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-nyora-500 focus:ring-1 focus:ring-nyora-500 transition-all"
                  />
                </div>
              </div>

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
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
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
                {/* Strength Meter */}
                <PasswordStrengthMeter password={formData.password} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-nyora-500 focus:ring-1 focus:ring-nyora-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirm_password && formData.password !== formData.confirm_password && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match.</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-nyora-600 to-nyora-500 hover:from-nyora-500 hover:to-nyora-400 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-nyora-600/30 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Login Link */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-nyora-400 font-semibold hover:underline">
                    Log In
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
