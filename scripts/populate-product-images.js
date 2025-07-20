const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sample products with images and categories
const sampleProducts = [
  // Dairy Products
  {
    name: "Anchor Blue Milk 2L",
    category: "dairy",
    image_url:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop",
    description: "Fresh whole milk from New Zealand dairy farms",
    brand: "Anchor",
    typical_price: 4.5,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Mainland Tasty Cheese 500g",
    category: "dairy",
    image_url:
      "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&h=200&fit=crop",
    description: "Aged cheddar cheese with rich flavor",
    brand: "Mainland",
    typical_price: 8.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Anchor Butter 500g",
    category: "dairy",
    image_url:
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=200&h=200&fit=crop",
    description: "Pure New Zealand butter",
    brand: "Anchor",
    typical_price: 6.5,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Yoplait Greek Yoghurt 500g",
    category: "dairy",
    image_url:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop",
    description: "Creamy Greek style yoghurt",
    brand: "Yoplait",
    typical_price: 5.99,
    stores: ["Countdown", "New World"],
  },

  // Fresh Produce
  {
    name: "Bananas 1kg",
    category: "fresh-produce",
    image_url:
      "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=200&h=200&fit=crop",
    description: "Fresh yellow bananas",
    brand: "Fresh",
    typical_price: 3.99,
    stores: ["Countdown", "New World", "Pak'nSave", "Four Square"],
  },
  {
    name: "Red Apples 1kg",
    category: "fresh-produce",
    image_url:
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&h=200&fit=crop",
    description: "Crisp red apples",
    brand: "Fresh",
    typical_price: 4.5,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Tomatoes 500g",
    category: "fresh-produce",
    image_url:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=200&h=200&fit=crop",
    description: "Fresh vine tomatoes",
    brand: "Fresh",
    typical_price: 3.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Carrots 1kg",
    category: "fresh-produce",
    image_url:
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&h=200&fit=crop",
    description: "Fresh orange carrots",
    brand: "Fresh",
    typical_price: 2.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },

  // Meat & Fish
  {
    name: "Beef Mince 500g",
    category: "meat",
    image_url:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&h=200&fit=crop",
    description: "Premium beef mince",
    brand: "Fresh",
    typical_price: 12.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Chicken Breast 500g",
    category: "meat",
    image_url:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&h=200&fit=crop",
    description: "Skinless chicken breast fillets",
    brand: "Fresh",
    typical_price: 11.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Salmon Fillets 400g",
    category: "meat",
    image_url:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&h=200&fit=crop",
    description: "Fresh salmon fillets",
    brand: "Fresh",
    typical_price: 18.99,
    stores: ["Countdown", "New World"],
  },

  // Bread & Bakery
  {
    name: "Vogel's Bread 700g",
    category: "bread",
    image_url:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop",
    description: "Wholegrain bread with seeds",
    brand: "Vogel's",
    typical_price: 5.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Tip Top White Bread 700g",
    category: "bread",
    image_url:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop",
    description: "Soft white bread",
    brand: "Tip Top",
    typical_price: 3.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },

  // Pantry Items
  {
    name: "San Remo Pasta 500g",
    category: "grocery",
    image_url:
      "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=200&h=200&fit=crop",
    description: "Spaghetti pasta",
    brand: "San Remo",
    typical_price: 2.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "SunRice White Rice 1kg",
    category: "grocery",
    image_url:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop",
    description: "Long grain white rice",
    brand: "SunRice",
    typical_price: 3.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
  {
    name: "Weet-Bix Cereal 750g",
    category: "grocery",
    image_url:
      "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=200&h=200&fit=crop",
    description: "Whole grain breakfast cereal",
    brand: "Weet-Bix",
    typical_price: 5.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },

  // Household Items
  {
    name: "Quilton Toilet Paper 12 Pack",
    category: "household",
    image_url:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop",
    description: "3-ply toilet paper",
    brand: "Quilton",
    typical_price: 8.99,
    stores: ["Countdown", "New World", "Pak'nSave", "The Warehouse"],
  },
  {
    name: "Persil Laundry Detergent 2L",
    category: "household",
    image_url:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop",
    description: "Liquid laundry detergent",
    brand: "Persil",
    typical_price: 12.99,
    stores: ["Countdown", "New World", "Pak'nSave", "The Warehouse"],
  },

  // Personal Care
  {
    name: "Head & Shoulders Shampoo 400ml",
    category: "personal-care",
    image_url:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop",
    description: "Anti-dandruff shampoo",
    brand: "Head & Shoulders",
    typical_price: 8.99,
    stores: ["Countdown", "New World", "Pak'nSave", "The Warehouse"],
  },
  {
    name: "Colgate Toothpaste 100g",
    category: "personal-care",
    image_url:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop",
    description: "Fresh mint toothpaste",
    brand: "Colgate",
    typical_price: 4.99,
    stores: ["Countdown", "New World", "Pak'nSave", "The Warehouse"],
  },

  // Eggs
  {
    name: "Fresh Eggs 12 Pack",
    category: "dairy",
    image_url:
      "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=200&h=200&fit=crop",
    description: "Free range eggs",
    brand: "Fresh",
    typical_price: 7.99,
    stores: ["Countdown", "New World", "Pak'nSave"],
  },
];

async function populateProducts() {
  console.log("Starting to populate products...");

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
    for (const product of sampleProducts) {
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
        console.log(`✅ Inserted: ${product.name}`);
      }
    }

    console.log("✅ Product population completed!");

    // Show summary
    const { data: totalProducts, error: countError } = await supabase
      .from("products")
      .select("*", { count: "exact" });

    if (!countError) {
      console.log(
        `📊 Total products in database: ${totalProducts?.length || 0}`
      );
    }
  } catch (error) {
    console.error("❌ Error populating products:", error);
  }
}

// Run the script
populateProducts();
