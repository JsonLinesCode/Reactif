import React from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  imgSource: ImageSourcePropType;
};

const AnimatedView = Animated.createAnimatedComponent(View);
const MAX_SCALE = 4;

export default function ImageViewer({ imgSource }: Props) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const reset = () => {
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  const changeZoom = (delta: number) => {
    const next = clamp(savedScale.value + delta, 1, MAX_SCALE);
    scale.value = withTiming(next);
    savedScale.value = next;
    if (next === 1) {
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    }
  };

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = clamp(savedScale.value * event.scale, 1, MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (savedScale.value <= 1) {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (savedScale.value <= 1) {
        return;
      }
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedGesture = Gesture.Simultaneous(pinch, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <View style={styles.viewport}>
          <AnimatedView style={[styles.imageFrame, animatedStyle]}>
            <Image
              source={imgSource}
              style={styles.image}
              resizeMode="contain"
            />
          </AnimatedView>
        </View>
      </GestureDetector>

      <View style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={reset}>
          <Text style={styles.controlText}>Reset</Text>
        </Pressable>
        <Pressable
          style={styles.controlButton}
          onPress={() => changeZoom(-0.25)}
        >
          <Text style={styles.controlText}>-</Text>
        </Pressable>
        <Pressable
          style={styles.controlButton}
          onPress={() => changeZoom(0.25)}
        >
          <Text style={styles.controlText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewport: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
  },
  imageFrame: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 12,
  },
  controlButton: {
    minWidth: 64,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  controlText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
});
