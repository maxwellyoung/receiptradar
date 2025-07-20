import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";

import { AppTheme } from "@/constants/theme";

type EdgeCaseRendererProps = {
  mood?: string;
  title: string;
  message: string;
};

export const EdgeCaseRenderer = ({
  mood = "calm",
  title,
  message,
}: EdgeCaseRendererProps) => {
  const theme = useTheme<AppTheme>();

  return (
    <View style={styles.container}>
      <Text
        variant="headlineSmall"
        style={[styles.title, { color: theme.colors.onBackground }]}
      >
        {title}
      </Text>
      <Text
        variant="bodyLarge"
        style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 64,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    marginTop: 24,
  },
  message: {
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 8,
  },
});
