import { sessionController } from "@/controllers/SessionController";
import { formatSecondsToClock } from "@/utils/sessionUtils";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ActionProgressBarProps {
  label: string;
  count: number;
  color: string;
  icon?: React.ReactElement;
  onPress: () => void;
  lastActionTime?: number | null;
  durationSeconds?: number;
  warningSeconds?: number;
  subtitle?: string;
  resetRequest?: {
    token: number;
    target: "shockTimer" | "cordarone" | "adrenaline" | null;
  };
  resetKey?: "cordarone" | "adrenaline";
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function ActionProgressBar({
  label,
  count,
  color,
  icon,
  onPress,
  lastActionTime,
  durationSeconds = 120,
  warningSeconds = 10,
  subtitle,
  resetRequest,
  resetKey,
}: ActionProgressBarProps) {
  const [elapsed, setElapsed] = useState(0);
  const [width, setWidth] = useState(0);
  const [localLastActionTime, setLocalLastActionTime] = useState<number | null>(
    null,
  );

  const blinkAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const soundPlayedRef = useRef(false);
  const warningPlayedRef = useRef(false);
  const blinkingRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const effectiveLast = lastActionTime ?? localLastActionTime;

    if (!effectiveLast) {
      setElapsed(0);
      soundPlayedRef.current = false;
      warningPlayedRef.current = false;
      stopBlinking();
      return;
    }

    const updateElapsed = () => {
      const current = Date.now();
      const diff = Math.floor((current - effectiveLast) / 1000);
      setElapsed(diff);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [lastActionTime, localLastActionTime]);

  useEffect(() => {
    setLocalLastActionTime(null);
  }, [lastActionTime]);

  // Reset only when cancel targets this specific medication timer
  useEffect(() => {
    if (!resetRequest || !resetKey || resetRequest.target !== resetKey) return;
    setLocalLastActionTime(null);
    setElapsed(0);
    soundPlayedRef.current = false;
    warningPlayedRef.current = false;
    stopBlinking();
  }, [resetRequest, resetKey]);

  const timeLeft = Math.max(0, durationSeconds - elapsed);
  const isExpired = elapsed >= durationSeconds;

  useEffect(() => {
    if (isExpired) {
      if (!soundPlayedRef.current) {
        sessionController.playSound("beep");
        triggerHaptic();
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
  }, [isExpired, timeLeft, warningSeconds]);

  const triggerHaptic = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const startBlinking = () => {
    if (blinkingRef.current) return; // Already blinking

    blinkingRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(blinkAnim, {
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
    Animated.timing(blinkAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(blinkAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(blinkAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    stopBlinking();
    soundPlayedRef.current = false;
    warningPlayedRef.current = false;

    onPress();
    setLocalLastActionTime(Date.now());
  };

  const progressPercent = Math.min(
    100,
    Math.max(0, (timeLeft / durationSeconds) * 100),
  );
  const timeLeftText = formatSecondsToClock(timeLeft);

  return (
    <View style={styles.buttonContainer}>
      <AnimatedTouchableOpacity
        onPressIn={() => {
          Animated.timing(bounceAnim, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={() => {
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }).start();
        }}
        onPress={handlePress}
        activeOpacity={0.8}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={[
          styles.container,
          {
            opacity: blinkAnim,
            transform: [{ scale: bounceAnim }],

            borderColor: color,
          },
        ]}
      >
        {/* First layer */}
        <View style={[styles.layer]}>
          <View style={styles.content}>
            {icon && React.cloneElement(icon, { color: "#fff" } as any)}
            <View style={styles.labelContainer}>
              <Text style={[styles.label, { color }]}>{label}</Text>
              <Text style={[styles.subtitle, { color }]}>
                {subtitle ? `${subtitle} - ${timeLeftText}` : timeLeftText}
              </Text>
            </View>
          </View>
        </View>

        {/* Second layer */}
        <View
          style={[
            styles.layer,
            {
              width: `${progressPercent}%`,
              backgroundColor: color,
              overflow: "hidden",
            },
          ]}
        >
          <View style={[styles.content, { width: width - 7 }]}>
            {icon && React.cloneElement(icon, { color: "#fff" } as any)}
            <View style={styles.labelContainer}>
              <Text style={[styles.label, { color: "#fff" }]}>{label}</Text>
              <Text style={[styles.subtitle, { color: "#fff" }]}>
                {subtitle ? `${subtitle} - ${timeLeftText}` : timeLeftText}
              </Text>
            </View>
          </View>
        </View>
      </AnimatedTouchableOpacity>

      <View style={[styles.badge, { borderColor: color }]}>
        <Text style={[styles.badgeText, { color: color }]}>{count}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  container: {
    flex: 1,
    height: 54,
    borderRadius: 28,
    borderWidth: 2,
    position: "relative",
    justifyContent: "center",
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,

    borderWidth: 0,
    borderColor: "#fff",
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 10,
    width: 24,
    textAlign: "center",
  },
  labelContainer: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "normal",
  },
  badge: {
    borderWidth: 2,
    width: 54,
    height: 54,
    borderRadius: 1000,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  badgeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
