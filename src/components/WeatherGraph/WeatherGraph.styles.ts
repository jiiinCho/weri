import { StyleSheet } from "react-native";
import { COLORS, FONT_SIZES } from "@src/consts";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  currentTemperatureContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  currentTemperature: {
    fontFamily: "DMMedium",
    fontSize: FONT_SIZES.xxl,
  },
  temperatureUnit: {
    fontFamily: "DMRegular",
    fontSize: FONT_SIZES.xxl,
  },
  temperatureInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: "DMBold",
    fontSize: FONT_SIZES.xl,
  },
  minMaxTemperatureContainer: {
    flexDirection: "row",
  },
  minMaxTemperature: {
    fontFamily: "DMRegular",
    fontSize: FONT_SIZES.md,
    color: COLORS.grey,
  },
  spacing: {
    marginLeft: 8,
  },
});
