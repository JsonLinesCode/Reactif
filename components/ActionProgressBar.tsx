import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ActionProgressBarProps {
  label: string;
  count: number;
  color: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  lastActionTime?: number; // timestamp
  durationSeconds?: number;
}

export default function ActionProgressBar({
  label,
  count,
  color,
  iconName,
  onPress,
  lastActionTime,
  durationSeconds = 120, // Default 2 minutes
}: ActionProgressBarProps) {
  const [elapsed, setElapsed] = useState(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!lastActionTime) {
      setElapsed(0);
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
  const progressPercent = Math.min(
    100,
    Math.max(0, (timeLeft / durationSeconds) * 100),
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.container, { borderColor: color }]}
    >
      {/* First layer */}
      <View style={styles.layer}>
        <View style={styles.content}>
          {iconName && (
            <Ionicons
              name={iconName}
              size={24}
              color={color}
              style={styles.icon}
            />
          )}
          <View style={styles.labelContainer}>
            <Text style={[styles.label, { color }]}>{label}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Text style={[styles.badgeText, { color: "#fff" }]}>{count}</Text>
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
          {iconName && (
            <Ionicons
              name={iconName}
              size={24}
              color="#fff"
              style={styles.icon}
            />
          )}
          <View style={styles.labelContainer}>
            <Text style={[styles.label, { color: "#fff" }]}>{label}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: "#fff" }]}>
            <Text style={[styles.badgeText, { color }]}>{count}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: 28,
    marginBottom: 12,
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
    borderColor: "#fff"
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: "100%",
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
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  badgeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
