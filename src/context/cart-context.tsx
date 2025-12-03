
'use client';

import React, { createContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useUser, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { CartItem, Product, CartItemDetails } from '@/lib/types';

type CartState = {
  items: CartItemDetails[];
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: { productId: string; size: 'S' | 'M' | 'L' | 'XL'; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartItemDetails[] };


export interface CartContextType {
  items: CartItemDetails[];
  addItem: (product: Product, size: 'S' | 'M' | 'L' | 'XL', quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const initialState: CartState = {
  items: [],
};

export const CartContext = createContext<CartContextType & { totalItems: number; totalPrice: number } | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { productId, size, quantity } = action.payload;
      const itemId = `${productId}-${size}`;
      const existingItemIndex = state.items.findIndex((item) => item.id === itemId);

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += quantity;
        return { ...state, items: updatedItems };
      } else {
        const newItem: CartItemDetails = {
          id: itemId,
          productId,
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
        ).filter(item => item.quantity > 0),
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SET_CART':
        return { ...state, items: action.payload };
    default:
      return state;
  }
};

const LOCAL_STORAGE_KEY = 'modish-cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
  
    const cartDocRef = useMemoFirebase(
      () => (firestore && user ? doc(firestore, 'carts', user.uid) : null),
      [firestore, user]
    );
  
    // Effect to load cart from Firestore or local storage
    useEffect(() => {
      const loadCart = async () => {
        if (isUserLoading) return;
  
        if (user && cartDocRef) {
          // User is logged in, try to load from Firestore
          try {
            const docSnap = await getDoc(cartDocRef);
            if (docSnap.exists()) {
              const firestoreCart = docSnap.data().items as CartItemDetails[];
              // Merge with local cart
              const localCart = getLocalCart();
              const mergedCart = mergeCarts(firestoreCart, localCart);
              dispatch({ type: 'SET_CART', payload: mergedCart });
              clearLocalCart();
            } else {
              // No cart in Firestore, use local and get ready to sync
              const localCart = getLocalCart();
              dispatch({ type: 'SET_CART', payload: localCart });
            }
          } catch (e) {
            console.error("Error loading cart from Firestore", e);
          }
        } else {
          // User is not logged in, load from local storage
          const localCart = getLocalCart();
          dispatch({ type: 'SET_CART', payload: localCart });
        }
      };
      loadCart();
    }, [user, isUserLoading, cartDocRef]);

    const getLocalCart = (): CartItemDetails[] => {
        try {
            const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
            return savedState ? JSON.parse(savedState) : [];
          } catch (error) {
            console.error('Failed to load cart from local storage', error);
            return [];
          }
    }
    
    const clearLocalCart = () => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  
    // Effect to save cart to Firestore or local storage
    useEffect(() => {
      // Don't save initial empty state until loaded
      if (isUserLoading && state.items.length === 0 && !cartDocRef) return;
  
      if (user && cartDocRef) {
        // Debounced save to Firestore
        const handler = setTimeout(() => {
          const cartData = { userId: user.uid, items: state.items };
          setDocumentNonBlocking(cartDocRef, cartData, { merge: true });
        }, 500);
        return () => clearTimeout(handler);
      } else if (!user && !isUserLoading) {
        // Save to local storage for anonymous users
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.items));
        } catch (error) {
            console.error('Failed to save cart to local storage', error);
        }
      }
    }, [state.items, user, cartDocRef, isUserLoading]);
  
    const addItem = (product: Product, size: 'S' | 'M' | 'L' | 'XL', quantity: number) => {
      dispatch({ type: 'ADD_ITEM', payload: { productId: product.id, size, quantity } });
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

    const value = useMemo(() => ({
        items: state.items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems: 0, // Will be replaced by useCart hook
        totalPrice: 0, // Will be replaced by useCart hook
      }), [state.items,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        isUserLoading, user
    ]);
  
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
  };

  function mergeCarts(firestoreCart: CartItemDetails[], localCart: CartItemDetails[]): CartItemDetails[] {
    const merged = [...firestoreCart];
  
    localCart.forEach(localItem => {
      const existingIndex = merged.findIndex(item => item.id === localItem.id);
      if (existingIndex > -1) {
        // If item exists, sum quantities
        merged[existingIndex].quantity += localItem.quantity;
      } else {
        // If item doesn't exist, add it
        merged.push(localItem);
      }
    });
  
    return merged;
  }
