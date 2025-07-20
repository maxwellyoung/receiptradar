import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
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

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// Error boundary component
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Here you would typically send the error to a logging service
    console.log("Error reported:", this.state.error);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          onReport={this.handleReport}
        />
      );
    }

    return this.props.children;
  }
}

// Error fallback component
interface ErrorFallbackProps {
  error?: Error;
  onRetry: () => void;
  onReport: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  onReport,
}) => {
  const theme = useTheme<AppTheme>();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.errorContainer}>
        {/* Error Icon */}
        <View
          style={[
            styles.errorIcon,
            { backgroundColor: theme.colors.errorContainer },
          ]}
        >
          <MaterialIcons
            name="error-outline"
            size={48}
            color={theme.colors.error}
          />
        </View>

        {/* Error Title */}
        <Text style={[styles.errorTitle, { color: theme.colors.onSurface }]}>
          Something went wrong
        </Text>

        {/* Error Message */}
        <Text
          style={[
            styles.errorMessage,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          We encountered an unexpected error. Please try again or report the
          issue if it persists.
        </Text>

        {/* Error Details (Development Only) */}
        {__DEV__ && error && (
          <View
            style={[
              styles.errorDetails,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Text
              style={[
                styles.errorDetailsTitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Error Details (Development)
            </Text>
            <Text
              style={[
                styles.errorDetailsText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {error.message}
            </Text>
            {error.stack && (
              <Text
                style={[
                  styles.errorDetailsText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {error.stack}
              </Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <MaterialIcons name="refresh" size={20} color="white" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.reportButton, { borderColor: theme.colors.outline }]}
            onPress={onReport}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="bug-report"
              size={20}
              color={theme.colors.primary}
            />
            <Text
              style={[styles.reportButtonText, { color: theme.colors.primary }]}
            >
              Report Issue
            </Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <Text
          style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}
        >
          If the problem continues, please contact support with the error
          details.
        </Text>
      </View>
    </ScrollView>
  );
};

// Network error component
interface NetworkErrorProps {
  onRetry: () => void;
  message?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  message = "No internet connection",
}) => {
  const theme = useTheme<AppTheme>();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.errorContainer}>
        <View
          style={[
            styles.errorIcon,
            { backgroundColor: theme.colors.errorContainer },
          ]}
        >
          <MaterialIcons name="wifi-off" size={48} color={theme.colors.error} />
        </View>

        <Text style={[styles.errorTitle, { color: theme.colors.onSurface }]}>
          Connection Error
        </Text>

        <Text
          style={[
            styles.errorMessage,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {message}
        </Text>

        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onRetry();
          }}
          activeOpacity={0.8}
        >
          <MaterialIcons name="refresh" size={20} color="white" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Empty state component
interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionText,
  onAction,
}) => {
  const theme = useTheme<AppTheme>();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.errorContainer}>
        <View
          style={[
            styles.errorIcon,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <MaterialIcons
            name={icon as any}
            size={48}
            color={theme.colors.onSurfaceVariant}
          />
        </View>

        <Text style={[styles.errorTitle, { color: theme.colors.onSurface }]}>
          {title}
        </Text>

        <Text
          style={[
            styles.errorMessage,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {message}
        </Text>

        {actionText && onAction && (
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onAction();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>{actionText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.large,
  },
  errorContainer: {
    alignItems: "center",
    padding: spacing.large,
  },
  errorIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.large,
    ...materialShadows.medium,
  },
  errorTitle: {
    ...typography.headline.medium,
    textAlign: "center",
    marginBottom: spacing.medium,
  },
  errorMessage: {
    ...typography.body.large,
    textAlign: "center",
    marginBottom: spacing.large,
    paddingHorizontal: spacing.medium,
  },
  errorDetails: {
    padding: spacing.medium,
    borderRadius: 12,
    marginBottom: spacing.large,
    width: "100%",
  },
  errorDetailsTitle: {
    ...typography.title.small,
    marginBottom: spacing.small,
  },
  errorDetailsText: {
    ...typography.body.small,
    fontFamily: "monospace",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.medium,
    marginBottom: spacing.large,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 12,
    gap: spacing.small,
    ...materialShadows.subtle,
  },
  retryButtonText: {
    ...typography.label.large,
    color: "white",
    fontWeight: "600",
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.small,
  },
  reportButtonText: {
    ...typography.label.large,
    fontWeight: "600",
  },
  helpText: {
    ...typography.body.small,
    textAlign: "center",
    paddingHorizontal: spacing.medium,
  },
});
