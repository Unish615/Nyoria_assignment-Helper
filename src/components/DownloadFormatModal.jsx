import React, { useState } from 'react';
import { X, FileText, Download, Printer, Check, Edit2 } from 'lucide-react';

export const DownloadFormatModal = ({ isOpen, onClose, documentData, onExportDocx, onExportPdf, onPrint }) => {
  if (!isOpen) return null;

  const defaultFileName = documentData?.title
    ? `Nyora_${documentData.title.replace(/[^a-zA-Z0-9]/g, '_')}`
    : 'Nyora_Document';

  const [fileName, setFileName] = useState(defaultFileName);
  const [downloading, setDownloading] = useState(false);

  const handleDocx = async () => {
    try {
      setDownloading(true);
      await onExportDocx(fileName);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const handlePdf = async () => {
    try {
      setDownloading(true);
      await onExportPdf(fileName);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrintAction = () => {
    onPrint();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-nyora-500/10 rounded-2xl flex items-center justify-center mx-auto text-nyora-400 border border-nyora-500/20">
            <Download className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white font-outfit">Choose Download Format</h2>
          <p className="text-slate-400 text-xs">
            What format would you like for your generated document?
          </p>
        </div>

        {/* File Name Editor */}
        <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1.5">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Document File Name</span>
            <Edit2 className="w-3 h-3 text-nyora-400" />
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-nyora-500 font-mono"
          />
        </div>

        {/* Download Format Cards */}
        <div className="space-y-3">
          {/* DOCX Option */}
          <div className="p-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-nyora-500/40 rounded-2xl transition-all flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Microsoft Word (.docx)</h3>
                <p className="text-xs text-slate-400">Editable Word document with formatting</p>
              </div>
            </div>
            <button
              onClick={handleDocx}
              disabled={downloading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 shrink-0"
            >
              Download Word
            </button>
          </div>

          {/* PDF Option */}
          <div className="p-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-nyora-500/40 rounded-2xl transition-all flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">PDF Document (.pdf)</h3>
                <p className="text-xs text-slate-400">Ready-to-print formatted PDF document</p>
              </div>
            </div>
            <button
              onClick={handlePdf}
              disabled={downloading}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-red-600/20 shrink-0"
            >
              Download PDF
            </button>
          </div>

          {/* Print Option */}
          <div className="p-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-nyora-500/40 rounded-2xl transition-all flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Print Directly</h3>
                <p className="text-xs text-slate-400">Send straight to your printer</p>
              </div>
            </div>
            <button
              onClick={handlePrintAction}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 shrink-0"
            >
              Print Document
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 text-center">
          Clean academic formatting with zero third-party watermarks.
        </p>
      </div>
    </div>
  );
};
