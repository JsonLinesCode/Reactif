import { Fontisto } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Menu } from "react-native-paper";

import { t } from "@/i18n";
import { sessionStore } from "@/store/sessionStore";

interface ContextualMenuProps {
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
}

const ContextualMenu = ({
  isAllSelected,
  onToggleSelectAll,
}: ContextualMenuProps) => {
  const [theme, setTheme] = useState(sessionStore.theme);
  const isDark = theme === "dark";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = sessionStore.subscribe(() => {
      setTheme(sessionStore.theme);
    });
    return () => unsubscribe();
  }, []);

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
              { borderColor: isDark ? "#fff" : "#007BFF" },
            ]}
            onPress={openMenu}
          >
            <Fontisto
              name="more-v-a"
              size={20}
              color={isDark ? "#fff" : "#007BFF"}
            />
          </TouchableOpacity>
        }
      >
        <Menu.Item
          onPress={() => {
            onToggleSelectAll();
            closeMenu();
          }}
          title={isAllSelected ? t("menu.unselectAll") : t("menu.selectAll")}
        />
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  selectButton: {
    borderColor: "#007BFF",
    justifyContent: "center",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 100,
  },
});

export default ContextualMenu;
