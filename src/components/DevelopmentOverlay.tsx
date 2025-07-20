import React from "react";
import { View, StyleSheet } from "react-native";
import { useAuthContext } from "@/contexts/AuthContext";

interface DevelopmentOverlayProps {
  visible?: boolean;
}

export const DevelopmentOverlay: React.FC<DevelopmentOverlayProps> = ({
  visible = __DEV__,
}) => {
  const { user } = useAuthContext();

  // In development, we can add custom development tools here
  // For now, we'll just return null to avoid any interference
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Development tools can be added here */}
      {/* This component is intentionally empty to prevent interference */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    zIndex: 9999,
  },
});
