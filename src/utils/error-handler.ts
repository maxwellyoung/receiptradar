import { Alert, Platform } from "react-native";
import { logger } from "./logger";

export enum ErrorCode {
  // Authentication errors
  AUTH_FAILED = "AUTH_FAILED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  SESSION_EXPIRED = "SESSION_EXPIRED",

  // Network errors
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  API_ERROR = "API_ERROR",

  // OCR errors
  OCR_FAILED = "OCR_FAILED",
  IMAGE_PROCESSING_FAILED = "IMAGE_PROCESSING_FAILED",
  RECEIPT_PARSE_FAILED = "RECEIPT_PARSE_FAILED",
  RECEIPT_SAVE_FAILED = "RECEIPT_SAVE_FAILED",

  // Database errors
  DATABASE_ERROR = "DATABASE_ERROR",
  QUERY_FAILED = "QUERY_FAILED",
  CONNECTION_FAILED = "CONNECTION_FAILED",

  // Validation errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",

  // Business logic errors
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE",

  // Unknown errors
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public context?: Record<string, any>,
    public originalError?: Error
  ) {
    super(message);
    this.name = "AppError";

    // Maintain stack trace
    if (originalError?.stack) {
      this.stack = originalError.stack;
    }
  }
}

export const createError = (
  code: ErrorCode,
  message: string,
  context?: Record<string, any>,
  originalError?: Error
): AppError => {
  return new AppError(message, code, context, originalError);
};

export const handleAsyncError = <T>(
  promise: Promise<T>,
  context: string,
  fallbackMessage?: string
): Promise<T> => {
  return promise.catch((error) => {
    if (error instanceof AppError) {
      throw error;
    }

    const message =
      fallbackMessage || error.message || "An unexpected error occurred";
    throw createError(ErrorCode.UNKNOWN_ERROR, message, {
      context,
      originalError: error,
    });
  });
};

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const getErrorMessage = (error: unknown): string => {
  if (isAppError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};

export const logError = (error: unknown, context?: string): void => {
  if (__DEV__) {
    console.error(`[${context || "App"}] Error:`, error);
  }
  // In production, you might want to send to a logging service
};

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  timestamp: number;
  userId?: string;
  screen?: string;
  action?: string;
}

export interface ErrorHandlerConfig {
  showAlerts: boolean;
  logErrors: boolean;
  reportErrors: boolean;
  maxRetries: number;
  retryDelay: number;
}

class ErrorHandler {
  private config: ErrorHandlerConfig = {
    showAlerts: true,
    logErrors: true,
    reportErrors: __DEV__ ? false : true,
    maxRetries: 3,
    retryDelay: 1000,
  };

  private errorQueue: ErrorInfo[] = [];
  private retryCounts: Map<string, number> = new Map();

  /**
   * Handle a general error
   */
  handleError(
    error: Error | string,
    context?: {
      screen?: string;
      action?: string;
      userId?: string;
      details?: any;
    }
  ): void {
    const errorInfo: ErrorInfo = {
      message: typeof error === "string" ? error : error.message,
      code: (error as any)?.code,
      details: context?.details || (error as any)?.details,
      timestamp: Date.now(),
      userId: context?.userId,
      screen: context?.screen,
      action: context?.action,
    };

    // Log error
    if (this.config.logErrors) {
      logger.error("Error occurred:", errorInfo);
    }

    // Add to queue for reporting
    if (this.config.reportErrors) {
      this.errorQueue.push(errorInfo);
    }

    // Show alert if configured
    if (this.config.showAlerts) {
      this.showErrorAlert(errorInfo);
    }
  }

  /**
   * Handle network errors specifically
   */
  handleNetworkError(
    error: Error,
    context?: {
      screen?: string;
      action?: string;
      userId?: string;
      retryKey?: string;
    }
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const retryKey = context?.retryKey || "default";
      const retryCount = this.retryCounts.get(retryKey) || 0;

      if (retryCount < this.config.maxRetries) {
        // Increment retry count
        this.retryCounts.set(retryKey, retryCount + 1);

        // Log retry attempt
        logger.warn(
          `Network error, retrying (${retryCount + 1}/${
            this.config.maxRetries
          }):`,
          error.message
        );

        // Retry after delay
        setTimeout(() => {
          resolve(true); // Indicate retry should be attempted
        }, this.config.retryDelay * (retryCount + 1));
      } else {
        // Max retries reached
        this.retryCounts.delete(retryKey);
        this.handleError(error, context);
        resolve(false); // Indicate no more retries
      }
    });
  }

  /**
   * Handle validation errors
   */
  handleValidationError(
    field: string,
    message: string,
    context?: {
      screen?: string;
      action?: string;
      userId?: string;
    }
  ): void {
    const error = new Error(`Validation error: ${field} - ${message}`);
    this.handleError(error, {
      ...context,
      details: { field, message },
    });
  }

  /**
   * Handle permission errors
   */
  handlePermissionError(
    permission: string,
    context?: {
      screen?: string;
      action?: string;
      userId?: string;
    }
  ): void {
    const error = new Error(`Permission denied: ${permission}`);
    this.handleError(error, {
      ...context,
      details: { permission },
    });

    // Show specific permission guidance
    this.showPermissionAlert(permission);
  }

  /**
   * Handle storage errors
   */
  handleStorageError(
    error: Error,
    context?: {
      screen?: string;
      action?: string;
      userId?: string;
      operation?: string;
    }
  ): void {
    const errorInfo: ErrorInfo = {
      message: `Storage error: ${error.message}`,
      code: (error as any)?.code,
      details: {
        operation: context?.operation,
        ...context?.details,
      },
      timestamp: Date.now(),
      userId: context?.userId,
      screen: context?.screen,
      action: context?.action,
    };

    logger.error("Storage error:", errorInfo);

    // Show storage-specific error message
    this.showStorageErrorAlert(errorInfo);
  }

  /**
   * Handle camera/OCR errors
   */
  handleCameraError(
    error: Error,
    context?: {
      screen?: string;
      action?: string;
      userId?: string;
    }
  ): void {
    const errorInfo: ErrorInfo = {
      message: `Camera error: ${error.message}`,
      code: (error as any)?.code,
      details: context?.details,
      timestamp: Date.now(),
      userId: context?.userId,
      screen: context?.screen,
      action: context?.action,
    };

    logger.error("Camera error:", errorInfo);

    // Show camera-specific error message
    this.showCameraErrorAlert(errorInfo);
  }

  /**
   * Show error alert to user
   */
  private showErrorAlert(errorInfo: ErrorInfo): void {
    const title = "Something went wrong";
    const message = this.getUserFriendlyMessage(errorInfo.message);

    Alert.alert(
      title,
      message,
      [
        {
          text: "OK",
          style: "default",
        },
      ],
      { cancelable: true }
    );
  }

  /**
   * Show permission-specific alert
   */
  private showPermissionAlert(permission: string): void {
    const permissionMessages: {
      [key: string]: { title: string; message: string };
    } = {
      camera: {
        title: "Camera Access Required",
        message:
          "Please enable camera access in your device settings to scan receipts.",
      },
      photos: {
        title: "Photo Library Access Required",
        message:
          "Please enable photo library access to select receipts from your gallery.",
      },
      notifications: {
        title: "Notification Permission Required",
        message:
          "Please enable notifications to receive spending insights and alerts.",
      },
    };

    const config = permissionMessages[permission] || {
      title: "Permission Required",
      message: `Please enable ${permission} access in your device settings.`,
    };

    Alert.alert(config.title, config.message, [
      {
        text: "Open Settings",
        onPress: () => this.openSettings(),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  }

  /**
   * Show storage-specific error alert
   */
  private showStorageErrorAlert(errorInfo: ErrorInfo): void {
    Alert.alert(
      "Storage Error",
      "There was an issue saving your data. Please try again or contact support if the problem persists.",
      [
        {
          text: "Try Again",
          onPress: () => {
            // Trigger retry logic
            logger.info("User requested retry for storage error");
          },
        },
        {
          text: "OK",
          style: "cancel",
        },
      ]
    );
  }

  /**
   * Show camera-specific error alert
   */
  private showCameraErrorAlert(errorInfo: ErrorInfo): void {
    Alert.alert(
      "Camera Error",
      "There was an issue with the camera. Please check your camera permissions and try again.",
      [
        {
          text: "Check Permissions",
          onPress: () => this.openSettings(),
        },
        {
          text: "Try Again",
          onPress: () => {
            // Trigger retry logic
            logger.info("User requested retry for camera error");
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(errorMessage: string): string {
    const messageMap: { [key: string]: string } = {
      "Network request failed":
        "Please check your internet connection and try again.",
      Timeout: "The request took too long. Please try again.",
      "Permission denied":
        "Please check your device permissions and try again.",
      "Storage quota exceeded":
        "Your device storage is full. Please free up some space.",
      "Invalid input": "Please check your input and try again.",
      "Server error":
        "Our servers are experiencing issues. Please try again later.",
      Unauthorized: "Please sign in again to continue.",
    };

    // Check for exact matches
    if (messageMap[errorMessage]) {
      return messageMap[errorMessage];
    }

    // Check for partial matches
    for (const [key, value] of Object.entries(messageMap)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    // Default message
    return "An unexpected error occurred. Please try again.";
  }

  /**
   * Open device settings
   */
  private openSettings(): void {
    if (Platform.OS === "ios") {
      // iOS: Open app settings
      const { Linking } = require("react-native");
      Linking.openURL("app-settings:");
    } else {
      // Android: Open app settings
      const { Linking } = require("react-native");
      Linking.openSettings();
    }
  }

  /**
   * Configure error handler
   */
  configure(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get error queue for reporting
   */
  getErrorQueue(): ErrorInfo[] {
    return [...this.errorQueue];
  }

  /**
   * Clear error queue
   */
  clearErrorQueue(): void {
    this.errorQueue = [];
  }

  /**
   * Reset retry counts
   */
  resetRetryCounts(): void {
    this.retryCounts.clear();
  }
}

export const errorHandler = new ErrorHandler();

/**
 * Error handling utilities
 */
export const errorUtils = {
  /**
   * Wrap async operations with error handling
   */
  async withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: {
      screen?: string;
      action?: string;
      userId?: string;
      retryKey?: string;
    }
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Error) {
        // Check if it's a network error
        if (
          error.message.includes("Network") ||
          error.message.includes("fetch")
        ) {
          const shouldRetry = await errorHandler.handleNetworkError(
            error,
            context
          );
          if (shouldRetry) {
            return this.withErrorHandling(operation, context);
          }
        } else {
          errorHandler.handleError(error, context);
        }
      } else {
        errorHandler.handleError(String(error), context);
      }
      return null;
    }
  },

  /**
   * Create a retry wrapper for operations
   */
  withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): () => Promise<T> {
    return async () => {
      let lastError: Error;

      for (let i = 0; i < maxRetries; i++) {
        try {
          return await operation();
        } catch (error) {
          lastError = error as Error;

          if (i < maxRetries - 1) {
            await new Promise((resolve) =>
              setTimeout(resolve, delay * (i + 1))
            );
          }
        }
      }

      throw lastError!;
    };
  },

  /**
   * Validate required fields
   */
  validateRequired(
    fields: { [key: string]: any },
    context?: {
      screen?: string;
      action?: string;
      userId?: string;
    }
  ): boolean {
    for (const [field, value] of Object.entries(fields)) {
      if (value === undefined || value === null || value === "") {
        errorHandler.handleValidationError(
          field,
          "This field is required",
          context
        );
        return false;
      }
    }
    return true;
  },

  /**
   * Validate email format
   */
  validateEmail(
    email: string,
    context?: {
      screen?: string;
      action?: string;
      userId?: string;
    }
  ): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorHandler.handleValidationError(
        "email",
        "Please enter a valid email address",
        context
      );
      return false;
    }
    return true;
  },
};

export default errorHandler;
