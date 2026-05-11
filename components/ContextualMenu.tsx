import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Menu } from 'react-native-paper';
import { Fontisto } from "@expo/vector-icons";

import { sessionStore } from "@/store/sessionStore";

interface ContextualMenuProps {
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
}

const ContextualMenu = ({ isAllSelected, onToggleSelectAll }: ContextualMenuProps) => {
    const [theme] = useState(sessionStore.theme);
    const isDark = theme === "dark";
    const [visible, setVisible] = useState(false);

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    return (
        <View style={styles.container}>
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={
                    <TouchableOpacity
                        style={[
                          styles.selectButton,
                          { borderColor: isDark ? "#93c5fd" : "#007BFF" },
                        ]}
                        onPress={openMenu}
                    >
                      <Fontisto name="more-v-a" size={20} color={isDark ? "#93c5fd" : "#007BFF"}/>
                    </TouchableOpacity>
                }
            >
                <Menu.Item
                    onPress={() => {
                        onToggleSelectAll();
                        closeMenu();
                    }}
                    title={isAllSelected ? "Tout désélectionner" : "Tout sélectionner"}
                />
            </Menu>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
    },
    selectButton: {
        borderColor: "#007BFF",
        justifyContent: "center",
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 100,
    }
});

export default ContextualMenu;