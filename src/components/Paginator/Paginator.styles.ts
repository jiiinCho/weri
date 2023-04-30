import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    height: 64,
    alignItems: "center",
    backgroundColor: "gold",
  },
  defaultDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#493d8a",
    marginHorizontal: 8,
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
