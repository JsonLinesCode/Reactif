import { sessionStore } from "@/store/sessionStore";
import { getCurrentCycleElapsedSeconds } from "@/utils/sessionUtils";
import React, { useEffect, useState } from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import EventSelectionModal from "@/components/EventSelectionModal";
import Svg, { Text as SvgText } from "react-native-svg";

export default function CprTimer() {

  const [theme, setTheme] = useState(sessionStore.theme);

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
        setTheme(sessionStore.theme);
    })
  });

  const textStyleColor = {color: theme === "dark" ? "#ccc" : "#000"};
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
    <View style={[styles.container, theme === "dark" ? {backgroundColor: "#333", borderColor: "#ccc"} : {}]}>
      <Text style={[styles.label, textStyleColor]}>Durée RCP</Text>
      <View style={[styles.timerContainer, theme === "dark" ? {backgroundColor: "#333", borderColor: "#ccc"} : {}]}>
        <Text style={[styles.timerText, textStyleColor]}>{formatTime(seconds)}</Text>
      </View>
      <Text style={{ color: "#fff", marginTop: 8 }}>SAISIE ÉVENEMENTS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderWidth: 4,
    borderColor: '#333',
    borderRadius: 25,
    padding: 16,
    alignItems: "center",
    width: "100%",
  },
  label: {
    color: "black",
    fontSize: 20,
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
