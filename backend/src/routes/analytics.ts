import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createSupabaseClient } from "../lib/supabase";

// Define user type
interface User {
  id: string;
  email: string;
  is_premium: boolean;
}

const analytics = new Hono();

// Get user spending analytics
analytics.get("/spending", async (c) => {
  const user = c.get("user");
  const supabaseClient = createSupabaseClient(c.env);

  try {
    // Get total spending
    const { data: totalSpending, error: totalError } = await supabaseClient
      .from("receipts")
      .select("total_amount")
      .eq("user_id", user.id);

    if (totalError) {
      return c.json({ error: "Failed to fetch spending data" }, 500);
    }

    const total =
      totalSpending?.reduce((sum, receipt) => sum + receipt.total_amount, 0) ||
      0;

    // Get spending by category
    const { data: categorySpending, error: categoryError } =
      await supabaseClient
        .from("receipts")
        .select(
          `
        total_amount,
        ocr_data,
        category:categories(name, color)
      `
        )
        .eq("user_id", user.id)
        .not("ocr_data", "is", null);

    if (categoryError) {
      return c.json({ error: "Failed to fetch category data" }, 500);
    }

    // Process category breakdown from OCR data
    const categoryBreakdown = new Map<
      string,
      { amount: number; count: number; color?: string }
    >();

    categorySpending?.forEach((receipt) => {
      if (receipt.ocr_data?.items) {
        receipt.ocr_data.items.forEach((item: any) => {
          const category = item.category || "Uncategorized";
          const existing = categoryBreakdown.get(category) || {
            amount: 0,
            count: 0,
            color: receipt.category?.color,
          };
          existing.amount += item.price * (item.quantity || 1);
          existing.count += 1;
          categoryBreakdown.set(category, existing);
        });
      }
    });

    // Get weekly spending for trends
    const { data: weeklySpending, error: weeklyError } = await supabaseClient
      .from("receipts")
      .select("total_amount, date")
      .eq("user_id", user.id)
      .gte(
        "date",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      )
      .order("date", { ascending: true });

    if (weeklyError) {
      return c.json({ error: "Failed to fetch weekly data" }, 500);
    }

    // Group by week
    const weeklyData = new Map<string, number>();
    weeklySpending?.forEach((receipt) => {
      const weekStart = new Date(receipt.date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      weeklyData.set(
        weekKey,
        (weeklyData.get(weekKey) || 0) + receipt.total_amount
      );
    });

    return c.json({
      totalSpending: total,
      categoryBreakdown: Array.from(categoryBreakdown.entries()).map(
        ([name, data]) => ({
          name,
          amount: data.amount,
          count: data.count,
          color: data.color,
          percentage: (data.amount / total) * 100,
        })
      ),
      weeklyTrends: Array.from(weeklyData.entries()).map(([week, amount]) => ({
        week,
        amount,
      })),
      receiptCount: totalSpending?.length || 0,
      averageSpend: totalSpending?.length ? total / totalSpending.length : 0,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get price comparison for an item
analytics.get("/price-comparison/:item", async (c) => {
  const itemName = c.req.param("item");
  const user = c.get("user");
  const supabaseClient = createSupabaseClient(c.env);

  try {
    // Get price history for this item across all stores
    const { data: priceHistory, error: priceError } = await supabaseClient
      .from("price_history")
      .select(
        `
        price,
        date,
        store:stores(name, location)
      `
      )
      .ilike("item_name", `%${itemName}%`)
      .order("date", { ascending: false })
      .limit(50);

    if (priceError) {
      return c.json({ error: "Failed to fetch price data" }, 500);
    }

    // Group by store and calculate averages
    const storePrices = new Map<
      string,
      { prices: number[]; store: any; lastUpdated: string }
    >();

    priceHistory?.forEach((record) => {
      const storeName = record.store?.name || "Unknown Store";
      const existing = storePrices.get(storeName) || {
        prices: [],
        store: record.store,
        lastUpdated: record.date,
      };
      existing.prices.push(record.price);
      if (record.date > existing.lastUpdated) {
        existing.lastUpdated = record.date;
      }
      storePrices.set(storeName, existing);
    });

    // Calculate statistics for each store
    const comparison = Array.from(storePrices.entries()).map(
      ([storeName, data]) => {
        const avgPrice =
          data.prices.reduce((sum, price) => sum + price, 0) /
          data.prices.length;
        const minPrice = Math.min(...data.prices);
        const maxPrice = Math.max(...data.prices);

        return {
          storeName,
          averagePrice: avgPrice,
          minPrice,
          maxPrice,
          priceCount: data.prices.length,
          lastUpdated: data.lastUpdated,
          store: data.store,
        };
      }
    );

    // Sort by average price (best deals first)
    comparison.sort((a, b) => a.averagePrice - b.averagePrice);

    return c.json(comparison);
  } catch (error) {
    console.error("Price comparison error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get price history for an item
analytics.get("/price-history/:item", async (c) => {
  const itemName = c.req.param("item");
  const supabaseClient = createSupabaseClient(c.env);

  try {
    const { data: priceHistory, error } = await supabaseClient
      .from("price_history")
      .select(
        `
        price,
        date,
        store:stores(name)
      `
      )
      .ilike("item_name", `%${itemName}%`)
      .order("date", { ascending: true })
      .limit(100);

    if (error) {
      return c.json({ error: "Failed to fetch price history" }, 500);
    }

    return c.json(
      priceHistory?.map((record) => ({
        price: record.price,
        date: record.date,
        store: record.store?.name,
      })) || []
    );
  } catch (error) {
    console.error("Price history error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get store analytics
analytics.get("/stores", async (c) => {
  const user = c.get("user");
  const supabaseClient = createSupabaseClient(c.env);

  try {
    // Get spending by store
    const { data: storeSpending, error } = await supabaseClient
      .from("receipts")
      .select("store_name, total_amount, date")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      return c.json({ error: "Failed to fetch store data" }, 500);
    }

    // Group by store
    const storeAnalytics = new Map<
      string,
      {
        totalSpent: number;
        visitCount: number;
        lastVisit: string;
        averageSpend: number;
      }
    >();

    storeSpending?.forEach((receipt) => {
      const existing = storeAnalytics.get(receipt.store_name) || {
        totalSpent: 0,
        visitCount: 0,
        lastVisit: receipt.date,
        averageSpend: 0,
      };

      existing.totalSpent += receipt.total_amount;
      existing.visitCount += 1;
      if (receipt.date > existing.lastVisit) {
        existing.lastVisit = receipt.date;
      }
      existing.averageSpend = existing.totalSpent / existing.visitCount;

      storeAnalytics.set(receipt.store_name, existing);
    });

    const analytics = Array.from(storeAnalytics.entries()).map(
      ([storeName, data]) => ({
        storeName,
        ...data,
      })
    );

    // Sort by total spent
    analytics.sort((a, b) => b.totalSpent - a.totalSpent);

    return c.json(analytics);
  } catch (error) {
    console.error("Store analytics error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get savings insights
analytics.get("/savings", async (c) => {
  const user = c.get("user");
  const supabaseClient = createSupabaseClient(c.env);

  try {
    // Get receipts with savings identified
    const { data: receipts, error } = await supabaseClient
      .from("receipts")
      .select("savings_identified, cashback_earned, total_amount, date")
      .eq("user_id", user.id)
      .not("savings_identified", "is", null);

    if (error) {
      return c.json({ error: "Failed to fetch savings data" }, 500);
    }

    const totalSavings =
      receipts?.reduce(
        (sum, receipt) => sum + (receipt.savings_identified || 0),
        0
      ) || 0;
    const totalCashback =
      receipts?.reduce(
        (sum, receipt) => sum + (receipt.cashback_earned || 0),
        0
      ) || 0;
    const totalSpent =
      receipts?.reduce((sum, receipt) => sum + receipt.total_amount, 0) || 0;

    return c.json({
      totalSavings,
      totalCashback,
      totalSpent,
      savingsPercentage: totalSpent > 0 ? (totalSavings / totalSpent) * 100 : 0,
      receiptCount: receipts?.length || 0,
      averageSavings: receipts?.length ? totalSavings / receipts.length : 0,
    });
  } catch (error) {
    console.error("Savings analytics error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export { analytics };
