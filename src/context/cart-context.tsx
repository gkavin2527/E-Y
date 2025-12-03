'use client';

import type { CartItem, Product } from '@/lib/types';
import React, { createContext, useReducer, useEffect, ReactNode } from 'react';

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; size: 'S' | 'M' | 'L' | 'XL'; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_STATE'; payload: CartState };

export interface CartContextType extends CartState {
  addItem: (product: Product, size: 'S' | 'M' | 'L' | 'XL', quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const initialState: CartState = {
  items: [],
};

export const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, size, quantity } = action.payload;
      const itemId = `${product.id}-${size}`;
      const existingItemIndex = state.items.findIndex((item) => item.id === itemId);

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += quantity;
        return { ...state, items: updatedItems };
      } else {
        const newItem: CartItem = {
          id: itemId,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          size,
          quantity,
        };
        return { ...state, items: [...state.items, newItem] };
      }
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.itemId),
      };
    }
    case 'UPDATE_QUANTITY': {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.itemId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0), // Also remove if quantity becomes 0
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SET_STATE':
        return action.payload;
    default:
      return state;
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('modish-cart');
      if (savedState) {
        dispatch({ type: 'SET_STATE', payload: JSON.parse(savedState) });
      }
    } catch (error) {
      console.error('Failed to load cart from local storage', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem('modish-cart', JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save cart to local storage', error);
        }
    }
  }, [state]);

  const addItem = (product: Product, size: 'S' | 'M' | 'L' | 'XL', quantity: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, size, quantity } });
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = state.items.reduce((total, item) => total + item.price * item.quantity, 0);

  const value: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
