import React, { useState } from 'react';
import { 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Check, 
  Eye, 
  EyeOff, 
  BookOpen, 
  FileText,
  Sparkles
} from 'lucide-react';
import { DownloadFormatModal } from './DownloadFormatModal';

export const DocumentPreviewEditor = ({ documentData, onSaveHistory }) => {
  if (!documentData) return null;

  const [activeVersion, setActiveVersion] = useState(0);
  const versions = documentData.versions || [documentData];
  const currentDoc = versions[activeVersion] || versions[0];

  const [schoolName, setSchoolName] = useState(currentDoc.schoolName || 'Nyora Academic Academy');
  const [examName, setExamName] = useState(currentDoc.examName || 'Terminal Examination');
  const [className, setClassName] = useState(currentDoc.className || 'Class 10');
  const [subject, setSubject] = useState(currentDoc.subject || 'Science & Technology');
  const [timeAllowed, setTimeAllowed] = useState(currentDoc.timeAllowed || '3 Hours');
  const [fullMarks, setFullMarks] = useState(currentDoc.fullMarks || '75 Marks');
  const [sections, setSections] = useState(currentDoc.sections || []);
  const [instructions, setInstructions] = useState(currentDoc.instructions || [
    'Answer all questions in neat handwriting.',
    'Figures in the margin indicate full marks for each question.'
  ]);

  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState('');

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddQuestion = (secIdx) => {
    const updated = [...sections];
    const newQId = (updated[secIdx].questions.length + 1) * 10 + secIdx;
    updated[secIdx].questions.push({
      id: newQId,
      question: 'New custom question added by teacher/user...',
      answer: 'Sample comprehensive answer key for this question.',
      marks: '5 Marks'
    });
    setSections(updated);
    showToastMsg('New question added to section!');
  };

  const handleRemoveQuestion = (secIdx, qIdx) => {
    const updated = [...sections];
    updated[secIdx].questions.splice(qIdx, 1);
    setSections(updated);
    showToastMsg('Question removed.');
  };

  const handleUpdateQuestion = (secIdx, qIdx, field, val) => {
    const updated = [...sections];
    updated[secIdx].questions[qIdx][field] = val;
    setSections(updated);
  };

  // Export handlers
  const handleExportDocx = async (fileName) => {
    try {
      const payload = {
        title: currentDoc.title,
        schoolName,
        examName,
        className,
        subject,
        timeAllowed,
        fullMarks,
        instructions,
        sections,
        file_name: fileName
      };

      const res = await fetch('/api/documents/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to generate Word document.');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      if (onSaveHistory) onSaveHistory();
      showToastMsg('Word document downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToastMsg('Failed to export Word document.');
    }
  };

  const handleExportPdf = async (fileName) => {
    try {
      // Record download history
      await fetch('/api/documents/record-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'pdf', file_name: `${fileName}.pdf` })
      });

      // Trigger print / save PDF view
      window.print();
      if (onSaveHistory) onSaveHistory();
      showToastMsg('PDF print dialog opened!');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-nyora-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 border border-nyora-400">
          <Check className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Version Selector (if batch generated) */}
      {versions.length > 1 && (
        <div className="flex items-center gap-2 p-2 bg-slate-900/90 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 px-3">Batch Versions:</span>
          {versions.map((v, idx) => (
            <button
              key={idx}
              onClick={() => setActiveVersion(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeVersion === idx
                  ? 'bg-nyora-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Version {String.fromCharCode(65 + idx)}
            </button>
          ))}
        </div>
      )}

      {/* Main Preview Action Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-nyora-400" />
          <h2 className="text-base font-bold text-white font-outfit">Document Preview & Live Editor</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-cyan-300 rounded-xl flex items-center gap-1.5"
          >
            {showAnswerKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showAnswerKey ? 'Hide Answer Key' : 'Show Answer Key'}</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-nyora-600 to-nyora-500 hover:from-nyora-500 hover:to-nyora-400 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-nyora-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Printable Document Paper View */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl space-y-6 font-sans print:shadow-none print:p-0 print:m-0 print:bg-transparent">
        {/* Header Block */}
        <div className="text-center space-y-2 border-b-2 border-slate-900 pb-4">
          <input
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="w-full text-center font-extrabold text-2xl text-slate-900 bg-transparent focus:outline-none focus:bg-slate-100 rounded px-2"
          />
          <div className="flex items-center justify-center gap-4 text-sm font-bold text-slate-700">
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="text-center bg-transparent focus:outline-none focus:bg-slate-100 rounded px-2"
            />
          </div>
          <div className="flex justify-between items-center text-xs font-bold text-slate-800 pt-2 border-t border-slate-300">
            <div>Class: <input type="text" value={className} onChange={(e) => setClassName(e.target.value)} className="w-20 bg-transparent font-bold" /></div>
            <div>Subject: <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-40 bg-transparent font-bold text-center" /></div>
            <div>Time: <input type="text" value={timeAllowed} onChange={(e) => setTimeAllowed(e.target.value)} className="w-20 bg-transparent font-bold text-right" /></div>
            <div>Full Marks: <input type="text" value={fullMarks} onChange={(e) => setFullMarks(e.target.value)} className="w-20 bg-transparent font-bold text-right" /></div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-1 text-xs">
          <p className="font-bold uppercase tracking-wider text-slate-800">General Instructions:</p>
          {instructions.map((inst, i) => (
            <p key={i} className="text-slate-700 pl-4">{i + 1}. {inst}</p>
          ))}
        </div>

        {/* Sections & Questions */}
        <div className="space-y-8 pt-4">
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-400 pb-1">
                <input
                  type="text"
                  value={sec.sectionTitle}
                  onChange={(e) => {
                    const updated = [...sections];
                    updated[secIdx].sectionTitle = e.target.value;
                    setSections(updated);
                  }}
                  className="font-bold text-sm text-slate-900 bg-transparent focus:outline-none w-full"
                />
                <button
                  onClick={() => handleAddQuestion(secIdx)}
                  className="text-[11px] text-nyora-700 font-bold hover:underline flex items-center gap-1 shrink-0 print:hidden"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-5">
                {sec.questions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-2 group relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-2 flex-1">
                        <span className="font-bold text-sm">{q.id}.</span>
                        <textarea
                          value={q.question}
                          onChange={(e) => handleUpdateQuestion(secIdx, qIdx, 'question', e.target.value)}
                          rows={2}
                          className="w-full text-sm text-slate-900 font-medium bg-transparent focus:outline-none focus:bg-slate-100 rounded p-1 resize-y"
                        />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="text"
                          value={q.marks}
                          onChange={(e) => handleUpdateQuestion(secIdx, qIdx, 'marks', e.target.value)}
                          className="text-xs font-bold text-slate-700 w-16 text-right bg-transparent border-b border-slate-300"
                        />
                        <button
                          onClick={() => handleRemoveQuestion(secIdx, qIdx)}
                          className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-1 print:hidden"
                          title="Remove Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {q.options && (
                      <div className="grid grid-cols-2 gap-2 pl-6 text-xs text-slate-700">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="p-1.5 bg-slate-100 rounded border border-slate-200">
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {showAnswerKey && q.answer && (
                      <div className="ml-6 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900">
                        <span className="font-bold">Answer Key: </span>
                        <span>{q.answer}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Seal */}
        <div className="pt-8 border-t border-slate-300 text-center text-xs text-slate-500 flex items-center justify-between">
          <span>Nyora Assignment Helper</span>
          <span>Official Academic Document</span>
        </div>
      </div>

      {/* Download Modal */}
      <DownloadFormatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        documentData={{ title: currentDoc.title }}
        onExportDocx={handleExportDocx}
        onExportPdf={handleExportPdf}
        onPrint={handlePrint}
      />
    </div>
  );
};
