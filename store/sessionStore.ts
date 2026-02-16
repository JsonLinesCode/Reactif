export type AgeMode = "months" | "years";

export interface PediatricData {
  ageMode: AgeMode;
  ageValue: number;
  weight?: number; // In kg
}

export interface CprEvent {
  id: string;
  timestamp: number;
  type: string;
  details?: any;
}

export interface CprSession {
  id: string; // Unique session ID
  startTime: number;
  pediatricData?: PediatricData; // Optional, as adult CPR might not use it or use different fields
  events: CprEvent[];
}

class SessionStore {
  private currentSession: CprSession | null = null;
  private listeners: (() => void)[] = [];

  constructor() {
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

  getEvents(): CprEvent[] {
    return this.currentSession?.events || [];
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
