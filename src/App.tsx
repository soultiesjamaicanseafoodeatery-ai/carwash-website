import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Restaurant from './pages/Restaurant';
import CarWash from './pages/CarWash';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import { CartProvider } from './lib/CartContext';
import { useEffect } from 'react';
import { handleGoogleRedirect } from './lib/googleAuth';

function App() {
  useEffect(() => {
    handleGoogleRedirect();
  }, []);

  return (
    <Router>
      <CartProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurant" element={<Restaurant />} />
            <Route path="/carwash" element={<CarWash />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </Layout>
      </CartProvider>
    </Router>
  );
}

export default App;
