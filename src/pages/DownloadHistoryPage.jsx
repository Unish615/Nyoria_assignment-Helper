import React, { useEffect, useState } from 'react';
import { Download, Trash2, FileText, Clock, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DownloadHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/documents/history');
      const data = await res.json();
      if (res.ok) {
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Fetch history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this download record?')) return;
    try {
      const res = await fetch(`/api/documents/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(history.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete history record:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-outfit">Download History</h1>
          <p className="text-slate-400 text-sm mt-1">
            Access past generated assignments, DOCX exports, and printable PDF documents.
          </p>
        </div>

        <Link
          to="/document-generator"
          className="bg-nyora-600 hover:bg-nyora-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-nyora-600/30 flex items-center gap-2 self-start sm:self-auto"
        >
          <FileText className="w-4 h-4" />
          <span>Generate New Document</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-nyora-400 animate-spin mx-auto mb-2" />
          <p className="text-slate-400 text-xs font-medium">Retrieving download history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center border border-slate-800 space-y-4">
          <Download className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white font-outfit">No Download History Found</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            You haven't exported any documents yet. Generate a paper to see your download logs here.
          </p>
          <Link
            to="/document-generator"
            className="inline-flex items-center gap-2 bg-nyora-600 text-white font-semibold text-xs py-2.5 px-4 rounded-xl"
          >
            <span>Open Document Generator</span>
          </Link>
        </div>
      ) : (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Document Name</th>
                  <th className="p-3.5">Format</th>
                  <th className="p-3.5">Download Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-nyora-400 shrink-0" />
                      <span>{item.file_name}</span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        item.format === 'docx'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {item.format}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <Link
                        to="/document-generator"
                        className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-nyora-300 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        <span>Download again</span>
                        <Download className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Record"
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
      )}
    </div>
  );
};
