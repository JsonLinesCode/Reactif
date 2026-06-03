import { t } from "@/i18n";
import { sessionStore } from "@/store/sessionStore";
import { getCurrentCycleElapsedSeconds } from "@/utils/sessionUtils";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function CprTimer() {
  const [theme, setTheme] = useState(sessionStore.theme);

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
      setTheme(sessionStore.theme);
    });
    return unsubscribe;
  }, []);

  const textStyleColor = { color: theme === "dark" ? "#FFFF" : "#000" };
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
      update();
    }, 1000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View
      style={[
        styles.container,
        theme === "dark"
          ? { backgroundColor: "#333", borderColor: "#FFFF" }
          : {},
      ]}
    >
      <Text style={[styles.label, textStyleColor]}>{t("cpr.duration")}</Text>
      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, textStyleColor]}>
          {formatTime(seconds)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: "#333",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    width: "100%",
  },
  label: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerText: {
    color: "black",
    fontSize: 48,
    fontWeight: "bold",
  },
});
