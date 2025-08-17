import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text, Animated, Platform } from "react-native";
import GlassView from "@/components/GlassView";
import { Lightbulb } from "lucide-react-native";
import { useAppSettings } from "@/providers/AppSettingsProvider";
import { colors } from "@/constants/colors";

interface NextStepsProps {
  title?: string;
  message?: string;
  testID?: string;
}

export default function NextSteps({
  title = "Next steps",
  message = "This screen will evolve with deeper flows, server APIs, and validation. For now, explore the actions above.",
  testID = "next-steps-card",
}: NextStepsProps) {
  const { theme } = useAppSettings();
  const palette = colors[theme];
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 450, useNativeDriver: Platform.OS !== "web" }).start();
  }, [anim]);

  return (
    <Animated.View
      style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}
      testID={`${testID}-wrap`}
    >
      <GlassView style={styles.card} testID={testID}>
        <View style={[styles.iconWrap, { backgroundColor: `${palette.primary}12` }]}> 
          <Lightbulb size={20} color={palette.primary} />
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: palette.textSecondary }]}>{message}</Text>
        </View>
      </GlassView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textWrap: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700" as const, marginBottom: 4 },
  subtitle: { fontSize: 13, lineHeight: 20 },
});