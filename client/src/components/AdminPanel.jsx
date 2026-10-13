import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Eye, EyeOff, LayoutTemplate, LockKeyhole, LogOut, Save, Trash2 } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const emptyTemplate = { slug: '', name: '', category: '', description: '', previewImage: '', primaryColor: '#2563eb', status: 'draft', heroStyle: 'editorial' };

const AdminPanel = ({ onExit }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem('siteforge-admin-token') || '');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState(null);
  const [draft, setDraft] = useState(emptyTemplate);
  const [editingId, setEditingId] = useState('');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const request = async (path, options = {}, authToken = token) => {
    const response = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}), ...(options.headers || {}) } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || `Request failed (${response.status})`);
    return body;
  };

  const refresh = async (authToken = token) => {
    const [templateResult, statResult] = await Promise.all([request('/api/templates/admin/all', {}, authToken), request('/api/admin/stats', {}, authToken)]);
    setTemplates(templateResult.templates);
    setStats(statResult.stats);
  };

  useEffect(() => {
    if (!token) return;
    refresh().catch((error) => { setNotice(error.message); sessionStorage.removeItem('siteforge-admin-token'); setToken(''); });
    // Token changes are the only reason to authenticate or refresh on entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (event) => {
    event.preventDefault(); setBusy(true); setNotice('');
    try {
      const result = await request('/api/admin/login', { method: 'POST', body: JSON.stringify(credentials) }, '');
      sessionStorage.setItem('siteforge-admin-token', result.token); setToken(result.token); setCredentials({ username: '', password: '' });
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  };

  const signOut = () => { sessionStorage.removeItem('siteforge-admin-token'); setToken(''); setTemplates([]); setStats(null); };

  const saveTemplate = async (event) => {
    event.preventDefault(); setBusy(true); setNotice('');
    try {
      const { heroStyle, ...templateFields } = draft;
      await request(editingId ? `/api/templates/${editingId}` : '/api/templates', { method: editingId ? 'PUT' : 'POST', body: JSON.stringify({ ...templateFields, config: { industry: draft.name, heroStyle } }) });
      setDraft(emptyTemplate); setEditingId(''); await refresh(); setNotice('Template saved.');
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  };

  const updateTemplate = async (template, changes) => {
    try { await request(`/api/templates/${template.id}`, { method: 'PUT', body: JSON.stringify(changes) }); await refresh(); setNotice('Template updated.'); }
    catch (error) { setNotice(error.message); }
  };

  const deleteTemplate = async (template) => {
    if (!window.confirm(`Delete “${template.name}”? This removes it from the template gallery.`)) return;
    try { await request(`/api/templates/${template.id}`, { method: 'DELETE' }); await refresh(); setNotice('Template deleted.'); }
    catch (error) { setNotice(error.message); }
  };

  const makeSlug = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const changePassword = async (event) => {
    event.preventDefault(); setBusy(true); setNotice('');
    try { const result = await request('/api/admin/change-password', { method: 'POST', body: JSON.stringify(passwords) }); setPasswords({ currentPassword: '', newPassword: '' }); setNotice(result.message); }
    catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  };

  return <div className="min-h-screen bg-slate-950 text-white">
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/95 backdrop-blur px-5 md:px-10 py-4 flex items-center justify-between"><div className="flex items-center gap-3"><button onClick={onExit} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700" aria-label="Back to SiteForge"><ArrowLeft className="w-4 h-4" /></button><div><p className="font-bold">SiteForge Admin</p><p className="text-[11px] text-slate-400">Private platform controls</p></div></div>{token && <button onClick={signOut} className="text-xs text-slate-300 hover:text-white flex items-center gap-2"><LogOut className="w-4 h-4" /> Sign out</button>}</header>
    {notice && <div role="status" className="mx-auto max-w-6xl mt-5 px-4"><div className="rounded-lg border border-blue-900 bg-blue-950/60 p-3 text-sm text-blue-100">{notice}</div></div>}
    {!token ? <main className="max-w-md mx-auto px-5 py-16"><div className="rounded-2xl border border-slate-800 bg-slate-900 p-7 md:p-9"><div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-300 flex items-center justify-center"><LockKeyhole className="w-6 h-6" /></div><p className="text-xs uppercase tracking-[.2em] text-blue-300 mt-6">Restricted area</p><h1 className="text-3xl font-bold mt-2">Administrator sign in</h1><p className="text-sm text-slate-400 mt-2">Use the initial administrator credentials configured on the server.</p><form onSubmit={login} className="mt-7 space-y-4"><label className="block text-xs text-slate-300">Username<input required autoComplete="username" value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white" /></label><label className="block text-xs text-slate-300">Password<input required type="password" autoComplete="current-password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white" /></label><button disabled={busy} className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 p-3 font-semibold">{busy ? 'Signing in…' : 'Sign in securely'}</button></form></div></main> : <main className="max-w-6xl mx-auto px-5 md:px-10 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[.2em] text-blue-300">Overview</p><h1 className="text-3xl md:text-4xl font-bold mt-2">Platform dashboard</h1><p className="text-sm text-slate-400 mt-2">Manage published templates and review platform activity.</p></div><button onClick={() => refresh().catch((error) => setNotice(error.message))} className="self-start rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-900">Refresh data</button></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-7">{[['Users', stats?.users], ['Websites', stats?.projects], ['Templates', stats?.templates], ['Products', stats?.products], ['Orders', stats?.orders], ['Revenue', `₹${Number(stats?.revenue || 0).toLocaleString('en-IN')}`]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-4"><span className="text-[11px] text-slate-400">{label}</span><strong className="block text-xl mt-1">{value ?? '—'}</strong></div>)}</div>
      <form onSubmit={changePassword} className="mt-5 rounded-xl border border-slate-800 bg-slate-900 p-5 flex flex-col md:flex-row md:items-end gap-3"><label className="flex-1 text-xs text-slate-300">Current password<input required type="password" autoComplete="current-password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm" /></label><label className="flex-1 text-xs text-slate-300">New password (12+ characters)<input required minLength={12} type="password" autoComplete="new-password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm" /></label><button disabled={busy} className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm hover:bg-slate-800">Change admin password</button></form>
      <section className="grid lg:grid-cols-[.85fr_1.15fr] gap-8 mt-12 items-start"><div className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><div className="flex items-center gap-3"><LayoutTemplate className="w-5 h-5 text-blue-300" /><h2 className="text-xl font-bold">{editingId ? 'Edit template' : 'Add a template'}</h2></div><p className="text-xs text-slate-400 mt-2">New templates appear in the public template gallery.</p><form onSubmit={saveTemplate} className="space-y-3 mt-5"><label className="block text-xs text-slate-300">Template name<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value, slug: editingId ? draft.slug : makeSlug(event.target.value) })} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm" /></label><label className="block text-xs text-slate-300">URL slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm" /></label><label className="block text-xs text-slate-300">Category<input required value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm" /></label><label className="block text-xs text-slate-300">Description<textarea rows="3" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm" /></label><label className="block text-xs text-slate-300">Preview image URL<input type="url" value={draft.previewImage} onChange={(event) => setDraft({ ...draft, previewImage: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm" /></label><label className="block text-xs text-slate-300">Page layout<select value={draft.heroStyle} onChange={(event) => setDraft({ ...draft, heroStyle: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-sm">{['editorial', 'electronics', 'beauty', 'food', 'restaurant', 'travel', 'portfolio', 'saas', 'agency', 'education', 'realestate', 'fitness'].map((style) => <option key={style} value={style}>{style}</option>)}</select></label><div className="flex items-center justify-between gap-4"><label className="text-xs text-slate-300">Theme color<input type="color" value={draft.primaryColor} onChange={(event) => setDraft({ ...draft, primaryColor: event.target.value })} className="block w-14 h-9 mt-1 bg-transparent" /></label><label className="text-xs text-slate-300">Publish status<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })} className="block mt-1 rounded-lg border border-slate-700 bg-slate-950 p-2"><option value="draft">Draft</option><option value="published">Published</option></select></label></div><div className="flex gap-2 pt-2"><button disabled={busy} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 p-3 text-sm font-semibold"><Save className="w-4 h-4" />{editingId ? 'Save changes' : 'Create template'}</button>{editingId && <button type="button" onClick={() => { setEditingId(''); setDraft(emptyTemplate); }} className="rounded-lg border border-slate-700 px-4 text-sm">Cancel</button>}</div></form></div>
      <div><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Website templates</h2><p className="text-xs text-slate-400 mt-1">{templates.length} template{templates.length === 1 ? '' : 's'} · publish or hide each listing</p></div><span className="text-xs text-slate-400 flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Gallery</span></div><div className="space-y-3 mt-4">{templates.map((template) => <article key={template.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex gap-4"><div className="w-24 h-20 shrink-0 rounded-lg bg-slate-800 bg-cover bg-center" style={{ backgroundImage: template.previewImage ? `url(${template.previewImage})` : undefined }} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold truncate">{template.name}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] ${template.status === 'published' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>{template.status}</span>{template.isBuiltIn && <span className="text-[10px] text-slate-500">Built in</span>}</div><p className="text-xs text-slate-400 mt-1 line-clamp-2">{template.description || template.category}</p><p className="text-[10px] text-slate-500 mt-1">/{template.slug}</p></div><div className="flex items-start gap-1"><button title={template.status === 'published' ? 'Unpublish' : 'Publish'} onClick={() => updateTemplate(template, { status: template.status === 'published' ? 'draft' : 'published' })} className="p-2 rounded-lg hover:bg-slate-800">{template.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Check className="w-4 h-4" />}</button><button title="Edit" onClick={() => { setEditingId(template.id); setDraft({ slug: template.slug, name: template.name, category: template.category, description: template.description, previewImage: template.previewImage, primaryColor: template.primaryColor, status: template.status, heroStyle: template.config?.heroStyle || 'editorial' }); }} className="p-2 rounded-lg hover:bg-slate-800 text-blue-300">Edit</button><button title="Delete" onClick={() => deleteTemplate(template)} className="p-2 rounded-lg hover:bg-red-950 text-red-300"><Trash2 className="w-4 h-4" /></button></div></article>)}{templates.length === 0 && <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">Could not load templates. Check MongoDB connection and refresh.</div>}</div></div></section>
    </main>}
  </div>;
};

export default AdminPanel;
