import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  Image,
  Animated,
} from "react-native";
import { CameraView, Camera, CameraType } from "expo-camera";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { spacing, shadows, borderRadius, typography } from "@/constants/theme";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import * as Device from "expo-device";
import { mockOCRService } from "../../src/services/mockOCRService";

// TensorFlow Lite imports (you'll need to install these packages)
// import * as tf from '@tensorflow/tfjs';
// import '@tensorflow/tfjs-react-native';
// import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Refined scanning animation values
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;
  const subtlePulseAnim = useRef(new Animated.Value(1)).current;

  // Receipt detection state
  const [receiptDetected, setReceiptDetected] = useState(false);
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const detectionAnim = useRef(new Animated.Value(0)).current;

  // Flash mode state
  const [flashMode, setFlashMode] = useState<"off" | "on" | "auto">("auto");
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [flashlightSupported, setFlashlightSupported] = useState(false);

  // Advanced detection state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionDetails, setDetectionDetails] = useState<{
    hasText: boolean;
    isRectangular: boolean;
    aspectRatio: number;
    edgeDensity: number;
    confidence: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");

      if (Device.isDevice) {
        setFlashlightSupported(true);
      }
    })();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Refined receipt detection animation
  useEffect(() => {
    if (receiptDetected) {
      Animated.timing(detectionAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(detectionAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [receiptDetected, detectionAnim]);

  // Sophisticated scanning animations
  useEffect(() => {
    // Elegant scanning line
    const scanAnimation = Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    // Refined focus animation
    const focusAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(focusAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(focusAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Subtle breathing effect
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(subtlePulseAnim, {
          toValue: 1.02,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(subtlePulseAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    scanAnimation.start();
    focusAnimation.start();
    breathingAnimation.start();

    return () => {
      scanAnimation.stop();
      focusAnimation.stop();
      breathingAnimation.stop();
    };
  }, [scanLineAnim, focusAnim, subtlePulseAnim]);

  // Advanced receipt detection
  const analyzeFrame = async () => {
    if (!cameraRef.current || isCapturing || isAnalyzing) return;

    setIsAnalyzing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.1,
        skipProcessing: true,
      });

      const detectionResult = await performReceiptDetection(photo.uri);

      setReceiptDetected(detectionResult.detected);
      setDetectionConfidence(detectionResult.confidence);
      setDetectionDetails(detectionResult.details);
    } catch (error) {
      console.log("Frame analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performReceiptDetection = async (
    imageUri: string
  ): Promise<{
    detected: boolean;
    confidence: number;
    details: {
      hasText: boolean;
      isRectangular: boolean;
      aspectRatio: number;
      edgeDensity: number;
      confidence: number;
    };
  }> => {
    try {
      const detectionResult = await mockOCRService.detectReceipt(imageUri);
      return detectionResult;
    } catch (error) {
      console.error("Receipt detection error:", error);
      return {
        detected: false,
        confidence: 0.2,
        details: {
          hasText: false,
          isRectangular: false,
          aspectRatio: 1.0,
          edgeDensity: 0.1,
          confidence: 0.2,
        },
      };
    }
  };

  useEffect(() => {
    if (hasPermission && !previewUri) {
      const analysisInterval = setInterval(analyzeFrame, 2000);
      return () => clearInterval(analysisInterval);
    }
  }, [hasPermission, previewUri, isCapturing]);

  const handleCapture = async () => {
    if (isCapturing || !cameraRef.current) return;
    setIsCapturing(true);

    // Refined capture animation
    Animated.sequence([
      Animated.timing(subtlePulseAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(subtlePulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      setPreviewUri(photo.uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error("Capture error:", error);
      Alert.alert("Error", "Failed to capture photo");
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePickFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPreviewUri(result.assets[0].uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image from library");
    }
  };

  const handleUsePhoto = async () => {
    if (!previewUri) return;
    router.push({
      pathname: "/receipt/processing",
      params: { photoUri: previewUri },
    });
  };

  const handleRetake = () => {
    setPreviewUri(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClose = () => {
    router.back();
  };

  const toggleFlashMode = () => {
    setFlashMode((prev) => {
      const modes: ("off" | "on" | "auto")[] = ["auto", "on", "off"];
      const currentIndex = modes.indexOf(prev);
      const nextIndex = (currentIndex + 1) % modes.length;
      return modes[nextIndex];
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleFlashlight = () => {
    setFlashlightOn(!flashlightOn);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getFlashIcon = () => {
    switch (flashMode) {
      case "on":
        return "flash-on";
      case "off":
        return "flash-off";
      default:
        return "flash-auto";
    }
  };

  const getFlashlightIcon = () => {
    return flashlightOn ? "lightbulb" : "lightbulb-outline";
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Requesting camera permission...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.permissionContainer}>
          <MaterialIcons name="camera-alt" size={64} color="#666" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Please enable camera access in your device settings to scan
            receipts.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={handleClose}
          >
            <Text style={styles.permissionButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (previewUri) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <Animated.View style={[{ flex: 1, opacity: fadeAnim }]}>
          <View style={styles.previewHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.previewTitle}>Review Photo</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.previewContainer}>
            <Image source={{ uri: previewUri }} style={styles.previewImage} />
          </View>

          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRetake}
            >
              <MaterialIcons name="refresh" size={24} color="white" />
              <Text style={styles.actionButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleUsePhoto}
            >
              <MaterialIcons name="check" size={24} color="white" />
              <Text style={styles.primaryButtonText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[{ flex: 1, opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleFlashMode}
            >
              <MaterialIcons name={getFlashIcon()} size={24} color="white" />
            </TouchableOpacity>

            {flashlightSupported && (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleFlashlight}
              >
                <MaterialIcons
                  name={getFlashlightIcon()}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Camera View */}
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            flash={flashMode}
          >
            {/* Scanning Overlay */}
            <View style={styles.overlay}>
              {/* Corner Guides */}
              <View style={styles.cornerGuides}>
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
              </View>

              {/* Scanning Line */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 200],
                        }),
                      },
                    ],
                  },
                ]}
              />

              {/* Detection Indicator */}
              {receiptDetected && (
                <Animated.View
                  style={[
                    styles.detectionIndicator,
                    {
                      opacity: detectionAnim,
                      transform: [{ scale: detectionAnim }],
                    },
                  ]}
                >
                  <MaterialIcons
                    name="check-circle"
                    size={48}
                    color="#34C759"
                  />
                  <Text style={styles.detectionText}>Receipt Detected</Text>
                </Animated.View>
              )}
            </View>
          </CameraView>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={styles.libraryButton}
            onPress={handlePickFromLibrary}
          >
            <MaterialIcons name="photo-library" size={24} color="white" />
            <Text style={styles.libraryButtonText}>Library</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.captureButton,
              { transform: [{ scale: subtlePulseAnim }] },
            ]}
            onPress={handleCapture}
            disabled={isCapturing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <View style={styles.placeholder} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  permissionTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  permissionText: {
    color: "#CCC",
    fontSize: 16,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  permissionButton: {
    backgroundColor: "white",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  permissionButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerControls: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraContainer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  cornerGuides: {
    position: "absolute",
    width: 280,
    height: 200,
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "white",
    borderWidth: 3,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  scanLine: {
    position: "absolute",
    width: 280,
    height: 2,
    backgroundColor: "rgba(52, 199, 89, 0.8)",
    borderRadius: 1,
  },
  detectionIndicator: {
    position: "absolute",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  detectionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  libraryButton: {
    alignItems: "center",
  },
  libraryButtonText: {
    color: "white",
    fontSize: 12,
    marginTop: spacing.xs,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "white",
  },
  placeholder: {
    width: 44,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  previewTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  previewContainer: {
    flex: 1,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  previewImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: "#34C759",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
});
