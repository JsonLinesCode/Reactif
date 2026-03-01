import { Audio } from "expo-av";
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
  icon?: React.ReactElement; // Should be a valid element we can clone
  onPress: () => void;
  lastActionTime?: number | null; // timestamp
  durationSeconds?: number;
  subtitle?: string;
  soundSource?: any;
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
  durationSeconds = 120, // Default 2 minutes
  subtitle,
  soundSource,
}: ActionProgressBarProps) {
  const [elapsed, setElapsed] = useState(0);
  const [width, setWidth] = useState(0);

  const blinkAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const soundPlayedRef = useRef(false);
  const blinkingRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!lastActionTime) {
      setElapsed(0);
      soundPlayedRef.current = false;
      stopBlinking();
      return;
    }

    const updateElapsed = () => {
      const current = Date.now();
      const diff = Math.floor((current - lastActionTime) / 1000);
      setElapsed(diff);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [lastActionTime]);

  const timeLeft = Math.max(0, durationSeconds - elapsed);
  const isExpired = elapsed >= durationSeconds;

  useEffect(() => {
    if (isExpired) {
      if (!soundPlayedRef.current) {
        playSound();
        triggerHaptic();
        soundPlayedRef.current = true;
      }
      startBlinking();
    } else {
      stopBlinking();
      if (timeLeft > 0) {
        soundPlayedRef.current = false; // Reset if time is added back for some reason, or user resets
      }
    }
  }, [isExpired, timeLeft]);

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        soundSource || require("../assets/audio/beep.wav"),
      );
      await sound.playAsync();
    } catch (error) {
      console.log("Error playing sound", error);
    }
  };

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
    // Bounce on tap
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

    // Stop blinking immediately on press (as it resets the timer usually)
    stopBlinking();
    soundPlayedRef.current = false;

    onPress();
  };

  const progressPercent = Math.min(
    100,
    Math.max(0, (timeLeft / durationSeconds) * 100),
  );

  return (
    <View style={[styles.buttonContainer]}>
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
              {subtitle && (
                <Text style={[styles.subtitle, { color }]}>{subtitle}</Text>
              )}
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
              {subtitle && (
                <Text style={[styles.subtitle, { color: "#fff" }]}>
                  {subtitle}
                </Text>
              )}
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
    flex: 1,
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
    borderRadius: 28,
    borderWidth: 2,
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
