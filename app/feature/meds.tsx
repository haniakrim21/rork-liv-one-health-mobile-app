import React, { useMemo, useState, useCallback } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import GlassView from "@/components/GlassView";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";
import { Pill, Plus, ChevronLeft } from "lucide-react-native";
import { trpc } from "@/lib/trpc";

export default function MedsScreen() {
  const { add } = useLocalSearchParams<{ add?: string }>();
  const { theme } = useAppSettings();
  const palette = colors[theme];
  const router = useRouter();

  const listQuery = trpc.services.meds.list.useQuery();
  const addMutation = trpc.services.meds.add.useMutation({ onSuccess: () => listQuery.refetch() });

  const [name, setName] = useState<string>("");
  const [dose, setDose] = useState<string>("");
  const [schedule, setSchedule] = useState<string>("");

  const canAdd = useMemo(() => name.trim().length > 0 && dose.trim().length > 0 && schedule.trim().length > 0, [dose, name, schedule]);

  const onAdd = useCallback(() => {
    if (!canAdd) return;
    addMutation.mutate({ name: name.trim(), dose: dose.trim(), schedule: schedule.trim() });
    setName("");
    setDose("");
    setSchedule("");
  }, [addMutation, canAdd, dose, name, schedule]);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <View style={[styles.backBtn, { backgroundColor: `${palette.text}10`, borderColor: `${palette.text}20` }]}> 
            <ChevronLeft size={20} color={palette.text} />
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: palette.text }]}>Medications</Text>
        <View style={{ width: 36 }} />
      </View>

      <GlassView style={styles.card}>
        <Text style={[styles.cardTitle, { color: palette.text }]}>Add medication</Text>
        <View style={styles.row}> 
          <TextInput
            placeholder="Name"
            placeholderTextColor={`${palette.text}70`}
            value={name}
            onChangeText={setName}
            style={[styles.input, { color: palette.text, borderColor: `${palette.text}20` }]}
            testID="med-name"
          />
        </View>
        <View style={styles.row}> 
          <TextInput
            placeholder="Dose (e.g., 10mg)"
            placeholderTextColor={`${palette.text}70`}
            value={dose}
            onChangeText={setDose}
            style={[styles.input, { color: palette.text, borderColor: `${palette.text}20` }]}
            testID="med-dose"
          />
        </View>
        <View style={styles.row}> 
          <TextInput
            placeholder="Schedule (e.g., 2x daily)"
            placeholderTextColor={`${palette.text}70`}
            value={schedule}
            onChangeText={setSchedule}
            style={[styles.input, { color: palette.text, borderColor: `${palette.text}20` }]}
            testID="med-schedule"
          />
        </View>
        <TouchableOpacity
          onPress={onAdd}
          disabled={!canAdd || addMutation.isPending}
          style={[styles.primaryBtn, { backgroundColor: !canAdd || addMutation.isPending ? `${palette.text}20` : palette.primary }]}
          testID="add-med"
        >
          <Text style={[styles.primaryBtnText, { color: palette.background }]}>{addMutation.isPending ? "Adding..." : "Add"}</Text>
        </TouchableOpacity>
      </GlassView>

      <GlassView style={styles.card}>
        <Text style={[styles.cardTitle, { color: palette.text }]}>Your meds</Text>
        {listQuery.isLoading ? (
          <Text style={{ color: palette.textSecondary }}>Loading...</Text>
        ) : listQuery.error ? (
          <Text style={{ color: palette.textSecondary }}>Failed to load</Text>
        ) : (
          <FlatList
            data={listQuery.data?.meds ?? []}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <View style={styles.medRow}>
                <View style={[styles.medIcon, { backgroundColor: `${palette.primary}12` }]}>
                  <Pill size={18} color={palette.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.medTitle, { color: palette.text }]}>{item.name}</Text>
                  <Text style={[styles.medSub, { color: palette.textSecondary }]}>{item.dose} • {item.schedule}</Text>
                </View>
              </View>
            )}
          />
        )}
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "600" as const },
  card: { marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700" as const, marginBottom: 8 },
  row: { marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  primaryBtn: { marginTop: 8, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { fontSize: 14, fontWeight: "700" as const },
  medRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  medIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  medTitle: { fontSize: 14, fontWeight: "600" as const },
  medSub: { fontSize: 12 },
});