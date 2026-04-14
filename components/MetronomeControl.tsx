import { sessionStore } from "@/store/sessionStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

interface MetronomeControlProps {
  bpm: number;
  setBpm: (bpm: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export default function MetronomeControl({
  bpm,
  setBpm,
  isMuted,
  setIsMuted,
}: MetronomeControlProps) {
  const [theme, setTheme] = useState(sessionStore.theme);

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
      setTheme(sessionStore.theme);
    });
    return () => unsubscribe();
  }, []);

  const isDark = theme === "dark";

  const decreaseBpm = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBpm(Math.max(100, bpm - 5));
  };
  const increaseBpm = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBpm(Math.min(120, bpm + 5));
  };

  return (
    <View
      style={[
        styles.container,
        isDark ? { backgroundColor: "#1f2937", borderColor: "#94a3b8" } : {},
      ]}
    >
      {/* BPM Control */}
      <View style={styles.bpmContainer}>
        <TouchableOpacity
          style={[
            styles.bpmButton,
            isDark ? { backgroundColor: "#374151" } : {},
          ]}
          onPress={decreaseBpm}
        >
          <Ionicons
            name="remove"
            size={20}
            color={isDark ? "#f3f4f6" : "#000"}
          />
        </TouchableOpacity>
        <View style={styles.bpmDisplay}>
          <Text
            style={[
              styles.bpmValue,
              isDark ? { color: "#e5e7eb" } : { color: "#333" },
            ]}
          >
            {bpm}
          </Text>
          <Text style={[styles.bpmLabel, isDark ? { color: "#94a3b8" } : {}]}>
            BPM
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.bpmButton,
            isDark ? { backgroundColor: "#374151" } : {},
          ]}
          onPress={increaseBpm}
        >
          <Ionicons name="add" size={20} color={isDark ? "#f3f4f6" : "#000"} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.muteContainer,
          isDark ? { backgroundColor: "#374151" } : {},
        ]}
      >
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={!isMuted ? "#f4f3f4" : "#f5dd4b"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setIsMuted(!isMuted)}
          value={!isMuted}
        />
        <Ionicons
          name={isMuted ? "volume-mute" : "volume-high"}
          size={24}
          color={isDark ? "#f3f4f6" : "#000"}
          style={{ marginLeft: 8 }}
        />
      </View>
    </View>
  );
}

// @ts-ignore
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#333",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: "100%",
  },
  bpmContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 8,
  },
  bpmButton: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ccc",
    borderRadius: 10,
    marginHorizontal: 4,
  },
  bpmDisplay: {
    alignItems: "center",
  },
  bpmValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  bpmLabel: {
    fontSize: 16,
    color: "#ccc",
  },
  muteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ccc", // Toggle background
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
