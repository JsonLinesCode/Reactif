import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";

export class SoundController {
  private tickSound: Audio.Sound | null = null;

  async init() {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      playThroughEarpieceAndroid: false,
    });

    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/audio/metronome_tick.wav"),
    );
    this.tickSound = sound;
  }

  async playTick() {
    await this.tickSound?.replayAsync();
  }

  async dispose() {
    await this.tickSound?.unloadAsync();
    this.tickSound = null;
  }
}