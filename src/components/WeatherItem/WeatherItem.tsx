import { Text } from "react-native";
import { WeatherForecast } from "@src/consts";

type WeatherItemProps = {
  weather: WeatherForecast;
};
export const WeatherItem = ({ weather }: WeatherItemProps) => {
  return (
    <>
      <Text>{weather?.name}</Text>
      <Text>{weather?.temperature[0]}</Text>
    </>
  );
};
