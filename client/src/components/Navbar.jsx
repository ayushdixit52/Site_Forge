import React from 'react';
import { Layers, LogIn, User, PlusCircle, Shield } from 'lucide-react';

const Navbar = ({ user, onLoginClick, onLogout, onCreateNew, onAdminClick }) => {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 cursor-pointer">
        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/30">
          <Layers className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          SiteForge AI
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button onClick={onAdminClick} className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"><Shield className="w-4 h-4" /> Admin</button>
        {user ? (
          <>
            <button
              onClick={onCreateNew}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Create New Site
            </button>
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <User className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-200">{user.email}</span>
            </div>
            <button
              onClick={onLogout}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={onLoginClick}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all"
          >
            <LogIn className="w-4 h-4" /> Login / Sign Up
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
