import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated, RefreshControl } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import {
  spacing,
  typography,
  materialShadows,
  interactions,
} from "@/constants/holisticDesignSystem";
import * as Haptics from "expo-haptics";

interface PullToRefreshProps {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
  threshold?: number;
  enabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  refreshing,
  onRefresh,
  children,
  threshold = 80,
  enabled = true,
}) => {
  const theme = useTheme<AppTheme>();
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handleStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY } = event.nativeEvent;

      if (translationY > threshold && !refreshing) {
        // Trigger refresh
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onRefresh();

        // Animate to refresh state
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: threshold,
            duration: interactions.transitions.fast,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: interactions.transitions.fast,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Reset to initial state
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: interactions.transitions.fast,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0,
            duration: interactions.transitions.fast,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: interactions.transitions.fast,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  // Update animations based on refreshing state
  useEffect(() => {
    if (refreshing) {
      // Start spinning animation
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      // Stop spinning and reset
      rotation.stopAnimation();
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: interactions.transitions.fast,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0,
          duration: interactions.transitions.fast,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: interactions.transitions.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [refreshing, translateY, scale, opacity, rotation]);

  // Update opacity based on pull distance
  useEffect(() => {
    const listener = translateY.addListener(({ value }) => {
      const progress = Math.min(value / threshold, 1);
      opacity.setValue(progress);
      scale.setValue(progress);
    });

    return () => translateY.removeListener(listener);
  }, [translateY, opacity, scale, threshold]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {/* Pull indicator */}
      <Animated.View
        style={[
          styles.pullIndicator,
          {
            transform: [{ translateY: translateY }, { scale }],
            opacity,
          },
        ]}
      >
        <View
          style={[
            styles.indicatorContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <MaterialIcons
              name={refreshing ? "refresh" : "keyboard-arrow-down"}
              size={24}
              color={theme.colors.primary}
            />
          </Animated.View>
          <Animated.Text
            style={[
              styles.indicatorText,
              { color: theme.colors.onSurface },
              { opacity },
            ]}
          >
            {refreshing ? "Refreshing..." : "Pull to refresh"}
          </Animated.Text>
        </View>
      </Animated.View>

      {/* Content */}
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
        enabled={!refreshing}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [
                {
                  translateY: translateY.interpolate({
                    inputRange: [0, threshold],
                    outputRange: [0, threshold / 2],
                    extrapolate: "clamp",
                  }),
                },
              ],
            },
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

// Enhanced RefreshControl component
interface EnhancedRefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void;
  colors?: string[];
  tintColor?: string;
  title?: string;
  titleColor?: string;
}

export const EnhancedRefreshControl: React.FC<EnhancedRefreshControlProps> = ({
  refreshing,
  onRefresh,
  colors,
  tintColor,
  title = "Pull to refresh",
  titleColor,
}) => {
  const theme = useTheme<AppTheme>();

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onRefresh();
      }}
      colors={colors || [theme.colors.primary]}
      tintColor={tintColor || theme.colors.primary}
      title={title}
      titleColor={titleColor || theme.colors.onSurfaceVariant}
      progressBackgroundColor={theme.colors.surface}
      progressViewOffset={spacing.large}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pullIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 25,
    ...materialShadows.medium,
  },
  iconContainer: {
    marginRight: spacing.small,
  },
  indicatorText: {
    ...typography.label.medium,
  },
  content: {
    flex: 1,
  },
});
