import React, { useEffect, useState } from 'react';
import { Files, Upload, Trash2, CheckCircle, FileText, Loader2, Sparkles } from 'lucide-react';

export const MySamplesPage = () => {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fileName, setFileName] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [selectedSample, setSelectedSample] = useState(null);

  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/samples');
      const data = await res.json();
      if (res.ok) {
        setSamples(data.samples || []);
      }
    } catch (err) {
      console.error('Failed to fetch samples:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!fileName.trim() || !extractedText.trim()) {
      setError('Please provide a file name and sample content.');
      return;
    }

    try {
      setAnalyzing(true);
      setError('');
      const res = await fetch('/api/samples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: fileName.trim(),
          file_type: 'TXT',
          extracted_text: extractedText.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze sample document');

      setSamples([data.sample, ...samples]);
      setSelectedSample(data.sample);
      setFileName('');
      setExtractedText('');
    } catch (err) {
      setError(err.message || 'Error processing sample');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sample paper?')) return;
    try {
      const res = await fetch(`/api/samples/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSamples(samples.filter(s => s.id !== id));
        if (selectedSample?.id === id) setSelectedSample(null);
      }
    } catch (err) {
      console.error('Failed to delete sample:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white font-outfit">My Samples</h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload reference papers and sample assignments to analyze structural patterns, vocabulary density, and style metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload & Analyze Form */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-nyora-400" />
            <h2 className="text-base font-bold text-white font-outfit">Analyze Sample Paper</h2>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Sample File Name *
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g., Computer_Vision_Sample_Paper.txt"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-nyora-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Sample Text Content *
              </label>
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                rows={8}
                placeholder="Paste sample paper text here..."
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-nyora-500 resize-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={analyzing}
              className="w-full bg-nyora-600 hover:bg-nyora-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-nyora-600/30 flex items-center justify-center gap-2 text-xs disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Writing Profile...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Sample Analysis</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Samples List & Analysis View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800">
            <h2 className="text-base font-bold text-white font-outfit mb-4">Saved Reference Library</h2>

            {loading ? (
              <div className="py-8 text-center">
                <Loader2 className="w-6 h-6 text-nyora-400 animate-spin mx-auto mb-2" />
                <p className="text-slate-400 text-xs">Loading samples...</p>
              </div>
            ) : samples.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                No sample papers uploaded yet. Use the form on the left to add a sample.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {samples.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSample(s)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedSample?.id === s.id
                        ? 'bg-nyora-500/10 border-nyora-400'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-nyora-400 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-white line-clamp-1">{s.file_name}</p>
                          <p className="text-[10px] text-slate-400">{new Date(s.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(s.id);
                        }}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analysis Result Drawer */}
          {selectedSample && (
            <div className="glass-card p-6 rounded-3xl border border-nyora-500/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white font-outfit">{selectedSample.file_name}</h3>
                  <span className="text-[10px] text-nyora-400 font-semibold">Analyzed Writing Profile</span>
                </div>
              </div>

              {(() => {
                try {
                  const data = JSON.parse(selectedSample.analysis);
                  return (
                    <div className="space-y-4 text-xs text-slate-300">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Word Count</span>
                          <span className="text-sm font-bold text-white">{data.metrics?.wordCount}</span>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Academic Level</span>
                          <span className="text-sm font-bold text-nyora-300">{data.metrics?.academicLevel}</span>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Readability Score</span>
                          <span className="text-sm font-bold text-cyan-400">{data.metrics?.readabilityScore}</span>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Tone</span>
                          <span className="text-sm font-bold text-indigo-400">{data.stylisticProfile?.tone}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-white mb-2">Recommendations:</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs">
                          {data.recommendations?.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                } catch (e) {
                  return <p className="text-xs text-slate-400">Standard sample profile loaded.</p>;
                }
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
