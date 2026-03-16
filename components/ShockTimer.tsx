import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle, G } from "react-native-svg";

interface ShockTimerProps {
  onShock: () => void;
  onAnalysis: () => void;
  lastShockTime?: number | null; // timestamp
  lastAnalysisTime?: number | null; // timestamp
  durationMinutes?: number;
  durationSeconds?: number;
  shockCount?: number;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function ShockTimer({
  onShock,
  onAnalysis,
  lastShockTime,
  durationMinutes = 2, // Default 2 minutes
  lastAnalysisTime,
  durationSeconds = 120, // Default 2 minutes
  shockCount = 0,
}: ShockTimerProps) {
  const { width } = useWindowDimensions();
  const [timeLeft, setTimeLeft] = useState(durationMinutes);
  const [localStartTime, setLocalStartTime] = useState<number | null>(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const soundPlayedRef = useRef(false);
  const blinkingRef = useRef<Animated.CompositeAnimation | null>(null);

  const shockBounceAnim = useRef(new Animated.Value(1)).current;
  const analysisBounceAnim = useRef(new Animated.Value(1)).current;

  // Dynamic Sizing
  // available width = screen width - parent padding (32) - component padding (20) - gap (10)
  const availableWidth = width - 32 - 20;
  const circleSize = Math.min((availableWidth - 20) / 2, 170); // Max 170, but shrink if needed

  // SVG Config
  const size = circleSize;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Inner content size
  const innerSize = size - 45;
  const innerRadius = innerSize / 2;

  // Determine the effective start time: either the local override or the prop
  const effectiveStartTime = localStartTime ?? lastShockTime;

  const updateTimer = () => {
    const now = Date.now();
    const elapsed = effectiveStartTime ? Math.floor((now - effectiveStartTime) / 1000) : 0;
    const remaining = Math.max(0, durationMinutes - elapsed);
    setTimeLeft(remaining);
  };

  useEffect(() => {
    if (!effectiveStartTime && !lastAnalysisTime) {
      setTimeLeft(0);
      stopBlinking();
      scaleAnim.setValue(1);
      soundPlayedRef.current = false;
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      if (
        lastAnalysisTime &&
        (!lastShockTime || lastAnalysisTime > lastShockTime)
      ) {
        const elapsedAnalysis = Math.floor((now - lastAnalysisTime) / 1000);
        const remainingAnalysis = Math.max(
          0,
          durationSeconds - elapsedAnalysis,
        );
        setTimeLeft(remainingAnalysis);
        return;
      } else if (lastShockTime) {
        const elapsedShock = Math.floor((now - lastShockTime) / 1000);
        const remainingShock = Math.max(0, durationSeconds - elapsedShock);
        setTimeLeft(remainingShock);
        return;
      }
      setTimeLeft(0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [effectiveStartTime, lastAnalysisTime, durationMinutes]);

  useEffect(() => {
    // Sync local state if prop updates (e.g. shock delivered)
    if (lastShockTime) {
         setLocalStartTime(null);
    }
  }, [lastShockTime]);

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

  const handleShockPress = () => {
    stopBlinking();
    soundPlayedRef.current = false;

    onShock();
  };

  const handleAnalysisPress = () => {
    stopBlinking();
    soundPlayedRef.current = false;

    onAnalysis();
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = timeLeft / durationMinutes;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      {/* Circle 1: Choc Button with Counter */}
      <AnimatedTouchableOpacity
        onPress={handleShockPress}
        onPressIn={() => {
          Animated.timing(shockBounceAnim, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={() => {
          Animated.timing(shockBounceAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }).start();
        }}
        activeOpacity={0.8}
        style={{ transform: [{ scale: Animated.multiply(scaleAnim, shockBounceAnim) }] }}
      >
        <View
          style={[
            styles.buttonCircle,
            {
              width: circleSize - 6,
              height: circleSize - 6,
              borderRadius: (circleSize - 6) / 2,
            },
          ]}
        >
          <Ionicons name="flash" size={32} color="black" />
          <Text style={styles.labelText}>CHOC</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{shockCount}</Text>
          </View>
        </View>
      </AnimatedTouchableOpacity>

      {/* Circle 2: Analyse Timer */}
      <AnimatedTouchableOpacity
        onPress={handleAnalysisPress}
        activeOpacity={0.8}
        onPressIn={() => {
          Animated.timing(analysisBounceAnim, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={() => {
          Animated.timing(analysisBounceAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }).start();
        }}
        style={[
          styles.svgContainer,
          { transform: [{ scale: Animated.multiply(scaleAnim, analysisBounceAnim) }] },
          { width: circleSize, height: circleSize },
        ]}
      >
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#2979FF"
              strokeWidth={strokeWidth}
              fill="none"
            />
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
        <View
          style={[
            styles.innerContent,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerRadius,
            },
          ]}
        >
          <Ionicons
            name="stopwatch-outline"
            size={32}
            color="black"
            style={{ marginBottom: 4 }}
          />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.labelText}>ANALYSE</Text>
        </View>
      </AnimatedTouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    gap: 10,
  },
  buttonCircle: {
    backgroundColor: "#F5F5F5", // Same bg as inner timer
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 12,
    borderColor: "#FF5252", // Outline color for button
  },
  analysisContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  svgContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  innerContent: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    elevation: 2,
    zIndex: 1,
  },
  timerText: {
    fontSize: 28, // Adjusted font size
    fontWeight: "bold",
    color: "#000",
  },
  labelText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#000",
    textTransform: "uppercase",
    marginTop: 4,
  },
  badge: {
    position: "absolute",
    top: 15,
    right: 25,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 1984,
    backgroundColor: "#FF5252",
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
