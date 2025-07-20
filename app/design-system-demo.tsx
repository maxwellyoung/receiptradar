import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { HolisticButton } from "@/components/HolisticDesignSystem";
import { HolisticText } from "@/components/HolisticDesignSystem";
import { HolisticCard } from "@/components/HolisticDesignSystem";

export default function DesignSystemDemo() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <HolisticText variant="headline.large" style={styles.title}>
          Design System Demo
        </HolisticText>

        <HolisticText
          variant="body.medium"
          color="secondary"
          style={styles.subtitle}
        >
          Testing the holistic design system components
        </HolisticText>

        <View style={styles.componentsContainer}>
          <HolisticCard
            title="Design System"
            subtitle="Clean and functional"
            content="This demonstrates the holistic design system with proper typography, spacing, and color usage."
            variant="elevated"
          />

          <View style={styles.buttonGrid}>
            <HolisticButton
              title="Primary Button"
              onPress={() => console.log("Primary pressed")}
              variant="primary"
            />
            <HolisticButton
              title="Secondary Button"
              onPress={() => console.log("Secondary pressed")}
              variant="secondary"
            />
            <HolisticButton
              title="Outline Button"
              onPress={() => console.log("Outline pressed")}
              variant="outline"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    marginBottom: 40,
    textAlign: "center",
  },
  componentsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 20,
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
});
