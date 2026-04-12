export type AgeMode = "months" | "years";

export interface PediatricData {
  inputMode?: "age" | "weight" | null;
  ageMode: AgeMode;
  ageValue: number;
  weight?: number; // In kg
  adrenalineDose?: string;
  cordaroneDose?: string;
  energyDose?: string;
}
export type CprEvent = {
  type: "shock" | "analysis" | "cordarone" | "adrenaline" | "event" | "cpr_end";
  timestamp: number;
  details?: unknown;
};

export interface CprSession {
  id: string; // Unique session ID
  startTime: number;
  endTime?: number;
  pediatricData?: PediatricData; // Optional, as adult CPR might not use it or use different fields
  events: CprEvent[];
}


export interface ComputeMode {
  inputMode: 'age' | 'weight';
}
