import {
  Animated,
  Dimensions,
  Easing,
  GestureResponderEvent,
} from "react-native";

const WINDOW_WIDTH = Dimensions.get("screen").width;

export const useSwipe = (
  scrollX: Animated.Value,
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  rangeOffset = 4
) => {
  let initialPositionX = 0;

  function onAnimate(toValue: number) {
    Animated.timing(scrollX, {
      duration: 500,
      toValue,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }

  function onTouchStart(event: GestureResponderEvent) {
    initialPositionX = event.nativeEvent.pageX;
  }

  function onTouchEnd(event: GestureResponderEvent) {
    const positionX = event.nativeEvent.pageX;
    const range = WINDOW_WIDTH / rangeOffset;

    scrollX.setValue(0);

    // check if position is growing positively and has reached specified range
    if (positionX - initialPositionX > range) {
      onSwipeRight?.();
      onAnimate(positionX - initialPositionX);
    } else if (initialPositionX - positionX > range) {
      onSwipeLeft?.();
      onAnimate(positionX - initialPositionX);
    }
  }

  return { onTouchStart, onTouchEnd };
};
