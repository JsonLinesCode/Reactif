import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";

import en from "@/i18n/translations/en";
import fr from "@/i18n/translations/fr";

export type Locale = "fr" | "en";
export type LocalePreference = "device" | Locale;

type Dictionary = Record<string, unknown>;

const STORAGE_KEY_LOCALE = "@app_locale";
const dictionaries: Record<Locale, Dictionary> = { fr, en };

let currentLocale: Locale = "fr";
let currentLocalePreference: LocalePreference = "device";
const listeners = new Set<() => void>();

const getNativeLocaleTag = (): string | null => {
  if (Platform.OS === "ios") {
    const settings = NativeModules.SettingsManager?.settings;
    const locale =
      settings?.AppleLocale ||
      settings?.AppleLanguages?.[0] ||
      settings?.AppleLanguages;
    return typeof locale === "string" ? locale : null;
  }

  if (Platform.OS === "android") {
    const locale = NativeModules.I18nManager?.localeIdentifier;
    return typeof locale === "string" ? locale : null;
  }

  return null;
};

const getDeviceLocale = (): Locale => {
  try {
    const locale = (
      getNativeLocaleTag() || Intl.DateTimeFormat().resolvedOptions().locale
    )
      .replace("_", "-")
      .toLowerCase();
    return locale.startsWith("fr") ? "fr" : "en";
  } catch {
    return "en";
  }
};

currentLocale = getDeviceLocale();

const resolvePath = (obj: Dictionary, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (typeof acc !== "object" || acc === null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
};

const interpolate = (value: string, params?: Record<string, string | number>) => {
  if (!params) return value;
  return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const param = params[key];
    return param === undefined ? "" : String(param);
  });
};

const notify = () => {
  listeners.forEach((listener) => listener());
};

export const initializeI18n = async () => {
  const previousLocale = currentLocale;
  const previousPreference = currentLocalePreference;

  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_LOCALE);
    if (stored === "fr" || stored === "en") {
      currentLocalePreference = stored;
      currentLocale = stored;
      if (
        previousLocale !== currentLocale ||
        previousPreference !== currentLocalePreference
      ) {
        notify();
      }
      return;
    }
    if (stored === "device") {
      currentLocalePreference = "device";
    }
  } catch {
    // ignore
  }

  currentLocale = getDeviceLocale();
  if (
    previousLocale !== currentLocale ||
    previousPreference !== currentLocalePreference
  ) {
    notify();
  }
};

export const getLocale = (): Locale => currentLocale;

export const getLocalePreference = (): LocalePreference =>
  currentLocalePreference;

export const setLocalePreference = async (preference: LocalePreference) => {
  currentLocalePreference = preference;
  currentLocale = preference === "device" ? getDeviceLocale() : preference;
  notify();
  try {
    await AsyncStorage.setItem(STORAGE_KEY_LOCALE, preference);
  } catch {
    // ignore
  }
};

export const setLocale = async (locale: Locale) => {
  await setLocalePreference(locale);
};

export const syncLocaleWithDeviceSettings = () => {
  if (currentLocalePreference !== "device") return;

  const nextLocale = getDeviceLocale();
  if (nextLocale !== currentLocale) {
    currentLocale = nextLocale;
    notify();
  }
};

export const subscribeLocale = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const t = (
  key: string,
  params?: Record<string, string | number>,
): string => {
  const dict = dictionaries[currentLocale];
  const fallbackDict = dictionaries.fr;

  const resolved = resolvePath(dict, key) ?? resolvePath(fallbackDict, key);

  if (typeof resolved !== "string") return key;
  return interpolate(resolved, params);
};

export const formatLocalizedTime = (
  timestamp: number,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const localeCode = currentLocale === "fr" ? "fr-FR" : "en-US";
  return new Date(timestamp).toLocaleTimeString(localeCode, options);
};

export const formatLocalizedDate = (
  timestamp: number,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const localeCode = currentLocale === "fr" ? "fr-FR" : "en-US";
  return new Date(timestamp).toLocaleDateString(localeCode, options);
};
