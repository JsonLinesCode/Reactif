import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";

export type SoundName = "tick" | "beep" | "beepLong";

const SOUND_FILES: Record<SoundName, any> = {
  tick: require("@/assets/audio/metronome_tick.wav"),
  beep: require("@/assets/audio/beep.wav"),
  beepLong: require("@/assets/audio/beep_shock.wav"),
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
      shouldDuckAndroid: false,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      playThroughEarpieceAndroid: false,
    });

    // initialize all sounds in a loop
    for (const name of Object.keys(SOUND_FILES) as SoundName[]) {
      try {
        const result = await Audio.Sound.createAsync(SOUND_FILES[name]);
        await result.sound.setVolumeAsync(1);
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
      await sound.setVolumeAsync(1);
      await sound.replayAsync();
    } catch (e) {
      // ignore playback errors
    }
  }

  private async wait(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  async playReminderPattern(kind: "first" | "mid" | "end") {
    if (kind === "end") {
      await this.play("beepLong");
      return;
    }

    const count = kind === "first" ? 2 : 3;
    for (let i = 0; i < count; i += 1) {
      await this.play("beep");
      if (i < count - 1) {
        await this.wait(220);
      }
    }
  }

  async playTick() {
    return this.play("tick");
  }

  async stopAll() {
    for (const k of Object.keys(this.sounds) as SoundName[]) {
      try {
        await this.sounds[k]?.stopAsync();
      } catch (e) {
        // ignore stop errors
      }
    }
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
