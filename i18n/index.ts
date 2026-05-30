import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "@/i18n/translations/en";
import fr from "@/i18n/translations/fr";

export type Locale = "fr" | "en";

type Dictionary = Record<string, unknown>;

const STORAGE_KEY_LOCALE = "@app_locale";
const dictionaries: Record<Locale, Dictionary> = { fr, en };

let currentLocale: Locale = "fr";
const listeners = new Set<() => void>();

const getDeviceLocale = (): Locale => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
    return locale.startsWith("en") ? "en" : "fr";
  } catch {
    return "fr";
  }
};

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
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_LOCALE);
    if (stored === "fr" || stored === "en") {
      currentLocale = stored;
      return;
    }
  } catch {
    // ignore
  }

  currentLocale = getDeviceLocale();
};

export const getLocale = (): Locale => currentLocale;

export const setLocale = async (locale: Locale) => {
  currentLocale = locale;
  notify();
  try {
    await AsyncStorage.setItem(STORAGE_KEY_LOCALE, locale);
  } catch {
    // ignore
  }
};

export const subscribeLocale = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
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
