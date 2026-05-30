import { useEffect, useState } from "react";

import { getLocale, setLocale, subscribeLocale, t, type Locale } from "@/i18n";

export const useI18n = () => {
  const [locale, setLocaleState] = useState<Locale>(getLocale());

  useEffect(() => {
    const unsubscribe = subscribeLocale(() => setLocaleState(getLocale()));
    return () => unsubscribe();
  }, []);

  return {
    locale,
    setLocale,
    t,
  };
};
