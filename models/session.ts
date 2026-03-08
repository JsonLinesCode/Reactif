export type AgeMode = "months" | "years";

export interface PediatricData {
  ageMode: AgeMode;
  ageValue: number;
  weight?: number; // In kg
  adrenalineDose?: string;
  cordaroneDose?: string;
  energyDose?: string;
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
