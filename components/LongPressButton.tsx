import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { sessionController } from "@/controllers/SessionController";
import {sessionStore} from "@/store/sessionStore";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface LongPressButtonProps {
  onComplete: () => void;
  size?: number;
  color?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  label?: string;
  duration?: number;
}

const DURATION = 1000;

export default function LongPressButton({
  onComplete,
  size = 80,
  color = "#444",
  iconName = "arrow-undo",
  label = "Annuler",
  duration = DURATION,
}: LongPressButtonProps) {

  const theme = sessionStore.theme;

  const progress = useSharedValue(0);
  const scale = useSharedValue(1);
  const isPressing = useSharedValue(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const radius = size / 2;
  const strokeWidth = 6;
  const ringRadius = radius + strokeWidth;
  const circumference = 2 * Math.PI * ringRadius;
  const svgSize = (ringRadius + strokeWidth) * 2;

  const handleComplete = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    // Make sure we stop pressing state so subsequent logic doesn't re-trigger
    isPressing.value = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    onComplete();
  };

  const handlePressIn = () => {
    isPressing.value = true;
    scale.value = withSpring(1.2);
    progress.value = withTiming(1, { duration: duration });

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (isPressing.value) {
        cancelAnimation(progress);
        cancelAnimation(scale);
        progress.value = withTiming(0, { duration: 200 }); // Smooth exit
        scale.value = withSpring(1);

        handleComplete();
      }
    }, duration);
  };

  const handlePressOut = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (isPressing.value) {
      isPressing.value = false;
      cancelAnimation(progress);
      progress.value = withTiming(0, { duration: 150 });
      scale.value = withSpring(1);
    }
  };

  const animatedSvgProps = useAnimatedProps(() => {
    const strokeDashoffset = interpolate(
      progress.value,
      [0, 1],
      [circumference, 0],
      Extrapolation.CLAMP,
    );
    return {
      strokeDashoffset,
    };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={styles.container}>
      <View
        style={{
          width: svgSize,
          height: svgSize,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.pressableContainer}
        >
          <Animated.View
            style={[
              styles.button,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
              },
              animatedButtonStyle,
            ]}
          >
            <Ionicons name={iconName} size={32} color="#fff" />
          </Animated.View>
        </Pressable>

        <View
          style={[
            StyleSheet.absoluteFill,
            {
              justifyContent: "center",
              alignItems: "center",
              pointerEvents: "none",
            },
          ]}
        >
          <Svg
            width={svgSize}
            height={svgSize}
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            style={{ transform: [{ rotate: "-90deg" }] }}
          >
            <AnimatedCircle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={ringRadius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeLinecap="round"
              animatedProps={animatedSvgProps}
              opacity={0.5}
            />
          </Svg>
        </View>
      </View>
      <Text style={[styles.label, theme === "dark" ? {color: "#ccc"}:{color: "black"}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    transform: [{ translateY: -10 }],
  },
  pressableContainer: {
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      web: {
        cursor: "pointer",
        userSelect: "none",
      } as any,
    }),
  },
  label: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
  },
});
