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

const productData = {
    men: {
        topwear: ['Classic Crewneck Tee', 'Oxford Button-Down', 'Linen Blend Shirt', 'Polo Shirt', 'Graphic Print Tee', 'Henley Neck T-Shirt', 'Striped Long-Sleeve', 'V-Neck Basic Tee', 'Denim Shirt', 'Flannel Check Shirt', 'Mandarin Collar Shirt', 'Jersey Knit Top'],
        bottomwear: ['Slim Fit Jeans', 'Chino Trousers', 'Cargo Pants', 'Relaxed Fit Shorts', 'Tapered Joggers', 'Wool Blend Trousers', 'Corduroy Pants', 'Drawstring Linen Pants', 'Denim Shorts', 'Formal Pleated Trousers', 'Active Flex Pants', 'Twill Cargo Shorts'],
        footwear: ['Leather Sneakers', 'Suede Loafers', 'Classic Brogues', 'Ankle Chelsea Boots', 'Running Shoes', 'Canvas Slip-Ons', 'Formal Oxford Shoes', 'Hiking Boots', 'Flip-Flop Sandals', 'Woven Espadrilles', 'High-Top Sneakers', 'Boat Shoes'],
        accessories: ['Leather Belt', 'Aviator Sunglasses', 'Chronograph Watch', 'Knit Beanie', 'Silk Tie', 'Canvas Backpack', 'Patterned Socks', 'Wool Scarf', 'Cardholder Wallet', 'Silver Cufflinks', 'Baseball Cap', 'Leather Gloves'],
        winterwear: ['Wool Overcoat', 'Quilted Puffer Jacket', 'Trench Coat', 'Fleece Zip Hoodie', 'Denim Jacket', 'Leather Biker Jacket', 'Parka with Faux Fur', 'Cable-Knit Sweater', 'Down Vest', 'Turtleneck Pullover', 'Sherpa Lined Jacket', 'Bomber Jacket'],
        sportswear: ['Performance T-Shirt', 'Running Shorts', 'Track Jacket', 'Compression Leggings', 'Gym Hoodie', 'Basketball Shorts', 'Yoga Pants', 'Cycling Jersey', 'Golf Polo', 'Swim Trunks', 'Athletic Socks', 'Training Sweatpants'],
    },
    women: {
        topwear: ['Silk Blouse', 'Cotton V-Neck Tee', 'Off-Shoulder Top', 'Lace Camisole', 'Striped Bodysuit', 'Knit Crop Top', 'Oversized Poplin Shirt', 'Wrap Top', 'Ribbed Tank Top', 'Turtleneck Sweater', 'Embroidered Blouse', 'Satin Cami'],
        bottomwear: ['High-Waisted Jeans', 'A-Line Skirt', 'Wide-Leg Trousers', 'Tailored Shorts', 'Faux Leather Leggings', 'Pleated Midi Skirt', 'Culottes', 'Paperbag Waist Pants', 'Denim Mini Skirt', 'Yoga Leggings', 'Satin Slip Skirt', 'Boyfriend Jeans'],
        footwear: ['Stiletto Heels', 'Ballet Flats', 'Ankle Boots', 'White Sneakers', 'Strappy Sandals', 'Platform Espadrilles', 'Knee-High Boots', 'Pointed Toe Pumps', 'Mules', 'Wedge Sandals', 'Chunky Loafers', 'Running Sneakers'],
        accessories: ['Leather Tote Bag', 'Cat-Eye Sunglasses', 'Gold Pendant Necklace', 'Silk Scarf', 'Dainty Hoop Earrings', 'Crossbody Bag', 'Statement Belt', 'Felt Fedora Hat', 'Pearl Bracelet', 'Clutch Purse', 'Layered Necklace', 'Minimalist Watch'],
        winterwear: ['Wool Blend Coat', 'Down Puffer Jacket', 'Classic Trench Coat', 'Cashmere Sweater', 'Faux Fur Jacket', 'Turtleneck Dress', 'Chunky Knit Cardigan', 'Shearling Aviator Jacket', 'Quilted Vest', 'Oversized Scarf', 'Leather Leggings', 'Long Cardigan'],
        sportswear: ['High-Impact Sports Bra', 'Seamless Leggings', 'Zip-Up Running Jacket', 'Yoga Tank Top', 'Athletic Shorts', 'Tennis Skirt', 'Performance Hoodie', 'Cycling Shorts', 'Pilates Bodysuit', 'Lightweight Windbreaker', 'Cross-Back Bra', 'Fleece Joggers'],
    },
};

const generateProducts = (): Product[] => {
  const allProducts: Product[] = [];
  let productIdCounter = 1;

  for (const gender of Object.keys(productData) as ('men' | 'women')[]) {
    for (const category of Object.keys(productData[gender])) {
      const productNames = productData[gender][category as keyof typeof productData[typeof gender]];
      for (let i = 0; i < productNames.length; i++) {
        const name = productNames[i];
        const id = productIdCounter++;
        const product: Product = {
          id: `${id}`,
          name: name,
          description: 'A stylish and comfortable choice for modern wardrobes.',
          price: parseFloat((Math.random() * (200 - 30) + 30).toFixed(2)),
          rating: parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
          stock: Math.floor(Math.random() * 100),
          images: [`${gender.charAt(0)}-${category.split('wear')[0]}-${i + 1}`],
          category: category,
          gender: gender,
          sizes: ['S', 'M', 'L', 'XL'],
        };
        allProducts.push(product);
      }
    }
  }
  return allProducts;
};

export const products: Product[] = generateProducts();
