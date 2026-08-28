import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { User, Mail, Shield, CheckCircle, Lock, Eye, EyeOff, Camera, AlertCircle, Check } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [profileImage, setProfileImage] = useState(user?.profile_image || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const avatarPresets = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      await updateProfile({
        full_name: fullName,
        profile_image: profileImage,
        current_password: currentPassword || undefined,
        new_password: newPassword || undefined,
        confirm_password: confirmPassword || undefined
      });

      setSuccess('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white font-outfit">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your personal details, avatar, and security credentials.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-8">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
          <div className="relative group">
            <img
              src={profileImage || avatarPresets[0]}
              alt={user?.full_name}
              className="w-24 h-24 rounded-full object-cover border-2 border-nyora-400 shadow-xl"
            />
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-2 font-outfit">
              {user?.full_name}
              {user?.email_verified && <CheckCircle className="w-5 h-5 text-nyora-400" />}
            </h2>
            <div className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1">
              <Mail className="w-3.5 h-3.5" />
              <span>Email: <strong className="text-slate-200">{user?.email}</strong></span>
              {user?.email_verified && <span className="text-emerald-400 font-bold ml-1">✓ Verified</span>}
            </div>
            <p className="text-[11px] text-slate-500">
              Account Created: {new Date(user?.created_at).toLocaleDateString()} • Role: <span className="uppercase font-bold text-nyora-300">{user?.role}</span>
            </p>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-400 text-xs">
              <Check className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Choose Avatar */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Choose Profile Image Avatar
            </label>
            <div className="flex items-center gap-4 flex-wrap">
              {avatarPresets.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Avatar ${idx}`}
                  onClick={() => setProfileImage(url)}
                  className={`w-12 h-12 rounded-full object-cover cursor-pointer border-2 transition-all ${
                    profileImage === url ? 'border-nyora-400 ring-2 ring-nyora-400/30 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-nyora-500"
            />
          </div>

          {/* Password Change Section */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-outfit">
              <Lock className="w-4 h-4 text-nyora-400" />
              Change Password (Optional)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Leave blank if not changing"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-nyora-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-nyora-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrengthMeter password={newPassword} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-nyora-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-nyora-600 hover:bg-nyora-500 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-nyora-600/30 text-sm disabled:opacity-50"
          >
            {loading ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
