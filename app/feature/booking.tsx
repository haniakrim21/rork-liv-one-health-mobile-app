import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Animated } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import { Calendar, Video, MapPin, ChevronLeft } from "lucide-react-native";
import GlassView from "@/components/GlassView";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";

export default function BookingScreen() {
  const { theme } = useAppSettings();
  const palette = colors[theme];
  const router = useRouter();
  const { type: rawType, date: rawDate } = useLocalSearchParams<{ type?: "virtual" | "inclinic"; date?: string }>();
  const type: "virtual" | "inclinic" = typeof rawType === "string" ? rawType : "virtual";
  const date = typeof rawDate === "string" ? rawDate : new Date().toISOString().slice(0, 10);

  const mount = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(mount, { toValue: 1, duration: 400, useNativeDriver: false }).start();
  }, [mount]);

  const availabilityQuery = trpc.services.availability.useQuery({ type, date });
  const times: string[] = useMemo(() => availabilityQuery.data?.times ?? [], [availabilityQuery.data?.times]);

  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<boolean>(false);
  const bookMutation = trpc.services.book.useMutation();

  const onConfirm = useCallback(() => {
    if (!selectedTime) return;
    setConfirming(true);
    bookMutation.mutate(
      { type, date, time: selectedTime },
      {
        onSuccess: (res) => {
          console.log("[Booking] confirmed", res);
          setConfirming(false);
          router.back();
        },
        onError: (err) => {
          console.log("[Booking] error", err);
          setConfirming(false);
        },
      }
    );
  }, [bookMutation, date, router, selectedTime, type]);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]} testID="booking-screen">
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} testID="booking-back">
          <View style={[styles.backBtn, { backgroundColor: `${palette.text}10`, borderColor: `${palette.text}20` }]}> 
            <ChevronLeft size={20} color={palette.text} />
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: palette.text }]}>Book {type === "virtual" ? "Virtual" : "In-Clinic"}</Text>
        <View style={{ width: 36 }} />
      </View>

      <Animated.View style={{ opacity: mount, transform: [{ translateY: mount.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
        <GlassView style={styles.card}>
          <Text style={[styles.cardTitle, { color: palette.text }]}>Details</Text>
          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: `${palette.primary}12` }]}> 
              <Calendar size={18} color={palette.primary} />
            </View>
            <Text style={[styles.detailText, { color: palette.text }]}>{date}</Text>
          </View>
          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: `${palette.primary}12` }]}> 
              {type === "virtual" ? <Video size={18} color={palette.primary} /> : <MapPin size={18} color={palette.primary} />}
            </View>
            <Text style={[styles.detailText, { color: palette.text }]}>{type === "virtual" ? "Virtual video consult" : "In-clinic visit"}</Text>
          </View>
        </GlassView>

        <GlassView style={styles.card}>
          <Text style={[styles.cardTitle, { color: palette.text }]}>Select a time</Text>
          {availabilityQuery.isLoading ? (
            <Text style={{ color: palette.textSecondary }}>Loading times...</Text>
          ) : availabilityQuery.error ? (
            <Text style={{ color: palette.textSecondary }}>Failed to load times</Text>
          ) : times.length === 0 ? (
            <Text style={{ color: palette.textSecondary }}>No times available. Pick another day.</Text>
          ) : null}
          <FlatList
            horizontal
            data={times}
            keyExtractor={(t) => t}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeList}
            renderItem={({ item }) => {
              const isSel = selectedTime === item;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedTime(item)}
                  style={[styles.timePill, { borderColor: isSel ? palette.primary : `${palette.text}25`, backgroundColor: isSel ? `${palette.primary}20` : "transparent" }]}
                  testID={`time-${item.replace(':','-')}`}
                >
                  <Text style={{ color: palette.text, fontWeight: "600" as const }}>{item}</Text>
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            disabled={!selectedTime || confirming}
            style={[styles.primaryBtn, { backgroundColor: !selectedTime || confirming ? `${palette.text}20` : palette.primary }]}
            onPress={onConfirm}
            testID="confirm-booking"
          >
            <Text style={[styles.primaryBtnText, { color: palette.background }]}>
              {confirming ? "Booking..." : selectedTime ? `Confirm ${selectedTime}` : "Choose a time"}
            </Text>
          </TouchableOpacity>
        </GlassView>
      </Animated.View>
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
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  detailIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center", marginRight: 10 },
  detailText: { fontSize: 14 },
  timeList: { paddingVertical: 8 },
  timePill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, marginRight: 8 },
  primaryBtn: { marginTop: 12, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { fontSize: 14, fontWeight: "700" as const },
});