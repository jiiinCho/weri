import { StyleSheet } from "react-native";
import { COLORS, DIMENSIONS } from "@src/consts";

export const styles = StyleSheet.create({
  root: {
    height: DIMENSIONS.paginatorHeight,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  defaultDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: COLORS.lightGrey,
    marginHorizontal: 8,
  },
  largeDot: {
    backgroundColor: COLORS.primary,
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
