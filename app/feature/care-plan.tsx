import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { Target, CheckCircle2 } from "lucide-react-native";
import GlassView from "@/components/GlassView";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";

export default function CarePlanScreen() {
  const { theme } = useAppSettings();
  const palette = colors[theme];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]} testID="care-plan-screen">
      <Stack.Screen options={{ title: "Care Plan" }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <GlassView style={styles.card}>
          <View style={styles.headerRow}>
            <View style={[styles.iconWrap, { backgroundColor: `${palette.primary}15` }]}> 
              <Target size={18} color={palette.primary} />
            </View>
            <Text style={[styles.title, { color: palette.text }]}>Your plan</Text>
          </View>
          {[
            "Track BP daily",
            "10k steps 5x/week",
            "Meditate 10 min/day",
            "Take meds on time",
          ].map((t, i) => (
            <View key={i} style={styles.row}>
              <CheckCircle2 size={16} color={palette.primary} />
              <Text style={[styles.rowText, { color: palette.textSecondary }]}>{t}</Text>
            </View>
          ))}
        </GlassView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
  card: { borderRadius: 16, padding: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  iconWrap: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 10 },
  title: { fontSize: 16, fontWeight: "700" as const },
  row: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 },
  rowText: { fontSize: 14 },
});