import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Image,
  ImageSourcePropType,
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

interface ProgressiveImageProps {
  source: ImageSourcePropType;
  style?: any;
  placeholderColor?: string;
  errorColor?: string;
  onLoad?: () => void;
  onError?: () => void;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
  fadeDuration?: number;
  showErrorIcon?: boolean;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  source,
  style,
  placeholderColor,
  errorColor,
  onLoad,
  onError,
  resizeMode = "cover",
  fadeDuration = 300,
  showErrorIcon = true,
}) => {
  const theme = useTheme<AppTheme>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const defaultPlaceholderColor =
    placeholderColor || theme.colors.surfaceVariant;
  const defaultErrorColor = errorColor || theme.colors.errorContainer;

  useEffect(() => {
    if (imageLoaded) {
      // Fade in the image
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: fadeDuration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: fadeDuration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setLoading(false);
        onLoad?.();
      });
    }
  }, [imageLoaded, fadeAnim, scaleAnim, fadeDuration, onLoad]);

  const handleLoad = () => {
    setImageLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onError?.();
  };

  const renderPlaceholder = () => (
    <View
      style={[
        styles.placeholder,
        {
          backgroundColor: defaultPlaceholderColor,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.placeholderContent,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          },
        ]}
      >
        <MaterialIcons
          name="image"
          size={32}
          color={theme.colors.onSurfaceVariant}
        />
      </Animated.View>
    </View>
  );

  const renderError = () => (
    <View
      style={[
        styles.errorContainer,
        {
          backgroundColor: defaultErrorColor,
        },
        style,
      ]}
    >
      {showErrorIcon && (
        <MaterialIcons
          name="broken-image"
          size={32}
          color={theme.colors.error}
        />
      )}
    </View>
  );

  const renderImage = () => (
    <Animated.Image
      source={source}
      style={[
        styles.image,
        style,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      resizeMode={resizeMode}
      onLoad={handleLoad}
      onError={handleError}
    />
  );

  if (error) {
    return renderError();
  }

  return (
    <View style={[styles.container, style]}>
      {loading && renderPlaceholder()}
      {renderImage()}
    </View>
  );
};

// Blurred placeholder image component
interface BlurredImageProps {
  source: ImageSourcePropType;
  style?: any;
  blurRadius?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export const BlurredImage: React.FC<BlurredImageProps> = ({
  source,
  style,
  blurRadius = 10,
  onLoad,
  onError,
}) => {
  const [loaded, setLoaded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleLoad = () => {
    setLoaded(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: interactions.transitions.normal,
      useNativeDriver: true,
    }).start();
    onLoad?.();
  };

  return (
    <View style={[styles.container, style]}>
      {/* Blurred placeholder */}
      <Image
        source={source}
        style={[styles.blurredImage, style]}
        blurRadius={blurRadius}
      />

      {/* Sharp image */}
      <Animated.Image
        source={source}
        style={[
          styles.sharpImage,
          style,
          {
            opacity: fadeAnim,
          },
        ]}
        onLoad={handleLoad}
        onError={onError}
      />
    </View>
  );
};

// Image with skeleton loading
interface SkeletonImageProps {
  source: ImageSourcePropType;
  style?: any;
  skeletonColor?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const SkeletonImage: React.FC<SkeletonImageProps> = ({
  source,
  style,
  skeletonColor,
  onLoad,
  onError,
}) => {
  const theme = useTheme<AppTheme>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const defaultSkeletonColor = skeletonColor || theme.colors.surfaceVariant;

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );
    shimmerLoop.start();

    return () => shimmerLoop.stop();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
    onError?.();
  };

  if (error) {
    return (
      <View
        style={[
          styles.skeletonContainer,
          {
            backgroundColor: theme.colors.errorContainer,
          },
          style,
        ]}
      >
        <MaterialIcons
          name="broken-image"
          size={24}
          color={theme.colors.error}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {loading && (
        <Animated.View
          style={[
            styles.skeletonContainer,
            {
              backgroundColor: defaultSkeletonColor,
              opacity: shimmerOpacity,
            },
            style,
          ]}
        />
      )}
      <Image
        source={source}
        style={[styles.image, style, { opacity: loading ? 0 : 1 }]}
        onLoad={handleLoad}
        onError={handleError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    ...materialShadows.subtle,
  },
  placeholderContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    ...materialShadows.subtle,
  },
  blurredImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sharpImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  skeletonContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
