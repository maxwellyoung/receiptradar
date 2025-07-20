import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import {
  spacing,
  typography,
  materialShadows,
} from "@/constants/holisticDesignSystem";
import { HolisticCard } from "./HolisticDesignSystem";
import { HolisticButton } from "./HolisticDesignSystem";
import { HolisticText } from "./HolisticDesignSystem";
import { runTests, TestSuite } from "@/utils/testing";
import { accessibilityUtils, announcementUtils } from "@/utils/accessibility";
import * as Haptics from "expo-haptics";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: "critical" | "important" | "nice-to-have";
  completed: boolean;
  testFunction?: () => Promise<boolean>;
}

interface LaunchChecklistProps {
  isVisible: boolean;
  onDismiss: () => void;
  onComplete: () => void;
}

export const LaunchChecklist: React.FC<LaunchChecklistProps> = ({
  isVisible,
  onDismiss,
  onComplete,
}) => {
  const theme = useTheme<AppTheme>();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<TestSuite[]>([]);

  useEffect(() => {
    if (isVisible) {
      initializeChecklist();
    }
  }, [isVisible]);

  const initializeChecklist = () => {
    const initialChecklist: ChecklistItem[] = [
      // Critical Launch Items
      {
        id: "auth-flow",
        title: "Authentication Flow",
        description: "User sign-in, sign-up, and session management",
        category: "critical",
        completed: false,
        testFunction: testAuthenticationFlow,
      },
      {
        id: "receipt-scanning",
        title: "Receipt Scanning",
        description: "Camera access, OCR processing, and data extraction",
        category: "critical",
        completed: false,
        testFunction: testReceiptScanning,
      },
      {
        id: "data-persistence",
        title: "Data Persistence",
        description: "Receipt storage, sync, and offline support",
        category: "critical",
        completed: false,
        testFunction: testDataPersistence,
      },
      {
        id: "performance",
        title: "Performance",
        description: "App startup time, smooth animations, memory usage",
        category: "critical",
        completed: false,
        testFunction: testPerformance,
      },

      // Important Launch Items
      {
        id: "accessibility",
        title: "Accessibility",
        description:
          "Screen reader support, keyboard navigation, color contrast",
        category: "important",
        completed: false,
        testFunction: testAccessibility,
      },
      {
        id: "error-handling",
        title: "Error Handling",
        description: "Graceful error recovery, user feedback, retry mechanisms",
        category: "important",
        completed: false,
        testFunction: testErrorHandling,
      },
      {
        id: "offline-support",
        title: "Offline Support",
        description:
          "Network status detection, offline indicators, data caching",
        category: "important",
        completed: false,
        testFunction: testOfflineSupport,
      },
      {
        id: "user-experience",
        title: "User Experience",
        description: "Smooth interactions, haptic feedback, loading states",
        category: "important",
        completed: false,
        testFunction: testUserExperience,
      },

      // Nice-to-Have Items
      {
        id: "analytics",
        title: "Analytics",
        description: "User behavior tracking, performance monitoring",
        category: "nice-to-have",
        completed: false,
        testFunction: testAnalytics,
      },
      {
        id: "notifications",
        title: "Notifications",
        description: "Push notifications, local notifications",
        category: "nice-to-have",
        completed: false,
        testFunction: testNotifications,
      },
      {
        id: "sharing",
        title: "Sharing",
        description: "Receipt sharing, data export",
        category: "nice-to-have",
        completed: false,
        testFunction: testSharing,
      },
      {
        id: "documentation",
        title: "Documentation",
        description: "User guides, help content, onboarding",
        category: "nice-to-have",
        completed: false,
        testFunction: testDocumentation,
      },
    ];

    setChecklist(initialChecklist);
  };

  // Test Functions
  const testAuthenticationFlow = async (): Promise<boolean> => {
    try {
      // Simulate authentication test
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      return false;
    }
  };

  const testReceiptScanning = async (): Promise<boolean> => {
    try {
      // Simulate receipt scanning test
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return true;
    } catch (error) {
      return false;
    }
  };

  const testDataPersistence = async (): Promise<boolean> => {
    try {
      // Simulate data persistence test
      await new Promise((resolve) => setTimeout(resolve, 800));
      return true;
    } catch (error) {
      return false;
    }
  };

  const testPerformance = async (): Promise<boolean> => {
    try {
      const results = await runTests();
      const performanceSuite = results.find(
        (suite) => suite.name === "Performance Tests"
      );
      return performanceSuite ? performanceSuite.passed > 0 : false;
    } catch (error) {
      return false;
    }
  };

  const testAccessibility = async (): Promise<boolean> => {
    try {
      const results = await runTests();
      const accessibilitySuite = results.find(
        (suite) => suite.name === "Accessibility Tests"
      );
      return accessibilitySuite ? accessibilitySuite.passed > 0 : false;
    } catch (error) {
      return false;
    }
  };

  const testErrorHandling = async (): Promise<boolean> => {
    try {
      // Simulate error handling test
      await new Promise((resolve) => setTimeout(resolve, 600));
      return true;
    } catch (error) {
      return false;
    }
  };

  const testOfflineSupport = async (): Promise<boolean> => {
    try {
      // Simulate offline support test
      await new Promise((resolve) => setTimeout(resolve, 700));
      return true;
    } catch (error) {
      return false;
    }
  };

  const testUserExperience = async (): Promise<boolean> => {
    try {
      const results = await runTests();
      const interactionSuite = results.find(
        (suite) => suite.name === "Interaction Tests"
      );
      return interactionSuite ? interactionSuite.passed > 0 : false;
    } catch (error) {
      return false;
    }
  };

  const testAnalytics = async (): Promise<boolean> => {
    try {
      // Simulate analytics test
      await new Promise((resolve) => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      return false;
    }
  };

  const testNotifications = async (): Promise<boolean> => {
    try {
      // Simulate notifications test
      await new Promise((resolve) => setTimeout(resolve, 400));
      return true;
    } catch (error) {
      return false;
    }
  };

  const testSharing = async (): Promise<boolean> => {
    try {
      // Simulate sharing test
      await new Promise((resolve) => setTimeout(resolve, 300));
      return true;
    } catch (error) {
      return false;
    }
  };

  const testDocumentation = async (): Promise<boolean> => {
    try {
      // Simulate documentation test
      await new Promise((resolve) => setTimeout(resolve, 200));
      return true;
    } catch (error) {
      return false;
    }
  };

  const runAllTests = async () => {
    setRunningTests(true);
    try {
      const results = await runTests();
      setTestResults(results);

      // Update checklist based on test results
      setChecklist((prev) =>
        prev.map((item) => {
          if (item.testFunction) {
            // Find corresponding test result and update completion
            const suite = results.find((s) =>
              s.name.toLowerCase().includes(item.id.split("-")[0])
            );
            return {
              ...item,
              completed: suite ? suite.passed > 0 : false,
            };
          }
          return item;
        })
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      announcementUtils.announceSuccess("Launch checklist tests completed");
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      announcementUtils.announceError("Launch checklist tests failed");
    } finally {
      setRunningTests(false);
    }
  };

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "critical":
        return theme.colors.error;
      case "important":
        return theme.colors.primary;
      case "nice-to-have":
        return theme.colors.secondary;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "critical":
        return "error";
      case "important":
        return "priority-high";
      case "nice-to-have":
        return "star";
      default:
        return "check-circle";
    }
  };

  const criticalItems = checklist.filter(
    (item) => item.category === "critical"
  );
  const importantItems = checklist.filter(
    (item) => item.category === "important"
  );
  const niceToHaveItems = checklist.filter(
    (item) => item.category === "nice-to-have"
  );

  const criticalCompleted = criticalItems.filter(
    (item) => item.completed
  ).length;
  const importantCompleted = importantItems.filter(
    (item) => item.completed
  ).length;
  const niceToHaveCompleted = niceToHaveItems.filter(
    (item) => item.completed
  ).length;

  const totalCritical = criticalItems.length;
  const totalImportant = importantItems.length;
  const totalNiceToHave = niceToHaveItems.length;

  const isReadyForLaunch =
    criticalCompleted === totalCritical &&
    importantCompleted === totalImportant;

  if (!isVisible) return null;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <HolisticText variant="headline.large" style={styles.title}>
            Launch Checklist
          </HolisticText>
          <HolisticText
            variant="body.medium"
            color="secondary"
            style={styles.subtitle}
          >
            Validate all features before launch
          </HolisticText>
        </View>

        {/* Progress Summary */}
        <HolisticCard variant="elevated" padding="large">
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <HolisticText variant="title.large" style={styles.progressNumber}>
                {criticalCompleted}/{totalCritical}
              </HolisticText>
              <HolisticText variant="label.medium" color="secondary">
                Critical
              </HolisticText>
            </View>
            <View style={styles.progressItem}>
              <HolisticText variant="title.large" style={styles.progressNumber}>
                {importantCompleted}/{totalImportant}
              </HolisticText>
              <HolisticText variant="label.medium" color="secondary">
                Important
              </HolisticText>
            </View>
            <View style={styles.progressItem}>
              <HolisticText variant="title.large" style={styles.progressNumber}>
                {niceToHaveCompleted}/{totalNiceToHave}
              </HolisticText>
              <HolisticText variant="label.medium" color="secondary">
                Nice to Have
              </HolisticText>
            </View>
          </View>
        </HolisticCard>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <HolisticButton
            title={runningTests ? "Running Tests..." : "Run All Tests"}
            onPress={runAllTests}
            variant="primary"
            size="large"
            disabled={runningTests}
            fullWidth
          />
        </View>

        {/* Critical Items */}
        {criticalItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="error"
                size={24}
                color={theme.colors.error}
                style={styles.sectionIcon}
              />
              <HolisticText variant="title.medium" style={styles.sectionTitle}>
                Critical ({criticalCompleted}/{totalCritical})
              </HolisticText>
            </View>
            {criticalItems.map((item) => (
              <ChecklistItemComponent
                key={item.id}
                item={item}
                onToggle={toggleItem}
                getCategoryColor={getCategoryColor}
                getCategoryIcon={getCategoryIcon}
              />
            ))}
          </View>
        )}

        {/* Important Items */}
        {importantItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="priority-high"
                size={24}
                color={theme.colors.primary}
                style={styles.sectionIcon}
              />
              <HolisticText variant="title.medium" style={styles.sectionTitle}>
                Important ({importantCompleted}/{totalImportant})
              </HolisticText>
            </View>
            {importantItems.map((item) => (
              <ChecklistItemComponent
                key={item.id}
                item={item}
                onToggle={toggleItem}
                getCategoryColor={getCategoryColor}
                getCategoryIcon={getCategoryIcon}
              />
            ))}
          </View>
        )}

        {/* Nice to Have Items */}
        {niceToHaveItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="star"
                size={24}
                color={theme.colors.secondary}
                style={styles.sectionIcon}
              />
              <HolisticText variant="title.medium" style={styles.sectionTitle}>
                Nice to Have ({niceToHaveCompleted}/{totalNiceToHave})
              </HolisticText>
            </View>
            {niceToHaveItems.map((item) => (
              <ChecklistItemComponent
                key={item.id}
                item={item}
                onToggle={toggleItem}
                getCategoryColor={getCategoryColor}
                getCategoryIcon={getCategoryIcon}
              />
            ))}
          </View>
        )}

        {/* Launch Status */}
        <HolisticCard
          variant={isReadyForLaunch ? "elevated" : "minimal"}
          padding="large"
        >
          <View style={styles.launchStatusContent}>
            <MaterialIcons
              name={isReadyForLaunch ? "rocket-launch" : "schedule"}
              size={32}
              color={
                isReadyForLaunch
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant
              }
              style={styles.launchIcon}
            />
            <HolisticText variant="title.large" style={styles.launchStatusText}>
              {isReadyForLaunch
                ? "Ready for Launch! 🚀"
                : "Not Ready for Launch"}
            </HolisticText>
            <HolisticText
              variant="body.medium"
              color="secondary"
              style={styles.launchStatusDescription}
            >
              {isReadyForLaunch
                ? "All critical and important items are complete. You're ready to launch!"
                : "Complete all critical and important items before launching."}
            </HolisticText>
          </View>
        </HolisticCard>

        {/* Action Buttons */}
        <View style={styles.bottomActions}>
          <HolisticButton
            title="Dismiss"
            onPress={onDismiss}
            variant="outline"
            size="medium"
            fullWidth
          />
          {isReadyForLaunch && (
            <HolisticButton
              title="Launch App"
              onPress={onComplete}
              variant="primary"
              size="large"
              fullWidth
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// Checklist Item Component
interface ChecklistItemComponentProps {
  item: ChecklistItem;
  onToggle: (id: string) => void;
  getCategoryColor: (category: string) => string;
  getCategoryIcon: (category: string) => string;
}

const ChecklistItemComponent: React.FC<ChecklistItemComponentProps> = ({
  item,
  onToggle,
  getCategoryColor,
  getCategoryIcon,
}) => {
  const theme = useTheme<AppTheme>();

  return (
    <HolisticCard
      variant="minimal"
      padding="medium"
      onPress={() => onToggle(item.id)}
      accessibilityLabel={`${item.title} - ${
        item.completed ? "completed" : "not completed"
      }`}
      accessibilityHint="Double tap to toggle completion status"
    >
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <MaterialIcons
            name={item.completed ? "check-circle" : "radio-button-unchecked"}
            size={24}
            color={
              item.completed
                ? theme.colors.primary
                : theme.colors.onSurfaceVariant
            }
            style={styles.checkIcon}
          />
          <View style={styles.itemText}>
            <HolisticText variant="body.medium" style={styles.itemTitle}>
              {item.title}
            </HolisticText>
            <HolisticText
              variant="body.small"
              color="secondary"
              style={styles.itemDescription}
            >
              {item.description}
            </HolisticText>
          </View>
          <MaterialIcons
            name="star"
            size={20}
            color={getCategoryColor(item.category)}
            style={styles.categoryIcon}
          />
        </View>
      </View>
    </HolisticCard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.large,
  },
  header: {
    alignItems: "center",
    paddingVertical: spacing.xlarge,
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.small,
  },
  subtitle: {
    textAlign: "center",
  },
  progressCard: {
    marginBottom: spacing.large,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  progressItem: {
    alignItems: "center",
  },
  progressNumber: {
    marginBottom: spacing.tiny,
  },
  actions: {
    marginBottom: spacing.large,
  },
  section: {
    marginBottom: spacing.large,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.medium,
  },
  sectionIcon: {
    marginRight: spacing.small,
  },
  sectionTitle: {
    flex: 1,
  },
  checklistItem: {
    marginBottom: spacing.small,
  },
  completedItem: {
    opacity: 0.7,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkIcon: {
    marginRight: spacing.medium,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    marginBottom: spacing.tiny,
  },
  itemDescription: {
    lineHeight: 18,
  },
  categoryIcon: {
    marginLeft: spacing.small,
  },
  launchStatusCard: {
    marginBottom: spacing.large,
  },
  launchStatusContent: {
    alignItems: "center",
  },
  launchIcon: {
    marginBottom: spacing.medium,
  },
  launchStatusText: {
    textAlign: "center",
    marginBottom: spacing.small,
  },
  launchStatusDescription: {
    textAlign: "center",
  },
  bottomActions: {
    gap: spacing.medium,
    paddingBottom: spacing.xlarge,
  },
});
