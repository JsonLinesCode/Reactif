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
import { sessionStore } from "@/store/sessionStore";

import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";

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
  const [isMuted, setIsMuted] = useState(true);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Shared values for metronome timing
  const isPlayingSV = useSharedValue(false);
  const intervalMsSV = useSharedValue(0);
  const nextTickSV = useSharedValue(0);

  // Doses State
  const [doses, setDoses] = useState({
    adrenaline: sessionStore.getAdrenalineDose(),
    cordarone: sessionStore.getCordaroneDose(),
    energy: sessionStore.getEnergyDose(),
  });

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

  // Listen to session store to stop metronome on definitive end and update doses
  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
      const currentSession = sessionStore.getSession();
      if (currentSession?.endTime) {
        setIsMuted(true);
        isPlayingSV.value = false;
      }
      setDoses({
        adrenaline: sessionStore.getAdrenalineDose(),
        cordarone: sessionStore.getCordaroneDose(),
        energy: sessionStore.getEnergyDose(),
      });
    });
    return unsubscribe;
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
    const timestamp = Date.now();
    setLogs((prev) => [...prev, { type: "shock", timestamp }]);
    sessionStore.logEvent("shock", { timestamp });
  };

  const handleCordarone = () => {
    const timestamp = Date.now();
    setLogs((prev) => [...prev, { type: "cordarone", timestamp }]);
    sessionStore.logEvent("cordarone", { timestamp });
  };

  const handleAdrenaline = () => {
    const timestamp = Date.now();
    setLogs((prev) => [...prev, { type: "adrenaline", timestamp }]);
    sessionStore.logEvent("adrenaline", { timestamp });
  };

  const handleEnd = () => {
    // Navigate to End Cpr flow
    router.push("/cprEnd");
  };
  const handleEvent = () => setModalVisible(true);

  const handleSaveEvents = (selectedEvents: string[]) => {
    const now = Date.now();
    const newLogs = selectedEvents.map((event) => ({
      type: "event",
      timestamp: now,
      details: event,
    }));
    setLogs((prev) => [...prev, ...newLogs]);

    // Log each event to session store
    selectedEvents.forEach((event) => {
      sessionStore.logEvent("event", event);
    });

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        {/* Top Timer */}
        <CprTimer />

        {/* Shock Circular Timer */}
        {/* Pass shockDuration from settings */}
        <View>
          <ShockTimer
            onShock={handleShock}
            lastShockTime={lastShockTime}
            durationSeconds={shockDuration}
            shockCount={shockCount}
          />
        </View>

        {/* Action Progress Bars */}
        <View style={styles.actionsContainer}>
          <ActionProgressBar
            label="Cordarone"
            count={cordaroneCount}
            color="#448AFF"
            icon={<FontAwesome5 name="syringe" size={24} />}
            onPress={handleCordarone}
            lastActionTime={lastCordaroneTime}
            durationSeconds={cordaroneDuration} // Use setting
            subtitle={doses.cordarone ? `${doses.cordarone} mg` : undefined}
            soundSource={require("@/assets/audio/beep.wav")}
          />

          <ActionProgressBar
            label="Adrenaline"
            count={adrenalineCount}
            color="#448AFF"
            icon={<FontAwesome5 name="syringe" size={24} />}
            onPress={handleAdrenaline}
            lastActionTime={lastAdrenalineTime}
            durationSeconds={adrenalineDuration} // Use setting
            subtitle={doses.adrenaline ? `${doses.adrenaline} mg` : undefined}
            soundSource={require("@/assets/audio/beep.wav")}
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
    flexDirection: "column",
    flex: 1,
    width: "100%",
  },
});
