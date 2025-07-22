import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { spacing, typography, borderRadius, shadows } from "@/constants/theme";
import { Product } from "@/types";
import { productMatchingService } from "@/services/ProductMatchingService";

interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  priority: "high" | "medium" | "low";
  added: Date;
  completed: boolean;
}

interface StoreOptimization {
  store: string;
  totalCost: number;
  savings: number;
  items: ShoppingListItem[];
  missingItems: string[];
}

export const SmartShoppingList: React.FC = () => {
  const theme = useTheme<AppTheme>();
  const [items, setItems] = useState<ShoppingListItem[]>([
    {
      id: "1",
      name: "Milk",
      quantity: 2,
      category: "Dairy",
      priority: "high",
      added: new Date(),
      completed: false,
    },
    {
      id: "2",
      name: "Bread",
      quantity: 1,
      category: "Bakery",
      priority: "high",
      added: new Date(),
      completed: false,
    },
    {
      id: "3",
      name: "Eggs",
      quantity: 12,
      category: "Dairy",
      priority: "medium",
      added: new Date(),
      completed: false,
    },
    {
      id: "4",
      name: "Bananas",
      quantity: 6,
      category: "Produce",
      priority: "low",
      added: new Date(),
      completed: false,
    },
  ]);
  const [newItem, setNewItem] = useState("");
  const [showOptimization, setShowOptimization] = useState(false);
  const [optimization, setOptimization] = useState<StoreOptimization[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const slideAnim = React.useRef(new Animated.Value(0)).current;

  const categories = [
    "Dairy",
    "Bakery",
    "Produce",
    "Meat",
    "Pantry",
    "Frozen",
    "Beverages",
  ];

  const commonItems = [
    { name: "Milk", category: "Dairy" },
    { name: "Bread", category: "Bakery" },
    { name: "Eggs", category: "Dairy" },
    { name: "Bananas", category: "Produce" },
    { name: "Chicken", category: "Meat" },
    { name: "Rice", category: "Pantry" },
    { name: "Apples", category: "Produce" },
    { name: "Cheese", category: "Dairy" },
  ];

  const addItem = (name: string, category: string = "Other") => {
    if (!name.trim()) return;

    const newItem: ShoppingListItem = {
      id: Date.now().toString(),
      name: name.trim(),
      quantity: 1,
      category,
      priority: "medium",
      added: new Date(),
      completed: false,
    };

    setItems((prev) => [...prev, newItem]);
    setNewItem("");
    setShowSuggestions(false);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const optimizeStores = () => {
    // Mock optimization logic
    const mockOptimization: StoreOptimization[] = [
      {
        store: "Countdown",
        totalCost: 45.2,
        savings: 8.5,
        items: items.filter((item) => !item.completed),
        missingItems: ["Specialty cheese"],
      },
      {
        store: "New World",
        totalCost: 52.8,
        savings: 1.1,
        items: items.filter((item) => !item.completed),
        missingItems: ["Organic milk"],
      },
      {
        store: "Pak'nSave",
        totalCost: 41.3,
        savings: 12.4,
        items: items.filter((item) => !item.completed),
        missingItems: ["Artisan bread"],
      },
    ];

    setOptimization(mockOptimization);
    setShowOptimization(true);

    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const getItemsByCategory = () => {
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ShoppingListItem[]>);

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const renderItem = (item: ShoppingListItem) => (
    <View
      key={item.id}
      style={[
        styles.itemCard,
        { backgroundColor: theme.colors.surface },
        item.completed && styles.completedItem,
      ]}
    >
      <TouchableOpacity
        style={styles.itemContent}
        onPress={() => toggleItem(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <Text
              style={[
                styles.itemName,
                { color: theme.colors.onSurface },
                item.completed && styles.completedText,
              ]}
            >
              {item.name}
            </Text>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(item.priority) + "20" },
              ]}
            >
              <Text
                style={[styles.priorityText, { color: theme.colors.onSurface }]}
              >
                {item.priority}
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.itemCategory,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {item.category}
          </Text>
        </View>

        <View style={styles.itemActions}>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="remove"
                size={16}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
            <Text
              style={[styles.quantityText, { color: theme.colors.onSurface }]}
            >
              {item.quantity}
            </Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="add"
                size={16}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeItem(item.id)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="delete" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Smart Shopping List
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          AI-powered suggestions and store optimization
        </Text>
      </View>

      {/* Add Item Section */}
      <View style={styles.addSection}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.addInput,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.onSurface,
                borderColor: theme.colors.outline,
              },
            ]}
            placeholder="Add item to list..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={newItem}
            onChangeText={setNewItem}
            onSubmitEditing={() => addItem(newItem)}
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => addItem(newItem)}
            disabled={!newItem.trim()}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.suggestionsButton}
          onPress={() => setShowSuggestions(!showSuggestions)}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="lightbulb"
            size={20}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.suggestionsText, { color: theme.colors.primary }]}
          >
            AI Suggestions
          </Text>
        </TouchableOpacity>
      </View>

      {/* AI Suggestions */}
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <Text
            style={[styles.suggestionsTitle, { color: theme.colors.primary }]}
          >
            Suggested Items
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {commonItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.suggestionItem,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => addItem(item.name, item.category)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.suggestionItemText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.suggestionCategory,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {item.category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Store Optimization */}
      <View style={styles.optimizationSection}>
        <TouchableOpacity
          style={[
            styles.optimizeButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={optimizeStores}
          activeOpacity={0.8}
        >
          <MaterialIcons name="store" size={20} color="white" />
          <Text style={styles.optimizeButtonText}>Find Best Store</Text>
        </TouchableOpacity>
      </View>

      {/* Store Optimization Results */}
      {showOptimization && (
        <Animated.View
          style={[
            styles.optimizationResults,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
              opacity: slideAnim,
            },
          ]}
        >
          <Text
            style={[styles.optimizationTitle, { color: theme.colors.primary }]}
          >
            Store Optimization Results
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {optimization.map((store, index) => (
              <View
                key={index}
                style={[
                  styles.storeCard,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <View style={styles.storeHeader}>
                  <Text
                    style={[
                      styles.storeName,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {store.store}
                  </Text>
                  <View
                    style={[
                      styles.savingsBadge,
                      { backgroundColor: "#10B981" + "20" },
                    ]}
                  >
                    <Text style={[styles.savingsText, { color: "#10B981" }]}>
                      Save ${store.savings.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[styles.storeTotal, { color: theme.colors.primary }]}
                >
                  Total: ${store.totalCost.toFixed(2)}
                </Text>
                {store.missingItems.length > 0 && (
                  <Text
                    style={[
                      styles.missingItems,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Missing: {store.missingItems.join(", ")}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Shopping List */}
      <View style={styles.listSection}>
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: theme.colors.primary }]}>
            Shopping List ({items.filter((item) => !item.completed).length}{" "}
            items)
          </Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setItems([])}
            activeOpacity={0.7}
          >
            <MaterialIcons name="clear-all" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.listContainer}>
          {getItemsByCategory().map(([category, categoryItems]) => (
            <View key={category} style={styles.categorySection}>
              <Text
                style={[
                  styles.categoryTitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {category} ({categoryItems.length})
              </Text>
              {categoryItems.map(renderItem)}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Features List */}
      <View style={styles.featuresList}>
        <Text style={[styles.featuresTitle, { color: theme.colors.primary }]}>
          Smart Features
        </Text>
        <View style={styles.featureItem}>
          <MaterialIcons name="auto-awesome" size={20} color="#10B981" />
          <Text style={[styles.featureText, { color: theme.colors.onSurface }]}>
            <Text style={{ fontWeight: "600" }}>AI Suggestions:</Text> Get smart
            recommendations
          </Text>
        </View>
        <View style={styles.featureItem}>
          <MaterialIcons name="store" size={20} color="#3B82F6" />
          <Text style={[styles.featureText, { color: theme.colors.onSurface }]}>
            <Text style={{ fontWeight: "600" }}>Store Optimization:</Text> Find
            the best store for your list
          </Text>
        </View>
        <View style={styles.featureItem}>
          <MaterialIcons name="category" size={20} color="#F59E0B" />
          <Text style={[styles.featureText, { color: theme.colors.onSurface }]}>
            <Text style={{ fontWeight: "600" }}>Smart Organization:</Text> Items
            grouped by category
          </Text>
        </View>
        <View style={styles.featureItem}>
          <MaterialIcons name="priority-high" size={20} color="#8B5CF6" />
          <Text style={[styles.featureText, { color: theme.colors.onSurface }]}>
            <Text style={{ fontWeight: "600" }}>Priority Management:</Text> Set
            importance levels
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    alignItems: "center",
  },
  title: {
    ...typography.headline1,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    textAlign: "center",
    lineHeight: 24,
  },
  addSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  addInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    ...typography.body1,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  suggestionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionsText: {
    ...typography.body2,
    marginLeft: spacing.xs,
    fontWeight: "500",
  },
  suggestionsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  suggestionsTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  suggestionItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    alignItems: "center",
    ...shadows.sm,
  },
  suggestionItemText: {
    ...typography.body2,
    fontWeight: "600",
  },
  suggestionCategory: {
    ...typography.caption1,
    marginTop: spacing.xs,
  },
  optimizationSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  optimizeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  optimizeButtonText: {
    ...typography.body2,
    color: "white",
    fontWeight: "600",
    marginLeft: spacing.sm,
  },
  optimizationResults: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  optimizationTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  storeCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    minWidth: 150,
    ...shadows.sm,
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  storeName: {
    ...typography.body2,
    fontWeight: "600",
  },
  savingsBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  savingsText: {
    ...typography.caption2,
    fontWeight: "600",
  },
  storeTotal: {
    ...typography.body1,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  missingItems: {
    ...typography.caption1,
    lineHeight: 16,
  },
  listSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  listTitle: {
    ...typography.body1,
    fontWeight: "600",
  },
  clearButton: {
    padding: spacing.xs,
  },
  listContainer: {
    flex: 1,
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    ...typography.body2,
    fontWeight: "600",
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemCard: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  completedItem: {
    opacity: 0.6,
  },
  itemContent: {
    padding: spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  itemName: {
    ...typography.body1,
    fontWeight: "600",
    flex: 1,
  },
  completedText: {
    textDecorationLine: "line-through",
  },
  priorityBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  priorityText: {
    ...typography.caption2,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  itemCategory: {
    ...typography.caption1,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  quantityText: {
    ...typography.body2,
    fontWeight: "600",
    marginHorizontal: spacing.sm,
    minWidth: 20,
    textAlign: "center",
  },
  removeButton: {
    padding: spacing.xs,
  },
  featuresList: {
    padding: spacing.lg,
  },
  featuresTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  featureText: {
    ...typography.body2,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
});
