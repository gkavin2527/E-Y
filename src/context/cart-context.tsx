
'use client';

import React, { createContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useUser, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { CartItem, Product, Cart } from '@/lib/types';

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; size: 'S' | 'M' | 'L' | 'XL'; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartItem[] };


export interface CartContextType {
  items: CartItem[];
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
              const firestoreCart = (docSnap.data() as Cart).items || [];
              const localCart = getLocalCart();
              const mergedCart = mergeCarts(firestoreCart, localCart);
              dispatch({ type: 'SET_CART', payload: mergedCart });
              if (localCart.length > 0) {
                clearLocalCart();
              }
            } else {
              // No cart in Firestore, use local and get ready to sync
              const localCart = getLocalCart();
              dispatch({ type: 'SET_CART', payload: localCart });
            }
          } catch (e) {
            console.error("Error loading cart from Firestore", e);
            const localCart = getLocalCart();
            dispatch({ type: 'SET_CART', payload: localCart });
          }
        } else {
          // User is not logged in, load from local storage
          const localCart = getLocalCart();
          dispatch({ type: 'SET_CART', payload: localCart });
        }
      };
      loadCart();
    }, [user, isUserLoading, cartDocRef]);

    const getLocalCart = (): CartItem[] => {
        try {
            const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (!savedState) return [];
            const parsed = JSON.parse(savedState);
            return Array.isArray(parsed) ? parsed : [];
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
      // Don't save initial empty state until loaded from persistence
      if (isUserLoading && state.items.length === 0) return;
  
      if (user && cartDocRef) {
        const handler = setTimeout(() => {
          const cartData: Cart = { userId: user.uid, items: state.items };
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

  function mergeCarts(firestoreCart: CartItem[], localCart: CartItem[]): CartItem[] {
    const merged = [...firestoreCart];
  
    if (!Array.isArray(localCart)) {
        console.error('Local cart is not an array, cannot merge.', localCart);
        return merged;
    }
  
    localCart.forEach(localItem => {
      const existingIndex = merged.findIndex(item => item.id === localItem.id);
      if (existingIndex > -1) {
        merged[existingIndex].quantity += localItem.quantity;
      } else {
        merged.push(localItem);
      }
    });
  
    return merged;
  }
