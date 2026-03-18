import { useKeepAwake } from "expo-keep-awake";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  useKeepAwake();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="cpr"
          options={{ headerShown: false, freezeOnBlur: true }}
        />
        <Stack.Screen name="about" options={{ headerShown: false }} />
        <Stack.Screen name="childData" options={{ headerShown: false }} />
        <Stack.Screen name="cprPediatric" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen
          name="displayChildData"
          options={{ headerShown: false }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
