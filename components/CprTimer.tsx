import { sessionStore } from "@/store/sessionStore";
import { getCurrentCycleElapsedSeconds } from "@/utils/sessionUtils";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface CprTimerProps {
  isActive?: boolean;
}

export default function CprTimer({ isActive = true }: CprTimerProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const update = () => {
      setSeconds(
        getCurrentCycleElapsedSeconds(sessionStore.getSession(), Date.now()),
      );
    };

    update();
    const unsubscribe = sessionStore.subscribe(update);
    const interval = setInterval(() => {
      if (!isActive) return;
      update();
    }, 1000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Durée RCP</Text>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
      </View>
      <Text style={{ color: "#fff", marginTop: 8 }}>SAISIE ÉVENEMENTS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#333",
    borderRadius: 25,
    padding: 16,
    alignItems: "center",
    width: "100%",
  },
  label: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 4,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerText: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "bold",
  },
});
