import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  HelpCircle, 
  Sparkles, 
  CheckCircle, 
  X, 
  RefreshCw, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Layers,
  Key
} from 'lucide-react';
import { DocumentPreviewEditor } from '../components/DocumentPreviewEditor';

export const DocumentGeneratorPage = () => {
  // Sample Upload State
  const [sampleFile, setSampleFile] = useState(null);
  const [sampleStatus, setSampleStatus] = useState(null); // { id, fileName, fileSize, fileType, extractedText, analysis }
  const [sampleUploading, setSampleUploading] = useState(false);

  // Question Upload State
  const [questionFile, setQuestionFile] = useState(null);
  const [questionStatus, setQuestionStatus] = useState(null); // { id, fileName, fileSize, fileType, extractedText, analysis }
  const [questionUploading, setQuestionUploading] = useState(false);

  // Additional Instructions & Options
  const [customInstructions, setCustomInstructions] = useState('');
  const [documentType, setDocumentType] = useState('QUESTION_PAPER');
  const [batchCount, setBatchCount] = useState(1);
  const [answerKeyMode, setAnswerKeyMode] = useState('INLINE'); // NONE | INLINE | SEPARATE

  // Generation & Result State
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedDocument, setGeneratedDocument] = useState(null);

  // Upload Sample Handler
  const handleSampleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSampleUploading(true);
      setError('');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/documents/upload-sample', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse sample file.');

      setSampleFile(file);
      setSampleStatus(data.file);
    } catch (err) {
      setError(err.message || 'Error uploading sample file.');
    } finally {
      setSampleUploading(false);
    }
  };

  // Upload Question Handler
  const handleQuestionUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setQuestionUploading(true);
      setError('');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/documents/upload-question', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse question paper.');

      setQuestionFile(file);
      setQuestionStatus(data.file);
    } catch (err) {
      setError(err.message || 'Error uploading question paper.');
    } finally {
      setQuestionUploading(false);
    }
  };

  // Generate Document Handler
  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError('');

      const payload = {
        document_type: documentType,
        custom_instructions: customInstructions,
        sample_analysis: sampleStatus?.analysis,
        question_analysis: questionStatus?.analysis,
        batch_count: batchCount,
        answer_key_mode: answerKeyMode
      };

      const res = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate document.');

      setGeneratedDocument(data.document);
    } catch (err) {
      setError(err.message || 'Failed to generate document.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-gradient-to-tr from-nyora-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl shadow-nyora-500/20">
          <Sparkles className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit">
          Sample PDF & Question Paper System
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Upload reference samples and question papers to generate brand-new, original assignments and exams.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 text-xs leading-relaxed max-w-3xl mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Two-File Mode Status Badges */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
          sampleStatus ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-900 text-slate-500 border-slate-800'
        }`}>
          <CheckCircle className="w-4 h-4" />
          <span>{sampleStatus ? 'Sample uploaded ✓' : 'Sample PDF Pending'}</span>
        </div>

        <div className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
          questionStatus ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-900 text-slate-500 border-slate-800'
        }`}>
          <CheckCircle className="w-4 h-4" />
          <span>{questionStatus ? 'Question paper uploaded ✓' : 'Question PDF Pending'}</span>
        </div>
      </div>

      {/* Upload Dual Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Upload Your Sample */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-nyora-400" />
            <h2 className="text-base font-bold text-white font-outfit">Upload Your Sample</h2>
          </div>
          <p className="text-xs text-slate-400">
            Upload reference assignment (PDF, DOCX, JPG, PNG) for layout, tone, and visual hierarchy.
          </p>

          {sampleStatus ? (
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-nyora-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white line-clamp-1">{sampleStatus.fileName}</span>
                <span className="px-2 py-0.5 bg-nyora-500/20 text-nyora-300 text-[10px] rounded font-mono">{sampleStatus.fileType}</span>
              </div>
              <p className="text-[11px] text-slate-400">Size: {sampleStatus.fileSize} • Status: <span className="text-emerald-400 font-semibold">Analyzed ✓</span></p>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 font-semibold">
                  <RefreshCw className="w-3 h-3" /> Replace
                  <input type="file" onChange={handleSampleUpload} accept=".pdf,.docx,.jpg,.jpeg,.png" className="hidden" />
                </label>
                <button
                  onClick={() => { setSampleFile(null); setSampleStatus(null); }}
                  className="text-[11px] bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-800 hover:border-nyora-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-950/40">
              {sampleUploading ? (
                <Loader2 className="w-8 h-8 text-nyora-400 animate-spin mb-2" />
              ) : (
                <Upload className="w-8 h-8 text-slate-500 mb-2" />
              )}
              <span className="text-xs font-bold text-white">Drag & Drop your sample here</span>
              <span className="text-[11px] text-slate-500 mt-1">or <span className="text-nyora-400 underline">Choose File</span> (PDF, DOCX, JPG, PNG)</span>
              <input type="file" onChange={handleSampleUpload} accept=".pdf,.docx,.jpg,.jpeg,.png" className="hidden" />
            </label>
          )}
        </div>

        {/* 2. Upload Question Paper */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-outfit">Upload Question Paper</h2>
          </div>
          <p className="text-xs text-slate-400">
            Upload exam question paper (PDF, DOCX, JPG, PNG) to extract questions, sections, and marks.
          </p>

          {questionStatus ? (
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white line-clamp-1">{questionStatus.fileName}</span>
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] rounded font-mono">{questionStatus.fileType}</span>
              </div>
              <p className="text-[11px] text-slate-400">Size: {questionStatus.fileSize} • Status: <span className="text-emerald-400 font-semibold">Analyzed ✓</span></p>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <label className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 font-semibold">
                  <RefreshCw className="w-3 h-3" /> Replace
                  <input type="file" onChange={handleQuestionUpload} accept=".pdf,.docx,.jpg,.jpeg,.png" className="hidden" />
                </label>
                <button
                  onClick={() => { setQuestionFile(null); setQuestionStatus(null); }}
                  className="text-[11px] bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-950/40">
              {questionUploading ? (
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
              ) : (
                <Upload className="w-8 h-8 text-slate-500 mb-2" />
              )}
              <span className="text-xs font-bold text-white">Drag & Drop your question paper here</span>
              <span className="text-[11px] text-slate-500 mt-1">or <span className="text-cyan-400 underline">Choose File</span> (PDF, DOCX, JPG, PNG)</span>
              <input type="file" onChange={handleQuestionUpload} accept=".pdf,.docx,.jpg,.jpeg,.png" className="hidden" />
            </label>
          )}
        </div>
      </div>

      {/* Options & Custom Instructions Box */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        {/* Custom Instruction */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            What should I create? (Additional Instructions)
          </label>
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            rows={3}
            placeholder="e.g., Yo sample ko format jastai Class 10 ko Science ko naya question paper banaidinu. Same marks distribution rakhnus, tara questions naya hos."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-nyora-500 resize-none font-sans"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Document Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Document Target Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-nyora-500"
            >
              <option value="QUESTION_PAPER">Question Paper (Exam)</option>
              <option value="ASSIGNMENT">Academic Assignment / Paper</option>
            </select>
          </div>

          {/* Batch Generation Count */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-nyora-400" />
              <span>Batch Generation</span>
            </label>
            <select
              value={batchCount}
              onChange={(e) => setBatchCount(parseInt(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-nyora-500"
            >
              <option value={1}>1 Version (Standard)</option>
              <option value={2}>2 Versions (Version A & B)</option>
              <option value={3}>3 Versions (Version A, B & C)</option>
            </select>
          </div>

          {/* Answer Key Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>Answer Key Options</span>
            </label>
            <select
              value={answerKeyMode}
              onChange={(e) => setAnswerKeyMode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-nyora-500"
            >
              <option value="INLINE">Questions + Answers (Inline)</option>
              <option value="NONE">Questions Only</option>
              <option value="SEPARATE">Separate Answer Key File</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full bg-gradient-to-r from-nyora-600 via-nyora-500 to-cyan-500 hover:from-nyora-500 hover:to-cyan-400 text-white font-extrabold text-base py-4 px-6 rounded-2xl transition-all shadow-xl shadow-nyora-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing & Synthesizing Original Document...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate New Assignment / Question Paper</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {/* Generated Document Preview & Editor */}
      {generatedDocument && (
        <div className="pt-6">
          <DocumentPreviewEditor documentData={generatedDocument} />
        </div>
      )}
    </div>
  );
};
