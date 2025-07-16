import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "@/services/supabase";
import { appleAuthService } from "@/services/appleAuth";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  name?: string;
  emailConfirmed?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  emailConfirmationPending: boolean;
  pendingEmail: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: { name?: string }) => Promise<void>;
  checkEmailConfirmation: () => Promise<boolean>;
  setEmailConfirmationPending: (pending: boolean, email?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Track auth context instances
let authContextInstanceCount = 0;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailConfirmationPending, setEmailConfirmationPending] =
    useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  // Track component instance for logging
  const [instanceId] = useState(() => ++authContextInstanceCount);

  const loadUser = useCallback(async () => {
    try {
      const { user: currentUser } = await authService.getCurrentUser();

      if (currentUser) {
        const emailConfirmed = !!currentUser.email_confirmed_at;
        setUser({
          id: currentUser.id,
          email: currentUser.email || "",
          name:
            currentUser.user_metadata?.name || currentUser.email?.split("@")[0],
          emailConfirmed,
        });

        // Check if email confirmation is pending
        if (!emailConfirmed && currentUser.email) {
          setEmailConfirmationPending(true);
          setPendingEmail(currentUser.email);
        }
      } else {
        console.log(
          `🔧 AuthContext[${instanceId}] - loadUser - No current user found`
        );
      }
    } catch (error) {
      console.error(`🔧 AuthContext[${instanceId}] - loadUser - Error:`, error);
    } finally {
      console.log(
        `🔧 AuthContext[${instanceId}] - loadUser - Setting loading to false from loadUser`
      );
      setLoading(false);
    }
  }, [instanceId]);

  useEffect(() => {
    // Load user from Supabase auth on app start
    loadUser();

    // Listen to auth state changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        // Add a session guard right at the top
        if (!session) {
          if (event === "SIGNED_OUT") {
            setUser(null);
          }
          setLoading(false);
          return;
        }

        const { user } = session;

        if (event === "SIGNED_IN" && user) {
          const emailConfirmed = !!user.email_confirmed_at;
          setUser({
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.name || user.email?.split("@")[0],
            emailConfirmed,
          });

          // Clear email confirmation pending state if email is confirmed
          if (emailConfirmed) {
            setEmailConfirmationPending(false);
            setPendingEmail(null);
          }
        } else if (event === "SIGNED_OUT") {
          console.log(
            `🔧 AuthContext[${instanceId}] - SIGNED_OUT - Clearing user`
          );
          setUser(null);
          setEmailConfirmationPending(false);
          setPendingEmail(null);
        } else if (event === "INITIAL_SESSION" && user) {
          console.log(
            `🔧 AuthContext[${instanceId}] - INITIAL_SESSION - Session exists`
          );
          // Handle initial session
          const emailConfirmed = !!user.email_confirmed_at;
          setUser({
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.name || user.email?.split("@")[0],
            emailConfirmed,
          });

          // Check if email confirmation is pending
          if (!emailConfirmed && user.email) {
            setEmailConfirmationPending(true);
            setPendingEmail(user.email);
          }
        }

        // We always want to ensure loading is false after the first auth event.
        setLoading(false);
      }
    );

    // Add aggressive timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading((currentLoading) => {
        if (currentLoading) {
          console.log(
            `🔧 AuthContext[${instanceId}] - TIMEOUT (5s) - forcing loading to false`
          );
          return false;
        }
        return currentLoading;
      });
    }, 5000); // 5 second fallback

    return () => {
      console.log(
        `🔧 AuthContext[${instanceId}] - CLEANUP - unsubscribing and clearing timeouts`
      );
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [instanceId, loadUser]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await authService.signIn(email, password);

      if (error) {
        throw error;
      }

      if (data?.user) {
        const emailConfirmed = !!data.user.email_confirmed_at;
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          name: data.user.user_metadata?.name || data.user.email?.split("@")[0],
          emailConfirmed,
        });

        // Check if email confirmation is pending
        if (!emailConfirmed && data.user.email) {
          setEmailConfirmationPending(true);
          setPendingEmail(data.user.email);
        }
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { data, error } = await authService.signUp(email, password);

      if (error) {
        throw error;
      }

      if (data?.user) {
        const emailConfirmed = !!data.user.email_confirmed_at;
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          name: name,
          emailConfirmed,
        });

        // Set email confirmation pending state
        if (!emailConfirmed && data.user.email) {
          setEmailConfirmationPending(true);
          setPendingEmail(data.user.email);
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    try {
      setLoading(true);
      const { user, error } = await appleAuthService.signIn();

      if (error) {
        throw error;
      }

      if (user) {
        const emailConfirmed = !!user.email_confirmed_at;
        setUser({
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.name || user.email?.split("@")[0],
          emailConfirmed,
        });

        // Check if email confirmation is pending
        if (!emailConfirmed && user.email) {
          setEmailConfirmationPending(true);
          setPendingEmail(user.email);
        }
      }
    } catch (error) {
      console.error("Sign in with Apple error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await authService.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
      setEmailConfirmationPending(false);
      setPendingEmail(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkEmailConfirmation = async (): Promise<boolean> => {
    try {
      const { user, error } = await authService.getCurrentUser();

      if (error || !user) {
        return false;
      }

      const emailConfirmed = !!user.email_confirmed_at;

      if (emailConfirmed) {
        // Update user state and clear pending state
        setUser((prev) => (prev ? { ...prev, emailConfirmed: true } : null));
        setEmailConfirmationPending(false);
        setPendingEmail(null);
      }

      return emailConfirmed;
    } catch (error) {
      console.error("Check email confirmation error:", error);
      return false;
    }
  };

  const handleSetEmailConfirmationPending = (
    pending: boolean,
    email?: string
  ) => {
    setEmailConfirmationPending(pending);
    if (email) {
      setPendingEmail(email);
    } else if (!pending) {
      setPendingEmail(null);
    }
  };

  const updateUser = async (updates: { name?: string }) => {
    try {
      setLoading(true);
      const { data, error } = await authService.updateUser(updates);

      if (error) {
        throw error;
      }

      if (data?.user) {
        const emailConfirmed = !!data.user.email_confirmed_at;
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          name: data.user.user_metadata?.name || data.user.email?.split("@")[0],
          emailConfirmed,
        });
      }
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    emailConfirmationPending,
    pendingEmail,
    signIn,
    signUp,
    signInWithApple,
    signOut,
    updateUser,
    checkEmailConfirmation,
    setEmailConfirmationPending: handleSetEmailConfirmationPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
