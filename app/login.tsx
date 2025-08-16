import React, { useEffect, useMemo, useRef, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { View, Text, StyleSheet, TextInput, Platform, Animated, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { ShieldCheck, PhoneCall, CheckCircle2, RotateCcw } from "lucide-react-native";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/providers/AuthProvider";

const PHONE_PREFIX = "+966" as const;
const RESEND_COOLDOWN_SECONDS = 45 as const;
const CODE_EXPIRES_SECONDS_FALLBACK = 300 as const;

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useAppSettings();
  const c = colors[theme];
  const { setToken, setProfile } = useAuth();

  const [phone, setPhone] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [stage, setStage] = useState<"enter-phone" | "enter-code">("enter-phone");
  const [cooldown, setCooldown] = useState<number>(0);
  const [touched, setTouched] = useState<{ phone: boolean; code: boolean }>({ phone: false, code: false });
  const [expiresIn, setExpiresIn] = useState<number>(0);

  const mount = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(mount, { toValue: 1, duration: 450, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [mount]);

  const requestOtpMutation = trpc.auth.requestOtp.useMutation();
  const verifyOtpMutation = trpc.auth.verifyOtp.useMutation();

  const phoneRef = useRef<TextInput | null>(null);
  const codeRef = useRef<TextInput | null>(null);

  const normalizedPhone = useMemo(() => (phone.startsWith(PHONE_PREFIX) ? phone : `${PHONE_PREFIX}${phone}`), [phone]);
  const phoneValid = useMemo(() => /^\+?966\d{9}$/.test(normalizedPhone), [normalizedPhone]);
  const codeValid = useMemo(() => /^\d{6}$/.test(code), [code]);

  useEffect(() => {
    if (stage === "enter-code") {
      setTimeout(() => codeRef.current?.focus?.(), 50);
    } else {
      setTimeout(() => phoneRef.current?.focus?.(), 50);
    }
  }, [stage]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (expiresIn > 0) {
      timer = setInterval(() => setExpiresIn((s) => Math.max(0, s - 1)), 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [expiresIn]);

  const startCooldown = () => setCooldown(RESEND_COOLDOWN_SECONDS);

  const onRequestOtp = async () => {
    setTouched((t) => ({ ...t, phone: true }));
    if (!phoneValid) {
      return;
    }
    try {
      console.log("[Login] requestOtp", normalizedPhone);
      const res = await requestOtpMutation.mutateAsync({ phone: normalizedPhone });
      console.log("[Login] requestOtp success", res);
      setStage("enter-code");
      startCooldown();
      setExpiresIn((res as any)?.expiresInSec ?? CODE_EXPIRES_SECONDS_FALLBACK);
    } catch (e: any) {
      console.error("[Login] requestOtp error", e);
      Alert.alert("OTP Error", e?.message ?? "Failed to send OTP. Try again.");
    }
  };

  const onResend = async () => {
    if (cooldown > 0 || !phoneValid) return;
    try {
      console.log("[Login] resendOtp", normalizedPhone);
      const res = await requestOtpMutation.mutateAsync({ phone: normalizedPhone });
      startCooldown();
      setExpiresIn((res as any)?.expiresInSec ?? CODE_EXPIRES_SECONDS_FALLBACK);
    } catch (e: any) {
      console.error("[Login] resend error", e);
      Alert.alert("Resend Error", e?.message ?? "Failed to resend code");
    }
  };

  const onVerifyOtp = async () => {
    setTouched((t) => ({ ...t, code: true }));
    if (!codeValid) {
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

  const phoneError = touched.phone && !phoneValid ? "Enter a valid +966XXXXXXXXX number" : "";
  const codeError = touched.code && !codeValid ? "Enter the 6-digit code" : "";

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
              ref={phoneRef}
              keyboardType="phone-pad"
              placeholder="e.g. 512345678"
              placeholderTextColor={c.textSecondary}
              value={phone}
              onChangeText={(t) => { setPhone(t.replace(/\D/g, "")); if (!touched.phone) setTouched((v) => ({ ...v, phone: true })); }}
              style={[styles.input, { color: c.text, borderColor: phoneError ? "#E53935" : c.border, backgroundColor: c.background }]}
              onBlur={() => setTouched((v) => ({ ...v, phone: true }))}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={() => setStage("enter-code")}
              testID="input-phone"
            />
            {phoneError ? <Text style={[styles.inlineError]} testID="error-phone">{phoneError}</Text> : null}
            <AnimatedPressButton
              onPress={onRequestOtp}
              disabled={requestOtpMutation.isPending || !phoneValid}
              label={requestOtpMutation.isPending ? "Sending..." : "Send Code"}
              color={c.primary}
              testID="btn-send-otp"
            />
          </View>
        ) : (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Verification Code</Text>
            <TextInput
              ref={codeRef}
              keyboardType="number-pad"
              placeholder="123456"
              placeholderTextColor={c.textSecondary}
              value={code}
              onChangeText={(t) => {
                const digits = t.replace(/\D/g, "");
                setCode(digits);
                if (!touched.code) setTouched((v) => ({ ...v, code: true }));
                if (digits.length === 6) {
                  setTimeout(() => onVerifyOtp(), 50);
                }
              }}
              maxLength={6}
              style={[styles.input, { color: c.text, borderColor: codeError ? "#E53935" : c.border, backgroundColor: c.background, letterSpacing: 6 }]}
              onBlur={() => setTouched((v) => ({ ...v, code: true }))}
              autoFocus
              returnKeyType="done"
              testID="input-code"
            />
            {codeError ? <Text style={styles.inlineError} testID="error-code">{codeError}</Text> : null}
            <AnimatedPressButton
              onPress={onVerifyOtp}
              disabled={verifyOtpMutation.isPending || !codeValid}
              label={verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
              color={c.primary}
              testID="btn-verify"
              rightIcon={<CheckCircle2 size={18} color="white" />}
            />
            <View style={styles.hintRow}>
              <Text style={[styles.hintText, { color: c.textSecondary }]}>
                {expiresIn > 0 ? `Code expires in ${Math.floor(expiresIn/60)}m ${expiresIn%60}s` : "Request a new code if expired"}
              </Text>
            </View>
            <View style={styles.resendRow}>
              <Text style={[styles.resendText, { color: c.textSecondary }]}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Didn't get the code?"}
              </Text>
              <AnimatedPressButton
                onPress={onResend}
                disabled={cooldown > 0 || requestOtpMutation.isPending}
                label={"Resend"}
                color={cooldown > 0 ? `${c.secondary ?? c.primary}66` : (c.secondary ?? c.primary)}
                testID="btn-resend-otp"
                rightIcon={<RotateCcw size={16} color="white" />}
              />
              <AnimatedPressButton
                onPress={async () => {
                  try {
                    const text = await Clipboard.getStringAsync();
                    const digits = (text ?? "").replace(/\D/g, "").slice(0,6);
                    if (digits.length === 6) {
                      setCode(digits);
                      setTimeout(() => onVerifyOtp(), 50);
                    } else {
                      Alert.alert("Paste", "Clipboard doesn't contain a 6-digit code");
                    }
                  } catch (e) {
                    console.log('[Login] clipboard error', e);
                  }
                }}
                disabled={verifyOtpMutation.isPending}
                label={"Paste Code"}
                color={c.primary}
                testID="btn-paste-code"
              />
            </View>
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

function InlineIcon({ element, marginLeft }: { element?: React.ReactNode; marginLeft?: number }) {
  if (!element) return null;
  if (!React.isValidElement(element)) return null;
  return <Text style={{ marginLeft: marginLeft ?? 0 }}>{element as any}</Text>;
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
        <InlineIcon element={rightIcon} marginLeft={6} />
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
  inlineError: { color: "#E53935", fontSize: 12, marginTop: 6 },
  hintRow: { marginTop: 8 },
  hintText: { fontSize: 12 },
  resendRow: { marginTop: 12, gap: 8 },
  resendText: { fontSize: 12 },
});