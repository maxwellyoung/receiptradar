import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  IconButton,
  Divider,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { spacing, typography, borderRadius, shadows } from "@/constants/theme";
import { useThemeContext } from "@/contexts/ThemeContext";

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  confidence: number;
}

interface CorrectionModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: (items: ReceiptItem[]) => void;
  items: ReceiptItem[];
  storeName?: string;
  total?: number;
}

export function CorrectionModal({
  visible,
  onDismiss,
  onSave,
  items: initialItems,
  storeName,
  total,
}: CorrectionModalProps) {
  const { theme } = useThemeContext();
  const [items, setItems] = useState<ReceiptItem[]>(initialItems);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleEditItem = (itemId: string) => {
    setEditingItem(itemId);
  };

  const handleSaveItem = (
    itemId: string,
    updatedItem: Partial<ReceiptItem>
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, ...updatedItem } : item
      )
    );
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setItems((prev) => prev.filter((item) => item.id !== itemId));
        },
      },
    ]);
  };

  const handleAddItem = () => {
    const newItem: ReceiptItem = {
      id: `new_${Date.now()}`,
      name: "",
      price: 0,
      quantity: 1,
      category: "Other",
      confidence: 0.5,
    };
    setItems((prev) => [...prev, newItem]);
    setEditingItem(newItem.id);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Validate items
      const validItems = items.filter(
        (item) => item.name.trim() && item.price > 0
      );

      if (validItems.length === 0) {
        Alert.alert("Error", "Please add at least one valid item.");
        return;
      }

      await onSave(validItems);
      onDismiss();
    } catch (error) {
      Alert.alert("Error", "Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const renderItemEditor = (item: ReceiptItem) => {
    const [name, setName] = useState(item.name);
    const [price, setPrice] = useState(item.price.toString());
    const [quantity, setQuantity] = useState(item.quantity.toString());

    const handleSave = () => {
      const numPrice = parseFloat(price) || 0;
      const numQuantity = parseInt(quantity) || 1;

      if (!name.trim()) {
        Alert.alert("Error", "Item name cannot be empty.");
        return;
      }

      if (numPrice <= 0) {
        Alert.alert("Error", "Price must be greater than 0.");
        return;
      }

      handleSaveItem(item.id, {
        name: name.trim(),
        price: numPrice,
        quantity: numQuantity,
      });
    };

    const handleCancel = () => {
      setName(item.name);
      setPrice(item.price.toString());
      setQuantity(item.quantity.toString());
      setEditingItem(null);
    };

    return (
      <Card style={[styles.itemCard, styles.editingCard]} key={item.id}>
        <Card.Content>
          <View style={styles.editRow}>
            <TextInput
              label="Item Name"
              value={name}
              onChangeText={setName}
              style={styles.nameInput}
              mode="outlined"
              dense
            />
            <View style={styles.priceQuantityRow}>
              <TextInput
                label="Price"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                style={styles.priceInput}
                mode="outlined"
                dense
                left={<TextInput.Affix text="$" />}
              />
              <TextInput
                label="Qty"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
                style={styles.quantityInput}
                mode="outlined"
                dense
              />
            </View>
          </View>
          <View style={styles.editActions}>
            <Button
              mode="text"
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
            >
              Save
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderItemDisplay = (item: ReceiptItem) => (
    <Card style={styles.itemCard} key={item.id}>
      <Card.Content>
        <View style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.itemMeta}>
              <Chip mode="outlined" compact style={styles.categoryChip}>
                {item.category || "Other"}
              </Chip>
              <Text style={styles.confidenceText}>
                {Math.round(item.confidence * 100)}% confidence
              </Text>
            </View>
          </View>
          <View style={styles.itemPricing}>
            <Text style={styles.itemPrice}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
            <Text style={styles.itemQuantity}>
              {item.quantity > 1
                ? `${item.quantity} × $${item.price.toFixed(2)}`
                : ""}
            </Text>
          </View>
          <View style={styles.itemActions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => handleEditItem(item.id)}
              style={styles.editButton}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteItem(item.id)}
              style={styles.deleteButton}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Review & Edit Items</Text>
            <Text style={styles.subtitle}>
              {storeName ? `${storeName} • ` : ""}
              {items.length} items
            </Text>
          </View>

          <ScrollView
            style={styles.itemsContainer}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) =>
              editingItem === item.id
                ? renderItemEditor(item)
                : renderItemDisplay(item)
            )}

            <Button
              mode="outlined"
              onPress={handleAddItem}
              style={styles.addButton}
              icon="plus"
            >
              Add Item
            </Button>
          </ScrollView>

          <View style={styles.footer}>
            <Divider style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>
                ${calculateTotal().toFixed(2)}
              </Text>
            </View>
            {total && Math.abs(calculateTotal() - total) > 0.01 && (
              <Text style={styles.totalMismatch}>
                Note: Total doesn't match receipt (${total.toFixed(2)})
              </Text>
            )}
            <View style={styles.footerActions}>
              <Button
                mode="outlined"
                onPress={onDismiss}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveAll}
                loading={isSaving}
                disabled={isSaving}
                style={styles.saveButton}
              >
                Save Changes
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    borderRadius: borderRadius.lg,
    maxHeight: "90%",
  },
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    ...typography.headline2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body2,
    color: "#666",
  },
  itemsContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  itemCard: {
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  editingCard: {
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.body1,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  categoryChip: {
    height: 24,
  },
  confidenceText: {
    ...typography.caption1,
    color: "#666",
  },
  itemPricing: {
    alignItems: "flex-end",
    marginRight: spacing.sm,
  },
  itemPrice: {
    ...typography.body1,
    fontWeight: "600",
  },
  itemQuantity: {
    ...typography.caption1,
    color: "#666",
  },
  itemActions: {
    flexDirection: "row",
  },
  editButton: {
    margin: 0,
  },
  deleteButton: {
    margin: 0,
  },
  editRow: {
    gap: spacing.sm,
  },
  priceQuantityRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  nameInput: {
    flex: 1,
  },
  priceInput: {
    flex: 1,
  },
  quantityInput: {
    width: 80,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  addButton: {
    marginTop: spacing.md,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  divider: {
    marginBottom: spacing.md,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  totalLabel: {
    ...typography.headline3,
  },
  totalAmount: {
    ...typography.headline3,
    fontWeight: "600",
  },
  totalMismatch: {
    ...typography.caption1,
    color: "#FF6B35",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  footerActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
