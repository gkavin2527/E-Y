
'use client';

import React, { createContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import type { CartItem, Product, Cart } from '@/lib/types';

type CartState = {
  items: CartItem[];
  isCartLoading: boolean;
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; size: 'S' | 'M' | 'L' | 'XL'; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'SET_LOADING'; payload: boolean };


export interface CartContextType {
  items: CartItem[];
  isCartLoading: boolean;
  addItem: (product: Product, size: 'S' | 'M' | 'L' | 'XL', quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const initialState: CartState = {
  items: [],
  isCartLoading: true,
};

export const CartContext = createContext<CartContextType & { totalItems: number; totalPrice: number } | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
        return { ...state, isCartLoading: action.payload };
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

function getLocalCart(): CartItem[] {
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

function clearLocalCart() {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

function mergeCarts(firestoreCart: CartItem[], localCart: CartItem[]): CartItem[] {
    const merged = [...firestoreCart];
  
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

async function saveCartToFirestore(firestore: any, userId: string, items: CartItem[]) {
    if (!firestore || !userId) return;
    const cartDocRef = doc(firestore, 'users', userId, 'cart', 'current');
    const cartData: Cart = { userId: userId, items };
    await setDoc(cartDocRef, cartData, { merge: true });
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const cartDocRef = useMemoFirebase(
        () => (firestore && user ? doc(firestore, 'users', user.uid, 'cart', 'current') : null),
        [firestore, user]
    );

    // This effect synchronizes the cart from Firestore to the local state.
    useEffect(() => {
        if (isUserLoading) {
            dispatch({ type: 'SET_LOADING', payload: true });
            return;
        }

        if (user && cartDocRef && firestore) {
            // User is logged in, set up Firestore listener
            const unsubscribe = onSnapshot(cartDocRef, (docSnap) => {
                const localCart = getLocalCart();
                const firestoreCartItems = docSnap.exists() ? (docSnap.data() as Cart).items || [] : [];
                
                if (localCart.length > 0) {
                    // If a local cart exists, merge it into Firestore one time.
                    const mergedItems = mergeCarts(firestoreCartItems, localCart);
                    dispatch({ type: 'SET_CART', payload: mergedItems });
                    saveCartToFirestore(firestore, user.uid, mergedItems).then(() => {
                        clearLocalCart();
                    });
                } else {
                    // No local cart, just use what's in Firestore.
                    dispatch({ type: 'SET_CART', payload: firestoreCartItems });
                }
                dispatch({ type: 'SET_LOADING', payload: false });
            }, (error) => {
                console.error("Error listening to cart:", error);
                dispatch({ type: 'SET_CART', payload: getLocalCart() }); // fallback to local on error
                dispatch({ type: 'SET_LOADING', payload: false });
            });
            return () => unsubscribe();
        } else {
            // User is not logged in, use local storage only
            const localCart = getLocalCart();
            dispatch({ type: 'SET_CART', payload: localCart });
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [user, isUserLoading, cartDocRef, firestore]);
    
    // This effect synchronizes the local state back to storage (local or Firestore).
    useEffect(() => {
      // Don't save during initial load
      if (state.isCartLoading) return;

      if (user && firestore) {
        saveCartToFirestore(firestore, user.uid, state.items);
      } else if (!user && !isUserLoading) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.items));
      }
    }, [state.items, user, isUserLoading, firestore, state.isCartLoading]);


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

    const totalItems = useMemo(() => {
        return state.items.reduce((total, item) => total + item.quantity, 0);
    }, [state.items]);
    
    const totalPrice = useMemo(() => {
        return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
    }, [state.items]);

    const value = useMemo(() => ({
        items: state.items,
        isCartLoading: state.isCartLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }), [state.items, state.isCartLoading, totalItems, totalPrice]);
  
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
