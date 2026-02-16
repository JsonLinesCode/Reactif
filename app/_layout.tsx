import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="cpr" options={{ headerShown: false }} />
      <Stack.Screen name="about" options={{ headerShown: false }} />
        <Stack.Screen name="childDatas" options={{ headerShown: false }} />
        <Stack.Screen name="displayChildData" options={{ headerShown: false }} />
    </Stack>
  );
}
