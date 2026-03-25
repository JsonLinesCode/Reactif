import { sessionController } from "@/controllers/SessionController";
import { sessionStore } from "@/store/sessionStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  GestureResponderEvent,
  Pressable,
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
  onCancelLastShock?: () => boolean;
  isActive?: boolean;
  lastShockTime?: number | null;
  lastAnalysisTime?: number | null;
  durationSeconds?: number;
  warningSeconds?: number;
  shockCount?: number;
  resetRequest?: {
    token: number;
    target: "shockTimer" | "cordarone" | "adrenaline" | null;
    sourceEventType?: "shock" | "analysis" | "cordarone" | "adrenaline" | null;
  };
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function ShockTimer({
  onShock,
  onAnalysis,
  onCancelLastShock,
  isActive = true,
  lastShockTime,
  lastAnalysisTime,
  durationSeconds = 120,
  warningSeconds = 10,
  shockCount = 0,
  resetRequest,
}: ShockTimerProps) {
  const { width } = useWindowDimensions();
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [localStartTime, setLocalStartTime] = useState<number | null>(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const soundPlayedRef = useRef(false);
  const warningPlayedRef = useRef(false);
  const blinkingRef = useRef<Animated.CompositeAnimation | null>(null);

  const shockBounceAnim = useRef(new Animated.Value(1)).current;
  const analysisBounceAnim = useRef(new Animated.Value(1)).current;

  const availableWidth = width - 32 - 20;
  const circleSize = Math.min((availableWidth - 20) / 2, 170);

  const size = circleSize;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const innerSize = size - 45;
  const innerRadius = innerSize / 2;

  const effectiveStartTime = localStartTime ?? lastShockTime;
  const [localShockCount, setLocalShockCount] = useState<number>(
    shockCount || 0,
  );
  const [localLastAnalysisTime, setLocalLastAnalysisTime] = useState<
    number | null
  >(null);
  const [analysisSuppressedByShock, setAnalysisSuppressedByShock] =
    useState(false);
  const effectiveAnalysisStart = localLastAnalysisTime ?? lastAnalysisTime;

  const [theme, setTheme] = useState(sessionStore.theme);

  const colorIcon = theme === "dark" ? "grey" : "black";

  useEffect(() => {
    if (!isActive) return;

    // If there's no start time for shock or analysis, show full duration
    if (!effectiveStartTime && !effectiveAnalysisStart) {
      setTimeLeft(durationSeconds);
      stopBlinking();
      scaleAnim.setValue(1);
      soundPlayedRef.current = false;
      warningPlayedRef.current = false;
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      if (
        !analysisSuppressedByShock &&
        effectiveAnalysisStart &&
        (!lastShockTime || effectiveAnalysisStart > lastShockTime)
      ) {
        const elapsedAnalysis = Math.floor(
          (now - effectiveAnalysisStart) / 1000,
        );
        const remainingAnalysis = Math.max(
          0,
          durationSeconds - elapsedAnalysis,
        );
        setTimeLeft(remainingAnalysis);
        return;
      } else if (lastShockTime || effectiveStartTime) {
        const shockBase = lastShockTime ?? effectiveStartTime;
        if (!shockBase) {
          setTimeLeft(durationSeconds);
          return;
        }
        const elapsedShock = Math.floor((now - shockBase) / 1000);
        const remainingShock = Math.max(0, durationSeconds - elapsedShock);
        setTimeLeft(remainingShock);
        return;
      }
      setTimeLeft(durationSeconds);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [
    isActive,
    effectiveStartTime,
    effectiveAnalysisStart,
    analysisSuppressedByShock,
    durationSeconds,
    lastShockTime,
  ]);

  useEffect(() => {
    // Sync local state if prop updates (e.g. shock delivered or cancelled)
    setLocalStartTime(null);
    // Keep localShockCount in sync with prop updates
    setLocalShockCount(shockCount || 0);
  }, [lastShockTime, shockCount]);

  useEffect(() => {
    setLocalLastAnalysisTime(null);
    setAnalysisSuppressedByShock(false);
  }, [lastAnalysisTime]);

  useEffect(() => {
    // Once store catches up with a persisted shock timestamp, normal precedence logic is enough.
    setAnalysisSuppressedByShock(false);
  }, [lastShockTime]);

  // Reset this timer only when cancel targets the shock/analyse timer
  useEffect(() => {
    if (!resetRequest || resetRequest.target !== "shockTimer") return;
    setLocalStartTime(null);
    setLocalLastAnalysisTime(null);
    if (resetRequest.sourceEventType === "shock") {
      setLocalShockCount((c) => Math.max(0, c - 1));
    }
    setTimeLeft(durationSeconds);
    stopBlinking();
    scaleAnim.setValue(1);
    soundPlayedRef.current = false;
    warningPlayedRef.current = false;
  }, [resetRequest, durationSeconds]);

  useEffect(() => {
    if (!isActive) {
      stopBlinking();
      return;
    }

    if (timeLeft === 0) {
      if (!soundPlayedRef.current) {
        sessionController.playSound("beep");
        soundPlayedRef.current = true;
      }
      startBlinking();
    } else {
      if (
        warningSeconds > 0 &&
        timeLeft === warningSeconds &&
        !warningPlayedRef.current
      ) {
        sessionController.playSound("beep");
        warningPlayedRef.current = true;
      }

      stopBlinking();
      if (timeLeft > 0) {
        soundPlayedRef.current = false;
      }
      if (timeLeft > warningSeconds) {
        warningPlayedRef.current = false;
      }
    }
  }, [isActive, timeLeft, warningSeconds]);

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
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    stopBlinking();
    soundPlayedRef.current = false;
    warningPlayedRef.current = false;

    const now = Date.now();
    setLocalStartTime(now);
    setLocalShockCount((c) => c + 1);
    setLocalLastAnalysisTime(null);
    setAnalysisSuppressedByShock(true);
    setTimeLeft(durationSeconds);
    onShock();
  };

  const handleAnalysisPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    stopBlinking();
    soundPlayedRef.current = false;
    warningPlayedRef.current = false;

    const now = Date.now();
    setAnalysisSuppressedByShock(false);
    setLocalLastAnalysisTime(now);
    setTimeLeft(durationSeconds);
    onAnalysis();
  };

  const handleShockBadgePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    if (!onCancelLastShock) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancelLastShock();
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = durationSeconds > 0 ? timeLeft / durationSeconds : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
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
        style={{
          transform: [{ scale: Animated.multiply(scaleAnim, shockBounceAnim) }],
        }}
      >
        <View
          style={[
            styles.buttonCircle,
            {
              width: circleSize - 6,
              height: circleSize - 6,
              borderRadius: (circleSize - 6) / 2,
            },
            theme === "dark"
              ? { backgroundColor: "#353636" }
              : { backgroundColor: "#F5F5F5" },
          ]}
        >
          <Ionicons name="flash" size={32} color="black" />
          <Text style={styles.labelText}>CHOC</Text>
          <Pressable
            style={styles.badge}
            onPress={handleShockBadgePress}
            onPressIn={(event) => event.stopPropagation()}
            hitSlop={10}
          >
            <Text style={styles.badgeText}>{localShockCount}</Text>
          </Pressable>
        </View>
      </AnimatedTouchableOpacity>

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
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, analysisBounceAnim) },
            ],
          },
          { width: circleSize, height: circleSize },
        ]}
      >
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#f5dd4b"
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
            theme === "dark"
              ? { backgroundColor: "#353636" }
              : { backgroundColor: "#F5F5F5" },
          ]}
        >
          <Ionicons
            name="stopwatch-outline"
            size={32}
            style={[
              theme === "dark"
                ? { color: "#ccc", marginBottom: 4 }
                : { color: "#000", marginBottom: 4 },
            ]}
          />
          <Text
            style={[
              styles.timerText,
              theme === "dark" ? { color: "#ccc" } : { color: "#000" },
            ]}
          >
            {formatTime(timeLeft)}
          </Text>
          <Text
            style={[
              styles.labelText,
              theme === "dark" ? { color: "#ccc" } : { color: "#000" },
            ]}
          >
            ANALYSE
          </Text>
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
