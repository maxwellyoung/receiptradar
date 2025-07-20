import { AccessibilityInfo, Platform } from "react-native";
import { logger } from "./logger";

interface AccessibilityConfig {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isHighContrastEnabled: boolean;
  isBoldTextEnabled: boolean;
  isGrayscaleEnabled: boolean;
}

class AccessibilityManager {
  private config: AccessibilityConfig = {
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    isHighContrastEnabled: false,
    isBoldTextEnabled: false,
    isGrayscaleEnabled: false,
  };

  private listeners: Array<() => void> = [];

  constructor() {
    this.initialize();
  }

  /**
   * Initialize accessibility monitoring
   */
  private async initialize(): Promise<void> {
    try {
      // Check initial accessibility state
      this.config.isScreenReaderEnabled =
        await AccessibilityInfo.isScreenReaderEnabled();
      this.config.isReduceMotionEnabled =
        await AccessibilityInfo.isReduceMotionEnabled();

      // Set up listeners for accessibility changes
      this.setupListeners();
    } catch (error) {
      logger.error(
        "Failed to initialize accessibility manager:",
        error as Error
      );
    }
  }

  /**
   * Set up accessibility change listeners
   */
  private setupListeners(): void {
    // Screen reader changes
    const screenReaderListener = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      (isEnabled: boolean) => {
        this.config.isScreenReaderEnabled = isEnabled;
        this.notifyListeners();
        logger.info(`Screen reader ${isEnabled ? "enabled" : "disabled"}`);
      }
    );

    // Reduce motion changes
    const reduceMotionListener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (isEnabled: boolean) => {
        this.config.isReduceMotionEnabled = isEnabled;
        this.notifyListeners();
        logger.info(`Reduce motion ${isEnabled ? "enabled" : "disabled"}`);
      }
    );

    // Store listeners for cleanup
    this.listeners.push(() => {
      screenReaderListener?.remove();
      reduceMotionListener?.remove();
    });
  }

  /**
   * Notify all listeners of accessibility changes
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Get current accessibility configuration
   */
  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  /**
   * Check if screen reader is enabled
   */
  isScreenReaderEnabled(): boolean {
    return this.config.isScreenReaderEnabled;
  }

  /**
   * Check if reduce motion is enabled
   */
  isReduceMotionEnabled(): boolean {
    return this.config.isReduceMotionEnabled;
  }

  /**
   * Get accessibility props for components
   */
  getAccessibilityProps(options: {
    label?: string;
    hint?: string;
    role?: string;
    isButton?: boolean;
    isSelected?: boolean;
    isDisabled?: boolean;
    value?: string;
    minValue?: number;
    maxValue?: number;
    step?: number;
    now?: number;
  }) {
    const {
      label,
      hint,
      role,
      isButton = false,
      isSelected = false,
      isDisabled = false,
      value,
      minValue,
      maxValue,
      step,
    } = options;

    const props: any = {
      accessible: true,
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: role || (isButton ? "button" : undefined),
      accessibilityState: {
        selected: isSelected,
        disabled: isDisabled,
      },
    };

    // Add value for sliders and progress indicators
    if (value !== undefined) {
      props.accessibilityValue = {
        text: value,
        min: minValue,
        max: maxValue,
        now: typeof value === "number" ? value : undefined,
      };
    }

    // Platform-specific accessibility props
    if (Platform.OS === "ios") {
      props.accessibilityTraits = isButton ? "button" : undefined;
    }

    return props;
  }

  /**
   * Get optimized animation settings based on accessibility preferences
   */
  getAnimationSettings(baseDuration: number = 300) {
    if (this.config.isReduceMotionEnabled) {
      return {
        duration: 0,
        useNativeDriver: true,
      };
    }

    return {
      duration: baseDuration,
      useNativeDriver: true,
    };
  }

  /**
   * Announce message to screen reader
   */
  announce(message: string): void {
    if (this.config.isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }

  /**
   * Set accessibility focus to a component
   */
  setAccessibilityFocus(ref: any): void {
    if (this.config.isScreenReaderEnabled && ref?.current) {
      AccessibilityInfo.setAccessibilityFocus(ref.current);
    }
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    this.listeners.forEach((listener) => listener());
    this.listeners = [];
  }
}

export const accessibilityManager = new AccessibilityManager();

/**
 * Accessibility utilities for components
 */
export const accessibilityUtils = {
  /**
   * Get button accessibility props
   */
  button: (label: string, hint?: string, isDisabled = false) =>
    accessibilityManager.getAccessibilityProps({
      label,
      hint,
      role: "button",
      isButton: true,
      isDisabled,
    }),

  /**
   * Get image accessibility props
   */
  image: (label: string, hint?: string) =>
    accessibilityManager.getAccessibilityProps({
      label,
      hint,
      role: "image",
    }),

  /**
   * Get link accessibility props
   */
  link: (label: string, hint?: string) =>
    accessibilityManager.getAccessibilityProps({
      label,
      hint,
      role: "link",
    }),

  /**
   * Get header accessibility props
   */
  header: (label: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 1) =>
    accessibilityManager.getAccessibilityProps({
      label,
      role: `header${level}`,
    }),

  /**
   * Get list item accessibility props
   */
  listItem: (label: string, hint?: string, isSelected = false) =>
    accessibilityManager.getAccessibilityProps({
      label,
      hint,
      role: "listitem",
      isSelected,
    }),

  /**
   * Get progress indicator accessibility props
   */
  progress: (label: string, value: number, maxValue: number) =>
    accessibilityManager.getAccessibilityProps({
      label,
      role: "progressbar",
      value: `${Math.round((value / maxValue) * 100)}%`,
      minValue: 0,
      maxValue: 100,
      now: Math.round((value / maxValue) * 100),
    }),

  /**
   * Get slider accessibility props
   */
  slider: (
    label: string,
    value: number,
    minValue: number,
    maxValue: number,
    step = 1
  ) =>
    accessibilityManager.getAccessibilityProps({
      label,
      role: "slider",
      value: value.toString(),
      minValue,
      maxValue,
      step,
    }),

  /**
   * Get switch accessibility props
   */
  switch: (label: string, isSelected: boolean) =>
    accessibilityManager.getAccessibilityProps({
      label,
      role: "switch",
      isSelected,
    }),

  /**
   * Get tab accessibility props
   */
  tab: (label: string, isSelected: boolean) =>
    accessibilityManager.getAccessibilityProps({
      label,
      role: "tab",
      isSelected,
    }),
};

/**
 * Accessibility hook for React components
 */
export const useAccessibility = () => {
  const announce = (message: string) => {
    accessibilityManager.announce(message);
  };

  const setFocus = (ref: any) => {
    accessibilityManager.setAccessibilityFocus(ref);
  };

  const getAnimationSettings = (baseDuration: number = 300) => {
    return accessibilityManager.getAnimationSettings(baseDuration);
  };

  const isScreenReaderEnabled = () => {
    return accessibilityManager.isScreenReaderEnabled();
  };

  const isReduceMotionEnabled = () => {
    return accessibilityManager.isReduceMotionEnabled();
  };

  return {
    announce,
    setFocus,
    getAnimationSettings,
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    utils: accessibilityUtils,
  };
};

/**
 * Accessibility constants
 */
export const accessibilityConstants = {
  // Minimum touch target size (44x44 points)
  MIN_TOUCH_TARGET_SIZE: 44,

  // Minimum contrast ratios
  CONTRAST_RATIOS: {
    NORMAL_TEXT: 4.5,
    LARGE_TEXT: 3.0,
    UI_COMPONENTS: 3.0,
  },

  // Animation durations
  ANIMATION_DURATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },

  // Screen reader announcement delays
  ANNOUNCEMENT_DELAYS: {
    IMMEDIATE: 0,
    SHORT: 100,
    MEDIUM: 300,
    LONG: 500,
  },
};

export default accessibilityManager;
