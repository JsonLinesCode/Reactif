import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
export default function About() {
  const params = useLocalSearchParams();

  return (
    <View>
      <Text>A propos </Text>
      <Text>Groszizi : {params.groszizi}</Text>
    </View>
  );
}
