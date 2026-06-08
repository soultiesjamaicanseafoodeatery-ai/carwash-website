import { createContext, useContext, useState, ReactNode } from 'react';

export type CartItemAddon = {
  id: string;
  name: string;
  price: number;
  estimated_minutes?: number;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  type: 'restaurant' | 'carwash';
  addons?: CartItemAddon[];
  estimated_minutes?: number;
  plate?: string;
  vehicleType?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      // Only merge restaurant items. Car wash items with addons should be distinct.
      if (item.type === 'restaurant') {
        const existing = prev.find((i) => i.productId === item.productId && i.type === 'restaurant');
        if (existing) {
          return prev.map((i) => (i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i));
        }
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => {
    const addonsTotal = item.addons?.reduce((a, b) => a + b.price, 0) || 0;
    return sum + (item.price + addonsTotal) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
