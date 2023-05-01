/* eslint-disable no-console */
import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Button,
  Dimensions,
  ScrollView,
  Text,
  View,
} from "react-native";
import CityCoordinates from "@src/cityCoordinates.json";
import { METEO_URL, MeteoWeather, WeatherForecast } from "@src/consts";
import { FetchOptions, useFetch, useSwipe, useWeatherService } from "@src/hook";
import { weatherContext } from "@src/models";

import { Paginator } from "../Paginator";
import { WeatherGraph } from "../WeatherGraph";
import { Mock } from "./Mock";
import { styles } from "./Weather.styles";

type Coordinate = {
  name: string;
  coordinates: { latitude: number; longitude: number };
};
const { useRealm } = weatherContext;

export const Weather = () => {
  const { width, height } = Dimensions.get("screen");

  const index = useRef<number>(0);
  const [weather, setWeather] = useState<WeatherForecast[]>(Mock);
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

  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const directionRef = useRef(0);

  const onSwipeLeft = () => {
    directionRef.current = 1;

    setCurrentIndex((previousIndex: number) => {
      if (previousIndex === weather.length - 1) {
        return previousIndex;
      }
      return previousIndex + 1;
    });
  };

  const onSwipeRight = () => {
    directionRef.current = -1;
    setCurrentIndex((previousIndex: number) => {
      if (previousIndex === 0) {
        return previousIndex;
      }
      return previousIndex - 1;
    });
  };

  const { onTouchStart, onTouchEnd } = useSwipe(
    scrollX,
    onSwipeLeft,
    onSwipeRight,
    6
  );

  if (errors) {
    return <Text>error</Text>;
  }

  if (loading) {
    return <Text>Loading</Text>;
  }

  if (!weather.length) {
    return <Text>No Weather Found</Text>;
  }

  return (
    <>
      <ScrollView
        style={[styles.root, { width, height }]}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        scrollEnabled={false}
      >
        <WeatherGraph weather={weather} width={width} height={height} />
        <Paginator
          weather={weather}
          scrollX={scrollX}
          currentIndex={currentIndex}
          swipeDirection={directionRef.current > 0 ? "right" : "left"}
        />
      </ScrollView>
      <View style={styles.todo}>
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
      </View>
    </>
  );
};
