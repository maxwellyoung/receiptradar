import { AccessibilityInfo, Platform, findNodeHandle } from "react-native";
import { logger } from "./logger";
import React, { useState, useEffect } from "react";

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

  /**
   * Announce to screen reader
   */
  announce: (announcement: string) => {
    accessibilityManager.announce(announcement);
  },

  /**
   * Set accessibility focus
   */
  setAccessibilityFocus: (reactTag: number) => {
    AccessibilityInfo.setAccessibilityFocus(reactTag);
  },

  /**
   * Get accessibility focus (platform specific)
   */
  getAccessibilityFocus: () => {
    // This is platform specific and may not be available on all platforms
    return Promise.resolve(0);
  },

  /**
   * Generate accessibility props
   */
  generateAccessibilityProps: (config: {
    label?: string;
    hint?: string;
    role?: string;
    state?: string[];
    actions?: string[];
    isAccessibilityElement?: boolean;
    accessibilityElementsHidden?: boolean;
    importantForAccessibility?: "auto" | "yes" | "no" | "no-hide-descendants";
  }) => {
    const {
      label,
      hint,
      role,
      state,
      actions,
      isAccessibilityElement = true,
      accessibilityElementsHidden = false,
      importantForAccessibility = "auto",
    } = config;

    return {
      accessible: isAccessibilityElement,
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityRole: role,
      accessibilityState: state?.reduce(
        (acc, s) => ({ ...acc, [s]: true }),
        {}
      ),
      accessibilityActions: actions?.map((action) => ({ name: action })),
      accessibilityElementsHidden,
      importantForAccessibility,
    };
  },

  /**
   * Generate button accessibility props
   */
  generateButtonProps: (label: string, hint?: string, disabled = false) => {
    return accessibilityUtils.generateAccessibilityProps({
      label,
      hint,
      role: "button",
      state: disabled ? ["disabled"] : undefined,
      actions: ["activate"],
    });
  },

  /**
   * Generate link accessibility props
   */
  generateLinkProps: (label: string, hint?: string) => {
    return accessibilityUtils.generateAccessibilityProps({
      label,
      hint,
      role: "link",
      actions: ["activate"],
    });
  },

  /**
   * Generate image accessibility props
   */
  generateImageProps: (label: string, hint?: string) => {
    return accessibilityUtils.generateAccessibilityProps({
      label,
      hint,
      role: "image",
    });
  },

  /**
   * Generate header accessibility props
   */
  generateHeaderProps: (label: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 1) => {
    return accessibilityUtils.generateAccessibilityProps({
      label,
      role: "header",
      state: [`level${level}`],
    });
  },

  /**
   * Generate list accessibility props
   */
  generateListProps: (label?: string) => {
    return accessibilityUtils.generateAccessibilityProps({
      label,
      role: "list",
    });
  },

  /**
   * Generate list item accessibility props
   */
  generateListItemProps: (label: string, selected = false) => {
    return accessibilityUtils.generateAccessibilityProps({
      label,
      role: "listitem",
      state: selected ? ["selected"] : undefined,
    });
  },

  /**
   * Generate search accessibility props
   */
  generateSearchProps: (label: string, hint?: string) => {
    return accessibilityUtils.generateAccessibilityProps({
      label,
      hint,
      role: "search",
    });
  },

  /**
   * Generate tab accessibility props
   */
  generateTabProps: (label: string, selected = false) => {
    return accessibilityUtils.generateAccessibilityProps({
      label,
      role: "tab",
      state: selected ? ["selected"] : undefined,
    });
  },

  /**
   * Generate switch accessibility props
   */
  generateSwitchProps: (label: string, value: boolean, hint?: string) => {
    return accessibilityUtils.generateAccessibilityProps({
      label,
      hint,
      role: "switch",
      state: [value ? "checked" : "unchecked"],
    });
  },

  /**
   * Generate checkbox accessibility props
   */
  generateCheckboxProps: (label: string, checked: boolean, hint?: string) => {
    return accessibilityUtils.generateAccessibilityProps({
      label,
      hint,
      role: "checkbox",
      state: [checked ? "checked" : "unchecked"],
    });
  },
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

// Accessibility constants
export const ACCESSIBILITY_CONSTANTS = {
  ROLE: {
    BUTTON: "button",
    LINK: "link",
    IMAGE: "image",
    HEADER: "header",
    TEXT: "text",
    SEARCH: "search",
    TAB: "tab",
    SWITCH: "switch",
    SLIDER: "slider",
    CHECKBOX: "checkbox",
    RADIO: "radio",
    SPINBUTTON: "spinbutton",
    COMBOBOX: "combobox",
    MENU: "menu",
    MENUITEM: "menuitem",
    TOOLBAR: "toolbar",
    TABLIST: "tablist",
    LIST: "list",
    LISTITEM: "listitem",
    GRID: "grid",
    GRIDCELL: "gridcell",
    ARTICLE: "article",
    BANNER: "banner",
    COMPLEMENTARY: "complementary",
    CONTENTINFO: "contentinfo",
    FORM: "form",
    MAIN: "main",
    NAVIGATION: "navigation",
    REGION: "region",
    SECTION: "section",
  },
  STATE: {
    SELECTED: "selected",
    DISABLED: "disabled",
    CHECKED: "checked",
    UNCHECKED: "unchecked",
    EXPANDED: "expanded",
    COLLAPSED: "collapsed",
    BUSY: "busy",
    REQUIRED: "required",
    INVALID: "invalid",
  },
  ACTION: {
    ACTIVATE: "activate",
    LONGPRESS: "longpress",
    MAGICTAP: "magictap",
    INCREMENT: "increment",
    DECREMENT: "decrement",
  },
};

// Accessibility hook for screen reader status
export const useScreenReader = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  useEffect(() => {
    const checkScreenReader = async () => {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsScreenReaderEnabled(enabled);
    };

    const handleScreenReaderChanged = (enabled: boolean) => {
      setIsScreenReaderEnabled(enabled);
    };

    checkScreenReader();
    const subscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      handleScreenReaderChanged
    );

    return () => subscription?.remove();
  }, []);

  return { isScreenReaderEnabled };
};

// Accessibility hook for reduced motion
export const useReducedMotion = () => {
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);

  useEffect(() => {
    const checkReduceMotion = async () => {
      const enabled = await AccessibilityInfo.isReduceMotionEnabled();
      setIsReduceMotionEnabled(enabled);
    };

    const handleReduceMotionChanged = (enabled: boolean) => {
      setIsReduceMotionEnabled(enabled);
    };

    checkReduceMotion();
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      handleReduceMotionChanged
    );

    return () => subscription?.remove();
  }, []);

  return { isReduceMotionEnabled };
};

// Accessibility hook for bold text
export const useBoldText = () => {
  const [isBoldTextEnabled, setIsBoldTextEnabled] = useState(false);

  useEffect(() => {
    const checkBoldText = async () => {
      const enabled = await AccessibilityInfo.isBoldTextEnabled();
      setIsBoldTextEnabled(enabled);
    };

    const handleBoldTextChanged = (enabled: boolean) => {
      setIsBoldTextEnabled(enabled);
    };

    checkBoldText();
    const subscription = AccessibilityInfo.addEventListener(
      "boldTextChanged",
      handleBoldTextChanged
    );

    return () => subscription?.remove();
  }, []);

  return { isBoldTextEnabled };
};

// Accessibility hook for high contrast
export const useHighContrast = () => {
  const [isHighContrastEnabled, setIsHighContrastEnabled] = useState(false);

  useEffect(() => {
    const checkHighContrast = async () => {
      const enabled = await AccessibilityInfo.isHighTextContrastEnabled();
      setIsHighContrastEnabled(enabled);
    };

    const handleHighContrastChanged = (enabled: boolean) => {
      setIsHighContrastEnabled(enabled);
    };

    checkHighContrast();
    const subscription = AccessibilityInfo.addEventListener(
      "highTextContrastChanged",
      handleHighContrastChanged
    );

    return () => subscription?.remove();
  }, []);

  return { isHighContrastEnabled };
};

// Color contrast utilities
export const colorContrastUtils = {
  // Calculate relative luminance
  getRelativeLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio
  getContrastRatio: (l1: number, l2: number): number => {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  // Check if contrast meets WCAG AA standards
  meetsWCAGAA: (contrastRatio: number, isLargeText = false): boolean => {
    return isLargeText ? contrastRatio >= 3 : contrastRatio >= 4.5;
  },

  // Check if contrast meets WCAG AAA standards
  meetsWCAGAAA: (contrastRatio: number, isLargeText = false): boolean => {
    return isLargeText ? contrastRatio >= 4.5 : contrastRatio >= 7;
  },
};

// Keyboard navigation utilities
export const keyboardNavigationUtils = {
  // Generate keyboard navigation props
  generateKeyboardProps: (config: {
    onKeyPress?: (event: any) => void;
    onKeyDown?: (event: any) => void;
    onKeyUp?: (event: any) => void;
    tabIndex?: number;
    accessible?: boolean;
  }) => {
    const {
      onKeyPress,
      onKeyDown,
      onKeyUp,
      tabIndex = 0,
      accessible = true,
    } = config;

    return {
      accessible,
      tabIndex,
      onKeyPress,
      onKeyDown,
      onKeyUp,
    };
  },

  // Generate focusable props
  generateFocusableProps: (config: {
    focusable?: boolean;
    tabIndex?: number;
    onFocus?: () => void;
    onBlur?: () => void;
  }) => {
    const { focusable = true, tabIndex = 0, onFocus, onBlur } = config;

    return {
      focusable,
      tabIndex,
      onFocus,
      onBlur,
    };
  },
};

// Accessibility announcement utilities
export const announcementUtils = {
  // Announce loading state
  announceLoading: (message: string) => {
    accessibilityUtils.announce(`${message} loading`);
  },

  // Announce success
  announceSuccess: (message: string) => {
    accessibilityUtils.announce(`${message} completed successfully`);
  },

  // Announce error
  announceError: (message: string) => {
    accessibilityUtils.announce(`Error: ${message}`);
  },

  // Announce navigation
  announceNavigation: (screen: string) => {
    accessibilityUtils.announce(`Navigated to ${screen}`);
  },

  // Announce action
  announceAction: (action: string) => {
    accessibilityUtils.announce(`${action} activated`);
  },

  // Announce selection
  announceSelection: (item: string) => {
    accessibilityUtils.announce(`${item} selected`);
  },

  // Announce refresh
  announceRefresh: () => {
    accessibilityUtils.announce("Refreshing content");
  },

  // Announce offline status
  announceOffline: () => {
    accessibilityUtils.announce("You are now offline");
  },

  // Announce online status
  announceOnline: () => {
    accessibilityUtils.announce("You are back online");
  },
};

export default accessibilityManager;
