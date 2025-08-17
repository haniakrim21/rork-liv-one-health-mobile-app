import React, { useMemo, useState, useCallback } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Animated, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Sparkles, Calendar, Video, ClipboardList, Stethoscope, Brain, ShieldCheck, Link, Pill, Plus } from "lucide-react-native";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";
import GlassView from "@/components/GlassView";

function toTitle(slug: string): string {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

type ActionItem = { key: string; title: string; subtitle: string; icon: React.ReactNode };

export default function FeatureDetailsScreen() {
  const { slug: raw } = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "feature";
  const title = useMemo(() => toTitle(slug), [slug]);

  const { theme } = useAppSettings();
  const palette = colors[theme];
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const actions: ActionItem[] = useMemo(() => {
    if (slug === "appointment-booking") {
      return [
        { key: "book-virtual", title: "Book Virtual Visit", subtitle: "Video in 15 min", icon: <Video size={18} color={palette.primary} /> },
        { key: "book-inclinic", title: "Book In-Clinic", subtitle: "Nearest location", icon: <Calendar size={18} color={palette.primary} /> },
        { key: "bring-records", title: "Attach Health History", subtitle: "Speed up your visit", icon: <ClipboardList size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "virtual-consultations") {
      return [
        { key: "new-video", title: "Start New Video Call", subtitle: "Connect securely", icon: <Video size={18} color={palette.primary} /> },
        { key: "choose-specialty", title: "Choose Specialty", subtitle: "Find the right expert", icon: <Stethoscope size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "ai-digital-triage") {
      return [
        { key: "start-triage", title: "Start Symptom Check", subtitle: "Takes ~3 minutes", icon: <Brain size={18} color={palette.primary} /> },
        { key: "privacy", title: "Privacy & Safety", subtitle: "Your data is protected", icon: <ShieldCheck size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "medication-tracking") {
      return [
        { key: "add-med", title: "Add Medication", subtitle: "Name, dose, schedule", icon: <Plus size={18} color={palette.primary} /> },
        { key: "view-meds", title: "View Medications", subtitle: "Your current list", icon: <Pill size={18} color={palette.primary} /> },
      ];
    }
    return [
      { key: "learn", title: "Learn About This Feature", subtitle: "Overview and benefits", icon: <Sparkles size={18} color={palette.primary} /> },
      { key: "connect", title: "Connect Services", subtitle: "Link devices or data", icon: <Link size={18} color={palette.primary} /> },
    ];
  }, [palette.primary, slug]);

  const onActionPress = useCallback((key: string) => {
    console.log("[Feature] action press", slug, key);
    if (slug === "appointment-booking" && (key === "book-virtual" || key === "book-inclinic")) {
      const type = key === "book-virtual" ? "virtual" : "inclinic";
      router.push({ pathname: "/feature/booking", params: { type } });
      return;
    }
    if (slug === "medication-tracking") {
      if (key === "view-meds") {
        router.push({ pathname: "/feature/meds" });
        return;
      }
      if (key === "add-med") {
        router.push({ pathname: "/feature/meds", params: { add: "1" } });
        return;
      }
    }
    if (slug === "ai-digital-triage" && key === "start-triage") {
      router.push({ pathname: "/feature/triage" });
      return;
    }
  }, [router, slug]);

  const next7Days = useMemo(() => {
    const out: string[] = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      out.push(iso);
    }
    return out;
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]} testID="feature-screen">
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" testID="feature-back">
          <View style={[styles.backBtn, { backgroundColor: `${palette.text}10`, borderColor: `${palette.text}20` }]}> 
            <ChevronLeft size={20} color={palette.text} />
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: palette.text }]} numberOfLines={1} testID="feature-title">
          {title}
        </Text>
        <View style={styles.headerRightSpace} />
      </View>

      <GlassView style={styles.hero} testID="feature-hero">
        <View style={styles.heroRow}>
          <View style={[styles.heroIconWrap, { backgroundColor: `${palette.primary}15` }]}> 
            <Sparkles size={24} color={palette.primary} />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={[styles.heroTitle, { color: palette.text }]}>{title}</Text>
            <Text style={[styles.heroSubtitle, { color: palette.textSecondary }]}>Tap an action to continue</Text>
          </View>
        </View>
      </GlassView>

      {slug === "appointment-booking" && (
        <GlassView style={styles.card} testID="booking-card">
          <Text style={[styles.cardTitle, { color: palette.text }]}>Choose a date</Text>
          <FlatList
            horizontal
            data={next7Days}
            keyExtractor={(d) => d}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
            renderItem={({ item }) => {
              const isSel = selectedDate === item;
              return (
                <TouchableOpacity
                  style={[styles.datePill, { borderColor: isSel ? palette.primary : `${palette.text}25`, backgroundColor: isSel ? `${palette.primary}20` : "transparent" }]}
                  onPress={() => setSelectedDate(item)}
                  testID={`date-${item}`}
                >
                  <Text style={{ color: palette.text, fontWeight: "600" as const }}>{item.slice(5)}</Text>
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            disabled={!selectedDate}
            style={[styles.primaryBtn, { backgroundColor: selectedDate ? palette.primary : `${palette.text}20` }]}
            onPress={() => {
              console.log("[Booking] continue", selectedDate);
              if (selectedDate) {
                router.push({ pathname: "/feature/booking", params: { date: selectedDate, type: "virtual" } });
              }
            }}
            testID="booking-continue"
          >
            <Text style={[styles.primaryBtnText, { color: palette.background }]}>{selectedDate ? `Continue – ${selectedDate}` : "Select a date"}</Text>
          </TouchableOpacity>
        </GlassView>
      )}

      <View style={styles.cards}>
        <GlassView style={styles.card} testID="feature-actions">
          <Text style={[styles.cardTitle, { color: palette.text }]}>Quick actions</Text>
          {actions.map((a) => (
            <TouchableOpacity key={a.key} style={styles.actionRow} onPress={() => onActionPress(a.key)} testID={`action-${a.key}`}>
              <View style={[styles.actionIcon, { backgroundColor: `${palette.primary}12` }]}>{a.icon}</View>
              <View style={styles.actionTextWrap}>
                <Text style={[styles.actionTitle, { color: palette.text }]}>{a.title}</Text>
                <Text style={[styles.actionSubtitle, { color: palette.textSecondary }]}>{a.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </GlassView>

        <GlassView style={styles.card} testID="feature-next">
          <Text style={[styles.cardTitle, { color: palette.text }]}>Next steps</Text>
          <Text style={[styles.cardBody, { color: palette.textSecondary }]}>This screen will evolve with deeper flows, server APIs, and validation. For now, explore the actions above.
          </Text>
        </GlassView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "600" as const },
  headerRightSpace: { width: 36 },
  hero: { marginHorizontal: 16, borderRadius: 16, padding: 16 },
  heroRow: { flexDirection: "row", alignItems: "center" },
  heroIconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12 },
  heroTextWrap: { flex: 1 },
  heroTitle: { fontSize: 20, fontWeight: "700" as const, marginBottom: 4 },
  heroSubtitle: { fontSize: 13, lineHeight: 18 },
  cards: { paddingHorizontal: 16, marginTop: 16 },
  card: { padding: 16, borderRadius: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700" as const, marginBottom: 6 },
  cardBody: { fontSize: 13, lineHeight: 20 },
  actionRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  actionIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  actionTextWrap: { flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: "600" as const },
  actionSubtitle: { fontSize: 12 },
  dateList: { paddingVertical: 8 },
  datePill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, marginRight: 8 },
  primaryBtn: { marginTop: 12, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { fontSize: 14, fontWeight: "700" as const },
});