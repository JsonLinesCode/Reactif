import React from "react";
import {
  Image,
  ImageSourcePropType,
  ImageURISource,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  imgSource: ImageSourcePropType;
};

export default function ImageViewer({ imgSource }: Props) {
  try {
    // Dynamically require to avoid crashing when library not installed
    // react-native-image-zoom-viewer expects an array of image objects
    // For local images we pass via `props.source`.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ImageZoomViewer = require("react-native-image-zoom-viewer").default;

    const imageItem = (() => {
      // Try to resolve local asset to a URI first (more reliable on iOS)
      try {
        // @ts-ignore
        const resolved = Image.resolveAssetSource(imgSource as any);
        if (resolved && resolved.uri) return { url: resolved.uri };
      } catch (err) {
        // ignore
      }

      if (typeof imgSource === "number") {
        return { props: { source: imgSource } };
      }
      const src = imgSource as ImageURISource;
      if (src && src.uri) return { url: src.uri };
      return { props: { source: imgSource } };
    })();

    return (
      <View style={styles.container}>
        {/* ImageZoomViewer renders a full-screen scrollable zoomable image */}
        {/* imageUrls accepts objects like { url: '...' } or { props: { source: require(...) } } */}
        {/* @ts-ignore dynamic require */}
        <ImageZoomViewer
          style={styles.zoomViewer}
          imageUrls={[imageItem]}
          enableImageZoom
          saveToLocalByLongPress={false}
          backgroundColor="transparent"
          imageStyle={{ resizeMode: "contain" }}
        />
      </View>
    );
  } catch (e) {
    // Fallback: show static Image if the zoom library isn't available
    return (
      <View style={styles.container}>
        {imgSource ? (
          <Image source={imgSource} style={styles.image} resizeMode="contain" />
        ) : (
          <Text>No image available</Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  zoomViewer: { flex: 1 },
  image: { width: "100%", height: "100%" },
});
