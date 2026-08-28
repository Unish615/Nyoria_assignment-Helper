import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  FilePlus, 
  Files, 
  FileText, 
  HelpCircle, 
  User, 
  LogOut, 
  Shield, 
  Settings, 
  Star, 
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-nyora-600 via-nyora-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-nyora-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1 font-outfit">
                Nyora <span className="text-nyora-400 font-medium">Assignment</span>
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 tracking-wider uppercase font-medium">Academic Helper</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {user ? (
            <div className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link 
                to="/dashboard" 
                className={`px-3 py-2 rounded-lg transition-colors ${isActive('/dashboard') ? 'text-nyora-300 bg-slate-800/80' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/create-assignment" 
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${isActive('/create-assignment') ? 'text-nyora-300 bg-slate-800/80' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}
              >
                <FilePlus className="w-4 h-4 text-nyora-400" />
                <span>Create</span>
              </Link>
              <Link 
                to="/my-assignments" 
                className={`px-3 py-2 rounded-lg transition-colors ${isActive('/my-assignments') ? 'text-nyora-300 bg-slate-800/80' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}
              >
                Assignments
              </Link>
              <Link 
                to="/my-samples" 
                className={`px-3 py-2 rounded-lg transition-colors ${isActive('/my-samples') ? 'text-nyora-300 bg-slate-800/80' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}
              >
                Samples
              </Link>
              <Link 
                to="/document-generator" 
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${isActive('/document-generator') ? 'text-nyora-300 bg-slate-800/80' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>PDF Generator</span>
              </Link>
              <Link 
                to="/download-history" 
                className={`px-3 py-2 rounded-lg transition-colors ${isActive('/download-history') ? 'text-nyora-300 bg-slate-800/80' : 'text-slate-300 hover:text-white hover:bg-slate-900'}`}
              >
                History
              </Link>
              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 text-amber-400 hover:bg-amber-500/10 ${isActive('/admin') ? 'bg-amber-500/20' : ''}`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4 text-sm font-medium">
              <Link to="/login" className="text-slate-300 hover:text-white transition-colors">
                Log In
              </Link>
              <Link 
                to="/signup" 
                className="bg-nyora-600 hover:bg-nyora-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-nyora-600/20 font-semibold"
              >
                Create Account
              </Link>
            </div>
          )}

          {/* User Profile & Logout */}
          {user && (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-900 transition-colors group">
                <img 
                  src={user.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                  alt={user.full_name} 
                  className="w-9 h-9 rounded-full object-cover border border-nyora-500/40 group-hover:border-nyora-400"
                />
                <div className="text-left text-xs">
                  <div className="font-semibold text-white group-hover:text-nyora-300 transition-colors flex items-center gap-1">
                    {user.full_name}
                    {user.email_verified && <CheckCircle className="w-3.5 h-3.5 text-nyora-400" />}
                  </div>
                  <span className="text-[10px] text-slate-400 block">{user.role === 'admin' ? 'Administrator' : 'Student Account'}</span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 p-4 space-y-3">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl mb-3">
                <img src={user.profile_image} alt={user.full_name} className="w-10 h-10 rounded-full border border-nyora-400" />
                <div>
                  <p className="text-white font-semibold text-sm">{user.full_name}</p>
                  <p className="text-slate-400 text-xs">{user.email}</p>
                </div>
              </div>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white">Dashboard</Link>
              <Link to="/create-assignment" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-nyora-400 font-medium">Create Assignment</Link>
              <Link to="/my-assignments" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white">My Assignments</Link>
              <Link to="/my-samples" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white">My Samples</Link>
              <Link to="/question-generator" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white">Question Generator</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white">My Profile</Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-amber-400 font-medium">Admin Dashboard</Link>
              )}
              <button onClick={handleLogout} className="w-full text-left py-2 text-red-400 font-medium">Log Out</button>
            </>
          ) : (
            <div className="space-y-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-center py-2 bg-slate-900 rounded-xl text-white font-medium">Log In</Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block text-center py-2 bg-nyora-600 rounded-xl text-white font-semibold">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
