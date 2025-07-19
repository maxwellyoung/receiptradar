import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Text, Dimensions, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useThemeContext } from "@/contexts/ThemeContext";
import { spacing, borderRadius, shadows, typography } from "@/constants/theme";

const { width: screenWidth } = Dimensions.get("window");

interface ProcessingStep {
  name: string;
  description: string;
  icon: string;
}

interface ProcessingScreenProps {
  currentStep: number;
  progress: number;
  processingSteps: ProcessingStep[];
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  currentStep,
  progress,
  processingSteps,
}) => {
  const { theme } = useThemeContext();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for the processing icon
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // Cleanup function
    return () => {
      pulseLoop.stop();
    };

    // Progress animation
    Animated.timing(progressAnim, {
      toValue: progress / 100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [progress]);

  return (
    <View style={styles.container}>
      {/* Main Processing Card */}
      <View
        style={[styles.mainCard, { backgroundColor: theme.colors.surface }]}
      >
        {/* Processing Icon */}
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 200 }}
          style={styles.iconContainer}
        >
          <Animated.View
            style={[
              styles.processingIcon,
              {
                transform: [{ scale: pulseAnim }],
                backgroundColor: theme.colors.surfaceVariant,
              },
            ]}
          >
            <MaterialIcons
              name="hourglass-empty"
              size={32}
              color={theme.colors.primary}
            />
          </Animated.View>
        </MotiView>

        {/* Title Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600, delay: 300 }}
          style={styles.titleSection}
        >
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>
            Processing Receipt
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            {processingSteps[currentStep]?.description ||
              "Analyzing your receipt..."}
          </Text>
        </MotiView>

        {/* Progress Bar */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600, delay: 400 }}
          style={styles.progressContainer}
        >
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
        </MotiView>
      </View>

      {/* Simple Steps Indicator */}
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600, delay: 600 }}
        style={styles.stepsContainer}
      >
        <View
          style={[styles.stepsCard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.stepsRow}>
            {processingSteps.map((step, index) => (
              <View key={index} style={styles.stepIndicator}>
                <View
                  style={[
                    styles.stepDot,
                    {
                      backgroundColor:
                        index < currentStep
                          ? theme.colors.positive
                          : index === currentStep
                          ? theme.colors.primary
                          : theme.colors.surfaceVariant,
                    },
                  ]}
                >
                  {index < currentStep && (
                    <MaterialIcons
                      name="check"
                      size={12}
                      color={theme.colors.onPrimary}
                    />
                  )}
                </View>
                {index === currentStep && (
                  <Text
                    style={[
                      styles.currentStepText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {step.name}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  mainCard: {
    width: "100%",
    maxWidth: 400,
    padding: spacing.xxl,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  processingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.md,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.headline2,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    textAlign: "center",
    lineHeight: 24,
  },
  progressContainer: {
    width: "100%",
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  stepsContainer: {
    width: "100%",
    maxWidth: 400,
  },
  stepsCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepIndicator: {
    alignItems: "center",
    flex: 1,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  currentStepText: {
    ...typography.caption1,
    fontWeight: "600",
    textAlign: "center",
  },
});
