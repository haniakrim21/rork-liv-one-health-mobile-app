import { Tabs } from "expo-router";
import { Home, Grid3X3, User } from "lucide-react-native";
import React from "react";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";

export default function TabLayout() {
  const { theme } = useAppSettings();
  const currentColors = colors[theme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: currentColors.primary,
        tabBarInactiveTintColor: currentColors.textSecondary,
        tabBarStyle: {
          backgroundColor: currentColors.background,
          borderTopColor: currentColors.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: currentColors.background,
        },
        headerTintColor: currentColors.text,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "600" as const,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Services",
          tabBarIcon: ({ color }) => <Grid3X3 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}