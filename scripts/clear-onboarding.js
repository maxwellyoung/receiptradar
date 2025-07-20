const AsyncStorage = require("@react-native-async-storage/async-storage");

async function clearOnboarding() {
  try {
    await AsyncStorage.removeItem("@hasOnboarded");
    console.log("✅ Onboarding status cleared!");
    console.log("📱 Restart the app to see the onboarding flow");
  } catch (error) {
    console.error("❌ Failed to clear onboarding status:", error);
  }
}

clearOnboarding();
