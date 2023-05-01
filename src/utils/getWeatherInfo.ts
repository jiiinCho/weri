import { WeatherForecast, WeatherInfo } from "@src/consts";

export const getWeatherInfo = (
  weatherForcasts: WeatherForecast[]
): WeatherInfo[] => {
  return weatherForcasts.map((weatherForcast: WeatherForecast) => {
    const { name, temperature } = weatherForcast;

    const nowTimeIndex = new Date().getUTCHours(); // 13

    const pairTemperature =
      temperature[nowTimeIndex === 23 ? nowTimeIndex - 1 : nowTimeIndex + 1];

    const meanTemperature = (temperature[nowTimeIndex] + pairTemperature) * 0.5;
    const highestTemperature = Math.max(...temperature);
    const lowestTemperature = Math.min(...temperature);

    return {
      name: name.toUpperCase(),
      currentTemperature: Math.round(meanTemperature * 10) / 10,
      highestTemperature,
      lowestTemperature,
    };
  });
};
