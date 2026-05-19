import { CprEvent, CprSession, PediatricData } from "@/models/session";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY_HISTORY = "@cpr_session_history";

class SessionStore {
  private createSessionId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private ensureUniqueHistoryIds(history: CprSession[]) {
    const seen = new Set<string>();
    let changed = false;

    const normalized = history.map((session, index) => {
      let nextId = session.id;
      if (!nextId || seen.has(nextId)) {
        nextId = `${session.startTime || Date.now()}-${index}-${Math.random()
          .toString(36)
          .slice(2, 6)}`;
        changed = true;
      }
      seen.add(nextId);
      if (nextId === session.id) {
        return session;
      }
      return { ...session, id: nextId };
    });

    return { normalized, changed };
  }

  getComputeMode() {
    const pediatricData = this.currentSession?.pediatricData;
    if (!pediatricData) {
      return null; // No pediatric data, so compute mode is not applicable
    }
    return pediatricData.inputMode || null;
  }
  private currentSession: CprSession | null = null;
  private history: CprSession[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadHistory();
    this.startNewSession("adult");
  }

  startNewSession(mode: "adult" | "pediatric" | "neonatal" = "adult") {
    this.currentSession = {
      id: this.createSessionId(),
      startTime: Date.now(),
      mode,
      events: [],
    };
    this.notifyListeners();
  }

  resetCurrentSessionStartTime() {
    if (!this.currentSession) {
      this.startNewSession();
      return;
    }

    this.currentSession.startTime = Date.now();
    this.currentSession.endTime = undefined;
    this.notifyListeners();
  }

  getSession(): CprSession | null {
    return this.currentSession;
  }

  setPediatricData(data: PediatricData) {
    if (!this.currentSession) {
      this.startNewSession();
    }
    if (this.currentSession) {
      this.currentSession.pediatricData = data;
      this.notifyListeners();
    }
  }
  cancelLast() {
    if (this.currentSession && this.currentSession.events.length > 0) {
      this.currentSession.events.pop();
      this.notifyListeners();
    }
  }

  cancelLastOfType(type: CprEvent["type"]) {
    if (!this.currentSession || this.currentSession.events.length === 0) {
      return null;
    }

    for (let i = this.currentSession.events.length - 1; i >= 0; i -= 1) {
      if (this.currentSession.events[i].type === type) {
        const [removed] = this.currentSession.events.splice(i, 1);
        this.notifyListeners();
        return removed;
      }
    }

    return null;
  }

  logEvent(
    type:
      | "shock"
      | "analysis"
      | "cordarone"
      | "adrenaline"
      | "event"
      | "cpr_end",
    details?: any,
  ) {
    if (!this.currentSession) {
      this.startNewSession();
    }
    if (this.currentSession) {
      const newEvent: CprEvent = {
        timestamp: Date.now(),
        type,
        details,
      };
      this.currentSession.events.push(newEvent);
      this.notifyListeners();
    }
  }

  async saveCurrentSession(endReason?: string) {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      // Add 'cpr_end' event if not last event
      const lastEvent =
        this.currentSession.events[this.currentSession.events.length - 1];
      if (!lastEvent || lastEvent.type !== "cpr_end") {
        this.logEvent("cpr_end", endReason); // Pass reason as details
      }

      this.history.unshift(this.currentSession);
      await this.persistHistory();

      // We don't necessarily clear currentSession immediately, allowing the review page to see it.
      // But typically we might mark it as "finished".
      // For now, next time user starts relevant flow, startNewSession should be called essentially.
      this.notifyListeners();
    }
  }

  getEvents(): CprEvent[] {
    return this.currentSession?.events || [];
  }

  getHistory(): CprSession[] {
    return this.history;
  }

  getPediatricData(): PediatricData | undefined {
    return this.currentSession?.pediatricData;
  }

  getWeight(): number | undefined {
    return this.currentSession?.pediatricData?.weight;
  }

  getAdrenalineDose(): string | undefined {
    return this.currentSession?.pediatricData?.adrenalineDose;
  }

  getCordaroneDose(): string | undefined {
    return this.currentSession?.pediatricData?.cordaroneDose;
  }

  getEnergyDose(): string | undefined {
    return this.currentSession?.pediatricData?.energyDose;
  }

  async deleteSession(sessionId: string) {
    this.history = this.history.filter((s) => s.id !== sessionId);
    this.notifyListeners();
    await this.persistHistory();
  }

  async loadHistory() {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
      if (json) {
        const parsed = JSON.parse(json) as CprSession[];
        const { normalized, changed } = this.ensureUniqueHistoryIds(parsed);
        this.history = normalized;
        if (changed) {
          await this.persistHistory();
        }
        this.notifyListeners();
      }
    } catch (e) {
      console.error("Failed to load session history", e);
    }
  }

  private async persistHistory() {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY_HISTORY,
        JSON.stringify(this.history),
      );
    } catch (e) {
      console.error("Failed to save session history", e);
    }
  }

  // Basic subscription mechanism for React components
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l());
  }

  async setTheme(theme: "light" | "dark") {
    this.theme = theme;
    this.notifyListeners();
  }
  theme: "light" | "dark" = "light";
}

export const sessionStore = new SessionStore();
