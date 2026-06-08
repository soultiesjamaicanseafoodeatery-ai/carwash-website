import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import supabase from '../lib/supabase';
import { LayoutDashboard, Utensils, Droplets, ListOrdered, LogOut, PlusSquare, Edit2, Trash2, Copy, Search, X, ChevronDown, ChevronUp } from 'lucide-react';

// --- Shared Components ---

function Modal({ isOpen, onClose, title, children }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">{title}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

function StatusToggle({ isAvailable, onToggle }: any) {
  return (
    <button 
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAvailable ? 'bg-amber-500' : 'bg-zinc-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// --- Main Layout ---

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  if (loading) return <div className="p-12 text-center text-zinc-400">Loading...</div>;

  if (!session) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider text-center">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" required />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" required />
            </div>
            <button type="submit" className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-bold uppercase tracking-wider mt-4">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  const links = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/orders', label: 'Orders', icon: ListOrdered },
    { path: '/admin/menu', label: 'Menu Items', icon: Utensils },
    { path: '/admin/carwash', label: 'Wash Packages', icon: Droplets },
    { path: '/admin/addons', label: 'Wash Add-ons', icon: PlusSquare },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col sticky top-0 h-screen">
        <div className="text-amber-400 font-bold uppercase tracking-widest text-xl mb-12">Admin</div>
        <nav className="space-y-2 flex-1">
          {links.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-amber-500/10 text-amber-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
                <link.icon className="w-5 h-5" /> {link.label}
              </Link>
            )
          })}
        </nav>
        <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-3 text-zinc-500 hover:text-red-400 px-4 py-3 mt-auto">
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/orders" element={<OrdersAdmin />} />
          <Route path="/menu" element={<MenuAdmin />} />
          <Route path="/carwash" element={<CarWashAdmin />} />
          <Route path="/addons" element={<AddonsAdmin />} />
        </Routes>
      </div>
    </div>
  );
}

// --- Sub Pages ---

function DashboardHome() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white uppercase tracking-wider mb-8">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">Today's Revenue</h3>
          <p className="text-3xl font-bold text-amber-400">J$1,240.50</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">Active Orders</h3>
          <p className="text-3xl font-bold text-white">12</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">Car Wash Queue</h3>
          <p className="text-3xl font-bold text-blue-400">4</p>
        </div>
      </div>
    </div>
  );
}

function OrdersAdmin() {
  const [orders, setOrders] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  
  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(data => {
      if(Array.isArray(data)) setOrders(data);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white uppercase tracking-wider mb-6">Recent Orders</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-950 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {orders.map(o => (
              <React.Fragment key={o.id}>
                <tr 
                  className={`hover:bg-zinc-800/50 cursor-pointer transition-colors ${expanded === o.id ? 'bg-zinc-800/30' : ''}`}
                  onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                >
                  <td className="px-6 py-4 text-sm text-zinc-500 font-mono">#{o.id.slice(0,8)}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white font-medium">{o.customer_name}</div>
                    <div className="text-xs text-zinc-500">{new Date(o.created_at).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400 capitalize">{o.type}</td>
                  <td className="px-6 py-4 text-sm text-white font-bold">J${o.final_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 text-right text-zinc-500">
                    {expanded === o.id ? <ChevronUp className="w-5 h-5 inline-block" /> : <ChevronDown className="w-5 h-5 inline-block" />}
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr className="bg-zinc-950/50">
                    <td colSpan={5} className="px-6 py-6 border-b border-zinc-800">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Customer Info</h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-zinc-300"><span className="text-zinc-500">Name:</span> {o.customer_name}</p>
                            <p className="text-zinc-300"><span className="text-zinc-500">Phone:</span> {o.customer_phone}</p>
                            <p className="text-zinc-300"><span className="text-zinc-500">Email:</span> {o.customer_email || 'N/A'}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Order Items</h4>
                          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                            <ul className="space-y-2">
                              {o.order_items?.map((item: any) => (
                                <li key={item.id} className="flex justify-between items-center text-sm">
                                  <span className={`flex-1 ${item.item_name.includes('DELIVERY') || item.item_name.includes('PICKUP') ? 'text-amber-400 font-bold' : item.item_name.includes('↳') ? 'text-zinc-500' : 'text-zinc-300'}`}>
                                    {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.item_name}
                                  </span>
                                  <span className="text-zinc-400 ml-4">J${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between text-sm">
                              <span className="text-zinc-500">Discount Applied</span>
                              <span className="text-amber-400">-J${o.discount_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="mt-1 flex justify-between text-base font-bold text-white">
                              <span>Final Total</span>
                              <span>J${o.final_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MenuAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const fetchData = () => fetch('/api/menu').then(r => r.json()).then(setItems);
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? 'PUT' : 'POST';
    await fetch('/api/menu', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this menu item?')) return;
    await fetch(`/api/menu?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const toggleStatus = async (item: any) => {
    setItems(items.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
    await fetch('/api/menu', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, is_available: !item.is_available })
    });
  };

  const openModal = (item: any = null) => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({ name: '', description: '', price: 0, category: 'Seafood', image_url: '', is_available: true });
    }
    setIsModalOpen(true);
  };

  const duplicate = (item: any) => {
    const { id, ...rest } = item;
    setFormData({ ...rest, name: rest.name + ' (Copy)' });
    setIsModalOpen(true);
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Restaurant Menu</h1>
        <button onClick={() => openModal()} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center gap-2">
          <PlusSquare className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input 
          type="text" 
          placeholder="Search menu items..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500"
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-950 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Item</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-zinc-800/50">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-white font-medium">{item.name}</span>
                    <span className="text-xs text-zinc-500 line-clamp-1">{item.description}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400">{item.category}</td>
                <td className="px-6 py-4 text-sm text-zinc-400">J${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-4">
                  <StatusToggle isAvailable={item.is_available} onToggle={() => toggleStatus(item)} />
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openModal(item)} className="p-2 text-zinc-400 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => duplicate(item)} className="p-2 text-zinc-400 hover:text-blue-400 transition-colors"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData?.id ? 'Edit Menu Item' : 'New Menu Item'}>
        {formData && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" required />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 h-24" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Price (J$)</label>
                <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" required />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Category</label>
                <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" required />
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Image URL</label>
              <input type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <StatusToggle isAvailable={formData.is_available} onToggle={() => setFormData({...formData, is_available: !formData.is_available})} />
              <span className="text-sm text-zinc-400">Available on website</span>
            </div>
            <button type="submit" className="w-full py-4 mt-6 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-bold uppercase tracking-wider transition-colors">
              Save Item
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}

function CarWashAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const fetchData = () => fetch('/api/carwash').then(r => r.json()).then(data => setItems(data.services || []));
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? 'PUT' : 'POST';
    await fetch('/api/carwash', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, target: 'service' })
    });
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this package?')) return;
    await fetch(`/api/carwash?id=${id}&target=service`, { method: 'DELETE' });
    fetchData();
  };

  const toggleStatus = async (item: any) => {
    setItems(items.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
    await fetch('/api/carwash', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, is_available: !item.is_available, target: 'service' })
    });
  };

  const openModal = (item: any = null) => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({ name: '', description: '', price: 0, vehicle_type: 'All', is_available: true });
    }
    setIsModalOpen(true);
  };

  const duplicate = (item: any) => {
    const { id, ...rest } = item;
    setFormData({ ...rest, name: rest.name + ' (Copy)' });
    setIsModalOpen(true);
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Wash Packages</h1>
        <button onClick={() => openModal()} className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-sm font-bold uppercase tracking-wider flex items-center gap-2">
          <PlusSquare className="w-4 h-4" /> Add Package
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input 
          type="text" 
          placeholder="Search packages..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-950 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Package</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Vehicle</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-zinc-800/50">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-white font-medium">{item.name}</span>
                    <span className="text-xs text-zinc-500 line-clamp-1">{item.description}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400">{item.vehicle_type}</td>
                <td className="px-6 py-4 text-sm text-zinc-400">J${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-4">
                  <StatusToggle isAvailable={item.is_available} onToggle={() => toggleStatus(item)} />
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openModal(item)} className="p-2 text-zinc-400 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => duplicate(item)} className="p-2 text-zinc-400 hover:text-blue-400 transition-colors"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData?.id ? 'Edit Package' : 'New Package'}>
        {formData && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-24" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Price (J$)</label>
                <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Vehicle Type</label>
                <select value={formData.vehicle_type} onChange={e => setFormData({...formData, vehicle_type: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                  <option value="All">All Vehicles</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Truck">Truck</option>
                  <option value="Bike">Bike</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <StatusToggle isAvailable={formData.is_available} onToggle={() => setFormData({...formData, is_available: !formData.is_available})} />
              <span className="text-sm text-zinc-400">Available for booking</span>
            </div>
            <button type="submit" className="w-full py-4 mt-6 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold uppercase tracking-wider transition-colors">
              Save Package
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}

function AddonsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const fetchData = () => fetch('/api/carwash').then(r => r.json()).then(data => setItems(data.addons || []));
  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData.id ? 'PUT' : 'POST';
    await fetch('/api/carwash', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, target: 'addon' })
    });
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this add-on?')) return;
    await fetch(`/api/carwash?id=${id}&target=addon`, { method: 'DELETE' });
    fetchData();
  };

  const toggleStatus = async (item: any) => {
    setItems(items.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
    await fetch('/api/carwash', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, is_available: !item.is_available, target: 'addon' })
    });
  };

  const openModal = (item: any = null) => {
    if (item) {
      setFormData(item);
    } else {
      setFormData({ name: '', description: '', price: 0, vehicle_type: 'All', estimated_minutes: 15, is_available: true });
    }
    setIsModalOpen(true);
  };

  const duplicate = (item: any) => {
    const { id, ...rest } = item;
    setFormData({ ...rest, name: rest.name + ' (Copy)' });
    setIsModalOpen(true);
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Wash Add-ons</h1>
        <button onClick={() => openModal()} className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-sm font-bold uppercase tracking-wider flex items-center gap-2">
          <PlusSquare className="w-4 h-4" /> Add Add-on
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input 
          type="text" 
          placeholder="Search add-ons..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-950 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Add-on</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Vehicle</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Time</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-zinc-800/50">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-white font-medium">{item.name}</span>
                    <span className="text-xs text-zinc-500 line-clamp-1">{item.description}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400">{item.vehicle_type}</td>
                <td className="px-6 py-4 text-sm text-zinc-400">J${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 text-sm text-zinc-400">{item.estimated_minutes}m</td>
                <td className="px-6 py-4">
                  <StatusToggle isAvailable={item.is_available} onToggle={() => toggleStatus(item)} />
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openModal(item)} className="p-2 text-zinc-400 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => duplicate(item)} className="p-2 text-zinc-400 hover:text-blue-400 transition-colors"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData?.id ? 'Edit Add-on' : 'New Add-on'}>
        {formData && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-24" required />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Price (J$)</label>
                <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Time (mins)</label>
                <input type="number" value={formData.estimated_minutes} onChange={e => setFormData({...formData, estimated_minutes: parseInt(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Vehicle Type</label>
                <select value={formData.vehicle_type} onChange={e => setFormData({...formData, vehicle_type: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                  <option value="All">All Vehicles</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Truck">Truck</option>
                  <option value="Bike">Bike</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <StatusToggle isAvailable={formData.is_available} onToggle={() => setFormData({...formData, is_available: !formData.is_available})} />
              <span className="text-sm text-zinc-400">Available for booking</span>
            </div>
            <button type="submit" className="w-full py-4 mt-6 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold uppercase tracking-wider transition-colors">
              Save Add-on
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
