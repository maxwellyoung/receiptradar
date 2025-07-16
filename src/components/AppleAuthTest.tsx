import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";

export const AppleAuthTest: React.FC = () => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [testResult, setTestResult] = useState<string>("");

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      if (Platform.OS !== "ios") {
        setIsAvailable(false);
        setTestResult("Apple Sign-In is only available on iOS");
        return;
      }

      const available = await AppleAuthentication.isAvailableAsync();
      setIsAvailable(available);
      setTestResult(
        available
          ? "Apple Sign-In is available"
          : "Apple Sign-In is not available"
      );
    } catch (error) {
      console.error("Error checking Apple authentication:", error);
      setIsAvailable(false);
      setTestResult(`Error: ${error}`);
    }
  };

  const testAppleSignIn = async () => {
    try {
      setTestResult("Testing Apple Sign-In...");

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      setTestResult(
        `Success! User: ${credential.fullName?.givenName || "Unknown"}`
      );
      console.log("Apple Sign-In credential:", credential);
    } catch (error) {
      console.error("Apple Sign-In test error:", error);
      setTestResult(`Test failed: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apple Authentication Test</Text>

      <Text style={styles.status}>
        Status:{" "}
        {isAvailable === null
          ? "Checking..."
          : isAvailable
          ? "✅ Available"
          : "❌ Not Available"}
      </Text>

      <Text style={styles.result}>{testResult}</Text>

      {isAvailable && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={8}
          style={styles.button}
          onPress={testAppleSignIn}
        />
      )}

      <Text style={styles.info}>
        Platform: {Platform.OS}
        {"\n"}
        Bundle ID: com.receiptradar.app
        {"\n"}
        Note: Apple Sign-In requires a physical iOS device
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    margin: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  status: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  result: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
    color: "#666",
  },
  button: {
    width: "100%",
    height: 50,
    marginBottom: 16,
  },
  info: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
  },
});
