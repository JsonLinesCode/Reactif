import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";

import {
  DEFAULT_SOUND_CHOICES,
  getSoundChoices,
  makeTimerSoundSlot,
  ReminderSoundKind,
  resetSoundChoice,
  resetSoundChoices,
  saveSoundChoice,
  SoundAssetName,
  SoundSlot,
  TimerSoundKind,
} from "@/utils/soundChoices";

export type SoundName = SoundSlot;

const SOUND_FILES: Record<SoundAssetName, any> = {
  metronomeTickWav: require("@/assets/audio/metronome_tick.wav"),
  metronomeTickMp3: require("@/assets/audio/metronome_tick.mp3"),
  beep: require("@/assets/audio/beep.wav"),
  beepShock: require("@/assets/audio/beep_shock.wav"),
  beep2: require("@/assets/audio/Beep2.mp3"),
  beep3: require("@/assets/audio/Beep3.mp3"),
  beep4: require("@/assets/audio/Beep4.mp3"),
};

export class SoundController {
  private sounds: Partial<Record<SoundSlot, Audio.Sound | null>> = {};
  private choices: Record<SoundSlot, SoundAssetName> = {
    ...DEFAULT_SOUND_CHOICES,
  };
  private initialized = false;
  private volume = 1;

  private get slots() {
    return Object.keys(DEFAULT_SOUND_CHOICES) as SoundSlot[];
  }

  private getSource(slot: SoundSlot) {
    const selected = this.choices[slot] ?? DEFAULT_SOUND_CHOICES[slot];
    return SOUND_FILES[selected] ?? SOUND_FILES[DEFAULT_SOUND_CHOICES[slot]];
  }

  private async loadSlot(slot: SoundSlot) {
    try {
      await this.sounds[slot]?.unloadAsync();
    } catch {
      // ignore unload errors
    }

    try {
      const result = await Audio.Sound.createAsync(this.getSource(slot));
      await result.sound.setVolumeAsync(this.volume);
      this.sounds[slot] = result.sound;
    } catch {
      this.sounds[slot] = null;
    }
  }

  async init() {
    if (this.initialized) return;
    this.choices = await getSoundChoices();

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      playThroughEarpieceAndroid: false,
    });

    for (const slot of this.slots) {
      await this.loadSlot(slot);
    }

    this.initialized = true;
  }

  async play(slot: SoundSlot) {
    if (!this.initialized) await this.init();
    const sound = this.sounds[slot];
    try {
      if (!sound) return;
      await sound.setVolumeAsync(this.volume);
      await sound.replayAsync();
    } catch {
      // ignore playback errors
    }
  }

  async playAsset(assetName: SoundAssetName) {
    if (!this.initialized) await this.init();

    try {
      const result = await Audio.Sound.createAsync(SOUND_FILES[assetName], {
        shouldPlay: true,
        volume: this.volume,
      });
      result.sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          result.sound.unloadAsync().catch(() => {});
        }
      });
    } catch {
      // ignore preview errors
    }
  }

  async setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (!this.initialized) {
      await this.init();
      return;
    }

    for (const slot of this.slots) {
      try {
        await this.sounds[slot]?.setVolumeAsync(this.volume);
      } catch {
        // ignore volume update errors
      }
    }
  }

  private async wait(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  async playReminderPattern(
    kind: ReminderSoundKind,
    timerKind: TimerSoundKind = "generic",
  ) {
    const slot = makeTimerSoundSlot(timerKind, kind);

    if (kind === "end") {
      await this.play(slot);
      return;
    }

    const count = kind === "first" ? 2 : 3;
    for (let i = 0; i < count; i += 1) {
      await this.play(slot);
      if (i < count - 1) {
        await this.wait(220);
      }
    }
  }

  async playTick() {
    return this.play("tick");
  }

  async setSoundChoice(slot: SoundSlot, assetName: SoundAssetName) {
    this.choices = await saveSoundChoice(slot, assetName);
    if (this.initialized) {
      await this.loadSlot(slot);
    }
  }

  async resetSoundChoice(slot: SoundSlot) {
    this.choices = await resetSoundChoice(slot);
    if (this.initialized) {
      await this.loadSlot(slot);
    }
  }

  async resetSoundChoices() {
    this.choices = await resetSoundChoices();
    if (!this.initialized) return;

    for (const slot of this.slots) {
      await this.loadSlot(slot);
    }
  }

  async stopAll() {
    for (const slot of this.slots) {
      try {
        await this.sounds[slot]?.stopAsync();
      } catch {
        // ignore stop errors
      }
    }
  }

  async dispose() {
    for (const slot of this.slots) {
      try {
        await this.sounds[slot]?.unloadAsync();
      } catch {}
      this.sounds[slot] = null;
    }
    this.initialized = false;
  }
}

export const soundController = new SoundController();
