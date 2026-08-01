// Sample product data for F.S Print Works
// This will be replaced with Firebase Firestore data later

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  categorySlug: string;
  badge?: 'new' | 'bestseller' | 'discount';
  discount?: number;
  inStock: boolean;
  featured: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

export const categories: Category[] = [
  {
    id: '1',
    name: 'T-Shirts',
    slug: 't-shirts',
    description: 'Custom printed t-shirts for every occasion',
    image: '/images/categories/tshirts.jpg',
    productCount: 24,
  },
  {
    id: '2',
    name: 'Mugs',
    slug: 'mugs',
    description: 'Personalized mugs with your favorite designs',
    image: '/images/categories/mugs.jpg',
    productCount: 18,
  },
  {
    id: '3',
    name: 'Stickers',
    slug: 'stickers',
    description: 'High quality vinyl stickers and decals',
    image: '/images/categories/stickers.jpg',
    productCount: 35,
  },
  {
    id: '4',
    name: 'Keychains',
    slug: 'keychains',
    description: 'Custom keychains in various shapes and materials',
    image: '/images/categories/keychains.jpg',
    productCount: 15,
  },
  {
    id: '5',
    name: 'Cups',
    slug: 'cups',
    description: 'Printed cups for gifts and everyday use',
    image: '/images/categories/cups.jpg',
    productCount: 12,
  },
  {
    id: '6',
    name: 'Phone Cases',
    slug: 'phone-cases',
    description: 'Custom phone cases with premium print quality',
    image: '/images/categories/phone-cases.jpg',
    productCount: 20,
  },
];

export const products: Product[] = [
  // T-Shirts
  {
    id: 'ts-001',
    name: 'Custom Name T-Shirt',
    description: 'Premium cotton t-shirt with your custom name and design. Available in all sizes. Perfect for gifts, events, and personal use.',
    price: 399,
    originalPrice: 599,
    image: '/images/products/tshirt-1.jpg',
    category: 'T-Shirts',
    categorySlug: 't-shirts',
    badge: 'bestseller',
    discount: 33,
    inStock: true,
    featured: true,
  },
  {
    id: 'ts-002',
    name: 'Photo Print T-Shirt',
    description: 'High-quality photo printed t-shirt. Upload any photo and we will print it with vivid colors that last.',
    price: 499,
    originalPrice: 699,
    image: '/images/products/tshirt-2.jpg',
    category: 'T-Shirts',
    categorySlug: 't-shirts',
    badge: 'discount',
    discount: 29,
    inStock: true,
    featured: true,
  },
  {
    id: 'ts-003',
    name: 'Corporate Logo T-Shirt',
    description: 'Professional corporate t-shirts with your company logo. Bulk orders available with special pricing.',
    price: 349,
    image: '/images/products/tshirt-3.jpg',
    category: 'T-Shirts',
    categorySlug: 't-shirts',
    inStock: true,
    featured: false,
  },
  {
    id: 'ts-004',
    name: 'Couple Matching T-Shirts',
    description: 'Adorable matching t-shirts for couples. Set of 2 with customizable designs.',
    price: 799,
    originalPrice: 999,
    image: '/images/products/tshirt-4.jpg',
    category: 'T-Shirts',
    categorySlug: 't-shirts',
    badge: 'new',
    discount: 20,
    inStock: true,
    featured: true,
  },
  // Mugs
  {
    id: 'mg-001',
    name: 'Magic Color Changing Mug',
    description: 'Heat-sensitive magic mug that reveals your design when hot liquid is poured. Amazing gift idea!',
    price: 349,
    originalPrice: 499,
    image: '/images/products/mug-1.jpg',
    category: 'Mugs',
    categorySlug: 'mugs',
    badge: 'bestseller',
    discount: 30,
    inStock: true,
    featured: true,
  },
  {
    id: 'mg-002',
    name: 'Photo Collage Mug',
    description: 'Beautiful photo collage printed mug. Add up to 6 photos of your choice.',
    price: 299,
    image: '/images/products/mug-2.jpg',
    category: 'Mugs',
    categorySlug: 'mugs',
    inStock: true,
    featured: false,
  },
  {
    id: 'mg-003',
    name: 'Couple Name Mug Set',
    description: 'Set of 2 personalized mugs with couple names and hearts. Perfect anniversary gift.',
    price: 599,
    originalPrice: 799,
    image: '/images/products/mug-3.jpg',
    category: 'Mugs',
    categorySlug: 'mugs',
    badge: 'new',
    discount: 25,
    inStock: true,
    featured: true,
  },
  // Stickers
  {
    id: 'st-001',
    name: 'Custom Logo Stickers (50 pcs)',
    description: 'High-quality vinyl stickers with your custom logo. Waterproof and UV resistant. Pack of 50.',
    price: 199,
    image: '/images/products/sticker-1.jpg',
    category: 'Stickers',
    categorySlug: 'stickers',
    badge: 'bestseller',
    inStock: true,
    featured: true,
  },
  {
    id: 'st-002',
    name: 'Die-Cut Stickers (100 pcs)',
    description: 'Custom die-cut stickers in any shape. Perfect for branding, packaging, and promotions.',
    price: 349,
    originalPrice: 499,
    image: '/images/products/sticker-2.jpg',
    category: 'Stickers',
    categorySlug: 'stickers',
    badge: 'discount',
    discount: 30,
    inStock: true,
    featured: false,
  },
  // Keychains
  {
    id: 'kc-001',
    name: 'Acrylic Photo Keychain',
    description: 'Crystal clear acrylic keychain with your photo printed inside. Lightweight and durable.',
    price: 149,
    originalPrice: 249,
    image: '/images/products/keychain-1.jpg',
    category: 'Keychains',
    categorySlug: 'keychains',
    badge: 'bestseller',
    discount: 40,
    inStock: true,
    featured: true,
  },
  {
    id: 'kc-002',
    name: 'Metal Engraved Keychain',
    description: 'Premium metal keychain with custom engraving. Available in gold and silver finish.',
    price: 249,
    image: '/images/products/keychain-2.jpg',
    category: 'Keychains',
    categorySlug: 'keychains',
    badge: 'new',
    inStock: true,
    featured: true,
  },
  // Cups
  {
    id: 'cp-001',
    name: 'Printed Travel Cup',
    description: 'Insulated travel cup with custom print. Keeps drinks hot for 6 hours, cold for 12 hours.',
    price: 449,
    originalPrice: 599,
    image: '/images/products/cup-1.jpg',
    category: 'Cups',
    categorySlug: 'cups',
    badge: 'new',
    discount: 25,
    inStock: true,
    featured: true,
  },
  // Phone Cases
  {
    id: 'pc-001',
    name: 'Custom Photo Phone Case',
    description: 'Slim-fit phone case with your custom photo. Available for all popular phone models.',
    price: 299,
    originalPrice: 449,
    image: '/images/products/phonecase-1.jpg',
    category: 'Phone Cases',
    categorySlug: 'phone-cases',
    badge: 'bestseller',
    discount: 33,
    inStock: true,
    featured: true,
  },
];

export const featuredProducts = products.filter(p => p.featured);
export const getProductsByCategory = (slug: string) => products.filter(p => p.categorySlug === slug);
export const getProductById = (id: string) => products.find(p => p.id === id);
