export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogContext {
  component?: string;
  function?: string;
  userId?: string;
  [key: string]: unknown;
}

class Logger {
  private level: LogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.INFO;

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatMessage(
    level: string,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${JSON.stringify(context)}]` : "";
    return `[${timestamp}] ${level}${contextStr}: ${message}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage("DEBUG", message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage("INFO", message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage("WARN", message, context));
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorContext = error
        ? { ...context, error: error.message, stack: error.stack }
        : context;
      console.error(this.formatMessage("ERROR", message, errorContext));
    }
  }

  // Convenience methods for common patterns
  auth(message: string, userId?: string): void {
    this.info(message, { component: "Auth", userId });
  }

  api(message: string, endpoint?: string): void {
    this.info(message, { component: "API", endpoint });
  }

  ocr(message: string, processingTime?: number): void {
    this.info(message, { component: "OCR", processingTime });
  }

  database(message: string, operation?: string): void {
    this.info(message, { component: "Database", operation });
  }

  component(message: string, componentName: string): void {
    this.debug(message, { component: componentName });
  }
}

export const logger = new Logger();

// Convenience exports for common logging patterns
export const logAuth = (message: string, userId?: string) =>
  logger.auth(message, userId);
export const logApi = (message: string, endpoint?: string) =>
  logger.api(message, endpoint);
export const logOcr = (message: string, processingTime?: number) =>
  logger.ocr(message, processingTime);
export const logDatabase = (message: string, operation?: string) =>
  logger.database(message, operation);
export const logComponent = (message: string, componentName: string) =>
  logger.component(message, componentName);
