import { t } from "@/i18n";
import { sessionStore } from "@/store/sessionStore";
import { Link, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

export default function NotFoundScreen() {
  const [theme, setTheme] = useState(sessionStore.theme);
  const isDark = theme === "dark";

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
      setTheme(sessionStore.theme);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: t("notFound.title") }} />
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#111827" : "#f3f4f6" },
        ]}
      >
        <Link
          href="/"
          style={[styles.button, { color: isDark ? "#93c5fd" : "#2563eb" }]}
        >
          {t("notFound.backHome")}
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#2563eb",
  },
});
