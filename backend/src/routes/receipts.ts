import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { supabase } from "../lib/supabase";

export const receipts = new Hono()
  // GET /api/v1/receipts -> returns all receipts
  .get("/", async (c) => {
    // TODO: Get user from context
    const user_id = "123";

    const { data, error } = await supabase
      .from("receipts")
      .select("*")
      .eq("user_id", user_id);

    if (error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json(data);
  })

  // POST /api/v1/receipts -> creates a new receipt
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        store_name: z.string(),
        total_amount: z.number(),
        date: z.string().datetime(),
        items: z.array(
          z.object({
            name: z.string(),
            price: z.number(),
            quantity: z.number(),
          })
        ),
      })
    ),
    async (c) => {
      // This is the endpoint we need to modify.
      // For now, it just inserts the new receipt.
      const receiptData = c.req.valid("json");
      const user_id = "123"; // TODO: Get user from context

      // Get or create the store
      let { data: store, error: storeError } = await supabase
        .from("stores")
        .select("id")
        .ilike("name", receiptData.store_name) // Case-insensitive search
        .single();

      if (storeError && storeError.code !== "PGRST116") {
        // PGRST116 is "No rows found", which we expect if the store is new.
        return c.json(
          { error: "Error fetching store: " + storeError.message },
          500
        );
      }

      if (!store) {
        const { data: newStore, error: newStoreError } = await supabase
          .from("stores")
          .insert({ name: receiptData.store_name })
          .select("id")
          .single();

        if (newStoreError) {
          return c.json(
            { error: "Error creating store: " + newStoreError.message },
            500
          );
        }
        store = newStore;
      }

      const store_id = store.id;

      // 1. Insert the main receipt record
      const { data: newReceipt, error: receiptError } = await supabase
        .from("receipts")
        .insert({
          user_id: user_id,
          store_name: receiptData.store_name,
          store_id: store_id,
          total_amount: receiptData.total_amount,
          date: receiptData.date,
        })
        .select()
        .single();

      if (receiptError) {
        return c.json({ error: receiptError.message }, 500);
      }

      // 2. Insert the associated items
      const itemsToInsert = receiptData.items.map((item) => ({
        receipt_id: newReceipt.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("items")
        .insert(itemsToInsert);

      if (itemsError) {
        // TODO: Handle potential rollback of receipt insertion
        return c.json({ error: itemsError.message }, 500);
      }

      // This is where we will add the logic to populate price_history
      const priceHistoryToInsert = receiptData.items.map((item) => ({
        store_id: store_id,
        item_name: item.name, // TODO: This needs normalization
        price: item.price,
        date: receiptData.date,
        source: "receipt",
      }));

      const { error: priceHistoryError } = await supabase
        .from("price_history")
        .insert(priceHistoryToInsert);

      if (priceHistoryError) {
        // In a production app, you'd want more robust error handling,
        // maybe a background job to retry, or at least better logging.
        console.error("Failed to update price_history:", priceHistoryError);
      }

      return c.json(newReceipt, 201);
    }
  )

  // GET /api/v1/receipts/price-history/:itemName -> gets price history for an item
  .get("/price-history/:itemName", async (c) => {
    const itemName = c.req.param("itemName");

    const { data, error } = await supabase
      .from("price_history")
      .select(
        `
        price,
        date,
        source,
        store:stores (name)
      `
      )
      .ilike("item_name", `%${itemName}%`) // Use ilike for partial matching
      .order("date", { ascending: false });

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    if (!data || data.length === 0) {
      return c.json({ message: "No price history found for this item." }, 404);
    }

    // The data is shaped like: { price, date, source, store: { name } }
    // Let's flatten it for a cleaner API response
    const flattenedData = data.map((d) => ({
      price: d.price,
      date: d.date,
      source: d.source,
      store_name: d.store.name,
    }));

    return c.json(flattenedData);
  });
