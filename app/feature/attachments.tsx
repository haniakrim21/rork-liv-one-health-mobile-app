import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList, Image, Alert, Linking, Animated, Platform, ActivityIndicator, Modal, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import GlassView from "@/components/GlassView";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";
import { ChevronLeft, ImageIcon, Link as LinkIcon, Trash2, ExternalLink, Copy, ClipboardList as ClipboardIcon, X } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";

export type AttachmentType = "image" | "link";
export interface AttachmentItem {
  id: string;
  type: AttachmentType;
  uri: string;
  label?: string;
}

export default function AttachmentsScreen() {
  const { theme } = useAppSettings();
  const palette = colors[theme];
  const router = useRouter();

  const [type, setType] = useState<AttachmentType>("image");
  const [uri, setUri] = useState<string>("");
  const [label, setLabel] = useState<string>("");
  const [items, setItems] = useState<AttachmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [pasting, setPasting] = useState<boolean>(false);

  const mount = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(mount, { toValue: 1, duration: 400, useNativeDriver: false }).start();
  }, [mount]);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem("attachments");
        const parsed: AttachmentItem[] = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        } else {
          setItems([]);
        }
      } catch (e) {
        console.log("[Attachments] load error", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const save = async () => {
      try {
        await AsyncStorage.setItem("attachments", JSON.stringify(items));
      } catch (e) {
        console.log("[Attachments] save error", e);
      }
    };
    // avoid saving during initial load
    if (!loading) {
      save();
    }
  }, [items, loading]);

  const isValidUrl = useCallback((value: string) => {
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch (_e) {
      return false;
    }
  }, []);

  const isImageUrl = useCallback((value: string) => {
    const v = value.toLowerCase();
    return /(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.bmp|\/render|\?format=png|\?format=jpg)/.test(v);
  }, []);

  useEffect(() => {
    if (uri.trim().length === 0) return;
    if (isValidUrl(uri) && isImageUrl(uri) && type !== "image") {
      setType("image");
    }
  }, [isImageUrl, isValidUrl, type, uri]);

  const canAdd = useMemo(() => {
    const valid = isValidUrl(uri.trim());
    if (!valid) return false;
    if (type === "image") return isImageUrl(uri.trim());
    return true;
  }, [isImageUrl, isValidUrl, type, uri]);

  const resetForm = useCallback(() => {
    setUri("");
    setLabel("");
    setError(null);
  }, []);

  const onAdd = useCallback(() => {
    const clean = uri.trim();
    if (!isValidUrl(clean)) {
      setError("Enter a valid URL starting with http(s)://");
      return;
    }
    if (type === "image" && !isImageUrl(clean)) {
      setError("URL doesn't look like an image (png, jpg, webp, gif)");
      return;
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const next: AttachmentItem = { id, type, uri: clean, label: label.trim().length ? label.trim() : undefined };
    setItems((prev) => [next, ...prev]);
    resetForm();
  }, [isValidUrl, isImageUrl, label, resetForm, type, uri]);

  const onRemove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const onClearAll = useCallback(() => {
    Alert.alert("Clear all?", "This will remove all attachments.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => setItems([]) },
    ]);
  }, []);

  const openLink = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert("Can't open", "This URL is not supported on your device.");
    } catch (e) {
      console.log("[Attachments] open error", e);
      Alert.alert("Error", "Failed to open the link.");
    }
  }, []);

  const pasteFromClipboard = useCallback(async () => {
    try {
      setPasting(true);
      const text = await Clipboard.getStringAsync();
      if (text) {
        setUri(text);
        setError(null);
      } else {
        Alert.alert("Clipboard empty", "Copy a URL first and try again.");
      }
    } catch (e) {
      console.log("[Attachments] paste error", e);
      Alert.alert("Error", "Couldn't read from clipboard.");
    } finally {
      setPasting(false);
    }
  }, []);

  const copyToClipboard = useCallback(async (textToCopy: string) => {
    try {
      await Clipboard.setStringAsync(textToCopy);
      console.log("[Attachments] Copied to clipboard");
    } catch (e) {
      console.log("[Attachments] copy error", e);
    }
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: palette.background }]} testID="attachments-screen">
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} testID="attachments-back">
          <View style={[styles.backBtn, { backgroundColor: `${palette.text}10`, borderColor: `${palette.text}20` }]}>
            <ChevronLeft size={20} color={palette.text} />
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: palette.text }]}>Attachments</Text>
        <View style={{ width: 36 }} />
      </View>

      <Animated.View style={{ opacity: mount, transform: [{ translateY: mount.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
        <GlassView style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: palette.text }]}>Add attachment</Text>
            {items.length > 0 && (
              <TouchableOpacity onPress={onClearAll} testID="clear-all">
                <Text style={[styles.clearText, { color: palette.primary }]}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.typeRow}>
            <TouchableOpacity
              onPress={() => setType("image")}
              style={[styles.typePill, { borderColor: type === "image" ? palette.primary : `${palette.text}25`, backgroundColor: type === "image" ? `${palette.primary}20` : "transparent" }]}
              testID="type-image"
            >
              <ImageIcon size={16} color={type === "image" ? palette.primary : palette.text} />
              <Text style={[styles.typeText, { color: palette.text }]}>Image URL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setType("link")}
              style={[styles.typePill, { borderColor: type === "link" ? palette.primary : `${palette.text}25`, backgroundColor: type === "link" ? `${palette.primary}20` : "transparent" }]}
              testID="type-link"
            >
              <LinkIcon size={16} color={type === "link" ? palette.primary : palette.text} />
              <Text style={[styles.typeText, { color: palette.text }]}>Link</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}> 
            <Text style={[styles.label, { color: palette.text }]}>{type === "image" ? "Image URL" : "Link URL"}</Text>
            <View style={styles.inputRow}>
              <TextInput
                placeholder={type === "image" ? "https://example.com/photo.jpg" : "https://example.com/page"}
                placeholderTextColor={`${palette.text}70`}
                value={uri}
                onChangeText={(t) => { setUri(t); if (error) setError(null); }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={[styles.input, { color: palette.text, borderColor: error ? "#ff6b6b" : `${palette.text}20` }]}
                testID="attachment-url"
              />
              <TouchableOpacity onPress={pasteFromClipboard} style={[styles.pasteBtn, { borderColor: `${palette.text}20`, backgroundColor: `${palette.text}08` }]} testID="paste-url">
                {pasting ? (
                  <ActivityIndicator size="small" color={palette.primary} />
                ) : (
                  <>
                    <ClipboardIcon size={14} color={palette.text} />
                    <Text style={[styles.pasteText, { color: palette.text }]}>Paste</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            {!!error && <Text style={[styles.errorText, { color: "#ff6b6b" }]}>{error}</Text>}
          </View>

          <View style={styles.field}> 
            <Text style={[styles.label, { color: palette.text }]}>Label (optional)</Text>
            <TextInput
              placeholder="e.g., Lab result, X-ray, website"
              placeholderTextColor={`${palette.text}70`}
              value={label}
              onChangeText={setLabel}
              style={[styles.input, { color: palette.text, borderColor: `${palette.text}20` }]}
              testID="attachment-label"
            />
          </View>

          <TouchableOpacity
            onPress={onAdd}
            disabled={!canAdd}
            style={[styles.primaryBtn, { backgroundColor: canAdd ? palette.primary : `${palette.text}20` }]}
            testID="add-attachment"
          >
            <Text style={[styles.primaryBtnText, { color: palette.background }]}>Add</Text>
          </TouchableOpacity>
        </GlassView>
      </Animated.View>

      <GlassView style={styles.card}>
        <Text style={[styles.cardTitle, { color: palette.text }]}>Your attachments</Text>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={palette.primary} />
            <Text style={{ marginLeft: 8, color: palette.textSecondary }}>Loading…</Text>
          </View>
        ) : items.length === 0 ? (
          <Text style={{ color: palette.textSecondary }}>No attachments yet. Add image or link URLs above.</Text>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ paddingVertical: 4 }}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <TouchableOpacity
                  onPress={() => item.type === "image" ? setPreviewUri(item.uri) : openLink(item.uri)}
                  onLongPress={() => copyToClipboard(item.uri)}
                  testID={`preview-${item.id}`}
                >
                  <View style={[styles.preview, { backgroundColor: `${palette.text}08`, borderColor: `${palette.text}12` }]}> 
                    {item.type === "image" ? (
                      <Image source={{ uri: item.uri }} style={styles.thumb} resizeMode="cover" />
                    ) : (
                      <LinkIcon size={18} color={palette.text} />
                    )}
                  </View>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemTitle, { color: palette.text }]} numberOfLines={1}>{item.label ?? (item.type === "image" ? "Image" : "Link")}</Text>
                  <TouchableOpacity onPress={() => openLink(item.uri)} style={styles.linkRow} testID={`open-${item.id}`}>
                    <ExternalLink size={14} color={palette.primary} />
                    <Text style={[styles.itemSub, { color: palette.primary }]} numberOfLines={1}>{item.uri}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => onRemove(item.id)} style={[styles.iconBtn, { borderColor: `${palette.text}20` }]} testID={`remove-${item.id}`}>
                  <Trash2 size={16} color={palette.text} />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </GlassView>

      <View style={{ height: 20 }} />

      <Modal visible={!!previewUri} transparent animationType={Platform.OS === "web" ? "none" : "fade"} onRequestClose={() => setPreviewUri(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: palette.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.text }]}>Preview</Text>
              <Pressable onPress={() => setPreviewUri(null)} style={[styles.iconBtn, { borderColor: `${palette.text}20` }]} testID="close-preview">
                <X size={16} color={palette.text} />
              </Pressable>
            </View>
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={styles.modalImage} resizeMode="contain" />
            ) : null}
            {previewUri ? (
              <TouchableOpacity onPress={() => openLink(previewUri)} style={[styles.primaryBtn, { backgroundColor: palette.primary }]} testID="open-preview-link">
                <Text style={[styles.primaryBtnText, { color: palette.background }]}>Open in Browser</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "600" as const },
  card: { marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700" as const, marginBottom: 8 },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  clearText: { fontSize: 12, fontWeight: "600" as const },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  typePill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderRadius: 999 },
  typeText: { fontSize: 12, fontWeight: "600" as const },
  field: { marginBottom: 10 },
  label: { fontSize: 12, marginBottom: 6 },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  errorText: { fontSize: 11, marginTop: 4 },
  primaryBtn: { marginTop: 4, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { fontSize: 14, fontWeight: "700" as const },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 10 },
  preview: { width: 44, height: 44, borderRadius: 10, justifyContent: "center", alignItems: "center", borderWidth: 1, overflow: "hidden" },
  thumb: { width: 44, height: 44 },
  itemTitle: { fontSize: 14, fontWeight: "600" as const },
  itemSub: { fontSize: 12 },
  iconBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center", borderWidth: 1, marginLeft: 6 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pasteBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, height: 40, borderRadius: 10, borderWidth: 1 },
  pasteText: { fontSize: 12, fontWeight: "600" as const },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 16 },
  modalContent: { width: "100%", maxWidth: 520, borderRadius: 16, padding: 16 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  modalTitle: { fontSize: 16, fontWeight: "700" as const },
  modalImage: { width: "100%", height: 320, borderRadius: 12, backgroundColor: "#00000022" },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  loadingRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
});