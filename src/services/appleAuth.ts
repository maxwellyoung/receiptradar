import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";
import { supabase } from "./supabase";
import Constants from "expo-constants";
import { logger } from "@/utils/logger";
import { createError, ErrorCode } from "@/utils/error-handler";

export const appleAuthService = {
  // Check if Apple authentication is available
  isAvailable: async (): Promise<boolean> => {
    if (Platform.OS !== "ios") {
      return false;
    }

    try {
      return await AppleAuthentication.isAvailableAsync();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("Error checking Apple authentication availability", error);
      return false;
    }
  },

  // Sign in with Apple
  signIn: async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      logger.debug("Apple credential received", {
        user: credential.user,
        email: credential.email,
      });

      if (!credential.identityToken) {
        throw createError(
          ErrorCode.AUTH_FAILED,
          "Missing identity token from Apple credential"
        );
      }

      logger.auth("Signing in with Apple token", credential.user);
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });

      if (error) {
        throw createError(ErrorCode.AUTH_FAILED, error.message, {}, error);
      }

      logger.auth("Apple Sign-In successful", data.user?.id);
      return { user: data.user, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("Apple Sign-In failed", error);
      throw createError(ErrorCode.AUTH_FAILED, error.message, {}, error);
    }
  },

  // Sign out (this will sign out from Supabase, not Apple)
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      logger.auth("User signed out");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("Apple sign out error", error);
      throw createError(ErrorCode.AUTH_FAILED, error.message, {}, error);
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error("Error getting current user", error);
      return null;
    }
  },
};
