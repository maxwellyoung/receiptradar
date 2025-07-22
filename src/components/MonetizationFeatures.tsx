import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { spacing, typography, borderRadius, shadows } from "@/constants/theme";
import {
  monetizationService,
  SubscriptionPlan,
  PremiumFeature,
  PricingTier,
  MarketSegment,
  RevenueMetrics,
} from "@/services/MonetizationService";
import { logger } from "@/utils/logger";

interface MonetizationFeaturesProps {
  variant?: "demo" | "full";
}

const { width } = Dimensions.get("window");

export const MonetizationFeatures: React.FC<MonetizationFeaturesProps> = ({
  variant = "demo",
}) => {
  const theme = useTheme<AppTheme>();
  const [activeTab, setActiveTab] = useState<
    "plans" | "features" | "pricing" | "segments" | "revenue" | "upgrades"
  >("plans");
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [premiumFeatures, setPremiumFeatures] = useState<PremiumFeature[]>([]);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [marketSegments, setMarketSegments] = useState<MarketSegment[]>([]);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(
    null
  );
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
      const [plansData, featuresData, pricingData, segmentsData, revenueData] =
        await Promise.all([
          monetizationService.getSubscriptionPlans(),
          monetizationService.getPremiumFeatures("current-user"),
          monetizationService.getPricingTiers(),
          monetizationService.getMarketSegments(),
          monetizationService.getRevenueMetrics(),
        ]);

      setPlans(plansData);
      setPremiumFeatures(featuresData);
      setPricingTiers(pricingData);
      setMarketSegments(segmentsData);
      setRevenueMetrics(revenueData);
    } catch (error) {
      logger.error("Error loading monetization data", error as Error, {
        component: "MonetizationFeatures",
      });
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      const result = await monetizationService.processPayment(
        "current-user",
        planId,
        "credit_card"
      );

      if (result.success) {
        setSelectedPlan(planId);
        setShowUpgradeModal(false);
        loadData(); // Reload to get updated subscription
      }
    } catch (error) {
      logger.error("Subscription failed", error as Error, {
        component: "MonetizationFeatures",
      });
    }
  };

  const renderPlanCard = (plan: SubscriptionPlan) => (
    <View
      key={plan.id}
      style={[
        styles.planCard,
        { backgroundColor: theme.colors.surface },
        plan.popular && { borderColor: theme.colors.primary, borderWidth: 2 },
      ]}
    >
      {plan.popular && (
        <View
          style={[
            styles.popularBadge,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text style={[styles.popularText, { color: "white" }]}>
            MOST POPULAR
          </Text>
        </View>
      )}

      <View style={styles.planHeader}>
        <Text style={[styles.planName, { color: theme.colors.onSurface }]}>
          {plan.name}
        </Text>
        <View style={styles.planPricing}>
          <Text style={[styles.planPrice, { color: theme.colors.primary }]}>
            ${plan.price}
          </Text>
          <Text
            style={[
              styles.planPeriod,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            /month
          </Text>
        </View>
        {plan.savingsGuarantee && (
          <Text style={[styles.savingsGuarantee, { color: "#10B981" }]}>
            Save ${plan.savingsGuarantee}+ monthly
          </Text>
        )}
      </View>

      <View style={styles.planFeatures}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <MaterialIcons name="check" size={16} color="#10B981" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.planLimits}>
        <Text
          style={[styles.limitsTitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Limits:
        </Text>
        <Text style={[styles.limitText, { color: theme.colors.onSurface }]}>
          Receipts:{" "}
          {plan.limits.receiptsPerMonth === -1
            ? "Unlimited"
            : plan.limits.receiptsPerMonth}
          /month
        </Text>
        <Text style={[styles.limitText, { color: theme.colors.onSurface }]}>
          AI Insights:{" "}
          {plan.limits.aiInsights === -1 ? "Unlimited" : plan.limits.aiInsights}
          /month
        </Text>
        <Text style={[styles.limitText, { color: theme.colors.onSurface }]}>
          Exports:{" "}
          {plan.limits.exportReports === -1
            ? "Unlimited"
            : plan.limits.exportReports}
          /month
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.subscribeButton,
          {
            backgroundColor: plan.popular
              ? theme.colors.primary
              : theme.colors.outline,
          },
        ]}
        onPress={() => handleSubscribe(plan.id)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.subscribeButtonText,
            { color: plan.popular ? "white" : theme.colors.onSurface },
          ]}
        >
          {plan.price === 0 ? "Get Started" : "Subscribe"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFeatureCard = (feature: PremiumFeature) => (
    <View
      key={feature.id}
      style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.featureHeader}>
        <MaterialIcons
          name={feature.icon as any}
          size={24}
          color={theme.colors.primary}
        />
        <View style={styles.featureInfo}>
          <Text style={[styles.featureName, { color: theme.colors.onSurface }]}>
            {feature.name}
          </Text>
          <Text
            style={[
              styles.featureDescription,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {feature.description}
          </Text>
        </View>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: theme.colors.primary + "20" },
          ]}
        >
          <Text style={[styles.categoryText, { color: theme.colors.primary }]}>
            {feature.category}
          </Text>
        </View>
      </View>

      {feature.usageLimit && (
        <View style={styles.usageInfo}>
          <Text
            style={[styles.usageText, { color: theme.colors.onSurfaceVariant }]}
          >
            Usage: {feature.currentUsage || 0} / {feature.usageLimit}
          </Text>
          <View style={styles.usageBar}>
            <View
              style={[
                styles.usageFill,
                {
                  backgroundColor: theme.colors.primary,
                  width: `${
                    ((feature.currentUsage || 0) / feature.usageLimit) * 100
                  }%`,
                },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );

  const renderPricingTier = (tier: PricingTier) => (
    <View
      key={tier.id}
      style={[styles.pricingCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.pricingHeader}>
        <Text style={[styles.tierName, { color: theme.colors.onSurface }]}>
          {tier.name}
        </Text>
        <Text style={[styles.tierPrice, { color: theme.colors.primary }]}>
          ${tier.price}/month
        </Text>
        {tier.savings > 0 && (
          <Text style={[styles.tierSavings, { color: "#10B981" }]}>
            Save ${tier.savings}/month
          </Text>
        )}
      </View>

      <Text
        style={[
          styles.targetAudience,
          { color: theme.colors.onSurfaceVariant },
        ]}
      >
        {tier.targetAudience}
      </Text>

      <Text
        style={[styles.valueProposition, { color: theme.colors.onSurface }]}
      >
        {tier.valueProposition}
      </Text>

      <View style={styles.tierFeatures}>
        {tier.features.map((feature, index) => (
          <Text
            key={index}
            style={[styles.tierFeature, { color: theme.colors.onSurface }]}
          >
            • {feature}
          </Text>
        ))}
      </View>
    </View>
  );

  const renderMarketSegment = (segment: MarketSegment) => (
    <View
      key={segment.id}
      style={[styles.segmentCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.segmentHeader}>
        <Text style={[styles.segmentName, { color: theme.colors.onSurface }]}>
          {segment.name}
        </Text>
        <View
          style={[
            styles.strategyBadge,
            {
              backgroundColor: getStrategyColor(segment.pricingStrategy) + "20",
            },
          ]}
        >
          <Text
            style={[styles.strategyText, { color: theme.colors.onSurface }]}
          >
            {segment.pricingStrategy.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.segmentDescription,
          { color: theme.colors.onSurfaceVariant },
        ]}
      >
        {segment.description}
      </Text>

      <View style={styles.segmentMetrics}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: theme.colors.onSurface }]}>
            ${segment.acquisitionCost}
          </Text>
          <Text
            style={[
              styles.metricLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            CAC
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: theme.colors.onSurface }]}>
            ${segment.lifetimeValue}
          </Text>
          <Text
            style={[
              styles.metricLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            LTV
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: theme.colors.onSurface }]}>
            {(segment.conversionRate * 100).toFixed(1)}%
          </Text>
          <Text
            style={[
              styles.metricLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Conversion
          </Text>
        </View>
      </View>

      <View style={styles.targetFeatures}>
        <Text
          style={[
            styles.segmentFeaturesTitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Target Features:
        </Text>
        {segment.targetFeatures.map((feature, index) => (
          <Text
            key={index}
            style={[styles.targetFeature, { color: theme.colors.onSurface }]}
          >
            • {feature}
          </Text>
        ))}
      </View>
    </View>
  );

  const renderRevenueMetrics = () => {
    if (!revenueMetrics) return null;

    return (
      <View
        style={[styles.revenueCard, { backgroundColor: theme.colors.surface }]}
      >
        <Text style={[styles.revenueTitle, { color: theme.colors.primary }]}>
          Revenue Analytics
        </Text>

        <View style={styles.revenueGrid}>
          <View style={styles.revenueMetric}>
            <Text
              style={[styles.revenueValue, { color: theme.colors.onSurface }]}
            >
              ${revenueMetrics.totalRevenue.toFixed(0)}
            </Text>
            <Text
              style={[
                styles.revenueLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Total Revenue
            </Text>
          </View>
          <View style={styles.revenueMetric}>
            <Text style={[styles.revenueValue, { color: "#10B981" }]}>
              ${revenueMetrics.monthlyRecurringRevenue.toFixed(0)}
            </Text>
            <Text
              style={[
                styles.revenueLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              MRR
            </Text>
          </View>
          <View style={styles.revenueMetric}>
            <Text
              style={[styles.revenueValue, { color: theme.colors.primary }]}
            >
              ${revenueMetrics.averageRevenuePerUser.toFixed(2)}
            </Text>
            <Text
              style={[
                styles.revenueLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              ARPU
            </Text>
          </View>
          <View style={styles.revenueMetric}>
            <Text style={[styles.revenueValue, { color: "#F59E0B" }]}>
              {(revenueMetrics.conversionRate * 100).toFixed(1)}%
            </Text>
            <Text
              style={[
                styles.revenueLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Conversion
            </Text>
          </View>
        </View>

        <View style={styles.subscriptionBreakdown}>
          <Text
            style={[styles.breakdownTitle, { color: theme.colors.onSurface }]}
          >
            Subscription Breakdown
          </Text>
          <View style={styles.breakdownItems}>
            <View style={styles.breakdownItem}>
              <Text
                style={[
                  styles.breakdownLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Free
              </Text>
              <Text
                style={[
                  styles.breakdownValue,
                  { color: theme.colors.onSurface },
                ]}
              >
                {revenueMetrics.subscriptionCounts.free}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text
                style={[
                  styles.breakdownLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Basic
              </Text>
              <Text
                style={[
                  styles.breakdownValue,
                  { color: theme.colors.onSurface },
                ]}
              >
                {revenueMetrics.subscriptionCounts.basic}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text
                style={[
                  styles.breakdownLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Premium
              </Text>
              <Text
                style={[
                  styles.breakdownValue,
                  { color: theme.colors.onSurface },
                ]}
              >
                {revenueMetrics.subscriptionCounts.premium}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text
                style={[
                  styles.breakdownLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Enterprise
              </Text>
              <Text
                style={[
                  styles.breakdownValue,
                  { color: theme.colors.onSurface },
                ]}
              >
                {revenueMetrics.subscriptionCounts.enterprise}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Helper functions
  const getStrategyColor = (strategy: string): string => {
    switch (strategy) {
      case "freemium":
        return "#3B82F6";
      case "premium":
        return "#10B981";
      case "enterprise":
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
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
          Monetization & Market Expansion
        </Text>
        <Text
          style={[
            styles.demoSubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Premium features, subscription plans, and market growth
        </Text>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[
            { key: "plans", label: "Plans", icon: "card-membership" },
            { key: "features", label: "Features", icon: "star" },
            { key: "pricing", label: "Pricing", icon: "attach-money" },
            { key: "segments", label: "Segments", icon: "people" },
            { key: "revenue", label: "Revenue", icon: "trending-up" },
            { key: "upgrades", label: "Upgrades", icon: "upgrade" },
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
          {activeTab === "plans" && (
            <View>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Subscription Plans
              </Text>
              {plans.map(renderPlanCard)}
            </View>
          )}

          {activeTab === "features" && (
            <View>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Premium Features
              </Text>
              {premiumFeatures.map(renderFeatureCard)}
            </View>
          )}

          {activeTab === "pricing" && (
            <View>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Pricing Tiers
              </Text>
              {pricingTiers.map(renderPricingTier)}
            </View>
          )}

          {activeTab === "segments" && (
            <View>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Market Segments
              </Text>
              {marketSegments.map(renderMarketSegment)}
            </View>
          )}

          {activeTab === "revenue" && (
            <View>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Revenue Analytics
              </Text>
              {renderRevenueMetrics()}
            </View>
          )}

          {activeTab === "upgrades" && (
            <View>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.primary }]}
              >
                Upgrade Recommendations
              </Text>
              <TouchableOpacity
                style={[
                  styles.upgradeCard,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => setShowUpgradeModal(true)}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="upgrade"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.upgradeTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Upgrade to Premium
                </Text>
                <Text
                  style={[
                    styles.upgradeDescription,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Unlock AI insights, price predictions, and advanced analytics
                </Text>
                <Text style={[styles.upgradeSavings, { color: "#10B981" }]}>
                  Save $50+ monthly with Premium features
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Features List */}
        <View style={styles.featuresList}>
          <Text
            style={[styles.featuresListTitle, { color: theme.colors.primary }]}
          >
            Monetization Benefits
          </Text>
          <View style={styles.featuresListItem}>
            <MaterialIcons name="card-membership" size={20} color="#8B5CF6" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>Subscription Plans:</Text>{" "}
              Multiple tiers for different user needs
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="star" size={20} color="#F59E0B" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>Premium Features:</Text>{" "}
              Advanced analytics and AI insights
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="trending-up" size={20} color="#10B981" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>Revenue Growth:</Text>{" "}
              Scalable subscription model
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="people" size={20} color="#3B82F6" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>Market Expansion:</Text>{" "}
              Target different user segments
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
          Monetization & Market Expansion
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Premium features, subscription plans, and market growth
        </Text>
      </View>

      <ScrollView style={styles.fullContent}>
        <Text
          style={[
            styles.placeholderText,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Full monetization features implementation
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
    flexWrap: "wrap",
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: "#F8FAFC",
    padding: spacing.xs,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
    minWidth: (width - spacing.lg * 2 - spacing.xs * 4) / 3,
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
  sectionTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  planCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
    position: "relative",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  popularText: {
    ...typography.caption2,
    fontWeight: "600",
  },
  planHeader: {
    alignItems: "center",
    marginBottom: spacing.md,
  },
  planName: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  planPricing: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: spacing.xs,
  },
  planPrice: {
    ...typography.headline2,
    fontWeight: "700",
  },
  planPeriod: {
    ...typography.body2,
    marginLeft: spacing.xs,
  },
  savingsGuarantee: {
    ...typography.body2,
    fontWeight: "600",
  },
  planFeatures: {
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  featureText: {
    ...typography.body2,
    marginLeft: spacing.xs,
  },
  planLimits: {
    marginBottom: spacing.md,
  },
  limitsTitle: {
    ...typography.caption1,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  limitText: {
    ...typography.caption1,
    marginBottom: spacing.xs,
  },
  subscribeButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  subscribeButtonText: {
    ...typography.body2,
    fontWeight: "600",
  },
  featureCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  featureInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  featureName: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  featureDescription: {
    ...typography.body2,
    lineHeight: 20,
  },
  categoryBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    ...typography.caption2,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  usageInfo: {
    marginTop: spacing.sm,
  },
  usageText: {
    ...typography.caption1,
    marginBottom: spacing.xs,
  },
  usageBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
  usageFill: {
    height: "100%",
    borderRadius: 2,
  },
  pricingCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  pricingHeader: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  tierName: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  tierPrice: {
    ...typography.headline2,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  tierSavings: {
    ...typography.body2,
    fontWeight: "600",
  },
  targetAudience: {
    ...typography.caption1,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  valueProposition: {
    ...typography.body2,
    textAlign: "center",
    marginBottom: spacing.md,
    fontStyle: "italic",
  },
  tierFeatures: {
    marginTop: spacing.sm,
  },
  tierFeature: {
    ...typography.body2,
    marginBottom: spacing.xs,
  },
  segmentCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  segmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  segmentName: {
    ...typography.body1,
    fontWeight: "600",
  },
  strategyBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  strategyText: {
    ...typography.caption2,
    fontWeight: "600",
  },
  segmentDescription: {
    ...typography.body2,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  segmentMetrics: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.md,
  },
  metricItem: {
    alignItems: "center",
  },
  metricValue: {
    ...typography.body1,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  metricLabel: {
    ...typography.caption1,
  },
  targetFeatures: {
    marginTop: spacing.sm,
  },
  segmentFeaturesTitle: {
    ...typography.caption1,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  targetFeature: {
    ...typography.caption1,
    marginBottom: spacing.xs,
  },
  revenueCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  revenueTitle: {
    ...typography.body1,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  revenueGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  revenueMetric: {
    width: "48%",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  revenueValue: {
    ...typography.body1,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  revenueLabel: {
    ...typography.caption1,
  },
  subscriptionBreakdown: {
    marginTop: spacing.sm,
  },
  breakdownTitle: {
    ...typography.body2,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  breakdownItems: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownItem: {
    alignItems: "center",
  },
  breakdownLabel: {
    ...typography.caption1,
    marginBottom: spacing.xs,
  },
  breakdownValue: {
    ...typography.body2,
    fontWeight: "600",
  },
  upgradeCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
    alignItems: "center",
  },
  upgradeTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  upgradeDescription: {
    ...typography.body2,
    textAlign: "center",
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  upgradeSavings: {
    ...typography.body2,
    fontWeight: "600",
  },
  featuresList: {
    marginTop: spacing.lg,
  },
  featuresListTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  featuresListItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  featuresListText: {
    ...typography.body2,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
});
