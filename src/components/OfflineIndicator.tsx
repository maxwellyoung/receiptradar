import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
// Note: @react-native-community/netinfo needs to be installed
// For now, we'll create a mock implementation
const NetInfo = {
  addEventListener: (callback: (state: any) => void) => {
    // Mock implementation
    return () => {};
  },
  fetch: () => Promise.resolve({ isConnected: true }),
};
import {
  spacing,
  typography,
  materialShadows,
  interactions,
} from "@/constants/holisticDesignSystem";
import * as Haptics from "expo-haptics";

interface OfflineIndicatorProps {
  onRetry?: () => void;
  showRetryButton?: boolean;
  position?: "top" | "bottom";
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  onRetry,
  showRetryButton = true,
  position = "top",
}) => {
  const theme = useTheme<AppTheme>();
  const [isOffline, setIsOffline] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const translateY = useRef(new Animated.Value(-100)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(
      (state: { isConnected?: boolean }) => {
        const wasOffline = isOffline;
        const nowOffline = !state.isConnected;

        if (nowOffline !== wasOffline) {
          setIsOffline(nowOffline);

          if (nowOffline) {
            // Going offline
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            showIndicator();
          } else {
            // Going online
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            hideIndicator();
          }
        }
      }
    );

    return () => unsubscribe();
  }, [isOffline]);

  const showIndicator = () => {
    setIsVisible(true);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: interactions.transitions.fast,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: interactions.transitions.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: interactions.transitions.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideIndicator = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === "top" ? -100 : 100,
        duration: interactions.transitions.fast,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: interactions.transitions.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: interactions.transitions.fast,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
    });
  };

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior - check network status
      NetInfo.fetch();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale }],
          opacity,
          top: position === "top" ? 0 : undefined,
          bottom: position === "bottom" ? 0 : undefined,
        },
      ]}
    >
      <View
        style={[
          styles.indicator,
          {
            backgroundColor: isOffline
              ? theme.colors.errorContainer
              : theme.colors.primaryContainer,
          },
        ]}
      >
        <View style={styles.content}>
          <MaterialIcons
            name={isOffline ? "wifi-off" : "wifi"}
            size={20}
            color={isOffline ? theme.colors.error : theme.colors.primary}
          />
          <Text
            style={[
              styles.text,
              {
                color: isOffline
                  ? theme.colors.onErrorContainer
                  : theme.colors.onPrimaryContainer,
              },
            ]}
          >
            {isOffline ? "You're offline" : "Back online"}
          </Text>
        </View>

        {showRetryButton && isOffline && (
          <TouchableOpacity
            style={[
              styles.retryButton,
              {
                backgroundColor: theme.colors.error,
              },
            ]}
            onPress={handleRetry}
            activeOpacity={0.8}
          >
            <MaterialIcons name="refresh" size={16} color="white" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

// Network status hook
export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(
      (state: { isConnected?: boolean; type?: string }) => {
        setIsConnected(state.isConnected ?? true);
        setConnectionType(state.type || null);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    isConnected,
    connectionType,
    isWifi: connectionType === "wifi",
    isCellular: connectionType === "cellular",
  };
};

// Offline banner component
interface OfflineBannerProps {
  message?: string;
  onRetry?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  message = "No internet connection. Some features may be unavailable.",
  onRetry,
}) => {
  const theme = useTheme<AppTheme>();
  const { isConnected } = useNetworkStatus();

  if (isConnected) {
    return null;
  }

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: theme.colors.errorContainer,
        },
      ]}
    >
      <View style={styles.bannerContent}>
        <MaterialIcons name="wifi-off" size={20} color={theme.colors.error} />
        <Text
          style={[
            styles.bannerText,
            {
              color: theme.colors.onErrorContainer,
            },
          ]}
        >
          {message}
        </Text>
      </View>

      {onRetry && (
        <TouchableOpacity
          style={[
            styles.bannerRetryButton,
            {
              backgroundColor: theme.colors.error,
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onRetry();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.bannerRetryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing.large,
    right: spacing.large,
    zIndex: 1000,
    ...materialShadows.medium,
  },
  indicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  text: {
    ...typography.label.medium,
    marginLeft: spacing.small,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: 8,
    gap: spacing.tiny,
  },
  retryText: {
    ...typography.label.small,
    color: "white",
    fontWeight: "600",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    ...materialShadows.subtle,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bannerText: {
    ...typography.body.medium,
    marginLeft: spacing.small,
    flex: 1,
  },
  bannerRetryButton: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: 8,
  },
  bannerRetryText: {
    ...typography.label.small,
    color: "white",
    fontWeight: "600",
  },
});
