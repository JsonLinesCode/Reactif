import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { BackgroundTimer } from "react-native-nitro-bg-timer";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Cpr() {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);

  // Ref to hold the single sound object to prevent "layering"
  const soundRef = useRef<Audio.Sound | null>(null);

  // 1. Pre-load the sound once
  useEffect(() => {
    async function loadSound() {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/audio/metronome_tick.mp3"), // Use a short, uncompressed .wav
        { shouldPlay: false },
      );
      soundRef.current = sound;

      // Set audio category for low-latency/background play
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
      });
    }
    loadSound();

    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  // 2. The Tick Function
  const playTick = async () => {
    if (soundRef.current) {
      try {
        // Reset and play immediately (avoids stacking instances)
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      } catch (e) {
        console.error("Tick failed", e);
      }
    }
  };

  // 3. Toggle the Nitro Timer
  const toggleMetronome = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      const intervalMs = (60 / bpm) * 1000;

      BackgroundTimer.setInterval(() => {
        playTick();
      }, intervalMs);

      setIsPlaying(true);
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1000);

    return () => clearInterval(interval);
  }, [fadeAnim]);
  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.chronoContainer, { opacity: fadeAnim }]}>
        <Text style={styles.chronoText}>test</Text>
      </Animated.View>
      <Text>
        fdsoifhjsdoiufuiopdsjufopijsdopijfoipsdjfjiosdjfoipsdjopifjisdojfisjdfiop
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chronoContainer: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 15, // Reduced padding
    paddingHorizontal: 20,
    marginBottom: 20, // Reduced margin
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chronoText: {
    fontSize: 50, // Reduced size
    fontWeight: "bold",
    color: "#0A3D62",
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#25292e",
    justifyContent: "center",
    alignItems: "center",
  },
});
