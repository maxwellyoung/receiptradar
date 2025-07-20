import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Text, Searchbar, Card, Chip, useTheme } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useRouter } from "expo-router";
import {
  AppTheme,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "@/constants/theme";

const QUICK_SEARCH_ITEMS = [
  { name: "washing powder", icon: "washing-machine", category: "Household" },
  { name: "milk", icon: "cup-water", category: "Dairy" },
  { name: "bread", icon: "bread-slice", category: "Bakery" },
  { name: "eggs", icon: "egg", category: "Dairy" },
  { name: "bananas", icon: "fruit-cherries", category: "Produce" },
  { name: "chicken breast", icon: "food-drumstick", category: "Meat" },
  { name: "rice", icon: "rice", category: "Pantry" },
  { name: "pasta", icon: "food-variant", category: "Pantry" },
  { name: "cheese", icon: "cheese", category: "Dairy" },
  { name: "butter", icon: "food", category: "Dairy" },
  { name: "yoghurt", icon: "cup", category: "Dairy" },
  { name: "cereal", icon: "food-cereal", category: "Pantry" },
  { name: "coffee", icon: "coffee", category: "Beverages" },
  { name: "toilet paper", icon: "toilet", category: "Household" },
  { name: "dish soap", icon: "dishwasher", category: "Household" },
  { name: "laundry detergent", icon: "washing-machine", category: "Household" },
];

interface QuickSearchWidgetProps {
  onItemSelect?: (itemName: string) => void;
  compact?: boolean;
}

export function QuickSearchWidget({
  onItemSelect,
  compact = false,
}: QuickSearchWidgetProps) {
  const theme = useTheme<AppTheme>();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredItems = QUICK_SEARCH_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemPress = (itemName: string) => {
    if (onItemSelect) {
      onItemSelect(itemName);
    } else {
      // Navigate to price comparison tab with the search query
      router.push({
        pathname: "/(tabs)/price-compare",
        params: { search: itemName },
      });
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      handleItemPress(searchQuery.trim());
    }
  };

  const renderQuickSearchItem = ({
    item,
  }: {
    item: (typeof QUICK_SEARCH_ITEMS)[0];
  }) => (
    <TouchableOpacity
      style={styles.quickSearchItem}
      onPress={() => handleItemPress(item.name)}
    >
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
        style={styles.itemContainer}
      >
        <View style={styles.itemIcon}>
          <MaterialIcons
            name={item.icon as any}
            size={20}
            color={theme.colors.primary}
          />
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Chip style={styles.categoryChip} textStyle={styles.categoryChipText}>
            {item.category}
          </Chip>
        </View>
        <MaterialIcons
          name="arrow-forward-ios"
          size={16}
          color={theme.colors.onSurfaceVariant}
        />
      </MotiView>
    </TouchableOpacity>
  );

  if (compact) {
    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500 }}
        style={styles.compactContainer}
      >
        <Card style={styles.compactCard}>
          <Card.Content style={styles.compactContent}>
            <View style={styles.compactHeader}>
              <MaterialIcons
                name="compare"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.compactTitle}>Quick Price Check</Text>
            </View>
            <Text style={styles.compactSubtitle}>
              Find the best prices for your groceries
            </Text>
            <TouchableOpacity
              style={styles.compactButton}
              onPress={() => router.push("/(tabs)/price-compare")}
            >
              <Text style={styles.compactButtonText}>Compare Prices</Text>
              <MaterialIcons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </MotiView>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 500 }}
      style={styles.container}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <MaterialIcons
              name="search"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.title}>Quick Price Search</Text>
          </View>

          <Searchbar
            placeholder="Search for items like 'washing powder'..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={handleSearchSubmit}
            onFocus={() => setShowSuggestions(true)}
            style={styles.searchBar}
            icon="magnify"
            iconColor={theme.colors.onSurfaceVariant}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            inputStyle={{ color: theme.colors.onSurface }}
          />

          {showSuggestions && (
            <MotiView
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ type: "timing", duration: 300 }}
              style={styles.suggestionsContainer}
            >
              <Text style={styles.suggestionsTitle}>Popular Items</Text>
              <FlatList
                data={filteredItems}
                renderItem={renderQuickSearchItem}
                keyExtractor={(item) => item.name}
                scrollEnabled={false}
                style={styles.suggestionsList}
              />
            </MotiView>
          )}

          {!showSuggestions && (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              style={styles.quickAccess}
            >
              <Text style={styles.quickAccessTitle}>Quick Access</Text>
              <View style={styles.quickAccessGrid}>
                {QUICK_SEARCH_ITEMS.slice(0, 6).map((item, index) => (
                  <TouchableOpacity
                    key={item.name}
                    style={styles.quickAccessItem}
                    onPress={() => handleItemPress(item.name)}
                  >
                    <MotiView
                      from={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: "spring",
                        damping: 15,
                        delay: index * 50,
                      }}
                      style={styles.quickAccessIcon}
                    >
                      <MaterialIcons
                        name={item.icon as any}
                        size={20}
                        color={theme.colors.primary}
                      />
                    </MotiView>
                    <Text style={styles.quickAccessText} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </MotiView>
          )}
        </Card.Content>
      </Card>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  card: {
    ...shadows.sm,
    borderRadius: borderRadius.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headline3,
    marginLeft: spacing.sm,
  },
  searchBar: {
    ...shadows.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  suggestionsContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  suggestionsTitle: {
    ...typography.body2,
    fontWeight: "600",
    padding: spacing.md,
    paddingBottom: spacing.sm,
    color: "#666",
  },
  suggestionsList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  quickSearchItem: {
    marginBottom: spacing.sm,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: "white",
    borderRadius: borderRadius.md,
    ...shadows.xs,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    ...typography.body2,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  categoryChip: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
  },
  categoryChipText: {
    color: "#374151",
    fontSize: 10,
  },
  quickAccess: {
    marginTop: spacing.md,
  },
  quickAccessTitle: {
    ...typography.body2,
    fontWeight: "600",
    marginBottom: spacing.md,
    color: "#666",
  },
  quickAccessGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickAccessItem: {
    width: "30%",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  quickAccessText: {
    ...typography.caption1,
    textAlign: "center",
    color: "#374151",
  },
  compactContainer: {
    marginBottom: spacing.md,
  },
  compactCard: {
    ...shadows.sm,
    borderRadius: borderRadius.lg,
  },
  compactContent: {
    padding: spacing.lg,
  },
  compactHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  compactTitle: {
    ...typography.headline3,
    marginLeft: spacing.sm,
  },
  compactSubtitle: {
    ...typography.body2,
    color: "#666",
    marginBottom: spacing.md,
  },
  compactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  compactButtonText: {
    ...typography.body2,
    fontWeight: "600",
    color: "white",
    marginRight: spacing.xs,
  },
});
