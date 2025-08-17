import React, { useMemo, useState, useCallback } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ClipboardList, Check } from "lucide-react-native";
import GlassView from "@/components/GlassView";
import Attachments, { Attachment } from "@/components/Attachments";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";
import { trpc } from "@/lib/trpc";

interface HistoryForm {
  smoking: string;
  alcohol: string;
  conditions: string;
  meds: string;
  allergies: string;
  attachments: Attachment[];
}

export default function HistoryScreen() {
  const { theme } = useAppSettings();
  const palette = colors[theme];
  const router = useRouter();

  const [form, setForm] = useState<HistoryForm>({ smoking: "", alcohol: "", conditions: "", meds: "", allergies: "", attachments: [] });
  const canSubmit = useMemo(() => {
    return (
      form.smoking.trim().length > 0 &&
      form.alcohol.trim().length > 0 &&
      form.conditions.trim().length > 0 &&
      form.meds.trim().length > 0 &&
      form.allergies.trim().length > 0
    );
  }, [form.alcohol, form.allergies, form.conditions, form.meds, form.smoking]);

  const saveMutation = trpc.services.history.save.useMutation();

  const setField = useCallback((k: keyof HistoryForm, v: string) => setForm((p) => ({ ...p, [k]: v })), []);

  const onSubmit = useCallback(() => {
    if (!canSubmit || saveMutation.isPending) return;
    try {
      console.log("[History] submit", form);
      const payload = {
        smoking: form.smoking.trim(),
        alcohol: form.alcohol.trim(),
        conditions: form.conditions.trim(),
        meds: form.meds.trim(),
        allergies: form.allergies.trim(),
      };
      saveMutation.mutate(payload, {
        onSuccess: () => {
          Alert.alert("Saved", "Your health history has been saved.");
          router.back();
        },
        onError: (e) => {
          console.log("[History] error", e);
          Alert.alert("Error", "Could not save. Please try again.");
        },
      });
    } catch (e) {
      console.log("[History] error", e);
      Alert.alert("Error", "Could not save. Please try again.");
    }
  }, [canSubmit, form, router, saveMutation]);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]} testID="history-screen">
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} testID="history-back">
          <View style={[styles.backBtn, { backgroundColor: `${palette.text}10`, borderColor: `${palette.text}20` }]}> 
            <ChevronLeft size={20} color={palette.text} />
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: palette.text }]}>Lifestyle & Health History</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false} testID="history-scroll">
        <GlassView style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: `${palette.primary}15` }]}> 
              <ClipboardList size={20} color={palette.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: palette.text }]}>Tell us about you</Text>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: palette.text }]}>Smoking</Text>
            <TextInput
              placeholder="e.g., never / former / current"
              placeholderTextColor={`${palette.text}70`}
              value={form.smoking}
              onChangeText={(t) => setField("smoking", t)}
              style={[styles.input, { color: palette.text, borderColor: `${palette.text}20` }]}
              testID="hist-smoking"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: palette.text }]}>Alcohol</Text>
            <TextInput
              placeholder="e.g., none / social / regular"
              placeholderTextColor={`${palette.text}70`}
              value={form.alcohol}
              onChangeText={(t) => setField("alcohol", t)}
              style={[styles.input, { color: palette.text, borderColor: `${palette.text}20` }]}
              testID="hist-alcohol"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: palette.text }]}>Conditions</Text>
            <TextInput
              placeholder="e.g., diabetes, hypertension"
              placeholderTextColor={`${palette.text}70`}
              value={form.conditions}
              onChangeText={(t) => setField("conditions", t)}
              style={[styles.input, { color: palette.text, borderColor: `${palette.text}20` }]}
              multiline
              testID="hist-conditions"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: palette.text }]}>Medications</Text>
            <TextInput
              placeholder="Current meds"
              placeholderTextColor={`${palette.text}70`}
              value={form.meds}
              onChangeText={(t) => setField("meds", t)}
              style={[styles.input, { color: palette.text, borderColor: `${palette.text}20` }]}
              multiline
              testID="hist-meds"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: palette.text }]}>Allergies</Text>
            <TextInput
              placeholder="e.g., penicillin"
              placeholderTextColor={`${palette.text}70`}
              value={form.allergies}
              onChangeText={(t) => setField("allergies", t)}
              style={[styles.input, { color: palette.text, borderColor: `${palette.text}20` }]}
              multiline
              testID="hist-allergies"
            />
          </View>

          <Attachments
  title="Attachments"
  initial={form.attachments}
  onChange={(list) => setForm((p) => ({ ...p, attachments: list }))}
  testID="history-attachments"
/>

<TouchableOpacity onPress={onSubmit} disabled={!canSubmit || saveMutation.isPending} style={[styles.primaryBtn, { backgroundColor: canSubmit && !saveMutation.isPending ? palette.primary : `${palette.text}20` }]} testID="history-submit">
            <Check size={16} color={palette.background} />
            <Text style={[styles.primaryBtnText, { color: palette.background }]}>{saveMutation.isPending ? "Saving..." : "Save"}</Text>
          </TouchableOpacity>
        </GlassView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "600" as const },
  card: { marginHorizontal: 16, borderRadius: 16, padding: 16 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: "700" as const },
  field: { marginBottom: 10 },
  label: { fontSize: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  primaryBtn: { marginTop: 8, paddingVertical: 12, borderRadius: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  primaryBtnText: { fontSize: 14, fontWeight: "700" as const },
});