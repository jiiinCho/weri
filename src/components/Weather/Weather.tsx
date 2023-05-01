import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import CityCoordinates from "@src/cityCoordinates.json";
import { METEO_URL, MeteoWeather, WeatherForecast } from "@src/consts";
import { FetchOptions, useFetch, useWeatherService } from "@src/hook";
import { weatherContext } from "@src/models";

import { Paginator } from "../Paginator";
import { WeatherGraph } from "../WeatherGraph";
import { styles } from "./Weather.styles";

type Coordinate = {
  name: string;
  coordinates: { latitude: number; longitude: number };
};
const { useRealm } = weatherContext;

export const Weather = () => {
  const { width, height } = Dimensions.get("screen");

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

      setWeather((previousWeather: WeatherForecast[]) => {
        const found = previousWeather.find(
          ({ id }) => id === returnWeather?.id
        );
        return found ? previousWeather : [...previousWeather, foundWeather];
      });
    },
    [createWeather, fetch, getByName, upsertWeather]
  );

  useEffect(() => {
    updateWeather(CityCoordinates[0]);
    updateWeather(CityCoordinates[1]);
    updateWeather(CityCoordinates[2]);
    updateWeather(CityCoordinates[3]);
    updateWeather(CityCoordinates[4]);
  }, [updateWeather]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const directionRef = useRef(0);

  const onSwipeLeft = () => {
    directionRef.current = 1;
    if (currentIndex >= CityCoordinates.length - 2) {
      return;
    }

    updateWeather(CityCoordinates[currentIndex + 2]);
    setCurrentIndex((previousIndex: number) => previousIndex + 1);
  };

  const onSwipeRight = () => {
    directionRef.current = -1;
    if (currentIndex < 1) {
      return;
    }

    updateWeather(CityCoordinates[currentIndex - 1]);
    setCurrentIndex((previousIndex: number) => previousIndex - 1);
  };

  const rangeOffset = 6;
  const gestureXPosition = useRef(0);
  const range = width / rangeOffset;

  const gesture = Gesture.Pan()
    .onBegin(
      (
        gestureEvent: GestureStateChangeEvent<PanGestureHandlerEventPayload>
      ) => {
        gestureXPosition.current = gestureEvent.translationX;
      }
    )
    .onEnd(
      (
        gestureEvent: GestureStateChangeEvent<PanGestureHandlerEventPayload>
      ) => {
        const currentXPostion = gestureEvent.translationX;
        if (currentXPostion - gestureXPosition.current > range) {
          onSwipeRight();
        } else if (gestureXPosition.current - currentXPostion > range) {
          onSwipeLeft();
        }
      }
    )
    .onFinalize(() => {
      gestureXPosition.current = 0;
    });

  if (errors) {
    return <Text>error</Text>;
  }

  if (!weather.length) {
    return <Text>No Weather Found</Text>;
  }

  return (
    <View style={styles.root}>
      <GestureDetector gesture={gesture}>
        <View>
          {loading ? (
            <View style={[styles.root, styles.loader]}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <WeatherGraph
              weather={weather}
              width={width}
              height={height}
              currentIndex={currentIndex}
              swipeDirection={directionRef.current > 0 ? "right" : "left"}
            />
          )}

          <Paginator
            weather={weather}
            currentIndex={currentIndex}
            swipeDirection={directionRef.current > 0 ? "right" : "left"}
          />
          <View style={styles.touchableLayer} />
        </View>
      </GestureDetector>
    </View>
  );
};
