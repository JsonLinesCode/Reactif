import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Pdf from "react-native-pdf";

type Props = {
  source: { uri: string } | number | { uri: string; cache?: boolean };
};

export default function PdfViewer({ source }: Props) {
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator style={StyleSheet.absoluteFill} size="large" />
      )}
      <Pdf
        source={source}
        onLoadComplete={() => setLoading(false)}
        onError={() => setLoading(false)}
        style={styles.pdf}
        enablePaging={false}
        trustAllCerts={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pdf: {
    flex: 1,
    width: "100%",
  },
});
