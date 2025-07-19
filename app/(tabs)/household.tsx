import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTheme } from "@/constants/theme";
import { EdgeCaseRenderer } from "@/components/EdgeCaseRenderer";
import { useRouter } from "expo-router";

export default function HouseholdScreen() {
  const theme = useTheme<AppTheme>();
  const router = useRouter();

  const handleInvite = () => {
    // For now, this can navigate to a modal or show an alert
    router.push("/modals/manage-household");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text
            variant="headlineLarge"
            style={[styles.title, { color: theme.colors.onBackground }]}
          >
            Household
          </Text>
          <Text
            variant="titleMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Share spending with your flatmates.
          </Text>
        </View>

        <View style={styles.content}>
          <EdgeCaseRenderer
            mood="suspicious"
            title="No Cohabitants Detected"
            message="The worm grows suspicious of your solo grocery trips. Are you truly alone?"
          />
          <Button
            mode="contained"
            icon="plus"
            onPress={handleInvite}
            style={styles.button}
          >
            Add a Flatmate
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: "center",
  },
  title: {
    fontFamily: "Inter_600SemiBold",
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    textAlign: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  button: {
    marginTop: 32,
  },
});
