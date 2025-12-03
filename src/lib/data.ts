import type { Category, Product } from '@/lib/types';

export const genders = [
  { name: 'Men', slug: 'men' },
  { name: 'Women', slug: 'women' },
];

export const categories: { [key: string]: Category[] } = {
  men: [
    { name: 'Topwear', slug: 'topwear', image: 'men-topwear-cat', description: 'Sharp shirts, casual tees, and more.' },
    { name: 'Bottomwear', slug: 'bottomwear', image: 'men-bottomwear-cat', description: 'From classic jeans to modern chinos.' },
    { name: 'Footwear', slug: 'footwear', image: 'men-footwear-cat', description: 'Step up your style with our latest shoes.' },
    { name: 'Accessories', slug: 'accessories', image: 'men-accessories-cat', description: 'The perfect finishing touches.' },
    { name: "Winterwear", slug: "winterwear", image: "men-winterwear-cat", description: "Stay warm with stylish jackets and coats." },
    { name: 'Sportswear', slug: 'sportswear', image: 'men-sportswear-cat', description: 'Performance gear for your active life.' },
  ],
  women: [
    { name: 'Topwear', slug: 'topwear', image: 'women-topwear-cat', description: 'Elegant blouses, chic tops, and daily tees.' },
    { name: "Bottomwear", slug: "bottomwear", image: "women-bottomwear-cat", description: "Versatile skirts, pants, and denim." },
    { name: 'Footwear', slug: 'footwear', image: 'women-footwear-cat', description: 'Discover shoes for every occasion.' },
    { name: 'Accessories', slug: 'accessories', image: 'women-accessories-cat', description: 'Elevate your look with our accessories.' },
    { name: 'Winterwear', slug: 'winterwear', image: 'women-winterwear-cat', description: 'Cozy and fashionable winter essentials.' },
    { name: 'Sportswear', slug: 'sportswear', image: 'women-sportswear-cat', description: 'Activewear that blends performance and style.' },
  ],
};
