import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Search } from 'lucide-react';

const templateGallery = [
  { name: 'Fashion & Apparel', group: 'Shop', color: '#292524', image: 'photo-1483985988355-763728e1935b', detail: 'Editorial storefront with collections and product cards.' },
  { name: 'Electronics & Gadgets', group: 'Shop', color: '#1d4ed8', image: 'photo-1498049794561-7780e7231661', detail: 'Modern tech shop with featured devices and categories.' },
  { name: 'Beauty & Cosmetics', group: 'Shop', color: '#be185d', image: 'photo-1596462502278-27bfdc403348', detail: 'Soft editorial beauty store with routines and product picks.' },
  { name: 'Food & Grocery', group: 'Shop', color: '#15803d', image: 'photo-1542838132-92c53300491e', detail: 'Fresh market catalogue for pantry and weekly essentials.' },
  { name: 'Restaurant & Food Ordering', group: 'Food', color: '#b45309', image: 'photo-1517248135467-4c7edcad34c4', detail: 'Restaurant menu, guest favourites, and ordering layout.' },
  { name: 'Hotel & Travel Booking', group: 'Travel', color: '#0f766e', image: 'photo-1571896349842-33c89424de2d', detail: 'Destination-led stays and travel booking presentation.' },
  { name: 'Portfolio & Personal Brand', group: 'Creative', color: '#57534e', image: 'photo-1497366754035-f200968a6e72', detail: 'Personal profile, selected work, and ways to collaborate.' },
  { name: 'SaaS & Startup', group: 'Business', color: '#4f46e5', image: 'photo-1460925895917-afdab827c52f', detail: 'Product-led landing page with features and pricing cards.' },
  { name: 'Agency & Business', group: 'Business', color: '#c2410c', image: 'photo-1521737711867-e3b97375f902', detail: 'Brand story, service offerings, and client-focused sections.' },
  { name: 'Blog & Magazine', group: 'Editorial', color: '#292524', image: 'photo-1499750310107-5fef28a66643', detail: 'Editorial homepage with featured stories and categories.' },
  { name: 'Education & Courses', group: 'Learning', color: '#0369a1', image: 'photo-1501504905252-473c47e087f8', detail: 'Course catalogue and clear learning-path cards.' },
  { name: 'Real Estate', group: 'Property', color: '#0f766e', image: 'photo-1600585154340-be6161a56a0c', detail: 'Property listings with location and price highlights.' },
  { name: 'Fitness & Gym', group: 'Wellness', color: '#dc2626', image: 'photo-1534438327276-14e5300c3a48', detail: 'Training programmes and membership-led landing page.' },
  { name: 'Blank Website', group: 'Starter', color: '#475569', image: '', detail: 'A clean starting page with no sample products or sections.' },
];

const Questionnaire = ({ onSubmit }) => {
  const [step, setStep] = useState(1);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState('All categories');
  const [templates, setTemplates] = useState(templateGallery);
  const templateCategories = useMemo(() => ['All categories', ...new Set(templates.map((template) => template.group))], [templates]);
  const visibleTemplates = useMemo(() => templates.filter((template) => (templateCategory === 'All categories' || template.group === templateCategory) && `${template.name} ${template.group}`.toLowerCase().includes(templateSearch.toLowerCase())), [templateCategory, templateSearch, templates]);
  const [formData, setFormData] = useState({
    storeName: '',
    industry: 'Fashion & Apparel',
    pageStructure: ['Home', 'Products', 'Cart', 'Order Tracking'],
    paymentGateways: ['Razorpay', 'Cash on Delivery'],
    primaryColor: '#3b82f6',
    description: '',
    templateSlug: 'fashion-apparel',
    templateConfig: { industry: 'Fashion & Apparel', heroStyle: 'editorial', primaryColor: '#292524' },
  });

  useEffect(() => {
    const api = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    fetch(`${api}/api/templates`).then((response) => response.ok ? response.json() : null).then((result) => {
      if (result?.templates?.length) {
        setTemplates(result.templates.map((template) => ({
          name: template.name,
          group: template.category,
          color: template.primaryColor,
          image: template.previewImage,
          detail: template.description,
          slug: template.slug,
          config: template.config,
        })));
      }
    }).catch(() => {});
  }, []);

  const totalSteps = 4;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const chooseTemplate = (template) => setFormData((previous) => ({
    ...previous,
    industry: template.name,
    templateSlug: template.slug || template.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    templateConfig: { ...(template.config || {}), category: template.group, description: template.detail, previewImage: template.image, primaryColor: template.color, heroStyle: template.config?.heroStyle || 'editorial' },
  }));

  const toggleArrayItem = (field, item) => {
    setFormData((prev) => {
      const list = prev[field];
      if (list.includes(item)) {
        return { ...prev, [field]: list.filter((i) => i !== item) };
      }
      return { ...prev, [field]: [...list, item] };
    });
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else onSubmit(formData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl my-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-slate-400 font-semibold mb-2">
          <span>Question {step} of {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}% Completed</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">1. Aapke Brand / Store ka Naam kya hai?</h2>
          <p className="text-sm text-slate-400">Ye aapke store ke header aur footer me render hoga.</p>
          <input
            type="text"
            placeholder="e.g. Urban Trends, TechStore"
            value={formData.storeName}
            onChange={(e) => handleChange('storeName', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-blue-500"
          />

          <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div><label htmlFor="template-search" className="block text-sm font-semibold text-slate-300">Choose a website template</label><p className="text-xs text-slate-500 mt-1">Har option ka apna page layout aur sample content hai.</p></div>
            <div className="flex w-full sm:w-auto gap-2"><select aria-label="Filter templates by category" value={templateCategory} onChange={(event) => setTemplateCategory(event.target.value)} className="max-w-40 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2.5 text-xs text-white">{templateCategories.map((category) => <option key={category}>{category}</option>)}</select><div className="relative flex-1 sm:w-52"><Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" /><input id="template-search" value={templateSearch} onChange={(e) => setTemplateSearch(e.target.value)} placeholder="Search templates" className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" /></div></div>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[430px] overflow-y-auto pr-1">
            {visibleTemplates.map((template) => {
              const selected = formData.industry === template.name;
              const imageUrl = template.image?.startsWith('http') ? template.image : `https://images.unsplash.com/${template.image}?auto=format&fit=crop&w=700&q=75`;
              return <button key={template.slug || template.name} type="button" onClick={() => chooseTemplate(template)} aria-pressed={selected} className={`group overflow-hidden rounded-xl border text-left transition-all ${selected ? 'border-blue-400 ring-2 ring-blue-500/30 bg-blue-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-600'}`}>
                <div className="h-28 relative bg-cover bg-center" style={{ backgroundImage: `linear-gradient(90deg, ${template.color || '#334155'}dd, ${template.color || '#334155'}22), url(${imageUrl})` }}><span className="absolute left-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-[10px] uppercase tracking-wide text-white">{template.group}</span>{selected && <CheckCircle2 className="absolute right-3 top-3 w-5 h-5 text-white" />}</div>
                <div className="p-3"><div className="flex items-center justify-between gap-2"><strong className="text-sm text-white">{template.name}</strong><span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: template.color }} /></div><p className="text-[11px] text-slate-400 mt-1.5 leading-4">{template.detail}</p></div>
              </button>;
            })}
            {visibleTemplates.length === 0 && <p className="col-span-full py-8 text-center text-sm text-slate-500">No matching templates. Try another search.</p>}
          </div>
        </div>
      )}

      {/* Question 2: Multi-Page Selection */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">2. Aapko website me kaun-kaun se Pages chahiye?</h2>
          <p className="text-sm text-slate-400">AI in sabhi pages ke alag routing components generate karega.</p>
          <div className="grid grid-cols-2 gap-3">
            {['Home Page', 'Products Catalogue', 'Cart & Checkout', 'My Orders / Tracking', 'About Us', 'Contact Us'].map((page) => {
              const isSelected = formData.pageStructure.includes(page);
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => toggleArrayItem('pageStructure', page)}
                  className={`p-4 rounded-xl border text-left flex items-center justify-between text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {page}
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Question 3: Payment Gateways */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">3. Platform par kaunse Payment Gateways enable karne hain?</h2>
          <p className="text-sm text-slate-400">Checkout page par in methods ke integration setup honge.</p>
          <div className="grid grid-cols-2 gap-3">
            {['Razorpay (UPI, Cards)', 'Stripe International', 'Cash on Delivery (COD)', 'Paytm Wallet'].map((pay) => {
              const isSelected = formData.paymentGateways.includes(pay);
              return (
                <button
                  key={pay}
                  type="button"
                  onClick={() => toggleArrayItem('paymentGateways', pay)}
                  className={`p-4 rounded-xl border text-left flex items-center justify-between text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {pay}
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Question 4: Theme Color & Short Tagline */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">4. Theme Color aur Main Heading Tagline specify karein</h2>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Primary Theme Color Choose Karein</label>
            <input
              type="color"
              value={formData.primaryColor}
              onChange={(e) => handleChange('primaryColor', e.target.value)}
              className="w-full h-12 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Store Description / Hero Subtitle</label>
            <textarea
              rows="3"
              placeholder="e.g. Best premium leather jackets and winter wear at affordable prices."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white focus:outline-none focus:border-blue-500 text-sm"
            ></textarea>
          </div>
        </div>
      )}

      {/* Bottom Control Buttons */}
      <div className="mt-8 flex justify-between items-center border-t border-slate-800 pt-6">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="text-xs font-semibold text-slate-400 hover:text-white px-4 py-2"
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          className="ml-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          {step === totalSteps ? (
            <>
              <Sparkles className="w-4 h-4" /> Generate Full Multi-Page Website
            </>
          ) : (
            <>
              Next Step <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Questionnaire;
