import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  HelpCircle, 
  Files, 
  FilePlus, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  CheckCircle,
  PlusCircle,
  BookOpen
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ assignments: 0, questions: 0, samples: 0 });
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [asgnRes, qRes, smplRes] = await Promise.all([
        fetch('/api/assignments'),
        fetch('/api/questions'),
        fetch('/api/samples')
      ]);

      const asgnData = asgnRes.ok ? await asgnRes.json() : { assignments: [] };
      const qData = qRes.ok ? await qRes.json() : { questionSets: [] };
      const smplData = smplRes.ok ? await smplRes.json() : { samples: [] };

      const assignmentsList = asgnData.assignments || [];
      const questionList = qData.questionSets || [];
      const samplesList = smplData.samples || [];

      setStats({
        assignments: assignmentsList.length,
        questions: questionList.length,
        samples: samplesList.length
      });

      setRecentAssignments(assignmentsList.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="glass-card p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-nyora-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-nyora-500/10 border border-nyora-500/20 text-nyora-300 text-xs font-semibold rounded-full flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Verified Student Account
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-outfit">
              Welcome, <span className="gradient-text">{user?.full_name}</span>
            </h1>
            <p className="mt-2 text-slate-400 text-sm max-w-2xl leading-relaxed">
              Your intelligent academic workspace. Generate assignments, upload study samples, build question sets, and elevate your grades.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/create-assignment"
              className="bg-gradient-to-r from-nyora-600 to-nyora-500 hover:from-nyora-500 hover:to-nyora-400 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-lg shadow-nyora-600/30 flex items-center gap-2 text-sm"
            >
              <FilePlus className="w-4 h-4" />
              <span>Create Assignment</span>
            </Link>
            <Link
              to="/question-generator"
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-3 rounded-xl transition-all border border-slate-700 flex items-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4 text-nyora-400" />
              <span>Generate Questions</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link to="/my-assignments" className="glass-card p-6 rounded-2xl border border-slate-800 glass-card-hover block">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-nyora-500/10 rounded-xl border border-nyora-500/20">
              <FileText className="w-6 h-6 text-nyora-400" />
            </div>
            <span className="text-xs text-nyora-400 font-semibold flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-white font-outfit">{stats.assignments}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">My Assignments</p>
          </div>
        </Link>

        <Link to="/question-papers" className="glass-card p-6 rounded-2xl border border-slate-800 glass-card-hover block">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
              <HelpCircle className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-xs text-cyan-400 font-semibold flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-white font-outfit">{stats.questions}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Question Sets</p>
          </div>
        </Link>

        <Link to="/my-samples" className="glass-card p-6 rounded-2xl border border-slate-800 glass-card-hover block">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <Files className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-white font-outfit">{stats.samples}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Saved Samples</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity Timeline */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-nyora-400" />
            <h2 className="text-lg font-bold text-white font-outfit">Recent Activity</h2>
          </div>
          <Link to="/my-assignments" className="text-xs text-nyora-400 hover:underline font-semibold">
            View All Saved Content
          </Link>
        </div>

        {recentAssignments.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-semibold text-sm">No assignments generated yet</p>
            <p className="text-slate-500 text-xs mt-1 mb-4">Start by creating your first academic assignment or paper.</p>
            <Link
              to="/create-assignment"
              className="inline-flex items-center gap-2 bg-nyora-600 hover:bg-nyora-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Assignment</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAssignments.map((item) => (
              <div 
                key={item.id}
                className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-nyora-500/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-nyora-500/10 rounded-xl text-nyora-400 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Subject: <span className="text-slate-200">{item.subject}</span> • Grade: <span className="text-slate-200">{item.grade}</span> • Word Count: <span className="text-slate-200">{item.word_count} words</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-[11px] text-slate-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/assignment-editor?id=${item.id}`}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-nyora-300 font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                  >
                    Open Editor
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
