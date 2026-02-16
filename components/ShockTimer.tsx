import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, G } from "react-native-svg";

interface ShockTimerProps {
  onShock: () => void;
  lastShockTime: number; // timestamp
  durationSeconds?: number;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function ShockTimer({
  onShock,
  lastShockTime,
  durationSeconds = 120, // Default 2 minutes
}: ShockTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const soundPlayedRef = useRef(false);
  const blinkingRef = useRef<Animated.CompositeAnimation | null>(null);

  // SVG Config
  const size = 160;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    if (!lastShockTime) {
      setTimeLeft(durationSeconds);
      stopBlinking();
      soundPlayedRef.current = false;
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastShockTime) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsed);
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lastShockTime, durationSeconds]);

  useEffect(() => {
    if (timeLeft === 0) {
      if (!soundPlayedRef.current) {
        soundPlayedRef.current = true;
      }
      startBlinking();
    } else {
      stopBlinking();
      if (timeLeft > 0) {
        soundPlayedRef.current = false;
      }
    }
  }, [timeLeft]);

  const startBlinking = () => {
    if (blinkingRef.current) return;

    blinkingRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ]),
    );
    blinkingRef.current.start();
  };

  const stopBlinking = () => {
    if (blinkingRef.current) {
      blinkingRef.current.stop();
      blinkingRef.current = null;
    }
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Stop blinking immediately on press
    stopBlinking();
    soundPlayedRef.current = false;

    onShock();
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Progress logic:
  // Red = Remaining ("decreases progressively")
  // Blue = Background (Elapsed)
  // When full (120s), progress = 1, offset = 0 (Full Red)
  // When empty (0s), progress = 0, offset = circumference (No Red, all Blue)
  const progress = timeLeft / durationSeconds;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <AnimatedTouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={{ transform: [{ scale: scaleAnim }] }}
      >
        <View style={styles.svgContainer}>
          <Svg width={size} height={size}>
            <G rotation="-90" origin={`${center}, ${center}`}>
              {/* Background Circle (Blue) */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke="#2979FF"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Foreground Circle (Red) */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke="#FF5252"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </G>
          </Svg>

          <View style={styles.innerContent}>
            <Ionicons
              name="flash"
              size={32}
              color="black"
              style={{ marginBottom: 4 }}
            />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.labelText}>CHOC</Text>
          </View>
        </View>
      </AnimatedTouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  svgContainer: {
    position: "relative",
    width: 170,
    height: 170,
    justifyContent: "center",
    alignItems: "center",
  },
  innerContent: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: 125,
    height: 125,
    borderRadius: 68,
    backgroundColor: "#F5F5F5",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  timerText: {
    fontSize: 37,
    fontWeight: "bold",
    color: "#000",
    lineHeight: 52,
  },
  labelText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
    textTransform: "uppercase",
  },
});
