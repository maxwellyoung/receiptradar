import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { OfficialStoreLogo } from "./OfficialStoreLogo";
import { Card, Title, Paragraph } from "react-native-paper";

export const OfficialLogoDemo: React.FC = () => {
  const stores = [
    {
      name: "Countdown",
      description: "New Zealand's largest supermarket chain",
    },
    {
      name: "Pak'nSave",
      description: "Budget-friendly supermarket with bulk buying",
    },
    {
      name: "New World",
      description: "Premium supermarket chain known for quality",
    },
    {
      name: "Fresh Choice",
      description: "Regional supermarket with fresh produce",
    },
    {
      name: "The Warehouse",
      description: "General merchandise store with grocery section",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>🏪 Official Store Logos</Title>
      <Paragraph style={styles.subtitle}>
        Using the actual store logos you provided - much better than generic
        icons!
      </Paragraph>

      {stores.map((store, index) => (
        <Card key={index} style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.logoContainer}>
              <OfficialStoreLogo storeName={store.name} size={60} />
            </View>
            <View style={styles.textContainer}>
              <Title style={styles.storeName}>{store.name}</Title>
              <Paragraph style={styles.description}>
                {store.description}
              </Paragraph>
            </View>
          </Card.Content>
        </Card>
      ))}

      <Card style={styles.infoCard}>
        <Card.Content>
          <Title style={styles.infoTitle}>✨ Benefits</Title>
          <Paragraph style={styles.infoText}>
            • Authentic branding with real store logos{"\n"}• Professional
            quality with proper colors and gradients{"\n"}• No licensing issues
            - you have the actual logos{"\n"}• Better user recognition and trust
            {"\n"}• Scalable SVG format for perfect quality
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    color: "#666",
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  logoContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
  infoCard: {
    marginTop: 16,
    backgroundColor: "#e3f2fd",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
