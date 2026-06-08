import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Droplets, Utensils, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../lib/CartContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { cart } = useCart();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Restaurant', path: '/restaurant', icon: Utensils },
    { name: 'Car Wash', path: '/carwash', icon: Droplets },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans flex flex-col">
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Soulties Logo" className="h-12 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'block'; }} />
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent uppercase tracking-wider hidden">
                Soulties
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium uppercase tracking-widest transition-colors ${
                    location.pathname === link.path
                      ? 'text-amber-400'
                      : 'text-zinc-400 hover:text-amber-200'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-6">
              <Link to="/admin" className="text-zinc-400 hover:text-amber-400 transition-colors">
                <UserCircle className="w-6 h-6" />
              </Link>
              <Link to="/checkout" className="relative text-zinc-400 hover:text-amber-400 transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-zinc-950 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              <Link to="/checkout" className="relative text-zinc-400 hover:text-amber-400">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-zinc-950 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-zinc-400 hover:text-amber-400"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-zinc-900 border-b border-zinc-800">
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-md text-base font-medium uppercase tracking-wider ${
                    location.pathname === link.path
                      ? 'bg-zinc-800 text-amber-400'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-amber-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {link.icon && <link.icon className="w-5 h-5" />}
                    <span>{link.name}</span>
                  </div>
                </Link>
              ))}
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-3 rounded-md text-base font-medium uppercase tracking-wider text-zinc-400 hover:bg-zinc-800 hover:text-amber-200"
              >
                <div className="flex items-center space-x-3">
                  <UserCircle className="w-5 h-5" />
                  <span>Admin Login</span>
                </div>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">{children}</main>

      <footer className="bg-zinc-950 border-t border-zinc-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-amber-400 uppercase tracking-widest mb-4">Soulties</h3>
            <p className="text-zinc-400">15 Milford Road<br />Ocho Rios, St. Ann<br />Jamaica</p>
            <p className="text-zinc-400 mt-2">Phone: 876-389-5343</p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-50 uppercase tracking-widest mb-4">Links</h4>
            <ul className="space-y-2">
              <li><Link to="/restaurant" className="text-zinc-400 hover:text-amber-400">Restaurant Menu</Link></li>
              <li><Link to="/carwash" className="text-zinc-400 hover:text-amber-400">Car Wash Services</Link></li>
              <li><a href="#" className="text-zinc-400 hover:text-amber-400">Membership Plans</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-50 uppercase tracking-widest mb-4">Hours</h4>
            <ul className="space-y-2 text-zinc-400">
              <li>Mon - Thu: 10am - 10pm</li>
              <li>Fri - Sat: 10am - 12am</li>
              <li>Sun: 11am - 9pm</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-zinc-800 text-center text-zinc-500 text-sm">
          &copy; {new Date().getFullYear()} Soulties Seafood Eatery Bar & Car Wash. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
