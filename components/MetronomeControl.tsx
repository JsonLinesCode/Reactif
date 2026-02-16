import { Ionicons } from "@expo/vector-icons";
import React from "react";
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
  const decreaseBpm = () => setBpm(Math.max(30, bpm - 10)); // Steps of 10 usually? Or 5? Or 1? Screenshot is just +/-. Assume standard.
  const increaseBpm = () => setBpm(Math.min(240, bpm + 10));

  return (
    <View style={styles.container}>
      {/* BPM Control */}
      <View style={styles.bpmContainer}>
        <TouchableOpacity style={styles.bpmButton} onPress={decreaseBpm}>
          <Ionicons name="remove" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.bpmDisplay}>
          <Text style={styles.bpmValue}>{bpm}</Text>
          <Text style={styles.bpmLabel}>BPM</Text>
        </View>

        <TouchableOpacity style={styles.bpmButton} onPress={increaseBpm}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Mute Toggle */}
      <View style={styles.muteContainer}>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={!isMuted ? "#f4f3f4" : "#f5dd4b"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setIsMuted(!isMuted)}
          value={!isMuted} // Switch represents "Sound On" maybe? Or Mute? Screenshot has speaker icon. Usually checks "sound on".
        />
        <Ionicons
          name={isMuted ? "volume-mute" : "volume-high"}
          size={24}
          color="#000"
          style={{ marginLeft: 8 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 16,
    padding: 12,
    width: "100%",
  },
  bpmContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#444", // slightly lighter background for control? Or transpaernt. Screenshot shows grey container.
    borderRadius: 8,
  },
  bpmButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ccc",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  bpmDisplay: {
    alignItems: "center",
    width: 60,
  },
  bpmValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  bpmLabel: {
    fontSize: 10,
    color: "#ccc",
  },
  muteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff", // Toggle background
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
