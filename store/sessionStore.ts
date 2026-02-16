import AsyncStorage from "@react-native-async-storage/async-storage";

export type AgeMode = "months" | "years";

export interface PediatricData {
  ageMode: AgeMode;
  ageValue: number;
  weight?: number; // In kg
}

export interface CprEvent {
  id: string;
  timestamp: number;
  type: string; // 'shock' | 'cordarone' | 'adrenaline' | 'event' | 'cpr_end' ...
  details?: any;
}

export interface CprSession {
  id: string; // Unique session ID
  startTime: number;
  endTime?: number;
  pediatricData?: PediatricData; // Optional, as adult CPR might not use it or use different fields
  events: CprEvent[];
}

const STORAGE_KEY_HISTORY = "@cpr_session_history";

class SessionStore {
  private currentSession: CprSession | null = null;
  private history: CprSession[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadHistory();
    this.startNewSession();
  }

  startNewSession() {
    this.currentSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      events: [],
    };
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

  logEvent(type: string, details?: any) {
    if (!this.currentSession) {
      this.startNewSession();
    }
    if (this.currentSession) {
      const newEvent: CprEvent = {
        id: Date.now().toString() + Math.random().toString().slice(2, 5),
        timestamp: Date.now(),
        type,
        details,
      };
      this.currentSession.events.push(newEvent);
      this.notifyListeners();
      console.log(`[SessionStore] Event logged: ${type}`, details);
    }
  }

  async saveCurrentSession() {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      // Add 'cpr_end' event if not last event
      const lastEvent =
        this.currentSession.events[this.currentSession.events.length - 1];
      if (!lastEvent || lastEvent.type !== "cpr_end") {
        this.logEvent("cpr_end");
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

  async loadHistory() {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
      if (json) {
        this.history = JSON.parse(json);
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
}

export const sessionStore = new SessionStore();
