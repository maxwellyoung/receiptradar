// Better Image Sources for ReceiptRadar
// Using more reliable and higher quality image sources

export interface BetterStoreConfig {
  logo: string;
  icon: string;
  color: string;
  backgroundColor: string;
  description: string;
  fallbackIcon: string; // Material icon name as fallback
}

export const BETTER_STORE_IMAGES: Record<string, BetterStoreConfig> = {
  Countdown: {
    // Using a more reliable CDN for store logos
    logo: "https://cdn.jsdelivr.net/gh/wikipedia/commons@master/thumb/8/8a/Countdown_logo.svg/1200px-Countdown_logo.svg.png",
    icon: "https://cdn.jsdelivr.net/gh/wikipedia/commons@master/thumb/8/8a/Countdown_logo.svg/200px-Countdown_logo.svg.png",
    color: "#007AFF",
    backgroundColor: "#E3F2FD",
    description:
      "New Zealand's largest supermarket chain with competitive prices and wide selection",
    fallbackIcon: "shopping-cart",
  },
  "New World": {
    logo: "https://cdn.jsdelivr.net/gh/wikipedia/commons@master/thumb/8/8d/New_World_logo.svg/1200px-New_World_logo.svg.png",
    icon: "https://cdn.jsdelivr.net/gh/wikipedia/commons@master/thumb/8/8d/New_World_logo.svg/200px-New_World_logo.svg.png",
    color: "#34C759",
    backgroundColor: "#E8F5E8",
    description:
      "Premium supermarket chain known for quality products and fresh produce",
    fallbackIcon: "store",
  },
  "Pak'nSave": {
    logo: "https://cdn.jsdelivr.net/gh/wikipedia/commons@master/thumb/2/2a/Pak%27nSave_logo.svg/1200px-Pak%27nSave_logo.svg.png",
    icon: "https://cdn.jsdelivr.net/gh/wikipedia/commons@master/thumb/2/2a/Pak%27nSave_logo.svg/200px-Pak%27nSave_logo.svg.png",
    color: "#FF9500",
    backgroundColor: "#FFF3E0",
    description:
      "Budget-friendly supermarket with bulk buying options and great deals",
    fallbackIcon: "local-grocery-store",
  },
  "Four Square": {
    logo: "https://cdn.jsdelivr.net/gh/wikipedia/commons@master/thumb/4/4a/Four_Square_logo.svg/1200px-Four_Square_logo.svg.png",
    icon: "https://cdn.jsdelivr.net/gh/wikipedia/commons@master/thumb/4/4a/Four_Square_logo.svg/200px-Four_Square_logo.svg.png",
    color: "#FF3B30",
    backgroundColor: "#FFEBEE",
    description:
      "Convenient neighborhood stores with essential groceries and local products",
    fallbackIcon: "local-convenience-store",
  },
  "The Warehouse": {
    logo: "https://cdn.jsdelivr.net/gh/wikipedia/commons@master/thumb/8/8a/The_Warehouse_logo.svg/1200px-The_Warehouse_logo.svg.png",
    icon: "https://cdn.jsdelivr.net/gh/wikipedia/commons@master/thumb/8/8a/The_Warehouse_logo.svg/200px-The_Warehouse_logo.svg.png",
    color: "#FF9500",
    backgroundColor: "#FFF3E0",
    description:
      "General merchandise store with grocery section and household items",
    fallbackIcon: "home",
  },
  "Moore Wilson's Fresh": {
    // Using a more reliable source for Moore Wilson's
    logo: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop",
    icon: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop",
    color: "#AF52DE",
    backgroundColor: "#F3E5F5",
    description:
      "Premium gourmet supermarket with specialty foods and fresh produce",
    fallbackIcon: "restaurant",
  },
  "Fresh Choice": {
    // Using a more reliable source for Fresh Choice
    logo: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400&h=200&fit=crop",
    icon: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=200&h=200&fit=crop",
    color: "#FF3B30",
    backgroundColor: "#FFEBEE",
    description:
      "Regional supermarket chain with fresh produce and local products",
    fallbackIcon: "local-grocery-store",
  },
};

// Better product images with more reliable sources
export const BETTER_PRODUCT_IMAGES = {
  // Dairy Products
  milk: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop&q=80",
  cheese:
    "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=300&fit=crop&q=80",
  butter:
    "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=300&h=300&fit=crop&q=80",
  yoghurt:
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=300&fit=crop&q=80",
  eggs: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=300&h=300&fit=crop&q=80",

  // Fresh Produce
  banana:
    "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=300&h=300&fit=crop&q=80",
  apple:
    "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop&q=80",
  tomato:
    "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=300&fit=crop&q=80",
  lettuce:
    "https://images.unsplash.com/photo-1622205313162-be1d5716a43b?w=300&h=300&fit=crop&q=80",
  carrot:
    "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop&q=80",
  onion:
    "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop&q=80",
  potato:
    "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop&q=80",

  // Meat & Fish
  beef: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&q=80",
  chicken:
    "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&q=80",
  fish: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&q=80",
  salmon:
    "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&q=80",

  // Bread & Bakery
  bread:
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop&q=80",

  // Pantry Items
  pasta:
    "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=300&h=300&fit=crop&q=80",
  rice: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop&q=80",
  cereal:
    "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=300&h=300&fit=crop&q=80",

  // Household Items
  "toilet-paper":
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&q=80",
  detergent:
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&q=80",

  // Personal Care
  shampoo:
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&q=80",
  toothpaste:
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&q=80",

  // Default fallback
  default:
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop&q=80",
};

// Alternative image sources for better reliability
export const ALTERNATIVE_IMAGE_SOURCES = {
  // Using Pexels as alternative to Unsplash
  "milk-alt":
    "https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?w=300&h=300&fit=crop",
  "bread-alt":
    "https://images.pexels.com/photos/144569/pexels-photo-144569.jpeg?w=300&h=300&fit=crop",
  "banana-alt":
    "https://images.pexels.com/photos/47305/bananas-banana-yellow-fruit-47305.jpeg?w=300&h=300&fit=crop",

  // Using Pixabay as another alternative
  "apple-alt":
    "https://cdn.pixabay.com/photo/2016/02/23/17/42/apple-1218160_1280.jpg",
  "cheese-alt":
    "https://cdn.pixabay.com/photo/2016/03/05/19/02/cheese-1238395_1280.jpg",

  // Local placeholder images (for offline/fallback)
  placeholder:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZTwvdGV4dD4KPC9zdmc+",
};

// Helper function to get better product image with fallbacks
export const getBetterProductImage = (productName: string): string => {
  const lowerName = productName.toLowerCase();

  // Try exact matches first
  for (const [key, image] of Object.entries(BETTER_PRODUCT_IMAGES)) {
    if (lowerName.includes(key)) {
      return image;
    }
  }

  // Try alternative sources
  for (const [key, image] of Object.entries(ALTERNATIVE_IMAGE_SOURCES)) {
    if (lowerName.includes(key.replace("-alt", ""))) {
      return image;
    }
  }

  // Return default
  return BETTER_PRODUCT_IMAGES.default;
};

// Helper function to get better store image
export const getBetterStoreImage = (storeName: string): BetterStoreConfig => {
  const lowerName = storeName.toLowerCase();

  if (lowerName.includes("countdown")) return BETTER_STORE_IMAGES["Countdown"];
  if (lowerName.includes("new world")) return BETTER_STORE_IMAGES["New World"];
  if (
    lowerName.includes("pak'n'save") ||
    lowerName.includes("paknsave") ||
    lowerName.includes("pak n save")
  )
    return BETTER_STORE_IMAGES["Pak'nSave"];
  if (lowerName.includes("four square"))
    return BETTER_STORE_IMAGES["Four Square"];
  if (lowerName.includes("warehouse"))
    return BETTER_STORE_IMAGES["The Warehouse"];
  if (lowerName.includes("moore wilson"))
    return BETTER_STORE_IMAGES["Moore Wilson's Fresh"];
  if (lowerName.includes("fresh choice"))
    return BETTER_STORE_IMAGES["Fresh Choice"];

  // Default to Countdown
  return BETTER_STORE_IMAGES["Countdown"];
};
