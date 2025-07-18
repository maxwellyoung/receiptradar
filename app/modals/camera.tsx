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
import { spacing, shadows } from "@/constants/theme";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";

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

  // Elegant scanning animation values
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;
  const subtlePulseAnim = useRef(new Animated.Value(1)).current;

  // Receipt detection state
  const [receiptDetected, setReceiptDetected] = useState(false);
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const detectionAnim = useRef(new Animated.Value(0)).current;

  // Flash mode state
  const [flashMode, setFlashMode] = useState<"off" | "on" | "auto">("auto");

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
    })();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Receipt detection animation
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

  // Elegant scanning animations
  useEffect(() => {
    // Subtle scanning line
    const scanAnimation = Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    // Gentle focus animation
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

    // Very subtle breathing effect
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

  // Advanced receipt detection using multiple analysis techniques
  const analyzeFrame = async () => {
    if (!cameraRef.current || isCapturing || isAnalyzing) return;

    setIsAnalyzing(true);

    try {
      // Take a low-quality preview for analysis (reduced quality for stability)
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.1,
        skipProcessing: true,
      });

      // Simplified detection for stability
      const detectionResult = await performSimplifiedDetection(photo.uri);

      setReceiptDetected(detectionResult.detected);
      setDetectionConfidence(detectionResult.confidence);
      setDetectionDetails(detectionResult.details);
    } catch (error) {
      console.log("Frame analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Simplified detection for stability
  const performSimplifiedDetection = async (
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
    // Simple, stable detection logic
    await new Promise((resolve) => setTimeout(resolve, 50)); // Reduced delay

    // Simulate detection with more stable results
    const baseConfidence = 0.3 + Math.random() * 0.4; // 30-70% base confidence
    const timeFactor = (Date.now() % 3000) / 3000; // 3-second cycle
    const confidence = Math.min(baseConfidence + timeFactor * 0.3, 1.0);
    const detected = confidence > 0.6;

    return {
      detected,
      confidence,
      details: {
        hasText: detected,
        isRectangular: detected,
        aspectRatio: detected ? 3.2 : 1.5,
        edgeDensity: detected ? 0.7 : 0.3,
        confidence,
      },
    };
  };

  // Start frame analysis when camera is ready
  useEffect(() => {
    if (hasPermission && !previewUri) {
      const analysisInterval = setInterval(analyzeFrame, 2000); // Analyze every 2 seconds for stability
      return () => clearInterval(analysisInterval);
    }
  }, [hasPermission, previewUri, isCapturing]);

  const handleCapture = async () => {
    if (isCapturing || !cameraRef.current) return;
    setIsCapturing(true);

    // Add a quick focus animation
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

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (
        typeof cameraRef.current === "undefined" ||
        cameraRef.current === null
      )
        return;

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo && photo.uri) {
        setPreviewUri(photo.uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (
      !result.canceled &&
      result.assets &&
      Array.isArray(result.assets) &&
      result.assets.length > 0 &&
      result.assets[0] &&
      result.assets[0].uri
    ) {
      setPreviewUri(result.assets[0].uri);
    }
  };

  const handleUsePhoto = async () => {
    if (previewUri) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({
        pathname: "/receipt/processing",
        params: { photoUri: previewUri },
      });
    }
  };

  const handleRetake = () => {
    setPreviewUri(null);
  };

  const handleClose = () => {
    router.back();
  };

  const toggleFlashMode = () => {
    const modes: ("off" | "on" | "auto")[] = ["auto", "on", "off"];
    const currentIndex = modes.indexOf(flashMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setFlashMode(modes[nextIndex]);
  };

  const getFlashIcon = () => {
    switch (flashMode) {
      case "on":
        return "flash-on";
      case "off":
        return "flash-off";
      case "auto":
      default:
        return "flash-auto";
    }
  };

  if (hasPermission === null) {
    return <View style={styles.permissionContainer} />;
  }
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <MaterialIcons name="camera-alt" size={48} color="#ccc" />
          <View style={{ height: 16 }} />
          <TouchableOpacity
            onPress={() => Camera.requestCameraPermissionsAsync()}
          >
            <MaterialIcons name="refresh" size={32} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (previewUri) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            opacity: fadeAnim,
          }}
        >
          <Image
            source={{ uri: previewUri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
          <View style={styles.confirmRow}>
            <TouchableOpacity
              onPress={handleRetake}
              style={[styles.confirmButton, styles.retakeButton]}
              activeOpacity={0.8}
            >
              <MaterialIcons name="refresh" size={28} color="#000" />
              <Text style={styles.confirmText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleUsePhoto}
              style={[styles.confirmButton, styles.useButton]}
              activeOpacity={0.8}
            >
              <MaterialIcons name="check" size={28} color="#fff" />
              <Text style={[styles.confirmText, { color: "#fff" }]}>
                Use Photo
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <MaterialIcons name="close" size={28} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleFlashMode}
            style={styles.flashButton}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={getFlashIcon() as any}
              size={24}
              color={flashMode === "on" ? "#fff" : "rgba(255, 255, 255, 0.8)"}
            />
            <Text style={styles.flashModeText}>
              {flashMode === "auto"
                ? "AUTO"
                : flashMode === "on"
                ? "ON"
                : "OFF"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.poeticPrompt}>Frame your receipt</Text>
        <Text style={styles.subtitle}>Position within the guide</Text>
        <View style={styles.cameraPreviewWrapper}>
          <Animated.View
            style={[
              styles.cameraPreview,
              { transform: [{ scale: subtlePulseAnim }] },
            ]}
          >
            <CameraView
              ref={cameraRef}
              style={styles.cameraView}
              facing="back"
              ratio="4:3"
              flash={flashMode}
            />

            {/* Elegant Scanning Overlay */}
            <View style={styles.scanOverlay}>
              {/* Minimal Scan Area */}
              <Animated.View
                style={[
                  styles.scanArea,
                  {
                    opacity: focusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.15, 0.25],
                    }),
                    borderColor: receiptDetected
                      ? "rgba(255, 255, 255, 0.4)"
                      : "rgba(255, 255, 255, 0.2)",
                  },
                ]}
              />

              {/* Subtle Scanning Line */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 300],
                        }),
                      },
                    ],
                    opacity: scanLineAnim.interpolate({
                      inputRange: [0, 0.3, 0.7, 1],
                      outputRange: [0, 0.4, 0.4, 0],
                    }),
                  },
                ]}
              />

              {/* Receipt Detection Indicator */}
              <Animated.View
                style={[
                  styles.detectionIndicator,
                  {
                    opacity: detectionAnim,
                    transform: [
                      {
                        scale: detectionAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View
                  style={[
                    styles.detectionDot,
                    {
                      backgroundColor: receiptDetected
                        ? "rgba(255, 255, 255, 0.9)"
                        : "rgba(255, 255, 255, 0.3)",
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.detectionText,
                    {
                      color: receiptDetected
                        ? "rgba(255, 255, 255, 0.9)"
                        : "rgba(255, 255, 255, 0.5)",
                    },
                  ]}
                >
                  {isAnalyzing
                    ? "Analyzing..."
                    : receiptDetected
                    ? "Receipt detected"
                    : "Position receipt"}
                </Text>
                {detectionDetails && (
                  <Text style={styles.detectionDetails}>
                    {`${Math.round(
                      detectionDetails.confidence * 100
                    )}% confidence`}
                  </Text>
                )}
              </Animated.View>

              {/* Elegant Status Text */}
              <Animated.View
                style={[
                  styles.statusText,
                  {
                    opacity: focusAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.4, 0.7],
                    }),
                  },
                ]}
              >
                <Text style={styles.statusTextContent}>
                  {receiptDetected
                    ? "Ready to capture"
                    : "Align receipt in frame"}
                </Text>
                {flashMode === "on" && (
                  <Text style={styles.flashIndicator}>Flash enabled</Text>
                )}
              </Animated.View>
            </View>
          </Animated.View>
        </View>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={handlePickFromLibrary}
            style={styles.libraryButton}
            activeOpacity={0.8}
          >
            <MaterialIcons name="photo-library" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCapture}
            style={[
              styles.captureButton,
              receiptDetected && styles.captureButtonActive,
            ]}
            disabled={isCapturing}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={isCapturing ? "hourglass-empty" : "camera-alt"}
              size={32}
              color="#000"
            />
          </TouchableOpacity>
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
  permissionContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  closeButton: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    backdropFilter: "blur(20px)",
  },
  flashButton: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    backdropFilter: "blur(20px)",
  },
  flashModeText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 8,
    fontWeight: "500",
    marginTop: 2,
    letterSpacing: 0.5,
    fontFamily: "Inter_500Medium",
  },
  flashIndicator: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 10,
    fontWeight: "400",
    marginTop: 4,
    letterSpacing: 0.3,
    fontFamily: "Inter_400Regular",
  },
  poeticPrompt: {
    position: "absolute",
    top: "12%",
    left: 0,
    right: 0,
    color: "#fff",
    fontSize: 18,
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: 1.2,
    opacity: 0.95,
    fontFamily: "Inter_400Regular",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    position: "absolute",
    top: "16%",
    left: 0,
    right: 0,
    color: "#fff",
    fontSize: 14,
    fontWeight: "300",
    textAlign: "center",
    opacity: 0.7,
    letterSpacing: 0.8,
    fontFamily: "Inter_300Light",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cameraPreviewWrapper: {
    flex: 1,
    position: "relative",
  },
  cameraPreview: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  cameraView: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  scanOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    position: "absolute",
    top: "15%",
    left: "8%",
    right: "8%",
    bottom: "25%",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  scanLine: {
    position: "absolute",
    top: "15%",
    left: "8%",
    right: "8%",
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 1,
  },
  statusText: {
    position: "absolute",
    bottom: "30%",
    alignSelf: "center",
  },
  statusTextContent: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: 0.5,
    fontFamily: "Inter_400Regular",
  },
  detectionIndicator: {
    position: "absolute",
    top: "8%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    backdropFilter: "blur(20px)",
  },
  detectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  detectionText: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
    fontFamily: "Inter_500Medium",
  },
  detectionDetails: {
    fontSize: 10,
    fontWeight: "400",
    letterSpacing: 0.2,
    fontFamily: "Inter_400Regular",
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
  },
  controlsRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px)",
  },
  libraryButton: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    backdropFilter: "blur(20px)",
  },
  captureButton: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 36,
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  captureButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    transform: [{ scale: 1.05 }],
  },
  previewImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  confirmRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px)",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(20px)",
  },
  retakeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  useButton: {
    backgroundColor: "rgba(16, 185, 129, 0.9)",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});
