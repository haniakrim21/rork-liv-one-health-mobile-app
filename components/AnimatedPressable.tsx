import React, { memo, useMemo, useRef, useCallback } from "react";
import { Animated, Platform, Pressable, StyleProp, ViewStyle } from "react-native";

interface AnimatedPressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}

const AnimatedPressable = memo(function AnimatedPressable({ children, style, onPress, disabled, testID }: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = useCallback((to: number, duration: number) => {
    Animated.timing(scale, { toValue: to, duration, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [scale]);

  const animatedStyle = useMemo(() => [{ transform: [{ scale }] }] as const, [scale]);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => animate(0.98, 80)}
      onPressOut={() => animate(1, 120)}
      testID={testID}
      style={style}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
});

export default AnimatedPressable;
