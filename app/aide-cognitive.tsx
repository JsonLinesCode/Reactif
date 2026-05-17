import ImageViewer from "@/components/ImageViewer";
import { sessionStore } from "@/store/sessionStore";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter, type Href } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ImageSourcePropType,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type CognitiveDocument = {
  label: string;
  image?: ImageSourcePropType;
  pdf?: { uri: string } | number;
  route?: Href;
};

const COGNITIVE_DOCUMENTS: CognitiveDocument[] = [
  {
    label: "Organisation RCP specialisée",
    image: require("@/assets/documents/aides-cognitives//organisation-rcp-specialisee/image.png"),
  },
  {
    label: "Reglages respirateur RCP Adulte",
    route: "/aide-respiratoire",
  },

  {
    label: "Algorithme RCP adulte",
    image: require("@/assets/documents/aides-cognitives/algorithme-rcp-adulte/image.png"),
  },
  {
    label: "Algorithme RCP pédiatrique",
    image: require("@/assets/documents/aides-cognitives/algorithme-rcp-pediatrique/image.png"),
  },
  {
    label: "Algorithme RCP néonatale",
    image: require("@/assets/documents/aides-cognitives/algorithme-rcp-neonatale/image.png"),
  },
  {
    label: "Causes réversibles de l’AC pédiatrique 4H/4T",
    image: require("@/assets/documents/aides-cognitives/causes-reversibles-ac-pediatrique-4h-4t/image.png"),
  },
  {
    label: "Ressources",
    route: "/ressources",
  },
];

export default function AideCognitive() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [theme, setTheme] = useState(sessionStore.theme);
  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState<
    number | null
  >(null);

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
      setTheme(sessionStore.theme);
    });
    return () => unsubscribe();
  }, []);

  const isDark = theme === "dark";

  const selectedDocument = useMemo(() => {
    if (selectedDocumentIndex === null) return null;
    return COGNITIVE_DOCUMENTS[selectedDocumentIndex] ?? null;
  }, [selectedDocumentIndex]);

  const renderDocumentItem = (item: CognitiveDocument, index: number) => (
    <TouchableOpacity
      key={`${item.label}-${index}`}
      style={[
        styles.optionItem,
        { borderBottomColor: isDark ? "#374151" : "#E5E7EB" },
      ]}
      onPress={() => {
        if (item.route) {
          router.push(item.route);
          return;
        }

        setSelectedDocumentIndex(index);
      }}
    >
      <Text
        style={[styles.optionText, { color: isDark ? "#e5e7eb" : "#111827" }]}
      >
        {item.label}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={22}
        color={isDark ? "#93c5fd" : "#0D47A1"}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#111827" : "#F5F5F5" },
      ]}
    >
      <Stack.Screen
        options={{
          title: "Aides cognitives",
          headerStyle: {
            backgroundColor: isDark ? "#111827" : "#F5F5F5",
          },
          headerTintColor: isDark ? "#e5e7eb" : "#0f172a",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerBackButton}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={isDark ? "#e5e7eb" : "#0f172a"}
              />
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
          {COGNITIVE_DOCUMENTS.map(renderDocumentItem)}
        </View>
      </ScrollView>

      <Modal
        visible={!!selectedDocument}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelectedDocumentIndex(null)}
      >
        <SafeAreaView
          edges={["left", "right", "bottom"]}
          style={[
            styles.viewerContainer,
            { backgroundColor: isDark ? "#0b1220" : "#F5F5F5" },
          ]}
        >
          <View
            style={[
              styles.viewerHeader,
              {
                backgroundColor: isDark ? "#111827" : "#000",
                paddingTop: insets.top + 14,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => setSelectedDocumentIndex(null)}
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
              selectedDocument.image ? (
                <ImageViewer imgSource={selectedDocument.image} />
              ) : selectedDocument.pdf ? (
                <Text style={{ color: isDark ? "#fff" : "#000" }}>
                  PDF documents are not supported in this build. Please open the
                  PDF externally.
                </Text>
              ) : null
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
  headerBackButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    marginBottom: 16,
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
