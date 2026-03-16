import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { sessionStore } from "@/store/sessionStore";
import { CprSession } from "@/models/session";
import {router, Stack, useLocalSearchParams} from "expo-router";

export default function CprEnd() {
  const params = useLocalSearchParams();
  const initialMode = params.mode === "death" ? "summary" : "racs";

  const [step, setStep] = useState<"racs" | "summary">(initialMode as any);
  const [session, setSession] = useState<CprSession | null>(null);

  useEffect(() => {
    const current = sessionStore.getSession();
    setSession(current);

    if (params.mode === "death") {
      setStep("summary");
    } else {
      setStep("racs");
    }
  }, [params.mode]);

  const handleResume = () => {
    // "Reprendre la RCP"
    sessionStore.logEvent("event", "RESUME");
    router.dismissAll();
    router.replace("/cpr");
  };

  const handleDeath = async () => {
    // "Décès"
    await sessionStore.saveCurrentSession("Décès");
    setSession(sessionStore.getSession());
    setStep("summary");
  };

  const handleConfirmEnd = async () => {
    // "Arrêter définitivement" (RACS -> Stop)
    await sessionStore.saveCurrentSession("Arrêt définitif");
    setSession(sessionStore.getSession());
    setStep("summary");
  };

  const handleExportPdf = async () => {
    if (!session) return;

    const html = generateHtml(session);
    try {
      const { uri } = await Print.printToFileAsync({ html });
      console.log("File has been saved to:", uri);
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } catch (error) {
      Alert.alert("Erreur", "Impossible de générer ou partager le PDF.");
      console.error(error);
    }
  };

  const handleGoHome = () => {
    sessionStore.startNewSession(); // Reset for next time
    router.replace("/");
  };

  // derived data
  const getDurationString = () => {
    if (!session || !session.endTime) return "0 minutes et 0 secondes";
    const diff = session.endTime - session.startTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes} minutes et ${seconds} secondes`;
  };

  const getShockCount = () => {
    return session?.events.filter((e: any) => e.type === "shock").length || 0;
  };

  const getActions = () => {
    return (
      session?.events.filter((e: any) =>
        ["cordarone", "adrenaline"].includes(e.type),
      ) || []
    );
  };

  const getCustomEvents = () => {
    return session?.events.filter((e: any) => e.type === "event") || [];
  };

  if (step === "racs") {
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.confirmContainer}>
                <Text style={styles.title}>RACS</Text>
                <Text style={styles.subtitle}>
                    Retour d&#39;Activité Circulatoire Spontanée
                </Text>

                <View style={styles.buttonGroupConfirm}>
                    <TouchableOpacity
                        style={[styles.buttonConfirm, styles.resumeButton]}
                        onPress={handleResume}
                    >
                        <Text style={styles.buttonText}>Reprendre la RCP</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.buttonConfirm, styles.deathButton]}
                        onPress={handleDeath}
                    >
                        <Text style={styles.buttonText}>Décès</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.buttonConfirm, styles.stopButton]}
                        onPress={handleConfirmEnd}
                    >
                        <Text style={styles.buttonText}>Arrêter définitivement</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
  }

  const actions = getActions();
  const customEvents = getCustomEvents();
  const summaryTitle = session?.events.find((e: any) => e.type === "cpr_end")?.details || "Fin de session";

  return (
    <SafeAreaView style={[styles.container, styles.summaryBackground]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.summaryScroll}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}> {summaryTitle === "Décès" ? "Patient décédé" : "Résumé de la RCP"}</Text>
        </View>

        {/* Stats Card */}
        <View style={styles.card}>
            <View style={styles.cardRow}>
                <FontAwesome5
                    name="hourglass-half"
                    size={18}
                    color="black"
                    style={styles.iconWidth}
                />
                <Text style={styles.cardText}>
                    Durée totale: {getDurationString()}
                </Text>
            </View>
            <View style={[styles.cardRow, { marginTop: 8 }]}>
                <FontAwesome5
                    name="bolt"
                    size={18}
                    color="black"
                    style={styles.iconWidth}
                />
                <Text style={styles.cardText}>
                    Chocs délivrés: {getShockCount()}
                </Text>
            </View>
        </View>

        {/* Actions Card */}
        <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}> Actions réalisées:</Text>
            </View>
            <View style={styles.divider} />
            {actions.length === 0 ? (
                <Text style={styles.emptyText}>Aucune action.</Text>
            ) : (
                actions.map((act, i) => (
                    <Text key={i} style={styles.itemText}>
                        • {act.type} ({new Date(act.timestamp).toLocaleTimeString()})
                    </Text>
                ))
            )}
        </View>

        {/* Events Card */}
        <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}> Événements saisis:</Text>
            </View>
            <View style={styles.divider} />
            {customEvents.length === 0 ? (
                <Text style={styles.emptyText}>Aucun événement.</Text>
            ) : (
                customEvents.map((evt: any, i: number) => (
                  <Text key={i} style={styles.itemText}>
                    • {String(evt.details)} ({new Date(evt.timestamp).toLocaleTimeString()})
                  </Text>
                ))
            )}
        </View>

        {/* Buttons */}
        <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
                style={[styles.actionButton, styles.greyButton]}
                onPress={handleExportPdf}
            >
                <FontAwesome5 name="file-pdf" size={18} color="#fff" />
                <Text style={styles.actionButtonText}> Exporter en PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.actionButton, styles.greyButton]}
                onPress={handleGoHome}
            >
                <FontAwesome5 name="home" size={18} color="#fff" />
                <Text style={styles.actionButtonText}> Retour à l&apos;accueil</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Simple HTML generator for the PDF
function generateHtml(session: CprSession) {

  let cycleCount = 1;
  let eventsHtml = "";

  // Header for first cycle
  eventsHtml += `<tr class="cycle-header"><td colspan="3"><strong>RCP ${cycleCount}</strong></td></tr>`;

  session.events.forEach((evt: any) => {
      const time = new Date(evt.timestamp).toLocaleTimeString();
      const details = evt.details ? (typeof evt.details === "string" ? evt.details : JSON.stringify(evt.details)) : "-";

      eventsHtml += `
        <tr>
            <td>${time}</td>
            <td>${evt.type}</td>
            <td>${details}</td>
        </tr>
      `;

        if (evt.type === "event" && String(details).toUpperCase() === "RACS") {
          cycleCount++;
          eventsHtml += `<tr class="cycle-header"><td colspan="3" style="background-color: #e6fffa; text-align: center; padding: 10px;"><strong>RCP ${cycleCount}</strong> (Reprise)</td></tr>`;
        }
  });

  const pediatricInfo = session.pediatricData
    ? `<p><strong>Patient:</strong> Enfant (${session.pediatricData.ageValue} ${session.pediatricData.ageMode})</p>`
    : `<p><strong>Patient:</strong> Adulte (Standard)</p>`;

  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
            body { font-family: Helvetica, Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            .info { margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .cycle-header td { background-color: #e0e0e0; }
        </style>
      </head>
      <body>
        <h1>Rapport de Réanimation</h1>
        <div class="info">
            <p><strong>Date:</strong> ${new Date(session.startTime).toLocaleDateString()}</p>
            <p><strong>Heure début:</strong> ${new Date(session.startTime).toLocaleTimeString()}</p>
            ${session.endTime ? `<p><strong>Heure fin:</strong> ${new Date(session.endTime).toLocaleTimeString()}</p>` : ""}
            ${pediatricInfo}
            <p><strong>ID Session:</strong> ${session.id}</p>
        </div>
        
        <h2>Journal des événements</h2>
        <table>
            <thead>
                <tr>
                    <th>Heure</th>
                    <th>Type</th>
                    <th>Détails</th>
                </tr>
            </thead>
            <tbody>
                ${eventsHtml}
            </tbody>
        </table>
      </body>
    </html>
  `;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  summaryBackground: {
    backgroundColor: "#F0F2F5",
  },
  summaryScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0D47A1",
    marginLeft: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconWidth: {
    width: 24,
    textAlign: "center",
    marginRight: 8,
  },
  cardText: {
    fontSize: 16,
    color: "#333",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0D47A1",
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#777",
    fontStyle: "italic",
    marginTop: 4,
  },
  itemText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 4,
  },
  cycleTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#0D47A1',
      marginTop: 20,
      marginBottom: 10,
      marginLeft: 4,
  },
  cycleContainer: {
      marginBottom: 10,
  },

  actionButtonsContainer: {
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 2,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  greyButton: {
    backgroundColor: "#546E7A",
  },
  blueButton: {
    backgroundColor: "#007BFF",
  },
  tealButton: {
    backgroundColor: "#26A69A",
  },

  // Confirm styles
  confirmContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: "#666",
  },
  buttonGroupConfirm: {
    width: "100%",
    gap: 15,
  },
  buttonConfirm: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  resumeButton: {
    backgroundColor: "#28a745",
  },
  stopButton: {
    backgroundColor: "#d9534f",
  },
  deathButton: {
    backgroundColor: "#333", // Black/Dark Grey for Death
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
