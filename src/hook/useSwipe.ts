import { Dimensions, GestureResponderEvent } from "react-native";

const WINDOW_WIDTH = Dimensions.get("screen").width;

export const useSwipe = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  rangeOffset = 4
) => {
  let initialPositionX = 0;

  function onTouchStart(event: GestureResponderEvent) {
    initialPositionX = event.nativeEvent.pageX;
  }

  function onTouchEnd(event: GestureResponderEvent) {
    const positionX = event.nativeEvent.pageX;
    const range = WINDOW_WIDTH / rangeOffset;

    // check if position is growing positively and has reached specified range
    if (positionX - initialPositionX > range) {
      onSwipeRight?.();
    } else if (initialPositionX - positionX > range) {
      onSwipeLeft?.();
    }
  }

  return { onTouchStart, onTouchEnd };
};
