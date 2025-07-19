import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createSupabaseClient } from "@/lib/supabase";
let nanoid: () => string;
(async () => {
  nanoid = (await import("nanoid")).nanoid;
})();

type User = {
  id: string;
  email: string;
};

type Env = {
  Variables: {
    user: User;
  };
  Bindings: {
    R2_BUCKET: R2Bucket;
  };
};

const receipts = new Hono<Env>();

const receiptSchema = z.object({
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
});

receipts.post("/", zValidator("json", receiptSchema), async (c) => {
  const receiptData = c.req.valid("json");
  const user = c.get("user");
  const supabaseClient = createSupabaseClient(c.env);

  // 1. Find or create the store
  let { data: store, error: storeError } = await supabaseClient
    .from("stores")
    .select("id")
    .ilike("name", receiptData.store_name) // Case-insensitive search
    .single();

  if (storeError && storeError.code !== "PGRST116") {
    // Ignore 'not found' error
    return c.json({ error: "Error fetching store" }, 500);
  }
  if (!store) {
    const { data: newStore, error: newStoreError } = await supabaseClient
      .from("stores")
      .insert({ name: receiptData.store_name })
      .select("id")
      .single();
    if (newStoreError) {
      return c.json({ error: "Error creating store" }, 500);
    }
    store = newStore;
  }

  // 2. Create the receipt
  const { data: newReceipt, error: receiptError } = await supabaseClient
    .from("receipts")
    .insert({
      user_id: user.id,
      store_id: store.id,
      store_name: receiptData.store_name,
      total_amount: receiptData.total_amount,
      date: receiptData.date,
    })
    .select("id")
    .single();

  if (receiptError) {
    return c.json({ error: "Error creating receipt" }, 500);
  }

  // 3. Insert receipt items
  const itemsToInsert = receiptData.items.map((item: any) => ({
    receipt_id: newReceipt.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabaseClient
    .from("receipt_items")
    .insert(itemsToInsert);

  if (itemsError) {
    return c.json({ error: "Error creating receipt items" }, 500);
  }

  // 4. Update price history (best-effort, could be a background job)
  const priceHistoryToInsert = receiptData.items.map((item: any) => ({
    store_id: store!.id,
    item_name: item.name,
    price: item.price,
    date: receiptData.date,
  }));

  await supabaseClient.from("price_history").insert(priceHistoryToInsert);

  return c.json(newReceipt, 201);
});

receipts.get("/", async (c) => {
  const user = c.get("user");
  const supabaseClient = createSupabaseClient(c.env);

  const { data, error } = await supabaseClient
    .from("receipts")
    .select(
      `
      id,
      date,
      total_amount,
      store:stores (
        name
      )
    `
    )
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  // Manual mapping because Supabase returns store as an object
  const formattedData = data.map((d: any) => ({
    id: d.id,
    date: d.date,
    total_amount: d.total_amount,
    store_name: d.store.name,
  }));

  return c.json(formattedData);
});

// Get a presigned URL for uploading a receipt image
receipts.get("/upload-url", async (c) => {
  const user = c.get("user");
  const supabaseClient = createSupabaseClient(c.env);
  const r2 = c.env.R2_BUCKET;

  const key = `${user.id}/${(await import("nanoid")).nanoid()}.jpg`;

  // In a real app, you would use a more robust method for presigned URLs
  // This is a simplified example
  const presignedUrl = "https://your-r2-bucket-url.com/" + key; // This is a placeholder

  return c.json({
    url: presignedUrl,
    key: key,
  });
});

export { receipts };
