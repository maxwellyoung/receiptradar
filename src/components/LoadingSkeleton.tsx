import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import {
  spacing,
  typography,
  materialShadows,
  interactions,
} from "@/constants/holisticDesignSystem";

const { width: screenWidth } = Dimensions.get("window");

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

interface LoadingSkeletonProps {
  type?: "receipt" | "dashboard" | "processing" | "search";
  count?: number;
}

// Individual skeleton item with shimmer animation
const SkeletonItem: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const theme = useTheme<AppTheme>();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );
    shimmerLoop.start();

    return () => shimmerLoop.stop();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeletonItem,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.surfaceVariant,
          opacity: shimmerOpacity,
        },
        style,
      ]}
    />
  );
};

// Receipt card skeleton
const ReceiptSkeleton: React.FC = () => {
  const theme = useTheme<AppTheme>();

  return (
    <View
      style={[
        styles.receiptSkeleton,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <View style={styles.receiptHeader}>
        <View style={styles.storeInfo}>
          <SkeletonItem width={40} height={40} borderRadius={20} />
          <View style={styles.storeDetails}>
            <SkeletonItem width="80%" height={16} />
            <SkeletonItem width="60%" height={12} style={{ marginTop: 4 }} />
          </View>
        </View>
        <SkeletonItem width={80} height={20} />
      </View>

      <View style={styles.receiptContent}>
        <SkeletonItem width="70%" height={12} />
        <SkeletonItem width="50%" height={12} style={{ marginTop: 4 }} />
        <SkeletonItem width="40%" height={12} style={{ marginTop: 4 }} />
      </View>

      <View style={styles.receiptFooter}>
        <SkeletonItem width={100} height={16} />
        <SkeletonItem width={20} height={20} borderRadius={10} />
      </View>
    </View>
  );
};

// Dashboard skeleton
const DashboardSkeleton: React.FC = () => {
  const theme = useTheme<AppTheme>();

  return (
    <View style={styles.dashboardSkeleton}>
      {/* Header */}
      <View style={styles.dashboardHeader}>
        <SkeletonItem width={200} height={32} />
        <SkeletonItem width={150} height={16} style={{ marginTop: 8 }} />
      </View>

      {/* Primary Action */}
      <SkeletonItem
        width="100%"
        height={56}
        borderRadius={12}
        style={{ marginVertical: 16 }}
      />

      {/* Stats Card */}
      <View
        style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <SkeletonItem width={60} height={24} />
            <SkeletonItem width={80} height={12} style={{ marginTop: 4 }} />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <SkeletonItem width={60} height={24} />
            <SkeletonItem width={80} height={12} style={{ marginTop: 4 }} />
          </View>
        </View>
      </View>

      {/* Receipts */}
      <View style={styles.receiptsList}>
        {[1, 2, 3].map((index) => (
          <ReceiptSkeleton key={index} />
        ))}
      </View>
    </View>
  );
};

// Processing skeleton
const ProcessingSkeleton: React.FC = () => {
  const theme = useTheme<AppTheme>();

  return (
    <View style={styles.processingSkeleton}>
      {/* Header */}
      <View style={styles.processingHeader}>
        <SkeletonItem width={180} height={28} />
        <SkeletonItem width={140} height={16} style={{ marginTop: 8 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <SkeletonItem width="100%" height={8} borderRadius={4} />
        <SkeletonItem
          width={60}
          height={14}
          style={{ marginTop: 8, alignSelf: "center" }}
        />
      </View>

      {/* Current Step */}
      <View
        style={[styles.stepCard, { backgroundColor: theme.colors.surface }]}
      >
        <View style={styles.stepContent}>
          <View style={styles.stepHeader}>
            <SkeletonItem width={64} height={64} borderRadius={32} />
            <View style={styles.stepInfo}>
              <SkeletonItem width="70%" height={18} />
              <SkeletonItem width="90%" height={14} style={{ marginTop: 4 }} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

// Search skeleton
const SearchSkeleton: React.FC = () => {
  const theme = useTheme<AppTheme>();

  return (
    <View style={styles.searchSkeleton}>
      {/* Search Bar */}
      <SkeletonItem width="100%" height={48} borderRadius={12} />

      {/* Search Results */}
      <View style={styles.searchResults}>
        {[1, 2, 3, 4].map((index) => (
          <View
            key={index}
            style={[
              styles.searchItem,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.searchItemContent}>
              <SkeletonItem width={40} height={40} borderRadius={20} />
              <View style={styles.searchItemInfo}>
                <SkeletonItem width="80%" height={16} />
                <SkeletonItem
                  width="60%"
                  height={12}
                  style={{ marginTop: 4 }}
                />
              </View>
              <SkeletonItem width={16} height={16} borderRadius={8} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// Main LoadingSkeleton component
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = "receipt",
  count = 3,
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case "dashboard":
        return <DashboardSkeleton />;
      case "processing":
        return <ProcessingSkeleton />;
      case "search":
        return <SearchSkeleton />;
      default:
        return (
          <View style={styles.receiptsList}>
            {Array.from({ length: count }).map((_, index) => (
              <ReceiptSkeleton key={index} />
            ))}
          </View>
        );
    }
  };

  return <View style={styles.container}>{renderSkeleton()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  receiptSkeleton: {
    marginBottom: spacing.medium,
    padding: spacing.medium,
    borderRadius: 16,
    ...materialShadows.light,
  },
  receiptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.small,
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  storeDetails: {
    flex: 1,
    marginLeft: spacing.small,
  },
  receiptContent: {
    marginBottom: spacing.small,
  },
  receiptFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dashboardSkeleton: {
    padding: spacing.large,
  },
  dashboardHeader: {
    alignItems: "center",
    paddingVertical: spacing.large,
  },
  statsCard: {
    padding: spacing.medium,
    borderRadius: 12,
    marginBottom: spacing.large,
    ...materialShadows.subtle,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  receiptsList: {
    gap: spacing.medium,
  },
  processingSkeleton: {
    padding: spacing.large,
  },
  processingHeader: {
    alignItems: "center",
    paddingVertical: spacing.large,
  },
  progressContainer: {
    marginBottom: spacing.large,
  },
  stepCard: {
    borderRadius: 12,
    ...materialShadows.medium,
  },
  stepContent: {
    padding: spacing.medium,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepInfo: {
    flex: 1,
    marginLeft: spacing.medium,
  },
  searchSkeleton: {
    padding: spacing.large,
  },
  searchResults: {
    marginTop: spacing.large,
    gap: spacing.small,
  },
  searchItem: {
    padding: spacing.medium,
    borderRadius: 12,
    ...materialShadows.subtle,
  },
  searchItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchItemInfo: {
    flex: 1,
    marginLeft: spacing.small,
  },
  skeletonItem: {
    backgroundColor: "#E0E0E0",
  },
});
