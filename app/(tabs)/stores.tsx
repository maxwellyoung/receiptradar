import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Text, useTheme, ActivityIndicator, Button } from "react-native-paper";
import { StoreMap } from "@/components/StoreMap";
import { AppTheme, spacing, typography } from "@/constants/theme";

interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  distance?: number;
  openingHours: string;
  phone?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  features: string[];
}

export default function StoresScreen() {
  const theme = useTheme<AppTheme>();
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(
    null
  );

  const getLocationFromBrowser = async () => {
    setLoading(true);
    try {
      // Use browser's geolocation API
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setLoading(false);
          },
          (error) => {
            console.log("Location error:", error);
            // Fallback to Wellington
            setUserLocation({
              latitude: -41.2785,
              longitude: 174.7803,
            });
            setLoading(false);
            Alert.alert(
              "Location Access",
              "Unable to get your location. Showing stores in Wellington CBD instead.",
              [{ text: "OK" }]
            );
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      } else {
        // Fallback for devices without geolocation
        setUserLocation({
          latitude: -41.2785,
          longitude: 174.7803,
        });
        setLoading(false);
        Alert.alert(
          "Location Not Available",
          "Your device doesn't support location services. Showing stores in Wellington CBD.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.log("Location error:", error);
      setUserLocation({
        latitude: -41.2785,
        longitude: 174.7803,
      });
      setLoading(false);
    }
  };

  const handleStoreSelect = (store: StoreLocation) => {
    setSelectedStore(store);
    console.log("Selected store:", store.name);
  };

  const requestLocationPermission = async () => {
    setLoading(true);
    try {
      // Try to get location immediately
      await getLocationFromBrowser();
    } catch (error) {
      console.log("Error getting location:", error);
      setUserLocation({
        latitude: -41.2785,
        longitude: 174.7803,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}
        >
          Getting your location...
        </Text>
        <Text
          style={[
            styles.loadingSubtext,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Please allow location access when prompted
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text
          variant="headlineMedium"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Store Finder
        </Text>
        <Text
          variant="bodyLarge"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Find stores near you with Apple MapKit integration
        </Text>
        {userLocation ? (
          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.onSurfaceVariant,
              marginTop: spacing.sm,
            }}
          >
            📍 Location services enabled - showing stores near you
          </Text>
        ) : (
          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.onSurfaceVariant,
              marginTop: spacing.sm,
            }}
          >
            📍 Showing stores in Wellington CBD
          </Text>
        )}
      </View>

      {!userLocation && (
        <View style={styles.locationPrompt}>
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onSurfaceVariant,
              marginBottom: spacing.sm,
            }}
          >
            Enable location services to see stores near you:
          </Text>
          <Button
            mode="contained"
            onPress={getLocationFromBrowser}
            style={{ marginBottom: spacing.sm }}
          >
            Enable Location Services
          </Button>
        </View>
      )}

      <StoreMap
        userLocation={userLocation || undefined}
        onStoreSelect={handleStoreSelect}
        showMap={true}
      />

      {selectedStore && (
        <View style={styles.selectedStoreInfo}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
            Selected: {selectedStore.name}
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {selectedStore.address}, {selectedStore.city}
          </Text>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {selectedStore.openingHours}
          </Text>
          {selectedStore.distance && (
            <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
              📏{" "}
              {selectedStore.distance < 1
                ? `${Math.round(selectedStore.distance * 1000)}m`
                : `${selectedStore.distance.toFixed(1)}km`}{" "}
              away
            </Text>
          )}
        </View>
      )}

      <View style={styles.infoSection}>
        <Text
          variant="titleSmall"
          style={{ color: theme.colors.onSurface, marginBottom: spacing.sm }}
        >
          🗺️ Map Features
        </Text>
        <Text
          variant="bodySmall"
          style={{
            color: theme.colors.onSurfaceVariant,
            marginBottom: spacing.xs,
          }}
        >
          • Tap store markers for details
        </Text>
        <Text
          variant="bodySmall"
          style={{
            color: theme.colors.onSurfaceVariant,
            marginBottom: spacing.xs,
          }}
        >
          • Use directions button to open Apple Maps
        </Text>
        <Text
          variant="bodySmall"
          style={{
            color: theme.colors.onSurfaceVariant,
            marginBottom: spacing.xs,
          }}
        >
          • Call stores directly from the map
        </Text>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          • Stores sorted by distance from your location
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.sm,
    ...typography.headline1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body1,
  },
  loadingSubtext: {
    ...typography.body2,
    textAlign: "center",
  },
  locationPrompt: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 12,
  },
  selectedStoreInfo: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 12,
    gap: spacing.xs,
  },
  infoSection: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
  },
});
