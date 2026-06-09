import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../lib/CartContext';
import { Plus } from 'lucide-react';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  emoji?: string;
  is_available: boolean;
  active?: boolean;
};

export default function Restaurant() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const { addToCart } = useCart();

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMenuItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch menu', err);
    } finally {
      setLoading(false);
    }
  };

  // Exclude add-on modifiers (category='addon') from the customer menu
  const visibleItems = menuItems.filter(item => item.category !== 'addon');
  const categories = ['All', ...Array.from(new Set(visibleItems.map(item => item.category)))];
  const filteredItems = activeCategory === 'All'
    ? visibleItems
    : visibleItems.filter(item => item.category === activeCategory);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-widest mb-4">
          Seafood <span className="text-amber-400">Menu</span>
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Fresh from the sea to your plate. Experience the authentic taste of Jamaican seafood.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
        </div>
      ) : (
        <>
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-medium uppercase tracking-wider transition-all ${
                  activeCategory === cat 
                    ? 'bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                    : 'bg-zinc-900 text-zinc-400 hover:text-amber-400 border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                key={item.id} 
                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-amber-500/50 transition-colors group"
              >
                <div className="h-48 overflow-hidden bg-zinc-800 relative">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">No Image</div>
                  )}
                  <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-full text-amber-400 font-bold border border-amber-500/30">
                    ${item.price.toFixed(2)}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">{item.name}</h3>
                  </div>
                  <p className="text-zinc-400 text-sm mb-6 line-clamp-2">{item.description}</p>
                  
                  <button
                    onClick={() => addToCart({ id: item.id, productId: item.id, name: item.name, price: item.price, quantity: 1, type: 'restaurant' })}
                    disabled={!(item.active ?? item.is_available ?? true)}
                    className="w-full py-3 bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-white rounded-xl font-medium tracking-wider uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    {(item.active ?? item.is_available ?? true) ? 'Add to Order' : 'Sold Out'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center text-zinc-500 py-12">No menu items found in this category.</div>
          )}
        </>
      )}
    </div>
  );
}
