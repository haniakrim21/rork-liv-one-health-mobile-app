import React, { useMemo } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { FileText, ShieldCheck, ClipboardList, Hospital } from "lucide-react-native";
import GlassView from "@/components/GlassView";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";

export default function HealthPassportScreen() {
  const { theme } = useAppSettings();
  const palette = colors[theme];

  const sections = useMemo(
    () => [
      { title: "Personal Info", icon: ShieldCheck, items: ["Name", "DOB", "Blood type", "Emergency contact"] },
      { title: "Conditions", icon: ClipboardList, items: ["Diabetes", "Hypertension"] },
      { title: "Medications", icon: FileText, items: ["Metformin 500mg", "Atorvastatin 20mg"] },
      { title: "Allergies", icon: FileText, items: ["Penicillin"] },
      { title: "Visits & Labs", icon: Hospital, items: ["Labs synced", "3 clinic visits"] },
    ],
    []
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]} testID="health-passport-screen">
      <Stack.Screen options={{ title: "Health Passport" }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {sections.map((s, idx) => (
          <GlassView key={idx} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: `${palette.primary}15` }]}> 
                <s.icon size={18} color={palette.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: palette.text }]}>{s.title}</Text>
            </View>
            {s.items.map((it, i) => (
              <View key={i} style={styles.row}>
                <View style={[styles.bullet, { backgroundColor: `${palette.text}20` }]} />
                <Text style={[styles.rowText, { color: palette.textSecondary }]}>{it}</Text>
              </View>
            ))}
          </GlassView>
        ))}
        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  iconWrap: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: "700" as const },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  rowText: { fontSize: 14 },
});