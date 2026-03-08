import { sessionStore } from "@/store/sessionStore";
import { SoundController } from "./SoundController";

export class SessionController {
  constructor(private readonly soundController: SoundController) {}

  startSession() {
    sessionStore.startNewSession();
  }

  async logShock() {
    sessionStore.logEvent("shock", { timestamp: Date.now() });
    await this.soundController.playTick();
  }

  logAnalysis() {
    sessionStore.logEvent("analysis", { timestamp: Date.now() });
  }

  async endSession() {
    await sessionStore.saveCurrentSession();
  }
}