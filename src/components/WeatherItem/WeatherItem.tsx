/* eslint-disable no-console */
import { Text, View } from "react-native";
import { WeatherForecast } from "@src/consts";

import { styles } from "./WeatherItem.styles";

type WeatherItemProps = {
  weather: WeatherForecast;
  width: number;
};
export const WeatherItem = ({ weather, width }: WeatherItemProps) => {
  return (
    <View style={[styles.root, { width }]}>
      <Text>{weather?.name}</Text>
      <Text>{weather?.temperature[0]}</Text>
    </View>
  );
};
