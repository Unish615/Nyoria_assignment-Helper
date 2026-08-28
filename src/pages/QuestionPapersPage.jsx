import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Trash2, Eye, EyeOff, Loader2, Sparkles, BookOpen } from 'lucide-react';

export const QuestionPapersPage = () => {
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSet, setSelectedSet] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    fetchQuestionSets();
  }, []);

  const fetchQuestionSets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/questions');
      const data = await res.json();
      if (res.ok) {
        setQuestionSets(data.questionSets || []);
        if (data.questionSets?.length > 0) {
          setSelectedSet(data.questionSets[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch question sets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question set?')) return;
    try {
      const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const updated = questionSets.filter(q => q.id !== id);
        setQuestionSets(updated);
        if (selectedSet?.id === id) setSelectedSet(updated[0] || null);
      }
    } catch (err) {
      console.error('Failed to delete question set:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-outfit">My Question Sets</h1>
          <p className="text-slate-400 text-sm mt-1">
            Access generated question banks, practice exams, and official answer keys.
          </p>
        </div>
        <Link
          to="/question-generator"
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-600/30 flex items-center gap-2 text-sm self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate New Question Set</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
          <p className="text-slate-400 text-xs font-medium">Retrieving question papers...</p>
        </div>
      ) : questionSets.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center border border-slate-800 space-y-4">
          <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white font-outfit">No Question Sets Created</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            You haven't generated any practice question papers yet.
          </p>
          <Link
            to="/question-generator"
            className="inline-flex items-center gap-2 bg-cyan-600 text-white font-semibold text-xs py-2.5 px-4 rounded-xl"
          >
            <span>Create First Question Set</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Question Sets Sidebar */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Saved Papers ({questionSets.length})</h2>
            {questionSets.map((qs) => (
              <div
                key={qs.id}
                onClick={() => {
                  setSelectedSet(qs);
                  setShowAnswers(false);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedSet?.id === qs.id
                    ? 'bg-cyan-500/10 border-cyan-400'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] font-bold rounded uppercase">
                      {qs.question_type}
                    </span>
                    <h3 className="font-bold text-white text-sm line-clamp-1">{qs.title}</h3>
                    <p className="text-[11px] text-slate-400">{qs.subject} • {qs.grade}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(qs.id);
                    }}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paper View */}
          {selectedSet && (
            <div className="lg:col-span-2 glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white font-outfit">{selectedSet.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Subject: <span className="text-slate-200">{selectedSet.subject}</span> • Topic: <span className="text-slate-200">{selectedSet.topic}</span>
                  </p>
                </div>

                <button
                  onClick={() => setShowAnswers(!showAnswers)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-300 rounded-xl flex items-center gap-1.5 self-start sm:self-auto"
                >
                  {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showAnswers ? 'Hide Answer Key' : 'Show Answer Key'}</span>
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {(() => {
                  try {
                    const qList = JSON.parse(selectedSet.questions);
                    const aList = JSON.parse(selectedSet.answers);

                    return qList.map((q, idx) => (
                      <div key={idx} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-3 text-xs">
                        <p className="font-semibold text-slate-100 text-sm">
                          Q{idx + 1}: {q.question}
                        </p>

                        {q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-300">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        {showAnswers && aList[idx] && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 space-y-1 mt-2">
                            <p className="font-bold text-xs">Answer Key:</p>
                            <p className="font-medium">{aList[idx].answer}</p>
                            {aList[idx].explanation && (
                              <p className="text-[11px] text-slate-300">Explanation: {aList[idx].explanation}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ));
                  } catch (e) {
                    return <p className="text-xs text-slate-400">Error loading questions data.</p>;
                  }
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
