import { useCallback, useRef, useState } from "react";
import { Button, Text, View } from "react-native";
import CityCoordinates from "@src/cityCoordinates.json";
import { WeatherItem } from "@src/components";
import { METEO_URL, MeteoWeather, WeatherForecast } from "@src/consts";
import { FetchOptions, useFetch, useWeatherService } from "@src/hook";
import { weatherContext } from "@src/models";

type Coordinate = {
  name: string;
  coordinates: { latitude: number; longitude: number };
};

const { useRealm } = weatherContext;

export const Weather = () => {
  const index = useRef<number>(0);
  const [weather, setWeather] = useState<WeatherForecast[]>([]);
  const { errors, loading, fetch } = useFetch<MeteoWeather>();
  const realm = useRealm();
  const { getByName, createWeather, upsertWeather } = useWeatherService(realm);

  const updateWeather = useCallback(
    (coordinateSource: Coordinate) => {
      const {
        name,
        coordinates: { latitude, longitude },
      } = coordinateSource;

      const fetchOptions: FetchOptions = {
        url: METEO_URL,
        params: {
          latitude,
          longitude,
          hourly: "temperature_2m",
          forecast_days: 1,
        },
      };

      const foundWeather = getByName(name);
      let returnWeather: WeatherForecast | null = foundWeather;

      if (!foundWeather) {
        fetch(fetchOptions).then((data: MeteoWeather) => {
          if (!data) {
            return;
          }
          returnWeather = createWeather(name, data);
          setWeather((previousWeather: WeatherForecast[]) =>
            returnWeather
              ? [...previousWeather, returnWeather]
              : previousWeather
          );
        });
        return;
      }

      const { time } = foundWeather;
      const weatherDate = time[0].slice(0, 9);
      const todayDate = new Date().toISOString().slice(0, 9);

      if (todayDate !== weatherDate) {
        fetch(fetchOptions).then((data: MeteoWeather) => {
          returnWeather = upsertWeather(foundWeather, data);
          setWeather((previousWeather: WeatherForecast[]) =>
            returnWeather
              ? [...previousWeather, returnWeather]
              : previousWeather
          );
        });
        return;
      }

      setWeather((previousWeather: WeatherForecast[]) =>
        returnWeather ? [...previousWeather, returnWeather] : previousWeather
      );
    },
    [createWeather, fetch, getByName, upsertWeather]
  );

  if (errors) {
    return <Text>error</Text>;
  }

  if (loading) {
    return <Text>Loading</Text>;
  }

  if (!weather.length) {
    return (
      <>
        <Text>No Weather Found</Text>
        <Button
          title="next"
          onPress={() => {
            index.current = -1;
            const coordinate = CityCoordinates[index.current + 1];
            updateWeather(coordinate);
          }}
        />
      </>
    );
  }

  return (
    <View>
      <WeatherItem weather={weather[index.current]} />
      <Button
        title="next"
        onPress={() => {
          index.current += 1;
          const coordinate = CityCoordinates[index.current + 1];
          updateWeather(coordinate);
        }}
      />
      <Button
        title="prev"
        onPress={() => {
          index.current -= 1;
          const coordinate = CityCoordinates[index.current - 1];
          updateWeather(coordinate);
        }}
      />
      <Text>{index.toString()}</Text>
    </View>
  );
};
