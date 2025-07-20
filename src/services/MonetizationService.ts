import { User } from "@/types";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  features: string[];
  limits: {
    receiptsPerMonth: number;
    priceAlerts: number;
    exportReports: number;
    aiInsights: number;
    communityFeatures: boolean;
    prioritySupport: boolean;
  };
  popular?: boolean;
  savingsGuarantee?: number;
}

export interface UserSubscription {
  userId: string;
  planId: string;
  status: "active" | "cancelled" | "expired" | "trial";
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod: string;
  nextBillingDate: Date;
  trialEndDate?: Date;
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  category: "analytics" | "community" | "automation" | "export" | "support";
  icon: string;
  isAvailable: (subscription: UserSubscription | null) => boolean;
  usageLimit?: number;
  currentUsage?: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  conversionRate: number;
  churnRate: number;
  lifetimeValue: number;
  subscriptionCounts: {
    free: number;
    basic: number;
    premium: number;
    enterprise: number;
  };
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  savings: number;
  features: string[];
  targetAudience: string;
  valueProposition: string;
}

export interface MarketSegment {
  id: string;
  name: string;
  description: string;
  targetFeatures: string[];
  pricingStrategy: "freemium" | "premium" | "enterprise";
  acquisitionCost: number;
  lifetimeValue: number;
  conversionRate: number;
}

export class MonetizationService {
  private static instance: MonetizationService;
  private subscriptions: Map<string, UserSubscription> = new Map();
  private plans: SubscriptionPlan[] = [];
  private premiumFeatures: PremiumFeature[] = [];
  private marketSegments: MarketSegment[] = [];

  private constructor() {
    this.initializePlans();
    this.initializePremiumFeatures();
    this.initializeMarketSegments();
  }

  static getInstance(): MonetizationService {
    if (!MonetizationService.instance) {
      MonetizationService.instance = new MonetizationService();
    }
    return MonetizationService.instance;
  }

  /**
   * Get available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return this.plans;
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    return this.subscriptions.get(userId) || null;
  }

  /**
   * Subscribe user to a plan
   */
  async subscribeUser(
    userId: string,
    planId: string,
    paymentMethod: string
  ): Promise<UserSubscription> {
    const plan = this.plans.find((p) => p.id === planId);
    if (!plan) {
      throw new Error("Plan not found");
    }

    const subscription: UserSubscription = {
      userId,
      planId,
      status: "active",
      startDate: new Date(),
      endDate: new Date(
        Date.now() +
          (plan.billingCycle === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000
      ),
      autoRenew: true,
      paymentMethod,
      nextBillingDate: new Date(
        Date.now() +
          (plan.billingCycle === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000
      ),
      trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day trial
    };

    this.subscriptions.set(userId, subscription);
    return subscription;
  }

  /**
   * Cancel user subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    const subscription = this.subscriptions.get(userId);
    if (subscription) {
      subscription.status = "cancelled";
      subscription.autoRenew = false;
      this.subscriptions.set(userId, subscription);
    }
  }

  /**
   * Get premium features available to user
   */
  async getPremiumFeatures(userId: string): Promise<PremiumFeature[]> {
    const subscription = await this.getUserSubscription(userId);
    return this.premiumFeatures.filter((feature) =>
      feature.isAvailable(subscription)
    );
  }

  /**
   * Check if user has access to specific feature
   */
  async hasFeatureAccess(userId: string, featureId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    const feature = this.premiumFeatures.find((f) => f.id === featureId);

    if (!feature) return false;
    return feature.isAvailable(subscription);
  }

  /**
   * Get usage statistics for premium features
   */
  async getFeatureUsage(
    userId: string,
    featureId: string
  ): Promise<{ current: number; limit: number }> {
    const subscription = await this.getUserSubscription(userId);
    const feature = this.premiumFeatures.find((f) => f.id === featureId);

    if (!feature || !feature.usageLimit) {
      return { current: 0, limit: -1 }; // No limit
    }

    // Mock usage data - in real app would track actual usage
    const currentUsage = Math.floor(Math.random() * feature.usageLimit);
    return { current: currentUsage, limit: feature.usageLimit };
  }

  /**
   * Get revenue metrics
   */
  async getRevenueMetrics(): Promise<RevenueMetrics> {
    const activeSubscriptions = Array.from(this.subscriptions.values()).filter(
      (s) => s.status === "active"
    );
    const totalRevenue = activeSubscriptions.reduce((sum, sub) => {
      const plan = this.plans.find((p) => p.id === sub.planId);
      return sum + (plan?.price || 0);
    }, 0);

    const subscriptionCounts = {
      free: 1000 - activeSubscriptions.length, // Mock data
      basic: activeSubscriptions.filter((s) => s.planId === "basic").length,
      premium: activeSubscriptions.filter((s) => s.planId === "premium").length,
      enterprise: activeSubscriptions.filter((s) => s.planId === "enterprise")
        .length,
    };

    return {
      totalRevenue,
      monthlyRecurringRevenue: totalRevenue,
      averageRevenuePerUser:
        activeSubscriptions.length > 0
          ? totalRevenue / activeSubscriptions.length
          : 0,
      conversionRate: 0.15, // 15% conversion rate
      churnRate: 0.05, // 5% churn rate
      lifetimeValue: 120, // $120 average LTV
      subscriptionCounts,
    };
  }

  /**
   * Get pricing tiers for different markets
   */
  async getPricingTiers(): Promise<PricingTier[]> {
    return [
      {
        id: "free",
        name: "Free",
        price: 0,
        savings: 0,
        features: [
          "Basic receipt scanning",
          "Simple price comparison",
          "Limited analytics",
          "Community access",
        ],
        targetAudience: "Casual users",
        valueProposition: "Start saving with basic features",
      },
      {
        id: "basic",
        name: "Basic",
        price: 4.99,
        savings: 25,
        features: [
          "Advanced receipt scanning",
          "Price alerts",
          "Basic analytics",
          "Export reports",
          "Priority support",
        ],
        targetAudience: "Regular shoppers",
        valueProposition: "Save $25+ monthly with smart features",
      },
      {
        id: "premium",
        name: "Premium",
        price: 9.99,
        savings: 50,
        features: [
          "AI-powered insights",
          "Price predictions",
          "Advanced analytics",
          "Unlimited exports",
          "Seasonal optimization",
          "Budget tracking",
        ],
        targetAudience: "Savings-focused users",
        valueProposition: "Save $50+ monthly with AI insights",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: 29.99,
        savings: 150,
        features: [
          "All Premium features",
          "Team management",
          "Custom integrations",
          "Dedicated support",
          "Advanced reporting",
          "API access",
        ],
        targetAudience: "Businesses & teams",
        valueProposition: "Save $150+ monthly with enterprise features",
      },
    ];
  }

  /**
   * Get market segments for expansion
   */
  async getMarketSegments(): Promise<MarketSegment[]> {
    return this.marketSegments;
  }

  /**
   * Calculate potential revenue for market segment
   */
  async calculateSegmentRevenue(
    segmentId: string,
    targetUsers: number
  ): Promise<{
    potentialRevenue: number;
    acquisitionCost: number;
    netProfit: number;
    roi: number;
  }> {
    const segment = this.marketSegments.find((s) => s.id === segmentId);
    if (!segment) {
      throw new Error("Market segment not found");
    }

    const potentialRevenue =
      targetUsers * segment.lifetimeValue * segment.conversionRate;
    const acquisitionCost = targetUsers * segment.acquisitionCost;
    const netProfit = potentialRevenue - acquisitionCost;
    const roi = acquisitionCost > 0 ? (netProfit / acquisitionCost) * 100 : 0;

    return {
      potentialRevenue,
      acquisitionCost,
      netProfit,
      roi,
    };
  }

  /**
   * Get upgrade recommendations for user
   */
  async getUpgradeRecommendations(userId: string): Promise<{
    recommendedPlan: SubscriptionPlan;
    potentialSavings: number;
    features: string[];
    reasons: string[];
  }> {
    const currentSubscription = await this.getUserSubscription(userId);
    const currentPlan = currentSubscription
      ? this.plans.find((p) => p.id === currentSubscription.planId)
      : null;

    // Mock recommendation logic
    const recommendedPlan = this.plans.find((p) => p.id === "premium")!;
    const potentialSavings = recommendedPlan.savingsGuarantee || 50;
    const features = recommendedPlan.features.filter(
      (f) => !currentPlan?.features.includes(f)
    );
    const reasons = [
      "You scan 20+ receipts monthly",
      "You could save $50+ with AI insights",
      "Price predictions would help you save more",
      "Advanced analytics would optimize your spending",
    ];

    return {
      recommendedPlan,
      potentialSavings,
      features,
      reasons,
    };
  }

  /**
   * Process payment for subscription
   */
  async processPayment(
    userId: string,
    planId: string,
    paymentMethod: string
  ): Promise<{
    success: boolean;
    transactionId: string;
    subscription: UserSubscription;
  }> {
    try {
      const subscription = await this.subscribeUser(
        userId,
        planId,
        paymentMethod
      );
      const transactionId = `txn_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      return {
        success: true,
        transactionId,
        subscription,
      };
    } catch (error) {
      throw new Error("Payment processing failed");
    }
  }

  /**
   * Get subscription analytics
   */
  async getSubscriptionAnalytics(): Promise<{
    totalSubscribers: number;
    activeSubscribers: number;
    trialConversions: number;
    churnRate: number;
    averageRevenuePerUser: number;
    topPlans: { planId: string; count: number }[];
  }> {
    const subscriptions = Array.from(this.subscriptions.values());
    const activeSubscriptions = subscriptions.filter(
      (s) => s.status === "active"
    );

    const planCounts = new Map<string, number>();
    activeSubscriptions.forEach((sub) => {
      planCounts.set(sub.planId, (planCounts.get(sub.planId) || 0) + 1);
    });

    const topPlans = Array.from(planCounts.entries())
      .map(([planId, count]) => ({ planId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      totalSubscribers: subscriptions.length,
      activeSubscribers: activeSubscriptions.length,
      trialConversions: Math.floor(activeSubscriptions.length * 0.3), // 30% conversion rate
      churnRate: 0.05, // 5% monthly churn
      averageRevenuePerUser: 8.5,
      topPlans,
    };
  }

  // Private helper methods

  private initializePlans(): void {
    this.plans = [
      {
        id: "free",
        name: "Free",
        price: 0,
        billingCycle: "monthly",
        features: [
          "Basic receipt scanning",
          "Simple price comparison",
          "Community access",
          "Basic analytics",
        ],
        limits: {
          receiptsPerMonth: 10,
          priceAlerts: 5,
          exportReports: 1,
          aiInsights: 3,
          communityFeatures: true,
          prioritySupport: false,
        },
      },
      {
        id: "basic",
        name: "Basic",
        price: 4.99,
        billingCycle: "monthly",
        features: [
          "Advanced receipt scanning",
          "Price alerts",
          "Basic analytics",
          "Export reports",
          "Priority support",
          "Community features",
        ],
        limits: {
          receiptsPerMonth: 50,
          priceAlerts: 20,
          exportReports: 5,
          aiInsights: 10,
          communityFeatures: true,
          prioritySupport: true,
        },
        savingsGuarantee: 25,
      },
      {
        id: "premium",
        name: "Premium",
        price: 9.99,
        billingCycle: "monthly",
        features: [
          "AI-powered insights",
          "Price predictions",
          "Advanced analytics",
          "Unlimited exports",
          "Seasonal optimization",
          "Budget tracking",
          "Priority support",
          "All community features",
        ],
        limits: {
          receiptsPerMonth: -1, // Unlimited
          priceAlerts: -1, // Unlimited
          exportReports: -1, // Unlimited
          aiInsights: -1, // Unlimited
          communityFeatures: true,
          prioritySupport: true,
        },
        popular: true,
        savingsGuarantee: 50,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: 29.99,
        billingCycle: "monthly",
        features: [
          "All Premium features",
          "Team management",
          "Custom integrations",
          "Dedicated support",
          "Advanced reporting",
          "API access",
          "White-label options",
        ],
        limits: {
          receiptsPerMonth: -1, // Unlimited
          priceAlerts: -1, // Unlimited
          exportReports: -1, // Unlimited
          aiInsights: -1, // Unlimited
          communityFeatures: true,
          prioritySupport: true,
        },
        savingsGuarantee: 150,
      },
    ];
  }

  private initializePremiumFeatures(): void {
    this.premiumFeatures = [
      {
        id: "ai-insights",
        name: "AI-Powered Insights",
        description:
          "Get personalized savings recommendations powered by artificial intelligence",
        category: "analytics",
        icon: "psychology",
        isAvailable: (subscription) =>
          subscription?.planId === "premium" ||
          subscription?.planId === "enterprise",
        usageLimit: 50,
      },
      {
        id: "price-predictions",
        name: "Price Predictions",
        description: "Know when to buy with AI-powered price forecasting",
        category: "analytics",
        icon: "trending-up",
        isAvailable: (subscription) =>
          subscription?.planId === "premium" ||
          subscription?.planId === "enterprise",
        usageLimit: 30,
      },
      {
        id: "advanced-analytics",
        name: "Advanced Analytics",
        description: "Comprehensive spending analysis and detailed reports",
        category: "analytics",
        icon: "analytics",
        isAvailable: (subscription) =>
          subscription?.planId === "premium" ||
          subscription?.planId === "enterprise",
      },
      {
        id: "unlimited-exports",
        name: "Unlimited Exports",
        description: "Export unlimited reports in multiple formats",
        category: "export",
        icon: "file-download",
        isAvailable: (subscription) =>
          subscription?.planId === "premium" ||
          subscription?.planId === "enterprise",
      },
      {
        id: "budget-tracking",
        name: "Budget Tracking",
        description: "Advanced budget management with real-time tracking",
        category: "analytics",
        icon: "account-balance-wallet",
        isAvailable: (subscription) =>
          subscription?.planId === "premium" ||
          subscription?.planId === "enterprise",
      },
      {
        id: "seasonal-optimization",
        name: "Seasonal Optimization",
        description: "Optimize shopping based on seasonal price patterns",
        category: "analytics",
        icon: "calendar-today",
        isAvailable: (subscription) =>
          subscription?.planId === "premium" ||
          subscription?.planId === "enterprise",
      },
      {
        id: "priority-support",
        name: "Priority Support",
        description: "Get faster support with dedicated assistance",
        category: "support",
        icon: "support-agent",
        isAvailable: (subscription) =>
          subscription?.planId === "basic" ||
          subscription?.planId === "premium" ||
          subscription?.planId === "enterprise",
      },
      {
        id: "team-management",
        name: "Team Management",
        description: "Manage multiple users and shared budgets",
        category: "automation",
        icon: "group",
        isAvailable: (subscription) => subscription?.planId === "enterprise",
      },
      {
        id: "api-access",
        name: "API Access",
        description: "Integrate with your existing systems via API",
        category: "automation",
        icon: "api",
        isAvailable: (subscription) => subscription?.planId === "enterprise",
      },
    ];
  }

  private initializeMarketSegments(): void {
    this.marketSegments = [
      {
        id: "budget-conscious",
        name: "Budget-Conscious Families",
        description: "Families looking to maximize savings on groceries",
        targetFeatures: ["AI insights", "Price predictions", "Budget tracking"],
        pricingStrategy: "premium",
        acquisitionCost: 15,
        lifetimeValue: 120,
        conversionRate: 0.12,
      },
      {
        id: "tech-savvy",
        name: "Tech-Savvy Professionals",
        description: "Professionals who value data-driven insights",
        targetFeatures: ["Advanced analytics", "Export reports", "API access"],
        pricingStrategy: "premium",
        acquisitionCost: 25,
        lifetimeValue: 180,
        conversionRate: 0.18,
      },
      {
        id: "small-business",
        name: "Small Business Owners",
        description: "Business owners managing company expenses",
        targetFeatures: [
          "Team management",
          "Custom integrations",
          "Dedicated support",
        ],
        pricingStrategy: "enterprise",
        acquisitionCost: 50,
        lifetimeValue: 360,
        conversionRate: 0.08,
      },
      {
        id: "casual-users",
        name: "Casual Users",
        description: "Users who want basic savings without complexity",
        targetFeatures: [
          "Basic scanning",
          "Price comparison",
          "Community features",
        ],
        pricingStrategy: "freemium",
        acquisitionCost: 5,
        lifetimeValue: 60,
        conversionRate: 0.05,
      },
    ];
  }
}

// Export singleton instance
export const monetizationService = MonetizationService.getInstance();
