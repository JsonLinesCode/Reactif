import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  runOnJS,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import ActionButtons from "@/components/ActionButtons";
import ActionProgressBar from "@/components/ActionProgressBar";
import CprTimer from "@/components/CprTimer";
import EventSelectionModal from "@/components/EventSelectionModal";
import MetronomeControl from "@/components/MetronomeControl";
import ShockTimer from "@/components/ShockTimer";
import { useCprSettings } from "@/hooks/useCprSettings";

// Configure audio session
const configureAudio = async () => {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    interruptionModeIOS: InterruptionModeIOS.DuckOthers,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    playThroughEarpieceAndroid: false,
  });
};

export default function Cpr() {
  const { shockDuration, cordaroneDuration, adrenalineDuration, loading } =
    useCprSettings(); // load settings

  // ----- Metronome State & Logic -----
  const [bpm, setBpm] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Shared values for metronome timing
  const isPlayingSV = useSharedValue(false);
  const intervalMsSV = useSharedValue(0);
  const nextTickSV = useSharedValue(0);

  useEffect(() => {
    configureAudio();
    async function loadSound() {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/audio/metronome_tick.wav"),
      );
      soundRef.current = sound;
    }
    loadSound();
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  // Update shared values
  useEffect(() => {
    isPlayingSV.value = !isMuted;

    if (bpm > 0) {
      intervalMsSV.value = (60 / bpm) * 1000;
    }
  }, [bpm, isMuted]);

  const playSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.replayAsync();
      } catch (error) {
        console.log("Sound error", error);
      }
    }
  };

  useFrameCallback((frameInfo) => {
    if (!isPlayingSV.value || !frameInfo || !frameInfo.timestamp) {
      return;
    }

    const now = frameInfo.timestamp;

    if (nextTickSV.value === 0) {
      nextTickSV.value = now;
    }

    if (now >= nextTickSV.value) {
      runOnJS(playSound)();
      nextTickSV.value += intervalMsSV.value;
      if (now > nextTickSV.value + intervalMsSV.value) {
        nextTickSV.value = now + intervalMsSV.value;
      }
    }
  });

  // ----- CPR State -----
  const [startTime] = useState(Date.now());
  const [logs, setLogs] = useState<
    { type: string; timestamp: number; details?: any }[]
  >([]);

  // Helper to get last action time
  const getLastTime = (type: string) => {
    const relevantLogs = logs.filter((l) => l.type === type);
    return relevantLogs.length > 0
      ? relevantLogs[relevantLogs.length - 1].timestamp
      : startTime;
  };

  // Helper to get counts
  const getCount = (type: string) => {
    return logs.filter((l) => l.type === type).length + 1;
  };

  const shockCount = getCount("shock");
  const lastShockTime = getLastTime("shock");

  const cordaroneCount = getCount("cordarone");
  const lastCordaroneTime = getLastTime("cordarone");

  const adrenalineCount = getCount("adrenaline");
  const lastAdrenalineTime = getLastTime("adrenaline");

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);

  // Actions
  const handleShock = () => {
    setLogs((prev) => [...prev, { type: "shock", timestamp: Date.now() }]);
  };

  const handleCordarone = () => {
    setLogs((prev) => [...prev, { type: "cordarone", timestamp: Date.now() }]);
  };

  const handleAdrenaline = () => {
    setLogs((prev) => [...prev, { type: "adrenaline", timestamp: Date.now() }]);
  };

  const handleEnd = () => console.log("End CPR");
  const handleEvent = () => setModalVisible(true);

  const handleSaveEvents = (selectedEvents: string[]) => {
    const now = Date.now();
    const newLogs = selectedEvents.map((event) => ({
      type: "event",
      timestamp: now,
      details: event,
    }));
    setLogs((prev) => [...prev, ...newLogs]);
    console.log("Logged events:", selectedEvents);
  };

  const handleCancel = () => {
    setLogs((prev) => {
      if (prev.length === 0) return prev;
      const newLogs = [...prev];
      newLogs.pop();
      return newLogs;
    });
    console.log("Cancelled last action");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        {/* Top Timer */}
        <CprTimer />

        {/* Shock Circular Timer */}
        {/* Pass shockDuration from settings */}
        <ShockTimer
          onShock={handleShock}
          lastShockTime={lastShockTime}
          durationSeconds={shockDuration}
        />

        {/* Action Progress Bars */}
        <View style={styles.actionsContainer}>
          <ActionProgressBar
            label="Choc"
            count={shockCount}
            color="#FF5252"
            iconName="flash"
            onPress={handleShock}
            lastActionTime={lastShockTime}
            durationSeconds={shockDuration} // Use setting
          />

          <ActionProgressBar
            label="Cordarone"
            count={cordaroneCount}
            color="#448AFF"
            iconName="medkit"
            onPress={handleCordarone}
            lastActionTime={lastCordaroneTime}
            durationSeconds={cordaroneDuration} // Use setting
          />

          <ActionProgressBar
            label="Adrenaline"
            count={adrenalineCount}
            color="#448AFF"
            iconName="eyedrop"
            onPress={handleAdrenaline}
            lastActionTime={lastAdrenalineTime}
            durationSeconds={adrenalineDuration} // Use setting
          />
        </View>

        {/* Action Buttons Grid */}
        <ActionButtons
          onEnd={handleEnd}
          onEvent={handleEvent}
          onCancel={handleCancel}
        />

        {/* Metronome */}
        <MetronomeControl
          bpm={bpm}
          setBpm={setBpm}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />

        <EventSelectionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSaveEvents}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
    gap: 5,
  },
  actionsContainer: {
    width: "100%",
  },
});
