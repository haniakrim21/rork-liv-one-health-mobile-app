import React, { useCallback, useMemo, useState } from "react";
import { Alert, Linking, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import GlassView from "@/components/GlassView";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";
import { Image as ImageIcon, Link as LinkIcon, Trash2, Plus } from "lucide-react-native";

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

  const border = useMemo(() => ({ borderColor: `${palette.text}15` }), [palette.text]);

  const update = useCallback((next: Attachment[]) => {
    setItems(next);
    if (onChange) onChange(next);
  }, [onChange]);

  const addImage = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "We need access to your photos to attach images.");
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) return;
      const next: Attachment = { id: `${Date.now()}`, type: "image", uri: asset.uri, name: (asset as any)?.fileName ?? undefined };
      update([next, ...items]);
    } catch (e) {
      console.error("[Attachments] addImage error", e);
      Alert.alert("Error", "Could not add image. Please try again.");
    }
  }, [items, update]);

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
                <Image source={{ uri: att.uri }} style={styles.thumb} contentFit="cover" />
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
});