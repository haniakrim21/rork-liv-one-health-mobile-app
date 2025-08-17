import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Animated,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Activity,
  Flame,
  Moon,
  Droplets,
  Heart,
  Apple,
  Dumbbell,
  Bed,
  Utensils,
  Trophy,
  Sparkles,
  Clock,
  BarChart3,
  ChevronRight,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { useHealthData } from "@/providers/HealthDataProvider";
import { colors } from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import GlassView from "@/components/GlassView";

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = 40;
const INTER_ITEM_GAP = 14;
const cardWidth = (width - HORIZONTAL_PADDING - INTER_ITEM_GAP) / 2;

type DashFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  comingSoon?: boolean;
};

type DashCategory = {
  title: string;
  description: string;
  gradient: readonly [string, string];
  icon: LucideIcon;
  features: DashFeature[];
};

const TileCard = memo(function TileCard({
  feature,
  onPress,
  text,
  index,
  mount,
}: {
  feature: DashFeature;
  onPress: (f: DashFeature) => void;
  text: { primary: string; secondary: string };
  index: number;
  mount: Animated.Value;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const appear = useRef(new Animated.Value(0)).current;

  const animateTo = useCallback(
    (to: number) => {
      Animated.timing(scale, { toValue: to, duration: 120, useNativeDriver: false }).start();
    },
    [scale],
  );

  useEffect(() => {
    const delay = index * 40;
    Animated.timing(appear, { toValue: 1, duration: 360, delay, useNativeDriver: false }).start();
  }, [appear, index]);

  const translateY = appear.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const combinedScale = useMemo(
    () => Animated.multiply(scale, mount.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] })),
    [scale, mount],
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(feature)}
      onPressIn={() => animateTo(0.98)}
      onPressOut={() => animateTo(1)}
      testID={`tile-${feature.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
    >
      <LinearGradient
        colors={[`${feature.color}55`, `${feature.color}22`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardOuter}
      >
        <Animated.View style={{ transform: [{ scale: combinedScale }, { translateY }], opacity: appear }}>
          <GlassView style={styles.cardInner}>
            <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}> 
              <feature.icon size={24} color={feature.color} />
            </View>
            <Text style={[styles.featureTitle, { color: text.primary }]} numberOfLines={2}>
              {feature.title}
            </Text>
            <Text style={[styles.featureDescription, { color: text.secondary }]} numberOfLines={3}>
              {feature.description}
            </Text>
            {feature.comingSoon && (
              <View style={styles.pill}>
                <Text style={styles.pillText}>Coming soon</Text>
              </View>
            )}
            <View style={styles.featureArrow}>
              <ChevronRight size={16} color={text.secondary} />
            </View>
          </GlassView>
        </Animated.View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

export default function DashboardScreen() {
  const { theme } = useAppSettings();
  const { dailyStats, activities, meals, goals, sleepData } = useHealthData();
  const currentColors = colors[theme];

  const statsQuery = trpc.dashboard.getStats.useQuery(undefined, { staleTime: 15_000 });

  const mount = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(mount, { toValue: 1, duration: 500, useNativeDriver: false }).start();
  }, [mount]);

  const nutrition = useMemo(() => {
    const totals = meals.reduce(
      (acc, m) => ({ calories: acc.calories + m.calories, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
    return totals;
  }, [meals]);

  const categories: DashCategory[] = useMemo(() => [
    {
      title: "Overview",
      description: "Key stats for today",
      gradient: ["#1E88E5", "#1565C0"] as const,
      icon: BarChart3,
      features: [
        { title: "Steps", description: dailyStats.steps.toLocaleString(), icon: Activity, color: currentColors.primary },
        { title: "Calories", description: `${dailyStats.calories}` , icon: Flame, color: currentColors.accent },
        { title: "Sleep", description: `${dailyStats.sleep}h`, icon: Moon, color: currentColors.purple },
        { title: "Water", description: `${dailyStats.water}/8`, icon: Droplets, color: currentColors.secondary },
      ],
    },
    {
      title: "Goals",
      description: "Progress to targets",
      gradient: ["#43A047", "#2E7D32"] as const,
      icon: Trophy,
      features: goals.slice(0, 6).map((g) => ({
        title: g.title,
        description: `${g.current} / ${g.target} ${g.unit}`,
        icon: Trophy,
        color: g.color,
      })),
    },
    {
      title: "Nutrition",
      description: "Today’s intake",
      gradient: ["#FB8C00", "#EF6C00"] as const,
      icon: Utensils,
      features: [
        { title: "Calories", description: `${nutrition.calories}` , icon: Apple, color: currentColors.accent },
        { title: "Protein", description: `${nutrition.protein}g`, icon: Dumbbell, color: currentColors.primary },
        { title: "Carbs", description: `${nutrition.carbs}g`, icon: Flame, color: currentColors.info },
        { title: "Fat", description: `${nutrition.fat}g`, icon: Droplets, color: currentColors.purple },
      ],
    },
    {
      title: "Sleep & Recovery",
      description: `Quality ${sleepData?.quality ?? 80}%` ,
      gradient: ["#8E24AA", "#6A1B9A"] as const,
      icon: Bed,
      features: [
        { title: "Hours", description: `${dailyStats.sleep}h`, icon: Moon, color: currentColors.purple },
        { title: "Bed/Wake", description: `${sleepData?.bedtime ?? "--:--"} → ${sleepData?.wakeTime ?? "--:--"}`, icon: Clock, color: currentColors.primary },
      ],
    },
    {
      title: "Insights & Actions",
      description: statsQuery.error ? "Server unavailable" : `Workouts today: ${statsQuery.data?.workoutsToday ?? 0}`,
      gradient: ["#00ACC1", "#00838F"] as const,
      icon: Sparkles,
      features: [
        { title: "Log Workout", description: "Add a new session", icon: Activity, color: currentColors.primary },
        { title: "Add Meal", description: "Track your food", icon: Apple, color: currentColors.accent },
        { title: "Track Sleep", description: "Record last night", icon: Moon, color: currentColors.purple },
        { title: "Check Heart", description: "Measure now", icon: Heart, color: currentColors.error },
      ],
    },
  ], [currentColors.accent, currentColors.error, currentColors.info, currentColors.primary, currentColors.purple, currentColors.secondary, dailyStats.calories, dailyStats.sleep, dailyStats.steps, dailyStats.water, goals, nutrition.calories, nutrition.carbs, nutrition.fat, nutrition.protein, sleepData?.bedtime, sleepData?.quality, sleepData?.wakeTime, statsQuery.data?.workoutsToday, statsQuery.error]);

  const handlePress = (f: DashFeature) => {
    console.log("[Dashboard] tile press", f.title);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentColors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={(
        <RefreshControl
          refreshing={false}
          onRefresh={() => statsQuery.refetch()}
          tintColor={currentColors.primary}
          colors={[currentColors.primary]}
        />
      )}
      testID="dashboard-scroll"
    >
      <Animated.View style={[styles.header, { opacity: mount, transform: [{ translateY: mount.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>
        <Text style={[styles.title, { color: currentColors.text }]} testID="dashboard-title">LIV One Dashboard</Text>
        <Text style={[styles.subtitle, { color: currentColors.textSecondary }]}>Glassmorphic overview of your health</Text>
      </Animated.View>

      {categories.map((category, idx) => (
        <View key={idx} style={styles.categorySection} testID={`dash-cat-${category.title.toLowerCase().replace(/\s+/g, '-')}`}>
          <LinearGradient
            colors={category.gradient}
            style={styles.categoryHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.categoryHeaderContent}>
              <View style={styles.categoryIcon}>
                <category.icon size={28} color="white" />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.featuresGrid}>
            {category.features.map((feature, fIdx) => (
              <TileCard
                key={`${category.title}-${fIdx}`}
                feature={feature}
                onPress={handlePress}
                text={{ primary: currentColors.text, secondary: currentColors.textSecondary }}
                index={fIdx}
                mount={mount}
              />
            ))}
          </View>
        </View>
      ))}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold" as const,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  categorySection: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  categoryHeader: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  categoryHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: "bold" as const,
    color: "white",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: 'space-between',
  },
  cardOuter: {
    width: cardWidth,
    padding: 1,
    borderRadius: 18,
    marginBottom: 14,
  },
  cardInner: {
    padding: 16,
    borderRadius: 16,
    position: "relative",
    minHeight: 150,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 6,
    lineHeight: 20,
  },
  featureDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 14,
  },
  featureArrow: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  bottomSpacing: {
    height: 20,
  },
});
