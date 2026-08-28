import React from 'react';
import { Star, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FavoritesPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
        <h1 className="text-3xl font-extrabold text-white font-outfit">Favorites</h1>
      </div>
      <p className="text-slate-400 text-sm">
        Bookmark your top research papers, reference samples, and question banks for instant study access.
      </p>

      <div className="glass-card p-12 rounded-3xl text-center border border-slate-800 space-y-4">
        <Star className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-lg font-bold text-white font-outfit">No Bookmarks Saved Yet</h3>
        <p className="text-slate-400 text-xs max-w-sm mx-auto">
          You can star any assignment, sample paper, or question set to keep it pinned in your favorites library.
        </p>
        <Link to="/my-assignments" className="inline-block bg-nyora-600 text-white font-semibold text-xs py-2.5 px-4 rounded-xl">
          Browse My Assignments
        </Link>
      </div>
    </div>
  );
};
