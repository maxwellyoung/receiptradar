import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Button, TextInput, useTheme, Appbar } from "react-native-paper";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { AppTheme } from "@/constants/theme";

export default function EditProfileScreen() {
  const theme = useTheme<AppTheme>();
  const router = useRouter();
  const { user, updateUser, loading } = useAuthContext();
  const [name, setName] = useState(user?.name || "");

  const handleSave = async () => {
    try {
      await updateUser({ name });
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile.");
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.Action icon="close" onPress={() => router.back()} />
        <Appbar.Content title="Edit Profile" />
        <Appbar.Action icon="check" onPress={handleSave} disabled={loading} />
      </Appbar.Header>
      <View style={styles.content}>
        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
          disabled={loading}
        />
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          loading={loading}
          disabled={loading}
        >
          Save Changes
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
  },
});
