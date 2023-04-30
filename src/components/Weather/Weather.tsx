import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Button,
  Dimensions,
  FlatList,
  Text,
  View,
  ViewToken,
} from "react-native";
import CityCoordinates from "@src/cityCoordinates.json";
import { METEO_URL, MeteoWeather, WeatherForecast } from "@src/consts";
import { FetchOptions, useFetch, useWeatherService } from "@src/hook";
import { weatherContext } from "@src/models";

import { Paginator } from "../Paginator";
import { WeatherItem } from "../WeatherItem";
import { Mock } from "./Mock";
import { styles } from "./Weather.styles";
type Coordinate = {
  name: string;
  coordinates: { latitude: number; longitude: number };
};
const { useRealm } = weatherContext;

export const Weather = () => {
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

  const viewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      const currenItemIndex = viewableItems[0].index;
      if (currenItemIndex) {
        setCurrentIndex((previousIndex: number) => {
          directionRef.current = currenItemIndex - previousIndex;
          return currenItemIndex;
        });
      }
    },
    []
  );

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  const weatherRef = useRef(null);
  const { width } = Dimensions.get("screen");

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
      <View style={styles.root}>
        <FlatList
          data={weather}
          renderItem={({ item }: { item: WeatherForecast }) => (
            <WeatherItem weather={item} width={width} />
          )}
          showsHorizontalScrollIndicator={false}
          horizontal
          pagingEnabled
          bounces={false}
          keyExtractor={(item: WeatherForecast) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false } // for background change animation
          )}
          viewabilityConfig={viewConfig}
          onViewableItemsChanged={viewableItemsChanged}
          scrollEventThrottle={32}
          ref={weatherRef}
          getItemLayout={(_, itemIndex: number) => ({
            length: width,
            offset: width * itemIndex,
            index: itemIndex,
          })}
        />
        <Paginator
          weather={weather}
          scrollX={scrollX}
          currentIndex={currentIndex}
          swipeDirection={directionRef.current > 0 ? "right" : "left"}
        />
      </View>
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
