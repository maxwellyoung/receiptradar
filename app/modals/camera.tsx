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

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCapture = async () => {
    if (isCapturing || !cameraRef.current) return;
    setIsCapturing(true);
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
        </View>
        <Text style={styles.poeticPrompt}>
          Frame your receipt. Capture clarity.
        </Text>
        <View style={styles.cameraPreviewWrapper}>
          <CameraView
            ref={cameraRef}
            style={styles.cameraPreview}
            facing="back"
            ratio="4:3"
          />
        </View>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={handlePickFromLibrary}
            style={styles.libraryButton}
            activeOpacity={0.8}
          >
            <MaterialIcons name="photo-library" size={28} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCapture}
            style={styles.captureButton}
            disabled={isCapturing}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={isCapturing ? "hourglass-empty" : "camera-alt"}
              size={40}
              color="#fff"
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
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 12,
    paddingLeft: 12,
    zIndex: 10,
  },
  closeButton: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  poeticPrompt: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "400",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 12,
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  cameraPreviewWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 0,
    marginBottom: 0,
  },
  cameraPreview: {
    width: "92%",
    aspectRatio: 3 / 4,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#111",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    marginBottom: 32,
    marginTop: 16,
  },
  libraryButton: {
    backgroundColor: "#fff",
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  captureButton: {
    backgroundColor: "#10B981",
    borderRadius: 36,
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  previewImage: {
    width: "92%",
    aspectRatio: 3 / 4,
    borderRadius: 24,
    marginBottom: 32,
    backgroundColor: "#111",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    marginBottom: 24,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  retakeButton: {
    backgroundColor: "#fff",
  },
  useButton: {
    backgroundColor: "#10B981",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});
