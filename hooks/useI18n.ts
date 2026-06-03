import { useEffect, useState } from "react";

import {
  getLocale,
  getLocalePreference,
  setLocale,
  setLocalePreference,
  subscribeLocale,
  syncLocaleWithDeviceSettings,
  t,
  type Locale,
  type LocalePreference,
} from "@/i18n";

export const useI18n = () => {
  const [locale, setLocaleState] = useState<Locale>(getLocale());
  const [localePreference, setLocalePreferenceState] =
    useState<LocalePreference>(getLocalePreference());

  useEffect(() => {
    const updateLocaleState = () => {
      setLocaleState(getLocale());
      setLocalePreferenceState(getLocalePreference());
    };
    const unsubscribe = subscribeLocale(updateLocaleState);
    syncLocaleWithDeviceSettings();
    updateLocaleState();
    return () => unsubscribe();
  }, []);

  return {
    locale,
    localePreference,
    setLocale,
    setLocalePreference,
    t,
  };
};
