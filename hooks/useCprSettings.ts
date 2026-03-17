import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const STORAGE_KEY_SHOCK = "@cpr_settings_shock_duration";
const STORAGE_KEY_CORDARONE = "@cpr_settings_cordarone_duration";
const STORAGE_KEY_ADRENALINE = "@cpr_settings_adrenaline_duration";
const STORAGE_KEY_WARNING = "@cpr_settings_warning_seconds";

export const DEFAULT_SHOCK_DURATION = 120;
export const DEFAULT_CORDARONE_DURATION = 240;
export const DEFAULT_ADRENALINE_DURATION = 240;
export const DEFAULT_WARNING_SECONDS = 10;

export interface CprSettings {
  shockDuration: number;
  cordaroneDuration: number;
  adrenalineDuration: number;
  warningSeconds: number;
  loading: boolean;
  updateSettings: (
    key: "shock" | "adrenaline" | "warning",
    value: number,
  ) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export function useCprSettings(): CprSettings {
  const [shockDuration, setShockDuration] = useState(DEFAULT_SHOCK_DURATION);
  const [cordaroneDuration, setCordaroneDuration] = useState(
    DEFAULT_CORDARONE_DURATION,
  );
  const [adrenalineDuration, setAdrenalineDuration] = useState(
    DEFAULT_ADRENALINE_DURATION,
  );
  const [warningSeconds, setWarningSeconds] = useState(DEFAULT_WARNING_SECONDS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [shock, cordarone, adrenaline, warning] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_SHOCK),
        AsyncStorage.getItem(STORAGE_KEY_CORDARONE),
        AsyncStorage.getItem(STORAGE_KEY_ADRENALINE),
        AsyncStorage.getItem(STORAGE_KEY_WARNING),
      ]);

      if (shock) setShockDuration(parseInt(shock, 10));
      if (cordarone) setCordaroneDuration(parseInt(cordarone, 10));
      if (adrenaline) setAdrenalineDuration(parseInt(adrenaline, 10));
      if (warning) setWarningSeconds(parseInt(warning, 10));
    } catch (e) {
      console.error("Failed to load settings", e);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (
    key: "shock" | "adrenaline" | "warning",
    value: number,
  ) => {
    try {
      if (key === "shock") {
        setShockDuration(value);
        await AsyncStorage.setItem(STORAGE_KEY_SHOCK, value.toString());
      } else if (key === "adrenaline") {
        setAdrenalineDuration(value);
        await AsyncStorage.setItem(STORAGE_KEY_ADRENALINE, value.toString());
      } else if (key === "warning") {
        const normalized = Math.max(1, Math.floor(value));
        setWarningSeconds(normalized);
        await AsyncStorage.setItem(STORAGE_KEY_WARNING, normalized.toString());
      }
    } catch (e) {
      console.error("Failed to save setting", key, e);
    }
  };

  const resetSettings = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEY_SHOCK,
        STORAGE_KEY_CORDARONE,
        STORAGE_KEY_ADRENALINE,
        STORAGE_KEY_WARNING,
      ]);
      setShockDuration(DEFAULT_SHOCK_DURATION);
      setCordaroneDuration(DEFAULT_CORDARONE_DURATION);
      setAdrenalineDuration(DEFAULT_ADRENALINE_DURATION);
      setWarningSeconds(DEFAULT_WARNING_SECONDS);
    } catch (e) {
      console.error("Failed to reset settings", e);
    }
  };

  return {
    shockDuration,
    cordaroneDuration,
    adrenalineDuration,
    warningSeconds,
    loading,
    updateSettings,
    resetSettings,
  };
}
