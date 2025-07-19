import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Modal,
  Portal,
  Text,
  Button,
  TextInput,
  Card,
  Divider,
} from "react-native-paper";
import { spacing, typography, borderRadius } from "@/constants/theme";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase";

interface CorrectionItem {
  id: string;
  originalName: string;
  correctedName: string;
  originalPrice: number;
  correctedPrice: number;
  originalQuantity: number;
  correctedQuantity: number;
}

interface CorrectionModalProps {
  visible: boolean;
  onDismiss: () => void;
  receiptData: any;
  onCorrectionSaved: (corrections: CorrectionItem[]) => void;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  visible,
  onDismiss,
  receiptData,
  onCorrectionSaved,
}) => {
  const { user } = useAuthContext();
  const [corrections, setCorrections] = useState<CorrectionItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize corrections from receipt data
  React.useEffect(() => {
    if (receiptData?.items) {
      const initialCorrections: CorrectionItem[] = receiptData.items.map(
        (item: any, index: number) => ({
          id: `item-${index}`,
          originalName: item.name || "",
          correctedName: item.name || "",
          originalPrice: item.price || 0,
          correctedPrice: item.price || 0,
          originalQuantity: item.quantity || 1,
          correctedQuantity: item.quantity || 1,
        })
      );
      setCorrections(initialCorrections);
    }
  }, [receiptData]);

  const updateCorrection = (
    id: string,
    field: keyof CorrectionItem,
    value: string | number
  ) => {
    setCorrections((prev) =>
      prev.map((correction) =>
        correction.id === id ? { ...correction, [field]: value } : correction
      )
    );
  };

  const saveCorrections = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to save corrections");
      return;
    }

    setIsSaving(true);
    try {
      // Save corrections to database for training
      const { error } = await supabase.from("ocr_corrections").insert({
        user_id: user.id,
        receipt_id: receiptData.id,
        original_receipt: receiptData,
        corrections: corrections,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving corrections:", error);
        Alert.alert("Error", "Failed to save corrections");
        return;
      }

      // Call the callback with corrections
      onCorrectionSaved(corrections);

      Alert.alert(
        "Thank You!",
        "Your corrections help us improve our receipt parsing accuracy.",
        [{ text: "OK", onPress: onDismiss }]
      );
    } catch (error) {
      console.error("Error saving corrections:", error);
      Alert.alert("Error", "Failed to save corrections");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = corrections.some(
    (correction) =>
      correction.correctedName !== correction.originalName ||
      correction.correctedPrice !== correction.originalPrice ||
      correction.correctedQuantity !== correction.originalQuantity
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <ScrollView style={styles.container}>
          <Text style={[typography.headline2, styles.title]}>
            Help Us Improve!
          </Text>
          <Text style={[typography.body1, styles.subtitle]}>
            Please correct any mistakes in the receipt parsing. Your feedback
            helps us get better!
          </Text>

          <Card style={styles.receiptCard}>
            <Card.Content>
              <Text style={[typography.title2, styles.receiptTitle]}>
                {receiptData?.store_name || "Unknown Store"}
              </Text>
              <Text style={[typography.body2, styles.receiptDate]}>
                {receiptData?.date || "Unknown Date"}
              </Text>
              <Text style={[typography.title1, styles.receiptTotal]}>
                Total: ${receiptData?.total?.toFixed(2) || "0.00"}
              </Text>
            </Card.Content>
          </Card>

          <Divider style={styles.divider} />

          <Text style={[typography.title2, styles.itemsTitle]}>
            Items ({corrections.length})
          </Text>

          {corrections.map((correction, index) => (
            <Card key={correction.id} style={styles.itemCard}>
              <Card.Content>
                <Text style={[typography.body2, styles.itemNumber]}>
                  Item {index + 1}
                </Text>

                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Name:</Text>
                  <TextInput
                    value={correction.correctedName}
                    onChangeText={(text) =>
                      updateCorrection(correction.id, "correctedName", text)
                    }
                    style={styles.textInput}
                    mode="outlined"
                    dense
                  />
                </View>

                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Price:</Text>
                  <TextInput
                    value={correction.correctedPrice.toString()}
                    onChangeText={(text) => {
                      const price = parseFloat(text) || 0;
                      updateCorrection(correction.id, "correctedPrice", price);
                    }}
                    style={styles.priceInput}
                    mode="outlined"
                    dense
                    keyboardType="numeric"
                    left={<TextInput.Affix text="$" />}
                  />
                </View>

                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Quantity:</Text>
                  <TextInput
                    value={correction.correctedQuantity.toString()}
                    onChangeText={(text) => {
                      const quantity = parseInt(text) || 1;
                      updateCorrection(
                        correction.id,
                        "correctedQuantity",
                        quantity
                      );
                    }}
                    style={styles.quantityInput}
                    mode="outlined"
                    dense
                    keyboardType="numeric"
                  />
                </View>
              </Card.Content>
            </Card>
          ))}

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.cancelButton}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={saveCorrections}
              style={styles.saveButton}
              loading={isSaving}
              disabled={!hasChanges || isSaving}
            >
              Save Corrections
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: "white",
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    maxHeight: "90%",
  },
  container: {
    padding: spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: spacing.lg,
    opacity: 0.7,
  },
  receiptCard: {
    marginBottom: spacing.md,
  },
  receiptTitle: {
    fontWeight: "bold",
  },
  receiptDate: {
    opacity: 0.7,
    marginTop: spacing.xs,
  },
  receiptTotal: {
    fontWeight: "bold",
    marginTop: spacing.sm,
  },
  divider: {
    marginVertical: spacing.md,
  },
  itemsTitle: {
    marginBottom: spacing.md,
  },
  itemCard: {
    marginBottom: spacing.md,
  },
  itemNumber: {
    fontWeight: "bold",
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  inputLabel: {
    width: 80,
    fontWeight: "500",
  },
  textInput: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  priceInput: {
    width: 100,
    marginLeft: spacing.sm,
  },
  quantityInput: {
    width: 80,
    marginLeft: spacing.sm,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  saveButton: {
    flex: 1,
    marginLeft: spacing.sm,
  },
});
