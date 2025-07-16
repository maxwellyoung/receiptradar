import { dbService } from "@/services/supabase";

export const initializeDatabase = async () => {
  try {
    console.log("Initializing database with sample data...");

    // Check if categories already exist
    const { data: existingCategories } = await dbService.getCategories();

    if (!existingCategories || existingCategories.length === 0) {
      console.log("Seeding categories...");
      await dbService.seedCategories();
    }

    // Check if stores already exist
    const { data: existingStores } = await dbService.getStores();

    if (!existingStores || existingStores.length === 0) {
      console.log("Seeding stores...");
      await dbService.seedStores();
    }

    console.log("Database initialization complete!");
    return { success: true };
  } catch (error) {
    console.error("Error initializing database:", error);
    return { success: false, error };
  }
};

export const createSampleReceipts = async (userId: string) => {
  try {
    console.log("Creating sample receipts...");

    const sampleReceipts = [
      {
        user_id: userId,
        store_name: "Countdown",
        total_amount: 87.45,
        date: new Date().toISOString().slice(0, 10),
        ocr_data: {
          items: [
            {
              name: "Bread White 700g",
              price: 3.5,
              quantity: 1,
              category: "Pantry",
            },
            { name: "Milk 2L", price: 4.2, quantity: 1, category: "Dairy" },
            {
              name: "Apple Red 1kg",
              price: 5.99,
              quantity: 1,
              category: "Fresh Produce",
            },
            {
              name: "Chicken Breast 500g",
              price: 8.5,
              quantity: 1,
              category: "Meat",
            },
            {
              name: "Yogurt Natural 500g",
              price: 3.99,
              quantity: 2,
              category: "Dairy",
            },
            {
              name: "Bananas 1kg",
              price: 4.5,
              quantity: 1,
              category: "Fresh Produce",
            },
            {
              name: "Pasta 500g",
              price: 2.99,
              quantity: 2,
              category: "Pantry",
            },
            {
              name: "Tomatoes 500g",
              price: 3.99,
              quantity: 1,
              category: "Fresh Produce",
            },
            {
              name: "Cheese Cheddar 250g",
              price: 4.99,
              quantity: 1,
              category: "Dairy",
            },
            {
              name: "Ground Beef 500g",
              price: 12.99,
              quantity: 1,
              category: "Meat",
            },
            {
              name: "Onions 1kg",
              price: 2.99,
              quantity: 1,
              category: "Fresh Produce",
            },
            { name: "Rice 1kg", price: 3.99, quantity: 1, category: "Pantry" },
            { name: "Eggs 12pk", price: 6.99, quantity: 1, category: "Dairy" },
            {
              name: "Potatoes 2kg",
              price: 5.99,
              quantity: 1,
              category: "Fresh Produce",
            },
            {
              name: "Cereal 500g",
              price: 4.99,
              quantity: 1,
              category: "Pantry",
            },
          ],
          subtotal: 82.19,
          tax: 5.26,
          receipt_number: "12345",
          validation: { is_valid: true, warnings: [], errors: [] },
          processing_time: 2.45,
        },
        savings_identified: 12.5,
        cashback_earned: 2.25,
      },
      {
        user_id: userId,
        store_name: "New World",
        total_amount: 156.8,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // 2 days ago
        ocr_data: {
          items: [
            {
              name: "Salmon Fillet 400g",
              price: 18.99,
              quantity: 1,
              category: "Meat",
            },
            {
              name: "Avocado 4pk",
              price: 6.99,
              quantity: 1,
              category: "Fresh Produce",
            },
            {
              name: "Greek Yogurt 500g",
              price: 5.99,
              quantity: 2,
              category: "Dairy",
            },
            {
              name: "Quinoa 500g",
              price: 8.99,
              quantity: 1,
              category: "Pantry",
            },
            {
              name: "Spinach 250g",
              price: 3.99,
              quantity: 2,
              category: "Fresh Produce",
            },
            {
              name: "Almond Milk 1L",
              price: 4.99,
              quantity: 2,
              category: "Beverages",
            },
            {
              name: "Chia Seeds 200g",
              price: 7.99,
              quantity: 1,
              category: "Pantry",
            },
            {
              name: "Sweet Potato 1kg",
              price: 4.99,
              quantity: 1,
              category: "Fresh Produce",
            },
            {
              name: "Coconut Oil 500ml",
              price: 12.99,
              quantity: 1,
              category: "Pantry",
            },
            {
              name: "Blueberries 200g",
              price: 5.99,
              quantity: 2,
              category: "Fresh Produce",
            },
            { name: "Oats 1kg", price: 4.99, quantity: 1, category: "Pantry" },
            {
              name: "Honey 500g",
              price: 8.99,
              quantity: 1,
              category: "Pantry",
            },
            {
              name: "Lemon 4pk",
              price: 3.99,
              quantity: 1,
              category: "Fresh Produce",
            },
            {
              name: "Garlic 3pk",
              price: 2.99,
              quantity: 1,
              category: "Fresh Produce",
            },
            {
              name: "Olive Oil 500ml",
              price: 9.99,
              quantity: 1,
              category: "Pantry",
            },
          ],
          subtotal: 148.85,
          tax: 7.95,
          receipt_number: "67890",
          validation: { is_valid: true, warnings: [], errors: [] },
          processing_time: 3.12,
        },
        savings_identified: 8.75,
        cashback_earned: 1.5,
      },
      {
        user_id: userId,
        store_name: "Pak'nSave",
        total_amount: 67.3,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // 5 days ago
        ocr_data: {
          items: [
            { name: "Milk 3L", price: 5.99, quantity: 1, category: "Dairy" },
            {
              name: "Bread Wholemeal 700g",
              price: 3.99,
              quantity: 1,
              category: "Pantry",
            },
            { name: "Eggs 18pk", price: 8.99, quantity: 1, category: "Dairy" },
            {
              name: "Bananas 2kg",
              price: 5.99,
              quantity: 1,
              category: "Fresh Produce",
            },
            {
              name: "Pasta Sauce 500g",
              price: 2.99,
              quantity: 2,
              category: "Pantry",
            },
            {
              name: "Frozen Peas 500g",
              price: 3.99,
              quantity: 1,
              category: "Frozen",
            },
            {
              name: "Cheddar Cheese 500g",
              price: 8.99,
              quantity: 1,
              category: "Dairy",
            },
            {
              name: "Carrots 1kg",
              price: 2.99,
              quantity: 1,
              category: "Fresh Produce",
            },
            {
              name: "Cereal 750g",
              price: 5.99,
              quantity: 1,
              category: "Pantry",
            },
            {
              name: "Orange Juice 2L",
              price: 4.99,
              quantity: 1,
              category: "Beverages",
            },
            {
              name: "Chicken Thighs 1kg",
              price: 12.99,
              quantity: 1,
              category: "Meat",
            },
            {
              name: "Onions 1kg",
              price: 2.99,
              quantity: 1,
              category: "Fresh Produce",
            },
          ],
          subtotal: 63.88,
          tax: 3.42,
          receipt_number: "11111",
          validation: { is_valid: true, warnings: [], errors: [] },
          processing_time: 2.78,
        },
        savings_identified: 15.2,
        cashback_earned: 3.75,
      },
    ];

    for (const receipt of sampleReceipts) {
      await dbService.createReceipt(receipt);
    }

    console.log("Sample receipts created successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error creating sample receipts:", error);
    return { success: false, error };
  }
};
