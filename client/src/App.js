import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import Questionnaire from './components/Questionnaire';
import LiveEditor, { industryTemplates } from './components/LiveEditor';
import AdminPanel from './components/AdminPanel';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('siteforge-user') || 'null'); } catch { return null; }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [view, setView] = useState('dashboard');
  const [projects, setProjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem('siteforge-projects') || '[]'); } catch { return []; }
  });
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generationNotice, setGenerationNotice] = useState('');

  useEffect(() => {
    if (!user?.token) return;
    fetch(`${API_BASE}/api/projects`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (result?.projects) {
          setProjects(result.projects.map((project) => ({ ...project.config, id: project.id, templateSlug: project.templateSlug, date: new Date(project.updatedAt).toLocaleDateString() })));
        }
      }).catch(() => {});
  }, [user?.token]);

  const persistProjects = (nextProjects) => {
    setProjects(nextProjects);
    try { localStorage.setItem('siteforge-projects', JSON.stringify(nextProjects)); } catch { /* local fallback is best effort */ }
  };

  const handleFormSubmit = async (config) => {
    setLoading(true);
    setGenerationNotice('');
    try {
      let generatedData = {};
      if (config.description?.trim()) {
        try {
          const response = await fetch(`${API_BASE}/api/ai/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ config, request: config.description }),
          });
          const payload = await response.json();
          if (!response.ok) throw new Error(payload.message || 'AI generation is unavailable.');
          const baseProducts = industryTemplates[config.industry]?.products || [];
          generatedData = {
            ...payload.plan,
            products: payload.plan.products.map((product, index) => ({
              ...baseProducts[index % Math.max(baseProducts.length, 1)],
              ...product,
              id: index + 1,
              price: `₹${Number(product.price).toLocaleString('en-IN')}`,
              image: baseProducts[index % Math.max(baseProducts.length, 1)]?.image || '',
            })),
          };
          setGenerationNotice('Website copy and product ideas were generated with Gemini AI.');
        } catch (error) {
          setGenerationNotice(`${error.message} The selected category template is ready to preview; configure Gemini in server/.env to enable AI generation.`);
        }
      }
      const newProject = {
        id: Date.now().toString(),
        ...config,
        generatedData,
        date: new Date().toLocaleDateString(),
      };

      let savedProject = newProject;
      if (user?.token) {
        try {
          const response = await fetch(`${API_BASE}/api/projects`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }, body: JSON.stringify({ name: config.storeName, templateSlug: config.templateSlug || config.industry.toLowerCase().replace(/[^a-z0-9]+/g, '-'), prompt: config.description, config: newProject }) });
          const result = await response.json();
          if (response.ok) savedProject = { ...newProject, id: result.project.id };
          else setGenerationNotice(`${generationNotice} Website generated in this browser; database save failed: ${result.message || 'database unavailable'}`.trim());
        } catch { setGenerationNotice('Website generated in this browser. Sign in with MongoDB configured to save it to your account.'); }
      }

      persistProjects([savedProject, ...projects.filter((project) => project.id !== savedProject.id)]);
      setActiveProject(savedProject);
      setView('editor');
    } catch (err) {
      console.error("Could not prepare the store preview:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditorSave = (updatedData) => {
    if (updatedData && activeProject) {
      const updatedProject = { ...activeProject, ...updatedData, generatedData: { ...activeProject.generatedData, ...updatedData } };
      const next = projects.map((project) => project.id === activeProject.id ? updatedProject : project);
      persistProjects(next);
      setActiveProject(updatedProject);
      if (user?.token && /^[a-f\d]{24}$/i.test(activeProject.id)) {
        fetch(`${API_BASE}/api/projects/${activeProject.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }, body: JSON.stringify({ name: updatedProject.storeName, config: updatedProject }) }).catch(() => {});
      }
    }
  };

  const handleEditorBack = (updatedData) => {
    handleEditorSave(updatedData);
    setView('dashboard');
  };

  const handleDeleteProject = async (project) => {
    if (!window.confirm(`Delete “${project.storeName || project.name}”?`)) return;
    const nextProjects = projects.filter((item) => item.id !== project.id);
    persistProjects(nextProjects);
    if (user?.token && /^[a-f\d]{24}$/i.test(project.id)) {
      try { await fetch(`${API_BASE}/api/projects/${project.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` } }); } catch { /* the browser copy is still deleted */ }
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold">✨ Preparing your website...</h2>
        <p className="text-slate-400 text-sm mt-1">Applying your selected layout and creating your live preview.</p>
      </div>
    );
  }

  if (view === 'editor') {
    return <>
      <LiveEditor project={activeProject} user={user} generationNotice={generationNotice} onBack={handleEditorBack} onSave={handleEditorSave} onLoginClick={() => setIsAuthOpen(true)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={(userData) => { localStorage.setItem('siteforge-user', JSON.stringify(userData)); setUser(userData); }} />
    </>;
  }

  if (view === 'admin') return <AdminPanel onExit={() => setView('dashboard')} />;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Navbar
        user={user}
        onLoginClick={() => setIsAuthOpen(true)}
        onLogout={() => { localStorage.removeItem('siteforge-user'); setUser(null); setView('dashboard'); }}
        onCreateNew={() => setView('questionnaire')}
        onAdminClick={() => setView('admin')}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(userData) => { localStorage.setItem('siteforge-user', JSON.stringify(userData)); setUser(userData); }}
      />

      {view === 'dashboard' && (
        <Dashboard
          user={user}
          projects={projects}
          onCreateNew={() => setView('questionnaire')}
          onDeleteProject={handleDeleteProject}
          onEditProject={(proj) => {
            setActiveProject(proj);
            setView('editor');
          }}
        />
      )}

      {view === 'questionnaire' && (
        <div className="p-4">
          <Questionnaire onSubmit={handleFormSubmit} />
        </div>
      )}
    </div>
  );
}

export default App;
