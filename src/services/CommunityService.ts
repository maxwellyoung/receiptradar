import { Product, Store } from "@/types";

export interface Deal {
  id: string;
  userId: string;
  productName: string;
  originalPrice: number;
  salePrice: number;
  store: string;
  location: string;
  description: string;
  imageUrl?: string;
  verified: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  expiresAt?: Date;
  category: string;
}

export interface Achievement {
  id: string;
  userId: string;
  type: "streak" | "savings" | "sharing" | "community";
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  progress: number;
  maxProgress: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl?: string;
  totalSavings: number;
  dealsShared: number;
  streakDays: number;
  rank: number;
}

export interface CommunityTip {
  id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  category: "shopping" | "saving" | "budgeting" | "general";
  upvotes: number;
  createdAt: Date;
  tags: string[];
}

export interface UserReview {
  id: string;
  userId: string;
  username: string;
  productId: string;
  productName: string;
  rating: number;
  review: string;
  helpful: number;
  createdAt: Date;
}

export class CommunityService {
  private static instance: CommunityService;
  private deals: Map<string, Deal> = new Map();
  private achievements: Map<string, Achievement[]> = new Map();
  private leaderboard: LeaderboardEntry[] = [];
  private tips: CommunityTip[] = [];
  private reviews: UserReview[] = [];

  private constructor() {
    this.initializeMockData();
  }

  static getInstance(): CommunityService {
    if (!CommunityService.instance) {
      CommunityService.instance = new CommunityService();
    }
    return CommunityService.instance;
  }

  /**
   * Share a deal with the community
   */
  async shareDeal(
    deal: Omit<Deal, "id" | "createdAt" | "upvotes" | "downvotes" | "verified">
  ): Promise<Deal> {
    const newDeal: Deal = {
      ...deal,
      id: Date.now().toString(),
      createdAt: new Date(),
      upvotes: 0,
      downvotes: 0,
      verified: false,
    };

    this.deals.set(newDeal.id, newDeal);

    // Award achievement for sharing
    await this.awardAchievement(
      deal.userId,
      "sharing",
      "First Deal Shared",
      "Share your first deal with the community"
    );

    return newDeal;
  }

  /**
   * Get local deals based on location
   */
  async getLocalDeals(location: string, radius: number = 10): Promise<Deal[]> {
    const allDeals = Array.from(this.deals.values());

    // Mock location filtering - in real app would use geolocation
    const localDeals = allDeals.filter(
      (deal) =>
        deal.location.toLowerCase().includes(location.toLowerCase()) ||
        deal.store.toLowerCase().includes(location.toLowerCase())
    );

    return localDeals
      .sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes))
      .slice(0, 20);
  }

  /**
   * Vote on a deal
   */
  async voteDeal(
    dealId: string,
    userId: string,
    isUpvote: boolean
  ): Promise<void> {
    const deal = this.deals.get(dealId);
    if (!deal) return;

    if (isUpvote) {
      deal.upvotes++;
    } else {
      deal.downvotes++;
    }

    this.deals.set(dealId, deal);
  }

  /**
   * Verify a deal (admin/moderator function)
   */
  async verifyDeal(dealId: string): Promise<void> {
    const deal = this.deals.get(dealId);
    if (!deal) return;

    deal.verified = true;
    this.deals.set(dealId, deal);
  }

  /**
   * Track user achievement
   */
  async awardAchievement(
    userId: string,
    type: Achievement["type"],
    title: string,
    description: string
  ): Promise<Achievement> {
    const achievement: Achievement = {
      id: Date.now().toString(),
      userId,
      type,
      title,
      description,
      icon: this.getAchievementIcon(type),
      unlockedAt: new Date(),
      progress: 1,
      maxProgress: 1,
    };

    if (!this.achievements.has(userId)) {
      this.achievements.set(userId, []);
    }

    this.achievements.get(userId)!.push(achievement);

    return achievement;
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return this.achievements.get(userId) || [];
  }

  /**
   * Update achievement progress
   */
  async updateAchievementProgress(
    userId: string,
    type: Achievement["type"],
    progress: number
  ): Promise<void> {
    const userAchievements = this.achievements.get(userId) || [];
    const achievement = userAchievements.find((a) => a.type === type);

    if (achievement) {
      achievement.progress = Math.min(progress, achievement.maxProgress);
    } else {
      // Create new achievement if it doesn't exist
      const newAchievement: Achievement = {
        id: Date.now().toString(),
        userId,
        type,
        title: this.getAchievementTitle(type),
        description: this.getAchievementDescription(type),
        icon: this.getAchievementIcon(type),
        unlockedAt: new Date(),
        progress,
        maxProgress: this.getAchievementMaxProgress(type),
      };

      userAchievements.push(newAchievement);
      this.achievements.set(userId, userAchievements);
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    return this.leaderboard.slice(0, limit);
  }

  /**
   * Add community tip
   */
  async addTip(
    tip: Omit<CommunityTip, "id" | "createdAt" | "upvotes">
  ): Promise<CommunityTip> {
    const newTip: CommunityTip = {
      ...tip,
      id: Date.now().toString(),
      createdAt: new Date(),
      upvotes: 0,
    };

    this.tips.push(newTip);
    return newTip;
  }

  /**
   * Get community tips
   */
  async getTips(
    category?: string,
    limit: number = 10
  ): Promise<CommunityTip[]> {
    let filteredTips = this.tips;

    if (category) {
      filteredTips = this.tips.filter((tip) => tip.category === category);
    }

    return filteredTips.sort((a, b) => b.upvotes - a.upvotes).slice(0, limit);
  }

  /**
   * Vote on a tip
   */
  async voteTip(tipId: string, isUpvote: boolean): Promise<void> {
    const tip = this.tips.find((t) => t.id === tipId);
    if (!tip) return;

    if (isUpvote) {
      tip.upvotes++;
    } else {
      tip.upvotes = Math.max(0, tip.upvotes - 1);
    }
  }

  /**
   * Add product review
   */
  async addReview(
    review: Omit<UserReview, "id" | "createdAt" | "helpful">
  ): Promise<UserReview> {
    const newReview: UserReview = {
      ...review,
      id: Date.now().toString(),
      createdAt: new Date(),
      helpful: 0,
    };

    this.reviews.push(newReview);
    return newReview;
  }

  /**
   * Get product reviews
   */
  async getProductReviews(productId: string): Promise<UserReview[]> {
    return this.reviews
      .filter((review) => review.productId === productId)
      .sort((a, b) => b.helpful - a.helpful);
  }

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(reviewId: string): Promise<void> {
    const review = this.reviews.find((r) => r.id === reviewId);
    if (!review) return;

    review.helpful++;
  }

  /**
   * Get user streak
   */
  async getUserStreak(userId: string): Promise<number> {
    // Mock streak calculation - in real app would track daily usage
    return Math.floor(Math.random() * 30) + 1;
  }

  /**
   * Get user total savings
   */
  async getUserTotalSavings(userId: string): Promise<number> {
    // Mock savings calculation - in real app would sum all savings
    return Math.floor(Math.random() * 1000) + 100;
  }

  // Private helper methods

  private initializeMockData(): void {
    // Mock deals
    const mockDeals: Deal[] = [
      {
        id: "1",
        userId: "user1",
        productName: "Fresh Milk 2L",
        originalPrice: 4.5,
        salePrice: 3.2,
        store: "Countdown",
        location: "Auckland Central",
        description:
          "Great deal on Anchor milk! Perfect for cereal and coffee.",
        verified: true,
        upvotes: 15,
        downvotes: 2,
        createdAt: new Date(Date.now() - 86400000),
        category: "Dairy",
      },
      {
        id: "2",
        userId: "user2",
        productName: "Bananas 1kg",
        originalPrice: 3.8,
        salePrice: 2.5,
        store: "New World",
        location: "Wellington",
        description: "Yellow bananas on special. Great for smoothies!",
        verified: true,
        upvotes: 8,
        downvotes: 1,
        createdAt: new Date(Date.now() - 172800000),
        category: "Produce",
      },
      {
        id: "3",
        userId: "user3",
        productName: "Chicken Breast 500g",
        originalPrice: 12.0,
        salePrice: 8.5,
        store: "Pak'nSave",
        location: "Christchurch",
        description: "Fresh chicken breast at amazing price. Stock up!",
        verified: false,
        upvotes: 22,
        downvotes: 3,
        createdAt: new Date(Date.now() - 43200000),
        category: "Meat",
      },
    ];

    mockDeals.forEach((deal) => this.deals.set(deal.id, deal));

    // Mock leaderboard
    this.leaderboard = [
      {
        userId: "user1",
        username: "SavingsPro",
        totalSavings: 1250.5,
        dealsShared: 45,
        streakDays: 28,
        rank: 1,
      },
      {
        userId: "user2",
        username: "DealHunter",
        totalSavings: 980.25,
        dealsShared: 32,
        streakDays: 21,
        rank: 2,
      },
      {
        userId: "user3",
        username: "BudgetMaster",
        totalSavings: 875.75,
        dealsShared: 28,
        streakDays: 15,
        rank: 3,
      },
    ];

    // Mock tips
    this.tips = [
      {
        id: "1",
        userId: "user1",
        username: "SavingsPro",
        title: "Shop on Wednesdays for Best Deals",
        content:
          "Most supermarkets release their weekly specials on Wednesdays. Plan your shopping around this day to get the best prices!",
        category: "shopping",
        upvotes: 45,
        createdAt: new Date(Date.now() - 86400000),
        tags: ["timing", "weekly-specials"],
      },
      {
        id: "2",
        userId: "user2",
        username: "DealHunter",
        title: "Use Unit Price Comparison",
        content:
          "Always check the unit price (price per 100g) rather than just the total price. Larger packages aren't always better value!",
        category: "saving",
        upvotes: 38,
        createdAt: new Date(Date.now() - 172800000),
        tags: ["unit-price", "comparison"],
      },
      {
        id: "3",
        userId: "user3",
        username: "BudgetMaster",
        title: "Set Up Price Alerts",
        content:
          "Use the app's price alert feature to get notified when your favorite products go on sale. Never miss a good deal!",
        category: "budgeting",
        upvotes: 29,
        createdAt: new Date(Date.now() - 259200000),
        tags: ["alerts", "notifications"],
      },
    ];

    // Mock reviews
    this.reviews = [
      {
        id: "1",
        userId: "user1",
        username: "SavingsPro",
        productId: "milk-1",
        productName: "Anchor Milk 2L",
        rating: 5,
        review:
          "Great quality milk at a reasonable price. Always fresh and lasts well in the fridge.",
        helpful: 12,
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: "2",
        userId: "user2",
        username: "DealHunter",
        productId: "bread-1",
        productName: "Vogel's Bread",
        rating: 4,
        review:
          "Good bread but a bit expensive. Tastes great though and stays fresh longer than other brands.",
        helpful: 8,
        createdAt: new Date(Date.now() - 172800000),
      },
    ];
  }

  private getAchievementIcon(type: Achievement["type"]): string {
    switch (type) {
      case "streak":
        return "local-fire-department";
      case "savings":
        return "savings";
      case "sharing":
        return "share";
      case "community":
        return "people";
      default:
        return "emoji-events";
    }
  }

  private getAchievementTitle(type: Achievement["type"]): string {
    switch (type) {
      case "streak":
        return "Streak Master";
      case "savings":
        return "Savings Champion";
      case "sharing":
        return "Deal Sharer";
      case "community":
        return "Community Helper";
      default:
        return "Achievement Unlocked";
    }
  }

  private getAchievementDescription(type: Achievement["type"]): string {
    switch (type) {
      case "streak":
        return "Maintain a shopping streak";
      case "savings":
        return "Save money on purchases";
      case "sharing":
        return "Share deals with community";
      case "community":
        return "Help other users";
      default:
        return "Complete various tasks";
    }
  }

  private getAchievementMaxProgress(type: Achievement["type"]): number {
    switch (type) {
      case "streak":
        return 30;
      case "savings":
        return 1000;
      case "sharing":
        return 50;
      case "community":
        return 100;
      default:
        return 1;
    }
  }
}

// Export singleton instance
export const communityService = CommunityService.getInstance();
