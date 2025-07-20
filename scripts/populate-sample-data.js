const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

// Initialize Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Sample data for testing
const sampleReceipts = [
  {
    store_name: "Countdown",
    total_amount: 87.45,
    date: "2024-01-15",
    ocr_data: {
      items: [
        { name: "Milk", price: 4.5, quantity: 2, category: "Dairy" },
        { name: "Bread", price: 3.99, quantity: 1, category: "Bakery" },
        { name: "Apples", price: 5.99, quantity: 1, category: "Produce" },
        { name: "Chicken Breast", price: 12.99, quantity: 1, category: "Meat" },
        { name: "Rice", price: 8.99, quantity: 1, category: "Pantry" },
        { name: "Tomatoes", price: 4.99, quantity: 1, category: "Produce" },
        { name: "Cheese", price: 6.99, quantity: 1, category: "Dairy" },
        { name: "Pasta", price: 3.99, quantity: 2, category: "Pantry" },
        { name: "Bananas", price: 3.99, quantity: 1, category: "Produce" },
        { name: "Yogurt", price: 4.99, quantity: 2, category: "Dairy" },
      ],
    },
    savings_identified: 12.5,
    cashback_earned: 2.15,
  },
  {
    store_name: "Pak'nSave",
    total_amount: 65.3,
    date: "2024-01-12",
    ocr_data: {
      items: [
        { name: "Ground Beef", price: 15.99, quantity: 1, category: "Meat" },
        { name: "Potatoes", price: 4.99, quantity: 1, category: "Produce" },
        { name: "Onions", price: 2.99, quantity: 1, category: "Produce" },
        { name: "Cereal", price: 5.99, quantity: 1, category: "Pantry" },
        {
          name: "Orange Juice",
          price: 4.99,
          quantity: 1,
          category: "Beverages",
        },
        { name: "Butter", price: 4.99, quantity: 1, category: "Dairy" },
        { name: "Eggs", price: 6.99, quantity: 1, category: "Dairy" },
        { name: "Lettuce", price: 2.99, quantity: 1, category: "Produce" },
        { name: "Cucumber", price: 1.99, quantity: 2, category: "Produce" },
        { name: "Chips", price: 3.99, quantity: 1, category: "Snacks" },
      ],
    },
    savings_identified: 8.75,
    cashback_earned: 1.3,
  },
  {
    store_name: "New World",
    total_amount: 112.8,
    date: "2024-01-10",
    ocr_data: {
      items: [
        { name: "Salmon", price: 18.99, quantity: 1, category: "Seafood" },
        { name: "Asparagus", price: 6.99, quantity: 1, category: "Produce" },
        { name: "Quinoa", price: 8.99, quantity: 1, category: "Pantry" },
        { name: "Avocado", price: 3.99, quantity: 2, category: "Produce" },
        { name: "Greek Yogurt", price: 5.99, quantity: 2, category: "Dairy" },
        { name: "Nuts", price: 12.99, quantity: 1, category: "Pantry" },
        { name: "Olive Oil", price: 9.99, quantity: 1, category: "Pantry" },
        { name: "Lemons", price: 3.99, quantity: 1, category: "Produce" },
        { name: "Garlic", price: 2.99, quantity: 1, category: "Produce" },
        { name: "Herbs", price: 3.99, quantity: 2, category: "Produce" },
      ],
    },
    savings_identified: 15.2,
    cashback_earned: 3.45,
  },
  {
    store_name: "Countdown",
    total_amount: 45.6,
    date: "2024-01-08",
    ocr_data: {
      items: [
        { name: "Milk", price: 4.5, quantity: 1, category: "Dairy" },
        { name: "Bread", price: 3.99, quantity: 1, category: "Bakery" },
        { name: "Eggs", price: 6.99, quantity: 1, category: "Dairy" },
        { name: "Bananas", price: 3.99, quantity: 1, category: "Produce" },
        { name: "Coffee", price: 12.99, quantity: 1, category: "Beverages" },
        { name: "Sugar", price: 2.99, quantity: 1, category: "Pantry" },
        { name: "Flour", price: 3.99, quantity: 1, category: "Pantry" },
        {
          name: "Vanilla Extract",
          price: 4.99,
          quantity: 1,
          category: "Pantry",
        },
      ],
    },
    savings_identified: 5.25,
    cashback_earned: 0.9,
  },
  {
    store_name: "Pak'nSave",
    total_amount: 78.9,
    date: "2024-01-05",
    ocr_data: {
      items: [
        { name: "Pork Chops", price: 16.99, quantity: 1, category: "Meat" },
        { name: "Broccoli", price: 4.99, quantity: 1, category: "Produce" },
        { name: "Carrots", price: 3.99, quantity: 1, category: "Produce" },
        { name: "Brown Rice", price: 6.99, quantity: 1, category: "Pantry" },
        { name: "Soy Sauce", price: 3.99, quantity: 1, category: "Pantry" },
        { name: "Ginger", price: 2.99, quantity: 1, category: "Produce" },
        {
          name: "Spring Onions",
          price: 2.99,
          quantity: 1,
          category: "Produce",
        },
        { name: "Chicken Stock", price: 3.99, quantity: 1, category: "Pantry" },
        { name: "Cornflour", price: 2.99, quantity: 1, category: "Pantry" },
        { name: "Sesame Oil", price: 4.99, quantity: 1, category: "Pantry" },
      ],
    },
    savings_identified: 10.15,
    cashback_earned: 1.75,
  },
];

async function populateSampleData() {
  try {
    console.log("🚀 Starting sample data population...");

    // First, let's get or create a test user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("No authenticated user found. Creating test user...");

      // Create a test user
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: "test@example.com",
          password: "testpassword123",
        });

      if (signUpError) {
        console.error("Error creating test user:", signUpError);
        return;
      }

      console.log("✅ Test user created:", signUpData.user?.email);
    } else {
      console.log("✅ Using existing user:", user.email);
    }

    // Get the current user
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) {
      console.error("No user available for data insertion");
      return;
    }

    // Insert sample receipts
    console.log("📝 Inserting sample receipts...");

    for (const receipt of sampleReceipts) {
      const { data, error } = await supabase
        .from("receipts")
        .insert({
          user_id: currentUser.id,
          ...receipt,
        })
        .select();

      if (error) {
        console.error("Error inserting receipt:", error);
      } else {
        console.log(
          `✅ Inserted receipt: ${receipt.store_name} - $${receipt.total_amount}`
        );
      }
    }

    // Insert sample price history data
    console.log("💰 Inserting sample price history...");

    const stores = ["Countdown", "Pak'nSave", "New World"];
    const items = ["Milk", "Bread", "Apples", "Chicken Breast", "Rice"];

    for (const item of items) {
      for (const store of stores) {
        // Generate some price history for the last 30 days
        for (let i = 0; i < 5; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i * 7); // Every week

          const basePrice = 5 + Math.random() * 10;
          const price = Math.round((basePrice + Math.random() * 2) * 100) / 100;

          const { error } = await supabase.from("price_history").insert({
            store_id: store.toLowerCase().replace(/\s+/g, "_"), // Simple store ID
            item_name: item,
            price: price,
            date: date.toISOString().split("T")[0],
            source: "receipt",
            confidence_score: 0.8 + Math.random() * 0.2,
          });

          if (error) {
            console.error("Error inserting price history:", error);
          }
        }
      }
    }

    console.log("✅ Sample data population completed!");
    console.log("📊 You can now test the real analytics in the app");
  } catch (error) {
    console.error("❌ Error populating sample data:", error);
  }
}

// Run the script
populateSampleData();
