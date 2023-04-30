import { useCallback } from "react";
import { MeteoWeather, WeatherForecast } from "@src/consts";
import { Weather, weatherContext } from "@src/models";
import { Object } from "realm";

const { useQuery, useRealm } = weatherContext;

export const useWeatherService = () => {
  const realm = useRealm();

  const convertToWeatherForecast = (
    source: Weather & Object<unknown, never>
  ): WeatherForecast => {
    const { _id, name, time, timeUnit, temperature, temperatureUnit } = source;
    const convertedTime = time.map((item: string) => item);
    const convertedTemperature = temperature.map((item: number) => item);

    return {
      id: _id.toHexString(),
      name,
      time: convertedTime,
      timeUnit,
      temperature: convertedTemperature,
      temperatureUnit,
    };
  };

  const getByName = useCallback((name: string): WeatherForecast | null => {
    const weathers = useQuery(Weather);
    const matchedWeathers = weathers.filtered(`name == '${name}'`);
    if (!matchedWeathers.length) {
      return null;
    }

    return convertToWeatherForecast(matchedWeathers[0]);
  }, []);

  const createWeather = useCallback(
    (name: string, response?: MeteoWeather): WeatherForecast | null => {
      if (!response) {
        return null;
      }

      const { hourly, hourly_units } = response;
      const objectId = new Realm.BSON.ObjectId();

      const newWeather: WeatherForecast = {
        id: objectId.toHexString(),
        name,
        temperature: hourly.temperature_2m,
        temperatureUnit: hourly_units.temperature_2m,
        time: hourly.time,
        timeUnit: hourly_units.time,
      };

      realm.write(() => {
        realm.create("Weather", {
          _id: objectId,
          ...newWeather,
        });
      });

      return newWeather;
    },
    [realm]
  );

  const upsertWeather = useCallback(
    (
      weather: WeatherForecast,
      response?: MeteoWeather
    ): WeatherForecast | null => {
      if (!response) {
        return null;
      }

      const { hourly } = response;
      const updatedWeather: WeatherForecast = {
        ...weather,
        temperature: hourly.temperature_2m,
        time: hourly.time,
      };

      realm.write(() => {
        realm.create(
          // @ts-expect-error refer to docs https://www.mongodb.com/docs/realm/sdk/react-native/crud/update/
          "Weather",
          {
            _id: weather.id,
            temperature: hourly.temperature_2m,
            time: hourly.time,
          },
          "modified"
        );
      });

      return updatedWeather;
    },
    [realm]
  );

  const deleteWeather = useCallback(
    (weather: Weather) => {
      realm.write(() => {
        realm.delete(weather);
      });
    },
    [realm]
  );

  return { getByName, createWeather, upsertWeather, deleteWeather };
};
