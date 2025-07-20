import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, useTheme } from "react-native-paper";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppTheme } from "@/constants/theme";

type OnboardingScreenProps = {
  isVisible: boolean;
  onDismiss: () => void;
};

export const OnboardingScreen = ({
  isVisible,
  onDismiss,
}: OnboardingScreenProps) => {
  const theme = useTheme<AppTheme>();

  return (
    <Modal
      isVisible={isVisible}
      style={styles.modal}
      backdropOpacity={0.8}
      animationIn="zoomIn"
      animationOut="zoomOut"
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.content}>
          <Text
            variant="headlineMedium"
            style={[styles.title, { color: theme.colors.onBackground }]}
          >
            I'm Worm.
          </Text>
          <Text
            variant="bodyLarge"
            style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
          >
            I see what you buy. I judge it gently. Let us begin.
          </Text>
          <Button
            mode="contained"
            onPress={onDismiss}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Begin
          </Button>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    padding: 32,
  },
  title: {
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginTop: 32,
    marginBottom: 12,
  },
  message: {
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    width: "100%",
    paddingVertical: 8,
  },
  buttonLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
});
