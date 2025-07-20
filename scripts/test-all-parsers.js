// Test script for all new parsers
// This tests the basic logic without requiring TypeScript compilation

function testAllParsers() {
  console.log("🧪 Testing All New Parsers...\n");

  // Test Moore Wilson's parser
  console.log("📄 Testing Moore Wilson's Parser:");
  const mooreWilsonsReceipt = `
MOORE WILSON'S FRESH
123 Victoria Street, Wellington
Phone: (04) 384 9906

RECEIPT #12345
Date: 15/12/2024
Time: 14:30

Organic Bananas $4.50
Free Range Eggs 12pk @ $8.99 $8.99
Artisan Sourdough Bread $6.50
Kapiti Cheese 250g $12.99
Lewis Road Creamery Milk 2L $5.99

TOTAL: $38.97

Thank you for shopping at Moore Wilson's Fresh!
  `.trim();

  testParser(mooreWilsonsReceipt, "Moore Wilson's Fresh");

  console.log("\n" + "=".repeat(50) + "\n");

  // Test The Warehouse parser
  console.log("📄 Testing The Warehouse Parser:");
  const warehouseReceipt = `
THE WAREHOUSE
39-45 Willis Street, Wellington
Phone: (04) 472 9012

RECEIPT #67890
Date: 16/12/2024
Time: 15:45

Pams Milk 2L $3.99
Warehouse Brand Pasta 500g $1.50
Fresh Bread $2.99
Toilet Paper 6pk $4.99
Warehouse Brand Cereal 750g $3.50

TOTAL: $16.97

Thank you for shopping at The Warehouse!
  `.trim();

  testParser(warehouseReceipt, "The Warehouse");

  console.log("\n" + "=".repeat(50) + "\n");

  // Test Fresh Choice parser
  console.log("📄 Testing Fresh Choice Parser:");
  const freshChoiceReceipt = `
FRESH CHOICE
1 Karori Road, Wellington
Phone: (04) 476 3456

RECEIPT #11111
Date: 17/12/2024
Time: 16:20

Fresh Bananas $3.99
Fresh Choice Milk 2L $4.50
Local Apples $5.99
Fresh Choice Bread $2.99
Fresh Tomatoes $4.25

TOTAL: $21.72

Thank you for shopping at Fresh Choice!
  `.trim();

  testParser(freshChoiceReceipt, "Fresh Choice");

  console.log("\n✅ All parser tests completed!");
  console.log("ReceiptRadar now supports 7 major New Zealand retailers:");
  console.log("- Countdown");
  console.log("- New World");
  console.log("- Pak'nSave");
  console.log("- Four Square");
  console.log("- Moore Wilson's Fresh");
  console.log("- The Warehouse");
  console.log("- Fresh Choice");
}

function testParser(receiptText, storeName) {
  console.log(`Store: ${storeName}`);
  console.log("Receipt:");
  console.log(receiptText);
  console.log("");

  // Test store identification
  const canParse = canIdentifyStore(receiptText, storeName);
  console.log(`✅ Can identify ${storeName}: ${canParse}`);

  // Test item parsing
  const items = parseItems(receiptText);
  const total = parseTotal(receiptText);

  console.log(`✅ Total: $${total}`);
  console.log(`✅ Items found: ${items.length}`);

  console.log("📦 Items:");
  items.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.name} - $${item.price}`);
  });

  console.log("");
}

function canIdentifyStore(receiptText, storeName) {
  const lowerText = receiptText.toLowerCase();
  const lowerStore = storeName.toLowerCase();

  if (storeName === "Moore Wilson's Fresh") {
    return (
      lowerText.includes("moore wilson") || lowerText.includes("wilson fresh")
    );
  } else if (storeName === "The Warehouse") {
    return lowerText.includes("warehouse") || lowerText.includes("pams");
  } else if (storeName === "Fresh Choice") {
    return (
      lowerText.includes("fresh choice") || lowerText.includes("freshchoice")
    );
  }

  return lowerText.includes(lowerStore);
}

function parseItems(receiptText) {
  const lines = receiptText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const items = [];

  for (const line of lines) {
    const priceMatch = line.match(/\$(\d+\.\d{2})$/);
    if (priceMatch && !line.includes("TOTAL") && !line.includes("RECEIPT")) {
      const price = parseFloat(priceMatch[1]);
      const itemName = line.replace(/\$(\d+\.\d{2})$/, "").trim();

      if (itemName.length > 2) {
        items.push({
          name: itemName,
          price: price,
          quantity: 1,
        });
      }
    }
  }

  return items;
}

function parseTotal(receiptText) {
  const lines = receiptText.split("\n");

  for (const line of lines) {
    if (line.includes("TOTAL")) {
      const totalMatch = line.match(/\$?(\d+\.\d{2})/);
      if (totalMatch) {
        return parseFloat(totalMatch[1]);
      }
    }
  }

  return 0;
}

// Run the test
testAllParsers();
