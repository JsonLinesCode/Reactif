import { sessionStore } from "@/store/sessionStore";
import { SoundController } from "./SoundController";

export class MetronomeController {
  private bpm = 100;
  private muted = true;
  private timer: any = null;
  private initialized = false;
  private listeners = new Set<() => void>();
  private soundController!: SoundController;
  constructor(SoundController: SoundController) {
    this.soundController = SoundController;

    // Stop metronome when session ends
    sessionStore.subscribe(() => {
      const current = sessionStore.getSession();
      if (current?.endTime) {
        this.setMuted(true);
        this.stop();
      }
    });
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private async initIfNeeded() {
    await this.soundController.init();
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private startTimer() {
    this.stopTimer();
    const interval = Math.round((60 / Math.max(1, this.bpm)) * 1000);
    this.timer = setInterval(() => {
      this.soundController.playTick();
    }, interval);
  }

  async start() {
    if (this.muted) return;
    await this.initIfNeeded();
    this.startTimer();
    this.notify();
  }

  stop() {
    this.stopTimer();
    this.notify();
  }

  async setBpm(bpm: number) {
    this.bpm = bpm;
    if (!this.muted && this.timer) {
      await this.initIfNeeded();
      this.startTimer();
    }
    this.notify();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) {
      this.stop();
    } else {
      // fire-and-forget start
      this.start();
    }
    this.notify();
  }

  getBpm() {
    return this.bpm;
  }

  isMuted() {
    return this.muted;
  }

  async dispose() {
    this.stop();
    await this.soundController.dispose();
    this.initialized = false;
  }
}

export const metronomeController = new MetronomeController(
  new SoundController(),
);
