import React from 'react';
import { BookOpen } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-nyora-600 flex items-center justify-center text-white">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-300 font-outfit">Nyora Assignment Helper</span>
        </div>
        <p className="text-slate-500">
          © {new Date().getFullYear()} Nyora Assignment Helper. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
