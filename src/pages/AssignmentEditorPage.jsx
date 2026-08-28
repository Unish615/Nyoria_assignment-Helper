import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  Save, 
  Copy, 
  Download, 
  ArrowLeft, 
  Check, 
  Loader2, 
  AlertCircle,
  Share2,
  BookOpen
} from 'lucide-react';

export const AssignmentEditorPage = () => {
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('id');
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!assignmentId) {
      setError('No assignment ID specified.');
      setLoading(false);
      return;
    }

    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/assignments/${assignmentId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to retrieve assignment');
      }

      setAssignment(data.assignment);
      setTitle(data.assignment.title);
      setContent(data.assignment.content);
    } catch (err) {
      setError(err.message || 'Failed to load assignment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save changes');
      }

      setAssignment(data.assignment);
      showToast('Assignment saved to database successfully!');
    } catch (err) {
      showToast(err.message || 'Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    showToast('Assignment content copied to clipboard!');
  };

  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([`${title}\n\n${content}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_Nyora.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Downloaded text document!');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 bg-slate-950">
        <Loader2 className="w-10 h-10 text-nyora-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">Loading Assignment Document...</p>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-400 border border-red-500/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white font-outfit">Assignment Not Found</h2>
        <p className="text-slate-400 text-sm">{error || 'This assignment does not exist or you do not have permission to view it.'}</p>
        <Link to="/my-assignments" className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to My Assignments</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-nyora-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 border border-nyora-400/40">
          <Check className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <Link to="/my-assignments" className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-nyora-400 font-bold">
              {assignment.subject} • {assignment.grade} • {assignment.assignment_type}
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent font-bold text-lg text-white block w-full focus:outline-none focus:border-b focus:border-nyora-400 font-outfit"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopy}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Text</span>
          </button>
          <button
            onClick={handleDownloadTxt}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-nyora-400" />
            <span>Export TXT</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-nyora-600 hover:bg-nyora-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-nyora-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
            <span>Live Document Editor</span>
            <span>Word Count: <strong className="text-nyora-300">{content.trim().split(/\s+/).filter(Boolean).length} words</strong></span>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={22}
            className="w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:border-nyora-500/60 resize-y"
            placeholder="Type or modify assignment content..."
          />
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-nyora-400" />
              Document Metadata
            </h3>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Subject:</span>
                <span className="text-white font-medium">{assignment.subject}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Grade Level:</span>
                <span className="text-white font-medium">{assignment.grade}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Paper Type:</span>
                <span className="text-white font-medium">{assignment.assignment_type}</span>
              </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Language:</span>
                <span className="text-white font-medium">{assignment.language}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Created Date:</span>
                <span className="text-slate-300">{new Date(assignment.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-nyora-500/10 border border-nyora-500/20 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-nyora-300 font-semibold">
              <BookOpen className="w-4 h-4" />
              <span>Nyora Academic Seal</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Exported documents carry official Nyora Assignment Helper academic formatting with zero third-party watermarks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
