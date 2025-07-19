# 🔧 Correction Interface Integration Guide

## 📱 Adding Correction Interface to Your App

### **Step 1: Import the CorrectionModal**

Add this import to your receipt detail screen:

```typescript
import { CorrectionModal } from "@/components/CorrectionModal";
```

### **Step 2: Add State Management**

Add these state variables to your component:

```typescript
const [showCorrection, setShowCorrection] = useState(false);
const [receiptData, setReceiptData] = useState<any>(null);
```

### **Step 3: Add Correction Button**

Add a correction button to your receipt detail screen. You can place it:

**Option A: In the header (recommended)**

```typescript
import { useRouter } from "expo-router";

const router = useRouter();

// In your header or navigation
<Button
  mode="outlined"
  onPress={() => setShowCorrection(true)}
  icon="pencil"
  style={{ marginRight: 10 }}
>
  Correct
</Button>;
```

**Option B: Below the receipt details**

```typescript
<Card style={styles.correctionCard}>
  <Card.Content>
    <Text style={typography.title2}>Found an error?</Text>
    <Text style={typography.body2}>
      Help us improve by correcting any mistakes in the receipt parsing.
    </Text>
    <Button
      mode="contained"
      onPress={() => setShowCorrection(true)}
      style={{ marginTop: spacing.sm }}
    >
      Correct Receipt
    </Button>
  </Card.Content>
</Card>
```

### **Step 4: Add the CorrectionModal**

Add this at the bottom of your component, before the closing tag:

```typescript
<CorrectionModal
  visible={showCorrection}
  onDismiss={() => setShowCorrection(false)}
  receiptData={receiptData}
  onCorrectionSaved={(corrections) => {
    console.log("Corrections saved:", corrections);
    // Optionally refresh the receipt data
    // Optionally show a success message
    Alert.alert(
      "Thank You!",
      "Your corrections help us improve our receipt parsing accuracy."
    );
  }}
/>
```

### **Step 5: Handle Correction Callback**

When corrections are saved, you might want to:

```typescript
const handleCorrectionSaved = async (corrections: any[]) => {
  // Log the corrections
  console.log("Corrections saved:", corrections);

  // Optionally update the receipt data
  if (corrections.length > 0) {
    // You could update the receipt with corrected data
    // or just show a success message
  }

  // Show success message
  Alert.alert(
    "Thank You!",
    "Your corrections help us improve our receipt parsing accuracy."
  );

  // Close the modal
  setShowCorrection(false);
};
```

## 🎨 Complete Integration Example

Here's a complete example of how to integrate the correction interface:

```typescript
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Button, Card } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { CorrectionModal } from "@/components/CorrectionModal";
import { dbService } from "@/services/supabase";
import { spacing, typography } from "@/constants/theme";

export default function ReceiptDetailScreen() {
  const { id } = useLocalSearchParams();
  const [receiptData, setReceiptData] = useState<any>(null);
  const [showCorrection, setShowCorrection] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceipt();
  }, [id]);

  const loadReceipt = async () => {
    if (!id) return;

    try {
      const { data, error } = await dbService.getReceiptById(id as string);
      if (error) throw error;
      setReceiptData(data);
    } catch (error) {
      console.error("Error loading receipt:", error);
      Alert.alert("Error", "Failed to load receipt");
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectionSaved = async (corrections: any[]) => {
    console.log("Corrections saved:", corrections);

    // Show success message
    Alert.alert(
      "Thank You!",
      "Your corrections help us improve our receipt parsing accuracy."
    );

    // Optionally refresh the receipt data
    await loadReceipt();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!receiptData) {
    return (
      <View style={styles.container}>
        <Text>Receipt not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Receipt Details */}
      <Card style={styles.receiptCard}>
        <Card.Content>
          <Text style={typography.title1}>{receiptData.store_name}</Text>
          <Text style={typography.body1}>{receiptData.date}</Text>
          <Text style={typography.title2}>
            Total: ${receiptData.total_amount?.toFixed(2)}
          </Text>
        </Card.Content>
      </Card>

      {/* Items List */}
      {receiptData.ocr_data?.items?.map((item: any, index: number) => (
        <Card key={index} style={styles.itemCard}>
          <Card.Content>
            <Text style={typography.body1}>{item.name}</Text>
            <Text style={typography.body2}>
              ${item.price?.toFixed(2)} x {item.quantity}
            </Text>
          </Card.Content>
        </Card>
      ))}

      {/* Correction Button */}
      <Card style={styles.correctionCard}>
        <Card.Content>
          <Text style={typography.title2}>Found an error?</Text>
          <Text style={typography.body2}>
            Help us improve by correcting any mistakes in the receipt parsing.
          </Text>
          <Button
            mode="contained"
            onPress={() => setShowCorrection(true)}
            style={{ marginTop: spacing.sm }}
            icon="pencil"
          >
            Correct Receipt
          </Button>
        </Card.Content>
      </Card>

      {/* Correction Modal */}
      <CorrectionModal
        visible={showCorrection}
        onDismiss={() => setShowCorrection(false)}
        receiptData={receiptData}
        onCorrectionSaved={handleCorrectionSaved}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  receiptCard: {
    marginBottom: spacing.md,
  },
  itemCard: {
    marginBottom: spacing.sm,
  },
  correctionCard: {
    marginTop: spacing.lg,
  },
});
```

## 🔧 Quick Integration Steps

### **For Receipt Detail Screen (`app/receipt/[id].tsx`):**

1. **Add imports**:

```typescript
import { CorrectionModal } from "@/components/CorrectionModal";
import { useState } from "react";
```

2. **Add state**:

```typescript
const [showCorrection, setShowCorrection] = useState(false);
```

3. **Add button** (in your JSX):

```typescript
<Button mode="contained" onPress={() => setShowCorrection(true)} icon="pencil">
  Correct Receipt
</Button>
```

4. **Add modal** (at the bottom of your JSX):

```typescript
<CorrectionModal
  visible={showCorrection}
  onDismiss={() => setShowCorrection(false)}
  receiptData={receiptData}
  onCorrectionSaved={(corrections) => {
    console.log("Corrections saved:", corrections);
    Alert.alert("Thank You!", "Your corrections help us improve!");
  }}
/>
```

### **For Receipts List Screen (`app/(tabs)/receipts.tsx`):**

You can add a correction button to each receipt card:

```typescript
<Card.Actions>
  <Button onPress={() => router.push(`/receipt/${receipt.id}`)}>
    View Details
  </Button>
  <Button onPress={() => setShowCorrection(true)}>Correct</Button>
</Card.Actions>
```

## 🎯 **Ready to Integrate!**

The correction interface is ready to use. Just follow the steps above to add it to your receipt screens. The interface will:

- ✅ **Show the parsed receipt data** for users to review
- ✅ **Allow editing** of item names, prices, and quantities
- ✅ **Save corrections** to the database for training
- ✅ **Provide feedback** to users about their contribution

**Want me to help you integrate it into a specific screen, or would you like to try it yourself first?** 🚀
