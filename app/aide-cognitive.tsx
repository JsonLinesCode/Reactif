import ImageViewer from "@/components/ImageViewer";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ImageSourcePropType,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CognitiveDocument = {
  id: string;
  label: string;
  image: ImageSourcePropType;
};

const COGNITIVE_DOCUMENTS: CognitiveDocument[] = [
  {
    id: "doc-1",
    label: "RCP Adulte ERC 2025",
    image: require("@/assets/documents/image.png"),
  },
  {
    id: "doc-2",
    label: "RCP Néonatale ERC 2025",
    image: require("@/assets/documents/image-1.png"),
  },
  {
    id: "doc-3",
    label: "RCP Pédiatrique ERC 2025",
    image: require("@/assets/documents/image-2.png"),
  },
  {
    id: "doc-4",
    label: "Causes réversible de l'AC pédiatrique 4H/4T",
    image: require("@/assets/documents/image-3.png"),
  },
  {
    id: "doc-5",
    label: "Organisation de la réanimation cardio-pulmonaire spécialisée préhospitaliere",
    image: require("@/assets/documents/image-4.png"),
  },
];

export default function AideCognitive() {
  const router = useRouter();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );

  const selectedDocument = useMemo(
    () => COGNITIVE_DOCUMENTS.find((doc) => doc.id === selectedDocumentId),
    [selectedDocumentId],
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Aide cognitive" }} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>Fiches disponibles</Text>
          <Text style={styles.subtitle}>
            Touchez une fiche pour l&apos;ouvrir en mode zoom
          </Text>
        </View>

        <View style={styles.optionsList}>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => router.push("/aide-respiratoire")}
          >
            <Text style={styles.optionText}>Calculateur respiratoire</Text>
            <Ionicons name="chevron-forward" size={22} color="#0D47A1" />
          </TouchableOpacity>

          {COGNITIVE_DOCUMENTS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.optionItem}
              onPress={() => setSelectedDocumentId(item.id)}
            >
              <Text style={styles.optionText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={22} color="#0D47A1" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={!!selectedDocument}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedDocumentId(null)}
      >
        <SafeAreaView style={styles.viewerContainer}>
          <View style={styles.viewerHeader}>
            <TouchableOpacity
              onPress={() => setSelectedDocumentId(null)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.viewerHeaderTitle} numberOfLines={1}>
              {selectedDocument?.label ?? "Fiche"}
            </Text>
          </View>

          <View style={styles.viewerBody}>
            {selectedDocument ? (
              <ImageViewer imgSource={selectedDocument.image} />
            ) : null}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 18,
    marginTop: 6,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0D47A1",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: "#334155",
    textAlign: "center",
  },
  optionsList: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  optionItem: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 10,
  },
  optionText: {
    fontSize: 16,
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  viewerHeader: {
    backgroundColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  backButton: {
    marginRight: 12,
  },
  viewerHeaderTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "bold",
    flex: 1,
  },
  viewerBody: {
    flex: 1,
    padding: 12,
  },
});
