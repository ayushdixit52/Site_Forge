export const createExportFiles = (store) => {
  const packageJson = {
    name: 'siteforge-store',
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'concurrently -k "npm:server" "npm:client"',
      server: 'node server/server.js',
      client: 'vite --host 127.0.0.1',
      build: 'vite build',
    },
    dependencies: {
      bcryptjs: '^3.0.3',
      concurrently: '^9.2.1',
      cors: '^2.8.6',
      dotenv: '^16.6.1',
      express: '^5.2.1',
      jsonwebtoken: '^9.0.3',
      nodemailer: '^7.0.3',
      qrcode: '^1.5.4',
      react: '^19.3.0',
      'react-dom': '^19.3.0',
      vite: '^7.1.0',
    },
  };

  const app = `import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import QRCode from 'qrcode';
import store from './store.json';
import './style.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const industryKey = ({ 'Fashion & Apparel': 'fashion', 'Electronics & Gadgets': 'electronics', 'Beauty & Cosmetics': 'beauty', 'Food & Grocery': 'food', 'Restaurant & Food Ordering': 'restaurant', 'Hotel & Travel Booking': 'travel', 'Services & Portfolio': 'portfolio', 'Portfolio & Personal Brand': 'portfolio', 'SaaS & Startup': 'saas', 'Agency & Business': 'agency', 'Blog & Magazine': 'blog', 'Education & Courses': 'education', 'Real Estate': 'realestate', 'Fitness & Gym': 'fitness' })[store.industry] || 'custom';
const isService = industryKey === 'portfolio' || industryKey === 'agency';
const money = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

async function api(path, options = {}, token = '') {
  const response = await fetch(API + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Request failed');
  return body;
}

function App() {
  const [page, setPage] = useState('home');
  const [products, setProducts] = useState(store.products || []);
  const [settings, setSettings] = useState({ upiId: store.upiId || '' });
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [qr, setQr] = useState('');
  const [orderTokens, setOrderTokens] = useState(() => JSON.parse(localStorage.getItem('siteforge-order-tokens') || '[]'));
  const [orders, setOrders] = useState([]);
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('siteforge-admin-token') || '');
  const [login, setLogin] = useState({ username: '', password: '' });
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', image: '', description: '' });
  const [editingProductId, setEditingProductId] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const total = useMemo(() => cart.reduce((sum, line) => sum + Number(line.product.price || 0) * line.quantity, 0), [cart]);

  const refreshProducts = async () => {
    try { const result = await api('/api/products'); setProducts(result.products); setSettings(result.settings); }
    catch (error) { setNotice(error.message); }
  };

  const refreshOrders = async () => {
    const results = await Promise.all(orderTokens.map(async (token) => {
      try { return (await api('/api/orders/' + encodeURIComponent(token))).order; }
      catch { return null; }
    }));
    setOrders(results.filter(Boolean));
  };

  const refreshAdmin = async (token = adminToken) => {
    const [productResult, orderResult, settingResult] = await Promise.all([
      api('/api/admin/products', {}, token), api('/api/admin/orders', {}, token), api('/api/admin/settings', {}, token),
    ]);
    setProducts(productResult.products); setOrders(orderResult.orders); setSettings(settingResult.settings);
  };

  useEffect(() => { refreshProducts(); }, []);
  useEffect(() => {
    if (page !== 'orders' || adminToken || !orderTokens.length) return undefined;
    refreshOrders();
    const timer = window.setInterval(refreshOrders, 12000);
    return () => window.clearInterval(timer);
  }, [page, adminToken, orderTokens]);
  useEffect(() => {
    if (page === 'admin' && adminToken) refreshAdmin().catch((error) => { setNotice(error.message); setAdminToken(''); sessionStorage.removeItem('siteforge-admin-token'); });
  }, [page, adminToken]);
  useEffect(() => {
    if (page !== 'checkout' || paymentMethod !== 'upi' || !settings.upiId) { setQr(''); return undefined; }
    let live = true;
    const params = new URLSearchParams({ pa: settings.upiId, pn: store.storeName, tn: 'Order from ' + store.storeName, am: total.toFixed(2), cu: 'INR' });
    QRCode.toDataURL('upi://pay?' + params.toString(), { width: 240, margin: 2 }).then((image) => { if (live) setQr(image); }).catch(() => setQr(''));
    return () => { live = false; };
  }, [page, paymentMethod, settings.upiId, total]);

  const addToCart = (product) => setCart((current) => {
    const found = current.find((line) => line.product._id === product._id);
    return found ? current.map((line) => line.product._id === product._id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { product, quantity: 1 }];
  });

  const placeOrder = async (event) => {
    event.preventDefault(); setBusy(true); setNotice('');
    try {
      const result = await api('/api/orders', { method: 'POST', body: JSON.stringify({ customer, paymentMethod, items: cart.map((line) => ({ productId: line.product._id, quantity: line.quantity })) }) });
      const nextTokens = [...new Set([...orderTokens, result.accessToken])];
      setOrderTokens(nextTokens); localStorage.setItem('siteforge-order-tokens', JSON.stringify(nextTokens));
      setCart([]); setPage('orders'); setNotice(result.email?.status === 'sent' ? 'Order placed. We emailed your order receipt and you can track its status here.' : 'Order placed, but the receipt email could not be sent. The store admin needs to check SMTP settings. You can still track your order here.');
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  };

  const adminLogin = async (event) => {
    event.preventDefault(); setBusy(true); setNotice('');
    try {
      const result = await api('/api/admin/login', { method: 'POST', body: JSON.stringify(login) });
      sessionStorage.setItem('siteforge-admin-token', result.token); setAdminToken(result.token); setLogin({ username: '', password: '' });
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  };

  const addProduct = async (event) => {
    event.preventDefault(); setBusy(true); setNotice('');
    try { await api(editingProductId ? '/api/admin/products/' + encodeURIComponent(editingProductId) : '/api/admin/products', { method: editingProductId ? 'PUT' : 'POST', body: JSON.stringify({ ...newProduct, price: Number(newProduct.price) }) }, adminToken); setNewProduct({ name: '', category: '', price: '', image: '', description: '' }); setEditingProductId(''); await refreshAdmin(); setNotice(editingProductId ? 'Product updated.' : 'Product added.'); }
    catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await api('/api/admin/products/' + encodeURIComponent(id), { method: 'DELETE' }, adminToken); await refreshAdmin(); }
    catch (error) { setNotice(error.message); }
  };

  const confirmOrder = async (id) => {
    setBusy(true); setNotice('');
    try { await api('/api/admin/orders/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify({ status: 'confirmed' }) }, adminToken); await refreshAdmin(); setNotice('Order confirmed and confirmation email sent.'); }
    catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  };

  const resendOrderEmail = async (id) => {
    setBusy(true); setNotice('');
    try { await api('/api/admin/orders/' + encodeURIComponent(id) + '/resend-confirmation', { method: 'POST' }, adminToken); setNotice('Confirmation email resent.'); }
    catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    try { const result = await api('/api/admin/settings', { method: 'PUT', body: JSON.stringify(settings) }, adminToken); setSettings(result.settings); setNotice('Store settings saved.'); }
    catch (error) { setNotice(error.message); }
  };

  const templateText = isService ? 'Selected work and services' : industryKey === 'food' ? 'Fresh picks this week' : industryKey === 'beauty' ? 'Your daily self-care edit' : industryKey === 'electronics' ? 'The latest in tech' : 'Shop the new collection';
  const heroCta = isService ? 'Explore services' : industryKey === 'food' ? 'Shop fresh picks' : industryKey === 'beauty' ? 'Find your ritual' : industryKey === 'electronics' ? 'Explore the tech' : 'Shop the collection';

  return <div className={'site site-' + industryKey}>
    <div className="announcement">{isService ? 'Independent studio · Taking new projects' : 'Thoughtfully selected ' + store.industry.toLowerCase() + ' · Secure checkout'}</div>
    <header className="site-header"><button className="brand" onClick={() => setPage('home')}>{store.storeName}</button><nav><button onClick={() => setPage('home')}>Home</button><button onClick={() => setPage('products')}>{isService ? 'Services' : 'Shop'}</button><button onClick={() => setPage('orders')}>Orders</button><button onClick={() => setPage('cart')}>Bag ({cart.reduce((sum, line) => sum + line.quantity, 0)})</button><button onClick={() => { setNotice(''); setPage('admin'); }}>Admin</button></nav></header>
    {notice && <div className="notice" role="status">{notice}</div>}
    {page === 'home' && <main>
      <section className="hero"><div className="hero-copy"><p className="eyebrow">{store.industry}</p><h1>{store.heroHeadline}</h1><p>{store.heroSubtitle}</p><button className="primary" onClick={() => setPage('products')}>{heroCta} →</button></div>{products[0]?.image && <img src={products[0].image} alt={'Featured ' + store.industry} />}</section>
      {industryKey === 'restaurant' && <section className="signature signature-restaurant"><div><p className="eyebrow">Fresh from our kitchen</p><h2>Something lovely for the table.</h2><p>Seasonal ingredients, familiar favourites, and a little something unexpected in every bite.</p><button className="primary" onClick={() => setPage('products')}>See the menu →</button></div><img src={products[1]?.image || products[0]?.image} alt="Restaurant menu favourites" /></section>}
      {industryKey === 'portfolio' && <section className="signature signature-portfolio"><div><p className="eyebrow">Independent creative practice</p><h2>Selected work, made with intention.</h2><p>A little about the person behind the work, the way I think, and what we might make together.</p><button className="primary" onClick={() => setPage('products')}>See selected work →</button></div><div className="portfolio-cards">{products.slice(0,2).map((product) => <article key={product._id}><img src={product.image} alt={product.name}/><p className="eyebrow">{product.category}</p><strong>{product.name}</strong></article>)}</div></section>}
      {industryKey === 'travel' && <section className="signature signature-travel" style={{ backgroundImage: 'linear-gradient(90deg,rgba(4,47,46,.86),rgba(4,47,46,.1)),url(' + (products[1]?.image || products[0]?.image || '') + ')' }}><p className="eyebrow">Take the scenic route</p><h2>Stay somewhere that stays with you.</h2><p>Slow mornings, thoughtful details, and a new view outside your window.</p><button className="primary" onClick={() => setPage('products')}>Find your stay →</button></section>}
      {industryKey === 'saas' && <section className="signature signature-saas"><div><p className="eyebrow">A clearer view of your work</p><h2>Less chasing. More making.</h2><p>Keep your team, projects and next steps moving together.</p></div><div className="saas-preview"><div><span>On track</span><strong>12</strong></div><div><span>In progress</span><strong>08</strong></div><div><span>Completed</span><strong>24</strong></div></div></section>}
      {industryKey === 'agency' && <section className="signature signature-agency"><p className="eyebrow">A few recent collaborations</p><h2>Good work, done together.</h2><div className="signature-grid">{products.slice(0,3).map((product) => <article key={product._id}><img src={product.image} alt={product.name}/><h3>{product.name}</h3><p>{product.category}</p></article>)}</div></section>}
      {industryKey === 'blog' && <section className="signature signature-blog"><p className="eyebrow">Notes from the editors</p><h2>Read a little deeper.</h2><div className="signature-grid">{products.slice(0,3).map((product) => <article key={product._id}><img src={product.image} alt={product.name}/><p className="eyebrow">{product.category}</p><h3>{product.name}</h3><span>{product.price}</span></article>)}</div></section>}
      {industryKey === 'education' && <section className="signature signature-education"><div><p className="eyebrow">A path that fits your life</p><h2>Small lessons. Big progress.</h2><p>Build confidence one practical lesson at a time.</p></div><div>{products.slice(0,3).map((product,index) => <article key={product._id}><b>0{index+1}</b><span><strong>{product.name}</strong><small>{product.category}</small></span><em>{product.price}</em></article>)}</div></section>}
      {industryKey === 'realestate' && <section className="signature signature-realestate"><p className="eyebrow">Spaces with possibility</p><h2>Find your next address.</h2><div className="signature-grid">{products.slice(0,2).map((product) => <article key={product._id}><img src={product.image} alt={product.name}/><h3>{product.name}</h3><p>{product.category}</p><strong>{product.price}</strong></article>)}</div></section>}
      {industryKey === 'fitness' && <section className="signature signature-fitness"><div><p className="eyebrow">Your first session starts here</p><h2>Build strength for real life.</h2><p>A welcoming place to get stronger, find your rhythm and feel good in your body.</p><button className="primary" onClick={() => setPage('products')}>Find your plan →</button></div><div className="fitness-images">{products.slice(0,2).map((product) => <img key={product._id} src={product.image} alt={product.name}/>)}</div></section>}
      <div className="benefits"><span>{isService ? 'A thoughtful process' : 'Carefully selected'}</span><span>{industryKey === 'food' ? 'Freshness guaranteed' : 'Quality you can trust'}</span><span>{isService ? 'Made around your goals' : 'Friendly customer support'}</span></div>
      <section className="catalog"><p className="eyebrow">{store.industry}</p><h2>{templateText}</h2><div className="grid">{products.slice(0, 3).map((product) => <ProductCard key={product._id} product={product} onAdd={addToCart} isService={isService} />)}</div></section>
      <footer>{store.storeName} <span>© {new Date().getFullYear()} · Made with care</span></footer>
    </main>}
    {page === 'products' && <main className="catalog"><p className="eyebrow">{store.industry}</p><h1>{templateText}</h1><div className="grid">{products.map((product) => <ProductCard key={product._id} product={product} onAdd={addToCart} isService={isService} />)}</div></main>}
    {page === 'cart' && <main className="narrow"><p className="eyebrow">Your selection</p><h1>{isService ? 'Enquiry list' : 'Your bag'}</h1>{cart.length ? <>{cart.map((line) => <div className="order-row" key={line.product._id}><span>{line.product.name} × {line.quantity}</span><strong>{money(line.product.price * line.quantity)}</strong></div>)}<div className="order-row total"><span>Total</span><strong>{money(total)}</strong></div><button className="primary" onClick={() => setPage('checkout')}>{isService ? 'Continue to enquiry' : 'Continue to checkout'}</button></> : <p>Your bag is empty. <button onClick={() => setPage('products')}>Browse {isService ? 'services' : 'products'}</button></p>}</main>}
    {page === 'checkout' && <main className="checkout"><form onSubmit={placeOrder}><p className="eyebrow">Checkout</p><h1>Your details</h1><input required placeholder="Full name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} /><input required type="email" placeholder="Email for order updates" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} /><input required type="tel" placeholder="Phone number" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} /><textarea required placeholder="Delivery address" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} /><h2>Payment</h2><label className="choice"><input type="radio" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} /> UPI</label><label className="choice"><input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} /> Cash on delivery</label>{paymentMethod === 'upi' && <div className="upi-box"><strong>{settings.upiId || 'Admin has not configured UPI yet'}</strong>{qr && <img src={qr} width="220" height="220" alt="Scan this UPI payment QR" />}<small>Scan with a UPI app. Order status changes after admin confirmation.</small></div>}<button className="primary" disabled={busy || !cart.length}>{busy ? 'Placing order…' : 'Place order · ' + money(total)}</button></form><aside className="summary"><h2>Order summary</h2>{cart.map((line) => <div className="order-row" key={line.product._id}><span>{line.product.name} × {line.quantity}</span><strong>{money(line.product.price * line.quantity)}</strong></div>)}<div className="order-row total"><span>Total</span><strong>{money(total)}</strong></div></aside></main>}
    {page === 'orders' && <main className="narrow"><div className="page-title"><div><p className="eyebrow">Order updates</p><h1>Your orders</h1></div><button onClick={refreshOrders}>Refresh</button></div>{orders.length ? orders.map((order) => <article className="order-card" key={order.id}><div className="page-title"><strong>Order {order.id.slice(0, 8).toUpperCase()}</strong><span className={'status status-' + order.status}>{order.status}</span></div><p>{order.items.map((item) => item.name + ' × ' + item.quantity).join(', ')}</p><div className="order-row"><span>Total</span><strong>{money(order.total)}</strong></div><small>Last updated {new Date(order.updatedAt).toLocaleString()}</small></article>) : <p>No orders found on this device yet.</p>}</main>}
    {page === 'admin' && (!adminToken ? <main className="login-panel"><p className="eyebrow">Private area</p><h1>Store admin</h1><p>Sign in with the admin username and password configured for this store.</p><form onSubmit={adminLogin}><input required autoComplete="username" placeholder="Admin username" value={login.username} onChange={(e) => setLogin({ ...login, username: e.target.value })} /><input required type="password" autoComplete="current-password" placeholder="Password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} /><button className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form></main> : <main className="admin-panel"><div className="page-title"><div><p className="eyebrow">Private dashboard</p><h1>Store admin</h1></div><button onClick={() => { sessionStorage.removeItem('siteforge-admin-token'); setAdminToken(''); }}>Sign out</button></div>
      <section className="admin-section"><h2>Payment settings</h2><form className="inline-form" onSubmit={saveSettings}><input placeholder="Merchant UPI ID (name@upi)" value={settings.upiId || ''} onChange={(e) => setSettings({ ...settings, upiId: e.target.value })} /><button>Save UPI ID</button></form></section>
      <section className="admin-section"><h2>{editingProductId ? 'Edit product or service' : 'Add product or service'}</h2><form className="product-form" onSubmit={addProduct}><input required placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} /><input required placeholder="Category" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} /><input required type="number" min="1" placeholder="Price in INR" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} /><input placeholder="Image URL" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} /><textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} /><button className="primary" disabled={busy}>{editingProductId ? 'Save product changes' : 'Add product'}</button>{editingProductId && <button type="button" onClick={() => { setEditingProductId(''); setNewProduct({ name: '', category: '', price: '', image: '', description: '' }); }}>Cancel</button>}</form><div className="admin-list">{products.map((product) => <div className="order-row" key={product._id}><span>{product.name} · {money(product.price)}</span><span className="flex gap-2"><button onClick={() => { setEditingProductId(product._id); setNewProduct({ name: product.name, category: product.category, price: String(product.price), image: product.image || '', description: product.description || '' }); }}>Edit</button><button onClick={() => deleteProduct(product._id)}>Delete</button></span></div>)}</div></section>
      <section className="admin-section"><div className="page-title"><h2>Orders</h2><button onClick={() => refreshAdmin()}>Refresh</button></div>{orders.map((order) => <article className="order-card" key={order.id}><div className="page-title"><strong>{order.customer.name} · {order.customer.email}</strong><span className={'status status-' + order.status}>{order.status}</span></div><p>{order.items.map((item) => item.name + ' × ' + item.quantity).join(', ')}</p><div className="order-row"><span>{order.paymentMethod.toUpperCase()} · {money(order.total)}</span><span>{new Date(order.createdAt).toLocaleString()}</span></div>{order.status === 'pending' && <button className="primary" disabled={busy} onClick={() => confirmOrder(order.id)}>Confirm order and email customer</button>}{order.status === 'confirmed' && <button className="primary" disabled={busy} onClick={() => resendOrderEmail(order.id)}>Resend confirmation email</button>}</article>)}</section>
    </main>)}
  </div>;
}

function ProductCard({ product, onAdd, isService }) {
  return <article className="product-card"><img src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'} alt={product.name} /><p className="eyebrow">{product.category}</p><h3>{product.name}</h3><p>{product.description}</p><div className="page-title"><strong>{money(product.price)}</strong><button onClick={() => onAdd(product)}>{isService ? 'Add to enquiry' : 'Add to bag'}</button></div></article>;
}

createRoot(document.getElementById('root')).render(<App />);
`;

  const server = `const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT || 5001);
const dataPath = path.join(__dirname, 'data.json');
const seed = require('../client/src/store.json');
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

async function readData() {
  try { const data = JSON.parse(await fs.readFile(dataPath, 'utf8')); data.emailNotifications ||= []; return data; }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const initial = { products: (seed.products || []).map((product) => ({ ...product, _id: String(product.id || crypto.randomUUID()), price: Number(String(product.price).replace(/[^0-9.]/g, '')) || 0 })), orders: [], emailNotifications: [], settings: { upiId: seed.upiId || '' } };
    await writeData(initial); return initial;
  }
}
async function writeData(data) {
  const temp = dataPath + '.tmp';
  await fs.writeFile(temp, JSON.stringify(data, null, 2));
  await fs.rename(temp, dataPath);
}
function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'Admin login required' });
    req.admin = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    if (req.admin.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    next();
  } catch { return res.status(401).json({ message: 'Your admin session expired. Sign in again.' }); }
}
function emailTransport() {
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error('Email is not configured. Set ' + missing.join(', ') + ' in the server .env file.');
  return nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT), secure: process.env.SMTP_SECURE === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
}
const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
async function sendOrderConfirmation(order) {
  const transporter = emailTransport();
  const lines = order.items.map((item) => '<li>' + escapeHtml(item.name) + ' × ' + item.quantity + ' — ₹' + (item.price * item.quantity).toLocaleString('en-IN') + '</li>').join('');
  await transporter.sendMail({
    from: process.env.EMAIL_FROM, to: order.customer.email,
    subject: 'Your order is confirmed · ' + seed.storeName,
    text: 'Hi ' + order.customer.name + ', your order ' + order.id.slice(0, 8).toUpperCase() + ' is confirmed. Total: ₹' + order.total.toLocaleString('en-IN') + '. Payment: ' + order.paymentMethod + '.',
    html: '<main style="font:16px/1.6 Arial,sans-serif;max-width:600px;margin:auto;color:#222"><p style="letter-spacing:.1em;text-transform:uppercase;color:#777">' + escapeHtml(seed.storeName) + '</p><h1>Your order is confirmed</h1><p>Hi ' + escapeHtml(order.customer.name) + ',</p><p>We have confirmed order <strong>' + order.id.slice(0, 8).toUpperCase() + '</strong>.</p><ul>' + lines + '</ul><p><strong>Total: ₹' + order.total.toLocaleString('en-IN') + '</strong><br/>Payment method: ' + escapeHtml(order.paymentMethod.toUpperCase()) + '</p><p>Delivery address: ' + escapeHtml(order.customer.address) + '</p><p>Thank you for shopping with ' + escapeHtml(seed.storeName) + '.</p></main>',
  });
}
async function sendOrderReceived(order) {
  const transporter = emailTransport();
  const lines = order.items.map((item) => '<li>' + escapeHtml(item.name) + ' × ' + item.quantity + ' — ₹' + (item.price * item.quantity).toLocaleString('en-IN') + '</li>').join('');
  await transporter.sendMail({
    from: process.env.EMAIL_FROM, to: order.customer.email,
    subject: 'We received your order · ' + seed.storeName,
    text: 'Hi ' + order.customer.name + ', we received your order ' + order.id.slice(0, 8).toUpperCase() + '. Total: ₹' + order.total.toLocaleString('en-IN') + '. We will send another email when it is confirmed.',
    html: '<main style="font:16px/1.6 Arial,sans-serif;max-width:600px;margin:auto;color:#222"><p style="letter-spacing:.1em;text-transform:uppercase;color:#777">' + escapeHtml(seed.storeName) + '</p><h1>We received your order</h1><p>Hi ' + escapeHtml(order.customer.name) + ',</p><p>Your order <strong>' + order.id.slice(0, 8).toUpperCase() + '</strong> has been received and is awaiting confirmation.</p><ul>' + lines + '</ul><p><strong>Total: ₹' + order.total.toLocaleString('en-IN') + '</strong><br/>Payment method: ' + escapeHtml(order.paymentMethod.toUpperCase()) + '</p><p>Delivery address: ' + escapeHtml(order.customer.address) + '</p><p>We will email you again when the order is confirmed.</p><p>Thank you for shopping with ' + escapeHtml(seed.storeName) + '.</p></main>',
  });
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/products', async (_req, res) => { const data = await readData(); res.json({ products: data.products, settings: data.settings }); });
app.post('/api/orders', async (req, res) => {
  const { customer, items, paymentMethod } = req.body;
  if (!customer?.name || !/^.+@.+\\..+$/.test(customer.email || '') || !customer.phone || !customer.address || !Array.isArray(items) || !items.length || !['upi', 'cod'].includes(paymentMethod)) return res.status(400).json({ message: 'Enter valid customer details and add at least one item.' });
  const data = await readData();
  const orderItems = items.map(({ productId, quantity }) => {
    const product = data.products.find((item) => item._id === String(productId));
    if (!product || !Number.isInteger(quantity) || quantity < 1) return null;
    return { productId: product._id, name: product.name, price: product.price, quantity };
  });
  if (orderItems.some((item) => !item)) return res.status(400).json({ message: 'A product changed. Refresh the store and try again.' });
  const order = { id: crypto.randomUUID(), accessToken: crypto.randomBytes(32).toString('hex'), customer: { name: String(customer.name).trim(), email: String(customer.email).trim().toLowerCase(), phone: String(customer.phone).trim(), address: String(customer.address).trim() }, items: orderItems, total: orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0), paymentMethod, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  data.orders.unshift(order); await writeData(data);
  let emailStatus = 'sent';
  try {
    await sendOrderReceived(order);
    order.receiptEmailSentAt = new Date().toISOString();
    data.emailNotifications.unshift({ orderId: order.id, recipient: order.customer.email, type: 'order-received', status: 'sent', createdAt: order.receiptEmailSentAt });
  } catch (error) {
    emailStatus = 'failed';
    console.error('Order received email failed:', error.message);
    data.emailNotifications.unshift({ orderId: order.id, recipient: order.customer.email, type: 'order-received', status: 'failed', error: error.message, createdAt: new Date().toISOString() });
  }
  order.updatedAt = new Date().toISOString();
  await writeData(data);
  res.status(201).json({ order: { id: order.id, status: order.status }, accessToken: order.accessToken, email: { status: emailStatus } });
});
app.get('/api/orders/:token', async (req, res) => {
  const data = await readData();
  const order = data.orders.find((item) => item.accessToken === req.params.token);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const { accessToken, ...publicOrder } = order;
  res.json({ order: publicOrder });
});

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH || !process.env.JWT_SECRET) return res.status(503).json({ message: 'Admin credentials are not configured. Follow the README setup steps.' });
  const valid = username === process.env.ADMIN_USERNAME && await bcrypt.compare(password || '', process.env.ADMIN_PASSWORD_HASH);
  if (!valid) return res.status(401).json({ message: 'Incorrect admin username or password.' });
  res.json({ token: jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' }) });
});
app.get('/api/admin/products', requireAdmin, async (_req, res) => { const data = await readData(); res.json({ products: data.products }); });
app.post('/api/admin/products', requireAdmin, async (req, res) => {
  const { name, category, price, image = '', description = '' } = req.body;
  if (!String(name || '').trim() || !String(category || '').trim() || !Number.isFinite(Number(price)) || Number(price) <= 0) return res.status(400).json({ message: 'Name, category and a price greater than zero are required.' });
  const data = await readData();
  const product = { _id: crypto.randomUUID(), name: String(name).trim(), category: String(category).trim(), price: Number(price), image: String(image).trim(), description: String(description).trim() };
  data.products.unshift(product); await writeData(data); res.status(201).json({ product });
});
app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
  const { name, category, price, image = '', description = '' } = req.body;
  if (!String(name || '').trim() || !String(category || '').trim() || !Number.isFinite(Number(price)) || Number(price) <= 0) return res.status(400).json({ message: 'Name, category and a price greater than zero are required.' });
  const data = await readData(); const product = data.products.find((item) => item._id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  Object.assign(product, { name: String(name).trim(), category: String(category).trim(), price: Number(price), image: String(image).trim(), description: String(description).trim() });
  await writeData(data); res.json({ product });
});
app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
  const data = await readData(); const next = data.products.filter((item) => item._id !== req.params.id);
  if (next.length === data.products.length) return res.status(404).json({ message: 'Product not found.' });
  data.products = next; await writeData(data); res.json({ ok: true });
});
app.get('/api/admin/orders', requireAdmin, async (_req, res) => { const data = await readData(); res.json({ orders: data.orders }); });
app.patch('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  const data = await readData(); const order = data.orders.find((item) => item.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  if (order.status !== 'pending' || req.body.status !== 'confirmed') return res.status(400).json({ message: 'Only pending orders can be confirmed.' });
  try { await sendOrderConfirmation(order); }
  catch (error) {
    console.error('Confirmation email failed:', error.message);
    data.emailNotifications.unshift({ orderId: order.id, recipient: order.customer.email, status: 'failed', error: error.message, createdAt: new Date().toISOString() }); await writeData(data);
    return res.status(502).json({ message: 'Email could not be sent, so the order was not confirmed. Check SMTP settings and try again.' });
  }
  order.confirmationEmailSentAt = new Date().toISOString();
  data.emailNotifications.unshift({ orderId: order.id, recipient: order.customer.email, status: 'sent', createdAt: order.confirmationEmailSentAt });
  order.status = 'confirmed'; order.updatedAt = new Date().toISOString(); await writeData(data);
  res.json({ order });
});
app.post('/api/admin/orders/:id/resend-confirmation', requireAdmin, async (req, res) => {
  const data = await readData(); const order = data.orders.find((item) => item.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  if (order.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed orders can have their email resent.' });
  try {
    await sendOrderConfirmation(order);
    data.emailNotifications.unshift({ orderId: order.id, recipient: order.customer.email, status: 'sent', resent: true, createdAt: new Date().toISOString() }); await writeData(data);
    res.json({ ok: true, message: 'Order confirmation email resent.' });
  } catch (error) {
    console.error('Confirmation email resend failed:', error.message);
    data.emailNotifications.unshift({ orderId: order.id, recipient: order.customer.email, status: 'failed', resent: true, error: error.message, createdAt: new Date().toISOString() }); await writeData(data);
    res.status(502).json({ message: 'Email could not be resent. Check SMTP settings and try again.' });
  }
});
app.get('/api/admin/settings', requireAdmin, async (_req, res) => { const data = await readData(); res.json({ settings: data.settings }); });
app.put('/api/admin/settings', requireAdmin, async (req, res) => { const data = await readData(); data.settings = { ...data.settings, upiId: String(req.body.upiId || '').trim() }; await writeData(data); res.json({ settings: data.settings }); });

app.listen(port, '127.0.0.1', () => console.log('Store API running at http://127.0.0.1:' + port));
`;

  const css = `*{box-sizing:border-box}body{margin:0;font:15px/1.6 Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#1b1b1b;background:#fff}button,input,textarea{font:inherit}button{cursor:pointer;border:0;background:transparent;color:inherit}.site{min-height:100vh;--accent:${store.primaryColor};--ink:#1c1c1c}.announcement{text-align:center;background:#161616;color:#fff;padding:9px 16px;font-size:12px;letter-spacing:.04em}.site-header{position:sticky;top:0;z-index:3;background:#fff;border-bottom:1px solid #eceae6;padding:20px clamp(20px,6vw,88px);display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{font-size:22px;font-weight:750;color:var(--accent)}nav{display:flex;align-items:center;gap:clamp(8px,2vw,28px);flex-wrap:wrap}nav button{font-size:13px;color:#555}.notice{position:sticky;top:68px;z-index:2;margin:16px auto;max-width:900px;padding:12px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px}.hero{display:grid;grid-template-columns:1.05fr .95fr;min-height:550px;background:#f4f1ec}.hero-copy{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:clamp(36px,8vw,120px)}.hero img{width:100%;height:100%;min-height:420px;max-height:700px;object-fit:cover}.hero h1{font-family:Georgia,serif;font-size:clamp(42px,6vw,76px);font-weight:500;line-height:1.02;letter-spacing:-.04em;margin:14px 0 20px;max-width:720px}.hero-copy>p:not(.eyebrow){max-width:480px;color:#666;font-size:17px}.eyebrow{text-transform:uppercase;letter-spacing:.18em;font-size:11px;color:#777}.primary{background:var(--accent);color:#fff;border-radius:4px;padding:13px 22px;font-weight:650;margin-top:12px}.site-electronics .hero{background:#0f172a;color:white}.site-electronics .hero-copy>p:not(.eyebrow){color:#cbd5e1}.site-electronics .hero .eyebrow{color:#93c5fd}.site-beauty .hero{background:#fff1f2;color:#55283f}.site-food .hero{background:#ecfccb;color:#23452d}.site-services .hero{background:#f2f0ed;color:#292722}.site-restaurant .hero{background:#fffbeb;color:#451a03}.site-travel .hero{background:#042f2e;color:#f0fdfa}.site-travel .hero-copy>p:not(.eyebrow){color:#ccfbf1}.site-travel .hero .eyebrow{color:#99f6e4}.site-saas .hero{background:#1e1b4b;color:#eef2ff}.site-saas .hero-copy>p:not(.eyebrow){color:#c7d2fe}.site-saas .hero .eyebrow{color:#a5b4fc}.site-agency .hero{background:#fff7ed;color:#431407}.site-blog .hero{background:#292524;color:#fafaf9}.site-blog .hero-copy>p:not(.eyebrow){color:#e7e5e4}.site-blog .hero .eyebrow{color:#d6d3d1}.site-education .hero{background:#f0f9ff;color:#082f49}.site-realestate .hero{background:#f0fdfa;color:#042f2e}.site-fitness .hero{background:#171717;color:#fafafa}.site-fitness .hero-copy>p:not(.eyebrow){color:#d4d4d4}.site-fitness .hero .eyebrow{color:#fca5a5}.signature{max-width:1360px;margin:56px auto;padding:48px clamp(20px,6vw,88px)}.signature h2{font:500 clamp(30px,4vw,48px)/1.08 Georgia,serif;margin:12px 0}.signature p:not(.eyebrow){color:#666;max-width:580px}.signature-restaurant{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center;background:#fffbeb}.signature-restaurant img{width:100%;height:330px;object-fit:cover}.signature-travel{max-width:none;min-height:360px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;background-size:cover;background-position:center;color:white}.signature-travel p:not(.eyebrow){color:#e5e7eb}.signature-saas{display:grid;grid-template-columns:1fr 1fr;gap:30px;align-items:center;background:#eef2ff;border-radius:16px}.saas-preview{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.saas-preview div{padding:16px;background:white;border:1px solid #c7d2fe;border-radius:10px}.saas-preview span,.saas-preview strong{display:block}.saas-preview span{font-size:11px;color:#64748b}.saas-preview strong{font-size:24px}.signature-agency{background:#fff7ed}.signature-blog{border-block:1px solid #e7e5e4}.signature-portfolio{display:grid;grid-template-columns:.85fr 1.15fr;gap:34px;align-items:center;background:#f5f5f4}.portfolio-cards{display:grid;grid-template-columns:1fr 1fr;gap:14px}.portfolio-cards article{border:0;padding:0}.portfolio-cards img{width:100%;height:240px;object-fit:cover}.portfolio-cards .eyebrow{margin:10px 0 4px}.signature-blog .signature-grid{grid-template-columns:1.4fr 1fr 1fr}.signature-education{display:grid;grid-template-columns:.8fr 1.2fr;gap:28px;background:#f0f9ff;border-radius:16px}.signature-education article{display:flex;align-items:center;gap:14px;background:white;margin:8px 0}.signature-education article b{color:#0369a1}.signature-education article span{flex:1}.signature-education small{display:block;color:#64748b}.signature-education em{font-style:normal;color:#0369a1;font-size:12px}.signature-realestate{background:#f0fdfa}.signature-fitness{display:grid;grid-template-columns:1fr 1fr;gap:26px;background:#171717;color:#fff}.signature-fitness p:not(.eyebrow){color:#d4d4d4}.fitness-images{display:grid;grid-template-columns:1fr 1fr;gap:10px}.fitness-images img{width:100%;height:230px;object-fit:cover}.signature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:24px}.signature-grid article{padding:0;border:0}.signature-grid img{width:100%;height:220px;object-fit:cover}.signature-grid h3{margin:10px 0 4px}.signature-grid p{margin:4px 0}@media(max-width:720px){.signature-restaurant,.signature-saas,.signature-education,.signature-fitness,.signature-portfolio{grid-template-columns:1fr}.signature-grid,.signature-blog .signature-grid{grid-template-columns:1fr}.signature-travel{min-height:300px}.signature-restaurant img{height:240px}}.benefits{display:flex;justify-content:space-evenly;gap:18px;padding:22px 24px;border-bottom:1px solid #eee;color:#555;font-size:12px;text-align:center}.catalog{max-width:1360px;margin:0 auto;padding:76px clamp(20px,6vw,88px)}.catalog h1,.catalog h2,.narrow h1,.checkout h1,.admin-panel h1,.login-panel h1{font:500 clamp(34px,4vw,52px)/1.1 Georgia,serif;letter-spacing:-.03em}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:26px;margin-top:28px}.product-card img{width:100%;height:310px;object-fit:cover;background:#f2f2f2}.product-card h3{margin:4px 0;font-size:17px}.product-card>p:not(.eyebrow){font-size:13px;color:#777;min-height:20px}.page-title{display:flex;align-items:center;justify-content:space-between;gap:14px}.page-title button,.admin-list button,.order-card>button{border:1px solid #ddd;border-radius:4px;padding:8px 12px;font-size:12px}.narrow{max-width:900px;margin:0 auto;padding:64px 24px;min-height:65vh}.order-row{display:flex;justify-content:space-between;gap:14px;padding:14px 0;border-bottom:1px solid #eee}.total{font-size:18px}.checkout{max-width:1100px;margin:0 auto;padding:60px 24px;display:grid;grid-template-columns:1.2fr .8fr;gap:56px}.checkout form,.login-panel form{display:flex;flex-direction:column;gap:12px}.checkout input,.checkout textarea,.login-panel input,.product-form input,.product-form textarea,.inline-form input{width:100%;border:1px solid #ddd;border-radius:4px;padding:12px}.checkout textarea,.product-form textarea{min-height:90px}.choice{display:flex;align-items:center;gap:9px;padding:12px;border:1px solid #ddd}.choice input{width:auto}.upi-box{display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px;border:1px solid #eee}.upi-box small{color:#777;text-align:center}.summary{background:#f8f7f5;padding:24px;height:max-content}.order-card{border:1px solid #e8e5e1;border-radius:6px;padding:20px;margin:16px 0}.status{padding:4px 9px;border-radius:30px;background:#fef3c7;font-size:11px;text-transform:capitalize}.status-confirmed,.status-delivered{background:#dcfce7}.login-panel{max-width:460px;margin:72px auto;padding:32px;border:1px solid #e9e5df;border-radius:8px}.admin-panel{max-width:1100px;margin:0 auto;padding:48px 24px}.admin-section{border-top:1px solid #e8e5e1;padding:28px 0}.inline-form{display:flex;gap:10px}.inline-form button{background:var(--accent);color:#fff;padding:10px 18px;border-radius:4px}.product-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.product-form textarea,.product-form button{grid-column:1/-1}.admin-list{margin-top:20px}.admin-list .order-row{align-items:center}footer{background:#161616;color:#fff;padding:28px clamp(20px,6vw,88px);display:flex;justify-content:space-between}footer span{color:#aaa;font-size:12px}@media(max-width:720px){.site-header{align-items:flex-start;flex-direction:column}.hero{grid-template-columns:1fr}.hero img{min-height:280px;max-height:390px;grid-row:1}.hero-copy{padding:36px 24px}.benefits{flex-direction:column}.checkout{grid-template-columns:1fr}.catalog{padding-top:46px}.product-card img{height:260px}footer{flex-direction:column;gap:8px}.product-form{grid-template-columns:1fr}.inline-form{flex-direction:column}}
`;

  const readme = `# ${store.storeName}

This is a complete React storefront with a private admin area, product management, saved orders, UPI QR checkout, and customer order confirmation emails.

## Requirements

- Node.js 20 or newer
- npm
- An SMTP email account for order confirmation messages

## First-time setup

1. Open Terminal in this project folder.
2. Install packages: npm install
3. Copy the environment template: cp .env.example .env
4. Create a bcrypt password hash after install:

   node -e "console.log(require('bcryptjs').hashSync('CHOOSE_A_PRIVATE_PASSWORD', 12))"

5. Edit .env. Set ADMIN_USERNAME, paste the generated value into ADMIN_PASSWORD_HASH, and replace JWT_SECRET with a private random secret. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM using your email provider’s SMTP settings. For Gmail, use an App Password, not your normal account password.
6. Start both the website and API: npm run dev
7. Open the storefront at http://localhost:5173. Open Admin in the site navigation and sign in with the username and password configured in .env.

The API runs on http://localhost:5001. The server creates server/data.json on first run and keeps products, settings, and order history there.

## Using the admin area

- Admin sign-in is checked by the server. Admin actions require a signed session token.
- Add products or services, set your merchant UPI ID, delete listings, and review incoming orders from the admin dashboard.
- Placing an order sends the customer an order-received email. Confirming it later sends a separate order-confirmation email. Failed email attempts are logged for the admin to review.
- Customers can revisit Orders on the same browser to see status updates. The page refreshes order status automatically while open.

## Payment and email setup

The checkout creates an order and shows a UPI QR for the merchant UPI ID. The customer scans the QR in a UPI app and completes payment there. This starter does not verify UPI settlement automatically. An order-received email is sent after order creation, and admin confirmation sends a separate confirmation email. Both email steps require SMTP configuration.

## Production

Before taking real customer orders, deploy the client and API over HTTPS, use a managed database and persistent storage, set restrictive CLIENT_ORIGIN, protect and back up server/data.json (or replace it with a database), configure SMTP, and integrate a payment provider that can verify payments. Do not publish your .env file.
`;

  return {
    'siteforge-store/package.json': JSON.stringify(packageJson, null, 2),
    'siteforge-store/.env.example': 'PORT=5001\nCLIENT_ORIGIN=http://localhost:5173\nVITE_API_URL=http://localhost:5001\nADMIN_USERNAME=store-admin\nADMIN_PASSWORD_HASH=replace_with_bcrypt_hash\nJWT_SECRET=replace_with_a_long_random_secret\nSMTP_HOST=smtp.example.com\nSMTP_PORT=587\nSMTP_SECURE=false\nSMTP_USER=your-email@example.com\nSMTP_PASS=your-email-app-password\nEMAIL_FROM=Your Store <your-email@example.com>\n',
    'siteforge-store/index.html': '<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>' + String(store.storeName).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]) + '</title></head><body><div id="root"></div><script type="module" src="/client/src/main.jsx"></script></body></html>',
    'siteforge-store/client/src/store.json': JSON.stringify(store, null, 2),
    'siteforge-store/client/src/main.jsx': app,
    'siteforge-store/client/src/style.css': css,
    'siteforge-store/server/server.js': server,
    'siteforge-store/server/.gitkeep': '',
    'siteforge-store/README.md': readme,
  };
};
