import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../lib/CartContext';
import { Check, ChevronRight, ArrowLeft, Clock, ShoppingCart, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type CarWashService = {
  id: string;
  name: string;
  description: string;
  price: number;
  vehicle_type: string;
  is_available: boolean;
};

type CarWashAddon = {
  id: string;
  name: string;
  description: string;
  price: number;
  vehicle_type: string;
  estimated_minutes: number;
  is_available: boolean;
};

const jmd = (n: number) =>
  'J$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CarWash() {
  const [services, setServices] = useState<CarWashService[]>([]);
  const [addons,   setAddons]   = useState<CarWashAddon[]>([]);
  const [loading,  setLoading]  = useState(true);

  const [step,            setStep]           = useState(1);
  const [vehicleType,     setVehicleType]    = useState('');
  const [plate,           setPlate]          = useState('');
  const [plateError,      setPlateError]     = useState('');
  const [selectedService, setSelectedService] = useState<CarWashService | null>(null);
  const [selectedAddons,  setSelectedAddons] = useState<CarWashAddon[]>([]);

  const { addToCart } = useCart();
  const navigate      = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res  = await fetch('/api/carwash');
      const data = await res.json();
      if (data.services) setServices(data.services);
      if (data.addons)   setAddons(data.addons);
    } catch (err) {
      console.error('Failed to fetch services', err);
    } finally {
      setLoading(false);
    }
  };

  const vehicleTypes = [
    { type: 'Sedan', icon: '🚗' },
    { type: 'SUV',   icon: '🚙' },
    { type: 'Truck', icon: '🛻' },
    { type: 'Bike',  icon: '🏍️' },
  ];

  const filteredServices = services.filter(s => s.vehicle_type === vehicleType || s.vehicle_type === 'All');
  const filteredAddons   = addons.filter(a => a.vehicle_type === vehicleType   || a.vehicle_type === 'All');

  const toggleAddon = (addon: CarWashAddon) => {
    setSelectedAddons(selectedAddons.find(a => a.id === addon.id)
      ? selectedAddons.filter(a => a.id !== addon.id)
      : [...selectedAddons, addon]
    );
  };

  const handleContinue = () => {
    if (!vehicleType) return;
    if (!plate.trim()) { setPlateError('Please enter your license plate'); return; }
    setPlateError('');
    setStep(2);
  };

  const handleAddToCart = () => {
    if (!selectedService) return;
    addToCart({
      id:          crypto.randomUUID(),
      productId:   selectedService.id,
      name:        `${selectedService.name} (${vehicleType})`,
      price:       selectedService.price,
      quantity:    1,
      type:        'carwash',
      plate:       plate.trim().toUpperCase(),
      vehicleType,
      addons:      selectedAddons.map(a => ({
        id: a.id, name: a.name, price: a.price, estimated_minutes: a.estimated_minutes,
      })),
    });
    navigate('/checkout');
  };

  const totalTime  = (selectedService ? 45 : 0) + selectedAddons.reduce((a, b) => a + (b.estimated_minutes || 0), 0);
  const totalPrice = (selectedService?.price || 0) + selectedAddons.reduce((a, b) => a + b.price, 0);
  const discount   = totalPrice * 0.10;

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full min-h-[80vh] flex flex-col">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-widest mb-4">
          Luxury <span className="text-blue-400">Car Wash</span>
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Premium detailing and washing services customized for your vehicle.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-12">

          {/* Main Content */}
          <div className="flex-1">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-8 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-800 -z-10" />
              {[
                { num: 1, label: 'Vehicle & Plate' },
                { num: 2, label: 'Package' },
                { num: 3, label: 'Add-ons' },
              ].map(s => (
                <div key={s.num} className="flex flex-col items-center gap-2 bg-zinc-950 px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    step >= s.num ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-500'
                  }`}>
                    {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`text-xs uppercase tracking-wider font-medium ${step >= s.num ? 'text-blue-400' : 'text-zinc-600'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* STEP 1 — Vehicle Type + Plate */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wider mb-6">Select Vehicle Type</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {vehicleTypes.map(({ type, icon }) => (
                        <button
                          key={type}
                          onClick={() => setVehicleType(type)}
                          className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-4 group ${
                            vehicleType === type
                              ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                              : 'border-zinc-800 bg-zinc-900/50 hover:border-blue-500/50'
                          }`}
                        >
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors text-3xl ${
                            vehicleType === type ? 'bg-blue-500/20' : 'bg-zinc-800 group-hover:bg-blue-500/10'
                          }`}>
                            {icon}
                          </div>
                          <span className="text-lg font-bold text-white uppercase tracking-wider">{type}</span>
                          {vehicleType === type && <Check className="w-5 h-5 text-blue-400" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Plate Input */}
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-3">
                      <Car className="w-5 h-5 text-blue-400" /> License Plate
                    </h2>
                    <p className="text-zinc-500 text-sm mb-4">Enter your vehicle's license plate number</p>
                    <input
                      type="text"
                      value={plate}
                      onChange={e => { setPlate(e.target.value.toUpperCase()); setPlateError(''); }}
                      placeholder="e.g. ABC-1234"
                      maxLength={12}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white text-xl font-bold tracking-widest uppercase focus:outline-none focus:border-blue-500 placeholder:text-zinc-600 placeholder:normal-case placeholder:font-normal placeholder:tracking-normal"
                    />
                    {plateError && <p className="text-red-400 text-sm mt-2">{plateError}</p>}
                  </div>

                  <button
                    onClick={handleContinue}
                    disabled={!vehicleType}
                    className="w-full py-4 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                  >
                    Continue to Packages <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {/* STEP 2 — Package */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setStep(1)} className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Select Wash Package</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredServices.map(service => (
                      <div
                        key={service.id}
                        onClick={() => { if (service.is_available) { setSelectedService(service); setStep(3); } }}
                        className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col ${
                          !service.is_available
                            ? 'opacity-50 border-zinc-800 bg-zinc-900/30 cursor-not-allowed'
                            : selectedService?.id === service.id
                              ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                              : 'border-zinc-800 bg-zinc-900/50 hover:border-blue-500/50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-bold text-white uppercase tracking-wider">{service.name}</h3>
                          <div className="text-2xl font-bold text-blue-400">{jmd(service.price)}</div>
                        </div>
                        <p className="text-zinc-400 text-sm mb-6 flex-1">{service.description}</p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
                          <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">{service.vehicle_type}</span>
                          <span className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                            {service.is_available ? 'Select Package' : 'Unavailable'} <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 3 — Add-ons */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setStep(2)} className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Enhance Your Wash</h2>
                      <p className="text-zinc-400 text-sm">Optional add-ons for your {vehicleType}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredAddons.map(addon => {
                      const isSelected = selectedAddons.some(a => a.id === addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => addon.is_available && toggleAddon(addon)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-4 ${
                            !addon.is_available ? 'opacity-50 border-zinc-800 bg-zinc-900/30 cursor-not-allowed' :
                            isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-zinc-600'}`}>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-bold">{addon.name}</h4>
                            <p className="text-zinc-500 text-xs line-clamp-1">{addon.description}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-blue-400 font-bold text-sm">+{jmd(addon.price)}</span>
                              <span className="text-zinc-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {addon.estimated_minutes}m</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Booking Summary Sidebar */}
          {step > 1 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:w-96 w-full">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-24">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-6 border-b border-zinc-800 pb-4">Booking Summary</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Vehicle</span>
                      <p className="text-white font-medium">{vehicleType}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Plate</span>
                      <p className="text-blue-400 font-bold tracking-widest font-mono">{plate}</p>
                    </div>
                  </div>

                  {selectedService && (
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Package</span>
                        <p className="text-white font-medium">{selectedService.name}</p>
                      </div>
                      <span className="text-white font-medium">{jmd(selectedService.price)}</span>
                    </div>
                  )}

                  {selectedAddons.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2 block">Add-ons</span>
                      <div className="space-y-2">
                        {selectedAddons.map(addon => (
                          <div key={addon.id} className="flex justify-between items-center text-sm">
                            <span className="text-zinc-300">{addon.name}</span>
                            <span className="text-zinc-400">+{jmd(addon.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {selectedService && (
                  <>
                    <div className="border-t border-zinc-800 pt-4 space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Est. Duration</span>
                        <span className="text-white flex items-center gap-1"><Clock className="w-4 h-4" /> ~{totalTime} mins</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Subtotal</span>
                        <span className="text-white">{jmd(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-blue-400 font-medium">
                        <span>Pay Online Discount (10%)</span>
                        <span>-{jmd(discount)}</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-zinc-800">
                        <span>Total</span>
                        <span>{jmd(totalPrice - discount)}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
