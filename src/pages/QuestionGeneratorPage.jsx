import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export const QuestionGeneratorPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    subject: 'Computer Science',
    topic: '',
    grade: 'Undergraduate',
    question_type: 'Multiple Choice',
    count: 5
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
      setError('Please provide a Question Set Title and Topic.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate questions');

      navigate('/question-papers');
    } catch (err) {
      setError(err.message || 'Error generating question set.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto text-cyan-400 border border-cyan-500/20">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white font-outfit">Question Set Generator</h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Generate custom quiz papers, multiple choice question banks, short-answer exams, and detailed answer keys.
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

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Question Set Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Midterm Exam Prep: Data Structures & Algorithms"
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Subject Area *
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Biology">Biology</option>
                <option value="Business & Finance">Business & Finance</option>
                <option value="Psychology">Psychology</option>
                <option value="General Science">General Science</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Grade / Target Level *
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="High School">High School</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Topic / Exam Chapter *
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g., Binary Search Trees, Time Complexity, Recursion"
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Question Format
              </label>
              <select
                name="question_type"
                value={formData.question_type}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Multiple Choice">Multiple Choice (MCQ)</option>
                <option value="Short Answer">Short Answer Questions</option>
                <option value="Essay Prompts">Essay Prompts & Rubrics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Number of Questions
              </label>
              <select
                name="count"
                value={formData.count}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="5">5 Questions</option>
                <option value="10">10 Questions</option>
                <option value="15">15 Questions</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-nyora-500 hover:from-cyan-500 hover:to-nyora-400 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2 text-base disabled:opacity-50"
          >
            {loading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>Building Question Set & Answer Key...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Question Set</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
