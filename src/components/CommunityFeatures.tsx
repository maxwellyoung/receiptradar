import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { spacing, typography, borderRadius, shadows } from "@/constants/theme";
import {
  communityService,
  Deal,
  Achievement,
  LeaderboardEntry,
  CommunityTip,
  UserReview,
} from "@/services/CommunityService";

interface CommunityFeaturesProps {
  variant?: "demo" | "full";
}

export const CommunityFeatures: React.FC<CommunityFeaturesProps> = ({
  variant = "demo",
}) => {
  const theme = useTheme<AppTheme>();
  const [activeTab, setActiveTab] = useState<
    "deals" | "achievements" | "leaderboard" | "tips" | "reviews"
  >("deals");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tips, setTips] = useState<CommunityTip[]>([]);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [showShareDeal, setShowShareDeal] = useState(false);
  const [newDeal, setNewDeal] = useState({
    productName: "",
    originalPrice: "",
    salePrice: "",
    store: "",
    location: "",
    description: "",
    category: "Other",
  });

  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadData = async () => {
    try {
      const [
        dealsData,
        achievementsData,
        leaderboardData,
        tipsData,
        reviewsData,
      ] = await Promise.all([
        communityService.getLocalDeals("Auckland"),
        communityService.getUserAchievements("current-user"),
        communityService.getLeaderboard(5),
        communityService.getTips(undefined, 5),
        communityService.getProductReviews("milk-1"),
      ]);

      setDeals(dealsData);
      setAchievements(achievementsData);
      setLeaderboard(leaderboardData);
      setTips(tipsData);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error loading community data:", error);
    }
  };

  const handleVoteDeal = async (dealId: string, isUpvote: boolean) => {
    await communityService.voteDeal(dealId, "current-user", isUpvote);
    loadData(); // Reload to get updated votes
  };

  const handleShareDeal = async () => {
    if (!newDeal.productName || !newDeal.originalPrice || !newDeal.salePrice)
      return;

    try {
      await communityService.shareDeal({
        userId: "current-user",
        productName: newDeal.productName,
        originalPrice: parseFloat(newDeal.originalPrice),
        salePrice: parseFloat(newDeal.salePrice),
        store: newDeal.store,
        location: newDeal.location,
        description: newDeal.description,
        category: newDeal.category,
      });

      setShowShareDeal(false);
      setNewDeal({
        productName: "",
        originalPrice: "",
        salePrice: "",
        store: "",
        location: "",
        description: "",
        category: "Other",
      });
      loadData();
    } catch (error) {
      console.error("Error sharing deal:", error);
    }
  };

  const handleVoteTip = async (tipId: string, isUpvote: boolean) => {
    await communityService.voteTip(tipId, isUpvote);
    loadData();
  };

  const renderDealCard = (deal: Deal) => (
    <View
      key={deal.id}
      style={[styles.dealCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.dealHeader}>
        <View style={styles.dealInfo}>
          <Text
            style={[styles.dealProductName, { color: theme.colors.onSurface }]}
          >
            {deal.productName}
          </Text>
          <Text
            style={[styles.dealStore, { color: theme.colors.onSurfaceVariant }]}
          >
            {deal.store} • {deal.location}
          </Text>
        </View>
        {deal.verified && (
          <MaterialIcons name="verified" size={20} color="#10B981" />
        )}
      </View>

      <View style={styles.dealPricing}>
        <Text
          style={[
            styles.originalPrice,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          ${deal.originalPrice.toFixed(2)}
        </Text>
        <Text style={[styles.salePrice, { color: theme.colors.primary }]}>
          ${deal.salePrice.toFixed(2)}
        </Text>
        <View
          style={[styles.savingsBadge, { backgroundColor: "#10B981" + "20" }]}
        >
          <Text style={[styles.savingsText, { color: "#10B981" }]}>
            Save ${(deal.originalPrice - deal.salePrice).toFixed(2)}
          </Text>
        </View>
      </View>

      <Text style={[styles.dealDescription, { color: theme.colors.onSurface }]}>
        {deal.description}
      </Text>

      <View style={styles.dealActions}>
        <View style={styles.voteButtons}>
          <TouchableOpacity
            style={styles.voteButton}
            onPress={() => handleVoteDeal(deal.id, true)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="thumb-up" size={16} color="#10B981" />
            <Text style={[styles.voteCount, { color: "#10B981" }]}>
              {deal.upvotes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.voteButton}
            onPress={() => handleVoteDeal(deal.id, false)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="thumb-down" size={16} color="#EF4444" />
            <Text style={[styles.voteCount, { color: "#EF4444" }]}>
              {deal.downvotes}
            </Text>
          </TouchableOpacity>
        </View>
        <Text
          style={[styles.dealTime, { color: theme.colors.onSurfaceVariant }]}
        >
          {formatTimeAgo(deal.createdAt)}
        </Text>
      </View>
    </View>
  );

  const renderAchievementCard = (achievement: Achievement) => (
    <View
      key={achievement.id}
      style={[
        styles.achievementCard,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <View style={styles.achievementHeader}>
        <MaterialIcons
          name={achievement.icon as any}
          size={24}
          color={theme.colors.primary}
        />
        <View style={styles.achievementInfo}>
          <Text
            style={[styles.achievementTitle, { color: theme.colors.onSurface }]}
          >
            {achievement.title}
          </Text>
          <Text
            style={[
              styles.achievementDescription,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {achievement.description}
          </Text>
        </View>
      </View>

      {achievement.maxProgress > 1 && (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.colors.outline },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.primary,
                  width: `${
                    (achievement.progress / achievement.maxProgress) * 100
                  }%`,
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.progressText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {achievement.progress}/{achievement.maxProgress}
          </Text>
        </View>
      )}
    </View>
  );

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => (
    <View
      key={entry.userId}
      style={[
        styles.leaderboardEntry,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <View style={styles.rankContainer}>
        <Text style={[styles.rankNumber, { color: theme.colors.primary }]}>
          #{entry.rank}
        </Text>
        {index < 3 && (
          <MaterialIcons
            name="emoji-events"
            size={20}
            color={
              index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32"
            }
          />
        )}
      </View>

      <View style={styles.userInfo}>
        <Text style={[styles.username, { color: theme.colors.onSurface }]}>
          {entry.username}
        </Text>
        <Text
          style={[styles.userStats, { color: theme.colors.onSurfaceVariant }]}
        >
          ${entry.totalSavings.toFixed(2)} saved • {entry.dealsShared} deals •{" "}
          {entry.streakDays} day streak
        </Text>
      </View>
    </View>
  );

  const renderTipCard = (tip: CommunityTip) => (
    <View
      key={tip.id}
      style={[styles.tipCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.tipHeader}>
        <Text style={[styles.tipTitle, { color: theme.colors.onSurface }]}>
          {tip.title}
        </Text>
        <View
          style={[
            styles.tipCategory,
            { backgroundColor: theme.colors.primary + "20" },
          ]}
        >
          <Text
            style={[styles.tipCategoryText, { color: theme.colors.primary }]}
          >
            {tip.category}
          </Text>
        </View>
      </View>

      <Text style={[styles.tipContent, { color: theme.colors.onSurface }]}>
        {tip.content}
      </Text>

      <View style={styles.tipFooter}>
        <Text
          style={[styles.tipAuthor, { color: theme.colors.onSurfaceVariant }]}
        >
          by {tip.username}
        </Text>
        <TouchableOpacity
          style={styles.tipVoteButton}
          onPress={() => handleVoteTip(tip.id, true)}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="thumb-up"
            size={16}
            color={theme.colors.primary}
          />
          <Text style={[styles.tipVoteCount, { color: theme.colors.primary }]}>
            {tip.upvotes}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReviewCard = (review: UserReview) => (
    <View
      key={review.id}
      style={[styles.reviewCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.reviewHeader}>
        <Text style={[styles.reviewProduct, { color: theme.colors.onSurface }]}>
          {review.productName}
        </Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <MaterialIcons
              key={star}
              name={star <= review.rating ? "star" : "star-border"}
              size={16}
              color={
                star <= review.rating
                  ? "#F59E0B"
                  : theme.colors.onSurfaceVariant
              }
            />
          ))}
        </View>
      </View>

      <Text style={[styles.reviewText, { color: theme.colors.onSurface }]}>
        {review.review}
      </Text>

      <View style={styles.reviewFooter}>
        <Text
          style={[
            styles.reviewAuthor,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          by {review.username}
        </Text>
        <TouchableOpacity style={styles.helpfulButton} activeOpacity={0.7}>
          <MaterialIcons
            name="thumb-up"
            size={16}
            color={theme.colors.primary}
          />
          <Text style={[styles.helpfulCount, { color: theme.colors.primary }]}>
            {review.helpful} helpful
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (variant === "demo") {
    return (
      <Animated.View
        style={[
          styles.demoContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={[styles.demoTitle, { color: theme.colors.primary }]}>
          Community Features
        </Text>
        <Text
          style={[
            styles.demoSubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Share deals, earn achievements, and connect with other savers
        </Text>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[
            { key: "deals", label: "Deals", icon: "local-offer" },
            {
              key: "achievements",
              label: "Achievements",
              icon: "emoji-events",
            },
            { key: "leaderboard", label: "Leaderboard", icon: "leaderboard" },
            { key: "tips", label: "Tips", icon: "lightbulb" },
            { key: "reviews", label: "Reviews", icon: "star" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                activeTab === tab.key && {
                  backgroundColor: theme.colors.primary + "20",
                },
              ]}
              onPress={() => setActiveTab(tab.key as any)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={tab.icon as any}
                size={20}
                color={
                  activeTab === tab.key
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant
                }
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color:
                      activeTab === tab.key
                        ? theme.colors.primary
                        : theme.colors.onSurfaceVariant,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content Area */}
        <ScrollView
          style={styles.contentArea}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "deals" && (
            <View>
              <View style={styles.sectionHeader}>
                <Text
                  style={[styles.sectionTitle, { color: theme.colors.primary }]}
                >
                  Local Deals
                </Text>
                <TouchableOpacity
                  style={[
                    styles.shareButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => setShowShareDeal(true)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="add" size={20} color="white" />
                  <Text style={styles.shareButtonText}>Share Deal</Text>
                </TouchableOpacity>
              </View>
              {deals.map(renderDealCard)}
            </View>
          )}

          {activeTab === "achievements" && (
            <View>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Your Achievements
              </Text>
              {achievements.map(renderAchievementCard)}
            </View>
          )}

          {activeTab === "leaderboard" && (
            <View>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Top Savers
              </Text>
              {leaderboard.map((entry, index) =>
                renderLeaderboardEntry(entry, index)
              )}
            </View>
          )}

          {activeTab === "tips" && (
            <View>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Community Tips
              </Text>
              {tips.map(renderTipCard)}
            </View>
          )}

          {activeTab === "reviews" && (
            <View>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Product Reviews
              </Text>
              {reviews.map(renderReviewCard)}
            </View>
          )}
        </ScrollView>

        {/* Share Deal Modal */}
        {showShareDeal && (
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Text
                style={[styles.modalTitle, { color: theme.colors.primary }]}
              >
                Share a Deal
              </Text>

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.onSurface,
                    borderColor: theme.colors.outline,
                  },
                ]}
                placeholder="Product name"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={newDeal.productName}
                onChangeText={(text) =>
                  setNewDeal((prev) => ({ ...prev, productName: text }))
                }
              />

              <View style={styles.priceInputs}>
                <TextInput
                  style={[
                    styles.modalInput,
                    styles.halfInput,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.onSurface,
                      borderColor: theme.colors.outline,
                    },
                  ]}
                  placeholder="Original price"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  value={newDeal.originalPrice}
                  onChangeText={(text) =>
                    setNewDeal((prev) => ({ ...prev, originalPrice: text }))
                  }
                  keyboardType="numeric"
                />
                <TextInput
                  style={[
                    styles.modalInput,
                    styles.halfInput,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.onSurface,
                      borderColor: theme.colors.outline,
                    },
                  ]}
                  placeholder="Sale price"
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  value={newDeal.salePrice}
                  onChangeText={(text) =>
                    setNewDeal((prev) => ({ ...prev, salePrice: text }))
                  }
                  keyboardType="numeric"
                />
              </View>

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.onSurface,
                    borderColor: theme.colors.outline,
                  },
                ]}
                placeholder="Store name"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={newDeal.store}
                onChangeText={(text) =>
                  setNewDeal((prev) => ({ ...prev, store: text }))
                }
              />

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.onSurface,
                    borderColor: theme.colors.outline,
                  },
                ]}
                placeholder="Description (optional)"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={newDeal.description}
                onChangeText={(text) =>
                  setNewDeal((prev) => ({ ...prev, description: text }))
                }
                multiline
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: theme.colors.outline },
                  ]}
                  onPress={() => setShowShareDeal(false)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={handleShareDeal}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.modalButtonText, { color: "white" }]}>
                    Share Deal
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Features List */}
        <View style={styles.featuresList}>
          <Text style={[styles.featuresTitle, { color: theme.colors.primary }]}>
            Community Benefits
          </Text>
          <View style={styles.featureItem}>
            <MaterialIcons name="share" size={20} color="#10B981" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>Deal Sharing:</Text> Share
              great finds with the community
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="emoji-events" size={20} color="#F59E0B" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>Achievements:</Text> Earn
              badges for your savings
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="leaderboard" size={20} color="#3B82F6" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>Leaderboards:</Text> Compete
              with other savers
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="lightbulb" size={20} color="#8B5CF6" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>Community Tips:</Text> Learn
              from other users
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Community Features
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Connect with other savers and share great deals
        </Text>
      </View>

      <ScrollView style={styles.fullContent}>
        {/* Full implementation would go here */}
        <Text
          style={[
            styles.placeholderText,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Full community features implementation
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    alignItems: "center",
  },
  title: {
    ...typography.headline1,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    textAlign: "center",
    lineHeight: 24,
  },
  fullContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  placeholderText: {
    ...typography.body1,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  demoContainer: {
    padding: spacing.lg,
  },
  demoTitle: {
    ...typography.headline1,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  demoSubtitle: {
    ...typography.body1,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: "#F8FAFC",
    padding: spacing.xs,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  tabLabel: {
    ...typography.caption1,
    marginLeft: spacing.xs,
    fontWeight: "500",
  },
  contentArea: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  shareButtonText: {
    ...typography.body2,
    color: "white",
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
  dealCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  dealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  dealInfo: {
    flex: 1,
  },
  dealProductName: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  dealStore: {
    ...typography.caption1,
  },
  dealPricing: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  originalPrice: {
    ...typography.body2,
    textDecorationLine: "line-through",
    marginRight: spacing.sm,
  },
  salePrice: {
    ...typography.body1,
    fontWeight: "700",
    marginRight: spacing.sm,
  },
  savingsBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  savingsText: {
    ...typography.caption2,
    fontWeight: "600",
  },
  dealDescription: {
    ...typography.body2,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  dealActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  voteButtons: {
    flexDirection: "row",
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.md,
  },
  voteCount: {
    ...typography.caption1,
    marginLeft: spacing.xs,
  },
  dealTime: {
    ...typography.caption1,
  },
  achievementCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  achievementInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  achievementTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  achievementDescription: {
    ...typography.body2,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    ...typography.caption1,
    textAlign: "right",
  },
  leaderboardEntry: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  rankContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.md,
  },
  rankNumber: {
    ...typography.body1,
    fontWeight: "700",
    marginRight: spacing.xs,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  userStats: {
    ...typography.caption1,
  },
  tipCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  tipHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  tipTitle: {
    ...typography.body1,
    fontWeight: "600",
    flex: 1,
    marginRight: spacing.sm,
  },
  tipCategory: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  tipCategoryText: {
    ...typography.caption2,
    fontWeight: "600",
  },
  tipContent: {
    ...typography.body2,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  tipFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tipAuthor: {
    ...typography.caption1,
  },
  tipVoteButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  tipVoteCount: {
    ...typography.caption1,
    marginLeft: spacing.xs,
  },
  reviewCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  reviewProduct: {
    ...typography.body1,
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
  },
  reviewText: {
    ...typography.body2,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  reviewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewAuthor: {
    ...typography.caption1,
  },
  helpfulButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  helpfulCount: {
    ...typography.caption1,
    marginLeft: spacing.xs,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    width: "90%",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.lg,
  },
  modalTitle: {
    ...typography.body1,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...typography.body1,
  },
  priceInputs: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  modalButtonText: {
    ...typography.body2,
    fontWeight: "600",
  },
  featuresList: {
    marginTop: spacing.lg,
  },
  featuresTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  featureText: {
    ...typography.body2,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
});
