import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";
import GlassView from "@/components/GlassView";
import NextSteps from "@/components/NextSteps";
import { Camera, Image as ImageIcon, Link as LinkIcon, Trash2, ExternalLink, Plus } from "lucide-react-native";

interface AttachmentItem {
  id: string;
  type: "image" | "link";
  uri: string;
  title?: string;
  createdAt: number;
}

const STORAGE_KEY = "attachments_v1";

export default function AttachmentsScreen() {
  const { theme } = useAppSettings();
  const palette = colors[theme];


  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isPicking, setIsPicking] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [linkTitle, setLinkTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const mount = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(mount, { toValue: 1, duration: 400, useNativeDriver: false }).start();
  }, [mount]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as AttachmentItem[];
          if (Array.isArray(parsed)) {
            setAttachments(parsed);
          }
        }
      } catch (e) {
        console.log("[Attachments] load error", e);
      }
    })();
  }, []);

  const save = useCallback(async (data: AttachmentItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.log("[Attachments] save error", e);
    }
  }, []);

  const addItems = useCallback((items: AttachmentItem[]) => {
    setAttachments((prev) => {
      const next = [...items, ...prev].sort((a, b) => b.createdAt - a.createdAt);
      save(next);
      return next;
    });
  }, [save]);

  const pickFromLibrary = useCallback(async () => {
    setError(null);
    setIsPicking(true);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted && Platform.OS !== "web") {
        setError("Permission to access photos is required.");
        setIsPicking(false);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        quality: 0.8,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (result.canceled) {
        setIsPicking(false);
        return;
      }
      const assets = result.assets ?? [];
      const items: AttachmentItem[] = assets.map((a) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "image",
        uri: a.uri,
        title: a.fileName ?? "Image",
        createdAt: Date.now(),
      }));
      addItems(items);
      setIsPicking(false);
    } catch (e) {
      console.log("[Attachments] pick error", e);
      setError("Failed to pick images.");
      setIsPicking(false);
    }
  }, [addItems]);

  const takePhoto = useCallback(async () => {
    setError(null);
    if (Platform.OS === "web") {
      pickFromLibrary();
      return;
    }
    setIsPicking(true);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        setError("Camera permission is required.");
        setIsPicking(false);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
      if (result.canceled) {
        setIsPicking(false);
        return;
      }
      const asset = result.assets?.[0];
      if (asset?.uri) {
        addItems([{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type: "image", uri: asset.uri, title: "Photo", createdAt: Date.now() }]);
      }
      setIsPicking(false);
    } catch (e) {
      console.log("[Attachments] camera error", e);
      setError("Failed to take photo.");
      setIsPicking(false);
    }
  }, [addItems, pickFromLibrary]);

  const validateUrl = useCallback((u: string): boolean => {
    try {
      const url = new URL(u.startsWith("http") ? u : `https://${u}`);
      return !!url.protocol && !!url.host;
    } catch {
      return false;
    }
  }, []);

  const onAddLink = useCallback(() => {
    setError(null);
    const trimmed = linkUrl.trim();
    if (!validateUrl(trimmed)) {
      setError("Enter a valid URL");
      return;
    }
    const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const item: AttachmentItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "link",
      uri: normalized,
      title: linkTitle.trim() || normalized,
      createdAt: Date.now(),
    };
    addItems([item]);
    setLinkUrl("");
    setLinkTitle("");
  }, [addItems, linkTitle, linkUrl, validateUrl]);

  const removeItem = useCallback((id: string) => {
    Alert.alert("Remove attachment", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setAttachments((prev) => {
            const next = prev.filter((i) => i.id !== id);
            save(next);
            return next;
          });
        },
      },
    ]);
  }, [save]);

  const openItem = useCallback(async (item: AttachmentItem) => {
    try {
      await Linking.openURL(item.uri);
    } catch (e) {
      console.log("[Attachments] open error", e);
      setError("Unable to open.");
    }
  }, []);

  const renderItem = useCallback(({ item }: { item: AttachmentItem }) => {
    return (
      <GlassView style={styles.item}>
        <View style={styles.itemRow}>
          <View style={[styles.thumbWrap, { backgroundColor: `${palette.text}08`, borderColor: `${palette.text}12` }]}> 
            {item.type === "image" ? (
              <Image source={{ uri: item.uri }} style={styles.thumb} resizeMode="cover" />
            ) : (
              <LinkIcon size={20} color={palette.primary} />
            )}
          </View>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemTitle, { color: palette.text }]} numberOfLines={2}>
              {item.title ?? (item.type === "image" ? "Image" : item.uri)}
            </Text>
            <Text style={[styles.itemSub, { color: palette.textSecondary }]} numberOfLines={1}>
              {item.type === "image" ? "Image" : item.uri}
            </Text>
          </View>
          <View style={styles.itemActions}>
            <TouchableOpacity onPress={() => openItem(item)} style={styles.iconBtn} testID={`open-${item.id}`}>
              <ExternalLink size={18} color={palette.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.iconBtn} testID={`remove-${item.id}`}>
              <Trash2 size={18} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </GlassView>
    );
  }, [openItem, palette.primary, palette.text, palette.textSecondary, removeItem]);

  const keyExtractor = useCallback((i: AttachmentItem) => i.id, []);

  const header = useMemo(() => (
    <Animated.View style={{ opacity: mount, transform: [{ translateY: mount.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
      <GlassView style={styles.actions}>
        <TouchableOpacity disabled={isPicking} onPress={pickFromLibrary} style={[styles.actionBtn, { opacity: isPicking ? 0.6 : 1, backgroundColor: `${palette.primary}18`, borderColor: `${palette.primary}30` }]} testID="attachments-add-image">
          <ImageIcon size={18} color={palette.primary} />
          <Text style={[styles.actionText, { color: palette.primary }]}>Photos</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={isPicking} onPress={takePhoto} style={[styles.actionBtn, { opacity: isPicking ? 0.6 : 1, backgroundColor: `${palette.text}10`, borderColor: `${palette.text}20` }]} testID="attachments-add-camera">
          <Camera size={18} color={palette.text} />
          <Text style={[styles.actionText, { color: palette.text }]}>Camera</Text>
        </TouchableOpacity>
      </GlassView>

      <GlassView style={styles.linkBox}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Add a link</Text>
        <View style={styles.linkRow}>
          <TextInput
            placeholder="https://example.com or example.com"
            placeholderTextColor={palette.textSecondary}
            value={linkUrl}
            onChangeText={setLinkUrl}
            style={[styles.input, { color: palette.text, borderColor: `${palette.text}20`, backgroundColor: `${palette.text}06` }]}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType={Platform.OS === "web" ? "default" : "url"}
            testID="link-input"
          />
        </View>
        <View style={styles.linkRow}>
          <TextInput
            placeholder="Optional title"
            placeholderTextColor={palette.textSecondary}
            value={linkTitle}
            onChangeText={setLinkTitle}
            style={[styles.input, { color: palette.text, borderColor: `${palette.text}20`, backgroundColor: `${palette.text}06` }]}
            autoCapitalize="sentences"
            autoCorrect
            testID="link-title-input"
          />
        </View>
        {!!error && (
          <Text style={[styles.errorText, { color: "#E53935" }]} testID="attachments-error">{error}</Text>
        )}
        <TouchableOpacity onPress={onAddLink} style={[styles.addLinkBtn, { backgroundColor: palette.primary }]} testID="add-link-button">
          <Plus size={18} color={palette.background} />
          <Text style={[styles.addLinkText, { color: palette.background }]}>Add link</Text>
        </TouchableOpacity>
      </GlassView>
    </Animated.View>
  ), [palette.background, palette.text, palette.textSecondary, palette.primary, error, linkTitle, linkUrl, mount, onAddLink, pickFromLibrary, takePhoto, isPicking]);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]} testID="attachments-screen">
      <Stack.Screen options={{ title: "Attachments" }} />
      <FlatList
        data={attachments}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListFooterComponent={<NextSteps testID="attachments-next-steps" />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 24 },
  actions: { flexDirection: "row", gap: 10 as unknown as number, padding: 12, borderRadius: 16 },
  actionBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
  actionText: { marginLeft: 8, fontWeight: "700" as const },
  linkBox: { marginTop: 12, padding: 12, borderRadius: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700" as const, marginBottom: 8 },
  linkRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, fontSize: 14 },
  addLinkBtn: { marginTop: 6, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  addLinkText: { marginLeft: 8, fontWeight: "700" as const },
  errorText: { marginTop: 4, fontSize: 12 },

  item: { marginTop: 12, borderRadius: 16, padding: 12 },
  itemRow: { flexDirection: "row", alignItems: "center" },
  thumbWrap: { width: 48, height: 48, borderRadius: 12, borderWidth: 1, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  thumb: { width: 48, height: 48 },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemTitle: { fontSize: 14, fontWeight: "700" as const },
  itemSub: { fontSize: 12, marginTop: 2 },
  itemActions: { flexDirection: "row" },
  iconBtn: { paddingHorizontal: 8, paddingVertical: 6 },
});
