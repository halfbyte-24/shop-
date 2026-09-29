export const DEMO_CATEGORIES = [
  { id: 'cat-sneakers', name: 'Sneakers', slug: 'demo-sneakers', description: 'Explore our premium collection of Sneakers.', is_visible: true, display_order: 1 },
  { id: 'cat-running', name: 'Running Shoes', slug: 'demo-running-shoes', description: 'Explore our premium collection of Running Shoes.', is_visible: true, display_order: 2 },
  { id: 'cat-sports', name: 'Sports Shoes', slug: 'demo-sports-shoes', description: 'Explore our premium collection of Sports Shoes.', is_visible: true, display_order: 3 },
  { id: 'cat-casual', name: 'Casual Shoes', slug: 'demo-casual-shoes', description: 'Explore our premium collection of Casual Shoes.', is_visible: true, display_order: 4 },
  { id: 'cat-formal', name: 'Formal Shoes', slug: 'demo-formal-shoes', description: 'Explore our premium collection of Formal Shoes.', is_visible: true, display_order: 5 },
  { id: 'cat-mens', name: "Men's Footwear", slug: 'demo-mens-footwear', description: "Explore our premium collection of Men's Footwear.", is_visible: true, display_order: 6 },
  { id: 'cat-womens', name: "Women's Footwear", slug: 'demo-womens-footwear', description: "Explore our premium collection of Women's Footwear.", is_visible: true, display_order: 7 },
  { id: 'cat-kids', name: "Kids' Footwear", slug: 'demo-kids-footwear', description: "Explore our premium collection of Kids' Footwear.", is_visible: true, display_order: 8 },
  { id: 'cat-sandals', name: 'Sandals & Slippers', slug: 'demo-sandals', description: 'Explore our premium collection of Sandals & Slippers.', is_visible: true, display_order: 9 },
  { id: 'cat-boots', name: 'Boots', slug: 'demo-boots', description: 'Explore our premium collection of Boots.', is_visible: true, display_order: 10 }
];

const IMAGES = {
  sneaker: '/images/products/sneaker.jpg',
  running: '/images/products/running.jpg',
  sports: '/images/products/running.jpg',
  casual: '/images/products/sneaker.jpg',
  formal: '/images/products/formal.jpg',
  mens: '/images/products/formal.jpg',
  womens: '/images/products/sandal.jpg',
  kids: '/images/products/sneaker.jpg',
  sandals: '/images/products/sandal.jpg',
  boots: '/images/products/boot.jpg'
};

const generateProductsForCategory = (cat) => {
  const baseName = cat.name.replace(/s$/i, '').replace(/ Footwear$/i, ''); 
  const imageKey = cat.id.replace('cat-', '');
  const imageUrl = IMAGES[imageKey] || IMAGES.sneaker;

  return [
    {
      id: `prod-${cat.id}-1`,
      category_id: cat.id,
      name: `Premium ${baseName} Alpha`,
      slug: `demo-alpha-${cat.id}`,
      description: `The ultimate ${cat.name.toLowerCase()} for everyday comfort and unmatched style. Engineered with premium materials.`,
      sku: `SKU-A-${cat.id}`,
      brand: 'JANATA',
      price: 1999,
      currency: 'INR',
      availability: 'available',
      is_published: true,
      display_order: 1,
      created_at: new Date().toISOString(),
      category: { name: cat.name, slug: cat.slug },
      product_images: [{ image_url: imageUrl, is_primary: true, display_order: 1 }]
    },
    {
      id: `prod-${cat.id}-2`,
      category_id: cat.id,
      name: `Classic ${baseName} Pro`,
      slug: `demo-pro-${cat.id}`,
      description: `A timeless design reimagined for modern wear. These ${cat.name.toLowerCase()} provide maximum support and breathability.`,
      sku: `SKU-P-${cat.id}`,
      brand: 'JANATA',
      price: 1499,
      currency: 'INR',
      availability: 'available',
      is_published: true,
      display_order: 2,
      created_at: new Date().toISOString(),
      category: { name: cat.name, slug: cat.slug },
      product_images: [{ image_url: imageUrl, is_primary: true, display_order: 1 }]
    },
    {
      id: `prod-${cat.id}-3`,
      category_id: cat.id,
      name: `Elite ${baseName} Flex`,
      slug: `demo-flex-${cat.id}`,
      description: `Lightweight and durable, perfect for all-day wear. Experience the difference with our advanced cushioning.`,
      sku: `SKU-F-${cat.id}`,
      brand: 'JANATA',
      price: 2499,
      currency: 'INR',
      availability: 'available',
      is_published: true,
      display_order: 3,
      created_at: new Date().toISOString(),
      category: { name: cat.name, slug: cat.slug },
      product_images: [{ image_url: imageUrl, is_primary: true, display_order: 1 }]
    }
  ];
};

export const DEMO_PRODUCTS = DEMO_CATEGORIES.flatMap(cat => generateProductsForCategory(cat));
