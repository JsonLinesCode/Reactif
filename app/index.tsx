import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/logoWhite.png")}
        style={styles.logo}
      />
      <View style={{ height: 20 }} />
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => router.push("/cpr")}
      >
        <Text style={styles.menuButtonText}>RCP Adulte</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => router.push("/childDatas")}>
        <Text style={styles.menuButtonText}>RCP pédiatrique</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton}>
        <Text style={styles.menuButtonText}>Historique sessions</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.aboutButton}
        onPress={() =>
          router.push({ pathname: "/about", params: { us: "value" } })
        }
      >
        <View>
          <Text style={styles.menuButtonText}>A propos</Text>
        </View>
      </TouchableOpacity>
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
  aboutButton: {
    backgroundColor: "#28a745",
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
