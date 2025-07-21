import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import {
  Text,
  useTheme,
  Card,
  TextInput,
  Button,
  Chip,
  IconButton,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useAuthContext } from "@/contexts/AuthContext";
import { useStoreTracking } from "@/hooks/useStoreTracking";
import { AppTheme, borderRadius, spacing } from "@/constants/theme";

import { API_CONFIG } from "@/constants/api";
import { logger } from "@/utils/logger";

interface PriceAlert {
  id: string;
  itemName: string;
  targetPrice: number;
  currentPrice: number;
  storeName?: string;
  isActive: boolean;
  createdAt: string;
  lastChecked: string;
}

interface PriceDrop {
  itemName: string;
  storeName: string;
  oldPrice: number;
  newPrice: number;
  savings: number;
  percentageDrop: number;
  date: string;
}

export const PriceAlertSystem: React.FC = () => {
  const theme = useTheme<AppTheme>();
  const { user } = useAuthContext();
  const { priceComparisons, fetchPriceComparisons } = useStoreTracking();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [priceDrops, setPriceDrops] = useState<PriceDrop[]>([]);
  const [newAlert, setNewAlert] = useState({
    itemName: "",
    targetPrice: "",
    storeName: "",
  });
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAlerts();
      fetchPriceDrops();
    }
  }, [user]);

  const fetchAlerts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_CONFIG.honoApiUrl}/api/v1/price-alerts?user_id=${user.id}`
      );

      if (response.ok) {
        const data: PriceAlert[] = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      logger.error("Failed to fetch alerts", error as Error, {
        component: "PriceAlertSystem",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceDrops = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `${API_CONFIG.honoApiUrl}/api/v1/price-drops?user_id=${user.id}`
      );

      if (response.ok) {
        const data: PriceDrop[] = await response.json();
        setPriceDrops(data);
      }
    } catch (error) {
      logger.error("Failed to fetch price drops", error as Error, {
        component: "PriceAlertSystem",
      });
    }
  };

  const createAlert = async () => {
    if (!user || !newAlert.itemName || !newAlert.targetPrice) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_CONFIG.honoApiUrl}/api/v1/price-alerts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            item_name: newAlert.itemName,
            target_price: parseFloat(newAlert.targetPrice),
            store_name: newAlert.storeName || null,
          }),
        }
      );

      if (response.ok) {
        const alert: PriceAlert = await response.json();
        setAlerts((prev) => [...prev, alert]);
        setNewAlert({ itemName: "", targetPrice: "", storeName: "" });
        setShowAddForm(false);
      }
    } catch (error) {
      logger.error("Failed to create alert", error as Error, {
        component: "PriceAlertSystem",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAlert = async (alertId: string) => {
    if (!user) return;

    try {
      const response = await fetch(
        `${API_CONFIG.honoApiUrl}/api/v1/price-alerts/${alertId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_active: !alerts.find((a) => a.id === alertId)?.isActive,
          }),
        }
      );

      if (response.ok) {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId
              ? { ...alert, isActive: !alert.isActive }
              : alert
          )
        );
      }
    } catch (error) {
      logger.error("Failed to toggle alert", error as Error, {
        component: "PriceAlertSystem",
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    if (!user) return;

    try {
      const response = await fetch(
        `${API_CONFIG.honoApiUrl}/api/v1/price-alerts/${alertId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      }
    } catch (error) {
      logger.error("Failed to delete alert", error as Error, {
        component: "PriceAlertSystem",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency: "NZD",
    }).format(amount);
  };

  const getPriceDropColor = (percentage: number) => {
    if (percentage >= 20) return theme.colors.positive;
    if (percentage >= 10) return theme.colors.tertiary;
    return theme.colors.primary;
  };

  if (loading && alerts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading your price alerts...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Price Alerts
        </Text>
        <Text variant="bodyLarge" style={styles.headerSubtitle}>
          Never miss a good deal
        </Text>
      </View>

      {/* Add New Alert */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500 }}
        style={styles.section}
      >
        <Card style={styles.addCard}>
          <Card.Content>
            <View style={styles.addHeader}>
              <Text variant="titleMedium" style={styles.addTitle}>
                Set Price Alert
              </Text>
              <IconButton
                icon={showAddForm ? "close" : "plus"}
                onPress={() => setShowAddForm(!showAddForm)}
                size={20}
              />
            </View>

            {showAddForm && (
              <MotiView
                from={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ type: "timing", duration: 300 }}
                style={styles.addForm}
              >
                <TextInput
                  label="Item Name"
                  value={newAlert.itemName}
                  onChangeText={(text) =>
                    setNewAlert((prev) => ({ ...prev, itemName: text }))
                  }
                  style={styles.input}
                  mode="outlined"
                />
                <TextInput
                  label="Target Price ($)"
                  value={newAlert.targetPrice}
                  onChangeText={(text) =>
                    setNewAlert((prev) => ({ ...prev, targetPrice: text }))
                  }
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                />
                <TextInput
                  label="Store (Optional)"
                  value={newAlert.storeName}
                  onChangeText={(text) =>
                    setNewAlert((prev) => ({ ...prev, storeName: text }))
                  }
                  style={styles.input}
                  mode="outlined"
                />
                <Button
                  mode="contained"
                  onPress={createAlert}
                  loading={loading}
                  disabled={!newAlert.itemName || !newAlert.targetPrice}
                  style={styles.addButton}
                >
                  Create Alert
                </Button>
              </MotiView>
            )}
          </Card.Content>
        </Card>
      </MotiView>

      {/* Active Alerts */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500, delay: 200 }}
        style={styles.section}
      >
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Your Alerts ({alerts.filter((a) => a.isActive).length})
        </Text>

        {alerts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No price alerts yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                Set alerts to get notified when prices drop
              </Text>
            </Card.Content>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} style={styles.alertCard}>
              <Card.Content>
                <View style={styles.alertHeader}>
                  <View style={styles.alertInfo}>
                    <Text variant="titleMedium" style={styles.alertItemName}>
                      {alert.itemName}
                    </Text>
                    <Text variant="bodySmall" style={styles.alertMeta}>
                      Target: {formatCurrency(alert.targetPrice)}
                      {alert.storeName && ` • ${alert.storeName}`}
                    </Text>
                  </View>
                  <View style={styles.alertActions}>
                    <Chip
                      mode="outlined"
                      textStyle={{
                        color: alert.isActive
                          ? theme.colors.positive
                          : theme.colors.onSurfaceVariant,
                      }}
                      style={{
                        borderColor: alert.isActive
                          ? theme.colors.positive
                          : theme.colors.onSurfaceVariant,
                      }}
                    >
                      {alert.isActive ? "Active" : "Inactive"}
                    </Chip>
                    <IconButton
                      icon={alert.isActive ? "pause" : "play"}
                      onPress={() => toggleAlert(alert.id)}
                      size={20}
                    />
                    <IconButton
                      icon="trash"
                      onPress={() => deleteAlert(alert.id)}
                      size={20}
                    />
                  </View>
                </View>

                <View style={styles.alertProgress}>
                  <View style={styles.progressBar}>
                    <MotiView
                      from={{ width: "0%" }}
                      animate={{
                        width: `${Math.min(
                          100,
                          (alert.currentPrice / alert.targetPrice) * 100
                        )}%`,
                      }}
                      transition={{ type: "timing", duration: 1000 }}
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor:
                            alert.currentPrice <= alert.targetPrice
                              ? theme.colors.positive
                              : theme.colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text variant="bodySmall" style={styles.progressText}>
                    Current: {formatCurrency(alert.currentPrice)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </MotiView>

      {/* Recent Price Drops */}
      {priceDrops.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 400 }}
          style={styles.section}
        >
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Recent Price Drops
          </Text>

          {priceDrops.slice(0, 5).map((drop, index) => (
            <Card key={index} style={styles.dropCard}>
              <Card.Content>
                <View style={styles.dropHeader}>
                  <View style={styles.dropInfo}>
                    <Text variant="titleMedium" style={styles.dropItemName}>
                      {drop.itemName}
                    </Text>
                    <Text variant="bodySmall" style={styles.dropStore}>
                      {drop.storeName}
                    </Text>
                  </View>
                  <Chip
                    mode="outlined"
                    textStyle={{
                      color: getPriceDropColor(drop.percentageDrop),
                    }}
                    style={{
                      borderColor: getPriceDropColor(drop.percentageDrop),
                    }}
                  >
                    -{drop.percentageDrop.toFixed(0)}%
                  </Chip>
                </View>

                <View style={styles.dropPrices}>
                  <Text variant="bodyMedium" style={styles.oldPrice}>
                    {formatCurrency(drop.oldPrice)}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text
                    variant="titleMedium"
                    style={[
                      styles.newPrice,
                      { color: getPriceDropColor(drop.percentageDrop) },
                    ]}
                  >
                    {formatCurrency(drop.newPrice)}
                  </Text>
                  <Text variant="bodySmall" style={styles.savings}>
                    Save {formatCurrency(drop.savings)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </MotiView>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#6B7280",
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  addCard: {
    marginHorizontal: spacing.lg,
    elevation: 2,
  },
  addHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addTitle: {
    fontWeight: "600",
  },
  addForm: {
    marginTop: spacing.md,
  },
  input: {
    marginBottom: spacing.sm,
  },
  addButton: {
    marginTop: spacing.sm,
  },
  alertCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  alertInfo: {
    flex: 1,
  },
  alertItemName: {
    fontWeight: "600",
  },
  alertMeta: {
    color: "#6B7280",
    marginTop: 2,
  },
  alertActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertProgress: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: borderRadius.sm,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: "100%",
    borderRadius: borderRadius.sm,
  },
  progressText: {
    color: "#6B7280",
  },
  dropCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
  },
  dropHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  dropInfo: {
    flex: 1,
  },
  dropItemName: {
    fontWeight: "600",
  },
  dropStore: {
    color: "#6B7280",
    marginTop: 2,
  },
  dropPrices: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  oldPrice: {
    textDecorationLine: "line-through",
    color: "#6B7280",
  },
  newPrice: {
    fontWeight: "600",
  },
  savings: {
    color: "#10B981",
    fontWeight: "600",
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    elevation: 2,
  },
  emptyContent: {
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyTitle: {
    marginTop: spacing.md,
    fontWeight: "600",
  },
  emptySubtitle: {
    marginTop: spacing.xs,
    color: "#6B7280",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.lg,
    color: "#6B7280",
  },
});
