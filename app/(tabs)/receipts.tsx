import React from "react";
import { StyleSheet, View, FlatList } from "react-native";
import { Text, useTheme, ActivityIndicator } from "react-native-paper";
import { useRouter } from "expo-router";
import { useReceipts } from "@/hooks/useReceipts";
import { AppTheme } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";
import { ReceiptCard } from "@/components/ReceiptCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { EdgeCaseRenderer } from "@/components/EdgeCaseRenderer";
import { useRadarMood } from "@/hooks/useRadarMood";

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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
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
          A record of your culinary quests.
        </Text>
      </View>
      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ReceiptCard
            receipt={item}
            onPress={() => router.push(`/receipt/${item.id}`)}
          />
        )}
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
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
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
