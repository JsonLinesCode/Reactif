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
import MetronomeControl from "@/components/MetronomeControl";
import ShockTimer from "@/components/ShockTimer";

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
  const [lastShockTime, setLastShockTime] = useState<number>(Date.now());
  const [shockCount, setShockCount] = useState(1);

  const [lastCordaroneTime, setLastCordaroneTime] = useState<number>(
    Date.now(),
  );
  const [cordaroneCount, setCordaroneCount] = useState(1);

  const [lastAdrenalineTime, setLastAdrenalineTime] = useState<number>(
    Date.now(),
  );
  const [adrenalineCount, setAdrenalineCount] = useState(1);

  // Actions
  const handleShock = () => {
    setShockCount((c) => c + 1);
    setLastShockTime(Date.now());
  };

  const handleCordarone = () => {
    setCordaroneCount((c) => c + 1);
    setLastCordaroneTime(Date.now());
  };

  const handleAdrenaline = () => {
    setAdrenalineCount((c) => c + 1);
    setLastAdrenalineTime(Date.now());
  };

  const handleEnd = () => console.log("End CPR");
  const handleEvent = () => console.log("Add Event");
  const handleCancel = () => console.log("Cancel last");

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        {/* Top Timer */}
        <CprTimer />

        {/* Shock Circular Timer */}
        <ShockTimer onShock={handleShock} lastShockTime={lastShockTime} />

        {/* Action Progress Bars */}
        <View style={styles.actionsContainer}>
          <ActionProgressBar
            label="Choc"
            count={shockCount}
            color="#FF5252"
            iconName="flash"
            onPress={handleShock}
            lastActionTime={lastShockTime}
            durationSeconds={120}
          />

          <ActionProgressBar
            label="Cordarone"
            count={cordaroneCount}
            color="#448AFF"
            iconName="medkit"
            onPress={handleCordarone}
            lastActionTime={lastCordaroneTime}
            durationSeconds={300}
          />

          <ActionProgressBar
            label="Adrenaline"
            count={adrenalineCount}
            color="#448AFF"
            iconName="eyedrop"
            onPress={handleAdrenaline}
            lastActionTime={lastAdrenalineTime}
            durationSeconds={240}
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
