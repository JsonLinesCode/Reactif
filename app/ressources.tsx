import { sessionStore } from "@/store/sessionStore";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    Image,
    ImageSourcePropType,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ResourceItem = {
  label: string;
  image: ImageSourcePropType;
  url: string;
};

const RESOURCES: ResourceItem[] = [
  {
    label: "Ilcor",
    image: require("@/assets/documents/aides-cognitives/ressources/ilcor.png"),
    url: "https://example.com/reactif",
  },
  {
    label: "Cprguidelines",
    image: require("@/assets/documents/aides-cognitives/ressources/cprguidelines.png"),
    url: "https://cprguidelines.eu/guidelines-2025",
  },
  {
    label: "American Heart Association",
    image: require("@/assets/documents/aides-cognitives/ressources/cpr-heart-org.png"),
    url: "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines",
  },
  {
    label: "SFMU",
    image: require("@/assets/documents/aides-cognitives/ressources/sfmu.png"),
    url: "https://www.sfmu.org/fr/vie-professionnelle/outils-professionnels/referentiels-sfmu",
  },
  {
    label: "Registre Electronique des Arrêts caradiaques",
    image: require("@/assets/documents/aides-cognitives/ressources/reac-univ-lille-2.png"),
    url: "https://reac.univ-lille2.fr/saisie/index.php",
  },
  {
    label: "Urgences Ara",
    image: require("@/assets/documents/aides-cognitives/ressources/urgara.png"),
    url: "https://www.urgences-ara.fr/les-referentiels/",
  },
  {
    label: "sauvlife",
    image: require("@/assets/documents/aides-cognitives/ressources/sauvlife.png"),
    url: "https://sauvlife.org",
  },
];

export default function Ressources() {
  const router = useRouter();
  const [theme, setTheme] = useState(sessionStore.theme);

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
      setTheme(sessionStore.theme);
    });
    return () => unsubscribe();
  }, []);

  const isDark = theme === "dark";

  const headerTintColor = useMemo(
    () => (isDark ? "#e5e7eb" : "#0f172a"),
    [isDark],
  );

  const handleOpen = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch {}
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#111827" : "#F5F5F5" },
      ]}
    >
      <Stack.Screen
        options={{
          title: "Ressources",
          headerStyle: {
            backgroundColor: isDark ? "#111827" : "#F5F5F5",
          },
          headerTintColor: headerTintColor,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerBackButton}
            >
              <Ionicons name="arrow-back" size={22} color={headerTintColor} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.optionsList,
            { backgroundColor: isDark ? "#1f2937" : "#fff" },
          ]}
        >
          {RESOURCES.map((resource, index) => (
            <TouchableOpacity
              key={`${resource.label}-${index}`}
              style={[
                styles.optionItem,
                { borderBottomColor: isDark ? "#374151" : "#E5E7EB" },
              ]}
              onPress={() => handleOpen(resource.url)}
            >
              <View style={styles.resourceRow}>
                <Image source={resource.image} style={styles.resourceLogo} />
                <Text
                  style={[
                    styles.optionText,
                    { color: isDark ? "#e5e7eb" : "#111827" },
                  ]}
                >
                  {resource.label}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={isDark ? "#93c5fd" : "#0D47A1"}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerBackButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  optionsList: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  optionItem: {
    minHeight: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 10,
  },
  resourceRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  resourceLogo: {
    width: 48,
    height: 48,
    resizeMode: "contain",
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: "#111827",
    flex: 1,
  },
});
