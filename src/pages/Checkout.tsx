import { useState } from 'react';
import { useCart } from '../lib/CartContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Trash2, CheckCircle, Clock, Car } from 'lucide-react';

const jmd = (n: number) =>
  'J$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Checkout() {
  const { cart, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const hasCarwash = cart.some(i => i.type === 'carwash');
  const hasFood = cart.some(i => i.type === 'restaurant');
  
  const [fulfillment, setFulfillment] = useState(hasCarwash ? 'pickup' : 'delivery');
  const [address, setAddress] = useState('');

  // 10% Online Pay Discount on subtotal
  const discount = total * 0.10;
  const deliveryFee = fulfillment === 'delivery' ? 500 : 0;
  const finalTotal = total - discount + deliveryFee;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_email: formData.email,
          items: cart,
          total_amount: total + deliveryFee,
          discount_amount: discount,
          final_amount: finalTotal,
          type: cart.some(i => i.type === 'carwash') ? 'mixed' : 'restaurant',
          fulfillment_method: fulfillment,
          delivery_address: address,
          delivery_fee: deliveryFee
        })
      });

      if (res.ok) {
        setSuccess(true);
        clearCart();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-24 px-4 text-center max-w-lg mx-auto">
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
          <CheckCircle className="w-20 h-20 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4 uppercase tracking-wider">Order Confirmed!</h2>
          <p className="text-zinc-400 mb-8">Thank you for your order. We will contact you shortly.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-amber-500 text-zinc-950 font-bold rounded-xl uppercase tracking-wider w-full"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-white uppercase tracking-widest mb-12">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          {/* Cart Items */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Order Items</h2>
            {cart.length === 0 ? (
              <p className="text-zinc-500">Your cart is empty.</p>
            ) : (
              <div className="space-y-6">
                {cart.map(item => {
                  const itemAddonsTotal = item.addons?.reduce((sum, a) => sum + a.price, 0) || 0;
                  const itemTotalPrice = (item.price + itemAddonsTotal) * item.quantity;
                  const totalMins = item.addons?.reduce((sum, a) => sum + (a.estimated_minutes || 0), 0) || 0;

                  return (
                    <div key={item.id} className="border-b border-zinc-800 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-bold text-lg">{item.name}</h4>
                          <div className="flex items-center gap-3 mt-1 mb-2 flex-wrap">
                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                              item.type === 'carwash' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {item.type}
                            </span>
                            <span className="text-zinc-400 text-sm">Base: {jmd(item.price)}</span>
                            {item.plate && (
                              <span className="flex items-center gap-1 text-xs font-bold font-mono bg-zinc-800 text-blue-300 px-2 py-1 rounded tracking-widest">
                                <Car className="w-3 h-3" /> {item.plate}
                              </span>
                            )}
                          </div>

                          {item.addons && item.addons.length > 0 && (
                            <div className="mt-3 pl-4 border-l-2 border-zinc-800 space-y-1">
                              <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">Add-ons Selected:</p>
                              {item.addons.map((addon, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm max-w-xs">
                                  <span className="text-zinc-300">• {addon.name}</span>
                                  <span className="text-zinc-400">+{jmd(addon.price)}</span>
                                </div>
                              ))}
                              {totalMins > 0 && (
                                <div className="text-xs text-zinc-500 flex items-center gap-1 mt-2">
                                  <Clock className="w-3 h-3" /> +{totalMins} mins added
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-4 ml-4">
                          <div className="text-white font-bold text-xl">{jmd(itemTotalPrice)}</div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 bg-zinc-950 rounded-lg px-2 py-1 border border-zinc-800">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-zinc-400 hover:text-white px-2">-</button>
                              <span className="text-white w-4 text-center text-sm">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-zinc-400 hover:text-white px-2">+</button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300 p-2">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Delivery / Pickup Selection */}
          {!hasCarwash && hasFood && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Order Type</h2>
              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setFulfillment('pickup')}
                  className={`flex-1 py-3 rounded-xl font-bold uppercase tracking-wider transition-all border ${
                    fulfillment === 'pickup' 
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillment('delivery')}
                  className={`flex-1 py-3 rounded-xl font-bold uppercase tracking-wider transition-all border ${
                    fulfillment === 'delivery' 
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  Delivery (+J$500)
                </button>
              </div>
              
              {fulfillment === 'delivery' && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Delivery Address</label>
                  <textarea 
                    required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Enter your full delivery address (Street, City, Parish, etc.)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 h-24 resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Customer Details */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Your Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Email (Optional)</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>{jmd(total)}</span>
              </div>
              {fulfillment === 'delivery' && (
                <div className="flex justify-between text-zinc-400">
                  <span>Delivery Fee</span>
                  <span>{jmd(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-amber-400 font-medium">
                <span>Pay Online Discount (10%)</span>
                <span>-{jmd(discount)}</span>
              </div>
              <div className="border-t border-zinc-800 pt-4 flex justify-between text-white text-2xl font-bold">
                <span>Total</span>
                <span>{jmd(finalTotal)}</span>
              </div>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={cart.length === 0 || loading || !formData.name || !formData.phone || (fulfillment === 'delivery' && !address)}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay Now
                </>
              )}
            </button>
            <p className="text-center text-zinc-500 text-xs mt-4">Payments processed securely via Stripe / WePay</p>
          </div>
        </div>
      </div>
    </div>
  );
}
