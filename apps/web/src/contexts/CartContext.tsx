import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  credits: number;
  price: number;
  quantity: number;
  credit_pack_id: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const saveToLocalStorage = useCallback((newItems: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(newItems));
  }, []);

  const addItem = useCallback((item: Omit<CartItem, 'id' | 'quantity'>, quantity: number = 1) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(i => i.credit_pack_id === item.credit_pack_id);
      let newItems;

      if (existingItem) {
        newItems = currentItems.map(i =>
          i.id === existingItem.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        const newItem: CartItem = {
          ...item,
          id: `${item.credit_pack_id}_${Date.now()}`,
          quantity,
        };
        newItems = [...currentItems, newItem];
      }

      saveToLocalStorage(newItems);
      return newItems;
    });
  }, [saveToLocalStorage]);

  const removeItem = useCallback((itemId: string) => {
    setItems(currentItems => {
      const newItems = currentItems.filter(item => item.id !== itemId);
      saveToLocalStorage(newItems);
      return newItems;
    });
  }, [saveToLocalStorage]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setItems(currentItems => {
      const newItems = currentItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      saveToLocalStorage(newItems);
      return newItems;
    });
  }, [saveToLocalStorage]);

  const clearCart = useCallback(() => {
    setItems([]);
    saveToLocalStorage([]);
  }, [saveToLocalStorage]);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, []);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
