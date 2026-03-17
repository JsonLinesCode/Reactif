import React, { useEffect, useState } from "react";
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
  const {
    shockDuration,
    cordaroneDuration,
    adrenalineDuration,
    warningSeconds,
  } = useCprSettings();

  // ----- Metronome State & Logic -----
  const [bpm, setBpm] = useState(100);
  const [isMuted, setIsMuted] = useState(true);

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
      setControllerTick((t) => t + 1);
    });
    return () => {
      unsubscribe();
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
    return () => {
      unsubscribe();
    };
  }, []);

  const cordaroneCount = cordaroneCountState;
  const adrenalineCount = adrenalineCountState;

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
  };

  const handleCancel = () => {
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
            shockCount={shockCount}
            resetSignal={cancelResetSignal}
            warningSeconds={warningSeconds}
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
            lastActionTime={lastCordaroneTimeState}
            durationSeconds={cordaroneDuration} // Use setting
            subtitle={doses.cordarone ? `${doses.cordarone} mg` : undefined}
            resetSignal={cancelResetSignal}
            warningSeconds={warningSeconds}
          />

          <ActionProgressBar
            label="Adrenaline"
            count={adrenalineCount}
            color="#448AFF"
            icon={<FontAwesome5 name="syringe" size={24} />}
            onPress={sessionController.logAdrenaline}
            lastActionTime={lastAdrenalineTimeState}
            durationSeconds={adrenalineDuration} // Use setting
            subtitle={doses.adrenaline ? `${doses.adrenaline} mg` : undefined}
            resetSignal={cancelResetSignal}
            warningSeconds={warningSeconds}
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
