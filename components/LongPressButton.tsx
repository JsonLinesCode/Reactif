import { sessionStore } from "@/store/sessionStore";
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

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface LongPressButtonProps {
  onComplete: () => void;
  size?: number;
  iconSize?: number;
  iconName?: keyof typeof Ionicons.glyphMap;
  label?: string;
  showLabel?: boolean;
  duration?: number;
}

const DURATION = 1000;

export default function LongPressButton({
  onComplete,
  size = 80,
  iconSize = 32,
  iconName = "arrow-undo",
  label = "Annuler",
  showLabel = true,
  duration = DURATION,
}: LongPressButtonProps) {
  const theme = sessionStore.theme;
  const buttonColor =
    label.trim().toUpperCase() === "FIN RCP" ? "#FF5252" : "#448AFF";

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
          width: size,
          height: size,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          marginBottom: 8,
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
                backgroundColor: "transparent",
                borderWidth: 2,
                borderColor: buttonColor,
              },
              animatedButtonStyle,
            ]}
          >
            <Ionicons name={iconName} size={iconSize} color={buttonColor} />
          </Animated.View>
        </Pressable>

        <View
          style={{
            position: "absolute",
            left: (size - svgSize) / 2,
            top: (size - svgSize) / 2,
            width: svgSize,
            height: svgSize,
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
          }}
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
              stroke={buttonColor}
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
      {showLabel ? (
        <Text
          style={[
            styles.label,
            theme === "dark" ? { color: "#ccc" } : { color: "black" },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    alignSelf: "center",
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
    width: "100%",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
    textTransform: "uppercase",
    lineHeight: 22,
    includeFontPadding: false,
  },
});
