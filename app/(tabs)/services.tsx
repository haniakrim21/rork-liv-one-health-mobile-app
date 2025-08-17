import React, { memo, useCallback, useMemo, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Heart,
  Activity,
  Apple,
  Moon,
  Target,
  Dumbbell,
  Brain,
  Stethoscope,
  Scale,
  Timer,
  Zap,
  Smile,
  Wind,
  ChevronRight,
  Thermometer,
  Pill,
  FileText,
  Droplets,
  Leaf,
  Music,
  BookOpen,
  Calendar,
  TrendingUp,
  Award,
  BarChart3,
  Mic,
  Users,
  ShieldCheck,
  ClipboardList,
  Share2,
  Cpu,
  Compass,
  Link,
  Gauge,
  Clock,
  Video,
  Globe,
  Shuffle,
  Bell,
  MessageCircle,
  Building2,
  FlaskConical,
  Scan,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";
import GlassView from "@/components/GlassView";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = 40;
const INTER_ITEM_GAP = 14;
const cardWidth = (width - HORIZONTAL_PADDING - INTER_ITEM_GAP) / 2;

type ServiceFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  comingSoon?: boolean;
};

type ServiceCategory = {
  title: string;
  description: string;
  gradient: readonly [string, string];
  icon: LucideIcon;
  features: ServiceFeature[];
};

const FeatureCard = memo(function FeatureCard({
  feature,
  onPress,
  background,
  text,
  index,
  mount,
}: {
  feature: ServiceFeature;
  onPress: (f: ServiceFeature) => void;
  background: string;
  text: { primary: string; secondary: string };
  index: number;
  mount: Animated.Value;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const elevate = useRef(new Animated.Value(0)).current;
  const appear = useRef(new Animated.Value(0)).current;

  const animateTo = useCallback(
    (to: number) => {
      Animated.timing(scale, { toValue: to, duration: 120, useNativeDriver: false }).start();
      Animated.timing(elevate, { toValue: to === 1 ? 0 : 1, duration: 160, useNativeDriver: false }).start();
    },
    [scale, elevate]
  );

  const shadowStyle = useMemo(
    () => ({
      shadowColor: feature.color,
      shadowOpacity: 0.15,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4 + (Platform.OS === "android" ? 2 : 0),
    }),
    [feature.color]
  );

  useEffect(() => {
    const delay = index * 40;
    Animated.timing(appear, { toValue: 1, duration: 360, delay, useNativeDriver: false }).start();
  }, [appear, index]);

  const translateY = appear.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const combinedScale = useMemo(
    () => Animated.multiply(scale, mount.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] })),
    [scale, mount]
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(feature)}
      onPressIn={() => animateTo(0.98)}
      onPressOut={() => animateTo(1)}
      testID={`feature-${feature.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
    >
      <LinearGradient
        colors={[`${feature.color}55`, `${feature.color}22`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardOuter}
      >
        <Animated.View style={{ transform: [{ scale: combinedScale }, { translateY }], opacity: appear }}>
          <GlassView style={styles.cardInner}>
            <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }, shadowStyle]}> 
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

export default function ServicesScreen() {
  const { theme } = useAppSettings();
  const currentColors = colors[theme];
  const router = useRouter();

  const serviceCategories: ServiceCategory[] = [
    {
      title: "Health",
      description: "Comprehensive healthcare services and monitoring",
      gradient: ["#E91E63", "#C2185B"] as const,
      icon: Heart,
      features: [
        {
          title: "Appointment Booking",
          description: "Book in-clinic, virtual, or cube-based appointments",
          icon: Calendar,
          color: "#E91E63",
        },
        {
          title: "Lifestyle & Health History",
          description: "Collect lifestyle factors and medical history",
          icon: ClipboardList,
          color: "#E91E63",
        },
        {
          title: "Health Passport",
          description: "Unified EHR and comprehensive health records",
          icon: FileText,
          color: "#E91E63",
        },
        {
          title: "Referral System",
          description: "Manual referrals and AI-initiated guidance",
          icon: Share2,
          color: "#E91E63",
        },
        {
          title: "AI Digital Triage",
          description: "AI-powered symptom checker and health assessment",
          icon: Brain,
          color: "#E91E63",
        },
        {
          title: "Virtual Consultations",
          description: "Connect with healthcare providers remotely",
          icon: Stethoscope,
          color: "#E91E63",
        },
        {
          title: "Medication Tracking",
          description: "Track medications with refill reminders",
          icon: Pill,
          color: "#E91E63",
        },
        {
          title: "Check-Up Cubes",
          description: "Smart diagnostic pods for health monitoring",
          icon: Thermometer,
          color: "#E91E63",
        },
        {
          title: "Care Plan Generator",
          description: "Adaptive, condition-aware care planning",
          icon: Target,
          color: "#E91E63",
        },
        {
          title: "AI Navigator",
          description: "Ethical recommendations and guidance",
          icon: Compass,
          color: "#E91E63",
        },
        {
          title: "Remote Patient Monitoring",
          description: "Wearables integrated health tracking",
          icon: Activity,
          color: "#E91E63",
        },
        {
          title: "Digital Twin Modeling",
          description: "Simulate health outcomes and responses",
          icon: Cpu,
          color: "#E91E63",
          comingSoon: true,
        },
        {
          title: "Voice Interfaces",
          description: "Hands-free interactions and dictation",
          icon: Mic,
          color: "#E91E63",
        },
        {
          title: "Family/Co-managed Profiles",
          description: "Manage family members and caregivers",
          icon: Users,
          color: "#E91E63",
        },
        {
          title: "Insurance Integration",
          description: "Verify coverage and streamline claims",
          icon: ShieldCheck,
          color: "#E91E63",
        },
      ],
    },
    {
      title: "Wellness",
      description: "Mental health and holistic well-being support",
      gradient: ["#7B1FA2", "#6A1B9A"] as const,
      icon: Brain,
      features: [
        {
          title: "Personalized Wellness Paths",
          description: "Customized wellness journeys based on your needs",
          icon: Target,
          color: "#7B1FA2",
        },
        {
          title: "AI Mental Health Copilot",
          description: "Intelligent mental health support and guidance",
          icon: Brain,
          color: "#7B1FA2",
        },
        {
          title: "Nutrition & Supplements",
          description: "Personalized nutrition and supplement guidance",
          icon: Apple,
          color: "#7B1FA2",
        },
        {
          title: "Energy Score Tracker",
          description: "Monitor HRV, sleep, and stress for energy optimization",
          icon: Zap,
          color: "#7B1FA2",
        },
        {
          title: "Sleep & Stress Optimization",
          description: "Advanced tools for better sleep and stress management",
          icon: Moon,
          color: "#7B1FA2",
        },
        {
          title: "CBT Nudges",
          description: "Cognitive behavioral nudges and routines",
          icon: Wind,
          color: "#7B1FA2",
        },
        {
          title: "Mood Journaling",
          description: "Advanced mood tracking with sentiment analysis",
          icon: Smile,
          color: "#7B1FA2",
        },
        {
          title: "Habit Builder Engine",
          description: "Build lasting healthy habits with smart nudges",
          icon: TrendingUp,
          color: "#7B1FA2",
        },
        {
          title: "Resilience Score™",
          description: "Track and improve your mental resilience",
          icon: Award,
          color: "#7B1FA2",
        },
        {
          title: "Video Therapy & Circles",
          description: "Professional therapy and group support circles",
          icon: Video,
          color: "#7B1FA2",
        },
        {
          title: "Meditation & Mindfulness",
          description: "Comprehensive library of guided practices",
          icon: BookOpen,
          color: "#7B1FA2",
        },
        {
          title: "Cultural Wellness Models",
          description: "Localized practices and culturally-aware care",
          icon: Globe,
          color: "#7B1FA2",
        },
        {
          title: "Cross-domain Interventions",
          description: "From stress to health consult automatically",
          icon: Shuffle,
          color: "#7B1FA2",
        },
        {
          title: "Proactive Wellness Triggers",
          description: "Timely recommendations and actions",
          icon: Bell,
          color: "#7B1FA2",
        },
      ],
    },
    {
      title: "Fitness",
      description: "AI-powered fitness and performance optimization",
      gradient: ["#00C851", "#00A040"] as const,
      icon: Dumbbell,
      features: [
        {
          title: "AI Dynamic Training Plans",
          description: "Personalized workout plans that adapt to your progress",
          icon: Brain,
          color: "#00C851",
        },
        {
          title: "Adaptive Workouts",
          description: "Biometric-based workout adjustments in real-time",
          icon: Activity,
          color: "#00C851",
        },
        {
          title: "Readiness & Strain Scores",
          description: "Daily readiness assessment and strain monitoring",
          icon: BarChart3,
          color: "#00C851",
        },
        {
          title: "Fitness-for-Health Protocols",
          description: "Specialized programs for rehab and chronic conditions",
          icon: Heart,
          color: "#00C851",
        },
        {
          title: "Computer Vision Feedback",
          description: "AI-powered form and posture correction",
          icon: Scan,
          color: "#00C851",
        },
        {
          title: "Fitness Assessment Engine",
          description: "Comprehensive fitness testing and evaluation",
          icon: Gauge,
          color: "#00C851",
        },
        {
          title: "Contextual Programming",
          description: "Adapts to time, location, and fatigue",
          icon: Clock,
          color: "#00C851",
        },
        {
          title: "Nutrition & Hydration Sync",
          description: "Syncs meals and water with training",
          icon: Droplets,
          color: "#00C851",
        },
        {
          title: "Group Virtual Training",
          description: "Join live group fitness sessions and classes",
          icon: Users,
          color: "#00C851",
        },
        {
          title: "Personal Trainer Experience",
          description: "Virtual personal training with expert guidance",
          icon: Dumbbell,
          color: "#00C851",
        },
        {
          title: "Trainer Empowerment",
          description: "Certification and coaching tools",
          icon: Award,
          color: "#00C851",
        },
        {
          title: "Gamified Challenges",
          description: "Engaging challenges and leaderboards",
          icon: Award,
          color: "#00C851",
        },
        {
          title: "Daily Check-ins",
          description: "Performance nudges and daily wellness check-ins",
          icon: TrendingUp,
          color: "#00C851",
        },
      ],
    },
    {
      title: "Experience Engine",
      description: "Intelligent landing and proactive guidance",
      gradient: ["#1976D2", "#1565C0"] as const,
      icon: Compass,
      features: [
        { title: "Hyper-personalized Dashboard", description: "Your data, prioritized and contextual.", icon: Compass, color: "#1976D2" },
        { title: "Contextual Awareness Engine", description: "Aggregates 6+ data sources for insights.", icon: Link, color: "#1976D2" },
        { title: "Priority Engine", description: "Balances urgency, readiness, and value.", icon: Gauge, color: "#1976D2" },
        { title: "Behavioral Resonance", description: "Adapts tone and content to you.", icon: MessageCircle, color: "#1976D2" },
        { title: "Trigger Micro-journeys", description: "Stress → breathing → therapist.", icon: Bell, color: "#1976D2" },
        { title: "Cross-domain Transitions", description: "Fitness ↔ health ↔ wellness.", icon: Shuffle, color: "#1976D2" },
        { title: "Predictive Insights", description: "Missed med + BP rise alerts.", icon: Zap, color: "#1976D2" },
        { title: "Nudges & Celebrations", description: "Motivating prompts and rewards.", icon: Award, color: "#1976D2" },
        { title: "Conversational Onboarding", description: "Guided, gamified setup.", icon: MessageCircle, color: "#1976D2" },
        { title: "Intelligent Goal Detection", description: "Declared vs observed goals.", icon: Target, color: "#1976D2" },
      ],
    },
    {
      title: "Onboarding & Profile",
      description: "Identity, payments, and health profile",
      gradient: ["#FF6F00", "#E65100"] as const,
      icon: ClipboardList,
      features: [
        { title: "Phone OTP & ID", description: "Secure verification.", icon: ShieldCheck, color: "#FF6F00" },
        { title: "Google & Email Magic Link", description: "Fast sign-up options.", icon: Link, color: "#FF6F00" },
        { title: "Basic vs Premium", description: "Clear membership tiers.", icon: Award, color: "#FF6F00" },
        { title: "Monthly Membership", description: "Flexible paid plans.", icon: Award, color: "#FF6F00" },
        { title: "Trust Signals", description: "Badges and guarantees at checkout.", icon: ShieldCheck, color: "#FF6F00" },
        { title: "Saudi Payments", description: "Local gateway integration.", icon: ShieldCheck, color: "#FF6F00" },
        { title: "7-day Premium Trial", description: "Try before you pay.", icon: Award, color: "#FF6F00" },
        { title: "Data Confirmation", description: "E.g., Absher sync.", icon: ClipboardList, color: "#FF6F00" },
        { title: "Body & Composition", description: "Body metrics and optional tests.", icon: Scale, color: "#FF6F00" },
        { title: "Behavioral Profiling", description: "Sleep, diet, alcohol, more.", icon: Brain, color: "#FF6F00" },
        { title: "Medical Flags & HRS", description: "Health record sync.", icon: FileText, color: "#FF6F00" },
        { title: "Fitness & Mobility", description: "Baseline assessments.", icon: Gauge, color: "#FF6F00" },
        { title: "Goals & Motivation", description: "Weight, energy, stress.", icon: Target, color: "#FF6F00" },
        { title: "Wearables Sync", description: "Connect devices and apps.", icon: Link, color: "#FF6F00" },
        { title: "Emergency/Caregiver", description: "Shared access options.", icon: Users, color: "#FF6F00" },
      ],
    },
    {
      title: "CX & Gamification",
      description: "Delightful support and engagement loops",
      gradient: ["#26A69A", "#00897B"] as const,
      icon: MessageCircle,
      features: [
        { title: "Live Chat & Social", description: "Connect and get help fast.", icon: MessageCircle, color: "#26A69A" },
        { title: "CX Metrics", description: "CSAT, churn, activation.", icon: BarChart3, color: "#26A69A" },
        { title: "Lab + AI Interpretation", description: "Understand your results.", icon: FlaskConical, color: "#26A69A" },
        { title: "Unified Visit History", description: "Follow-ups in one place.", icon: FileText, color: "#26A69A" },
        { title: "Loyalty & Gamification", description: "Earn, redeem, advance.", icon: Award, color: "#26A69A" },
        { title: "Appointments/Day", description: "Track operational capacity.", icon: Calendar, color: "#26A69A" },
        { title: "Ratings & Reviews", description: "Strive for 4.5+.", icon: Award, color: "#26A69A" },
        { title: "Stickiness/Activation", description: "Measure and improve.", icon: Gauge, color: "#26A69A" },
        { title: "Feature Adoption", description: "% using ≥3 modules.", icon: BarChart3, color: "#26A69A" },
      ],
    },
    {
      title: "Cross-Cutting Infra",
      description: "Secure, integrated, omnichannel foundation",
      gradient: ["#9C27B0", "#7B1FA2"] as const,
      icon: ShieldCheck,
      features: [
        { title: "Secure Messaging", description: "Encrypted chats with doctors.", icon: ShieldCheck, color: "#9C27B0" },
        { title: "Preventive Care", description: "Vaccines and screenings.", icon: ShieldCheck, color: "#9C27B0" },
        { title: "National Health Sync", description: "Integrate with systems.", icon: Link, color: "#9C27B0" },
        { title: "Omnichannel Continuity", description: "Phone, cube, home, app.", icon: Link, color: "#9C27B0" },
        { title: "Full-service Integration", description: "Physical + digital.", icon: Link, color: "#9C27B0" },
        { title: "Real-time AI Loops", description: "Continuous learning.", icon: Zap, color: "#9C27B0", comingSoon: true }
      ],
    },
    {
      title: "Physical Services",
      description: "Partners and in-person enablement",
      gradient: ["#FF4081", "#F50057"] as const,
      icon: Building2,
      features: [
        { title: "Clinics & Hospitals", description: "Partnered care network.", icon: Building2, color: "#FF4081" },
        { title: "Health Kiosks", description: "Malls and offices.", icon: Scan, color: "#FF4081" },
        { title: "Labs & Imaging", description: "Diagnostics network.", icon: FlaskConical, color: "#FF4081" },
        { title: "Follow-up & Recovery", description: "Care continuity.", icon: Calendar, color: "#FF4081" },
        { title: "Mental Health Clinics", description: "In-person therapy.", icon: Brain, color: "#FF4081" },
        { title: "Group Classes", description: "Yoga, meditation, nutrition.", icon: Users, color: "#FF4081" },
        { title: "Retreats & VR Lounges", description: "Immersive wellness.", icon: Video, color: "#FF4081" },
        { title: "Workplace Wellness", description: "Onsite programs.", icon: Building2, color: "#FF4081" },
        { title: "Gyms & Trainers", description: "Fitness partners.", icon: Dumbbell, color: "#FF4081" },
        { title: "Rehab Programs", description: "Physiotherapist-led.", icon: Heart, color: "#FF4081" },
        { title: "Community Events", description: "Bootcamps and runs.", icon: Users, color: "#FF4081" },
        { title: "Smart Fitness Kiosks", description: "Self-serve stations.", icon: Scan, color: "#FF4081" },
        { title: "Sports Clinics", description: "VO₂ max, gait.", icon: Activity, color: "#FF4081" },
      ],
    },
    {
      title: "AI & System Intelligence",
      description: "Adaptive, outcome-linked assistance",
      gradient: ["#00BCD4", "#0097A7"] as const,
      icon: Brain,
      features: [
        { title: "AI Nudges", description: "Micro-wins and timely prompts.", icon: Bell, color: "#00BCD4" },
        { title: "Time-based Hooks", description: "Wake-up, post-work, bedtime.", icon: Clock, color: "#00BCD4" },
        { title: "Emotional Fit Detection", description: "Clinical vs gamified tone.", icon: MessageCircle, color: "#00BCD4" },
        { title: "System State Adaptation", description: "Holidays, sleep windows.", icon: Gauge, color: "#00BCD4" },
        { title: "Dropout & Win-back", description: "Detect and recover users.", icon: Target, color: "#00BCD4" },
        { title: "Outcome-linked Feedback", description: "E.g., improved HRV.", icon: Zap, color: "#00BCD4" },
      ],
    },
  ];

  const toSlug = useCallback(
    (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    []
  );

  const handleFeaturePress = useCallback(
    (feature: ServiceFeature) => {
      console.log("[Services] Feature pressed:", feature.title);
      if (feature.comingSoon) {
        console.log(`${feature.title} - Coming Soon!`);
        return;
      }
      const slug = toSlug(feature.title);
      try {
        router.push({ pathname: "/(tabs)/feature/[slug]", params: { slug } });
      } catch (e) {
        console.log("[Services] Navigation error", e);
      }
    },
    [router, toSlug]
  );

  const mount = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(mount, { toValue: 1, duration: 500, useNativeDriver: false }).start();
  }, [mount]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentColors.background }]}
      showsVerticalScrollIndicator={false}
      testID="services-scroll"
    >
      <Animated.View
        style={[
          styles.header,
          { opacity: mount, transform: [{ translateY: mount.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] },
        ]}
      >
        <Text style={[styles.title, { color: currentColors.text }]} testID="services-title">
          LIV One Services
        </Text>
        <Text style={[styles.subtitle, { color: currentColors.textSecondary }]}> 
          Comprehensive health, wellness, and fitness solutions
        </Text>
      </Animated.View>

      {serviceCategories.map((category, categoryIndex) => (
        <View key={categoryIndex} style={styles.categorySection} testID={`category-${category.title.toLowerCase().replace(/\s+/g, '-')}`}>
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
                <Text style={styles.categoryDescription}>
                  {category.description}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.featuresGrid}>
            {category.features.map((feature, featureIndex) => (
              <FeatureCard
                key={`${category.title}-${featureIndex}`}
                feature={feature}
                onPress={handleFeaturePress}
                background={currentColors.card}
                text={{ primary: currentColors.text, secondary: currentColors.textSecondary }}
                index={featureIndex}
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
    justifyContent: "space-between",
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
  comingSoonCard: {
    opacity: 0.7,
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
    alignSelf: "flex-start",
    backgroundColor: "#FF9800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 10,
    color: "white",
    fontWeight: "600" as const,
    letterSpacing: 0.3,
  },
  bottomSpacing: {
    height: 20,
  },
});
