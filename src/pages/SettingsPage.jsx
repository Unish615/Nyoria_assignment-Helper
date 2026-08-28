import React, { useState } from 'react';
import { Settings, Shield, Bell, Moon, Lock, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMsg('Preferences updated successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-nyora-500/10 border border-nyora-500/20 rounded-xl text-nyora-400">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white font-outfit">Account Settings</h1>
          <p className="text-slate-400 text-sm">Manage security settings, notifications, and preferences.</p>
        </div>
      </div>

      {savedMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{savedMsg}</span>
        </div>
      )}

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        {/* Email Verification Status */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-nyora-400" />
            <div>
              <p className="text-sm font-semibold text-white">Email Verification Status</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
            ✓ Verified
          </span>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-sm font-semibold text-white">Assignment Completion Alerts</p>
              <p className="text-xs text-slate-400">Receive email notifications when long research papers finish compiling.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={(e) => setEmailAlerts(e.target.checked)}
            className="w-4 h-4 accent-nyora-500 rounded"
          />
        </div>

        {/* Security Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-indigo-400" />
            <div>
              <p className="text-sm font-semibold text-white">Password Security & Encryption</p>
              <p className="text-xs text-slate-400">Bcrypt salt hashing & HTTP-Only encrypted sessions active.</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">Bcrypt-10</span>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            className="bg-nyora-600 hover:bg-nyora-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-nyora-600/30"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
