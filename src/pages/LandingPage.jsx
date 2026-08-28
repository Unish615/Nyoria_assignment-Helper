import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle, 
  ShieldCheck, 
  Database, 
  FileText, 
  HelpCircle, 
  Files, 
  ArrowRight,
  Zap,
  Lock
} from 'lucide-react';

export const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden bg-slate-950">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-nyora-500/15 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-nyora-500/10 border border-nyora-500/20 rounded-full text-nyora-300 text-xs font-semibold mb-8 shadow-lg shadow-nyora-500/5 animate-fade-in">
          <Sparkles className="w-4 h-4" />
          <span>Real Database & Production-Ready Auth</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight font-outfit leading-tight">
          Create Smarter Academic <br className="hidden sm:block" />
          Assignments with <span className="gradient-text">Nyora</span>
        </h1>

        <p className="mt-6 text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          The ultimate intelligent study suite. Generate analytical essays, analyze sample research papers, build custom question banks, and master academic topics with secure user data isolation.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-gradient-to-r from-nyora-600 to-nyora-500 hover:from-nyora-500 hover:to-nyora-400 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-nyora-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>Go to User Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-nyora-600 to-nyora-500 hover:from-nyora-500 hover:to-nyora-400 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-nyora-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>Get Started — Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-base px-8 py-4 rounded-2xl border border-slate-800 flex items-center gap-2 transition-colors"
              >
                <span>Log In</span>
              </Link>
            </>
          )}
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 glass-card-hover space-y-3">
            <div className="w-12 h-12 bg-nyora-500/10 rounded-2xl flex items-center justify-center text-nyora-400 border border-nyora-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-outfit">Assignment Creator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate structured research papers, lab reports, and essays with custom word counts and citations.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-800 glass-card-hover space-y-3">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
              <Files className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-outfit">Sample Analysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload reference assignments to extract writing metrics, vocabulary density, and structural profiles.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-800 glass-card-hover space-y-3">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-outfit">Question Generator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Build custom MCQ quizzes, short-answer exam banks, and complete answer keys in seconds.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-800 glass-card-hover space-y-3">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-outfit">User Data Isolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Relational DB schema guarantees your assignments and study data remain 100% private to your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
