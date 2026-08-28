import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, ExternalLink, X, RefreshCw, CheckCircle } from 'lucide-react';

export const DevEmailInbox = () => {
  const { devEmails, fetchDevEmails, showDevDrawer, setShowDevDrawer } = useAuth();

  if (!showDevDrawer) {
    return (
      <button
        onClick={() => {
          fetchDevEmails();
          setShowDevDrawer(true);
        }}
        className="fixed bottom-4 right-4 bg-nyora-600/90 hover:bg-nyora-500 text-white text-xs font-semibold px-3 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-nyora-400/30 backdrop-blur-md transition-all z-50 group"
      >
        <Mail className="w-4 h-4 text-nyora-200 group-hover:scale-110 transition-transform" />
        <span>Dev Verification Inbox ({devEmails.length})</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900/95 border-l border-slate-800 backdrop-blur-2xl shadow-2xl z-50 flex flex-col transition-all">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-nyora-500/10 rounded-lg border border-nyora-500/20">
            <Mail className="w-5 h-5 text-nyora-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Dev Email Inbox</h3>
            <p className="text-xs text-slate-400">Verification & Password Reset Links</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchDevEmails}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Refresh inbox"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowDevDrawer(false)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {devEmails.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No emails generated yet. Sign up or request a password reset to see emails here.
          </div>
        ) : (
          devEmails.map((email) => (
            <div 
              key={email.id}
              className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-nyora-500/40 transition-all space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className={`px-2 py-0.5 rounded-md font-semibold ${
                  email.type === 'VERIFICATION' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {email.type}
                </span>
                <span className="text-slate-500 text-[10px]">
                  {new Date(email.sent_at).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-xs">
                <p className="text-slate-400">To: <span className="text-white font-medium">{email.to_email}</span></p>
                <p className="text-slate-300 font-semibold mt-0.5">{email.subject}</p>
              </div>
              <a
                href={email.action_url}
                onClick={() => setShowDevDrawer(false)}
                className="mt-2 w-full inline-flex items-center justify-center gap-1.5 bg-nyora-600 hover:bg-nyora-500 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
              >
                <span>Click Verification / Reset Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-500 text-center">
        This inbox simulates outgoing emails locally for instant verification testing.
      </div>
    </div>
  );
};
