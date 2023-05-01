import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "tomato",
  },
  todo: {
    flexDirection: "row",
  },
  touchableLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "dodgerblue",
    opacity: 0,
  },
});
