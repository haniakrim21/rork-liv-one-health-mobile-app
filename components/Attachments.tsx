import React, { useCallback, useMemo, useState } from "react";
import { Alert, Linking, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, Image as RNImage, Modal, Pressable } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import GlassView from "@/components/GlassView";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";
import { Image as ImageIcon, Link as LinkIcon, Trash2, Plus, X } from "lucide-react-native";

export type Attachment =
  | { id: string; type: "image"; uri: string; name?: string }
  | { id: string; type: "link"; url: string; title?: string };

interface AttachmentsProps {
  title?: string;
  testID?: string;
  initial?: Attachment[];
  onChange?: (list: Attachment[]) => void;
}

export default function Attachments({ title = "Attachments", testID = "attachments", initial = [], onChange }: AttachmentsProps) {
  const { theme } = useAppSettings();
  const palette = colors[theme];

  const [items, setItems] = useState<Attachment[]>(initial);
  const [link, setLink] = useState<string>("");
  const [adding, setAdding] = useState<boolean>(false);
  const [isPicking, setIsPicking] = useState<boolean>(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const border = useMemo(() => ({ borderColor: `${palette.text}15` }), [palette.text]);

  const update = useCallback((next: Attachment[]) => {
    setItems(next);
    if (onChange) onChange(next);
  }, [onChange]);

  const addImage = useCallback(async () => {
    if (isPicking) return;
    setIsPicking(true);
    try {
      console.log("[Attachments] addImage start");

      if (Platform.OS === 'ios') {
        const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
        let granted = existing.granted;
        console.log("[Attachments] existing perm (iOS)", existing);
        if (!granted) {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          console.log("[Attachments] request perm (iOS)", perm);
          granted = perm.granted;
        }
        if (!granted) {
          Alert.alert("Permission needed", "We need access to your photos to attach images.");
          return;
        }
      }

      const pickerOptions: ImagePicker.ImagePickerOptions = Platform.select({
        ios: {
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
          selectionLimit: 1,
        },
        android: {
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        },
        web: {
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: false,
          quality: 0.8,
        },
        default: {
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        },
      }) as ImagePicker.ImagePickerOptions;

      let res: ImagePicker.ImagePickerResult;
      try {
        res = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      } catch (err) {
        console.warn("[Attachments] launchImageLibraryAsync error, retrying without options", err);
        res = await ImagePicker.launchImageLibraryAsync();
      }
      console.log("[Attachments] picker result", res);
      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) {
        Alert.alert("Error", "No image selected.");
        return;
      }
      const fileName: string | undefined = (asset as any)?.fileName ?? undefined;
      const next: Attachment = { id: `${Date.now()}`, type: "image", uri: asset.uri, name: fileName };
      update([next, ...items]);
    } catch (e) {
      console.error("[Attachments] addImage error", e);
      Alert.alert("Error", "Could not add image. Please try again.");
    } finally {
      setIsPicking(false);
    }
  }, [isPicking, items, update]);

  const addLink = useCallback(() => {
    try {
      const trimmed = link.trim();
      if (!trimmed) return;
      const isValid = /^https?:\/\//i.test(trimmed);
      if (!isValid) {
        Alert.alert("Invalid URL", "Please enter a full URL starting with http or https.");
        return;
      }
      const next: Attachment = { id: `${Date.now()}`, type: "link", url: trimmed };
      update([next, ...items]);
      setLink("");
      setAdding(false);
    } catch (e) {
      console.error("[Attachments] addLink error", e);
      Alert.alert("Error", "Could not add link. Please try again.");
    }
  }, [items, link, update]);

  const remove = useCallback((id: string) => {
    const next = items.filter(i => i.id !== id);
    update(next);
  }, [items, update]);

  const open = useCallback(async (att: Attachment) => {
    if (att.type === "link") {
      try {
        const supported = await Linking.canOpenURL(att.url);
        if (!supported) {
          Alert.alert("Invalid URL", "This link cannot be opened on your device.");
          return;
        }
        await Linking.openURL(att.url);
      } catch (e) {
        Alert.alert("Error", "Unable to open the link.");
      }
    }
  }, []);

  return (
    <GlassView style={styles.card} testID={testID}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setAdding(v => !v)} style={[styles.iconBtn, border]} testID={`${testID}-add-link`}>
            <LinkIcon size={18} color={palette.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={addImage} style={[styles.iconBtn, border]} testID={`${testID}-add-image`}>
            <ImageIcon size={18} color={palette.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {adding && (
        <View style={[styles.addLinkRow, { borderColor: `${palette.text}15` }]}>
          <TextInput
            style={[styles.input, { color: palette.text }]}
            placeholder="Paste a URL (https://...)"
            placeholderTextColor={palette.textSecondary}
            value={link}
            onChangeText={setLink}
            autoCapitalize="none"
            keyboardType={Platform.OS === 'web' ? 'default' : 'url'}
            testID={`${testID}-url-input`}
          />
          <TouchableOpacity onPress={addLink} style={[styles.addBtn, { backgroundColor: palette.primary }]} testID={`${testID}-save-url`}>
            <Plus size={16} color={palette.background} />
          </TouchableOpacity>
        </View>
      )}

      {items.length === 0 ? (
        <Text style={[styles.empty, { color: palette.textSecondary }]}>No attachments yet. Add images or paste links.</Text>
      ) : (
        <View style={styles.grid}>
          {items.map((att) => (
            <View key={att.id} style={[styles.item, border]} testID={`${testID}-item-${att.id}`}>
              {att.type === "image" ? (
                <Pressable onPress={() => setPreviewUri(att.uri)} testID={`${testID}-preview-${att.id}`}>
                  {Platform.OS === 'android' ? (
                    <RNImage source={{ uri: att.uri }} style={styles.thumb} resizeMode="cover" />
                  ) : (
                    <Image source={{ uri: att.uri }} style={styles.thumb} contentFit="cover" />
                  )}
                </Pressable>
              ) : (
                <View style={styles.linkCell}>
                  <LinkIcon size={16} color={palette.primary} />
                  <Text numberOfLines={2} style={[styles.linkText, { color: palette.text }]}>{att.url}</Text>
                </View>
              )}
              <View style={styles.itemFooter}>
                <Text style={[styles.itemLabel, { color: palette.textSecondary }]} numberOfLines={1}>
                  {att.type === "image" ? (att.name ?? "Image") : "Link"}
                </Text>
                <View style={styles.row}>
                  {att.type === "link" && (
                    <TouchableOpacity onPress={() => open(att)} style={styles.openBtn} testID={`${testID}-open-${att.id}`}>
                      <Text style={[styles.openText, { color: palette.primary }]}>Open</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => remove(att.id)} accessibilityLabel="Remove attachment" testID={`${testID}-remove-${att.id}`}>
                    <Trash2 size={16} color={palette.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    {/* Image preview modal */}
    <Modal
      visible={!!previewUri}
      animationType={Platform.OS === 'web' ? 'none' : 'fade'}
      transparent
      onRequestClose={() => setPreviewUri(null)}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalContent, { backgroundColor: palette.card ?? palette.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: palette.text }]}>Preview</Text>
            <TouchableOpacity onPress={() => setPreviewUri(null)} accessibilityLabel="Close preview" testID={`${testID}-close-preview`}>
              <X size={20} color={palette.text} />
            </TouchableOpacity>
          </View>
          {previewUri ? (
            Platform.OS === 'android' ? (
              <RNImage source={{ uri: previewUri }} style={styles.modalImage} resizeMode="contain" />
            ) : (
              <Image source={{ uri: previewUri }} style={styles.modalImage} contentFit="contain" />
            )
          ) : null}
        </View>
      </View>
    </Modal>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 16, marginHorizontal: 16, marginBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  title: { fontSize: 16, fontWeight: "700" as const },
  headerActions: { flexDirection: "row", gap: 8 } as const,
  iconBtn: { padding: 8, borderRadius: 10, borderWidth: 1 },
  addLinkRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, padding: 8, marginBottom: 10 },
  input: { flex: 1, paddingHorizontal: 8, minHeight: 36 },
  addBtn: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  empty: { fontSize: 13, lineHeight: 18 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 },
  item: { width: "48%", marginHorizontal: 6, marginBottom: 12, borderWidth: 1, borderRadius: 12, overflow: "hidden" },
  thumb: { width: "100%", height: 110 },
  linkCell: { flexDirection: "row", alignItems: "center", padding: 12, gap: 6 } as const,
  linkText: { flex: 1, fontSize: 12 },
  itemFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 10, paddingVertical: 8 },
  itemLabel: { fontSize: 11 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 } as const,
  openBtn: { marginRight: 6 },
  openText: { fontSize: 12, fontWeight: "600" as const },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 16 },
  modalContent: { width: "100%", maxWidth: 520, borderRadius: 16, overflow: "hidden" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 10 },
  modalTitle: { fontSize: 14, fontWeight: "700" as const },
  modalImage: { width: "100%", height: 420, backgroundColor: "#000" },
});