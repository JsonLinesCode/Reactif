import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { sessionStore } from "@/store/sessionStore";

export default function CprEndFirstPage() {

    const handleDeath = async () => {

        await sessionStore.saveCurrentSession("Décès");
        router.push({ pathname: "/cprEnd", params: { mode: "death" } });
    };

    const handleRacs = () => {
        sessionStore.logEvent("RACS");
        router.push({ pathname: "/cprEnd", params: { mode: "racs" } });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.contentContainer}>
                <Text style={styles.title}>Fin de RCP</Text>
                    <Text style={styles.subtitle}>
                        Résultat de la réanimation
                    </Text>

                <View style={styles.buttonGroup}>
                    <TouchableOpacity
                        style={[styles.button, styles.deathButton]}
                        onPress={handleDeath}
                    >
                        <Text style={styles.buttonText}>Décès</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.racsButton]}
                        onPress={handleRacs}
                    >
                        <Text style={styles.buttonText}>RACS</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#333",
    },
    subtitle: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 40,
        color: "#666",
    },
    buttonGroup: {
        width: "100%",
        gap: 20,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        borderRadius: 12,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    deathButton: {
        backgroundColor: "#333", // Black/Dark Grey for Death
    },
    racsButton: {
        backgroundColor: "#28a745", // Green for RACS (Success/Life)
    },
    buttonText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 10,
    },
});
