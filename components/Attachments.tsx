import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image as RNImage, Alert, Platform } from 'react-native';
import { Paperclip, Plus, Trash2, Image as ImageIcon, File, Link as LinkIcon } from 'lucide-react-native';
import GlassView from '@/components/GlassView';
import { useAppSettings } from '@/providers/AppSettingsProvider';
import { colors } from '@/constants/colors';

export type AttachmentType = 'image' | 'file' | 'link';
export interface Attachment {
  id: string;
  name: string;
  uri: string;
  type: AttachmentType;
}

interface AttachmentsProps {
  title?: string;
  initial?: Attachment[];
  onChange?: (items: Attachment[]) => void;
  testID?: string;
}

const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];

function inferTypeFromUrl(url: string): AttachmentType {
  const lower = url.toLowerCase();
  const isImage = imageExts.some((ext) => lower.endsWith(ext));
  if (isImage) return 'image';
  try {
    const u = new URL(url);
    if (u.protocol.startsWith('http')) return 'link';
  } catch {}
  return 'file';
}

const Attachments = memo(function Attachments({ title = 'Attachments', initial, onChange, testID }: AttachmentsProps) {
  const { theme } = useAppSettings();
  const palette = colors[theme];

  const [items, setItems] = useState<Attachment[]>(Array.isArray(initial) ? initial : []);
  const [url, setUrl] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems(Array.isArray(initial) ? initial : []);
  }, [initial]);

  useEffect(() => {
    onChange?.(items);
  }, [items, onChange]);

  const canAdd = useMemo(() => url.trim().length > 0, [url]);

  const handleAdd = useCallback(() => {
    try {
      const trimmed = url.trim();
      if (!trimmed) return;
      const type = inferTypeFromUrl(trimmed);
      const display = name.trim() || trimmed.split('/').pop() || 'Attachment';
      const next: Attachment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: display,
        uri: trimmed,
        type,
      };
      const updated = [next, ...items];
      setItems(updated);
      setUrl('');
      setName('');
      setError(null);
      console.log('[Attachments] added', next);
    } catch (e) {
      console.log('[Attachments] add error', e);
      setError('Failed to add attachment');
    }
  }, [items, name, url]);

  const handleRemove = useCallback((id: string) => {
    const confirm = () => {
      const updated = items.filter((it) => it.id !== id);
      setItems(updated);
      console.log('[Attachments] removed', id);
    };
    if (Platform.OS === 'web') {
      const ok = window.confirm('Remove this attachment?');
      if (ok) confirm();
    } else {
      Alert.alert('Remove attachment', 'Are you sure you want to remove this item?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: confirm },
      ]);
    }
  }, [items]);

  const renderItem = useCallback(({ item }: { item: Attachment }) => {
    const isImage = item.type === 'image';
    return (
      <View style={[styles.itemRow]}>
        <View style={[styles.itemIcon, { backgroundColor: `${palette.primary}12` }]}> 
          {isImage ? <ImageIcon size={18} color={palette.primary} /> : item.type === 'link' ? <LinkIcon size={18} color={palette.primary} /> : <File size={18} color={palette.primary} />}
        </View>
        <View style={styles.itemBody}>
          <Text style={[styles.itemTitle, { color: palette.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.itemSub, { color: palette.textSecondary }]} numberOfLines={1}>{item.uri}</Text>
          {isImage ? (
            <RNImage source={{ uri: item.uri }} style={styles.preview} resizeMode="cover" />
          ) : null}
        </View>
        <TouchableOpacity onPress={() => handleRemove(item.id)} accessibilityRole="button" testID={`remove-${item.id}`}>
          <View style={[styles.removeBtn, { backgroundColor: `${palette.text}10`, borderColor: `${palette.text}20` }]}> 
            <Trash2 size={16} color={palette.text} />
          </View>
        </TouchableOpacity>
      </View>
    );
  }, [handleRemove, palette.primary, palette.text, palette.textSecondary]);

  return (
    <GlassView style={styles.wrap} testID={testID}>
      <View style={styles.headerRow}>
        <View style={[styles.headerIcon, { backgroundColor: `${palette.primary}15` }]}> 
          <Paperclip size={18} color={palette.primary} />
        </View>
        <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name (optional)"
          placeholderTextColor={palette.textSecondary}
          style={[styles.input, { color: palette.text, borderColor: `${palette.text}20` }]}
          autoCapitalize="none"
          testID="attachment-name"
        />
        <TextInput
          value={url}
          onChangeText={(t) => {
            setUrl(t);
            if (error) setError(null);
          }}
          placeholder="Paste URL (image/file)"
          placeholderTextColor={palette.textSecondary}
          style={[styles.input, { color: palette.text, borderColor: `${palette.text}20` }]}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={Platform.OS === 'web' ? 'default' : 'url'}
          testID="attachment-url"
        />
        <TouchableOpacity disabled={!canAdd} onPress={handleAdd} accessibilityRole="button" testID="attachment-add">
          <View style={[styles.addBtn, { backgroundColor: canAdd ? palette.primary : `${palette.text}20` }]}> 
            <Plus size={18} color={palette.background} />
          </View>
        </TouchableOpacity>
      </View>

      {error ? <Text style={[styles.errorText, { color: palette.error ?? '#ff4d4f' }]}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: palette.textSecondary }]} testID="attachments-empty">No attachments yet</Text>}
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : undefined}
        showsVerticalScrollIndicator={false}
        testID="attachments-list"
      />
    </GlassView>
  );
});

const styles = StyleSheet.create({
  wrap: { padding: 16, borderRadius: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  headerIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  title: { fontSize: 16, fontWeight: '700' as const },
  inputRow: { flexDirection: 'row', alignItems: 'center', columnGap: 8 as unknown as number, rowGap: 8 as unknown as number, flexWrap: 'wrap', marginBottom: 8 },
  input: { flexGrow: 1, minWidth: 140, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderRadius: 10 },
  addBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  errorText: { marginTop: 4, marginBottom: 4, fontSize: 12 },
  emptyContainer: { paddingVertical: 16 },
  emptyText: { textAlign: 'center', fontSize: 13 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10 },
  itemIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  itemBody: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600' as const, marginBottom: 2 },
  itemSub: { fontSize: 12, marginBottom: 8 },
  preview: { width: '100%', height: 140, borderRadius: 10 },
  removeBtn: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
});

export default Attachments;
