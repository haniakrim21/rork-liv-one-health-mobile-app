import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { Compass } from "lucide-react-native";
import GlassView from "@/components/GlassView";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";

export default function AINavigatorScreen() {
  const { theme } = useAppSettings();
  const palette = colors[theme];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]} testID="ai-navigator-screen">
      <Stack.Screen options={{ title: "AI Navigator" }} />
      <GlassView style={styles.card}>
        <View style={styles.headerRow}>
          <View style={[styles.iconWrap, { backgroundColor: `${palette.primary}15` }]}> 
            <Compass size={18} color={palette.primary} />
          </View>
          <Text style={[styles.title, { color: palette.text }]}>Ethical recommendations</Text>
        </View>
        <Text style={{ color: palette.textSecondary }}>Personalized, cross-domain suggestions will appear here.</Text>
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { borderRadius: 16, padding: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  iconWrap: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 10 },
  title: { fontSize: 16, fontWeight: "700" as const },
});