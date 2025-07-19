import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Text, Card, Button, Chip, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import {
  performHealthCheck,
  getHealthSummary,
  HealthStatus,
} from "@/utils/health-check";
import { useAuthContext } from "@/contexts/AuthContext";
import { AppTheme } from "@/constants/theme";

export default function DebugScreen() {
  const theme = useTheme<AppTheme>();
  const { user } = useAuthContext();
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const status = await performHealthCheck();
      setHealthStatus(status);
    } catch (error) {
      console.error("Health check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const getStatusColor = (status: boolean) => {
    return status ? "#10B981" : "#EF4444";
  };

  const getStatusIcon = (status: boolean) => {
    return status ? "check-circle" : "error";
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Button
            mode="text"
            onPress={() => router.back()}
            icon="arrow-left"
            style={styles.backButton}
          >
            Back
          </Button>
          <Text variant="headlineMedium" style={styles.title}>
            System Debug
          </Text>
        </View>

        {/* Health Status Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialIcons
                name="health-and-safety"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleMedium" style={styles.cardTitle}>
                System Health
              </Text>
            </View>

            {healthStatus && (
              <Text variant="bodyLarge" style={styles.healthSummary}>
                {getHealthSummary(healthStatus)}
              </Text>
            )}

            <Button
              mode="outlined"
              onPress={runHealthCheck}
              loading={loading}
              style={styles.refreshButton}
            >
              Refresh Status
            </Button>
          </Card.Content>
        </Card>

        {/* Detailed Status */}
        {healthStatus && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Service Status
              </Text>

              <View style={styles.statusRow}>
                <MaterialIcons
                  name={getStatusIcon(healthStatus.database)}
                  size={20}
                  color={getStatusColor(healthStatus.database)}
                />
                <Text variant="bodyMedium" style={styles.statusLabel}>
                  Database Connection
                </Text>
                <Chip
                  mode="outlined"
                  style={[
                    styles.statusChip,
                    { borderColor: getStatusColor(healthStatus.database) },
                  ]}
                  textStyle={{ color: getStatusColor(healthStatus.database) }}
                >
                  {healthStatus.database ? "OK" : "FAIL"}
                </Chip>
              </View>

              <View style={styles.statusRow}>
                <MaterialIcons
                  name={getStatusIcon(healthStatus.storage)}
                  size={20}
                  color={getStatusColor(healthStatus.storage)}
                />
                <Text variant="bodyMedium" style={styles.statusLabel}>
                  Image Storage
                </Text>
                <Chip
                  mode="outlined"
                  style={[
                    styles.statusChip,
                    { borderColor: getStatusColor(healthStatus.storage) },
                  ]}
                  textStyle={{ color: getStatusColor(healthStatus.storage) }}
                >
                  {healthStatus.storage ? "OK" : "FAIL"}
                </Chip>
              </View>

              <View style={styles.statusRow}>
                <MaterialIcons
                  name={getStatusIcon(healthStatus.ocr)}
                  size={20}
                  color={getStatusColor(healthStatus.ocr)}
                />
                <Text variant="bodyMedium" style={styles.statusLabel}>
                  OCR Service
                </Text>
                <Chip
                  mode="outlined"
                  style={[
                    styles.statusChip,
                    { borderColor: getStatusColor(healthStatus.ocr) },
                  ]}
                  textStyle={{ color: getStatusColor(healthStatus.ocr) }}
                >
                  {healthStatus.ocr ? "OK" : "OFFLINE"}
                </Chip>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* User Info */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialIcons
                name="person"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleMedium" style={styles.cardTitle}>
                User Session
              </Text>
            </View>

            {user ? (
              <View>
                <Text variant="bodyMedium">
                  <Text style={{ fontWeight: "600" }}>Email:</Text> {user.email}
                </Text>
                <Text variant="bodyMedium">
                  <Text style={{ fontWeight: "600" }}>ID:</Text> {user.id}
                </Text>
                <Text variant="bodyMedium">
                  <Text style={{ fontWeight: "600" }}>Status:</Text>{" "}
                  Authenticated
                </Text>
              </View>
            ) : (
              <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                Not authenticated
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Environment Info */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialIcons
                name="settings"
                size={24}
                color={theme.colors.primary}
              />
              <Text variant="titleMedium" style={styles.cardTitle}>
                Configuration
              </Text>
            </View>

            <Text variant="bodySmall" style={styles.configText}>
              <Text style={{ fontWeight: "600" }}>Supabase URL:</Text>{" "}
              {process.env.EXPO_PUBLIC_SUPABASE_URL
                ? "✓ Configured"
                : "✗ Missing"}
            </Text>
            <Text variant="bodySmall" style={styles.configText}>
              <Text style={{ fontWeight: "600" }}>Supabase Key:</Text>{" "}
              {process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
                ? "✓ Configured"
                : "✗ Missing"}
            </Text>
            <Text variant="bodySmall" style={styles.configText}>
              <Text style={{ fontWeight: "600" }}>OCR Service:</Text>{" "}
              {process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000"}
            </Text>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Quick Actions
            </Text>

            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={() => router.push("/modals/camera")}
                style={styles.actionButton}
              >
                Test Camera
              </Button>
              <Button
                mode="outlined"
                onPress={() => router.push("/(tabs)")}
                style={styles.actionButton}
              >
                Go to Dashboard
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontWeight: "700",
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    marginLeft: 8,
    fontWeight: "600",
  },
  healthSummary: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 8,
  },
  refreshButton: {
    alignSelf: "flex-start",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusLabel: {
    flex: 1,
    marginLeft: 8,
  },
  statusChip: {
    height: 28,
  },
  configText: {
    marginBottom: 4,
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});
