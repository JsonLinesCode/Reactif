import { sessionStore } from "@/store/sessionStore";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [theme, setTheme] = useState(sessionStore.theme);

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
      setTheme(sessionStore.theme);
    });
    return () => unsubscribe();
  }, []);

  const isDark = theme === "dark";
  const bgStyle = { backgroundColor: isDark ? "#353636" : "#fff" };
  const outlineButtonStyle = isDark
    ? { backgroundColor: "#353636", borderColor: "#fff" }
    : { backgroundColor: "#fff", borderColor: "#007BFF" };
  const outlineTextStyle = isDark ? { color: "#fff" } : { color: "#007BFF" };

  const startAdultCpr = () => {
    sessionStore.startNewSession();
    router.push("/cpr");
  };

  const startPediatricCpr = () => {
    sessionStore.startNewSession();
    router.push("/childData");
  };
  const startAideCognitive = () => {
    sessionStore.startNewSession();
    router.push("/aideCognitive");
  };

  const partners = [
    {
      url: "https://www.chsf.fr/portail/offre-de-soins-18-25.html?args=Y29tcF9pZD00NyZhY3Rpb249ZmljaGVfc2VydmljZSZpZD0xMDMmY29tcG9uZW50PSZtb2R1bGU9Jnw%3D&offre_soin_service_id=103",
      icon: require("@/assets/documents/home/partners/smur-corbeil-essonnes.png"),
    },
  ];

  const handleOpenPartner = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch {}
  };
  return (
    <View
      id="coucou"
      style={[
        styles.container,
        bgStyle,
        { paddingBottom: Math.max(20, insets.bottom + 12) },
      ]}
    >
      <Image
        source={
          isDark
            ? require("@/assets/images/logoWhite.png")
            : require("@/assets/images/logo.png")
        }
        style={styles.logo}
      />
      <View
        style={{
          gap: 100,
          justifyContent: "center",
          width: "100%",
          alignItems: "center",
        }}
      >
        <View style={{ width: "100%", alignItems: "center" }}>
          <View style={{ height: 20 }} />
          <View style={styles.partnersRow}>
            {partners.map((partner, index) => (
              <TouchableOpacity
                key={`${partner.url}-${index}`}
                style={styles.partnerLink}
                onPress={() => handleOpenPartner(partner.url)}
              >
                <Image source={partner.icon} style={styles.partnerLogo} />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.menuButton, outlineButtonStyle]}
            onPress={startAdultCpr}
          >
            <Text style={[styles.menuButtonText, outlineTextStyle]}>
              RCP ADULTE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuButton, outlineButtonStyle]}
            onPress={startPediatricCpr}
          >
            <Text style={[styles.menuButtonText, outlineTextStyle]}>
              RCP PEDIATRIQUE
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: "100%", alignItems: "center" }}>
          <TouchableOpacity
            style={[
              styles.buttonHistory,
              styles.bottomAideButton,
              outlineButtonStyle,
            ]}
            onPress={startAideCognitive}
          >
            <Text style={[styles.buttonHistoryText, outlineTextStyle]}>
              AIDES COGNITIVES
            </Text>
          </TouchableOpacity>
          <View style={styles.bottomActionRow}>
            <TouchableOpacity
              style={[
                styles.buttonHistory,
                styles.bottomHistoryButton,
                outlineButtonStyle,
              ]}
              onPress={() => router.push("/history")}
            >
              <Text style={[styles.buttonHistoryText, outlineTextStyle]}>
                Historique
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.buttonHistory,
                styles.bottomSettingsButton,
                outlineButtonStyle,
              ]}
              onPress={() => router.push("/settings")}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Feather
                  name="settings"
                  size={30}
                  color={isDark ? "#fff" : "#007BFF"}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 300,
    height: 200,
    marginBottom: 10,
    resizeMode: "contain",
  },
  menuButton: {
    backgroundColor: "#fff",
    borderColor: "#007BFF",
    borderWidth: 2,
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  buttonHistory: {
    paddingVertical: 18,
    backgroundColor: "#fff",
    borderColor: "#007BFF",
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 0,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  bottomActionRow: {
    width: "100%",
    maxWidth: 400,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  bottomHistoryButton: {
    flex: 1,
    height: 62,
    justifyContent: "center",
  },
  bottomAideButton: {
    width: "100%",
    maxWidth: 400,
    marginBottom: 12,
    height: 62,
    justifyContent: "center",
  },
  bottomSettingsButton: {
    width: 74,
    maxWidth: 74,
    height: 62,
    justifyContent: "center",
    marginBottom: 0,
    marginLeft: "auto",
    paddingVertical: 0,
  },
  menuSubButton: {
    backgroundColor: "#fff",
    borderColor: "#007BFF",
    borderWidth: 2,
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
    maxWidth: 160,
    alignItems: "center",
  },
  menuSubButtonText: {
    color: "#007BFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  menuButtonText: {
    color: "#007BFF",
    fontSize: 22,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  partnersRow: {
    width: "100%",
    maxWidth: 400,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 24,
    gap: 12,
  },
  partnerLink: {
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
  },
  partnerLogo: {
    width: 76,
    height: 76,
    resizeMode: "contain",
  },
  buttonHistoryText: {
    color: "#007BFF",
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
    lineHeight: 22,
    includeFontPadding: false,
  },
  mainButtons: {
    width: "100%",
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    height: "100%",
    paddingTop: 10,
    padding: 20,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
