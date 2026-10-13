import React, { useState } from 'react';
import { X, Mail, Lock, Sparkles } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setNotice('');
    const api = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    try {
      if (isSignUp) {
        const registerResponse = await fetch(`${api}/api/users/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: email.split('@')[0], email, password }) });
        const registerResult = await registerResponse.json();
        if (!registerResponse.ok) throw new Error(registerResult.message || 'Account could not be created.');
      }
      const loginResponse = await fetch(`${api}/api/users/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const loginResult = await loginResponse.json();
      if (!loginResponse.ok) throw new Error(loginResult.message || 'Sign in failed.');
      onLoginSuccess({ ...loginResult.user, token: loginResult.token });
      onClose();
    } catch (error) {
      setNotice(error instanceof TypeError && error.message === 'Failed to fetch'
        ? 'Cannot reach the SiteForge API. Run npm start from the project folder and open the app from the same computer.'
        : error.message);
    }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-8 rounded-2xl shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-blue-600/10 rounded-2xl text-blue-400 mb-3">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            {isSignUp ? 'Create your SiteForge Account' : 'Welcome back'}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Build production-ready AI stores in minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {notice && <p role="alert" className="text-sm text-rose-300">{notice}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-lg transition-all mt-2"
          >
            {busy ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-blue-400 hover:underline"
          >
            {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
