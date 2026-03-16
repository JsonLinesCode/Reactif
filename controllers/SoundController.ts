import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";

export type SoundName = "tick" | "beep";

const SOUND_FILES: Record<SoundName, any> = {
  tick: require("@/assets/audio/metronome_tick.wav"),
  beep: require("@/assets/audio/beep.wav"),
};

export class SoundController {
  private sounds: Partial<Record<SoundName, Audio.Sound | null>> = {};
  private initialized = false;

  async init() {
    if (this.initialized) return;
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      playThroughEarpieceAndroid: false,
    });

    // initialize all sounds in a loop
    for (const name of Object.keys(SOUND_FILES) as SoundName[]) {
      try {
        const result = await Audio.Sound.createAsync(SOUND_FILES[name]);
        this.sounds[name] = result.sound;
      } catch (e) {
        this.sounds[name] = null;
      }
    }

    this.initialized = true;
  }

  async play(name: SoundName) {
    if (!this.initialized) await this.init();
    const sound = this.sounds[name];
    try {
      if (!sound) return;
      await sound.replayAsync();
    } catch (e) {
      // ignore playback errors
    }
  }

  async playTick() {
    return this.play("tick");
  }

  async dispose() {
    for (const k of Object.keys(this.sounds) as SoundName[]) {
      try {
        await this.sounds[k]?.unloadAsync();
      } catch (e) {}
      this.sounds[k] = null;
    }
    this.initialized = false;
  }
}

export const soundController = new SoundController();
