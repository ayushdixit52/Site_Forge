import React from 'react';
import { Plus, Store, Edit3, Trash2 } from 'lucide-react';

const Dashboard = ({ user, projects, onCreateNew, onEditProject, onDeleteProject }) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Your Websites</h1>
          <p className="text-slate-400 mt-1">Manage and edit your website projects.</p>
        </div>
        <button
          onClick={onCreateNew}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
        >
          <Plus className="w-5 h-5" /> Create New Website
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-12 text-center max-w-lg mx-auto my-12">
          <div className="w-16 h-16 bg-blue-600/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Stores Created Yet</h3>
          <p className="text-slate-400 text-sm mb-6">
            Choose a template, describe your website and open a full-size live preview.
          </p>
          <button
            onClick={onCreateNew}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all"
          >
            Create Your First Website
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col justify-between hover:border-slate-600 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-blue-600/20 text-blue-400 rounded-md">
                    {proj.industry || proj.storeType || 'Website'}
                  </span>
                  <span className="text-xs text-slate-500">{proj.date}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{proj.storeName}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{proj.description}</p>
              </div>

              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-700/60">
                <button
                  onClick={() => onEditProject(proj)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Open Editor
                </button>
                <button onClick={() => onDeleteProject(proj)} aria-label={`Delete ${proj.storeName || proj.name}`} className="px-3 bg-slate-700 hover:bg-red-700 text-slate-300 hover:text-white text-xs py-2 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
