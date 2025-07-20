import { InteractionManager } from "react-native";
import { logger } from "./logger";

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean = __DEV__;

  /**
   * Start measuring performance for a specific operation
   */
  startMeasure(name: string): void {
    if (!this.isEnabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
    });
  }

  /**
   * End measuring performance and log the result
   */
  endMeasure(name: string): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      logger.warn(`Performance metric "${name}" not found`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;

    // Log performance metrics
    if (metric.duration > 100) {
      logger.warn(
        `Slow operation detected: ${name} took ${metric.duration.toFixed(2)}ms`
      );
    } else {
      logger.debug(`Performance: ${name} took ${metric.duration.toFixed(2)}ms`);
    }

    this.metrics.delete(name);
    return metric.duration;
  }

  /**
   * Measure an async operation
   */
  async measureAsync<T>(name: string, operation: () => Promise<T>): Promise<T> {
    this.startMeasure(name);
    try {
      const result = await operation();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  /**
   * Measure a synchronous operation
   */
  measureSync<T>(name: string, operation: () => T): T {
    this.startMeasure(name);
    try {
      const result = operation();
      this.endMeasure(name);
      return result;
    } catch (error) {
      this.endMeasure(name);
      throw error;
    }
  }

  /**
   * Defer heavy operations until after interactions
   */
  deferOperation(operation: () => void): void {
    InteractionManager.runAfterInteractions(() => {
      operation();
    });
  }

  /**
   * Check if device is low-end for performance optimization
   */
  isLowEndDevice(): boolean {
    // This is a simplified check - in production you'd want more sophisticated detection
    const { width, height } = require("react-native").Dimensions.get("window");
    const screenArea = width * height;

    // Consider devices with smaller screens as potentially lower-end
    return screenArea < 2000000; // 2M pixels threshold
  }

  /**
   * Get memory usage information (if available)
   */
  getMemoryInfo(): { used: number; total: number } | null {
    if (__DEV__ && (global.performance as any)?.memory) {
      return {
        used: (global.performance as any).memory.usedJSHeapSize,
        total: (global.performance as any).memory.totalJSHeapSize,
      };
    }
    return null;
  }

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Get all current metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance optimization utilities
 */
export const performanceUtils = {
  /**
   * Debounce function calls to prevent excessive execution
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function calls to limit execution frequency
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Optimize image loading for better performance
   */
  optimizeImageLoading: {
    /**
     * Preload images for better perceived performance
     */
    preloadImages: (imageUrls: string[]): void => {
      imageUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    },

    /**
     * Get optimized image dimensions based on device
     */
    getOptimizedDimensions: (originalWidth: number, originalHeight: number) => {
      const { width: screenWidth } =
        require("react-native").Dimensions.get("window");
      const maxWidth = screenWidth * 0.8; // 80% of screen width

      if (originalWidth <= maxWidth) {
        return { width: originalWidth, height: originalHeight };
      }

      const ratio = maxWidth / originalWidth;
      return {
        width: maxWidth,
        height: originalHeight * ratio,
      };
    },
  },

  /**
   * Animation performance utilities
   */
  animation: {
    /**
     * Check if animations should be reduced for accessibility
     */
    shouldReduceMotion: (): boolean => {
      // In a real app, you'd check the user's accessibility settings
      return false;
    },

    /**
     * Get optimized animation duration based on device performance
     */
    getOptimizedDuration: (baseDuration: number): number => {
      if (performanceMonitor.isLowEndDevice()) {
        return baseDuration * 0.7; // 30% faster on low-end devices
      }
      return baseDuration;
    },

    /**
     * Use native driver when possible for better performance
     */
    useNativeDriver: (): boolean => {
      // Most animations can use native driver
      return true;
    },
  },

  /**
   * List performance optimization
   */
  list: {
    /**
     * Optimize FlatList performance
     */
    optimizeFlatList: {
      getItemLayout: (data: any[], index: number, itemHeight: number) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
      }),

      removeClippedSubviews: true,
      maxToRenderPerBatch: 10,
      updateCellsBatchingPeriod: 50,
      initialNumToRender: 10,
      windowSize: 10,
    },

    /**
     * Optimize ScrollView performance
     */
    optimizeScrollView: {
      removeClippedSubviews: true,
      showsVerticalScrollIndicator: false,
      showsHorizontalScrollIndicator: false,
    },
  },
};

/**
 * Performance hooks for React components
 */
export const usePerformance = () => {
  const measureRender = (componentName: string) => {
    performanceMonitor.startMeasure(`${componentName}_render`);

    return () => {
      performanceMonitor.endMeasure(`${componentName}_render`);
    };
  };

  const measureOperation = (operationName: string) => {
    return {
      start: () => performanceMonitor.startMeasure(operationName),
      end: () => performanceMonitor.endMeasure(operationName),
    };
  };

  return {
    measureRender,
    measureOperation,
    deferOperation: performanceMonitor.deferOperation.bind(performanceMonitor),
    isLowEndDevice: performanceMonitor.isLowEndDevice.bind(performanceMonitor),
  };
};

export default performanceMonitor;
