import React, { memo, useMemo } from "react";
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";

interface GlassViewProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  testID?: string;
}

const GlassView = memo(function GlassView({ style, children, testID }: GlassViewProps) {
  const { theme } = useAppSettings();
  const palette = colors[theme];

  const cfg = useMemo(() => {
    const baseBg = theme === "dark" ? "rgba(17,17,17,0.35)" : "rgba(255,255,255,0.45)";
    const top = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.6)";
    const bottom = theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.35)";
    const border = theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    return { baseBg, top, bottom, border };
  }, [theme]);

  return (
    <View style={[styles.wrap, Platform.OS !== 'web' ? styles.nativeShadow : undefined, { backgroundColor: cfg.baseBg, borderColor: cfg.border }, style]} testID={testID}>
      <LinearGradient colors={[cfg.top, cfg.bottom]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
      <View style={[StyleSheet.absoluteFill, styles.borderGlow, { borderColor: cfg.border }]} />
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  nativeShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  borderGlow: {
    borderWidth: 1,
    borderRadius: 16,
  },
});

export default GlassView;
