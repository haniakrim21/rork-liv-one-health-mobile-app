import React, { useMemo, useRef, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { View, Text, StyleSheet, TextInput, Platform, Animated, Alert } from "react-native";
import { ShieldCheck, PhoneCall, CheckCircle2 } from "lucide-react-native";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/providers/AuthProvider";

const PHONE_PREFIX = "+966" as const;

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useAppSettings();
  const c = colors[theme];
  const { setToken, setProfile } = useAuth();

  const [phone, setPhone] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [stage, setStage] = useState<"enter-phone" | "enter-code">("enter-phone");

  const mount = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(mount, { toValue: 1, duration: 450, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [mount]);

  const requestOtpMutation = trpc.auth.requestOtp.useMutation();
  const verifyOtpMutation = trpc.auth.verifyOtp.useMutation();

  const canRequest = useMemo(() => {
    const normalized = phone.startsWith(PHONE_PREFIX) ? phone : `${PHONE_PREFIX}${phone}`;
    return /^\+?966\d{9}$/.test(normalized);
  }, [phone]);

  const canVerify = useMemo(() => /^\d{6}$/.test(code), [code]);

  const normalizedPhone = useMemo(() => (phone.startsWith(PHONE_PREFIX) ? phone : `${PHONE_PREFIX}${phone}`), [phone]);

  const onRequestOtp = async () => {
    if (!canRequest) {
      Alert.alert("Invalid number", "Please enter a valid Saudi phone number");
      return;
    }
    try {
      console.log("[Login] requestOtp", normalizedPhone);
      const res = await requestOtpMutation.mutateAsync({ phone: normalizedPhone });
      console.log("[Login] requestOtp success", res);
      setStage("enter-code");
    } catch (e: any) {
      console.error("[Login] requestOtp error", e);
      Alert.alert("OTP Error", e?.message ?? "Failed to send OTP. Try again.");
    }
  };

  const onVerifyOtp = async () => {
    if (!canVerify) {
      Alert.alert("Invalid code", "Enter the 6-digit code");
      return;
    }
    try {
      console.log("[Login] verifyOtp", { phone: normalizedPhone });
      const res = await verifyOtpMutation.mutateAsync({ phone: normalizedPhone, code });
      console.log("[Login] verifyOtp success", res);
      await setToken(res?.token ?? undefined);
      if (res?.profile) {
        await setProfile(res.profile as any);
      }
      Alert.alert("Verified", "You are signed in", [
        { text: "OK", onPress: () => router.replace("/absher") },
      ]);
    } catch (e: any) {
      console.error("[Login] verifyOtp error", e);
      Alert.alert("Verification Error", e?.message ?? "Invalid or expired code");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]} testID="login-screen">
      <Stack.Screen options={{ title: stage === "enter-phone" ? "Sign in" : "Enter Code" }} />

      <Animated.View style={[styles.card, { backgroundColor: c.card, opacity: mount, transform: [{ translateY: mount.interpolate({ inputRange: [0,1], outputRange: [16,0] }) }] }]}>
        <View style={[styles.iconWrap, { backgroundColor: `${c.primary}1A` }]}>
          {stage === "enter-phone" ? (
            <PhoneCall size={28} color={c.primary} />
          ) : (
            <ShieldCheck size={28} color={c.primary} />
          )}
        </View>
        <Text style={[styles.title, { color: c.text }]}>
          {stage === "enter-phone" ? "Phone Verification" : "Enter the 6-digit code"}
        </Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          {stage === "enter-phone"
            ? "Enter your Saudi number to receive an SMS code"
            : `Code sent to ${normalizedPhone}`}
        </Text>

        {stage === "enter-phone" ? (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Phone Number</Text>
            <TextInput
              keyboardType="phone-pad"
              placeholder="e.g. 512345678"
              placeholderTextColor={c.textSecondary}
              value={phone}
              onChangeText={setPhone}
              style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.background }]}
              testID="input-phone"
            />
            <AnimatedPressButton
              onPress={onRequestOtp}
              disabled={requestOtpMutation.isPending || !canRequest}
              label={requestOtpMutation.isPending ? "Sending..." : "Send Code"}
              color={c.primary}
              testID="btn-send-otp"
            />
          </View>
        ) : (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Verification Code</Text>
            <TextInput
              keyboardType="number-pad"
              placeholder="123456"
              placeholderTextColor={c.textSecondary}
              value={code}
              onChangeText={setCode}
              maxLength={6}
              style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.background, letterSpacing: 6 }]}
              testID="input-code"
            />
            <AnimatedPressButton
              onPress={onVerifyOtp}
              disabled={verifyOtpMutation.isPending || !canVerify}
              label={verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
              color={c.primary}
              testID="btn-verify"
              rightIcon={<CheckCircle2 size={18} color="white" />}
            />
          </View>
        )}

        {requestOtpMutation.error || verifyOtpMutation.error ? (
          <Text style={[styles.errorText, { color: "#E53935" }]} testID="error-text">
            {requestOtpMutation.error?.message ?? verifyOtpMutation.error?.message}
          </Text>
        ) : null}
      </Animated.View>
    </View>
  );
}

function AnimatedPressButton({ onPress, disabled, label, color, testID, rightIcon }: { onPress: () => void; disabled?: boolean; label: string; color: string; testID?: string; rightIcon?: React.ReactNode; }) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const animate = (to: number, duration: number) => {
    Animated.timing(scale, { toValue: to, duration, useNativeDriver: Platform.OS !== 'web' }).start();
  };
  return (
    <Animated.View style={{ transform: [{ scale }], width: "100%" }}>
      <View
        testID={testID}
        onTouchStart={() => animate(0.98, 80)}
        onTouchEnd={() => animate(1, 120)}
        onTouchCancel={() => animate(1, 120)}
        style={[styles.button, { backgroundColor: disabled ? `${color}66` : color }]}
        {...({ onStartShouldSetResponder: () => true, onResponderRelease: () => { if (!disabled) onPress(); } } as any)}
      >
        <Text style={styles.buttonText}>{label}</Text>
        {rightIcon ? <View style={{ marginLeft: 6 }}>{rightIcon}</View> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: "700" as const },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 12 },
  inputGroup: { marginTop: 12 },
  label: { fontSize: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "white", fontWeight: "600" as const, fontSize: 16 },
  errorText: { marginTop: 10, fontSize: 13 },
});