export type MeteoWeather = {
  current_weather: { temperature: number; time: string };
  hourly: {
    temperature_2m: number[];
    time: string[];
  };
  hourly_units: {
    temperature_2m: string;
    time: string;
  };
};
