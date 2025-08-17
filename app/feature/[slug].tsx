import React, { useMemo, useState, useCallback } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Sparkles, Calendar, Video, ClipboardList, Stethoscope, Brain, ShieldCheck, Link, Pill, Plus, Mic, Gauge, MessageCircle, Bell, Shuffle, Zap, Target, Users, Award, BarChart3, FlaskConical, FileText, Scan, Building2, Activity, Droplets, Dumbbell, Clock, Scale, Compass, Heart } from "lucide-react-native";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";
import GlassView from "@/components/GlassView";

function toTitle(slug: string): string {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

type ActionItem = { key: string; title: string; subtitle: string; icon: React.ReactNode };

export default function FeatureDetailsScreen() {
  const { slug: raw } = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "feature";
  const title = useMemo(() => toTitle(slug), [slug]);

  const { theme } = useAppSettings();
  const palette = colors[theme];
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const actions: ActionItem[] = useMemo(() => {
    if (slug === "appointment-booking") {
      return [
        { key: "book-virtual", title: "Book Virtual Visit", subtitle: "Video in 15 min", icon: <Video size={18} color={palette.primary} /> },
        { key: "book-inclinic", title: "Book In-Clinic", subtitle: "Nearest location", icon: <Calendar size={18} color={palette.primary} /> },
        { key: "bring-records", title: "Attach Health History", subtitle: "Speed up your visit", icon: <ClipboardList size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "lifestyle-health-history") {
      return [
        { key: "start-history", title: "Start Health History", subtitle: "Takes ~4 minutes", icon: <ClipboardList size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "virtual-consultations") {
      return [
        { key: "new-video", title: "Start New Video Call", subtitle: "Connect securely", icon: <Video size={18} color={palette.primary} /> },
        { key: "choose-specialty", title: "Choose Specialty", subtitle: "Find the right expert", icon: <Stethoscope size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "ai-digital-triage") {
      return [
        { key: "start-triage", title: "Start Symptom Check", subtitle: "Takes ~3 minutes", icon: <Brain size={18} color={palette.primary} /> },
        { key: "privacy", title: "Privacy & Safety", subtitle: "Your data is protected", icon: <ShieldCheck size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "medication-tracking") {
      return [
        { key: "add-med", title: "Add Medication", subtitle: "Name, dose, schedule", icon: <Plus size={18} color={palette.primary} /> },
        { key: "view-meds", title: "View Medications", subtitle: "Your current list", icon: <Pill size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "health-passport") {
      return [
        { key: "view-passport", title: "Open Health Passport", subtitle: "EHR and lab results", icon: <ClipboardList size={18} color={palette.primary} /> },
        { key: "share-records", title: "Share Records", subtitle: "Secure link or QR", icon: <Link size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "referral-system") {
      return [
        { key: "new-referral", title: "Create Referral", subtitle: "To specialist or clinic", icon: <Stethoscope size={18} color={palette.primary} /> },
        { key: "view-referrals", title: "View Referrals", subtitle: "Pending and past", icon: <ClipboardList size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "care-plan-generator") {
      return [
        { key: "new-plan", title: "Generate Care Plan", subtitle: "Personalized steps", icon: <Brain size={18} color={palette.primary} /> },
        { key: "view-plans", title: "View Plans", subtitle: "Active and completed", icon: <ClipboardList size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "ai-navigator") {
      return [
        { key: "ask-ai", title: "Ask Navigator", subtitle: "Guidance and next steps", icon: <Brain size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "remote-patient-monitoring") {
      return [
        { key: "connect-device", title: "Connect Wearable", subtitle: "Apple/Google/others", icon: <Link size={18} color={palette.primary} /> },
        { key: "view-trends", title: "View Trends", subtitle: "Vitals and activity", icon: <Calendar size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "voice-interfaces") {
      return [
        { key: "start-voice", title: "Start Dictation", subtitle: "Hands-free notes", icon: <Mic size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "family-co-managed-profiles") {
      return [
        { key: "add-member", title: "Add Family Member", subtitle: "Invite or create", icon: <Plus size={18} color={palette.primary} /> },
        { key: "manage-access", title: "Manage Access", subtitle: "Permissions and sharing", icon: <ShieldCheck size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "insurance-integration") {
      return [
        { key: "verify-coverage", title: "Verify Coverage", subtitle: "Connect insurer", icon: <ShieldCheck size={18} color={palette.primary} /> },
      ];
    }
    // Wellness
    if (slug === "personalized-wellness-paths") {
      return [
        { key: "start-path", title: "Start My Path", subtitle: "Quick intake", icon: <Sparkles size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "ai-mental-health-copilot") {
      return [
        { key: "open-copilot", title: "Open Copilot", subtitle: "Chat privately", icon: <Brain size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "nutrition-supplements") {
      return [
        { key: "open-meds", title: "Manage Supplements", subtitle: "Track and reminders", icon: <Pill size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "energy-score-tracker") {
      return [
        { key: "view-energy", title: "View Energy Score", subtitle: "HRV, sleep, stress", icon: <Sparkles size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "sleep-stress-optimization") {
      return [
        { key: "sleep-tools", title: "Open Sleep Tools", subtitle: "Wind down, CBT-i", icon: <Sparkles size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "cbt-nudges") {
      return [
        { key: "open-nudges", title: "Enable Nudges", subtitle: "Daily CBT nudges", icon: <Sparkles size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "mood-journaling") {
      return [
        { key: "new-entry", title: "New Mood Entry", subtitle: "2-min check-in", icon: <Sparkles size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "habit-builder-engine") {
      return [
        { key: "create-habit", title: "Create Habit", subtitle: "Stack and reminders", icon: <Sparkles size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "resilience-score") {
      return [
        { key: "view-resilience", title: "View Resilience Score", subtitle: "Weekly trend", icon: <ShieldCheck size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "video-therapy-circles") {
      return [
        { key: "find-therapist", title: "Find Therapist", subtitle: "Licensed providers", icon: <Stethoscope size={18} color={palette.primary} /> },
        { key: "join-circle", title: "Join Circle", subtitle: "Peer support", icon: <Video size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "meditation-mindfulness") {
      return [
        { key: "start-meditation", title: "Start Meditation", subtitle: "5–20 min sessions", icon: <Video size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "cultural-wellness-models") {
      return [
        { key: "browse-practices", title: "Browse Practices", subtitle: "Localized content", icon: <Sparkles size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "cross-domain-interventions") {
      return [
        { key: "start-intervention", title: "Start Intervention", subtitle: "From stress → care", icon: <Sparkles size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "proactive-wellness-triggers") {
      return [
        { key: "enable-triggers", title: "Enable Triggers", subtitle: "Timely prompts", icon: <Sparkles size={18} color={palette.primary} /> },
      ];
    }
    // Fitness
    if (slug === "ai-dynamic-training-plans") {
      return [
        { key: "build-plan", title: "Build Training Plan", subtitle: "Personalized", icon: <Brain size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "adaptive-workouts") {
      return [
        { key: "start-workout", title: "Start Adaptive Workout", subtitle: "Real-time guidance", icon: <Activity size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "readiness-strain-scores") {
      return [
        { key: "view-readiness", title: "View Readiness", subtitle: "Daily score", icon: <Gauge size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "fitness-for-health-protocols") {
      return [
        { key: "open-protocols", title: "Open Protocols", subtitle: "Rehab/chronic", icon: <Heart size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "computer-vision-feedback") {
      return [
        { key: "start-cv", title: "Start Form Check", subtitle: "Camera guidance", icon: <Scan size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "fitness-assessment-engine") {
      return [
        { key: "start-assessment", title: "Start Assessment", subtitle: "Strength, VO2, more", icon: <Gauge size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "contextual-programming") {
      return [
        { key: "set-context", title: "Set Context", subtitle: "Time/location fatigue", icon: <Clock size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "nutrition-hydration-sync") {
      return [
        { key: "log-hydration", title: "Log Hydration", subtitle: "Water with training", icon: <Droplets size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "group-virtual-training") {
      return [
        { key: "join-class", title: "Join Group Class", subtitle: "Live session", icon: <Users size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "personal-trainer-experience") {
      return [
        { key: "open-trainer", title: "Open Trainer", subtitle: "1:1 guidance", icon: <Dumbbell size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "trainer-empowerment") {
      return [
        { key: "coach-tools", title: "Coach Tools", subtitle: "Certs & coaching", icon: <Award size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "gamified-challenges") {
      return [
        { key: "view-challenges", title: "View Challenges", subtitle: "Leaderboards", icon: <Award size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "daily-check-ins") {
      return [
        { key: "daily-checkin", title: "Daily Check-in", subtitle: "Quick pulse", icon: <Calendar size={18} color={palette.primary} /> },
      ];
    }
    // Experience Engine
    if (slug === "hyper-personalized-dashboard") {
      return [
        { key: "open-dashboard", title: "Open Dashboard", subtitle: "Personalized view", icon: <Compass size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "contextual-awareness-engine") {
      return [
        { key: "connect-sources", title: "Connect Data Sources", subtitle: "6+ integrations", icon: <Link size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "priority-engine") {
      return [
        { key: "view-priorities", title: "View Priorities", subtitle: "What matters now", icon: <Gauge size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "behavioral-resonance") {
      return [
        { key: "tune-tone", title: "Tune Tone", subtitle: "Match your style", icon: <MessageCircle size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "trigger-micro-journeys") {
      return [
        { key: "configure-triggers", title: "Configure Triggers", subtitle: "Stress → action", icon: <Bell size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "cross-domain-transitions") {
      return [
        { key: "switch-contexts", title: "Switch Contexts", subtitle: "Fitness ↔ health", icon: <Shuffle size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "predictive-insights") {
      return [
        { key: "view-insights", title: "View Insights", subtitle: "What's next", icon: <Zap size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "nudges-celebrations") {
      return [
        { key: "enable-nudges", title: "Enable Nudges", subtitle: "Celebrate wins", icon: <Award size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "conversational-onboarding") {
      return [
        { key: "start-onboarding", title: "Start Onboarding", subtitle: "Guided setup", icon: <MessageCircle size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "intelligent-goal-detection") {
      return [
        { key: "detect-goals", title: "Detect Goals", subtitle: "Declared vs observed", icon: <Target size={18} color={palette.primary} /> },
      ];
    }
    // Onboarding & Profile
    if (slug === "phone-otp-id") {
      return [
        { key: "verify-phone", title: "Verify Phone", subtitle: "Secure OTP", icon: <ShieldCheck size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "google-email-magic-link") {
      return [
        { key: "send-magic", title: "Send Magic Link", subtitle: "Email sign-in", icon: <Link size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "basic-vs-premium") {
      return [
        { key: "compare-plans", title: "Compare Plans", subtitle: "Choose tier", icon: <Award size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "monthly-membership") {
      return [
        { key: "start-membership", title: "Start Membership", subtitle: "Subscribe", icon: <Award size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "trust-signals") {
      return [
        { key: "view-trust", title: "View Trust Signals", subtitle: "Badges & guarantees", icon: <ShieldCheck size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "saudi-payments") {
      return [
        { key: "connect-payments", title: "Connect Payments", subtitle: "Local gateway", icon: <Link size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "7-day-premium-trial") {
      return [
        { key: "start-trial", title: "Start 7-day Trial", subtitle: "Premium access", icon: <Award size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "data-confirmation") {
      return [
        { key: "confirm-data", title: "Confirm Data", subtitle: "Sync records", icon: <ClipboardList size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "body-composition") {
      return [
        { key: "enter-body", title: "Enter Body Data", subtitle: "Weight, BF%", icon: <Scale size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "behavioral-profiling") {
      return [
        { key: "start-profile", title: "Start Profiling", subtitle: "Sleep, diet, more", icon: <Brain size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "medical-flags-hrs") {
      return [
        { key: "sync-hrs", title: "Sync Health Records", subtitle: "Flags & HRS", icon: <FileText size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "fitness-mobility") {
      return [
        { key: "baseline", title: "Baseline Fitness", subtitle: "Mobility tests", icon: <Gauge size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "goals-motivation") {
      return [
        { key: "set-goals", title: "Set Goals", subtitle: "What you want", icon: <Target size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "wearables-sync") {
      return [
        { key: "connect-wearables", title: "Connect Wearables", subtitle: "Apple/Google", icon: <Link size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "emergency-caregiver") {
      return [
        { key: "manage-caregivers", title: "Manage Caregivers", subtitle: "Family access", icon: <Users size={18} color={palette.primary} /> },
      ];
    }
    // CX & Gamification
    if (slug === "live-chat-social") {
      return [
        { key: "open-chat", title: "Open Chat", subtitle: "Get help", icon: <MessageCircle size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "cx-metrics") {
      return [
        { key: "view-metrics", title: "View CX Metrics", subtitle: "CSAT & churn", icon: <BarChart3 size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "lab-ai-interpretation") {
      return [
        { key: "interpret-labs", title: "Interpret Labs", subtitle: "AI assist", icon: <FlaskConical size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "unified-visit-history") {
      return [
        { key: "open-history", title: "Open Visit History", subtitle: "All follow-ups", icon: <FileText size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "loyalty-gamification") {
      return [
        { key: "view-loyalty", title: "View Loyalty", subtitle: "Earn & redeem", icon: <Award size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "appointments-day") {
      return [
        { key: "capacity", title: "View Capacity", subtitle: "Operational load", icon: <Calendar size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "ratings-reviews") {
      return [
        { key: "view-ratings", title: "View Ratings", subtitle: "Aim 4.5+", icon: <Award size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "stickiness-activation") {
      return [
        { key: "view-activation", title: "View Activation", subtitle: "% using ≥3 modules", icon: <Gauge size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "feature-adoption") {
      return [
        { key: "view-adoption", title: "View Feature Adoption", subtitle: "Trends", icon: <BarChart3 size={18} color={palette.primary} /> },
      ];
    }
    // Cross-Cutting Infra
    if (slug === "secure-messaging") {
      return [
        { key: "open-secure-chat", title: "Open Secure Chat", subtitle: "Encrypted", icon: <ShieldCheck size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "preventive-care") {
      return [
        { key: "view-preventive", title: "View Preventive Care", subtitle: "Vaccines & screens", icon: <Calendar size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "national-health-sync") {
      return [
        { key: "connect-national", title: "Connect National Systems", subtitle: "Integrations", icon: <Link size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "omnichannel-continuity") {
      return [
        { key: "manage-channels", title: "Manage Channels", subtitle: "Phone, cube, home", icon: <Link size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "full-service-integration") {
      return [
        { key: "integrate", title: "Integrate Services", subtitle: "Physical + digital", icon: <Link size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "real-time-ai-loops") {
      return [
        { key: "enable-loops", title: "Enable AI Loops", subtitle: "Continuous learning", icon: <Zap size={18} color={palette.primary} /> },
      ];
    }
    // Physical Services
    if (slug === "clinics-hospitals") {
      return [
        { key: "find-clinic", title: "Find Clinic", subtitle: "Partner network", icon: <Building2 size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "health-kiosks") {
      return [
        { key: "find-kiosk", title: "Find Kiosk", subtitle: "Malls/offices", icon: <Scan size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "labs-imaging") {
      return [
        { key: "find-lab", title: "Find Lab", subtitle: "Diagnostics network", icon: <FlaskConical size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "follow-up-recovery") {
      return [
        { key: "schedule-followup", title: "Schedule Follow-up", subtitle: "Care continuity", icon: <Calendar size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "mental-health-clinics") {
      return [
        { key: "find-mental-clinic", title: "Find Mental Health Clinic", subtitle: "Therapy", icon: <Brain size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "group-classes") {
      return [
        { key: "browse-classes", title: "Browse Classes", subtitle: "Yoga, meditation", icon: <Users size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "retreats-vr-lounges") {
      return [
        { key: "explore-retreats", title: "Explore Retreats", subtitle: "Immersive wellness", icon: <Video size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "workplace-wellness") {
      return [
        { key: "enterprise", title: "Enterprise Programs", subtitle: "Onsite options", icon: <Building2 size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "gyms-trainers") {
      return [
        { key: "find-gym", title: "Find Gym/Trainer", subtitle: "Partners", icon: <Dumbbell size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "rehab-programs") {
      return [
        { key: "find-rehab", title: "Find Rehab", subtitle: "Physiotherapist-led", icon: <Heart size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "community-events") {
      return [
        { key: "events", title: "Community Events", subtitle: "Bootcamps & runs", icon: <Users size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "smart-fitness-kiosks") {
      return [
        { key: "smart-kiosks", title: "Smart Fitness Kiosks", subtitle: "Self-serve", icon: <Scan size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "sports-clinics") {
      return [
        { key: "sports-clinic", title: "Sports Clinics", subtitle: "VO₂ max, gait", icon: <Activity size={18} color={palette.primary} /> },
      ];
    }
    // AI & System Intelligence
    if (slug === "ai-nudges") {
      return [
        { key: "enable-ai-nudges", title: "Enable AI Nudges", subtitle: "Micro-wins", icon: <Bell size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "time-based-hooks") {
      return [
        { key: "configure-hooks", title: "Configure Hooks", subtitle: "Wake/bedtime", icon: <Clock size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "emotional-fit-detection") {
      return [
        { key: "detect-fit", title: "Detect Emotional Fit", subtitle: "Clinical vs playful", icon: <MessageCircle size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "system-state-adaptation") {
      return [
        { key: "adapt-state", title: "Adapt to System State", subtitle: "Holidays, sleep windows", icon: <Gauge size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "dropout-win-back") {
      return [
        { key: "win-back", title: "Win-back Plan", subtitle: "Re-engage", icon: <Target size={18} color={palette.primary} /> },
      ];
    }
    if (slug === "outcome-linked-feedback") {
      return [
        { key: "link-outcomes", title: "Link Outcomes", subtitle: "Close the loop", icon: <Zap size={18} color={palette.primary} /> },
      ];
    }
    return [
      { key: "learn", title: "Learn About This Feature", subtitle: "Overview and benefits", icon: <Sparkles size={18} color={palette.primary} /> },
      { key: "connect", title: "Connect Services", subtitle: "Link devices or data", icon: <Link size={18} color={palette.primary} /> },
    ];
  }, [palette.primary, slug]);

  const onActionPress = useCallback((key: string) => {
    console.log("[Feature] action press", slug, key);
    if (slug === "appointment-booking" && (key === "book-virtual" || key === "book-inclinic")) {
      const type = key === "book-virtual" ? "virtual" : "inclinic";
      router.push({ pathname: "/feature/booking", params: { type } });
      return;
    }
    if (slug === "medication-tracking") {
      if (key === "view-meds") {
        router.push({ pathname: "/feature/meds" });
        return;
      }
      if (key === "add-med") {
        router.push({ pathname: "/feature/meds", params: { add: "1" } });
        return;
      }
    }
    if (slug === "nutrition-supplements" && key === "open-meds") {
      router.push({ pathname: "/feature/meds" });
      return;
    }
    if (slug === "ai-digital-triage" && key === "start-triage") {
      router.push({ pathname: "/feature/triage" });
      return;
    }
    if (slug === "virtual-consultations") {
      if (key === "new-video") {
        router.push({ pathname: "/feature/booking", params: { type: "virtual" } });
        return;
      }
      if (key === "choose-specialty") {
        router.push({ pathname: "/feature/booking", params: { type: "inclinic" } });
        return;
      }
    }
    if (slug === "lifestyle-health-history" && key === "start-history") {
      router.push({ pathname: "/feature/history" });
      return;
    }
  }, [router, slug]);

  const next7Days = useMemo(() => {
    const out: string[] = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      out.push(iso);
    }
    return out;
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]} testID="feature-screen">
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" testID="feature-back">
          <View style={[styles.backBtn, { backgroundColor: `${palette.text}10`, borderColor: `${palette.text}20` }]}> 
            <ChevronLeft size={20} color={palette.text} />
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: palette.text }]} numberOfLines={1} testID="feature-title">
          {title}
        </Text>
        <View style={styles.headerRightSpace} />
      </View>

      <GlassView style={styles.hero} testID="feature-hero">
        <View style={styles.heroRow}>
          <View style={[styles.heroIconWrap, { backgroundColor: `${palette.primary}15` }]}> 
            <Sparkles size={24} color={palette.primary} />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={[styles.heroTitle, { color: palette.text }]}>{title}</Text>
            <Text style={[styles.heroSubtitle, { color: palette.textSecondary }]}>Tap an action to continue</Text>
          </View>
        </View>
      </GlassView>

      {slug === "appointment-booking" && (
        <GlassView style={styles.card} testID="booking-card">
          <Text style={[styles.cardTitle, { color: palette.text }]}>Choose a date</Text>
          <FlatList
            horizontal
            data={next7Days}
            keyExtractor={(d) => d}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
            renderItem={({ item }) => {
              const isSel = selectedDate === item;
              return (
                <TouchableOpacity
                  style={[styles.datePill, { borderColor: isSel ? palette.primary : `${palette.text}25`, backgroundColor: isSel ? `${palette.primary}20` : "transparent" }]}
                  onPress={() => setSelectedDate(item)}
                  testID={`date-${item}`}
                >
                  <Text style={{ color: palette.text, fontWeight: "600" as const }}>{item.slice(5)}</Text>
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            disabled={!selectedDate}
            style={[styles.primaryBtn, { backgroundColor: selectedDate ? palette.primary : `${palette.text}20` }]}
            onPress={() => {
              console.log("[Booking] continue", selectedDate);
              if (selectedDate) {
                router.push({ pathname: "/feature/booking", params: { date: selectedDate, type: "virtual" } });
              }
            }}
            testID="booking-continue"
          >
            <Text style={[styles.primaryBtnText, { color: palette.background }]}>{selectedDate ? `Continue – ${selectedDate}` : "Select a date"}</Text>
          </TouchableOpacity>
        </GlassView>
      )}

      <View style={styles.cards}>
        <GlassView style={styles.card} testID="feature-actions">
          <Text style={[styles.cardTitle, { color: palette.text }]}>Quick actions</Text>
          {actions.map((a) => (
            <TouchableOpacity key={a.key} style={styles.actionRow} onPress={() => onActionPress(a.key)} testID={`action-${a.key}`}>
              <View style={[styles.actionIcon, { backgroundColor: `${palette.primary}12` }]}>{a.icon}</View>
              <View style={styles.actionTextWrap}>
                <Text style={[styles.actionTitle, { color: palette.text }]}>{a.title}</Text>
                <Text style={[styles.actionSubtitle, { color: palette.textSecondary }]}>{a.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </GlassView>

        <GlassView style={styles.card} testID="feature-next">
          <Text style={[styles.cardTitle, { color: palette.text }]}>Next steps</Text>
          <Text style={[styles.cardBody, { color: palette.textSecondary }]}>This screen will evolve with deeper flows, server APIs, and validation. For now, explore the actions above.
          </Text>
        </GlassView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "600" as const },
  headerRightSpace: { width: 36 },
  hero: { marginHorizontal: 16, borderRadius: 16, padding: 16 },
  heroRow: { flexDirection: "row", alignItems: "center" },
  heroIconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12 },
  heroTextWrap: { flex: 1 },
  heroTitle: { fontSize: 20, fontWeight: "700" as const, marginBottom: 4 },
  heroSubtitle: { fontSize: 13, lineHeight: 18 },
  cards: { paddingHorizontal: 16, marginTop: 16 },
  card: { padding: 16, borderRadius: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700" as const, marginBottom: 6 },
  cardBody: { fontSize: 13, lineHeight: 20 },
  actionRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  actionIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  actionTextWrap: { flex: 1 },
  actionTitle: { fontSize: 14, fontWeight: "600" as const },
  actionSubtitle: { fontSize: 12 },
  dateList: { paddingVertical: 8 },
  datePill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, marginRight: 8 },
  primaryBtn: { marginTop: 12, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { fontSize: 14, fontWeight: "700" as const },
});