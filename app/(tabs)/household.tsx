import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Button,
  Text,
  useTheme,
  Card,
  List,
  ActivityIndicator,
  TextInput,
  Avatar,
  Chip,
  Divider,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppTheme } from "@/constants/theme";
import { EdgeCaseRenderer } from "@/components/EdgeCaseRenderer";
import { useRouter } from "expo-router";
import { useHousehold } from "@/hooks/useHousehold";
import { useAuthContext } from "@/contexts/AuthContext";
import { MotiView } from "moti";

export default function HouseholdScreen() {
  const theme = useTheme<AppTheme>();
  const router = useRouter();
  const { user } = useAuthContext();
  const { household, loading, error, createHousehold, inviteMember } =
    useHousehold();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const handleCreateHousehold = async () => {
    if (!newHouseholdName.trim()) {
      Alert.alert("Error", "Please enter a household name");
      return;
    }

    setIsCreating(true);
    const result = await createHousehold(newHouseholdName);
    setIsCreating(false);

    if (result.error) {
      Alert.alert("Error", result.error);
    } else {
      setShowCreateForm(false);
      setNewHouseholdName("");
      Alert.alert("Success", "Household created successfully!");
    }
  };

  const handleInviteMember = async () => {
    if (!newMemberEmail.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    setIsInviting(true);
    const result = await inviteMember(newMemberEmail);
    setIsInviting(false);

    if (result.error) {
      Alert.alert("Error", result.error);
    } else {
      setShowInviteForm(false);
      setNewMemberEmail("");
      Alert.alert("Success", "Invitation sent successfully!");
    }
  };

  const handleManageHousehold = () => {
    router.push("/modals/manage-household");
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text
            style={[
              styles.loadingText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Loading household...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Error: {error}
          </Text>
          <Button mode="contained" onPress={() => router.replace("/")}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text
              variant="headlineLarge"
              style={[styles.title, { color: theme.colors.onBackground }]}
            >
              Household
            </Text>
            <Text
              variant="titleMedium"
              style={[
                styles.subtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Share spending with your flatmates
            </Text>
          </View>

          {!household ? (
            // No household - show create form or empty state
            <View style={styles.content}>
              <EdgeCaseRenderer
                mood="suspicious"
                title="No Household Found"
                message="The worm grows suspicious of your solo grocery trips. Are you truly alone?"
              />

              {!showCreateForm ? (
                <MotiView
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                >
                  <Button
                    mode="contained"
                    icon="plus"
                    onPress={() => setShowCreateForm(true)}
                    style={styles.button}
                  >
                    Create Household
                  </Button>
                </MotiView>
              ) : (
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                >
                  <Card style={styles.formCard}>
                    <Card.Content>
                      <Text variant="titleMedium" style={styles.formTitle}>
                        Create Your Household
                      </Text>
                      <TextInput
                        label="Household Name"
                        value={newHouseholdName}
                        onChangeText={setNewHouseholdName}
                        mode="outlined"
                        style={styles.input}
                        placeholder="e.g., Flat 3B, The Smiths"
                      />
                      <View style={styles.formButtons}>
                        <Button
                          mode="outlined"
                          onPress={() => {
                            setShowCreateForm(false);
                            setNewHouseholdName("");
                          }}
                          style={styles.formButton}
                        >
                          Cancel
                        </Button>
                        <Button
                          mode="contained"
                          onPress={handleCreateHousehold}
                          loading={isCreating}
                          disabled={isCreating || !newHouseholdName.trim()}
                          style={styles.formButton}
                        >
                          Create
                        </Button>
                      </View>
                    </Card.Content>
                  </Card>
                </MotiView>
              )}
            </View>
          ) : (
            // Has household - show members and details
            <View style={styles.content}>
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <Card style={styles.householdCard}>
                  <Card.Content>
                    <View style={styles.householdHeader}>
                      <View>
                        <Text
                          variant="headlineSmall"
                          style={styles.householdName}
                        >
                          {household.name}
                        </Text>
                        <Text
                          variant="bodyMedium"
                          style={[
                            styles.memberCount,
                            { color: theme.colors.onSurfaceVariant },
                          ]}
                        >
                          {household.members.length} member
                          {household.members.length !== 1 ? "s" : ""}
                        </Text>
                      </View>
                      <Chip
                        icon={
                          household.owner_id === user?.id ? "crown" : "account"
                        }
                        mode="outlined"
                      >
                        {household.owner_id === user?.id ? "Owner" : "Member"}
                      </Chip>
                    </View>
                  </Card.Content>
                </Card>

                <Card style={styles.membersCard}>
                  <Card.Content>
                    <View style={styles.membersHeader}>
                      <Text variant="titleMedium">Members</Text>
                      {!showInviteForm && (
                        <Button
                          mode="text"
                          icon="plus"
                          onPress={() => setShowInviteForm(true)}
                          compact
                        >
                          Invite
                        </Button>
                      )}
                    </View>

                    {household.members.map((member, index) => (
                      <React.Fragment key={member.user.id}>
                        <List.Item
                          title={member.user.email}
                          description={
                            member.user.id === household.owner_id
                              ? "Owner"
                              : "Member"
                          }
                          left={(props) => (
                            <Avatar.Text
                              {...props}
                              size={40}
                              label={member.user.email.charAt(0).toUpperCase()}
                              style={{
                                backgroundColor: theme.colors.primaryContainer,
                              }}
                            />
                          )}
                          right={(props) =>
                            member.user.id === household.owner_id ? (
                              <List.Icon {...props} icon="crown" />
                            ) : null
                          }
                        />
                        {index < household.members.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}

                    {showInviteForm && (
                      <MotiView
                        from={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ type: "spring", damping: 15 }}
                      >
                        <View style={styles.inviteForm}>
                          <TextInput
                            label="Email Address"
                            value={newMemberEmail}
                            onChangeText={setNewMemberEmail}
                            mode="outlined"
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="flatmate@example.com"
                          />
                          <View style={styles.formButtons}>
                            <Button
                              mode="outlined"
                              onPress={() => {
                                setShowInviteForm(false);
                                setNewMemberEmail("");
                              }}
                              style={styles.formButton}
                            >
                              Cancel
                            </Button>
                            <Button
                              mode="contained"
                              onPress={handleInviteMember}
                              loading={isInviting}
                              disabled={isInviting || !newMemberEmail.trim()}
                              style={styles.formButton}
                            >
                              Invite
                            </Button>
                          </View>
                        </View>
                      </MotiView>
                    )}
                  </Card.Content>
                </Card>

                <Button
                  mode="outlined"
                  icon="cog"
                  onPress={handleManageHousehold}
                  style={styles.manageButton}
                >
                  Manage Household
                </Button>
              </MotiView>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: "center",
  },
  title: {
    fontFamily: "Inter_600SemiBold",
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  errorText: {
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    marginTop: 32,
  },
  formCard: {
    marginTop: 24,
  },
  formTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  formButton: {
    flex: 1,
  },
  householdCard: {
    marginBottom: 16,
  },
  householdHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  householdName: {
    fontFamily: "Inter_600SemiBold",
  },
  memberCount: {
    marginTop: 4,
  },
  membersCard: {
    marginBottom: 16,
  },
  membersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  inviteForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  manageButton: {
    marginTop: 8,
  },
});
