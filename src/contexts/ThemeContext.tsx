import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, darkTheme } from "../constants/theme";

export type ThemeType = "light" | "dark";

interface ThemeContextType {
  theme: typeof lightTheme;
  mode: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeType>("light");
  const [currentTheme, setCurrentTheme] = useState(lightTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem("themeMode");
        if (stored === "dark") {
          setMode("dark");
          setCurrentTheme(darkTheme);
        }
      } catch (e) {
        // handle error
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    setCurrentTheme(newMode === "light" ? lightTheme : darkTheme);
    await AsyncStorage.setItem("themeMode", newMode);
  };

  if (isLoading) {
    return null; // Or a custom loading component
  }

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
