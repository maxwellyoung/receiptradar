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
