import { useEffect, useState, useCallback } from "react";
import { API_CONFIG } from "@/constants/api";
import { authService } from "@/services/supabase";
import { handleAsyncError, logError } from "@/utils/error-handler";
import { logger } from "@/utils/logger";

interface HouseholdMember {
  user: {
    id: string;
    email: string;
  };
  role: string;
}

interface Household {
  id: string;
  name: string;
  owner_id: string;
  members: HouseholdMember[];
  created_at: string;
  updated_at: string;
}

interface HouseholdState {
  household: Household | null;
  loading: boolean;
  error: string | null;
}

export const useHousehold = () => {
  const [state, setState] = useState<HouseholdState>({
    household: null,
    loading: true,
    error: null,
  });

  const fetchHousehold = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { session, error: sessionError } =
        await authService.getCurrentSession();
      if (sessionError || !session) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Not authenticated",
        }));
        return;
      }

      const response = await fetch(
        `${API_CONFIG.honoApiUrl}/api/v1/households/mine`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (response.status === 404) {
        setState({ household: null, loading: false, error: null });
        return;
      }

      if (!response.ok) {
        // Handle database schema errors gracefully
        if (response.status === 500) {
          const errorData = await response.json();
          if (errorData.error && errorData.error.includes("relationship")) {
            // Database tables not set up yet - treat as no household
            setState({ household: null, loading: false, error: null });
            return;
          }
        }
        throw new Error("Failed to fetch household data");
      }

      const data = await response.json();
      setState({ household: data, loading: false, error: null });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // Handle network errors gracefully
      if (
        err.message.includes("Network request failed") ||
        err.message.includes("fetch")
      ) {
        logger.warn("Network request failed - backend may not be running", {
          component: "useHousehold",
          error: err.message,
          apiUrl: API_CONFIG.honoApiUrl,
        });

        // In development, provide helpful feedback
        if (API_CONFIG.isDevelopment) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error:
              "Backend server not running. Start with: cd backend && npm run dev",
          }));
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Network error - please check your connection",
          }));
        }
      } else {
        logError(err, "useHousehold.fetchHousehold");
        setState((prev) => ({ ...prev, loading: false, error: err.message }));
      }
    }
  }, []);

  const createHousehold = async (name: string) => {
    if (!name.trim()) return { error: "Household name cannot be empty" };

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { session, error: sessionError } =
        await authService.getCurrentSession();
      if (sessionError || !session) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Not authenticated",
        }));
        return { error: "Not authenticated" };
      }

      const response = await fetch(
        `${API_CONFIG.honoApiUrl}/api/v1/households`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ name }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create household");
      }

      const data = await response.json();
      setState({ household: data, loading: false, error: null });
      return { data, error: null };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logError(err, "useHousehold.createHousehold");
      setState((prev) => ({ ...prev, loading: false, error: err.message }));
      return { error: err.message };
    }
  };

  const inviteMember = async (email: string) => {
    if (!state.household) return { error: "No household found" };
    if (!email.trim()) return { error: "Email cannot be empty" };

    try {
      const { session, error: sessionError } =
        await authService.getCurrentSession();
      if (sessionError || !session) {
        return { error: "Not authenticated" };
      }

      const response = await fetch(
        `${API_CONFIG.honoApiUrl}/api/v1/households/${state.household.id}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to invite member");
      }

      // Refresh household data to show new member
      await fetchHousehold();
      return { error: null };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logError(err, "useHousehold.inviteMember");
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchHousehold();
  }, [fetchHousehold]);

  return {
    household: state.household,
    loading: state.loading,
    error: state.error,
    createHousehold,
    inviteMember,
    refreshHousehold: fetchHousehold,
  };
};
