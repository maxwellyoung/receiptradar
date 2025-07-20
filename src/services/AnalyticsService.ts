import { Receipt, Product, Store } from "@/types";

export interface SpendingPattern {
  category: string;
  totalSpent: number;
  averageSpent: number;
  frequency: number;
  trend: "increasing" | "decreasing" | "stable";
  percentageChange: number;
}

export interface SavingsInsight {
  type: "opportunity" | "achievement" | "trend" | "recommendation";
  title: string;
  description: string;
  impact: number;
  confidence: number;
  actionable: boolean;
  category: string;
  priority: "high" | "medium" | "low";
}

export interface PricePrediction {
  productId: string;
  productName: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  timeframe: "week" | "month" | "quarter";
  factors: string[];
  recommendation: "buy" | "wait" | "stock-up";
}

export interface SpendingReport {
  period: "week" | "month" | "quarter" | "year";
  totalSpent: number;
  totalSaved: number;
  savingsRate: number;
  topCategories: SpendingPattern[];
  topStores: { store: string; spent: number; saved: number }[];
  insights: SavingsInsight[];
  trends: { category: string; trend: string; change: number }[];
  recommendations: string[];
}

export interface BudgetAnalysis {
  category: string;
  budgeted: number;
  actual: number;
  remaining: number;
  status: "under" | "over" | "on-track";
  recommendations: string[];
}

export interface SeasonalTrend {
  category: string;
  seasonalPattern: { month: number; averageSpent: number }[];
  peakMonths: number[];
  lowMonths: number[];
  recommendations: string[];
}

export interface StoreComparison {
  storeName: string;
  averagePrice: number;
  priceVariance: number;
  savingsOpportunity: number;
  productCount: number;
  recommendation: "preferred" | "avoid" | "selective";
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private receipts: Receipt[] = [];
  private products: Product[] = [];
  private stores: Store[] = [];

  private constructor() {
    this.initializeMockData();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Analyze spending patterns by category
   */
  async getSpendingPatterns(
    userId: string,
    period: "month" | "quarter" | "year" = "month"
  ): Promise<SpendingPattern[]> {
    const userReceipts = this.receipts.filter((r) => r.user_id === userId);
    const patterns: Map<string, SpendingPattern> = new Map();

    // Group by category and analyze
    userReceipts.forEach((receipt) => {
      // Mock items data since Receipt type doesn't include items
      const mockItems = [
        { id: "1", name: "Milk 2L", price: 4.5, category: "Dairy" },
        { id: "2", name: "Bread", price: 3.2, category: "Bakery" },
        { id: "3", name: "Bananas 1kg", price: 2.5, category: "Produce" },
      ];

      mockItems.forEach((item) => {
        const category = item.category || "Other";
        const existing = patterns.get(category);

        if (existing) {
          existing.totalSpent += item.price;
          existing.frequency += 1;
        } else {
          patterns.set(category, {
            category,
            totalSpent: item.price,
            averageSpent: item.price,
            frequency: 1,
            trend: "stable",
            percentageChange: 0,
          });
        }
      });
    });

    // Calculate averages and trends
    patterns.forEach((pattern) => {
      pattern.averageSpent = pattern.totalSpent / pattern.frequency;
      pattern.trend = this.calculateTrend(pattern.category, userId);
      pattern.percentageChange = this.calculatePercentageChange(
        pattern.category,
        userId
      );
    });

    return Array.from(patterns.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent
    );
  }

  /**
   * Generate personalized savings insights
   */
  async getSavingsInsights(userId: string): Promise<SavingsInsight[]> {
    const insights: SavingsInsight[] = [];
    const patterns = await this.getSpendingPatterns(userId);

    // Analyze spending patterns for opportunities
    patterns.forEach((pattern) => {
      if (pattern.totalSpent > 200) {
        insights.push({
          type: "opportunity",
          title: `High ${pattern.category} Spending`,
          description: `You're spending $${pattern.totalSpent.toFixed(2)} on ${
            pattern.category
          }. Consider bulk buying or switching stores.`,
          impact: pattern.totalSpent * 0.15, // 15% potential savings
          confidence: 0.85,
          actionable: true,
          category: pattern.category,
          priority: "high",
        });
      }
    });

    // Add trend-based insights
    const increasingCategories = patterns.filter(
      (p) => p.trend === "increasing"
    );
    increasingCategories.forEach((pattern) => {
      insights.push({
        type: "trend",
        title: `${pattern.category} Spending Increasing`,
        description: `Your ${pattern.category} spending is trending up. Review if this aligns with your budget.`,
        impact: pattern.totalSpent * 0.1,
        confidence: 0.75,
        actionable: true,
        category: pattern.category,
        priority: "medium",
      });
    });

    // Add store optimization insights
    const storeInsights = await this.getStoreOptimizationInsights(userId);
    insights.push(...storeInsights);

    return insights.sort((a, b) => b.impact - a.impact);
  }

  /**
   * Predict future prices for products
   */
  async getPricePredictions(
    userId: string,
    productIds?: string[]
  ): Promise<PricePrediction[]> {
    const predictions: PricePrediction[] = [];
    const userProducts = productIds
      ? this.products.filter((p) => productIds.includes(p.id))
      : this.products.slice(0, 10); // Top 10 products

    userProducts.forEach((product) => {
      const historicalPrices = this.getHistoricalPrices(product.id);
      const prediction = this.calculatePricePrediction(
        product,
        historicalPrices
      );
      predictions.push(prediction);
    });

    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generate comprehensive spending report
   */
  async getSpendingReport(
    userId: string,
    period: "week" | "month" | "quarter" | "year" = "month"
  ): Promise<SpendingReport> {
    const userReceipts = this.receipts.filter((r) => r.user_id === userId);
    const totalSpent = userReceipts.reduce((sum, r) => sum + r.total, 0);
    const totalSaved = userReceipts.reduce((sum, r) => sum + r.total * 0.15, 0); // Mock 15% savings
    const savingsRate = totalSpent > 0 ? (totalSaved / totalSpent) * 100 : 0;

    const patterns = await this.getSpendingPatterns(
      userId,
      period === "week" ? "month" : period
    );
    const insights = await this.getSavingsInsights(userId);
    const storeAnalysis = await this.getStoreAnalysis(userId);
    const trends = await this.getTrendAnalysis(userId);

    const recommendations = this.generateRecommendations(
      patterns,
      insights,
      storeAnalysis
    );

    return {
      period,
      totalSpent,
      totalSaved,
      savingsRate,
      topCategories: patterns.slice(0, 5),
      topStores: storeAnalysis.slice(0, 5),
      insights: insights.slice(0, 5),
      trends,
      recommendations,
    };
  }

  /**
   * Analyze budget vs actual spending
   */
  async getBudgetAnalysis(
    userId: string,
    budget: { [category: string]: number }
  ): Promise<BudgetAnalysis[]> {
    const patterns = await this.getSpendingPatterns(userId);
    const analysis: BudgetAnalysis[] = [];

    patterns.forEach((pattern) => {
      const budgeted = budget[pattern.category] || 0;
      const actual = pattern.totalSpent;
      const remaining = budgeted - actual;
      const status =
        remaining > 0 ? "under" : remaining < 0 ? "over" : "on-track";

      const recommendations: string[] = [];
      if (status === "over") {
        recommendations.push(
          `Consider reducing ${pattern.category} spending by $${Math.abs(
            remaining
          ).toFixed(2)}`
        );
        recommendations.push(`Look for deals and bulk buying opportunities`);
      } else if (status === "under") {
        recommendations.push(
          `You're under budget by $${remaining.toFixed(2)} - great job!`
        );
      }

      analysis.push({
        category: pattern.category,
        budgeted,
        actual,
        remaining,
        status,
        recommendations,
      });
    });

    return analysis;
  }

  /**
   * Analyze seasonal spending patterns
   */
  async getSeasonalTrends(userId: string): Promise<SeasonalTrend[]> {
    const userReceipts = this.receipts.filter((r) => r.user_id === userId);
    const seasonalData: Map<string, { [month: number]: number[] }> = new Map();

    // Group spending by category and month
    userReceipts.forEach((receipt) => {
      const month = new Date(receipt.ts).getMonth();
      // Mock items data for seasonal analysis
      const mockItems = [
        { category: "Dairy", price: receipt.total * 0.3 },
        { category: "Produce", price: receipt.total * 0.25 },
        { category: "Meat", price: receipt.total * 0.25 },
        { category: "Pantry", price: receipt.total * 0.2 },
      ];

      mockItems.forEach((item) => {
        const category = item.category || "Other";
        if (!seasonalData.has(category)) {
          seasonalData.set(category, {});
        }
        if (!seasonalData.get(category)![month]) {
          seasonalData.get(category)![month] = [];
        }
        seasonalData.get(category)![month].push(item.price);
      });
    });

    const trends: SeasonalTrend[] = [];
    seasonalData.forEach((monthlyData, category) => {
      const seasonalPattern = Array.from({ length: 12 }, (_, month) => {
        const prices = monthlyData[month] || [];
        return {
          month,
          averageSpent:
            prices.length > 0
              ? prices.reduce((a, b) => a + b, 0) / prices.length
              : 0,
        };
      });

      const peakMonths = seasonalPattern
        .map((p, i) => ({ month: i, avg: p.averageSpent }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 3)
        .map((p) => p.month);

      const lowMonths = seasonalPattern
        .map((p, i) => ({ month: i, avg: p.averageSpent }))
        .sort((a, b) => a.avg - b.avg)
        .slice(0, 3)
        .map((p) => p.month);

      const recommendations = this.generateSeasonalRecommendations(
        category,
        peakMonths,
        lowMonths
      );

      trends.push({
        category,
        seasonalPattern,
        peakMonths,
        lowMonths,
        recommendations,
      });
    });

    return trends;
  }

  /**
   * Compare stores for price optimization
   */
  async getStoreComparison(userId: string): Promise<StoreComparison[]> {
    const userReceipts = this.receipts.filter((r) => r.user_id === userId);
    const storeData: Map<string, { prices: number[]; totalSpent: number }> =
      new Map();

    // Collect price data by store
    userReceipts.forEach((receipt) => {
      const storeName = receipt.store?.name || "Unknown Store";
      if (!storeData.has(storeName)) {
        storeData.set(storeName, { prices: [], totalSpent: 0 });
      }

      // Mock items data for store comparison
      const mockItems = [
        { price: receipt.total * 0.3 },
        { price: receipt.total * 0.25 },
        { price: receipt.total * 0.25 },
        { price: receipt.total * 0.2 },
      ];

      mockItems.forEach((item) => {
        storeData.get(storeName)!.prices.push(item.price);
        storeData.get(storeName)!.totalSpent += item.price;
      });
    });

    const comparisons: StoreComparison[] = [];
    storeData.forEach((data, storeName) => {
      const averagePrice =
        data.prices.reduce((a, b) => a + b, 0) / data.prices.length;
      const priceVariance = this.calculateVariance(data.prices);
      const savingsOpportunity = this.calculateSavingsOpportunity(
        storeName,
        averagePrice
      );

      let recommendation: "preferred" | "avoid" | "selective";
      if (averagePrice < 10 && priceVariance < 2) {
        recommendation = "preferred";
      } else if (averagePrice > 20 && priceVariance > 5) {
        recommendation = "avoid";
      } else {
        recommendation = "selective";
      }

      comparisons.push({
        storeName,
        averagePrice,
        priceVariance,
        savingsOpportunity,
        productCount: data.prices.length,
        recommendation,
      });
    });

    return comparisons.sort((a, b) => a.averagePrice - b.averagePrice);
  }

  // Private helper methods

  private initializeMockData(): void {
    // Mock receipts data
    this.receipts = [
      {
        id: "1",
        user_id: "current-user",
        store_id: "1",
        ts: new Date(Date.now() - 86400000).toISOString(),
        total: 85.5,
        raw_url: "",
        created_at: new Date().toISOString(),
        store: {
          id: "1",
          name: "Countdown",
          chain: "Countdown",
          lat: -36.8485,
          lon: 174.7633,
          created_at: new Date().toISOString(),
        },
      },
      {
        id: "2",
        user_id: "current-user",
        store_id: "2",
        ts: new Date(Date.now() - 172800000).toISOString(),
        total: 120.75,
        raw_url: "",
        created_at: new Date().toISOString(),
        store: {
          id: "2",
          name: "New World",
          chain: "New World",
          lat: -41.2866,
          lon: 174.7756,
          created_at: new Date().toISOString(),
        },
      },
      {
        id: "3",
        user_id: "current-user",
        store_id: "3",
        ts: new Date(Date.now() - 259200000).toISOString(),
        total: 95.3,
        raw_url: "",
        created_at: new Date().toISOString(),
        store: {
          id: "3",
          name: "Pak'nSave",
          chain: "Pak'nSave",
          lat: -43.532,
          lon: 172.6306,
          created_at: new Date().toISOString(),
        },
      },
    ];

    // Mock products data
    this.products = [
      {
        id: "milk-1",
        name: "Anchor Milk 2L",
        price: 4.5,
        storeId: "1",
        category: "Dairy",
        created_at: new Date().toISOString(),
      },
      {
        id: "bread-1",
        name: "Vogel's Bread",
        price: 3.2,
        storeId: "1",
        category: "Bakery",
        created_at: new Date().toISOString(),
      },
      {
        id: "bananas-1",
        name: "Bananas 1kg",
        price: 2.5,
        storeId: "1",
        category: "Produce",
        created_at: new Date().toISOString(),
      },
      {
        id: "chicken-1",
        name: "Chicken Breast 500g",
        price: 12.0,
        storeId: "1",
        category: "Meat",
        created_at: new Date().toISOString(),
      },
    ];

    // Mock stores data
    this.stores = [
      {
        id: "1",
        name: "Countdown",
        chain: "Countdown",
        lat: -36.8485,
        lon: 174.7633,
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        name: "New World",
        chain: "New World",
        lat: -41.2866,
        lon: 174.7756,
        created_at: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Pak'nSave",
        chain: "Pak'nSave",
        lat: -43.532,
        lon: 172.6306,
        created_at: new Date().toISOString(),
      },
    ];
  }

  private calculateTrend(
    category: string,
    userId: string
  ): "increasing" | "decreasing" | "stable" {
    // Mock trend calculation
    const trends = ["increasing", "decreasing", "stable"];
    return trends[Math.floor(Math.random() * trends.length)] as any;
  }

  private calculatePercentageChange(category: string, userId: string): number {
    // Mock percentage change calculation
    return (Math.random() - 0.5) * 20; // -10% to +10%
  }

  private async getStoreOptimizationInsights(
    userId: string
  ): Promise<SavingsInsight[]> {
    const comparisons = await this.getStoreComparison(userId);
    const insights: SavingsInsight[] = [];

    comparisons.forEach((store) => {
      if (store.savingsOpportunity > 10) {
        insights.push({
          type: "opportunity",
          title: `Switch to ${store.storeName}`,
          description: `You could save $${store.savingsOpportunity.toFixed(
            2
          )} by shopping at ${store.storeName} more often.`,
          impact: store.savingsOpportunity,
          confidence: 0.8,
          actionable: true,
          category: "Store Optimization",
          priority: "high",
        });
      }
    });

    return insights;
  }

  private getHistoricalPrices(productId: string): number[] {
    // Mock historical prices
    return [4.5, 4.2, 4.8, 4.3, 4.6, 4.4, 4.7];
  }

  private calculatePricePrediction(
    product: Product,
    historicalPrices: number[]
  ): PricePrediction {
    const currentPrice = product.price;
    const averagePrice =
      historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length;
    const trend =
      historicalPrices[historicalPrices.length - 1] - historicalPrices[0];

    let predictedPrice = currentPrice;
    let recommendation: "buy" | "wait" | "stock-up" = "wait";

    if (trend > 0.5) {
      predictedPrice = currentPrice * 1.1;
      recommendation = "stock-up";
    } else if (trend < -0.5) {
      predictedPrice = currentPrice * 0.9;
      recommendation = "wait";
    } else {
      predictedPrice = averagePrice;
      recommendation = "buy";
    }

    return {
      productId: product.id,
      productName: product.name,
      currentPrice,
      predictedPrice,
      confidence: 0.75,
      timeframe: "week",
      factors: ["Historical trend", "Seasonal patterns", "Market demand"],
      recommendation,
    };
  }

  private async getStoreAnalysis(
    userId: string
  ): Promise<{ store: string; spent: number; saved: number }[]> {
    const userReceipts = this.receipts.filter((r) => r.user_id === userId);
    const storeData: Map<string, { spent: number; saved: number }> = new Map();

    userReceipts.forEach((receipt) => {
      const storeName = receipt.store?.name || "Unknown Store";
      const existing = storeData.get(storeName);
      if (existing) {
        existing.spent += receipt.total;
        existing.saved += receipt.total * 0.15; // Mock 15% savings
      } else {
        storeData.set(storeName, {
          spent: receipt.total,
          saved: receipt.total * 0.15, // Mock 15% savings
        });
      }
    });

    return Array.from(storeData.entries()).map(([store, data]) => ({
      store,
      spent: data.spent,
      saved: data.saved,
    }));
  }

  private async getTrendAnalysis(
    userId: string
  ): Promise<{ category: string; trend: string; change: number }[]> {
    const patterns = await this.getSpendingPatterns(userId);
    return patterns.map((pattern) => ({
      category: pattern.category,
      trend: pattern.trend,
      change: pattern.percentageChange,
    }));
  }

  private generateRecommendations(
    patterns: SpendingPattern[],
    insights: SavingsInsight[],
    storeAnalysis: { store: string; spent: number; saved: number }[]
  ): string[] {
    const recommendations: string[] = [];

    // High spending categories
    const highSpending = patterns.filter((p) => p.totalSpent > 100);
    if (highSpending.length > 0) {
      recommendations.push(
        `Consider bulk buying for ${highSpending[0].category} to save money`
      );
    }

    // Store optimization
    if (storeAnalysis.length > 1) {
      const bestStore = storeAnalysis.reduce((a, b) =>
        b.saved / b.spent > a.saved / a.spent ? b : a
      );
      recommendations.push(
        `Shop more at ${bestStore.store} for better savings`
      );
    }

    // Trend-based recommendations
    const increasing = patterns.filter((p) => p.trend === "increasing");
    if (increasing.length > 0) {
      recommendations.push(
        `Monitor spending in ${increasing[0].category} - it's trending up`
      );
    }

    return recommendations;
  }

  private calculateVariance(prices: number[]): number {
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance =
      prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
      prices.length;
    return Math.sqrt(variance);
  }

  private calculateSavingsOpportunity(
    storeName: string,
    averagePrice: number
  ): number {
    // Mock savings opportunity calculation
    return Math.random() * 20 + 5; // $5-$25 savings opportunity
  }

  private generateSeasonalRecommendations(
    category: string,
    peakMonths: number[],
    lowMonths: number[]
  ): string[] {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const recommendations: string[] = [];

    if (peakMonths.length > 0) {
      const peakMonthNames = peakMonths.map((m) => monthNames[m]).join(", ");
      recommendations.push(
        `Stock up on ${category} before ${peakMonthNames} when prices are highest`
      );
    }

    if (lowMonths.length > 0) {
      const lowMonthNames = lowMonths.map((m) => monthNames[m]).join(", ");
      recommendations.push(
        `Best time to buy ${category} is during ${lowMonthNames}`
      );
    }

    return recommendations;
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();
