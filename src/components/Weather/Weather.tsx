/* eslint-disable no-console */
import { View } from "react-native";
import { METEO_URL, MeteoWeather } from "@src/consts";
import { useFetch } from "@src/hook";

import { WeatherItem } from "../WeatherItem";

export const Weather = () => {
  const params = {
    latitude: 52.52,
    longitude: 13.41,
    current_weather: true,
    hourly: "temperature_2m",
    forecast_days: 1,
  };

  const { data, error, loading } = useFetch<MeteoWeather>({
    url: METEO_URL,
    params,
  });

  console.log("data", data?.current_weather);
  console.log("data", data?.hourly.temperature_2m);
  console.log("data", data?.hourly.time);
  console.log("error", error);
  console.log("loading", loading);
  return (
    <View>
      <WeatherItem />
    </View>
  );
};
