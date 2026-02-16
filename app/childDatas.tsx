import React, { useState } from "react";
import {
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    Alert,
    TextInput,
    LayoutAnimation,
    Platform,
    UIManager
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {router, useRouter} from "expo-router";



//For Android platforms
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AgeMode = 'months' | 'years';

let savedDatas: Record<AgeMode, string> = {
    months: "",
    years: ""
};

export default function ChildDatas() {

    const [expanded, setExpanded] = useState(false);
    const toggleExpand = () => {
        //Animation
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const [mode, setMode] = useState<AgeMode | undefined>(undefined);
    const [valeurTemp, setValeurTemp] = useState('');
    const [yearsInputVisible, setYearsInputVisible] = useState(false);
    const [monthsInputVisible, setMonthsInputVisible] = useState(false);

    const saveValue = () => {
        if (mode === undefined) {
            Alert.alert("Error", "Please select a mode (Months or Years).");
            return;
        }
        if (valeurTemp === "") {
            Alert.alert("Error", "Please enter a valid value.");
            return;
        }
        savedDatas[mode] = valeurTemp;

        Alert.alert(
            "Saved !",
            `Value for ${mode} : ${savedDatas[mode]}\nTotal actuel : Mois(${savedDatas.months}), Année(${savedDatas.years})`
        );

        setValeurTemp('');
    }; // End of saveValue function

    const toggleYearsInput = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setYearsInputVisible(!yearsInputVisible);
        if (!yearsInputVisible) {
            setMode('years');
        }
    };
    const toggleMonthsInput = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMonthsInputVisible(!monthsInputVisible);
        if (!monthsInputVisible) {
            setMode('months');
        }
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#25292e'}} edges={['top', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.Container}>

                <TouchableOpacity
                    style={styles.choiceButton}
                    onPress={toggleExpand}
                >
                    <Text style={styles.choiceButtonText}>
                        {expanded ? "Fermer" : "Âge"}
                    </Text>
                </TouchableOpacity>
                {/* Content that disappear/appear */}
                {expanded && (
                    <View style={styles.expandedContent}>
                        <Text style={styles.expendedButtonText}> Choix mois/années</Text>

                        {/* Mois */}

                        <TouchableOpacity
                            style={styles.subButton}
                            onPress={toggleMonthsInput}
                        >
                            <Text style={styles.subButtonText}>
                                {monthsInputVisible ? "Fermer Mois" : "Mois"}
                            </Text>
                        </TouchableOpacity>

                        {monthsInputVisible && (
                            <View style={styles.expandedContent}>
                                <Text style={styles.expendedButtonText}>{"Entrez l'âge (mois):"}</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="Ex: 10"
                                    placeholderTextColor="#ccc"
                                    value={mode === 'months' ? valeurTemp : ''}
                                    onChangeText={(text) => {
                                        setMode('months');
                                        setValeurTemp(text);
                                    }}
                                />
                                <TouchableOpacity
                                    style={styles.validationButton}
                                    onPress={() => router.push("/cprPediatric")}
                                >
                                    <Text style={styles.subButtonText}> Valider et calculer</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Années */}

                        <TouchableOpacity
                            style={styles.subButton}
                            onPress={toggleYearsInput}
                        >
                            <Text style={styles.subButtonText}>
                                {yearsInputVisible ? "Fermer Années" : "Années"}
                            </Text>
                        </TouchableOpacity>

                        {yearsInputVisible && (
                            <View style={styles.expandedContent}>
                                <Text style={styles.expendedButtonText}>Entrez âge (années):</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="Ex: 5"
                                    placeholderTextColor="#ccc"
                                    value={mode === 'years' ? valeurTemp : ''}
                                    onChangeText={(text) => {
                                        setMode('years');
                                        setValeurTemp(text);
                                    }}
                                />
                                <TouchableOpacity
                                    style={styles.validationButton}
                                    onPress={() => router.push("/cprPediatric")}
                                >
                                    <Text style={styles.subButtonText}> Valider et calculer</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
                <View style={styles.expandedContent}></View>
                <TouchableOpacity
                    style={styles.choiceButton}
                    onPress={() => {
                    }}
                >
                    <Text style={styles.choiceButtonText}>Poids (kg)</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        paddingTop: 100,
        padding: 20,
        justifyContent: "flex-start",
        backgroundColor: "#25292e",
        alignItems: "center",
    },
    choiceButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    choiceButton: {
        backgroundColor: "#007BFF",
        paddingVertical: 18,
        borderRadius: 12,
        marginBottom: 20,
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    expandedContent: {
        backgroundColor: "#25292e",
        paddingVertical: 18,
        borderRadius: 12,
        marginBottom: 20,
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    expendedButtonText: {
        color: "#ffe",
        fontSize: 18,
        fontWeight: "bold",
    },
    subButton: {
        backgroundColor: "#007BFF",
        paddingVertical: 18,
        borderRadius: 12,
        marginBottom: 20,
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    subButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    input: {
        backgroundColor: "#fff",
        color: "#000",
        padding: 10,
        borderRadius: 8,
        width: "80%",
        marginTop: 10,
        fontSize: 16,
    },
    inputButton: {
        backgroundColor: "#007BFF",
        paddingVertical: 18,
        borderRadius: 12,
        marginBottom: 20,
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    modeButtonSelected: {
        backgroundColor: "#fff",
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 20,
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    activeTab: { backgroundColor: '#007AFF' },
    activeTabText:{ color: '#fff', fontSize: 14, fontWeight: 'bold'},
    tabText: { color: '#007AFF', fontWeight: 'bold', fontSize: 14},
    validationButton: {
        backgroundColor: "#28a745",
        paddingVertical: 18,
        borderRadius: 12,
        marginBottom: 20,
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
});
