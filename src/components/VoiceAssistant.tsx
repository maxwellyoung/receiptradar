import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import { AppTheme } from "@/constants/theme";
import { spacing, typography, borderRadius, shadows } from "@/constants/theme";
import {
  voiceAssistantService,
  VoiceResponse,
} from "@/services/VoiceAssistantService";

interface VoiceAssistantProps {
  variant?: "demo" | "full";
  onCommand?: (response: VoiceResponse) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  variant = "demo",
  onCommand,
}) => {
  const theme = useTheme<AppTheme>();
  const [isListening, setIsListening] = useState(false);
  const [command, setCommand] = useState("");
  const [response, setResponse] = useState<VoiceResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandHistory, setCommandHistory] = useState<
    Array<{ command: string; response: VoiceResponse }>
  >([]);

  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const exampleCommands = [
    "Where is the cheapest milk today?",
    "What's the price of bread at Countdown?",
    "Add milk to my shopping list",
    "Show me deals on vegetables",
    "What's on my shopping list?",
    "Compare prices for eggs across stores",
  ];

  const handleVoiceCommand = async (inputCommand: string) => {
    if (!inputCommand.trim()) return;

    setIsProcessing(true);
    setCommand(inputCommand);

    try {
      const voiceResponse = await voiceAssistantService.processCommand(
        inputCommand
      );
      setResponse(voiceResponse);
      setCommandHistory((prev) => [
        ...prev,
        { command: inputCommand, response: voiceResponse },
      ]);
      onCommand?.(voiceResponse);
    } catch (error) {
      setResponse({
        success: false,
        message: "Sorry, I encountered an error. Please try again.",
        suggestions: ["Check your connection and try again"],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExampleCommand = (exampleCommand: string) => {
    handleVoiceCommand(exampleCommand);
  };

  const startListening = () => {
    setIsListening(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopListening = () => {
    setIsListening(false);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const renderResponse = (voiceResponse: VoiceResponse) => {
    return (
      <View
        style={[
          styles.responseContainer,
          { backgroundColor: voiceResponse.success ? "#F0FDF4" : "#FEF2F2" },
        ]}
      >
        <View style={styles.responseHeader}>
          <MaterialIcons
            name={voiceResponse.success ? "check-circle" : "error"}
            size={20}
            color={voiceResponse.success ? "#10B981" : "#EF4444"}
          />
          <Text
            style={[
              styles.responseMessage,
              { color: voiceResponse.success ? "#065F46" : "#991B1B" },
            ]}
          >
            {voiceResponse.message}
          </Text>
        </View>

        {voiceResponse.suggestions && voiceResponse.suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text
              style={[styles.suggestionsTitle, { color: theme.colors.primary }]}
            >
              Try asking:
            </Text>
            {voiceResponse.suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.suggestionButton,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => handleExampleCommand(suggestion)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.suggestionText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {suggestion}
                </Text>
                <MaterialIcons
                  name="mic"
                  size={16}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (variant === "demo") {
    return (
      <View style={styles.demoContainer}>
        <Text style={[styles.demoTitle, { color: theme.colors.primary }]}>
          Voice Assistant
        </Text>
        <Text
          style={[
            styles.demoSubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Ask about prices, manage your shopping list, and find deals with voice
          commands
        </Text>

        {/* Voice Button */}
        <View style={styles.voiceSection}>
          <TouchableOpacity
            style={[
              styles.voiceButton,
              {
                backgroundColor: isListening ? "#EF4444" : theme.colors.primary,
              },
              isListening && styles.listeningButton,
            ]}
            onPress={isListening ? stopListening : startListening}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <MaterialIcons
                name={isListening ? "stop" : "mic"}
                size={32}
                color="white"
              />
            </Animated.View>
          </TouchableOpacity>
          <Text
            style={[
              styles.voiceLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {isListening ? "Listening..." : "Tap to speak"}
          </Text>
        </View>

        {/* Text Input Alternative */}
        <View style={styles.inputSection}>
          <TextInput
            style={[
              styles.commandInput,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.onSurface,
                borderColor: theme.colors.outline,
              },
            ]}
            placeholder="Or type your command here..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={command}
            onChangeText={setCommand}
            onSubmitEditing={() => handleVoiceCommand(command)}
            editable={!isProcessing}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => handleVoiceCommand(command)}
            disabled={isProcessing || !command.trim()}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name={isProcessing ? "hourglass-empty" : "send"}
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* Example Commands */}
        <View style={styles.examplesSection}>
          <Text style={[styles.examplesTitle, { color: theme.colors.primary }]}>
            Try these commands:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {exampleCommands.map((example, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.exampleButton,
                  { backgroundColor: theme.colors.surface },
                ]}
                onPress={() => handleExampleCommand(example)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="mic"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.exampleText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {example}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Response */}
        {response && (
          <View style={styles.responseSection}>{renderResponse(response)}</View>
        )}

        {/* Command History */}
        {commandHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text
              style={[styles.historyTitle, { color: theme.colors.primary }]}
            >
              Recent Commands
            </Text>
            <ScrollView style={styles.historyList}>
              {commandHistory
                .slice(-3)
                .reverse()
                .map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.historyItem,
                      { backgroundColor: theme.colors.surface },
                    ]}
                  >
                    <Text
                      style={[
                        styles.historyCommand,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      "{item.command}"
                    </Text>
                    <Text
                      style={[
                        styles.historyResponse,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {item.response.message}
                    </Text>
                  </View>
                ))}
            </ScrollView>
          </View>
        )}

        {/* Features List */}
        <View style={styles.featuresList}>
          <Text style={[styles.featuresTitle, { color: theme.colors.primary }]}>
            Voice Commands Available
          </Text>
          <View style={styles.featureItem}>
            <MaterialIcons name="search" size={20} color="#3B82F6" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>Price Checks:</Text> "What's
              the price of milk?"
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="shopping-cart" size={20} color="#10B981" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>Shopping List:</Text> "Add
              bread to my list"
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="local-offer" size={20} color="#F59E0B" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>Deal Search:</Text> "Show me
              deals on vegetables"
            </Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="compare" size={20} color="#8B5CF6" />
            <Text
              style={[styles.featureText, { color: theme.colors.onSurface }]}
            >
              <Text style={{ fontWeight: "600" }}>Store Comparison:</Text>{" "}
              "Which store is cheapest for eggs?"
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Voice Assistant
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Control your shopping experience with voice commands
        </Text>
      </View>

      <View style={styles.mainSection}>
        <TouchableOpacity
          style={[
            styles.fullVoiceButton,
            { backgroundColor: isListening ? "#EF4444" : theme.colors.primary },
            isListening && styles.listeningButton,
          ]}
          onPress={isListening ? stopListening : startListening}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <MaterialIcons
              name={isListening ? "stop" : "mic"}
              size={48}
              color="white"
            />
          </Animated.View>
          <Text style={styles.fullVoiceLabel}>
            {isListening ? "Listening..." : "Tap to speak"}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={[
            styles.fullCommandInput,
            {
              backgroundColor: theme.colors.surface,
              color: theme.colors.onSurface,
              borderColor: theme.colors.outline,
            },
          ]}
          placeholder="Or type your command here..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={command}
          onChangeText={setCommand}
          onSubmitEditing={() => handleVoiceCommand(command)}
          editable={!isProcessing}
          multiline
        />

        {response && (
          <View style={styles.fullResponseSection}>
            {renderResponse(response)}
          </View>
        )}
      </View>

      <ScrollView style={styles.examplesContainer}>
        <Text style={[styles.examplesTitle, { color: theme.colors.primary }]}>
          Example Commands
        </Text>
        {exampleCommands.map((example, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.fullExampleButton,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => handleExampleCommand(example)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="mic" size={20} color={theme.colors.primary} />
            <Text
              style={[
                styles.fullExampleText,
                { color: theme.colors.onSurface },
              ]}
            >
              {example}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    alignItems: "center",
  },
  title: {
    ...typography.headline1,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    textAlign: "center",
    lineHeight: 24,
  },
  mainSection: {
    padding: spacing.lg,
    alignItems: "center",
  },
  fullVoiceButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  fullVoiceLabel: {
    ...typography.body2,
    color: "white",
    marginTop: spacing.sm,
    fontWeight: "600",
  },
  fullCommandInput: {
    width: "100%",
    minHeight: 80,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...typography.body1,
    textAlignVertical: "top",
  },
  fullResponseSection: {
    width: "100%",
  },
  examplesContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  fullExampleButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  fullExampleText: {
    ...typography.body2,
    marginLeft: spacing.sm,
    flex: 1,
  },
  demoContainer: {
    padding: spacing.lg,
  },
  demoTitle: {
    ...typography.headline1,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  demoSubtitle: {
    ...typography.body1,
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  voiceSection: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  listeningButton: {
    ...shadows.lg,
  },
  voiceLabel: {
    ...typography.body2,
    fontWeight: "500",
  },
  inputSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  commandInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    ...typography.body1,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  examplesSection: {
    marginBottom: spacing.lg,
  },
  examplesTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  exampleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    ...shadows.sm,
  },
  exampleText: {
    ...typography.caption1,
    marginLeft: spacing.xs,
  },
  responseSection: {
    marginBottom: spacing.lg,
  },
  responseContainer: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  responseHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  responseMessage: {
    ...typography.body2,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  suggestionsContainer: {
    marginTop: spacing.sm,
  },
  suggestionsTitle: {
    ...typography.caption1,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  suggestionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  suggestionText: {
    ...typography.caption1,
    flex: 1,
  },
  historySection: {
    marginBottom: spacing.lg,
  },
  historyTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  historyList: {
    maxHeight: 200,
  },
  historyItem: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  historyCommand: {
    ...typography.caption1,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  historyResponse: {
    ...typography.caption2,
    lineHeight: 16,
  },
  featuresList: {
    marginTop: spacing.lg,
  },
  featuresTitle: {
    ...typography.body1,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  featureText: {
    ...typography.body2,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
});
