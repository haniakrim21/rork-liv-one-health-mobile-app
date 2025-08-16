import React, { useMemo, useRef, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { View, Text, StyleSheet, Platform, Animated, TextInput, Linking, Alert } from "react-native";
import { ShieldCheck, ExternalLink, CheckCircle2, Link2 } from "lucide-react-native";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/providers/AuthProvider";

export default function AbsherVerifyScreen() {
  const router = useRouter();
  const { theme, language } = useAppSettings();
  const c = colors[theme];
  const { setAbsherVerified, setProfile } = useAuth();

  const [code, setCode] = useState<string>("");
  const [requestId, setRequestId] = useState<string>("");
  const [redirectUrl, setRedirectUrl] = useState<string>("");

  const startMutation = trpc.auth.startAbsher.useMutation();
  const verifyMutation = trpc.auth.verifyAbsher.useMutation();

  const mount = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(mount, { toValue: 1, duration: 450, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [mount]);

  const canVerify = useMemo(() => code.trim().length >= 4 && requestId.length > 0, [code, requestId]);

  const onStart = async () => {
    try {
      const res = await startMutation.mutateAsync({ locale: language });
      setRequestId(res.requestId);
      setRedirectUrl(res.redirectUrl);
    } catch (e: any) {
      console.error("[Absher] start error", e);
      Alert.alert("Error", e?.message ?? "Failed to start verification");
    }
  };

  const onOpenRedirect = async () => {
    try {
      if (!redirectUrl) return;
      const supported = await Linking.canOpenURL(redirectUrl);
      if (supported) {
        await Linking.openURL(redirectUrl);
      } else {
        Alert.alert("Open Link", redirectUrl);
      }
    } catch (e) {
      console.error("[Absher] open redirect error", e);
    }
  };

  const onVerify = async () => {
    if (!canVerify) {
      Alert.alert("Enter Code", "Please enter the code from Absher/Nafath");
      return;
    }
    try {
      const res = await verifyMutation.mutateAsync({ requestId, code });
      console.log("[Absher] verify success", res);
      if (res?.profile) {
        await setProfile(res.profile as any);
      }
      await setAbsherVerified(true);
      Alert.alert("Verified", "Identity verified", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (e: any) {
      console.error("[Absher] verify error", e);
      Alert.alert("Verification Error", e?.message ?? "Failed to verify");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }] } testID="absher-screen">
      <Stack.Screen options={{ title: language === 'ar' ? 'توثيق الهوية' : 'Verify Identity' }} />

      <Animated.View style={[styles.card, { backgroundColor: c.card, opacity: mount, transform: [{ translateY: mount.interpolate({ inputRange: [0,1], outputRange: [16,0] }) }] }]}>
        <View style={[styles.iconWrap, { backgroundColor: `${c.primary}1A` }]}>
          <ShieldCheck size={28} color={c.primary} />
        </View>
        <Text style={[styles.title, { color: c.text }]}>
          {language === 'ar' ? 'التحقق عبر نفاذ/أبشر' : 'Nafath/Absher Verification'}
        </Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          {language === 'ar' ? 'ابدأ التحقق وافتح الرابط، ثم أدخل الرمز.' : 'Start verification, open the redirect, then enter the code.'}
        </Text>

        <PrimaryButton
          label={startMutation.isPending ? (language === 'ar' ? 'جارٍ البدء...' : 'Starting...') : (language === 'ar' ? 'ابدأ التحقق' : 'Start Verification')}
          onPress={onStart}
          disabled={startMutation.isPending}
          color={c.primary}
          testID="btn-start-absher"
          leftIcon={<Link2 size={18} color="white" />}
        />

        {requestId ? (
          <View style={[styles.infoBox, { borderColor: c.border }]} testID="info-box">
            <Text style={[styles.infoLabel, { color: c.textSecondary }]}>{language === 'ar' ? 'Request ID' : 'Request ID'}</Text>
            <Text style={[styles.infoValue, { color: c.text }]} selectable>{requestId}</Text>
            {redirectUrl ? (
              <PrimaryButton
                label={language === 'ar' ? 'فتح الرابط' : 'Open Redirect'}
                onPress={onOpenRedirect}
                color={c.secondary}
                testID="btn-open-redirect"
                leftIcon={<ExternalLink size={18} color="white" />}
              />
            ) : null}
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: c.textSecondary }]}>{language === 'ar' ? 'رمز التحقق' : 'Verification Code'}</Text>
          <TextInput
            keyboardType="number-pad"
            placeholder={language === 'ar' ? 'أدخل الرمز' : 'Enter code'}
            placeholderTextColor={c.textSecondary}
            value={code}
            onChangeText={setCode}
            maxLength={8}
            style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.background, letterSpacing: 4 }]}
            testID="input-absher-code"
          />
          <PrimaryButton
            label={verifyMutation.isPending ? (language === 'ar' ? 'جارٍ التحقق...' : 'Verifying...') : (language === 'ar' ? 'تحقق' : 'Verify')}
            onPress={onVerify}
            disabled={verifyMutation.isPending || !canVerify}
            color={c.primary}
            testID="btn-verify-absher"
            rightIcon={<CheckCircle2 size={18} color="white" />}
          />
        </View>

        {(startMutation.error || verifyMutation.error) ? (
          <Text style={[styles.errorText, { color: "#E53935" }]} testID="error-text">
            {startMutation.error?.message ?? verifyMutation.error?.message}
          </Text>
        ) : null}
      </Animated.View>
    </View>
  );
}

function PrimaryButton({ onPress, disabled, label, color, testID, leftIcon, rightIcon }: { onPress: () => void; disabled?: boolean; label: string; color: string; testID?: string; leftIcon?: React.ReactNode; rightIcon?: React.ReactNode; }) {
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
        {leftIcon ? <View style={{ marginRight: 6 }}>{leftIcon}</View> : null}
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
  infoBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  infoLabel: { fontSize: 12 },
  infoValue: { fontSize: 13 },
  inputGroup: { marginTop: 16 },
  label: { fontSize: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    marginTop: 12,
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
