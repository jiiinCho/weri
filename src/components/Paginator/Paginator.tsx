/* eslint-disable no-console */
import { Animated, Dimensions, View } from "react-native";
import { WeatherForecast } from "@src/consts";

import { styles } from "./Paginator.styles";
type PaginatorProps = {
  scrollX: Animated.Value;
  weather: WeatherForecast[];
  currentIndex: number;
  swipeDirection: "right" | "left";
};

export const Paginator = ({
  weather,
  scrollX,
  currentIndex,
  swipeDirection,
}: PaginatorProps) => {
  const { width } = Dimensions.get("screen");

  const maxIndex = weather.length - 1;
  let indexIndicator = currentIndex % 5;

  if (
    currentIndex > 3 &&
    currentIndex < maxIndex &&
    swipeDirection === "right"
  ) {
    indexIndicator = 3;
  }

  if (
    currentIndex < maxIndex - 1 &&
    currentIndex > 1 &&
    swipeDirection === "left"
  ) {
    indexIndicator = 2;
  }

  if (currentIndex === maxIndex) {
    indexIndicator = 4;
  }

  if (currentIndex === maxIndex - 1) {
    indexIndicator = 3;
  }

  const inputRange = [
    (currentIndex - 1) * width,
    currentIndex * width,
    (currentIndex + 1) * width,
  ];

  const dotSize = scrollX.interpolate({
    inputRange,
    outputRange: [10, 14, 10],
    extrapolate: "clamp",
  });

  const dotRadius = scrollX.interpolate({
    inputRange,
    outputRange: [5, 7, 5],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.root}>
      <Animated.View
        style={[
          styles.defaultDot,
          indexIndicator === 0 && {
            width: dotSize,
            height: dotSize,
            borderRadius: dotRadius,
          },
          currentIndex > 2 && styles.mediumDot,
        ]}
        key={0}
      />
      <Animated.View
        style={[
          styles.defaultDot,
          indexIndicator === 1 && {
            width: dotSize,
            height: dotSize,
            borderRadius: dotRadius,
          },
        ]}
        key={1}
      />
      <Animated.View
        style={[
          styles.defaultDot,
          indexIndicator === 2 && {
            width: dotSize,
            height: dotSize,
            borderRadius: dotRadius,
          },
        ]}
        key={2}
      />
      <Animated.View
        style={[
          styles.defaultDot,
          indexIndicator === 3 && {
            width: dotSize,
            height: dotSize,
            borderRadius: dotRadius,
          },
        ]}
        key={3}
      />
      <Animated.View
        style={[
          styles.defaultDot,
          indexIndicator === 4 && {
            width: dotSize,
            height: dotSize,
            borderRadius: dotRadius,
          },
          currentIndex < maxIndex - 1 && styles.mediumDot,
        ]}
        key={4}
      />
    </View>
  );
};
