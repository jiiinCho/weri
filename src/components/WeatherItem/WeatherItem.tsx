/* eslint-disable no-console */
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { METEO_URL, MeteoWeather, WeatherForecast } from "@src/consts";
import { useFetch, useWeatherService } from "@src/hook";

type WeatherItemProps = {
  name: string;
  latitude: string;
  longitude: string;
};
export const WeatherItem = ({
  name,
  latitude,
  longitude,
}: WeatherItemProps) => {
  const { errors, loading, fetch } = useFetch<MeteoWeather>({
    url: METEO_URL,
    params: {
      latitude,
      longitude,
      hourly: "temperature_2m",
      forecast_days: 1,
    },
  });
  console.log("name", name);
  // first we need to validate if the weather is in local storage and if the date is old
  // if weather does not exist or data is out-dated, call fetch
  // if storage data and new data is same, no update storage
  // if no-network, use last item
  // if no-network, no last item -> render empty

  // we will store value

  const { getByName, createWeather, upsertWeather } = useWeatherService();
  const foundWeather = getByName(name);
  const [weather, setWeather] = useState<WeatherForecast | null>(foundWeather);

  useEffect(() => {
    if (!weather) {
      fetch().then((data: MeteoWeather) => {
        if (!data) {
          return;
        }
        const newWeather = createWeather(name, data);
        setWeather(newWeather);
      });
      return;
    }

    const { time } = weather;
    const weatherDate = time[0].slice(0, 9);
    const todayDate = new Date().toISOString().slice(0, 9);

    if (todayDate !== weatherDate) {
      fetch().then((data: MeteoWeather) => {
        const updatedWeather = upsertWeather(weather, data);
        setWeather(updatedWeather);
      });
    }
  }, [createWeather, fetch, foundWeather, name, upsertWeather, weather]);

  console.log("error", errors);
  console.log("loading", loading);
  return (
    <>
      <Text>{weather?.name}</Text>
      <Text>{weather?.temperature[0]}</Text>
    </>
  );
};
