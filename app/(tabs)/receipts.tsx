import React from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { Text, useTheme, ActivityIndicator, Chip } from "react-native-paper";
import { useRouter } from "expo-router";
import { useReceipts } from "@/hooks/useReceipts";
import { AppTheme } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";
import { ReceiptCard } from "@/components/ReceiptCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { EdgeCaseRenderer } from "@/components/EdgeCaseRenderer";
import { useRadarMood } from "@/hooks/useRadarMood";
import { MaterialIcons } from "@expo/vector-icons";

const getReceiptHistoryMessage = (receiptCount: number, totalSpent: number) => {
  if (receiptCount === 0) {
    return "A blank slate awaits your first scan.";
  }

  if (receiptCount < 5) {
    return "Your spending story is just beginning.";
  }

  if (receiptCount < 20) {
    return "Building quite the collection of financial memories.";
  }

  if (receiptCount < 50) {
    return "A seasoned receipt warrior. The worm is impressed.";
  }

  return "A master of the receipt arts. The worm bows to your dedication.";
};

const getSpendingPersonality = (totalSpent: number) => {
  if (totalSpent === 0) return "Frugal";
  if (totalSpent < 500) return "Modest";
  if (totalSpent < 1000) return "Balanced";
  if (totalSpent < 2000) return "Generous";
  return "Luxurious";
};

export default function ReceiptsScreen() {
  const router = useRouter();
  const theme = useTheme<AppTheme>();
  const { user } = useAuthContext();
  const { receipts, loading } = useReceipts(user?.id ?? "");

  const totalSpending = receipts.reduce(
    (acc, receipt) => acc + receipt.total,
    0
  );
  const { mood } = useRadarMood({ totalSpend: totalSpending });

  const spendingPersonality = getSpendingPersonality(totalSpending);
  const historyMessage = getReceiptHistoryMessage(
    receipts.length,
    totalSpending
  );

  if (loading && receipts.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text
        variant="headlineLarge"
        style={[styles.title, { color: theme.colors.onBackground }]}
      >
        Receipt History
      </Text>
      <Text
        variant="titleMedium"
        style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
      >
        {historyMessage}
      </Text>

      {receipts.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Chip
              icon="receipt"
              style={[
                styles.chip,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              {receipts.length} receipts
            </Chip>
            <Chip
              icon="currency-usd"
              style={[
                styles.chip,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              ${totalSpending.toFixed(2)} total
            </Chip>
            <Chip
              icon="account"
              style={[
                styles.chip,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              {spendingPersonality}
            </Chip>
          </View>

          <Text
            style={[
              styles.statsSubtext,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {receipts.length > 0
              ? `Average: $${(totalSpending / receipts.length).toFixed(
                  2
                )} per receipt`
              : "Start scanning to see your patterns"}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "left", "right"]}
    >
      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ReceiptCard
            receipt={item}
            onPress={() => router.push(`/receipt/${item.id}`)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EdgeCaseRenderer
            mood={mood}
            title="A Blank Slate"
            message="No receipts scanned yet. The worm awaits its first taste of your financial soul."
          />
        }
        contentContainerStyle={styles.listContentContainer}
        onRefresh={() => {}} // You might want to implement a refresh function in useReceipts
        refreshing={loading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    marginTop: 4,
  },
  statsContainer: {
    marginTop: 16,
  },
  statRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
  },
  statsSubtext: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 4,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 88, // Full tab bar height
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 64,
  },
  emptyText: {
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    marginTop: 16,
  },
});
