import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const STORAGE_KEY_SHOCK = "@cpr_settings_shock_duration";
const STORAGE_KEY_CORDARONE = "@cpr_settings_cordarone_duration";
const STORAGE_KEY_ADRENALINE = "@cpr_settings_adrenaline_duration";

export const DEFAULT_SHOCK_DURATION = 120;
export const DEFAULT_CORDARONE_DURATION = 240;
export const DEFAULT_ADRENALINE_DURATION = 240;

export interface CprSettings {
  shockDuration: number;
  cordaroneDuration: number;
  adrenalineDuration: number;
  loading: boolean;
  updateSettings: (
    key: "shock" | "adrenaline",
    value: number,
  ) => Promise<void>;
  resetSettings: () => Promise<void>;
}


export function useCprSettings(): CprSettings {
  const [shockDuration, setShockDuration] = useState(DEFAULT_SHOCK_DURATION );
  const [cordaroneDuration, setCordaroneDuration] = useState(
    DEFAULT_CORDARONE_DURATION ,
  );
  const [adrenalineDuration, setAdrenalineDuration] = useState(
    DEFAULT_ADRENALINE_DURATION,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [shock, adrenaline] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_SHOCK),
        AsyncStorage.getItem(STORAGE_KEY_CORDARONE),
        AsyncStorage.getItem(STORAGE_KEY_ADRENALINE),
      ]);

      if (shock) setShockDuration(parseInt(shock, 10));
      if (adrenaline) setAdrenalineDuration(parseInt(adrenaline, 10));
    } catch (e) {
      console.error("Failed to load settings", e);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (
    key: "shock" | "adrenaline",
    value: number,
  ) => {
    try {
      if (key === "shock") {
        setShockDuration(value);
        await AsyncStorage.setItem(STORAGE_KEY_SHOCK, value.toString());
      } else if (key === "adrenaline") {
        setAdrenalineDuration(value);
        await AsyncStorage.setItem(STORAGE_KEY_ADRENALINE, value.toString());
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
      ]);
      setShockDuration(DEFAULT_SHOCK_DURATION);
      setCordaroneDuration(DEFAULT_CORDARONE_DURATION);
      setAdrenalineDuration(DEFAULT_ADRENALINE_DURATION);
    } catch (e) {
      console.error("Failed to reset settings", e);
    }
  };

  return {
    shockDuration,
    cordaroneDuration,
    adrenalineDuration,
    loading,
    updateSettings,
    resetSettings,
  };
}
