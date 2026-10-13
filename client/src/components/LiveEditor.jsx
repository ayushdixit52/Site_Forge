import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, Eye, Layers, ShoppingBag, CheckCircle, Package, Monitor, Tablet, Smartphone, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import { createExportFiles } from '../exportTemplate';

const createUpiPaymentUri = (upiId, storeName, amount) => {
  const params = new URLSearchParams({
    pa: upiId.trim(),
    pn: storeName,
    tn: `Order from ${storeName}`,
    am: Number(amount || 0).toFixed(2),
    cu: 'INR',
  });
  return `upi://pay?${params.toString()}`;
};

export const industryTemplates = {
  'Fashion & Apparel': {
    eyebrow: 'The new collection',
    headline: 'Discover Premium Products Built for You',
    subtitle: 'Shop the latest trends with fast delivery and seamless checkout.',
    featuredTitle: 'Shop the bestsellers',
    heroStyle: 'editorial',
    defaultColor: '#1f2937',
    benefits: ['Thoughtfully selected styles', 'Easy exchanges', 'Made for everyday wear'],
    products: [
      { id: 1, name: 'Classic Urban Jacket', price: '₹10,750', category: 'Outerwear', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=85' },
      { id: 2, name: 'Minimalist Sneaker', price: '₹7,400', category: 'Footwear', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=85' },
      { id: 3, name: 'Premium Leather Watch', price: '₹16,500', category: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85' },
    ],
  },
  'Electronics & Gadgets': {
    eyebrow: 'Technology, thoughtfully chosen',
    headline: 'Upgrade the way you do everyday',
    subtitle: 'Discover reliable devices and accessories made to keep up with you.',
    featuredTitle: 'The latest in tech',
    heroStyle: 'electronics',
    defaultColor: '#2563eb',
    benefits: ['Tested quality', 'Warranty included', 'Fast, tracked delivery'],
    products: [
      { id: 1, name: 'Studio Wireless Headphones', price: '₹12,400', category: 'Audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85' },
      { id: 2, name: 'Everyday Smartphone', price: '₹58,000', category: 'Mobile', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=85' },
      { id: 3, name: 'Smart Watch Series', price: '₹19,000', category: 'Wearables', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85' },
    ],
  },
  'Beauty & Cosmetics': {
    eyebrow: 'A little ritual, just for you',
    headline: 'Feel good in your own skin',
    subtitle: 'Everyday care and beauty essentials, picked with a little extra care.',
    featuredTitle: 'Your daily self-care edit',
    heroStyle: 'beauty',
    defaultColor: '#be185d',
    benefits: ['Gentle ingredients', 'Cruelty-free picks', 'Carefully packed'],
    products: [
      { id: 1, name: 'Daily Glow Serum', price: '₹3,150', category: 'Skincare', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85' },
      { id: 2, name: 'Botanical Face Cream', price: '₹2,650', category: 'Moisturizer', image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=85' },
      { id: 3, name: 'Soft Tint Lip Color', price: '₹1,999', category: 'Makeup', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=85' },
    ],
  },
  'Food & Grocery': {
    eyebrow: 'Fresh from our shelves',
    headline: 'Good food, brought to your door',
    subtitle: 'Find fresh produce, pantry favourites and little treats for the week ahead.',
    featuredTitle: 'Fresh picks this week',
    heroStyle: 'food',
    defaultColor: '#15803d',
    benefits: ['Freshness you can taste', 'Locally sourced favourites', 'Convenient home delivery'],
    products: [
      { id: 1, name: 'Seasonal Farm Box', price: '₹1,999', category: 'Fresh produce', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=85' },
      { id: 2, name: 'Artisan Sourdough Loaf', price: '₹450', category: 'Bakery', image: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?auto=format&fit=crop&w=800&q=85' },
      { id: 3, name: 'Market Fruit Selection', price: '₹1,200', category: 'Fruit', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=85' },
    ],
  },
  'Portfolio & Personal Brand': {
    eyebrow: 'Independent studio · Available for projects',
    headline: 'Good work starts with a conversation',
    subtitle: 'A considered, personal approach to helping your next idea take shape.',
    featuredTitle: 'Ways we can work together',
    heroStyle: 'services',
    defaultColor: '#57534e',
    isService: true,
    benefits: ['Thoughtful process', 'Made around your goals', 'Let’s build something meaningful'],
    products: [
      { id: 1, name: 'Brand Identity', price: 'From ₹65,000', category: 'Branding', image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=800&q=85' },
      { id: 2, name: 'Website Design', price: 'From ₹99,000', category: 'Web design', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=85' },
      { id: 3, name: 'Creative Direction', price: '₹45,000', category: 'Consulting', image: 'https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=800&q=85' },
    ],
  },
  'Restaurant & Food Ordering': {
    eyebrow: 'A good meal, made easy', headline: 'Gather around something delicious', subtitle: 'Freshly prepared favourites, ready for your table or your front door.', featuredTitle: 'Guest favourites', heroStyle: 'restaurant', defaultColor: '#b45309', benefits: ['Freshly prepared', 'Local ingredients', 'Easy pickup and delivery'],
    products: [
      { id: 1, name: 'House Sourdough Pizza', price: '₹549', category: 'From the oven', image: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1000&q=85' },
      { id: 2, name: 'Seasonal Garden Bowl', price: '₹389', category: 'Fresh plates', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85' },
      { id: 3, name: 'Chocolate Fondant', price: '₹299', category: 'Something sweet', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=85' },
    ],
  },
  'Hotel & Travel Booking': {
    eyebrow: 'Find your way somewhere wonderful', headline: 'A stay worth travelling for', subtitle: 'Discover thoughtful stays and memorable escapes, chosen for the way you want to feel.', featuredTitle: 'Places to stay awhile', heroStyle: 'travel', defaultColor: '#0f766e', benefits: ['Handpicked stays', 'Flexible dates', 'Local experiences'],
    products: [
      { id: 1, name: 'Sea-view Hideaway', price: '₹8,500 / night', category: 'Goa · 2 guests', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=85' },
      { id: 2, name: 'Mountain House', price: '₹6,800 / night', category: 'Manali · 4 guests', image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1000&q=85' },
      { id: 3, name: 'The Old City Courtyard', price: '₹5,200 / night', category: 'Jaipur · 2 guests', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=85' },
    ],
  },
  'SaaS & Startup': {
    eyebrow: 'Less busywork. More momentum.', headline: 'Your whole team, moving forward', subtitle: 'One calm workspace to bring your projects, people and next big ideas together.', featuredTitle: 'Everything you need to do your best work', heroStyle: 'saas', defaultColor: '#4f46e5', benefits: ['Set up in minutes', 'Works with your tools', 'Human help when you need it'],
    products: [
      { id: 1, name: 'Starter', price: '₹799 / month', category: 'For small teams', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=85' },
      { id: 2, name: 'Growth', price: '₹1,999 / month', category: 'For growing teams', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=85' },
      { id: 3, name: 'Scale', price: 'Let’s talk', category: 'For larger teams', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=85' },
    ],
  },
  'Agency & Business': {
    eyebrow: 'Independent by nature · Collaborative by design', headline: 'We make ambitious ideas matter', subtitle: 'A thoughtful creative partner for brands ready to grow into what comes next.', featuredTitle: 'How we help', heroStyle: 'agency', defaultColor: '#c2410c', benefits: ['Senior creative team', 'Clear, honest process', 'Built around your goals'],
    products: [
      { id: 1, name: 'Brand Strategy', price: 'From ₹75,000', category: '01 · Strategy', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=85' },
      { id: 2, name: 'Digital Experience', price: 'From ₹1,20,000', category: '02 · Design & build', image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1000&q=85' },
      { id: 3, name: 'Growth Partnership', price: 'Let’s talk', category: '03 · Ongoing support', image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85' },
    ],
  },
  'Blog & Magazine': {
    eyebrow: 'The Sunday Edit', headline: 'Stories for a more considered life', subtitle: 'Ideas, voices and discoveries worth taking a little time for.', featuredTitle: 'Latest stories', heroStyle: 'editorial', defaultColor: '#292524', benefits: ['Fresh perspectives', 'Independent voices', 'A note worth opening'],
    products: [
      { id: 1, name: 'The art of slowing down', price: '8 min read', category: 'Culture · October 12', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85' },
      { id: 2, name: 'Objects made to last', price: '5 min read', category: 'Design · October 10', image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1000&q=85' },
      { id: 3, name: 'A table in the garden', price: '6 min read', category: 'Food · October 8', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=85' },
    ],
  },
  'Education & Courses': {
    eyebrow: 'Learn something that moves you forward', headline: 'Make room for your next idea', subtitle: 'Practical courses and kind instructors to help you build skills at your own pace.', featuredTitle: 'Popular learning paths', heroStyle: 'education', defaultColor: '#0369a1', benefits: ['Learn at your pace', 'Expert-led lessons', 'Certificates included'],
    products: [
      { id: 1, name: 'The Complete Design Course', price: '₹2,499', category: 'Design · 24 lessons', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85' },
      { id: 2, name: 'Everyday Data Skills', price: '₹1,999', category: 'Technology · 18 lessons', image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1000&q=85' },
      { id: 3, name: 'Write with Confidence', price: '₹1,499', category: 'Writing · 12 lessons', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=85' },
    ],
  },
  'Real Estate': {
    eyebrow: 'Find your place in the city', headline: 'A home for the life you’re building', subtitle: 'Explore homes with character, space to grow and a neighbourhood to love.', featuredTitle: 'Homes worth seeing', heroStyle: 'realestate', defaultColor: '#0f766e', benefits: ['Verified listings', 'Local area guides', 'A real person to help'],
    products: [
      { id: 1, name: 'Sunlit Corner Apartment', price: '₹1.45 Cr', category: '3 bed · Bandra West, Mumbai', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85' },
      { id: 2, name: 'Garden House', price: '₹92 Lakh', category: '4 bed · Whitefield, Bengaluru', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85' },
      { id: 3, name: 'The Riverside Studio', price: '₹34,000 / month', category: '1 bed · Kalyani Nagar, Pune', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85' },
    ],
  },
  'Fitness & Gym': {
    eyebrow: 'A stronger you, on your terms', headline: 'Show up for the life you want', subtitle: 'Expert coaching, welcoming spaces and a plan that meets you where you are.', featuredTitle: 'Find your kind of training', heroStyle: 'fitness', defaultColor: '#dc2626', benefits: ['Coaches who listen', 'Flexible memberships', 'All levels welcome'],
    products: [
      { id: 1, name: 'Strength Foundations', price: '₹1,499 / month', category: 'Small group training', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=85' },
      { id: 2, name: 'Personal Coaching', price: '₹3,999 / month', category: 'One-to-one sessions', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1000&q=85' },
      { id: 3, name: 'Move & Recover', price: '₹999 / month', category: 'Mobility and recovery', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=85' },
    ],
  },
  'Blank Website': {
    eyebrow: 'A fresh start', headline: 'Your story begins here', subtitle: 'Build a website that feels entirely yours.', featuredTitle: 'Your first section', heroStyle: 'blank', defaultColor: '#475569', benefits: [], products: [],
  },
};

const crc32 = (bytes) => {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const makeZip = (files) => {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const u16 = (view, at, value) => view.setUint16(at, value, true);
  const u32 = (view, at, value) => view.setUint32(at, value, true);

  for (const [name, contents] of Object.entries(files)) {
    const filename = encoder.encode(name);
    const data = encoder.encode(contents);
    const crc = crc32(data);
    const local = new Uint8Array(30 + filename.length + data.length);
    const localView = new DataView(local.buffer);
    u32(localView, 0, 0x04034b50); u16(localView, 4, 20); u16(localView, 6, 0);
    u16(localView, 8, 0); u16(localView, 10, 0); u16(localView, 12, 0);
    u32(localView, 14, crc); u32(localView, 18, data.length); u32(localView, 22, data.length);
    u16(localView, 26, filename.length); u16(localView, 28, 0);
    local.set(filename, 30); local.set(data, 30 + filename.length);
    localParts.push(local);

    const central = new Uint8Array(46 + filename.length);
    const centralView = new DataView(central.buffer);
    u32(centralView, 0, 0x02014b50); u16(centralView, 4, 20); u16(centralView, 6, 20);
    u16(centralView, 8, 0); u16(centralView, 10, 0); u16(centralView, 12, 0); u16(centralView, 14, 0);
    u32(centralView, 16, crc); u32(centralView, 20, data.length); u32(centralView, 24, data.length);
    u16(centralView, 28, filename.length); u16(centralView, 30, 0); u16(centralView, 32, 0);
    u16(centralView, 34, 0); u16(centralView, 36, 0); u32(centralView, 38, 0); u32(centralView, 42, offset);
    central.set(filename, 46); centralParts.push(central);
    offset += local.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  u32(endView, 0, 0x06054b50); u16(endView, 4, 0); u16(endView, 6, 0);
  u16(endView, 8, centralParts.length); u16(endView, 10, centralParts.length);
  u32(endView, 12, centralSize); u32(endView, 16, offset); u16(endView, 20, 0);
  return new Blob([...localParts, ...centralParts, end], { type: 'application/zip' });
};

const exportStore = (storeData) => {
  const files = createExportFiles(storeData);
  const blob = makeZip(files);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const slug = storeData.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'siteforge-store';
  link.href = url;
  link.download = `${slug}-code.zip`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const LiveEditor = ({ project, user, generationNotice = '', onBack, onSave, onLoginClick }) => {
  const [activePage, setActivePage] = useState('home');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [aiChangePrompt, setAiChangePrompt] = useState('');
  const [aiChangeBusy, setAiChangeBusy] = useState(false);
  const [editorNotice, setEditorNotice] = useState(generationNotice);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentNotice, setPaymentNotice] = useState('');
  const settingsStorageKey = `siteforge-settings-${project?.id || project?.storeName || 'preview'}`;
  const getSavedUpiId = () => {
    try {
      return JSON.parse(localStorage.getItem(settingsStorageKey) || '{}').upiId || '';
    } catch {
      return '';
    }
  };
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', image: '' });
  const projectIndustry = project?.industry === 'Services & Portfolio' ? 'Portfolio & Personal Brand' : project?.industry;
  const selectedIndustry = projectIndustry || 'Fashion & Apparel';
  const selectedTemplate = industryTemplates[selectedIndustry] || {
    ...industryTemplates['Fashion & Apparel'],
    eyebrow: project?.templateConfig?.category || 'Featured',
    headline: project?.templateConfig?.headline || `Discover ${project?.storeName || 'your new website'}`,
    subtitle: project?.templateConfig?.description || 'A considered, custom website template, ready for your content.',
    featuredTitle: project?.templateConfig?.featuredTitle || `Featured ${selectedIndustry}`,
    heroStyle: project?.templateConfig?.heroStyle || 'editorial',
    defaultColor: project?.templateConfig?.primaryColor || project?.primaryColor || '#2563eb',
    products: project?.templateConfig?.heroStyle === 'blank' ? [] : industryTemplates['Fashion & Apparel'].products.map((product, index) => index === 0 && project?.templateConfig?.previewImage ? { ...product, image: project.templateConfig.previewImage } : product),
  };
  const [customColor, setCustomColor] = useState(Boolean(project?.primaryColor && project.primaryColor !== '#3b82f6'));

  // AI Generated Data or User Config
  const [storeData, setStoreData] = useState(() => ({
    storeName: project?.storeName || 'SiteForge Store',
    industry: selectedIndustry,
    primaryColor: customColor ? project.primaryColor : selectedTemplate.defaultColor,
    heroHeadline: project?.generatedData?.heroHeadline || selectedTemplate.headline,
    heroSubtitle: project?.generatedData?.heroSubtitle || selectedTemplate.subtitle,
    products: project?.generatedData?.products || selectedTemplate.products,
    sections: project?.generatedData?.sections || [],
    upiId: project?.upiId || project?.generatedData?.upiId || getSavedUpiId(),
  }));
  const template = industryTemplates[storeData.industry] || selectedTemplate;

  const changeIndustryTemplate = (industry) => {
    const nextTemplate = industryTemplates[industry];
    if (!nextTemplate) return;
    setStoreData((current) => ({
      ...current,
      industry,
      heroHeadline: nextTemplate.headline,
      heroSubtitle: nextTemplate.subtitle,
      products: nextTemplate.products.map((product) => ({ ...product })),
      primaryColor: customColor ? current.primaryColor : nextTemplate.defaultColor,
    }));
    const firstProduct = nextTemplate.products[0];
    setCartItems(firstProduct ? [{ id: firstProduct.id, name: firstProduct.name, price: firstProduct.price, qty: 1 }] : []);
    setActivePage('home');
    setPaymentNotice('');
    setEditorNotice(`Loaded the ${industry} website layout and sample content.`);
  };

  const applyAiChange = async (event) => {
    event.preventDefault();
    const request = aiChangePrompt.trim();
    if (!request) return;
    setAiChangeBusy(true);
    setEditorNotice('');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/ai/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request,
          config: { storeName: storeData.storeName, industry: storeData.industry, primaryColor: storeData.primaryColor },
          current: storeData,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Could not update the website.');
      const baseProducts = industryTemplates[storeData.industry]?.products || [];
      setStoreData((current) => ({
        ...current,
        heroHeadline: payload.plan.heroHeadline,
        heroSubtitle: payload.plan.heroSubtitle,
        sections: payload.plan.sections,
        products: payload.plan.products.map((product, index) => ({
          ...baseProducts[index % Math.max(baseProducts.length, 1)],
          ...product,
          id: index + 1,
          price: `₹${Number(product.price).toLocaleString('en-IN')}`,
          image: baseProducts[index % Math.max(baseProducts.length, 1)]?.image || '',
        })),
      }));
      setAiChangePrompt('');
      setActivePage('home');
      setEditorNotice('Gemini AI updated this website preview.');
    } catch (error) {
      setEditorNotice(error.message);
    } finally {
      setAiChangeBusy(false);
    }
  };

  const [cartItems, setCartItems] = useState([]);
  const cartTotal = cartItems.reduce((sum, item) => sum + Number(String(item.price).replace(/[^0-9.]/g, '')) * item.qty, 0);
  const [upiQr, setUpiQr] = useState('');

  useEffect(() => {
    let isCurrent = true;
    if (activePage !== 'checkout' || paymentMethod !== 'upi' || !storeData.upiId?.trim()) {
      setUpiQr('');
      return undefined;
    }
    QRCode.toDataURL(createUpiPaymentUri(storeData.upiId, storeData.storeName, cartTotal), { width: 240, margin: 2 })
      .then((dataUrl) => { if (isCurrent) setUpiQr(dataUrl); })
      .catch(() => { if (isCurrent) setUpiQr(''); });
    return () => { isCurrent = false; };
  }, [activePage, paymentMethod, storeData.upiId, storeData.storeName, cartTotal]);

  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden font-sans">
      {/* Top Bar Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onBack(storeData)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              {storeData.storeName}
              <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-medium">
                Live Preview
              </span>
            </h2>
            <p className="text-xs text-slate-400">{storeData.industry}</p>
          </div>
        </div>

        {/* Multi-Page View Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 px-3 font-medium flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-400" /> Active Page:
          </span>
          {['home', 'products', 'cart', 'orders', 'admin'].map((page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activePage === page
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {page === 'cart' ? `Cart (${cartItems.length})` : page}
            </button>
          ))}
        </div>

        <div className="hidden xl:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800" aria-label="Preview size">
          {[
            { id: 'desktop', title: 'Desktop', Icon: Monitor },
            { id: 'tablet', title: 'Tablet', Icon: Tablet },
            { id: 'mobile', title: 'Mobile', Icon: Smartphone },
          ].map(({ id, title, Icon }) => <button key={id} title={title} aria-label={`${title} preview`} onClick={() => setPreviewMode(id)} className={`p-2 rounded-lg ${previewMode === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}><Icon className="w-4 h-4" /></button>)}
        </div>

        {/* Export ZIP Button */}
        <button
          onClick={() => exportStore(storeData)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
        >
          <Download className="w-4 h-4" /> Export Tailored Code (.ZIP)
        </button>
      </header>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Inspector Control Sidebar */}
        <aside className="w-80 bg-slate-900 border-r border-slate-800 p-6 space-y-6 overflow-y-auto shrink-0">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Site Controls</h3>
          </div>

          <div>
            <label htmlFor="website-template" className="text-xs font-semibold text-slate-300 block mb-1.5">Website category template</label>
            <select
              id="website-template"
              value={storeData.industry}
              onChange={(event) => changeIndustryTemplate(event.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {[...Object.keys(industryTemplates), ...(!industryTemplates[storeData.industry] ? [storeData.industry] : [])].map((industry) => <option key={industry} value={industry}>{industry}</option>)}
            </select>
            <p className="text-[11px] text-slate-500 mt-2">Choose a category to load its own storefront design, copy, and sample products.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Store Brand Name</label>
            <input
              type="text"
              value={storeData.storeName}
              onChange={(e) => setStoreData({ ...storeData, storeName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Hero Headline</label>
            <textarea
              rows="3"
              value={storeData.heroHeadline}
              onChange={(e) => setStoreData({ ...storeData, heroHeadline: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Theme Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={storeData.primaryColor}
                onChange={(e) => {
                  setCustomColor(true);
                  setStoreData({ ...storeData, primaryColor: e.target.value });
                }}
                className="w-12 h-10 bg-slate-950 border border-slate-800 rounded cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-400">{storeData.primaryColor}</span>
            </div>
          </div>

          <form onSubmit={applyAiChange} className="border-t border-slate-800 pt-5 space-y-2">
            <label htmlFor="ai-site-change" className="text-xs font-semibold text-slate-300 block">Ask AI to edit this site</label>
            <textarea id="ai-site-change" rows="3" value={aiChangePrompt} onChange={(event) => setAiChangePrompt(event.target.value)} placeholder="e.g. Make the headline more playful and add eco-friendly products" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500" />
            <button disabled={aiChangeBusy || !aiChangePrompt.trim()} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2.5 rounded-lg flex items-center justify-center gap-2"><Sparkles className="w-3.5 h-3.5" />{aiChangeBusy ? 'Updating with AI…' : 'Apply with Gemini AI'}</button>
          </form>
        </aside>

        {/* Canvas Display View */}
        <main className="flex-1 min-w-0 bg-slate-950 p-3 md:p-5 flex justify-center items-start overflow-auto">
          <div className={`w-full min-h-full bg-white text-slate-900 shadow-2xl flex flex-col overflow-hidden transition-all ${previewMode === 'desktop' ? 'max-w-[1440px]' : previewMode === 'tablet' ? 'max-w-[820px]' : 'max-w-[390px]'}`}>
            {editorNotice && <div role="status" className="bg-blue-50 border-b border-blue-100 px-5 py-3 text-xs text-blue-900 flex items-start justify-between gap-4"><span>{editorNotice}</span><button onClick={() => setEditorNotice('')} aria-label="Dismiss notice" className="font-bold">×</button></div>}
            <div className="bg-slate-950 text-white text-center py-2 px-4 text-[10px] sm:text-xs tracking-wide">
              {template.isService ? 'Independent creative studio · Booking new projects' : storeData.industry === 'Restaurant & Food Ordering' ? 'Fresh from our kitchen · Order for pickup or delivery' : storeData.industry === 'Hotel & Travel Booking' ? 'Thoughtful stays · Memorable places' : storeData.industry === 'SaaS & Startup' ? 'A calmer way to do your best work · Start today' : storeData.industry === 'Blog & Magazine' ? 'Independent stories · A little something worth reading' : storeData.industry === 'Education & Courses' ? 'Learn at your own pace · Build a skill that stays with you' : storeData.industry === 'Real Estate' ? 'Thoughtful homes · Local people who know the neighbourhood' : storeData.industry === 'Fitness & Gym' ? 'Stronger together · Your first session starts here' : `Complimentary shipping on orders over ₹5,000 · ${storeData.industry} essentials, thoughtfully selected`}
            </div>
            <nav className="px-5 md:px-12 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <span className="font-extrabold text-xl md:text-2xl tracking-tight" style={{ color: storeData.primaryColor }}>
                {storeData.storeName}
              </span>
                      <div className="flex items-center gap-3 md:gap-8 text-xs md:text-sm font-medium text-slate-600">
                <button
                  onClick={() => setActivePage('home')}
                  className={activePage === 'home' ? 'font-bold text-slate-900' : 'hover:text-slate-900'}
                >
                  Home
                </button>
                <button
                  onClick={() => setActivePage('products')}
                  className={activePage === 'products' ? 'font-bold text-slate-900' : 'hover:text-slate-900'}
                >
                          {storeData.industry === 'Blog & Magazine' ? 'Stories' : storeData.industry === 'Hotel & Travel Booking' ? 'Stays' : storeData.industry === 'Education & Courses' ? 'Courses' : storeData.industry === 'Real Estate' ? 'Properties' : template.isService ? 'Services' : storeData.industry === 'Restaurant & Food Ordering' ? 'Menu' : 'Products'}
                </button>
                <button
                  onClick={() => setActivePage('cart')}
                  className={`flex items-center gap-1 ${activePage === 'cart' ? 'font-bold text-slate-900' : 'hover:text-slate-900'}`}
                >
                  <ShoppingBag className="w-4 h-4" /> <span className="hidden sm:inline">{template.isService ? 'Enquiries' : 'Cart'}</span> ({cartItems.length})
                </button>
                <button
                  onClick={() => setActivePage('orders')}
                  className={activePage === 'orders' ? 'font-bold text-slate-900' : 'hover:text-slate-900'}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActivePage('admin')}
                  className={activePage === 'admin' ? 'font-bold text-slate-900' : 'hover:text-slate-900'}
                >
                  Admin
                </button>
              </div>
            </nav>

            {/* Live Page Content Rendering */}
            <div className="flex-1 overflow-y-auto">
              {/* HOME PAGE */}
              {activePage === 'home' && (
                <div>
                  {template.heroStyle === 'editorial' || template.heroStyle === 'travel' ? (
                    <section className="min-h-[430px] md:min-h-[560px] flex items-center bg-cover bg-center relative" style={{ backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.82), rgba(15,23,42,.08)), url('${storeData.products[0]?.image || ''}')` }}>
                      <div className="relative max-w-3xl px-8 md:px-20 py-20 text-white">
                        <p className="uppercase tracking-[.25em] text-xs font-semibold mb-5 text-white/80">{template.eyebrow}</p>
                        <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-[1.08]">{storeData.heroHeadline}</h1>
                        <p className="text-base md:text-lg mb-9 max-w-xl text-white/85">{storeData.heroSubtitle}</p>
                        <button onClick={() => setActivePage('products')} style={{ backgroundColor: storeData.primaryColor }} className="text-white text-sm font-bold px-7 py-3.5 rounded-md shadow-lg hover:brightness-110 transition">
                          {template.heroStyle === 'travel' ? 'Find your escape' : storeData.industry === 'Blog & Magazine' ? 'Read the stories' : 'Shop the collection'} <span className="ml-2">→</span>
                        </button>
                      </div>
                    </section>
                  ) : (
                    <section className={`min-h-[430px] md:min-h-[560px] grid grid-cols-1 md:grid-cols-2 items-stretch ${template.heroStyle === 'electronics' || template.heroStyle === 'fitness' || template.heroStyle === 'saas' ? 'bg-slate-950 text-white' : template.heroStyle === 'beauty' ? 'bg-rose-50 text-rose-950' : template.heroStyle === 'food' || template.heroStyle === 'restaurant' ? 'bg-emerald-50 text-emerald-950' : template.heroStyle === 'travel' ? 'bg-teal-950 text-white' : template.heroStyle === 'education' ? 'bg-sky-50 text-sky-950' : template.heroStyle === 'realestate' ? 'bg-teal-50 text-teal-950' : template.heroStyle === 'agency' ? 'bg-orange-50 text-stone-950' : 'bg-stone-100 text-stone-950'}`}>
                      <div className="flex flex-col items-start justify-center px-8 md:px-16 py-14 md:py-20">
                        <p className="uppercase tracking-[.22em] text-xs font-semibold mb-5 opacity-65">{template.eyebrow}</p>
                        <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-[1.08]">{storeData.heroHeadline}</h1>
                        <p className="text-base md:text-lg mb-8 max-w-xl opacity-75">{storeData.heroSubtitle}</p>
                        <button onClick={() => setActivePage('products')} style={{ backgroundColor: storeData.primaryColor }} className="text-white text-sm font-bold px-7 py-3.5 rounded-md shadow-lg hover:brightness-110 transition">
                          {template.isService ? 'Explore our services' : 'Explore the collection'} <span className="ml-2">→</span>
                        </button>
                      </div>
                      <div className="min-h-[300px] md:min-h-full overflow-hidden">
                        <img src={storeData.products[0]?.image} alt={template.isService ? 'Featured portfolio work' : `Featured ${storeData.industry} collection`} className="w-full h-full min-h-[300px] md:min-h-[560px] object-cover" />
                      </div>
                    </section>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-100 px-6 md:px-14 py-6 text-center gap-4 text-xs text-slate-600">
                    {template.benefits.map((benefit) => <span key={benefit}>✦ {benefit}</span>)}
                  </div>

                  {storeData.industry === 'Fashion & Apparel' && (
                    <section className="mx-6 md:mx-14 my-12 md:my-16 bg-stone-100 grid md:grid-cols-2 items-center">
                      <img src={storeData.products[1]?.image || storeData.products[0]?.image} alt="Featured look from the collection" className="w-full h-72 md:h-[420px] object-cover" />
                      <div className="px-8 md:px-14 py-10 md:py-14"><p className="text-xs uppercase tracking-[.22em] text-stone-500">Made for your everyday</p><h2 className="font-serif text-3xl md:text-5xl mt-4 leading-tight">A little more you, in every detail.</h2><p className="text-sm text-stone-600 mt-5 leading-7">Find considered pieces that feel as good as they look, selected to make getting dressed the easiest part of your day.</p><button onClick={() => setActivePage('products')} className="mt-6 border-b border-stone-500 pb-1 text-sm">Explore the edit →</button></div>
                    </section>
                  )}

                  {storeData.industry === 'Electronics & Gadgets' && (
                    <section className="bg-slate-950 text-white px-6 md:px-14 py-12 md:py-16">
                      <p className="text-xs uppercase tracking-[.22em] text-blue-300">Find your next favourite</p><h2 className="text-3xl md:text-5xl font-semibold mt-3">Technology that fits your day.</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">{['Audio, made immersive', 'Smart essentials', 'Everyday accessories'].map((item, index) => <button key={item} onClick={() => setActivePage('products')} className="text-left border border-white/15 hover:border-blue-400 p-5 md:p-7 transition"><span className="text-blue-300 text-xs">0{index + 1} / DISCOVER</span><strong className="block text-lg mt-3">{item}</strong><span className="block text-sm text-slate-400 mt-2">Explore carefully selected devices and useful upgrades →</span></button>)}</div>
                    </section>
                  )}

                  {storeData.industry === 'Beauty & Cosmetics' && (
                    <section className="mx-6 md:mx-14 my-12 md:my-16 grid md:grid-cols-2 bg-rose-50 items-center">
                      <div className="px-8 md:px-14 py-10 md:py-16"><p className="text-xs uppercase tracking-[.22em] text-rose-700">A moment for yourself</p><h2 className="font-serif text-3xl md:text-5xl mt-4 leading-tight text-rose-950">Care that feels like a ritual.</h2><p className="text-sm text-rose-900/70 mt-5 leading-7">Gentle everyday essentials, thoughtfully chosen to make your routine feel a little more personal.</p><div className="flex flex-wrap gap-2 mt-6">{['Thoughtful ingredients', 'Everyday care', 'Cruelty-free picks'].map((tag) => <span key={tag} className="rounded-full bg-white/80 text-rose-900 px-3 py-2 text-xs">{tag}</span>)}</div><button onClick={() => setActivePage('products')} className="mt-7 px-5 py-3 bg-rose-900 text-white text-sm">Shop skincare</button></div>
                      <img src={storeData.products[1]?.image || storeData.products[0]?.image} alt="Beauty and self-care collection" className="w-full h-72 md:h-[440px] object-cover" />
                    </section>
                  )}

                  {storeData.industry === 'Food & Grocery' && (
                    <section className="mx-6 md:mx-14 my-12 md:my-16 grid md:grid-cols-[1fr_1.2fr] bg-emerald-50 items-center">
                      <div className="px-8 md:px-12 py-10 md:py-14"><p className="text-xs uppercase tracking-[.22em] text-emerald-800">Goodness, gathered fresh</p><h2 className="font-serif text-3xl md:text-5xl mt-4 leading-tight text-emerald-950">A better kind of everyday basket.</h2><p className="text-sm text-emerald-900/70 mt-5 leading-7">Seasonal favourites and pantry staples, brought together for the meals and moments that matter.</p><button onClick={() => setActivePage('products')} className="mt-6 bg-emerald-800 text-white px-5 py-3 text-sm">Browse fresh picks</button></div>
                      <img src={storeData.products[2]?.image || storeData.products[0]?.image} alt="Fresh ingredients from the market" className="w-full h-72 md:h-[400px] object-cover" />
                    </section>
                  )}

                  {template.isService && (
                    <section className="bg-stone-950 text-white px-6 md:px-14 py-12 md:py-16">
                      <p className="text-xs uppercase tracking-[.22em] text-stone-400">A clear, thoughtful process</p><h2 className="font-serif text-3xl md:text-5xl mt-3">From first idea to finished work.</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-9">{[['01', 'Listen', 'We start with your goals, audience, and the idea you want to bring to life.'], ['02', 'Shape', 'Together, we find a direction and make a plan that feels right for your project.'], ['03', 'Create', 'We build, refine, and deliver the work with care at every step.']].map(([number, title, copy]) => <div key={number} className="border-t border-white/20 pt-5"><span className="text-amber-300 text-sm">{number}</span><h3 className="text-xl font-semibold mt-3">{title}</h3><p className="text-sm text-stone-400 leading-6 mt-2">{copy}</p></div>)}</div>
                    </section>
                  )}

                  {storeData.industry === 'Restaurant & Food Ordering' && (
                    <section className="mx-6 md:mx-14 my-12 md:my-16 grid md:grid-cols-2 border border-amber-900/10"><img src={storeData.products[0]?.image} alt="Freshly prepared restaurant favourite" className="w-full h-72 md:h-[430px] object-cover" /><div className="bg-amber-50 px-8 md:px-14 py-10 md:py-14 flex flex-col justify-center"><p className="text-xs uppercase tracking-[.22em] text-amber-800">From our kitchen</p><h2 className="font-serif text-3xl md:text-5xl mt-4 text-amber-950">A table full of good things.</h2><p className="text-sm text-amber-950/70 leading-7 mt-5">Seasonal ingredients, familiar flavours and a little something unexpected in every bite.</p><button onClick={() => setActivePage('products')} className="self-start mt-6 bg-amber-800 text-white px-5 py-3 text-sm">See the menu</button></div></section>
                  )}

                  {storeData.industry === 'Hotel & Travel Booking' && (
                    <section className="relative mx-6 md:mx-14 my-12 md:my-16 min-h-[320px] flex items-end overflow-hidden"><img src={storeData.products[1]?.image || storeData.products[0]?.image} alt="A quiet place to get away" className="absolute inset-0 w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/20 to-transparent" /><div className="relative p-8 md:p-14 text-white max-w-3xl"><p className="text-xs uppercase tracking-[.22em] text-white/75">Take the scenic route</p><h2 className="font-serif text-3xl md:text-5xl mt-3">Stay somewhere that stays with you.</h2><p className="mt-3 text-sm text-white/80">Slow mornings, thoughtful details, and a new view outside your window.</p><button onClick={() => setActivePage('products')} className="mt-5 bg-white text-slate-900 px-5 py-3 text-sm">Find your stay</button></div></section>
                  )}

                  {storeData.industry === 'SaaS & Startup' && (
                    <section className="mx-6 md:mx-14 my-12 md:my-16 rounded-2xl bg-indigo-50 p-6 md:p-12 grid md:grid-cols-2 gap-8 items-center"><div><p className="text-xs uppercase tracking-[.22em] text-indigo-700">A clearer view of your work</p><h2 className="text-3xl md:text-5xl font-semibold mt-3 text-slate-950">Less chasing. More making.</h2><p className="text-sm text-slate-600 mt-4 leading-7">Bring the work into focus with a shared space that keeps your team and your next steps in sync.</p><button onClick={() => setActivePage('products')} className="mt-5 bg-indigo-700 text-white px-5 py-3 text-sm">Explore plans</button></div><div className="rounded-xl bg-white shadow-xl border border-indigo-100 p-5 md:p-7"><div className="flex gap-2 mb-6"><i className="w-2.5 h-2.5 rounded-full bg-rose-400" /><i className="w-2.5 h-2.5 rounded-full bg-amber-400" /><i className="w-2.5 h-2.5 rounded-full bg-emerald-400" /></div><div className="grid grid-cols-3 gap-3">{[['On track', '12'], ['In progress', '08'], ['Completed', '24']].map(([label, count]) => <div key={label} className="bg-slate-50 p-3 rounded-lg"><span className="text-[10px] text-slate-500">{label}</span><strong className="block text-xl text-slate-900">{count}</strong></div>)}</div><div className="mt-5 space-y-3">{['Launch campaign', 'Product research', 'Website refresh'].map((item, index) => <div key={item} className="flex items-center gap-3 border-b border-slate-100 pb-3"><span className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-emerald-500' : 'bg-indigo-400'}`} /><span className="text-xs text-slate-700">{item}</span><span className="ml-auto text-[10px] text-slate-400">{index === 0 ? 'Done' : 'In progress'}</span></div>)}</div></div></section>
                  )}

                  {storeData.industry === 'Agency & Business' && (
                    <section className="bg-orange-50 px-6 md:px-14 py-12 md:py-16"><div className="flex flex-col md:flex-row md:items-end justify-between gap-5"><div><p className="text-xs uppercase tracking-[.22em] text-orange-800">A few recent collaborations</p><h2 className="font-serif text-3xl md:text-5xl mt-3 text-stone-950">Good work, done together.</h2></div><button onClick={() => setActivePage('products')} className="self-start border-b border-stone-500 pb-1 text-sm">See what we do →</button></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">{storeData.products.map((product) => <button key={product.id} onClick={() => setActivePage('products')} className="relative text-left overflow-hidden group"><img src={product.image} alt={product.name} className="w-full h-56 object-cover transition-transform group-hover:scale-105" /><span className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/75 text-white"><span className="block text-xs text-white/70">{product.category}</span><strong className="block mt-1">{product.name}</strong></span></button>)}</div></section>
                  )}

                  {storeData.industry === 'Blog & Magazine' && (
                    <section className="px-6 md:px-14 py-12 md:py-16 border-y border-stone-200"><div className="flex items-end justify-between"><div><p className="text-xs uppercase tracking-[.22em] text-stone-500">Notes from the editors</p><h2 className="font-serif text-3xl md:text-5xl mt-3">Read a little deeper.</h2></div><button onClick={() => setActivePage('products')} className="text-sm border-b border-stone-500 pb-1">All stories →</button></div><div className="grid md:grid-cols-[1.4fr_1fr] gap-7 mt-8"><button onClick={() => setActivePage('products')} className="text-left"><img src={storeData.products[0]?.image} alt={storeData.products[0]?.name} className="w-full h-64 md:h-[380px] object-cover" /><p className="text-xs uppercase tracking-widest text-stone-500 mt-4">{storeData.products[0]?.category}</p><h3 className="font-serif text-2xl md:text-3xl mt-2">{storeData.products[0]?.name}</h3></button><div className="divide-y divide-stone-200">{storeData.products.slice(1).map((product, index) => <button key={product.id} onClick={() => setActivePage('products')} className="flex gap-4 text-left py-5 first:pt-0 w-full"><span className="text-sm text-stone-400">0{index + 2}</span><span><span className="text-xs text-stone-500">{product.category}</span><strong className="block font-serif text-xl mt-1">{product.name}</strong><span className="text-xs text-stone-400 mt-2 block">{product.price}</span></span></button>)}</div></div></section>
                  )}

                  {storeData.industry === 'Education & Courses' && (
                    <section className="mx-6 md:mx-14 my-12 md:my-16 rounded-2xl bg-sky-50 p-7 md:p-12"><div className="grid md:grid-cols-[.8fr_1.2fr] gap-8 items-center"><div><p className="text-xs uppercase tracking-[.22em] text-sky-800">A path that fits your life</p><h2 className="text-3xl md:text-5xl font-semibold mt-3 text-sky-950">Small lessons. Big progress.</h2><p className="text-sm text-sky-950/70 mt-4 leading-7">Build confidence one lesson at a time with practical learning created by people who care about your growth.</p><button onClick={() => setActivePage('products')} className="mt-5 bg-sky-800 text-white px-5 py-3 text-sm">Browse courses</button></div><div className="space-y-3">{storeData.products.map((course, index) => <button key={course.id} onClick={() => setActivePage('products')} className="w-full bg-white rounded-xl border border-sky-100 p-4 flex items-center gap-4 text-left"><span className="w-10 h-10 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold">0{index + 1}</span><span className="min-w-0"><strong className="block truncate text-slate-900">{course.name}</strong><span className="text-xs text-slate-500">{course.category}</span></span><span className="ml-auto text-xs font-semibold text-sky-800">{course.price}</span></button>)}</div></div></section>
                  )}

                  {storeData.industry === 'Real Estate' && (
                    <section className="mx-6 md:mx-14 my-12 md:my-16"><div className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[.22em] text-teal-800">Spaces with possibility</p><h2 className="font-serif text-3xl md:text-5xl mt-3">Find your next address.</h2></div><button onClick={() => setActivePage('products')} className="text-sm border-b border-slate-400 pb-1">See all homes →</button></div><div className="grid md:grid-cols-2 gap-5 mt-8">{storeData.products.slice(0, 2).map((home) => <button key={home.id} onClick={() => setActivePage('products')} className="text-left border border-slate-200"><img src={home.image} alt={home.name} className="w-full h-64 md:h-80 object-cover" /><div className="p-5"><div className="flex justify-between gap-3"><strong className="text-lg">{home.name}</strong><b className="text-teal-800">{home.price}</b></div><p className="text-xs text-slate-500 mt-2">{home.category}</p><div className="flex gap-5 border-t mt-4 pt-4 text-xs text-slate-600"><span>3 bedrooms</span><span>2 bathrooms</span><span>Ready to move</span></div></div></button>)}</div></section>
                  )}

                  {storeData.industry === 'Fitness & Gym' && (
                    <section className="bg-neutral-950 text-white px-6 md:px-14 py-12 md:py-16"><div className="grid md:grid-cols-2 gap-10 items-center"><div><p className="text-xs uppercase tracking-[.22em] text-red-400">Your first session starts here</p><h2 className="font-black uppercase italic text-4xl md:text-6xl mt-3 leading-none">Build strength<br />for real life.</h2><p className="text-sm text-neutral-400 mt-5 max-w-lg">A welcoming place to get stronger, find your rhythm and feel good in your body.</p><button onClick={() => setActivePage('products')} className="mt-6 bg-red-600 text-white px-6 py-3 text-sm font-bold uppercase tracking-wide">Find your plan</button></div><div className="grid grid-cols-2 gap-3">{storeData.products.slice(0, 2).map((product) => <div key={product.id} className="relative min-h-56 overflow-hidden"><img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover opacity-70" /><div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90"><p className="text-[10px] uppercase text-red-300">{product.category}</p><strong className="block mt-1">{product.name}</strong></div></div>)}</div></div></section>
                  )}

                  {storeData.sections?.length > 0 && <section className="px-6 md:px-14 py-12 md:py-16 bg-slate-50"><p className="text-xs uppercase tracking-[.22em] text-slate-500">Made for {storeData.storeName}</p><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">{storeData.sections.map((section, index) => <article key={`${section}-${index}`} className="bg-white border border-slate-200 p-5"><span className="text-xs text-slate-400">0{index + 1}</span><h3 className="font-semibold text-lg mt-2 text-slate-900">{section}</h3><p className="text-sm text-slate-500 mt-2">A little more about {section.toLowerCase()} and how it fits into the {storeData.industry.toLowerCase()} experience.</p></article>)}</div></section>}

                  <section className="px-6 md:px-14 py-14 md:py-20">
                    <div className="flex items-end justify-between mb-8">
                      <div><p className="text-xs uppercase tracking-[.2em] text-slate-400 mb-2">{template.eyebrow}</p><h3 className="font-bold text-2xl md:text-3xl">{template.featuredTitle}</h3></div>
                      <button onClick={() => setActivePage('products')} className="text-xs font-semibold border-b border-slate-400 pb-1">{template.isService ? 'View services' : 'View all'}</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
                      {storeData.products.map((product) => (
                        <div key={product.id} className="group bg-white">
                          <div className="overflow-hidden bg-slate-100">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-64 md:h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          </div>
                          <div className="pt-4"><p className="text-[10px] uppercase tracking-widest text-slate-400">{product.category}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div><h4 className="font-semibold text-slate-800 text-sm md:text-base">{product.name}</h4>
                            <span className="font-semibold text-sm block mt-1" style={{ color: storeData.primaryColor }}>
                              {product.price}
                            </span></div>
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="text-xs border border-slate-200 px-3 py-2 font-semibold hover:text-white transition-colors"
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = storeData.primaryColor; e.currentTarget.style.borderColor = storeData.primaryColor; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                            >
                              {template.isService ? 'Add to enquiry' : 'Add to Cart'}
                            </button>
                          </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="mx-6 md:mx-14 mb-14 bg-slate-50 px-8 md:px-14 py-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div><p className="text-xs uppercase tracking-[.2em] text-slate-400 mb-2">{template.isService ? 'Have a project in mind?' : 'A little note from us'}</p><h3 className="text-2xl font-bold">{template.isService ? 'Let’s make something thoughtful.' : 'Good things, delivered.'}</h3><p className="text-sm text-slate-500 mt-2">{template.isService ? 'Browse our services and add the ones you would like to discuss.' : 'Discover pieces you’ll reach for again and again.'}</p></div>
                    <button onClick={() => setActivePage('products')} style={{ backgroundColor: storeData.primaryColor }} className="px-7 py-3 text-white text-sm font-semibold">{template.isService ? 'Explore services →' : 'Explore the store →'}</button>
                  </section>
                </div>
              )}

              {/* PRODUCTS PAGE */}
              {activePage === 'products' && (
                <div className="px-6 md:px-14 py-12 md:py-16 min-h-[620px]">
                  <p className="text-xs uppercase tracking-[.2em] text-slate-400 mb-2">{template.eyebrow}</p><h2 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900">{template.isService ? 'Services & selected work' : template.featuredTitle}</h2>
                  <p className="text-sm text-slate-500 mb-10">{template.isService ? 'A few ways we can help bring your next idea to life.' : storeData.industry === 'Restaurant & Food Ordering' ? 'Browse a menu of freshly prepared favourites.' : storeData.industry === 'Hotel & Travel Booking' ? 'Find a stay that feels like part of the journey.' : storeData.industry === 'Blog & Magazine' ? 'Ideas and voices from our latest edition.' : storeData.industry === 'Education & Courses' ? 'Find the next skill you want to make your own.' : storeData.industry === 'Real Estate' ? 'Explore homes and neighbourhoods we know well.' : storeData.industry === 'Fitness & Gym' ? 'Choose the coaching and training that fits your goals.' : storeData.industry === 'SaaS & Startup' ? 'Simple plans for the way your team works.' : `Explore our ${storeData.industry.toLowerCase()} collection.`}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {storeData.products.map((product) => (
                      <div key={product.id} className="group bg-white">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-64 md:h-80 w-full object-cover mb-4"
                        />
                        <h4 className="font-semibold text-slate-800">{product.name}</h4>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{product.category}</p>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                          <span className="font-bold text-sm" style={{ color: storeData.primaryColor }}>
                            {product.price}
                          </span>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="text-xs bg-slate-900 text-white px-3.5 py-2 rounded-lg font-semibold hover:bg-slate-800"
                          >
                            {template.isService ? 'Add to enquiry' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CART PAGE */}
              {activePage === 'cart' && (
                <div className="max-w-4xl mx-auto px-6 py-14 min-h-[620px]">
                  <p className="text-xs uppercase tracking-[.2em] text-slate-400 mb-2">Almost yours</p><h2 className="text-3xl font-bold mb-8 text-slate-900">Your shopping bag</h2>
                  {cartItems.length === 0 ? (
                    <p className="text-slate-500 text-sm">Your cart is empty.</p>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center border-b border-slate-200 py-5">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">Qty: {item.qty}</p>
                          </div>
                          <span className="font-bold text-slate-900 text-sm">{item.price}</span>
                        </div>
                      ))}
                      <button
                        onClick={() => setActivePage('checkout')}
                        style={{ backgroundColor: storeData.primaryColor }}
                        className="w-full mt-6 text-white text-sm font-bold py-3.5 rounded-xl shadow-lg"
                      >
                        Continue to checkout
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activePage === 'admin' && (
                <div className="max-w-3xl mx-auto px-6 py-14 min-h-[620px]">
                  {!user?.token ? (
                    <section className="mx-auto max-w-xl border border-slate-200 p-8 text-center">
                      <p className="text-xs uppercase tracking-[.2em] text-slate-400 mb-2">Private store controls</p>
                      <h2 className="text-3xl font-bold mb-3 text-slate-900">Sign in to manage this website</h2>
                      <p className="text-sm text-slate-500 mb-6">Only a signed-in SiteForge account can change this website’s UPI ID and products.</p>
                      <button onClick={onLoginClick} style={{ backgroundColor: storeData.primaryColor }} className="px-5 py-3 text-sm font-semibold text-white rounded">Sign in / Create account</button>
                    </section>
                  ) : (
                  <>
                  <p className="text-xs uppercase tracking-[.2em] text-slate-400 mb-2">Store settings</p>
                  <h2 className="text-3xl font-bold mb-3 text-slate-900">Admin panel</h2>
                  <p className="text-sm text-slate-500 mb-8">Signed in as {user.email || user.name}. Manage this website’s payment details and products here.</p>
                  <div className="border border-slate-200 p-6 md:p-8 space-y-4">
                    <label htmlFor="merchant-upi-id" className="block text-sm font-semibold">Merchant UPI ID</label>
                    <input
                      id="merchant-upi-id"
                      type="text"
                      value={storeData.upiId}
                      onChange={(event) => {
                        setStoreData({ ...storeData, upiId: event.target.value });
                        setSettingsSaved(false);
                      }}
                      placeholder="yourname@upi"
                      autoComplete="off"
                      className="w-full max-w-xl border border-slate-300 p-3 text-sm rounded focus:outline-none focus:border-slate-900"
                    />
                    <div>
                      <button
                        onClick={() => {
                          try {
                            const updated = { ...storeData, upiId: storeData.upiId.trim() };
                            localStorage.setItem(settingsStorageKey, JSON.stringify({ upiId: updated.upiId }));
                            setStoreData(updated);
                            onSave?.(updated);
                            setSettingsSaved(true);
                          } catch {
                            alert('Could not save this setting in browser storage.');
                          }
                        }}
                        style={{ backgroundColor: storeData.primaryColor }}
                        className="px-5 py-3 text-sm font-semibold text-white rounded"
                      >Save UPI ID</button>
                      {settingsSaved && <span role="status" className="ml-3 text-sm text-emerald-700">Saved on this device.</span>}
                    </div>
                    <p className="text-xs text-slate-500">The UPI ID appears in this store’s checkout preview and is included in the code export.</p>
                  </div>
                  <div className="border border-slate-200 p-6 md:p-8 mt-6 space-y-4">
                    <h3 className="font-semibold text-lg text-slate-900">Manage products</h3>
                    <form onSubmit={(event) => {
                      event.preventDefault();
                      const updated = { ...storeData, products: [...storeData.products, { ...newProduct, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, price: `₹${Number(newProduct.price).toLocaleString('en-IN')}` }] };
                      setStoreData(updated); onSave?.(updated); setNewProduct({ name: '', category: '', price: '', image: '' });
                    }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input required aria-label="Product name" placeholder="Product name" value={newProduct.name} onChange={(event) => setNewProduct({ ...newProduct, name: event.target.value })} className="border border-slate-300 p-3 text-sm rounded" />
                      <input aria-label="Product category" placeholder="Category" value={newProduct.category} onChange={(event) => setNewProduct({ ...newProduct, category: event.target.value })} className="border border-slate-300 p-3 text-sm rounded" />
                      <input required min="1" type="number" aria-label="Product price in rupees" placeholder="Price in ₹" value={newProduct.price} onChange={(event) => setNewProduct({ ...newProduct, price: event.target.value })} className="border border-slate-300 p-3 text-sm rounded" />
                      <input aria-label="Product image URL" placeholder="Image URL (optional)" value={newProduct.image} onChange={(event) => setNewProduct({ ...newProduct, image: event.target.value })} className="border border-slate-300 p-3 text-sm rounded" />
                      <button style={{ backgroundColor: storeData.primaryColor }} className="sm:col-span-2 px-5 py-3 text-sm font-semibold text-white rounded">Add product</button>
                    </form>
                    <ul className="divide-y divide-slate-200">{storeData.products.map((product) => <li key={product.id} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="text-slate-800">{product.name} · {product.price}</span><button onClick={() => { const updated = { ...storeData, products: storeData.products.filter((item) => item.id !== product.id) }; setStoreData(updated); onSave?.(updated); }} className="text-rose-700 hover:underline">Delete</button></li>)}</ul>
                    <p className="text-xs text-slate-500">Changes are saved to this SiteForge project when you add/remove products or save the UPI ID.</p>
                  </div>
                  </>
                  )}
                </div>
              )}

              {activePage === 'checkout' && (
                <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 md:py-14 min-h-[620px]">
                  <p className="text-xs uppercase tracking-[.2em] text-slate-400 mb-2">Secure checkout</p>
                  <h2 className="text-3xl font-bold mb-8 text-slate-900">Complete your order</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_.8fr] gap-10">
                    <div className="space-y-8">
                      <section>
                        <h3 className="font-semibold text-lg mb-4">Delivery details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input aria-label="Full name" placeholder="Full name" autoComplete="name" className="border border-slate-200 p-3 text-sm rounded" />
                          <input aria-label="Email" type="email" placeholder="Email address" autoComplete="email" className="border border-slate-200 p-3 text-sm rounded" />
                          <input aria-label="Phone" type="tel" placeholder="Phone number" autoComplete="tel" className="border border-slate-200 p-3 text-sm rounded" />
                          <input aria-label="Postal code" placeholder="Postal code" autoComplete="postal-code" className="border border-slate-200 p-3 text-sm rounded" />
                          <input aria-label="Shipping address" placeholder="Street address" autoComplete="street-address" className="border border-slate-200 p-3 text-sm rounded sm:col-span-2" />
                        </div>
                      </section>
                      <section>
                        <h3 className="font-semibold text-lg mb-4">Payment method</h3>
                        <div className="space-y-3">
                          {[
                            { id: 'upi', title: 'UPI', detail: 'Pay using a UPI app' },
                            { id: 'cod', title: 'Cash on delivery', detail: 'Pay when your order arrives' },
                          ].map((method) => (
                            <label key={method.id} className={`flex items-start gap-3 border p-4 rounded cursor-pointer ${paymentMethod === method.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200'}`}>
                              <input type="radio" name="paymentMethod" value={method.id} checked={paymentMethod === method.id} onChange={() => { setPaymentMethod(method.id); setPaymentNotice(''); }} className="mt-1 accent-slate-900" />
                              <span><span className="block text-sm font-semibold">{method.title}</span><span className="block text-xs text-slate-500 mt-1">{method.detail}</span></span>
                            </label>
                          ))}
                        </div>
                        {paymentMethod === 'upi' && (
                          <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-4 text-sm">
                            <span className="text-slate-500">Pay to UPI ID: </span>
                            <strong className="text-slate-900">{storeData.upiId || 'Store admin has not added a UPI ID yet'}</strong>
                            {storeData.upiId && (
                              <div id="upi-payment-qr" className="mt-4 flex flex-col items-center gap-2">
                                {upiQr ? <img src={upiQr} alt={`UPI payment QR for ${storeData.upiId}`} width="240" height="240" className="bg-white p-2" /> : <span className="text-xs text-slate-500">Generating payment QR…</span>}
                                <p className="text-xs text-slate-500">Scan with a UPI app and enter the checkout total. Payment confirmation is not automatic.</p>
                              </div>
                            )}
                          </div>
                        )}
                        {paymentNotice && <p role="status" className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{paymentNotice}</p>}
                      </section>
                    </div>
                    <aside className="bg-slate-50 p-6 h-fit">
                      <h3 className="font-semibold text-lg mb-5">Order summary</h3>
                      <div className="space-y-4">
                        {cartItems.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span className="text-slate-600">{item.name} × {item.qty}</span><span className="font-medium">{item.price}</span></div>)}
                      </div>
                      <div className="border-t border-slate-200 mt-5 pt-4 flex justify-between font-bold"><span>Total</span><span>₹{cartTotal.toLocaleString('en-IN')}</span></div>
                      <button
                        onClick={() => {
                          if (paymentMethod === 'upi') {
                            const upiId = storeData.upiId?.trim();
                            if (!upiId) {
                              setPaymentNotice('Add the merchant UPI ID in Admin settings before continuing.');
                              return;
                            }
                            setPaymentNotice('Scan the UPI QR above and enter the checkout total in your payment app.');
                            document.getElementById('upi-payment-qr')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            return;
                          }
                          setPaymentNotice('');
                          setActivePage('orders');
                        }}
                        style={{ backgroundColor: storeData.primaryColor }}
                        className="w-full mt-6 text-white text-sm font-bold py-3.5 rounded shadow-lg"
                      >
                        {paymentMethod === 'upi' ? 'Show payment QR' : 'Place order'}
                      </button>
                      <p className="text-[11px] text-slate-500 mt-3 text-center">Your payment details are handled securely by the payment provider.</p>
                    </aside>
                  </div>
                </div>
              )}

              {/* ORDERS PAGE */}
              {activePage === 'orders' && (
                <div className="max-w-4xl mx-auto px-6 py-14 min-h-[620px]">
                  <p className="text-xs uppercase tracking-[.2em] text-slate-400 mb-2">Thanks for shopping with us</p><h2 className="text-3xl font-bold mb-8 text-slate-900">Your orders</h2>
                  <div className="border border-slate-200 p-7 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-600" /> Order #ORD-99812
                      </span>
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Processing
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Items: {cartItems.map((i) => i.name).join(', ')}</p>
                    <p className="text-xs font-semibold text-slate-700">Payment Status: {paymentMethod === 'cod' ? 'Payment due on delivery' : 'Awaiting payment'}</p>
                  </div>
                </div>
              )}
              <footer className="bg-slate-950 text-white px-6 md:px-14 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div><p className="font-bold text-lg">{storeData.storeName}</p><p className="text-xs text-slate-400 mt-1">{template.isService ? 'Thoughtful work, made together.' : storeData.industry === 'Restaurant & Food Ordering' ? 'Good food, made with care.' : storeData.industry === 'Hotel & Travel Booking' ? 'Go somewhere that feels like you.' : storeData.industry === 'SaaS & Startup' ? 'Make room for your best work.' : storeData.industry === 'Blog & Magazine' ? 'A good story is always worth sharing.' : storeData.industry === 'Education & Courses' ? 'Keep learning. Keep becoming.' : storeData.industry === 'Real Estate' ? 'Find a place to call your own.' : storeData.industry === 'Fitness & Gym' ? 'Move well. Feel strong.' : 'Everyday pieces, chosen with care.'}</p></div>
                <p className="text-xs text-slate-400">© {new Date().getFullYear()} {storeData.storeName}. All rights reserved.</p>
              </footer>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default LiveEditor;
