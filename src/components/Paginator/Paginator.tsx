import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
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
  currentIndex,
  swipeDirection,
}: PaginatorProps) => {
  const maxIndex = weather.length - 1;

  const getLargeDotIndex = (): number => {
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

    return indexIndicator;
  };

  const getLastDotStyle = (): number | undefined => {
    let indexIndicator;
    if (
      currentIndex > 3 &&
      currentIndex < maxIndex - 1 &&
      swipeDirection === "right"
    ) {
      indexIndicator = 4;
    }

    if (
      currentIndex > 3 &&
      currentIndex < maxIndex - 2 &&
      swipeDirection === "left"
    ) {
      indexIndicator = 4;
    }

    return indexIndicator;
  };

  const getFirstDotStyle = (): number | undefined => {
    let indexIndicator;
    if (currentIndex > 3 && swipeDirection === "right") {
      indexIndicator = 0;
    }

    if (currentIndex > 2 && swipeDirection === "left") {
      indexIndicator = 0;
    }

    return indexIndicator;
  };

  const onAnimateRef = useRef(false);

  useEffect(() => {
    if (currentIndex > 2 && currentIndex < maxIndex - 1) {
      onAnimateRef.current = true;
    } else {
      onAnimateRef.current = false;
    }
  }, [currentIndex, maxIndex]);

  const bounce = useRef(new Animated.Value(0)).current;
  const scaleBounce = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.root}>
      {[0, 1, 2, 3, 4].map((dotItemIndex: number) => {
        const scale = scaleBounce.interpolate({
          inputRange: [0, 100],
          outputRange: [1, 0.25],
        });

        const opacity = scaleBounce.interpolate({
          inputRange: [0, 100],
          outputRange: [1, 0.25],
        });

        const rightOutputRange = [-10, 0, 10];
        const leftOutputRange = [10, 0, 10];

        const translateX = bounce.interpolate({
          inputRange: [-100, 0, 100],
          outputRange:
            swipeDirection === "right" ? rightOutputRange : leftOutputRange,
        });

        if (onAnimateRef.current) {
          Animated.parallel([
            Animated.timing(bounce, {
              toValue: 100 * (swipeDirection === "right" ? -1 : 1),
              duration: 350,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
            Animated.timing(scaleBounce, {
              toValue: 100,
              duration: 150,
              easing: Easing.bounce,
              useNativeDriver: true,
            }),
          ]).start(({ finished }) => {
            if (finished) {
              scaleBounce.setValue(0);
              bounce.setValue(0);
            }
          });
        }

        return (
          <Animated.View
            key={dotItemIndex}
            style={[
              styles.defaultDot,
              { opacity, transform: [{ translateX }, { scale }] },
              dotItemIndex === getLargeDotIndex() && styles.largeDot,
              dotItemIndex === getLastDotStyle() && styles.mediumDot,
              dotItemIndex === getFirstDotStyle() && styles.mediumDot,
            ]}
          />
        );
      })}
    </View>
  );
};
