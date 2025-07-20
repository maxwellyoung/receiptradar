import { InteractionManager, Animated } from "react-native";
import { logger } from "./logger";

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric> = new Map();
  private timers: Map<string, number> = new Map();
  private isEnabled: boolean = __DEV__;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

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
    this.timers.clear();
  }

  startTimer(name: string): void {
    this.timers.set(name, Date.now());
  }

  endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer '${name}' was not started`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.metrics.set(name, {
      name,
      startTime: startTime,
      endTime: Date.now(),
      duration: duration,
    });
    this.timers.delete(name);

    if (__DEV__) {
      console.log(`⏱️ ${name}: ${duration}ms`);
    }

    return duration;
  }

  getMetric(name: string): number | undefined {
    return this.metrics.get(name)?.duration;
  }

  getAllMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    this.metrics.forEach((metric, name) => {
      result[name] = metric.duration || 0;
    });
    return result;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

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

// Animation cleanup utilities
export class AnimationManager {
  private animations: Set<Animated.CompositeAnimation> = new Set();

  addAnimation(animation: Animated.CompositeAnimation): void {
    this.animations.add(animation);
  }

  removeAnimation(animation: Animated.CompositeAnimation): void {
    this.animations.delete(animation);
  }

  stopAllAnimations(): void {
    this.animations.forEach((animation) => {
      animation.stop();
    });
    this.animations.clear();
  }

  cleanup(): void {
    this.stopAllAnimations();
  }
}

// Memory management utilities
export class MemoryManager {
  private static instance: MemoryManager;
  private listeners: Set<() => void> = new Set();

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  addCleanupListener(listener: () => void): void {
    this.listeners.add(listener);
  }

  removeCleanupListener(listener: () => void): void {
    this.listeners.delete(listener);
  }

  cleanup(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.warn("Cleanup listener error:", error);
      }
    });
  }
}

// Optimized animation utilities
export const createOptimizedAnimation = (
  value: Animated.Value,
  config: Animated.TimingAnimationConfig
): Animated.CompositeAnimation => {
  const animation = Animated.timing(value, {
    ...config,
    useNativeDriver: true, // Always use native driver when possible
  });

  // Add to global animation manager
  const animationManager = new AnimationManager();
  animationManager.addAnimation(animation);

  return animation;
};

// Debounced function with cleanup
export const createDebouncedFunction = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  let timeoutId: ReturnType<typeof setTimeout>;

  const debounced = ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;

  // Add cleanup to memory manager
  const memoryManager = MemoryManager.getInstance();
  memoryManager.addCleanupListener(() => {
    clearTimeout(timeoutId);
  });

  return debounced;
};

// Image optimization utilities
export const optimizeImage = async (
  uri: string,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 0.8
): Promise<string> => {
  // This would typically use a library like react-native-image-manipulator
  // For now, we'll return the original URI
  return uri;
};

// Bundle size optimization
export const lazyLoad = <T>(
  importFunc: () => Promise<{ default: T }>
): Promise<T> => {
  return importFunc().then((module) => module.default);
};

// Performance hooks
export const useAnimationManager = () => {
  const manager = new AnimationManager();

  return {
    addAnimation: manager.addAnimation.bind(manager),
    removeAnimation: manager.removeAnimation.bind(manager),
    stopAllAnimations: manager.stopAllAnimations.bind(manager),
    cleanup: manager.cleanup.bind(manager),
  };
};

export const useMemoryManager = () => {
  const manager = MemoryManager.getInstance();

  return {
    addCleanupListener: manager.addCleanupListener.bind(manager),
    removeCleanupListener: manager.removeCleanupListener.bind(manager),
    cleanup: manager.cleanup.bind(manager),
  };
};

// Performance constants
export const PERFORMANCE_CONSTANTS = {
  ANIMATION_DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },
  DEBOUNCE_DELAY: {
    SEARCH: 300,
    SCROLL: 100,
    RESIZE: 250,
  },
  MEMORY_LIMITS: {
    MAX_ANIMATIONS: 10,
    MAX_IMAGES: 50,
    MAX_CACHE_SIZE: 100 * 1024 * 1024, // 100MB
  },
  PERFORMANCE_THRESHOLDS: {
    FRAME_RATE: 60,
    ANIMATION_DURATION: 500,
    LOADING_TIMEOUT: 10000,
  },
};

// Performance monitoring decorator
export const measurePerformance = (name: string) => {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const monitor = PerformanceMonitor.getInstance();
      monitor.startTimer(name);

      try {
        const result = await method.apply(this, args);
        monitor.endTimer(name);
        return result;
      } catch (error) {
        monitor.endTimer(name);
        throw error;
      }
    };
  };
};

// Export singleton instances
export const memoryManager = MemoryManager.getInstance();
