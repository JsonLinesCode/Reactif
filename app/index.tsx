import { sessionStore } from "@/store/sessionStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import Feather from '@expo/vector-icons/Feather';


export default function Index() {
  const router = useRouter();

  const startAdultCpr = () => {
    sessionStore.startNewSession();
    router.push("/cpr");
  };

  const startPediatricCpr = () => {
    sessionStore.startNewSession();
    router.push("/childDatas");
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/logoWhite.png")}
        style={styles.logo}
      />
      <View style={{ height: 20 }} />
      <TouchableOpacity style={styles.menuButton} onPress={startAdultCpr}>
        <Text style={styles.menuButtonText}>RCP Adulte</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={startPediatricCpr}>
        <Text style={styles.menuButtonText}>RCP pédiatrique</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => router.push("/history")}
      >
        <Text style={styles.menuButtonText}>Historique sessions</Text>
      </TouchableOpacity>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.menuSubButton}
          onPress={() => router.push("/settings")}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.menuSubButtonText}>Paramètres</Text>
            <Feather name="settings" size={24} color="white" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.aboutButton}
          onPress={() =>
            router.push({ pathname: "/about", params: { us: "value" } })
          }
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.menuButtonText}>A propos</Text>
            <Feather name="info" size={24} color="white" />
          </View>
        </TouchableOpacity>
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
    backgroundColor: "#007BFF",
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  menuSubButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 20,
    width: "80%",
    maxWidth: 150,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  menuSubButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    },
  aboutButton: {
    backgroundColor: "#28a745",
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 20,
    width: "100%",
    maxWidth: 150,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  menuButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    paddingTop: 10,
    padding: 20,
    justifyContent: "flex-start",
    backgroundColor: "#25292e",
    alignItems: "center",
  },
});
