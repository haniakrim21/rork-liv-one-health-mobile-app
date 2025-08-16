import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { Activity, Flame, Moon, Droplets, Heart, TrendingUp, Apple } from "lucide-react-native";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { useHealthData } from "@/providers/HealthDataProvider";
import { colors } from "@/constants/colors";
import AnimatedPressable from "@/components/AnimatedPressable";
import { MOCK_PHOTOS, MOCK_VIDEOS } from "@/constants/mockMedia";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function DashboardScreen() {
  const { theme } = useAppSettings();
  const { dailyStats } = useHealthData();
  const currentColors = colors[theme];

  const mount = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const carouselX = useRef(new Animated.Value(0)).current;
  const heroVideo = MOCK_VIDEOS[0];
  const player = useVideoPlayer(
    heroVideo.url,
    (p) => {
      p.loop = true;
      p.muted = true;
      try { p.play(); } catch (e) { console.log('[Video] play() error', e); }
    }
  );

  useEffect(() => {
    Animated.timing(mount, { toValue: 1, duration: 650, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [mount]);

  const headerTranslate = mount.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
  const headerOpacity = mount;
  const headerScale = scrollY.interpolate({ inputRange: [0, 120], outputRange: [1, 0.96], extrapolate: 'clamp' });
  const headerGradientOpacity = scrollY.interpolate({ inputRange: [0, 120], outputRange: [1, 0.6], extrapolate: 'clamp' });

  const statsCards = [
    {
      title: "Steps",
      value: dailyStats.steps.toLocaleString(),
      target: "10,000",
      icon: Activity,
      gradient: ["#00C851", "#00A040"] as const,
      progress: dailyStats.steps / 10000,
    },
    {
      title: "Calories",
      value: dailyStats.calories.toString(),
      target: "2,000",
      icon: Flame,
      gradient: ["#FF6F00", "#E65100"] as const,
      progress: dailyStats.calories / 2000,
    },
    {
      title: "Sleep",
      value: `${dailyStats.sleep}h`,
      target: "8h",
      icon: Moon,
      gradient: ["#7B1FA2", "#6A1B9A"] as const,
      progress: dailyStats.sleep / 8,
    },
    {
      title: "Water",
      value: `${dailyStats.water}`,
      target: "8",
      icon: Droplets,
      gradient: ["#1976D2", "#1565C0"] as const,
      progress: dailyStats.water / 8,
    },
  ];

  const quickActions = [
    { title: "Log Workout", icon: Activity, color: "#00C851" },
    { title: "Add Meal", icon: Apple, color: "#FF6F00" },
    { title: "Track Sleep", icon: Moon, color: "#7B1FA2" },
    { title: "Check Heart", icon: Heart, color: "#E91E63" },
  ];

  const galleryImages = MOCK_PHOTOS.slice(0, 8).map((p) => p.url);

  return (
    <Animated.ScrollView
      style={[styles.container, { backgroundColor: currentColors.background }]}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: Platform.OS !== 'web' })}
      testID="dashboard-scroll"
    >
      <Animated.View style={[styles.heroWrapper, { transform: [{ scale: headerScale }] }]}> 
        <View style={styles.heroMedia}>
          <VideoView
            player={player}
            style={styles.video}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            contentFit="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.55)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.overlay}
          />
          <Animated.View style={[styles.heroContent, { opacity: Animated.multiply(headerOpacity, headerGradientOpacity), transform: [{ translateY: headerTranslate }] }]}> 
            <Text style={[styles.kicker]}>Welcome back</Text>
            <Text style={styles.heroTitle}>Your Personalized Health Hub</Text>
            <Text style={styles.heroSub}>Insights, coaching, and actions tailored to you</Text>
          </Animated.View>
        </View>
      </Animated.View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Featured Programs</Text>
        <Animated.ScrollView
          horizontal
          pagingEnabled
          snapToInterval={width * 0.8}
          decelerationRate={Platform.OS === 'ios' ? 0 : 0.98}
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: carouselX } } }], { useNativeDriver: Platform.OS !== 'web' })}
          scrollEventThrottle={16}
          contentContainerStyle={styles.carouselContainer}
          testID="featured-carousel"
        >
          {galleryImages.map((uri, i) => {
            const inputRange = [(i - 1) * width * 0.8, i * width * 0.8, (i + 1) * width * 0.8];
            const scale = carouselX.interpolate({ inputRange, outputRange: [0.92, 1, 0.92], extrapolate: 'clamp' });
            const opacity = carouselX.interpolate({ inputRange, outputRange: [0.6, 1, 0.6], extrapolate: 'clamp' });
            return (
              <AnimatedPressable
                key={uri}
                style={[styles.cardLarge, { transform: [{ scale }], opacity }]}
                onPress={() => console.log('[Dashboard] Open program', uri)}
                testID={`program-${i}`}
              >
                <Image source={{ uri }} style={styles.cardImage} contentFit="cover" transition={250} />
                <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.65)"]} style={styles.cardGradient} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
                <View style={styles.cardTextWrap}>
                  <Text style={styles.cardTitle}>Elevate Program</Text>
                  <Text style={styles.cardSubtitle}>4-week guided plan</Text>
                </View>
              </AnimatedPressable>
            );
          })}
        </Animated.ScrollView>
      </View>

      <Animated.View style={[styles.statsGrid, { opacity: mount, transform: [{ translateY: mount.interpolate({ inputRange: [0,1], outputRange: [16,0] }) }] }]}>
        {statsCards.map((card, index) => (
          <AnimatedPressable
            key={index}
            style={[styles.statCard, { backgroundColor: currentColors.card, transform: [{ translateY: mount.interpolate({ inputRange: [0,1], outputRange: [12 + index * 2, 0] }) }] }]}
            testID={`stat-card-${card.title.toLowerCase()}`}
            onPress={() => console.log(`[Dashboard] Pressed ${card.title}`)}
          >
            <LinearGradient
              colors={card.gradient}
              style={styles.iconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <card.icon size={24} color="white" />
            </LinearGradient>
            <Text style={[styles.statTitle, { color: currentColors.textSecondary }]}>
              {card.title}
            </Text>
            <Text style={[styles.statValue, { color: currentColors.text }]}>
              {card.value}
            </Text>
            <Text style={[styles.statTarget, { color: currentColors.textSecondary }]}>
              of {card.target}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: currentColors.border }]}>
              <Animated.View
                style={{
                  height: "100%",
                  width: "100%",
                  transform: [
                    {
                      scaleX: mount.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.min(card.progress, 1)],
                      }),
                    },
                  ],
                  backgroundColor: card.gradient[0],
                  borderRadius: 2,
                }}
              />
            </View>
          </AnimatedPressable>
        ))}
      </Animated.View>

      <View style={styles.sectionAlt}>
        <AnimatedPressable
          style={[styles.insightCard, { backgroundColor: currentColors.card, transform: [{ translateY: mount.interpolate({ inputRange: [0,1], outputRange: [24,0] }) }], opacity: mount }]}
          onPress={() => console.log('[Dashboard] Pressed Weekly Progress')}
          testID="weekly-progress"
        >
          <LinearGradient
            colors={["#00C851", "#1976D2"] as const}
            style={styles.insightGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TrendingUp size={24} color="white" />
          </LinearGradient>
          <View style={styles.insightContent}>
            <Text style={[styles.insightTitle, { color: currentColors.text }]}>Weekly Progress</Text>
            <Text style={[styles.insightText, { color: currentColors.textSecondary }]}>You're 15% more active than last week!</Text>
          </View>
        </AnimatedPressable>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Quick Actions</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsContainer}
        >
          {quickActions.map((action, index) => (
            <AnimatedPressable
              key={index}
              style={[styles.quickAction, { backgroundColor: currentColors.card, transform: [{ translateY: mount.interpolate({ inputRange: [0,1], outputRange: [20,0] }) }], opacity: mount }]}
              testID={`quick-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
              onPress={() => console.log(`[Dashboard] Quick action: ${action.title}`)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                <action.icon size={24} color={action.color} />
              </View>
              <Text style={[styles.quickActionText, { color: currentColors.text }]}>{action.title}</Text>
            </AnimatedPressable>
          ))}
        </ScrollView>
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroWrapper: { paddingHorizontal: 16, paddingTop: 16 },
  heroMedia: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 240,
    backgroundColor: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  video: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject },
  heroContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
  },
  kicker: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginBottom: 8 },
  heroTitle: { color: 'white', fontSize: 28, fontWeight: 'bold' as const },
  heroSub: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 4 },

  section: { marginTop: 28, paddingHorizontal: 16 },
  sectionAlt: { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '600' as const, marginBottom: 16 },

  carouselContainer: { paddingHorizontal: 4 },
  cardLarge: {
    width: width * 0.8,
    height: 200,
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#0B1220',
  },
  cardImage: { width: '100%', height: '100%' },
  cardGradient: { ...StyleSheet.absoluteFillObject },
  cardTextWrap: { position: 'absolute', left: 16, right: 16, bottom: 14 },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: '700' as const },
  cardSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
    marginTop: 20,
  },
  statCard: {
    width: cardWidth,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: { fontSize: 12, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 'bold' as const, marginBottom: 2 },
  statTarget: { fontSize: 12, marginBottom: 8 },
  progressBar: { height: 4, borderRadius: 2, overflow: 'hidden' },

  quickActionsContainer: { paddingRight: 16, gap: 12 },
  quickAction: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: { fontSize: 12, textAlign: 'center' },

  insightCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  insightContent: { flex: 1 },
  insightTitle: { fontSize: 16, fontWeight: '600' as const, marginBottom: 4 },
  insightText: { fontSize: 14 },
});