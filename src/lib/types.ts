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

export type CartItem = {
  id: string; // A unique ID for the cart item (e.g., `${productId}-${size}`)
  productId: string;
  name: string;
  image: string;
  price: number;
  size: 'S' | 'M' | 'L' | 'XL';
  quantity: number;
};
