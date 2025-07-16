import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Alert, FlatList } from "react-native";
import {
  Button,
  Text,
  TextInput,
  useTheme,
  Card,
  List,
  ActivityIndicator,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { API_CONFIG } from "@/constants/api";
import { authService } from "@/services/supabase";
import { useAuthContext } from "@/contexts/AuthContext";

export default function ManageHouseholdModal() {
  const theme = useTheme();
  const { user } = useAuthContext();
  const [household, setHousehold] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState("");

  // Function to fetch household data
  const fetchHouseholdData = useCallback(async () => {
    setLoading(true);
    try {
      const { session, error: sessionError } =
        await authService.getCurrentSession();
      if (sessionError || !session) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_CONFIG.honoApiUrl}/api/v1/households/mine`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (response.status === 404) {
        setHousehold(null);
        setMembers([]);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch household data");
      }

      const data = await response.json();
      setHousehold(data);
      setMembers(data.members || []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHouseholdData();
  }, [fetchHouseholdData]);

  const handleCreateHousehold = async () => {
    if (!newHouseholdName.trim()) return;
    setLoading(true);
    try {
      const { session, error: sessionError } =
        await authService.getCurrentSession();
      if (sessionError || !session) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_CONFIG.honoApiUrl}/api/v1/households`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ name: newHouseholdName }),
        }
      );

      if (!response.ok) throw new Error("Failed to create household");

      await fetchHouseholdData(); // Re-fetch data after creating
    } catch (error) {
      Alert.alert("Error", "Failed to create household.");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!newMemberEmail.trim()) return;
    setIsInviting(true);
    try {
      const { session, error: sessionError } =
        await authService.getCurrentSession();
      if (sessionError || !session) throw new Error("Not authenticated");

      const response = await fetch(
        `${API_CONFIG.honoApiUrl}/api/v1/households/${household.id}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ email: newMemberEmail }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to invite member");
      }

      Alert.alert("Success", "Member invited successfully!");
      setNewMemberEmail("");
      fetchHouseholdData(); // Re-fetch to show the new member
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      Alert.alert("Error", message);
    } finally {
      setIsInviting(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">
          {household ? household.name : "Create Household"}
        </Text>
        <Button onPress={() => router.back()}>Close</Button>
      </View>

      {household ? (
        // Display household members and invite form
        <View style={styles.content}>
          <Card>
            <Card.Content>
              <List.Section title="Members">
                {members.map((member) => (
                  <List.Item
                    key={member.user.id}
                    title={member.user.email}
                    description={member.role}
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon={
                          member.role === "admin" ? "account-crown" : "account"
                        }
                      />
                    )}
                  />
                ))}
              </List.Section>
              <TextInput
                label="Invite new member by email"
                value={newMemberEmail}
                onChangeText={setNewMemberEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Button
                mode="contained"
                onPress={handleInviteMember}
                loading={isInviting}
                disabled={isInviting}
              >
                Invite Member
              </Button>
            </Card.Content>
          </Card>
        </View>
      ) : (
        // Display create household form
        <View style={styles.content}>
          <TextInput
            label="Household Name"
            value={newHouseholdName}
            onChangeText={setNewHouseholdName}
            mode="outlined"
            style={styles.input}
          />
          <Button mode="contained" onPress={handleCreateHousehold}>
            Create
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
});
