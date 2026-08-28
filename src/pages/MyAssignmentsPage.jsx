import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  FilePlus, 
  Trash2, 
  Edit3, 
  Clock, 
  Loader2, 
  BookOpen,
  Filter
} from 'lucide-react';

export const MyAssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/assignments');
      const data = await res.json();
      if (res.ok) {
        setAssignments(data.assignments || []);
        setFilteredAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = assignments;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.topic.toLowerCase().includes(q) ||
        a.subject.toLowerCase().includes(q)
      );
    }

    if (selectedSubject !== 'All') {
      result = result.filter(a => a.subject === selectedSubject);
    }

    setFilteredAssignments(result);
  }, [search, selectedSubject, assignments]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      setDeletingId(id);
      const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAssignments(assignments.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete assignment:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const subjectsList = ['All', ...new Set(assignments.map(a => a.subject))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-outfit">My Assignments</h1>
          <p className="text-slate-400 text-sm mt-1">
            Access, edit, and export your saved academic papers.
          </p>
        </div>

        <Link
          to="/create-assignment"
          className="bg-nyora-600 hover:bg-nyora-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-nyora-600/30 flex items-center gap-2 text-sm self-start sm:self-auto"
        >
          <FilePlus className="w-4 h-4" />
          <span>Create New Assignment</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, topic, or subject..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-nyora-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-nyora-500"
          >
            {subjectsList.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-nyora-400 animate-spin mx-auto mb-2" />
          <p className="text-slate-400 text-xs font-medium">Retrieving saved assignments...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center border border-slate-800 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white font-outfit">No Assignments Found</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            {search ? 'No assignments match your filter criteria.' : 'You haven’t generated any assignments yet.'}
          </p>
          {!search && (
            <Link
              to="/create-assignment"
              className="inline-flex items-center gap-2 bg-nyora-600 hover:bg-nyora-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl"
            >
              <FilePlus className="w-4 h-4" />
              <span>Create Assignment</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((a) => (
            <div 
              key={a.id}
              className="glass-card p-6 rounded-2xl border border-slate-800 glass-card-hover flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-nyora-500/10 border border-nyora-500/20 text-nyora-300 text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {a.subject}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base line-clamp-2 font-outfit">
                  {a.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  Topic: {a.topic} • {a.grade} level • {a.assignment_type}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {a.word_count} words
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete Assignment"
                  >
                    {deletingId === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                  <Link
                    to={`/assignment-editor?id=${a.id}`}
                    className="bg-nyora-600/90 hover:bg-nyora-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
