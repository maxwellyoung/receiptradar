import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useAuthContext } from "@/contexts/AuthContext";
import { AppTheme, borderRadius, spacing } from "@/constants/theme";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "@/contexts/ThemeContext";
import { MotiView, AnimatePresence } from "moti";

const SectionHeader = ({ icon, title }: { icon: any; title: string }) => {
  const theme = useTheme<AppTheme>();
  return (
    <View style={styles.sectionHeader}>
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={theme.colors.primary}
      />
      <Text variant="titleLarge" style={styles.sectionTitle}>
        {title}
      </Text>
    </View>
  );
};

const SettingsItem = ({
  icon,
  title,
  description,
  onPress,
}: {
  icon: any;
  title: string;
  description: string;
  onPress?: () => void;
}) => {
  const theme = useTheme<AppTheme>();
  return (
    <TouchableOpacity
      style={[styles.itemContainer, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={theme.colors.onSurfaceVariant}
        style={styles.itemIcon}
      />
      <View style={styles.itemTextContainer}>
        <Text variant="bodyLarge">{title}</Text>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {description}
        </Text>
      </View>
      {onPress && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={theme.colors.onSurfaceVariant}
        />
      )}
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const { signOut, user } = useAuthContext();
  const theme = useTheme<AppTheme>();
  const router = useRouter();
  const { toggleTheme, mode } = useThemeContext();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContentContainer}
    >
      <View style={styles.header}>
        <Text variant="displaySmall" style={styles.headerTitle}>
          Settings
        </Text>
        <Text
          variant="titleMedium"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Tweak the worm's world.
        </Text>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <SectionHeader icon="account-circle-outline" title="Your Account" />
        <SettingsItem
          icon="at"
          title="Email Address"
          description={user?.email ?? "No email found"}
        />
        <SettingsItem
          icon="pencil-outline"
          title="Edit Profile"
          description="Change your name, maybe your fate"
          onPress={() => router.push("/modals/edit-profile")}
        />
        <SettingsItem
          icon="logout"
          title="Sign Out"
          description="Go back to the real world... for now"
          onPress={signOut}
        />
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <SectionHeader icon="creation" title="What the worm sees" />
        <View
          style={[
            styles.itemContainer,
            { backgroundColor: theme.colors.surface, alignItems: "center" },
          ]}
        >
          <MaterialCommunityIcons
            name="theme-light-dark"
            size={24}
            color={theme.colors.onSurfaceVariant}
            style={styles.itemIcon}
          />
          <View style={styles.itemTextContainer}>
            <Text variant="bodyLarge">Theme</Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              The worm is utterly indifferent.
            </Text>
          </View>
          <TouchableOpacity
            onPress={toggleTheme}
            style={styles.toggleContainer}
          >
            <AnimatePresence>
              <MotiView
                key={mode}
                from={{
                  transform: [
                    { translateX: mode === "light" ? -15 : 15 },
                    { rotate: mode === "light" ? "0deg" : "360deg" },
                  ],
                  opacity: 0,
                }}
                animate={{
                  transform: [{ translateX: 0 }, { rotate: "0deg" }],
                  opacity: 1,
                }}
                exit={{
                  transform: [
                    { translateX: mode === "light" ? 15 : -15 },
                    { rotate: mode === "light" ? "360deg" : "0deg" },
                  ],
                  opacity: 0,
                }}
                transition={{ type: "timing", duration: 300 }}
                style={styles.toggleIcon}
              >
                <MaterialCommunityIcons
                  name={mode === "light" ? "weather-sunny" : "weather-night"}
                  size={24}
                  color={theme.colors.onPrimary}
                />
              </MotiView>
            </AnimatePresence>
          </TouchableOpacity>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <SectionHeader icon="information-outline" title="Worm Lore" />
        <SettingsItem
          icon="book-open-page-variant-outline"
          title="The Manifesto"
          description="Why this worm exists"
        />
        <SettingsItem
          icon="tag-outline"
          title="Version"
          description="1.0.0 (Wormy)"
        />
      </View>

      <View style={styles.footer}>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          The worm is always watching. 👀
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 48,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontWeight: "700",
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginLeft: spacing.md,
    fontWeight: "600",
  },
  itemContainer: {
    flexDirection: "row",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    alignItems: "center",
  },
  itemIcon: {
    marginRight: spacing.md,
  },
  itemTextContainer: {
    flex: 1,
  },
  toggleContainer: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "grey",
    justifyContent: "center",
    alignItems: "center",
  },
  toggleIcon: {
    position: "absolute",
  },
  footer: {
    padding: spacing.lg,
    alignItems: "center",
    marginTop: spacing.lg,
  },
});
