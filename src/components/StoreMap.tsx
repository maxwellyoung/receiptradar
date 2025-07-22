import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
} from "react-native";
import {
  Text,
  Card,
  Chip,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import * as Linking from "expo-linking";
import { AppTheme, spacing, typography, borderRadius } from "@/constants/theme";
import { getStoreImage, getProductImage } from "@/constants/storeImages";
import { StoreLogo } from "@/components/StoreLogo";
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from "react-native-maps";
import { logger } from "@/utils/logger";
import { BUSINESS_RULES } from "@/constants/business-rules";

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

interface StoreMapProps {
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  onStoreSelect?: (store: StoreLocation) => void;
  showMap?: boolean;
}

// Sample store data - in production this would come from an API
const SAMPLE_STORES: StoreLocation[] = [
  {
    id: "countdown-cbd",
    name: "Countdown Wellington CBD",
    address: "125 Lambton Quay",
    city: "Wellington",
    distance: 0.2,
    openingHours: "7:00 AM - 10:00 PM",
    phone: "04 472 1234",
    coordinates: { latitude: -41.2785, longitude: 174.7803 },
    features: ["grocery", "fresh-produce", "dairy"],
  },
  {
    id: "new-world-thorndon",
    name: "New World Thorndon",
    address: "1 Molesworth Street",
    city: "Wellington",
    distance: 0.8,
    openingHours: "7:00 AM - 9:00 PM",
    phone: "04 472 5678",
    coordinates: { latitude: -41.2755, longitude: 174.781 },
    features: ["grocery", "fresh-produce", "dairy", "meat"],
  },
  {
    id: "warehouse-cbd",
    name: "The Warehouse Wellington CBD",
    address: "39-45 Willis Street",
    city: "Wellington",
    distance: 0.5,
    openingHours: "8:00 AM - 9:00 PM",
    phone: "04 472 9012",
    coordinates: { latitude: -41.279, longitude: 174.778 },
    features: ["general-merchandise", "grocery", "household"],
  },
  {
    id: "moore-wilsons",
    name: "Moore Wilson's Fresh",
    address: "93-95 Tory Street",
    city: "Wellington",
    distance: 1.2,
    openingHours: "7:00 AM - 6:00 PM",
    phone: "04 384 9906",
    coordinates: { latitude: -41.282, longitude: 174.775 },
    features: ["gourmet", "fresh-produce", "premium"],
  },
  {
    id: "fresh-choice-karori",
    name: "Fresh Choice Karori",
    address: "1 Karori Road",
    city: "Wellington",
    distance: 2.1,
    openingHours: "7:00 AM - 8:00 PM",
    phone: "04 476 3456",
    coordinates: { latitude: -41.29, longitude: 174.76 },
    features: ["grocery", "fresh-produce", "regional"],
  },
];

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export function StoreMap({
  userLocation,
  onStoreSelect,
  showMap = true,
}: StoreMapProps) {
  const theme = useTheme<AppTheme>();
  const [stores, setStores] = useState<StoreLocation[]>(SAMPLE_STORES);
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(
    null
  );
  const [mapAvailable, setMapAvailable] = useState(false);

  useEffect(() => {
    // Check if react-native-maps is available
    try {
      // This will throw an error if react-native-maps is not available
      require("react-native-maps");
      setMapAvailable(true);
    } catch (error) {
      logger.info("react-native-maps not available, using list view", {
        component: "StoreMap",
      });
      setMapAvailable(false);
    }
  }, []);

  useEffect(() => {
    // In production, this would fetch stores from an API
    // and calculate distances based on user location
    if (userLocation) {
      // Calculate distances and sort by proximity
      const storesWithDistance = SAMPLE_STORES.map((store) => ({
        ...store,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          store.coordinates.latitude,
          store.coordinates.longitude
        ),
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

      setStores(storesWithDistance);
    }
  }, [userLocation]);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = BUSINESS_RULES.LOCATIONS.EARTH_RADIUS_KM; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleStorePress = (store: StoreLocation) => {
    setSelectedStore(store);
    onStoreSelect?.(store);
  };

  const handleDirections = async (store: StoreLocation) => {
    try {
      // Use Apple Maps for directions
      const url = `http://maps.apple.com/?daddr=${store.coordinates.latitude},${store.coordinates.longitude}&dirflg=d`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Unable to open Apple Maps");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to open directions");
    }
  };

  const handleCall = async (store: StoreLocation) => {
    if (!store.phone) return;

    try {
      const url = `tel:${store.phone}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Unable to make phone call");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to make phone call");
    }
  };

  const formatDistance = (distance?: number): string => {
    if (!distance) return "Unknown";
    if (distance < BUSINESS_RULES.LOCATIONS.METERS_THRESHOLD)
      return `${Math.round(distance * 1000)}m`;
    return `${distance.toFixed(1)}km`;
  };

  const getStoreIcon = (storeName: string): string => {
    const storeConfig = getStoreImage(storeName);
    return storeConfig.icon;
  };

  const getStoreColor = (storeName: string): string => {
    const storeConfig = getStoreImage(storeName);
    return storeConfig.color;
  };

  const renderMapView = () => {
    // Always show fallback for now to avoid map issues
    return (
      <View style={styles.mapFallback}>
        <View style={styles.mapPlaceholder}>
          <MaterialIcons
            name="map"
            size={64}
            color={theme.colors.onSurfaceVariant}
          />
          <Text
            style={[
              styles.mapPlaceholderText,
              { color: theme.colors.onSurface },
            ]}
          >
            Store Map
          </Text>
          <Text
            style={[
              styles.mapPlaceholderSubtext,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Map view coming soon
          </Text>
          <TouchableOpacity
            style={[
              styles.openMapsButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => {
              const url = `http://maps.apple.com/?ll=${
                userLocation?.latitude ||
                BUSINESS_RULES.LOCATIONS.WELLINGTON.lat
              },${
                userLocation?.longitude ||
                BUSINESS_RULES.LOCATIONS.WELLINGTON.lon
              }&z=13`;
              Linking.openURL(url);
            }}
          >
            <MaterialIcons name="open-in-new" size={20} color="white" />
            <Text style={styles.openMapsButtonText}>Open in Apple Maps</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStoreCard = (store: StoreLocation) => (
    <MotiView
      key={store.id}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300 }}
    >
      <Card
        style={[
          styles.storeCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor:
              selectedStore?.id === store.id
                ? theme.colors.primary
                : "transparent",
            borderWidth: selectedStore?.id === store.id ? 2 : 0,
          },
        ]}
        onPress={() => handleStorePress(store)}
      >
        <Card.Content style={styles.storeCardContent}>
          <View style={styles.storeHeader}>
            <StoreLogo storeName={store.name} size="medium" variant="icon" />
            <View style={styles.storeInfo}>
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onSurface }}
              >
                {store.name}
              </Text>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {store.address}, {store.city}
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {store.openingHours}
              </Text>
            </View>
            <View style={styles.storeActions}>
              <Chip
                mode="outlined"
                style={[
                  styles.distanceChip,
                  { borderColor: theme.colors.primary },
                ]}
                textStyle={{ color: theme.colors.primary }}
              >
                {formatDistance(store.distance)}
              </Chip>
            </View>
          </View>

          <View style={styles.storeFeatures}>
            {store.features.map((feature, index) => (
              <Chip
                key={index}
                mode="flat"
                style={[
                  styles.featureChip,
                  { backgroundColor: theme.colors.secondaryContainer },
                ]}
                textStyle={{ color: theme.colors.onSecondaryContainer }}
                compact
              >
                {feature.replace("-", " ")}
              </Chip>
            ))}
          </View>

          <View style={styles.storeActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDirections(store)}
            >
              <MaterialIcons
                name="directions"
                size={20}
                color={theme.colors.primary}
              />
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.primary, marginLeft: 4 }}
              >
                Directions
              </Text>
            </TouchableOpacity>

            {store.phone && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleCall(store)}
              >
                <MaterialIcons
                  name="phone"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.primary, marginLeft: 4 }}
                >
                  Call
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card.Content>
      </Card>
    </MotiView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}
        >
          Finding stores near you...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          variant="headlineSmall"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Stores Near You
        </Text>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Find the best deals at stores in your area
        </Text>
      </View>

      {showMap && renderMapView()}

      <View style={styles.storesList}>{stores.map(renderStoreCard)}</View>

      {stores.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialIcons
            name="location-off"
            size={64}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
            No stores found
          </Text>
          <Text
            style={[
              styles.emptyMessage,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            We couldn't find any stores in your area. Try updating your
            location.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
    ...typography.headline1,
  },
  mapContainer: {
    height: 300,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  mapFallback: {
    height: 300,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  mapPlaceholderText: {
    ...typography.headline3,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  mapPlaceholderSubtext: {
    ...typography.body2,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  openMapsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  openMapsButtonText: {
    color: "white",
    ...typography.body2,
    fontWeight: "600",
  },
  calloutContainer: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  calloutTitle: {
    ...typography.title3,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  calloutAddress: {
    ...typography.body2,
    marginBottom: spacing.xs,
  },
  calloutHours: {
    ...typography.caption1,
    marginBottom: spacing.sm,
  },
  calloutActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  calloutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: borderRadius.sm,
  },
  calloutButtonText: {
    ...typography.caption1,
    marginLeft: spacing.xs,
  },
  storesList: {
    gap: spacing.md,
  },
  storeCard: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  storeCardContent: {
    gap: spacing.sm,
  },
  storeHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  storeLogo: {
    width: 32,
    height: 32,
  },
  storeInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  storeActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  distanceChip: {
    alignSelf: "flex-start",
  },
  storeFeatures: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  featureChip: {
    marginRight: spacing.xs,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body2,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    ...typography.headline3,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body2,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
});
