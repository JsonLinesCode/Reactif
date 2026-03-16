import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ActionButtons from "@/components/ActionButtons";
import ActionProgressBar from "@/components/ActionProgressBar";
import CprTimer from "@/components/CprTimer";
import EventSelectionModal from "@/components/EventSelectionModal";
import MetronomeControl from "@/components/MetronomeControl";
import ShockTimer from "@/components/ShockTimer";
import { useCprSettings } from "@/hooks/useCprSettings";
import { sessionStore } from "@/store/sessionStore";

import { metronomeController } from "@/controllers/MetronomeController";
import { sessionController } from "@/controllers/SessionController";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Cpr() {
  const router = useRouter();
  const { shockDuration, cordaroneDuration, adrenalineDuration, loading } =
    useCprSettings(); // load settings

  // ----- Metronome State & Logic -----
  const [bpm, setBpm] = useState(100);
  const [isMuted, setIsMuted] = useState(true);
  const soundRef = useRef(null);

  // Doses State
  const [doses, setDoses] = useState({
    adrenaline: sessionStore.getAdrenalineDose(),
    cordarone: sessionStore.getCordaroneDose(),
    energy: sessionStore.getEnergyDose(),
  });

  // Re-render when controller notifies so controller getters update
  const [, setControllerTick] = useState(0);
  useEffect(() => {
    const unsubscribe = sessionController.subscribe(() => {
      // Debug: confirm controller notifications reach this component
      // eslint-disable-next-line no-console
      console.log("Cpr: sessionController.notify received");
      // Debug: inspect session store contents
      // eslint-disable-next-line no-console
      console.log(
        "Cpr: sessionStore events:",
        sessionStore.getSession()?.events?.length,
        sessionStore.getSession()?.events?.slice(-3),
      );
      setControllerTick((t) => t + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Ensure metronome controller reflects initial UI state
  useEffect(() => {
    metronomeController.setBpm(bpm);
    metronomeController.setMuted(isMuted);
    return () => {
      // keep controller alive across screens; do not dispose here
    };
  }, []);

  // Listen to session store to stop metronome on definitive end and update doses
  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
      const currentSession = sessionStore.getSession();
      if (currentSession?.endTime) {
        setIsMuted(true);
        metronomeController.setMuted(true);
      }
      // Keep local doses state in sync with store
      setDoses({
        adrenaline: sessionStore.getAdrenalineDose(),
        cordarone: sessionStore.getCordaroneDose(),
        energy: sessionStore.getEnergyDose(),
      });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Update shared values
  useEffect(() => {
    metronomeController.setBpm(bpm);
  }, [bpm]);

  useEffect(() => {
    metronomeController.setMuted(isMuted);
  }, [isMuted]);

  // metronomeController handles timing and sound

  const shockCount = sessionController.getCount("shock");
  const lastShockTime = sessionController.getLastTime("shock");
  const lastAnalysisTime = sessionController.getLastTime("analysis");
  const lastCordaroneTime = sessionController.getLastTime("cordarone");
  const lastAdrenalineTime = sessionController.getLastTime("adrenaline");
  // Local UI state for medication counts and last timestamps so React updates reliably
  const [cordaroneCountState, setCordaroneCountState] = useState(
    sessionController.getCount("cordarone"),
  );
  const [adrenalineCountState, setAdrenalineCountState] = useState(
    sessionController.getCount("adrenaline"),
  );
  const [lastCordaroneTimeState, setLastCordaroneTimeState] = useState<
    number | null
  >(sessionController.getLastTime("cordarone"));
  const [lastAdrenalineTimeState, setLastAdrenalineTimeState] = useState<
    number | null
  >(sessionController.getLastTime("adrenaline"));

  // Keep these derived values in sync with the session store when controller notifies
  useEffect(() => {
    const updateFromStore = () => {
      const events = sessionStore.getSession()?.events || [];
      const cordEvents = events.filter((e) => e.type === "cordarone");
      const adrEvents = events.filter((e) => e.type === "adrenaline");

      setCordaroneCountState(cordEvents.length);
      setAdrenalineCountState(adrEvents.length);
      setLastCordaroneTimeState(
        cordEvents.length ? cordEvents[cordEvents.length - 1].timestamp : null,
      );
      setLastAdrenalineTimeState(
        adrEvents.length ? adrEvents[adrEvents.length - 1].timestamp : null,
      );
    };

    // initialize once
    updateFromStore();
    const unsubscribe = sessionController.subscribe(() => {
      updateFromStore();
    });
    return () => unsubscribe();
  }, []);
  /*
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

  // Initialize logs from session store to persist counts on resume
  const [logs, setLogs] = useState<
    { type: string; timestamp: number; details?: any }[]
  >(() => {
    const currentSession = sessionStore.getSession();
    if (currentSession && currentSession.events) {
       return currentSession.events.map(e => ({
         type: e.type,
         timestamp: e.timestamp,
         details: e.details
       }));
    }
    return [];
  });

  // Helper to get last action time
  const getLastTime = (type: string) => {
    const relevantLogs = logs.filter((l) => l.type === type);
    return relevantLogs.length > 0
      ? relevantLogs[relevantLogs.length - 1].timestamp
      : null;
  };

  // Helper to get counts
  const getCount = (type: string) => {
    return logs.filter((l) => l.type === type).length;
  };

  const shockCount = getCount("shock");
  const lastShockTime = getLastTime("shock");
  const lastAnalysisTime = getLastTime("analysis");

  const cordaroneCount = getCount("cordarone");
  const lastCordaroneTime = getLastTime("cordarone");

  const adrenalineCount = getCount("adrenaline");
  const lastAdrenalineTime = getLastTime("adrenaline");*/
  // use state-backed derived counts
  const cordaroneCount = cordaroneCountState;
  const adrenalineCount = adrenalineCountState;

  // Debug: log counts on each render
  // eslint-disable-next-line no-console
  console.log("Cpr render counts:", { cordaroneCount, adrenalineCount });

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [cancelResetSignal, setCancelResetSignal] = useState(0);

  const handleEnd = () => {
    // Navigate to End Cpr flow
    router.push("/cprEndFirstPage" as any);
  };
  const handleEvent = () => setModalVisible(true);

  const handleSaveEvents = (selectedEvents: string[]) => {
    sessionController.logEvents(selectedEvents);
    console.log("Logged events:", selectedEvents);
  };

  const handleCancel = () => {
    console.log("Cancelled last action");
    sessionController.cancelLast();
    setCancelResetSignal((v) => v + 1);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.container}>
        {/* Top Timer */}
        <TouchableOpacity onPress={handleEvent}>
          <CprTimer />
        </TouchableOpacity>

        {/* Shock Circular Timer */}
        {/* Pass shockDuration from settings */}
        <View>
          <ShockTimer
            onShock={sessionController.logShock}
            onAnalysis={sessionController.logAnalysis}
            lastShockTime={lastShockTime}
            lastAnalysisTime={lastAnalysisTime}
            durationSeconds={shockDuration}
            durationMinutes={shockDuration}
            shockCount={shockCount}
            resetSignal={cancelResetSignal}
          />
        </View>

        {/* Action Progress Bars */}
        <View style={styles.actionsContainer}>
          <ActionProgressBar
            label="Cordarone"
            count={cordaroneCount}
            color="#448AFF"
            icon={<FontAwesome5 name="syringe" size={24} />}
            onPress={sessionController.logCordarone}
            lastActionTime={lastCordaroneTime}
            durationSeconds={cordaroneDuration} // Use setting
            subtitle={doses.cordarone ? `${doses.cordarone} mg` : undefined}
            soundSource={require("@/assets/audio/beep.wav")}
            resetSignal={cancelResetSignal}
          />

          <ActionProgressBar
            label="Adrenaline"
            count={adrenalineCount}
            color="#448AFF"
            icon={<FontAwesome5 name="syringe" size={24} />}
            onPress={sessionController.logAdrenaline}
            lastActionTime={lastAdrenalineTime}
            durationSeconds={adrenalineDuration} // Use setting
            subtitle={doses.adrenaline ? `${doses.adrenaline} mg` : undefined}
            soundSource={require("@/assets/audio/beep.wav")}
            resetSignal={cancelResetSignal}
          />
        </View>

        {/* Action Buttons Grid */}
        <ActionButtons
          onEnd={handleEnd}
          //onEvent={handleEvent}
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
