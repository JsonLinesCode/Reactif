import { sessionController } from "@/controllers/SessionController";
import { sessionStore } from "@/store/sessionStore";
import { useKeepAwake } from "expo-keep-awake";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform, Text, TextInput } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

const APP_FONT_FAMILY = Platform.select({
  ios: "System",
  android: "Roboto",
  default: "System",
});

const TextAny = Text as any;
const TextInputAny = TextInput as any;

const textDefaultProps = TextAny.defaultProps || {};
TextAny.defaultProps = {
  ...textDefaultProps,
  style: [textDefaultProps.style, { fontFamily: APP_FONT_FAMILY }],
};

const textInputDefaultProps = TextInputAny.defaultProps || {};
TextInputAny.defaultProps = {
  ...textInputDefaultProps,
  style: [textInputDefaultProps.style, { fontFamily: APP_FONT_FAMILY }],
};

export default function RootLayout() {
  useKeepAwake();
  const [theme, setTheme] = useState(sessionStore.theme);

  useEffect(() => {
    void sessionController.initAudioAtMaxVolume();

    const unsubscribe = sessionStore.subscribe(() => {
      setTheme(sessionStore.theme);
    });

    return () => unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          style={theme === "dark" ? "light" : "dark"}
          backgroundColor={theme === "dark" ? "#353636" : "#ffffff"}
          translucent={false}
        />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="cpr"
            options={{
              headerShown: false,
              freezeOnBlur: true,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="cprEndFirstPage"
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen
            name="cprEnd"
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen name="about" options={{ headerShown: false }} />
          <Stack.Screen name="childData" options={{ headerShown: false }} />
          <Stack.Screen name="cprPediatric" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="history" options={{ headerShown: false }} />
          <Stack.Screen
            name="displayChildData"
            options={{ headerShown: false }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
