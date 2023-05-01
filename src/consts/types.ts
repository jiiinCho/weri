export type MeteoWeather = {
  hourly: {
    temperature_2m: number[];
    time: string[];
  };
  hourly_units: {
    temperature_2m: string;
    time: string;
  };
};

export type WeatherForecast = {
  name: string;
  temperature: number[];
  temperatureUnit: string;
  time: string[];
  timeUnit: string;
  id: string;
};

export type WeatherInfo = {
  name: string;
  currentTemperature: number;
  highestTemperature: number;
  lowestTemperature: number;
};
