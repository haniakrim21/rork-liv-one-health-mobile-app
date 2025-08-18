import React, { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Brain, SendHorizonal, Stethoscope, Calendar, Paperclip } from "lucide-react-native";
import GlassView from "@/components/GlassView";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";

type ContentPart = { type: "text"; text: string } | { type: "image"; image: string };
type CoreMessage = { role: "system" | "user" | "assistant"; content: string | ContentPart[] };

type ChatItem = { id: string; role: "user" | "assistant"; text: string };

export default function TriageScreen() {
  const { theme } = useAppSettings();
  const palette = colors[theme];
  const router = useRouter();

  const [input, setInput] = useState<string>("");
  const [items, setItems] = useState<ChatItem[]>([{
    id: "welcome",
    role: "assistant",
    text: "I can help assess symptoms and suggest next steps. Describe what's bothering you, including duration and severity.",
  }]);
  const [loading, setLoading] = useState<boolean>(false);
  const listRef = useRef<FlatList<ChatItem>>(null);

  const quickPrompts = useMemo(
    () => [
      "Headache and fatigue for 3 days",
      "Chest tightness when climbing stairs",
      "Fever and sore throat since yesterday",
      "Lower back pain after lifting",
    ],
    [],
  );

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const sendToAI = useCallback(async (text: string) => {
    const next: ChatItem = { id: String(Date.now()), role: "user", text };
    const history: CoreMessage[] = [
      { role: "system", content: "You are a cautious healthcare triage assistant. Provide concise, friendly guidance, red-flag warnings, and recommend care level. Never diagnose. Use bullet points. Avoid emojis." },
      ...items.map<CoreMessage>((m) => ({ role: m.role, content: m.text })),
      { role: "user", content: text },
    ];

    setItems((prev) => [...prev, next]);
    setInput("");
    setLoading(true);
    scrollToEnd();

    try {
      const res = await fetch("https://toolkit.rork.com/text/llm/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { completion?: string };
      const reply = json?.completion ?? "I couldn't process that. Please try again.";
      setItems((prev) => [...prev, { id: String(Date.now() + 1), role: "assistant", text: reply }]);
      scrollToEnd();
    } catch (e) {
      console.log("[Triage] AI error", e);
      setItems((prev) => [...prev, { id: String(Date.now() + 2), role: "assistant", text: "There was a problem reaching the assistant. Check your connection and try again." }]);
    } finally {
      setLoading(false);
    }
  }, [items, scrollToEnd]);

  const onSend = useCallback(() => {
    const text = input.trim();
    if (!text || loading) return;
    void sendToAI(text);
  }, [input, loading, sendToAI]);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]} testID="triage-screen">
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} testID="triage-back">
          <View style={[styles.backBtn, { backgroundColor: `${palette.text}10`, borderColor: `${palette.text}20` }]}> 
            <ChevronLeft size={20} color={palette.text} />
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: palette.text }]}>AI Symptom Triage</Text>
        <View style={{ width: 36 }} />
      </View>

      <GlassView style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={[styles.heroIconWrap, { backgroundColor: `${palette.primary}15` }]}> 
            <Brain size={22} color={palette.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroTitle, { color: palette.text }]}>Describe your symptoms</Text>
            <Text style={[styles.heroSub, { color: palette.textSecondary }]}>Include onset, severity, and any key conditions</Text>
          </View>
        </View>
      </GlassView>

      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={[styles.msgWrap, item.role === "user" ? styles.right : styles.left]}>
            <GlassView style={[styles.msg, item.role === "user" ? { backgroundColor: `${palette.primary}20` } : null as unknown as undefined]}>
              <Text style={{ color: palette.text }}>{item.text}</Text>
            </GlassView>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        testID="triage-list"
      />

      <View style={styles.quickRow}>
        {quickPrompts.map((q) => (
          <TouchableOpacity key={q} onPress={() => !loading && sendToAI(q)} style={[styles.quickPill, { borderColor: `${palette.text}25` }]} testID={`quick-${q.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
            <Text style={{ color: palette.text }}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <GlassView style={styles.attachCard} testID="triage-attachments-placeholder">
        <View style={styles.attachRow}>
          <View style={styles.attachIconWrap}>
            <Paperclip size={18} color={palette.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.attachTitle, { color: palette.text }]}>Attachments</Text>
            <Text style={[styles.attachSub, { color: palette.textSecondary }]}>Add photos and files coming soon</Text>
          </View>
        </View>
      </GlassView>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={80}>
        <View style={[styles.inputRow, { borderColor: `${palette.text}20`, backgroundColor: `${palette.text}06` }]}> 
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your symptoms..."
            placeholderTextColor={`${palette.text}70`}
            style={[styles.input, { color: palette.text }]}
            multiline
            testID="triage-input"
          />
          <TouchableOpacity onPress={onSend} disabled={loading || input.trim().length === 0} testID="triage-send">
            {loading ? (
              <ActivityIndicator color={palette.primary} />
            ) : (
              <SendHorizonal size={22} color={input.trim().length ? palette.primary : `${palette.text}50`} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <View style={styles.ctaRow}>
        <TouchableOpacity onPress={() => router.push({ pathname: "/feature/booking", params: { type: "virtual" } })} style={[styles.ctaBtn, { backgroundColor: palette.primary }]} testID="triage-book-virtual">
          <Stethoscope size={16} color={palette.background} />
          <Text style={[styles.ctaText, { color: palette.background }]}>Book Virtual Consult</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push({ pathname: "/feature/booking", params: { type: "inclinic" } })} style={[styles.ctaBtn, { backgroundColor: `${palette.text}15` }]} testID="triage-book-inclinic">
          <Calendar size={16} color={palette.text} />
          <Text style={[styles.ctaText, { color: palette.text }]}>In-Clinic</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "600" as const },
  hero: { marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 8 },
  heroRow: { flexDirection: "row", alignItems: "center" },
  heroIconWrap: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 10 },
  heroTitle: { fontSize: 16, fontWeight: "700" as const, marginBottom: 2 },
  heroSub: { fontSize: 12 },
  listContent: { paddingHorizontal: 16, paddingBottom: 12 },
  msgWrap: { flexDirection: "row", marginTop: 8 },
  left: { justifyContent: "flex-start" },
  right: { justifyContent: "flex-end" },
  msg: { maxWidth: "82%", padding: 12, borderRadius: 12 },
  quickRow: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  quickPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  attachCard: { marginHorizontal: 16, borderRadius: 16, padding: 12, marginBottom: 8 },
  attachRow: { flexDirection: "row", alignItems: "center" },
  attachIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 10 },
  attachTitle: { fontSize: 14, fontWeight: "700" as const },
  attachSub: { fontSize: 12 },
  inputRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, gap: 10 },
  input: { flex: 1, minHeight: 40, maxHeight: 120 },
  ctaRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  ctaBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 12, gap: 8 },
  ctaText: { fontSize: 13, fontWeight: "700" as const },
});