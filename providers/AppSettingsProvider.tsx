import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";

type Theme = "light" | "dark";
type Language = "en" | "ar";

interface AppSettings {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  toggleLanguage: () => void;
}

export const [AppSettingsProvider, useAppSettings] = createContextHook<AppSettings>(() => {
  const [theme, setTheme] = useState<Theme>("dark");
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      const savedLanguage = await AsyncStorage.getItem("language");
      
      if (savedTheme) setTheme(savedTheme as Theme);
      else await AsyncStorage.setItem("theme", "dark");
      if (savedLanguage) setLanguage(savedLanguage as Language);
      else await AsyncStorage.setItem("language", "en");
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    await AsyncStorage.setItem("theme", newTheme);
  };

  const toggleLanguage = async () => {
    const newLanguage = language === "en" ? "ar" : "en";
    setLanguage(newLanguage);
    await AsyncStorage.setItem("language", newLanguage);
  };

  return {
    theme,
    language,
    toggleTheme,
    toggleLanguage,
  };
});