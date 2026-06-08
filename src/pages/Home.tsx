import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, Droplets, MapPin, Phone, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.pexels.com/photos/1058277/pexels-photo-1058277.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80" 
            alt="Tropical Background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/60 to-zinc-950"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 flex justify-center"
          >
            <img src="/logo.png" alt="Soulties Logo" className="h-32 md:h-48 w-auto object-contain drop-shadow-2xl" onError={(e) => e.currentTarget.style.display = 'none'} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 uppercase tracking-widest"
          >
            Welcome to <br/>
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              Soulties
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-zinc-300 mb-12 max-w-3xl mx-auto font-light"
          >
            Premium Seafood Eatery Bar & Luxury Car Wash in Ocho Rios, Jamaica.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link 
              to="/restaurant" 
              className="group relative px-8 py-4 bg-zinc-900 border border-amber-500/30 hover:border-amber-400 rounded-full overflow-hidden transition-all duration-300 w-full sm:w-auto flex items-center justify-center space-x-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Utensils className="w-5 h-5 text-amber-400" />
              <span className="text-zinc-50 font-medium tracking-wider uppercase">Order Food</span>
            </Link>
            
            <Link 
              to="/carwash" 
              className="group relative px-8 py-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-full overflow-hidden transition-all duration-300 w-full sm:w-auto flex items-center justify-center space-x-3 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
            >
              <Droplets className="w-5 h-5" />
              <span className="font-bold tracking-wider uppercase">Book Car Wash</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Promotion Section */}
      <section className="py-12 bg-amber-500 text-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black uppercase tracking-widest mb-2">Pay Online Now & Save 10%</h2>
          <p className="text-lg font-medium">Automatic discount applied at checkout for all orders and bookings!</p>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
              <MapPin className="w-10 h-10 text-amber-400 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">Location</h3>
              <p className="text-zinc-400">15 Milford Road<br/>Ocho Rios, St. Ann<br/>Jamaica</p>
            </div>
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
              <Phone className="w-10 h-10 text-amber-400 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">Contact</h3>
              <p className="text-zinc-400">876-389-5343<br/>info@soulties.com</p>
            </div>
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
              <Star className="w-10 h-10 text-amber-400 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">Reviews</h3>
              <p className="text-zinc-400">"Best seafood in Ochi and my car looks brand new!"</p>
              <div className="flex justify-center mt-4 space-x-1">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
