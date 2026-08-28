import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Users, 
  CheckCircle, 
  FileText, 
  HelpCircle, 
  Activity, 
  Trash2, 
  ShieldAlert, 
  UserCheck, 
  Loader2, 
  RefreshCw 
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users')
      ]);

      if (!statsRes.ok || !usersRes.ok) {
        throw new Error('Server-side admin verification failed.');
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      setStats(statsData.stats);
      setUsers(usersData.users || []);
    } catch (err) {
      setError(err.message || 'Access denied or server error.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerify = async (userId, currentVerified) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !currentVerified })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to toggle user verification:', err);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change role of user to ${newRole}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update role');
        return;
      }
      fetchAdminData();
    } catch (err) {
      console.error('Failed to update user role:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete user');
        return;
      }
      fetchAdminData();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white font-outfit">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm">Server-Verified Administrator Control Panel</p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">Executing Server-Side Role Verification...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-8 rounded-3xl border border-red-500/30 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Administrator Verification Error</h2>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      ) : (
        <>
          {/* Admin Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>TOTAL USERS</span>
                <Users className="w-4 h-4 text-nyora-400" />
              </div>
              <p className="text-2xl font-extrabold text-white mt-3 font-outfit">{stats?.totalUsers}</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>VERIFIED USERS</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-400 mt-3 font-outfit">{stats?.verifiedUsers}</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>ASSIGNMENTS</span>
                <FileText className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-extrabold text-white mt-3 font-outfit">{stats?.totalAssignments}</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>QUESTIONS</span>
                <HelpCircle className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-extrabold text-white mt-3 font-outfit">{stats?.totalQuestions}</p>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>ACTIVE (7d)</span>
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-extrabold text-amber-400 mt-3 font-outfit">{stats?.activeUsers}</p>
            </div>
          </div>

          {/* User Management Table */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <h2 className="text-lg font-bold text-white font-outfit">User Account Directory ({users.length})</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Email Verification</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Created Date</th>
                    <th className="p-3.5">Last Login</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-medium text-white flex items-center gap-2.5">
                        <img src={u.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} alt={u.full_name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="font-semibold text-white">{u.full_name}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleVerify(u.id, Boolean(u.email_verified))}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                            u.email_verified
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20'
                          }`}
                        >
                          {u.email_verified ? '✓ Verified' : '⚠ Unverified (Click to verify)'}
                        </button>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleRole(u.id, u.role)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            u.role === 'admin'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {u.role}
                        </button>
                      </td>
                      <td className="p-3.5 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="p-3.5 text-slate-400">
                        {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
