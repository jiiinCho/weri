import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "gold",
    flexDirection: "row",
  },
  defaultDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#493d8a",
    marginHorizontal: 8,
  },
  largeDot: {
    backgroundColor: "dodgerblue",
  },
  mediumDot: {
    height: 7,
    width: 7,
    borderRadius: 3.5,
  },
  smallDot: {
    height: 5,
    width: 5,
    borderRadius: 2.5,
  },
});
