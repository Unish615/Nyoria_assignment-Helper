import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Loader2, Mail, ArrowRight } from 'lucide-react';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');
  const { verifyEmail, resendVerification } = useAuth();

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState(emailParam || '');
  const [resendStatus, setResendStatus] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided. Please check your verification link.');
      return;
    }

    let isMounted = true;
    verifyEmail(token)
      .then((res) => {
        if (isMounted) {
          setStatus('success');
          setMessage(res.message || 'Email Verified Successfully! You may now log in.');
        }
      })
      .catch((err) => {
        if (isMounted) {
          setStatus('error');
          setMessage(err.message || 'Email verification failed or token has expired.');
        }
      });

    return () => { isMounted = false; };
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;
    try {
      setResendStatus('Sending new verification link...');
      await resendVerification(resendEmail.trim());
      setResendStatus('Verification email sent! Check your inbox or Dev Email Inbox drawer.');
    } catch (err) {
      setResendStatus(err.message || 'Failed to resend verification link.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-950">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-slate-800 text-center space-y-6">
        {status === 'verifying' && (
          <div className="py-8 space-y-4">
            <Loader2 className="w-12 h-12 text-nyora-400 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white font-outfit">Verifying Your Email...</h2>
            <p className="text-slate-400 text-xs">Connecting to Nyora Database...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white font-outfit">Email Verified Successfully</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
            <Link
              to="/login"
              className="w-full bg-nyora-600 hover:bg-nyora-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-nyora-600/30 inline-flex items-center justify-center gap-2 text-sm"
            >
              <span>Proceed to Log In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white font-outfit">Verification Failed</h2>
            <p className="text-red-400 text-sm leading-relaxed">{message}</p>

            <form onSubmit={handleResend} className="pt-4 border-t border-slate-800 space-y-3 text-left">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Resend Verification Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-nyora-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-700 text-nyora-300 text-xs font-semibold py-2.5 rounded-xl transition-colors"
              >
                Send New Link
              </button>
              {resendStatus && <p className="text-slate-300 text-xs text-center mt-2">{resendStatus}</p>}
            </form>

            <div className="pt-2">
              <Link to="/login" className="text-xs text-slate-400 hover:text-white">
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
