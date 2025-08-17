import React, { useMemo } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Animated } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Sparkles } from "lucide-react-native";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";
import GlassView from "@/components/GlassView";

function toTitle(slug: string): string {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export default function FeatureDetailsScreen() {
  const { slug: raw } = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "feature";
  const title = useMemo(() => toTitle(slug), [slug]);

  const { theme } = useAppSettings();
  const palette = colors[theme];
  const router = useRouter();

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
            <Text style={[styles.heroSubtitle, { color: palette.textSecondary }]}>Coming to life. Tap actions below.</Text>
          </View>
        </View>
      </GlassView>

      <View style={styles.cards}>
        {["Overview", "Actions", "Next Steps"].map((section, i) => (
          <GlassView key={section} style={styles.card} testID={`feature-card-${i}`}>
            <Text style={[styles.cardTitle, { color: palette.text }]}>{section}</Text>
            <Text style={[styles.cardBody, { color: palette.textSecondary }]}>
              {section === "Overview"
                ? `This is a placeholder screen for ${title}.`
                : section === "Actions"
                ? "We will wire contextual actions here based on the feature."
                : "Design spec and API wiring will be added in upcoming iterations."}
            </Text>
          </GlassView>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600" as const,
  },
  headerRightSpace: { width: 36 },
  hero: { marginHorizontal: 16, borderRadius: 16, padding: 16 },
  heroRow: { flexDirection: "row", alignItems: "center" },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  heroTextWrap: { flex: 1 },
  heroTitle: { fontSize: 20, fontWeight: "700" as const, marginBottom: 4 },
  heroSubtitle: { fontSize: 13, lineHeight: 18 },
  cards: { paddingHorizontal: 16, marginTop: 16 },
  card: { padding: 16, borderRadius: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700" as const, marginBottom: 6 },
  cardBody: { fontSize: 13, lineHeight: 20 },
});
