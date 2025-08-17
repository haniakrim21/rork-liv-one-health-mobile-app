import React, { useEffect, useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Activity, Flame, Moon, Droplets, Heart, TrendingUp, Apple, CalendarDays, Dumbbell, Bed, Utensils, Trophy, Sparkles, Clock, BarChart3 } from "lucide-react-native";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { useHealthData } from "@/providers/HealthDataProvider";
import { colors } from "@/constants/colors";
import AnimatedPressable from "@/components/AnimatedPressable";
import { trpc } from "@/lib/trpc";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function DashboardScreen() {
  console.log("[Dashboard] mount");
  const { theme } = useAppSettings();
  const { dailyStats, activities, meals, goals, sleepData } = useHealthData();
  const currentColors = colors[theme];

  const statsQuery = trpc.dashboard.getStats.useQuery(undefined, { staleTime: 15_000 });

  const mount = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(mount, { toValue: 1, duration: 550, useNativeDriver: Platform.OS !== "web" }).start();
  }, [mount]);

  const dateLabel = useMemo(() => new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }), []);

  const weekSeries = useMemo<number[]>(() => {
    const base = [12, 9, 10, 14, 11, 16, 13];
    return base.map((n, i) => Math.max(4, Math.round((n + (i % 2 === 0 ? 1 : -1)) * 1)));
  }, []);

  const nutrition = useMemo(() => {
    const totals = meals.reduce((acc, m) => {
      return { calories: acc.calories + m.calories, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    return totals;
  }, [meals]);

  const headerOpacity = mount;
  const headerTranslate = mount.interpolate({ inputRange: [0,1], outputRange: [12, 0] });

  const onRefresh = React.useCallback(() => {
    console.log("[Dashboard] refresh");
    statsQuery.refetch();
  }, [statsQuery]);

  return (
    <Animated.ScrollView
      style={[styles.container, { backgroundColor: currentColors.background }]}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: Platform.OS !== "web" })}
      refreshControl={(
        <RefreshControl
          refreshing={statsQuery.isFetching}
          onRefresh={onRefresh}
          tintColor={currentColors.primary}
          colors={[currentColors.primary]}
        />
      )}
      testID="dashboard-scroll"
    >
      <LinearGradient colors={[`${currentColors.secondary}22`, "transparent"]} style={styles.headerBg} />
      <Animated.View style={[styles.headerRow, { opacity: headerOpacity, transform: [{ translateY: headerTranslate }] }]}> 
        <View style={styles.headerLeft}>
          <Text style={[styles.kicker, { color: currentColors.textSecondary }]}>Overview</Text>
          <Text style={[styles.title, { color: currentColors.text }]}>Your Dashboard</Text>
        </View>
        <View style={[styles.chip, { borderColor: currentColors.border }]} testID="date-chip">
          <CalendarDays size={16} color={currentColors.textSecondary} />
          <Text style={[styles.chipText, { color: currentColors.text }]}>{dateLabel}</Text>
        </View>
      </Animated.View>

      <View style={styles.kpiRow}>
        <KPI
          color={colors.light.primary}
          bg={`${colors.light.primary}1A`}
          icon={Activity}
          label="Steps"
          value={dailyStats.steps.toLocaleString()}
          testID="kpi-steps"
        />
        <KPI
          color={colors.light.accent}
          bg={`${colors.light.accent}1A`}
          icon={Flame}
          label="Calories"
          value={`${dailyStats.calories}`}
          testID="kpi-calories"
        />
      </View>
      <View style={styles.kpiRow}>
        <KPI
          color={colors.light.purple}
          bg={`${colors.light.purple}1A`}
          icon={Moon}
          label="Sleep"
          value={`${dailyStats.sleep}h`}
          testID="kpi-sleep"
        />
        <KPI
          color={colors.light.secondary}
          bg={`${colors.light.secondary}1A`}
          icon={Droplets}
          label="Water"
          value={`${dailyStats.water}/8`}
          testID="kpi-water"
        />
      </View>

      <Section title="This Week" icon={BarChart3} tint={currentColors.info}>
        <View style={styles.bars}>
          {weekSeries.map((v, i) => {
            const h = 8 + v * 6;
            return (
              <View key={`bar-${i}`} style={styles.barWrap}>
                <View style={[styles.bar, { height: h, backgroundColor: i === weekSeries.length - 1 ? currentColors.primary : `${currentColors.primary}77` }]} />
              </View>
            );
          })}
        </View>
      </Section>

      <Section title="Goals" icon={Trophy} tint={currentColors.primary}>
        <View style={styles.goalsGrid}>
          {goals.map((g) => {
            const pct = Math.min(100, Math.round(g.current / g.target * 100));
            return (
              <AnimatedPressable key={g.id} style={[styles.goalCard, { backgroundColor: currentColors.card }]} onPress={() => console.log("[Dashboard] goal", g.id)} testID={`goal-${g.id}`}>
                <View style={[styles.goalIcon, { backgroundColor: `${g.color}22` }]}>
                  <Trophy size={18} color={g.color} />
                </View>
                <Text style={[styles.goalTitle, { color: currentColors.text }]}>{g.title}</Text>
                <Text style={[styles.goalMeta, { color: currentColors.textSecondary }]}>{g.current} / {g.target} {g.unit}</Text>
                <View style={[styles.progressTrack, { backgroundColor: currentColors.border }]}>
                  <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: g.color }]} />
                </View>
              </AnimatedPressable>
            );
          })}
        </View>
      </Section>

      <Section title="Today’s Nutrition" icon={Utensils} tint={currentColors.accent}>
        <View style={styles.nutritionRow}>
          <Macro title="Calories" value={`${nutrition.calories}`} color={currentColors.accent} />
          <Macro title="Protein" value={`${nutrition.protein}g`} color={currentColors.primary} />
          <Macro title="Carbs" value={`${nutrition.carbs}g`} color={currentColors.info} />
          <Macro title="Fat" value={`${nutrition.fat}g`} color={colors.light.purple} />
        </View>
      </Section>

      <Section title="Activity" icon={Dumbbell} tint={currentColors.primary}>
        {activities.map((a) => (
          <View key={a.id} style={[styles.activityItem, { borderColor: currentColors.border }]}> 
            <View style={[styles.activityIcon, { backgroundColor: `${currentColors.primary}1A` }]}> 
              <Activity size={16} color={currentColors.primary} />
            </View>
            <View style={styles.activityText}>
              <Text style={[styles.activityTitle, { color: currentColors.text }]}>{a.type}</Text>
              <Text style={[styles.activityMeta, { color: currentColors.textSecondary }]}>{a.duration}m • {a.calories} kcal</Text>
            </View>
            <Clock size={16} color={currentColors.textSecondary} />
          </View>
        ))}
      </Section>

      <Section title="Sleep" icon={Bed} tint={colors.light.purple}>
        <View style={[styles.sleepCard, { backgroundColor: currentColors.card }]}> 
          <View style={[styles.sleepTag, { backgroundColor: `${colors.light.purple}22` }]}>
            <Moon size={16} color={colors.light.purple} />
            <Text style={[styles.sleepTagText, { color: colors.light.purple }]}>Quality {sleepData?.quality ?? 80}%</Text>
          </View>
          <Text style={[styles.sleepHours, { color: currentColors.text }]}>{dailyStats.sleep}h</Text>
          <Text style={[styles.sleepMeta, { color: currentColors.textSecondary }]}>Bed {sleepData?.bedtime ?? "--:--"} • Wake {sleepData?.wakeTime ?? "--:--"}</Text>
        </View>
      </Section>

      <Section title="Hydration" icon={Droplets} tint={currentColors.secondary}>
        <View style={styles.waterRow}>
          {new Array(8).fill(null).map((_, i) => {
            const filled = i < dailyStats.water;
            return <View key={`cup-${i}`} style={[styles.cup, { backgroundColor: filled ? currentColors.secondary : "transparent", borderColor: currentColors.border }]} />;
          })}
        </View>
      </Section>

      {statsQuery.error ? (
        <View style={[styles.errorBanner, { backgroundColor: `${currentColors.error}15`, borderColor: `${currentColors.error}33` }]} testID="server-error">
          <Text style={[styles.errorBannerText, { color: currentColors.error }]}>Failed to load server stats</Text>
        </View>
      ) : (
        <Section title="Insights" icon={Sparkles} tint={currentColors.info}>
          <View style={[styles.insightItem, { backgroundColor: currentColors.card }]}> 
            <TrendingUp size={18} color={currentColors.primary} />
            <Text style={[styles.insightText, { color: currentColors.text }]}>You are on track. {statsQuery.data?.workoutsToday ?? 0} workouts logged today.</Text>
          </View>
        </Section>
      )}

      <Section title="Quick Actions" icon={Heart} tint={currentColors.primary}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
          <QuickAction title="Log Workout" icon={Activity} color={currentColors.primary} testID="qa-workout" />
          <QuickAction title="Add Meal" icon={Apple} color={currentColors.accent} testID="qa-meal" />
          <QuickAction title="Track Sleep" icon={Moon} color={colors.light.purple} testID="qa-sleep" />
          <QuickAction title="Check Heart" icon={Heart} color={currentColors.error} testID="qa-heart" />
        </ScrollView>
      </Section>

      <View style={{ height: 32 }} />
    </Animated.ScrollView>
  );
}

type KPIProps = { color: string; bg: string; icon: any; label: string; value: string; testID?: string };
function KPI({ color, bg, icon: Icon, label, value, testID }: KPIProps) {
  return (
    <View style={[styles.kpi, { backgroundColor: bg }]} testID={testID}>
      <View style={[styles.kpiIcon, { backgroundColor: color }]}>
        <Icon size={16} color="#fff" />
      </View>
      <Text style={[styles.kpiLabel]}>{label}</Text>
      <Text style={[styles.kpiValue]}>{value}</Text>
    </View>
  );
}

type SectionProps = { title: string; icon: any; tint: string; children: React.ReactNode };
function Section({ title, icon: Icon, tint, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionBadge, { backgroundColor: `${tint}22` }]}> 
          <Icon size={16} color={tint} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

type MacroProps = { title: string; value: string; color: string };
function Macro({ title, value, color }: MacroProps) {
  return (
    <View style={styles.macro}>
      <Text style={styles.macroTitle}>{title}</Text>
      <Text style={[styles.macroValue, { color }]}>{value}</Text>
    </View>
  );
}

type QuickProps = { title: string; icon: any; color: string; testID?: string };
function QuickAction({ title, icon: Icon, color, testID }: QuickProps) {
  return (
    <AnimatedPressable style={[styles.quick, { borderColor: `${color}55` }]} onPress={() => console.log("[Dashboard] quick", title)} testID={testID}>
      <View style={[styles.quickIcon, { backgroundColor: `${color}22` }]}> 
        <Icon size={18} color={color} />
      </View>
      <Text style={styles.quickText}>{title}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBg: { height: 120 },
  headerRow: { paddingHorizontal: 16, marginTop: -100, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "column" },
  kicker: { fontSize: 12 },
  title: { fontSize: 28, fontWeight: "700" as const },
  chip: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chipText: { fontSize: 12 },

  kpiRow: { flexDirection: "row", gap: 12, paddingHorizontal: 16, marginTop: 16 },
  kpi: { flex: 1, padding: 16, borderRadius: 16 },
  kpiIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  kpiLabel: { fontSize: 12, color: "#6B7280" },
  kpiValue: { fontSize: 20, fontWeight: "700" as const, color: "#111827", marginTop: 2 },

  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sectionBadge: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center", marginRight: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "600" as const },

  bars: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 120, paddingHorizontal: 4 },
  barWrap: { flex: 1, alignItems: "center" },
  bar: { width: 14, borderRadius: 6 },

  goalsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  goalCard: { width: cardWidth, padding: 14, borderRadius: 14 },
  goalIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  goalTitle: { fontSize: 14, fontWeight: "600" as const },
  goalMeta: { fontSize: 12, marginTop: 2 },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden", marginTop: 10 },
  progressFill: { height: "100%", borderRadius: 3 },

  nutritionRow: { flexDirection: "row", gap: 12 },
  macro: { flex: 1, backgroundColor: "#0F172A0D", borderRadius: 12, padding: 12 },
  macroTitle: { fontSize: 12, color: "#6B7280" },
  macroValue: { fontSize: 18, fontWeight: "700" as const, marginTop: 2 },

  activityItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1 },
  activityIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center", marginRight: 12 },
  activityText: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: "600" as const },
  activityMeta: { fontSize: 12 },

  sleepCard: { padding: 16, borderRadius: 16 },
  sleepTag: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  sleepTagText: { fontSize: 12 },
  sleepHours: { fontSize: 28, fontWeight: "700" as const, marginTop: 10 },
  sleepMeta: { fontSize: 12, marginTop: 2 },

  waterRow: { flexDirection: "row", gap: 8 },
  cup: { width: 28, height: 36, borderRadius: 8, borderWidth: 1 },

  quickRow: { paddingRight: 16, gap: 12 },
  quick: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, marginRight: 8 },
  quickIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  quickText: { fontSize: 12, fontWeight: "600" as const },

  errorBanner: { marginTop: 12, marginHorizontal: 16, borderRadius: 12, padding: 12, borderWidth: 1 },
  errorBannerText: { fontSize: 13 },
  insightItem: { marginTop: 8, padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  insightText: { fontSize: 13, flex: 1 },
});