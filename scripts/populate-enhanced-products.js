const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Enhanced product data with better categorization and images
const enhancedProducts = [
  // Dairy & Eggs
  {
    name: "Anchor Blue Milk 2L",
    category: "dairy",
    image_url:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop&q=80",
    description: "Fresh whole milk from New Zealand dairy farms",
    brand: "Anchor",
    typical_price: 4.5,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Mainland Tasty Cheese 500g",
    category: "dairy",
    image_url:
      "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=300&fit=crop&q=80",
    description: "Aged cheddar cheese with rich flavor",
    brand: "Mainland",
    typical_price: 8.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Anchor Butter 500g",
    category: "dairy",
    image_url:
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=300&h=300&fit=crop&q=80",
    description: "Pure New Zealand butter",
    brand: "Anchor",
    typical_price: 6.5,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Yoplait Greek Yoghurt 500g",
    category: "dairy",
    image_url:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=300&fit=crop&q=80",
    description: "Creamy Greek style yoghurt",
    brand: "Yoplait",
    typical_price: 5.99,
    stores: ["Countdown", "New World"],
  },
  {
    name: "Woolworths Eggs Barn Size 8",
    category: "dairy",
    image_url:
      "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=300&h=300&fit=crop&q=80",
    description: "Fresh barn eggs",
    brand: "Woolworths",
    typical_price: 10.0,
    stores: ["Countdown"],
  },

  // Fresh Produce
  {
    name: "Bananas 1kg",
    category: "fresh-produce",
    image_url:
      "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=300&h=300&fit=crop&q=80",
    description: "Fresh yellow bananas",
    brand: "Fresh",
    typical_price: 3.99,
    stores: ["Countdown", "New World", "Pak'nSave", "Four Square"],
  },
  {
    name: "Red Apples 1kg",
    category: "fresh-produce",
    image_url:
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop&q=80",
    description: "Crisp red apples",
    brand: "Fresh",
    typical_price: 4.5,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Tomatoes 500g",
    category: "fresh-produce",
    image_url:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=300&fit=crop&q=80",
    description: "Fresh vine tomatoes",
    brand: "Fresh",
    typical_price: 3.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Carrots 1kg",
    category: "fresh-produce",
    image_url:
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop&q=80",
    description: "Fresh orange carrots",
    brand: "Fresh",
    typical_price: 2.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Avocados 4 Pack",
    category: "fresh-produce",
    image_url:
      "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&h=300&fit=crop&q=80",
    description: "Ripe Hass avocados",
    brand: "Fresh",
    typical_price: 6.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },

  // Meat & Seafood
  {
    name: "Beef Mince 500g",
    category: "meat-seafood",
    image_url:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&q=80",
    description: "Premium beef mince",
    brand: "Fresh",
    typical_price: 12.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Chicken Breast 500g",
    category: "meat-seafood",
    image_url:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&q=80",
    description: "Skinless chicken breast fillets",
    brand: "Fresh",
    typical_price: 11.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Salmon Fillets 400g",
    category: "meat-seafood",
    image_url:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&q=80",
    description: "Fresh salmon fillets",
    brand: "Fresh",
    typical_price: 18.99,
    stores: ["Countdown", "New World"],
  },
  {
    name: "Pork Chops 500g",
    category: "meat-seafood",
    image_url:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop&q=80",
    description: "Fresh pork chops",
    brand: "Fresh",
    typical_price: 9.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },

  // Bread & Bakery
  {
    name: "Vogel's Bread 700g",
    category: "bread-bakery",
    image_url:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop&q=80",
    description: "Wholegrain bread with seeds",
    brand: "Vogel's",
    typical_price: 5.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Tip Top White Bread 700g",
    category: "bread-bakery",
    image_url:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop&q=80",
    description: "Soft white bread",
    brand: "Tip Top",
    typical_price: 3.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Croissants 4 Pack",
    category: "bread-bakery",
    image_url:
      "https://images.unsplash.com/photo-1555507036-ab794f4ade2a?w=300&h=300&fit=crop&q=80",
    description: "Buttery croissants",
    brand: "Fresh",
    typical_price: 4.99,
    stores: ["Countdown", "New World"],
  },

  // Pantry & Staples
  {
    name: "San Remo Pasta 500g",
    category: "pantry-staples",
    image_url:
      "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=300&h=300&fit=crop&q=80",
    description: "Spaghetti pasta",
    brand: "San Remo",
    typical_price: 2.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "SunRice White Rice 1kg",
    category: "pantry-staples",
    image_url:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop&q=80",
    description: "Long grain white rice",
    brand: "SunRice",
    typical_price: 3.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Weet-Bix Cereal 750g",
    category: "pantry-staples",
    image_url:
      "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=300&h=300&fit=crop&q=80",
    description: "Whole grain breakfast cereal",
    brand: "Weet-Bix",
    typical_price: 5.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Edmonds Self Raising Flour 1kg",
    category: "pantry-staples",
    image_url:
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=300&fit=crop&q=80",
    description: "Self raising flour for baking",
    brand: "Edmonds",
    typical_price: 2.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },

  // Beverages
  {
    name: "Coca Cola 2L",
    category: "beverages",
    image_url:
      "https://images.unsplash.com/photo-1546173159-315724a31696?w=300&h=300&fit=crop&q=80",
    description: "Classic Coca Cola",
    brand: "Coca Cola",
    typical_price: 3.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "T2 English Breakfast Tea 100g",
    category: "beverages",
    image_url:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop&q=80",
    description: "Premium black tea",
    brand: "T2",
    typical_price: 8.99,
    stores: ["Countdown", "New World"],
  },
  {
    name: "Simply Squeezed Orange Juice 1L",
    category: "beverages",
    image_url:
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=300&fit=crop&q=80",
    description: "Fresh squeezed orange juice",
    brand: "Simply Squeezed",
    typical_price: 4.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Heineken Beer 6 Pack",
    category: "beverages",
    image_url:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&h=300&fit=crop&q=80",
    description: "Premium lager beer",
    brand: "Heineken",
    typical_price: 15.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },

  // Snacks & Confectionery
  {
    name: "Bluebird Original Chips 150g",
    category: "snacks-confectionery",
    image_url:
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=300&fit=crop&q=80",
    description: "Classic potato chips",
    brand: "Bluebird",
    typical_price: 3.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Whittaker's Dark Chocolate 250g",
    category: "snacks-confectionery",
    image_url:
      "https://images.unsplash.com/photo-1548907040-4baa419d4274?w=300&h=300&fit=crop&q=80",
    description: "Premium dark chocolate",
    brand: "Whittaker's",
    typical_price: 6.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Pams Mixed Nuts 200g",
    category: "snacks-confectionery",
    image_url:
      "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300&h=300&fit=crop&q=80",
    description: "Mixed nuts and dried fruits",
    brand: "Pams",
    typical_price: 4.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },

  // Frozen Foods
  {
    name: "Tip Top Vanilla Ice Cream 2L",
    category: "frozen-foods",
    image_url:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=300&fit=crop&q=80",
    description: "Creamy vanilla ice cream",
    brand: "Tip Top",
    typical_price: 8.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "McCain Frozen Chips 1kg",
    category: "frozen-foods",
    image_url:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&q=80",
    description: "Frozen potato chips",
    brand: "McCain",
    typical_price: 4.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Frozen Mixed Vegetables 500g",
    category: "frozen-foods",
    image_url:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop&q=80",
    description: "Mixed frozen vegetables",
    brand: "Pams",
    typical_price: 3.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },

  // Household & Cleaning
  {
    name: "Quilton Toilet Paper 12 Pack",
    category: "household-cleaning",
    image_url:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop&q=80",
    description: "3-ply toilet paper",
    brand: "Quilton",
    typical_price: 8.99,
    stores: ["Countdown", "New World", "Pak'nSave", "The Warehouse"],
  },
  {
    name: "Persil Laundry Detergent 2L",
    category: "household-cleaning",
    image_url:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&q=80",
    description: "Concentrated laundry detergent",
    brand: "Persil",
    typical_price: 12.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Palmolive Dish Liquid 750ml",
    category: "household-cleaning",
    image_url:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&q=80",
    description: "Gentle dish washing liquid",
    brand: "Palmolive",
    typical_price: 3.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },

  // Personal Care & Health
  {
    name: "Head & Shoulders Shampoo 400ml",
    category: "personal-care-health",
    image_url:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&q=80",
    description: "Anti-dandruff shampoo",
    brand: "Head & Shoulders",
    typical_price: 8.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Colgate Toothpaste 100g",
    category: "personal-care-health",
    image_url:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&q=80",
    description: "Fresh mint toothpaste",
    brand: "Colgate",
    typical_price: 4.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Dove Body Wash 400ml",
    category: "personal-care-health",
    image_url:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop&q=80",
    description: "Moisturizing body wash",
    brand: "Dove",
    typical_price: 6.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },

  // Baby & Kids
  {
    name: "Huggies Nappies Size 4 40 Pack",
    category: "baby-kids",
    image_url:
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&h=300&fit=crop&q=80",
    description: "Comfortable baby nappies",
    brand: "Huggies",
    typical_price: 24.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Heinz Baby Food 4 Pack",
    category: "baby-kids",
    image_url:
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&h=300&fit=crop&q=80",
    description: "Organic baby food pouches",
    brand: "Heinz",
    typical_price: 6.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },

  // Pet Supplies
  {
    name: "Whiskas Cat Food 1kg",
    category: "pet-supplies",
    image_url:
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=300&h=300&fit=crop&q=80",
    description: "Complete cat food",
    brand: "Whiskas",
    typical_price: 12.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Pedigree Dog Food 2kg",
    category: "pet-supplies",
    image_url:
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=300&h=300&fit=crop&q=80",
    description: "Complete dog food",
    brand: "Pedigree",
    typical_price: 15.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },

  // Alcohol & Tobacco
  {
    name: "Corona Beer 6 Pack",
    category: "alcohol-tobacco",
    image_url:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&h=300&fit=crop&q=80",
    description: "Mexican lager beer",
    brand: "Corona",
    typical_price: 18.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Oyster Bay Sauvignon Blanc 750ml",
    category: "alcohol-tobacco",
    image_url:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300&h=300&fit=crop&q=80",
    description: "Premium New Zealand wine",
    brand: "Oyster Bay",
    typical_price: 22.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },

  // Organic & Health Foods
  {
    name: "Organic Bananas 1kg",
    category: "organic-health",
    image_url:
      "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=300&h=300&fit=crop&q=80",
    description: "Organic certified bananas",
    brand: "Organic",
    typical_price: 5.99,
    stores: ["Countdown", "New World"],
  },
  {
    name: "Sanitarium So Good Oat Milk 1L",
    category: "organic-health",
    image_url:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop&q=80",
    description: "Plant-based oat milk",
    brand: "Sanitarium",
    typical_price: 4.09,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Zenzo Tofu Firm Style 300g",
    category: "organic-health",
    image_url:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop&q=80",
    description: "Organic firm tofu",
    brand: "Zenzo",
    typical_price: 6.3,
    stores: ["Countdown", "New World"],
  },
];

async function populateEnhancedProducts() {
  console.log("Starting to populate enhanced products...");

  try {
    // First, let's check if we have a products table
    const { data: existingProducts, error: checkError } = await supabase
      .from("products")
      .select("*")
      .limit(1);

    if (checkError) {
      console.error(
        "Products table does not exist. Please run the migration first."
      );
      return;
    }

    console.log("Products table found, proceeding with population...");

    // Insert products
    for (const product of enhancedProducts) {
      const { data, error } = await supabase.from("products").upsert(
        {
          name: product.name,
          category: product.category,
          image_url: product.image_url,
          description: product.description,
          brand: product.brand,
          typical_price: product.typical_price,
          stores: product.stores,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "name",
        }
      );

      if (error) {
        console.error(`Error inserting ${product.name}:`, error);
      } else {
        console.log(`✅ Inserted: ${product.name} (${product.category})`);
      }
    }

    console.log("✅ Enhanced product population completed!");

    // Show summary by category
    const { data: productsByCategory, error: categoryError } = await supabase
      .from("products")
      .select("category")
      .order("category");

    if (!categoryError) {
      const categoryCount = {};
      productsByCategory.forEach((product) => {
        categoryCount[product.category] =
          (categoryCount[product.category] || 0) + 1;
      });

      console.log("\n📊 Products by category:");
      Object.entries(categoryCount).forEach(([category, count]) => {
        console.log(`  ${category}: ${count} products`);
      });
    }

    // Show total count
    const { data: totalProducts, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact" });

    if (!countError) {
      console.log(
        `\n📊 Total products in database: ${totalProducts?.length || 0}`
      );
    }
  } catch (error) {
    console.error("❌ Error populating enhanced products:", error);
  }
}

// Run the population
populateEnhancedProducts();
