import { CprEvent } from "@/models/session";
import { sessionStore } from "@/store/sessionStore";
import { SoundController, SoundName } from "./SoundController";

export class SessionController {
  constructor(
    private readonly soundController: SoundController = new SoundController(),
  ) {
    // Forward session store updates to controller subscribers
    sessionStore.subscribe(() => this.notify());
  }
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private pushLog(log: CprEvent) {
    if (log.type === "event") {
      sessionStore.logEvent("event", log.details);
    } else {
      sessionStore.logEvent(log.type, { timestamp: log.timestamp });
    }
    // Play a notification sound only for critical types (shock/analysis)
    if (log.type === "shock" || log.type === "analysis") {
      void this.playSound("beep");
    }
    this.notify();
  }

  async playSound(name: SoundName) {
    try {
      await this.soundController.play(name);
    } catch (e) {
      // ignore
    }
  }

  startSession = () => {
    sessionStore.startNewSession();
  };

  logShock = () => {
    this.pushLog({ type: "shock", timestamp: Date.now() });
  };

  logAnalysis = () => {
    this.pushLog({ type: "analysis", timestamp: Date.now() });
  };

  logCordarone = () => {
    this.pushLog({ type: "cordarone", timestamp: Date.now() });
  };

  logAdrenaline = () => {
    this.pushLog({ type: "adrenaline", timestamp: Date.now() });
  };

  logEvents = (events: string[]) => {
    const now = Date.now();
    events.forEach((event) =>
      this.pushLog({ type: "event", timestamp: now, details: event }),
    );
  };

  cancelLast = () => {
    sessionStore.cancelLast();
  };

  getCount = (type: CprEvent["type"]) => {
    return (
      sessionStore.getSession()?.events.filter((l) => l.type === type).length ||
      0
    );
  };

  // Get the time stamp of the last event of a type
  getLastTime(type: CprEvent["type"]) {
    const relevant = sessionStore
      .getSession()
      ?.events.filter((l) => l.type === type);
    return relevant && relevant.length
      ? relevant[relevant.length - 1].timestamp
      : null;
  }
  async endSession() {
    await sessionStore.saveCurrentSession();
  }
}

export const sessionController = new SessionController();
