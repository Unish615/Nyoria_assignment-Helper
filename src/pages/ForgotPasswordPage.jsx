import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message, devLink }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setStatus(null);
      const res = await forgotPassword(email.trim());
      setStatus({
        type: 'success',
        message: 'A password reset link has been dispatched to your email address.',
        devLink: res.dev_reset_link
      });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.message || 'Failed to process request.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-nyora-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-nyora-500/20 border border-nyora-400/30">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-outfit">
            Forgot Password?
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Enter your account email to receive a secure password reset link.
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl">
          {status?.type === 'success' ? (
            <div className="text-center space-y-5">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white font-outfit">Reset Link Sent</h2>
              <p className="text-slate-300 text-xs leading-relaxed">{status.message}</p>
              
              {status.devLink && (
                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-2">
                  <p className="text-slate-400 text-[11px]">Local Dev Direct Link:</p>
                  <a
                    href={status.devLink}
                    className="inline-flex items-center gap-1.5 text-nyora-300 hover:text-nyora-200 font-semibold break-all text-xs"
                  >
                    <span>Click Here to Reset Password</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="pt-2">
                <Link to="/login" className="text-xs text-slate-400 hover:text-white font-medium">
                  Return to Log In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {status?.type === 'error' && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{status.message}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Your Account Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-nyora-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-nyora-600 hover:bg-nyora-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-nyora-600/30 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? 'Sending Link...' : 'Send Reset Link'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs text-slate-400 hover:text-white font-medium">
                  Back to Log In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
