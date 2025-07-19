import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useAuthContext } from "@/contexts/AuthContext";
import { AppTheme, borderRadius, spacing } from "@/constants/theme";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeContext } from "@/contexts/ThemeContext";
import { MotiView, AnimatePresence } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={{ marginBottom: spacing.xl }}>
    <Text
      variant="titleMedium"
      style={{
        textTransform: "uppercase",
        color: "grey",
        letterSpacing: 1.2,
        marginBottom: spacing.sm,
        marginLeft: spacing.md,
      }}
    >
      {title}
    </Text>
    <View
      style={{
        backgroundColor: "rgba(128, 128, 128, 0.1)",
        borderRadius: borderRadius.lg,
        overflow: "hidden",
      }}
    >
      {children}
    </View>
  </View>
);

const SettingsRow = ({
  icon,
  title,
  description,
  onPress,
  isLast = false,
}: {
  icon: any;
  title: string;
  description?: string;
  onPress?: () => void;
  isLast?: boolean;
}) => {
  const theme = useTheme<AppTheme>();
  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <View
        style={[
          styles.row,
          { borderBottomColor: theme.colors.outlineVariant },
          isLast && { borderBottomWidth: 0 },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={theme.colors.primary}
        />
        <View style={styles.rowTextContainer}>
          <Text variant="bodyLarge">{title}</Text>
          {description && (
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {description}
            </Text>
          )}
        </View>
        {onPress && (
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const ThemeToggle = () => {
  const { toggleTheme, mode } = useThemeContext();
  const theme = useTheme<AppTheme>();
  const trackWidth = 70;
  const trackHeight = 40;
  const thumbSize = 32;

  return (
    <TouchableOpacity onPress={toggleTheme}>
      <View
        style={[
          styles.toggleTrack,
          {
            backgroundColor: theme.colors.surfaceVariant,
            width: trackWidth,
            height: trackHeight,
            borderRadius: trackHeight / 2,
          },
        ]}
      >
        <AnimatePresence>
          <MotiView
            key={mode}
            from={{
              translateX: mode === "light" ? 0 : trackWidth - thumbSize - 8,
            }}
            animate={{
              translateX: mode === "light" ? 4 : trackWidth - thumbSize - 4,
            }}
            transition={{ type: "timing", duration: 300 }}
            style={[
              styles.toggleThumb,
              {
                backgroundColor: theme.colors.onPrimary,
                width: thumbSize,
                height: thumbSize,
                borderRadius: thumbSize / 2,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={mode === "light" ? "weather-sunny" : "weather-night"}
              size={20}
              color={theme.colors.primary}
            />
          </MotiView>
        </AnimatePresence>
      </View>
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const { signOut, user } = useAuthContext();
  const theme = useTheme<AppTheme>();
  const router = useRouter();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.headerTitle}>
            The Burrow
          </Text>
          <Text
            variant="titleMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Configure your corner of the wormhole.
          </Text>
        </View>

        <Section title="Your Scent Trail">
          <SettingsRow
            icon="foot-print"
            title="Email"
            description={user?.email ?? "Not available"}
          />
          <SettingsRow
            icon="account-edit-outline"
            title="Edit Profile"
            description="Adjust your aura, your essence."
            onPress={() => router.push("/modals/edit-profile")}
            isLast
          />
        </Section>

        <Section title="The Wormhole's Vibe">
          <View
            style={[styles.row, { borderBottomWidth: 0, alignItems: "center" }]}
          >
            <MaterialCommunityIcons
              name="invert-colors"
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.rowTextContainer}>
              <Text variant="bodyLarge">Theme</Text>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Light side, dark side... it's all the same to the worm.
              </Text>
            </View>
            <ThemeToggle />
          </View>
          <SettingsRow
            icon="home-group"
            title="Manage Household"
            description="Who else is in your burrow?"
            onPress={() => router.push("/modals/manage-household")}
            isLast
          />
        </Section>

        <Section title="Worm Wisdom">
          <SettingsRow
            icon="book-open-variant"
            title="The Manifesto"
            description="Why this worm exists"
          />
          <SettingsRow
            icon="information-outline"
            title="Version"
            description="1.0.0 (Wormy)"
            isLast
          />
        </Section>

        <View style={{ marginTop: spacing.lg }}>
          <SettingsRow
            icon="exit-to-app"
            title="Sign Out"
            onPress={signOut}
            isLast
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: 0,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  rowTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  toggleTrack: {
    justifyContent: "center",
  },
  toggleThumb: {
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: "center",
  },
});
