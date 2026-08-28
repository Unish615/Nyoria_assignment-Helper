import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, Sparkles, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';

export const CreateAssignmentPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    subject: 'Computer Science',
    topic: '',
    grade: 'Undergraduate',
    language: 'English',
    assignment_type: 'Essay',
    word_count: 500
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.topic.trim()) {
      setError('Please fill in both Assignment Title and Topic.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate assignment');
      }

      // Redirect to assignment editor
      navigate(`/assignment-editor?id=${data.assignment.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create assignment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-nyora-500/10 rounded-2xl flex items-center justify-center mx-auto text-nyora-400 border border-nyora-500/20">
          <FilePlus className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white font-outfit">Create New Assignment</h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Specify your paper title, subject parameters, and word count target to generate a complete academic paper.
        </p>
      </div>

      {/* Generator Form */}
      <div className="glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Assignment Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., The Impact of Artificial Intelligence on Modern Software Engineering"
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-nyora-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Subject Area *
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-nyora-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Business & Management">Business & Management</option>
                <option value="Psychology">Psychology</option>
                <option value="Economics">Economics</option>
                <option value="Literature">Literature</option>
                <option value="History">History</option>
                <option value="Biology & Health">Biology & Health</option>
                <option value="Sociology">Sociology</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>

            {/* Academic Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Grade / Academic Level *
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-nyora-500"
              >
                <option value="High School">High School</option>
                <option value="Undergraduate">Undergraduate (Bachelor)</option>
                <option value="Postgraduate">Postgraduate (Master)</option>
                <option value="Doctoral / PhD">Doctoral / PhD</option>
              </select>
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Specific Topic / Focus Keywords *
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g., Large Language Models, Automated Code Generation, Algorithmic Ethics"
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-nyora-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Assignment Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Assignment Type
              </label>
              <select
                name="assignment_type"
                value={formData.assignment_type}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-nyora-500"
              >
                <option value="Essay">Analytical Essay</option>
                <option value="Research Paper">Research Paper</option>
                <option value="Case Study">Case Study Analysis</option>
                <option value="Literature Review">Literature Review</option>
                <option value="Lab Report">Lab Report</option>
              </select>
            </div>

            {/* Target Word Count */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Word Count
              </label>
              <input
                type="number"
                name="word_count"
                value={formData.word_count}
                onChange={handleChange}
                min="250"
                max="5000"
                step="50"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-nyora-500"
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Language
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-nyora-500"
              >
                <option value="English">English (US/UK)</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-nyora-600 to-nyora-500 hover:from-nyora-500 hover:to-nyora-400 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-xl shadow-nyora-600/30 flex items-center justify-center gap-2 text-base disabled:opacity-50"
          >
            {loading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin text-white" />
                <span>Generating Assignment Paper...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-nyora-200" />
                <span>Generate Assignment Content</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
