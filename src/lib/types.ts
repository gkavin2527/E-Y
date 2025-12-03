export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  stock: number;
  images: string[];
  category: string;
  gender: 'men' | 'women';
  sizes: ('S' | 'M' | 'L' | 'XL')[];
};

export type Category = {
  name: string;
  slug: string;
  image: string;
  description: string;
};

// Represents the full cart item with all product details, used in the UI.
export type CartItem = {
  id: string; // A unique ID for the cart item (e.g., `${productId}-${size}`)
  productId: string;
  name: string;
  image: string;
  price: number;
  size: 'S' | 'M' | 'L' | 'XL';
  quantity: number;
};

// Represents the minimal cart item data stored in Firestore.
export type CartItemDetails = {
    id: string;
    productId: string;
    size: 'S' | 'M' | 'L' | 'XL';
    quantity: number;
}
