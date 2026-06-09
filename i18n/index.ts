import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";

import de from "@/i18n/translations/de";
import en from "@/i18n/translations/en";
import es from "@/i18n/translations/es";
import fr from "@/i18n/translations/fr";
import it from "@/i18n/translations/it";
import ko from "@/i18n/translations/ko";
import pt from "@/i18n/translations/pt";
import zh from "@/i18n/translations/zh";

export type Locale = "fr" | "en" | "de" | "es" | "it" | "pt" | "zh" | "ko";
export type LocalePreference = "device" | Locale;

type Dictionary = Record<string, unknown>;

const STORAGE_KEY_LOCALE = "@app_locale";
const dictionaries: Record<Locale, Dictionary> = {
  fr,
  en,
  de,
  es,
  it,
  pt,
  zh,
  ko,
};
export const localeLabels: Record<Locale, string> = {
  fr: "settings.french",
  en: "settings.english",
  de: "settings.german",
  es: "settings.spanish",
  it: "settings.italian",
  pt: "settings.portuguese",
  zh: "settings.chinese",
  ko: "settings.korean",
};
export const supportedLocales = Object.keys(localeLabels) as Locale[];
const intlLocaleCodes: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-US",
  de: "de-DE",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-PT",
  zh: "zh-CN",
  ko: "ko-KR",
};

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
    const languageCode = locale.split("-")[0];
    return supportedLocales.includes(languageCode as Locale)
      ? (languageCode as Locale)
      : "en";
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

  if (Platform.OS === "ios") {
    currentLocalePreference = "device";
    currentLocale = getDeviceLocale();
    if (
      previousLocale !== currentLocale ||
      previousPreference !== currentLocalePreference
    ) {
      notify();
    }
    return;
  }

  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_LOCALE);
    if (supportedLocales.includes(stored as Locale)) {
      const storedLocale = stored as Locale;
      currentLocalePreference = storedLocale;
      currentLocale = storedLocale;
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
  if (currentLocalePreference !== "device" && Platform.OS !== "ios") return;

  const nextLocale = getDeviceLocale();
  if (nextLocale !== currentLocale || currentLocalePreference !== "device") {
    currentLocalePreference = "device";
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
  const localeCode = intlLocaleCodes[currentLocale];
  return new Date(timestamp).toLocaleTimeString(localeCode, options);
};

export const formatLocalizedDate = (
  timestamp: number,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const localeCode = intlLocaleCodes[currentLocale];
  return new Date(timestamp).toLocaleDateString(localeCode, options);
};
