import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { Share2, UserPlus, Bot, ArrowRight } from "lucide-react-native";
import GlassView from "@/components/GlassView";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";

export default function ReferralsScreen() {
  const { theme } = useAppSettings();
  const palette = colors[theme];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]} testID="referrals-screen">
      <Stack.Screen options={{ title: "Referrals" }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassView style={styles.card}>
          <View style={styles.rowHeader}>
            <View style={[styles.iconWrap, { backgroundColor: `${palette.primary}15` }]}> 
              <Share2 size={18} color={palette.primary} />
            </View>
            <Text style={[styles.title, { color: palette.text }]}>Create Referral</Text>
          </View>
          <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Manual referral or AI-suggested options</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, { borderColor: `${palette.text}20` }]} testID="ref-manual">
              <UserPlus size={16} color={palette.text} />
              <Text style={[styles.actionText, { color: palette.text }]}>Manual referral</Text>
              <ArrowRight size={16} color={palette.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { borderColor: `${palette.text}20` }]} testID="ref-ai">
              <Bot size={16} color={palette.text} />
              <Text style={[styles.actionText, { color: palette.text }]}>AI suggested</Text>
              <ArrowRight size={16} color={palette.text} />
            </TouchableOpacity>
          </View>
        </GlassView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
  card: { borderRadius: 16, padding: 16 },
  rowHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  iconWrap: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 10 },
  title: { fontSize: 16, fontWeight: "700" as const },
  subtitle: { fontSize: 12, marginBottom: 8 },
  actions: { gap: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12 },
  actionText: { fontSize: 14, fontWeight: "600" as const },
});