import { useState } from "react";
import { Button, Text, View } from "react-native";
import CityCoordinates from "@src/cityCoordinates.json";
import { WeatherItem } from "@src/components";

type Coordinate = {
  name: string;
  coordinates: { latitude: number; longitude: number };
};

export const Weather = () => {
  const [index, setIndex] = useState(0);
  const [coordinate, setCoordinates] = useState<Coordinate>(CityCoordinates[0]);

  return (
    <View>
      <WeatherItem
        name={coordinate.name}
        latitude={coordinate.coordinates.latitude.toString()}
        longitude={coordinate.coordinates.longitude.toString()}
      />
      <Button
        title="next"
        onPress={() => {
          setCoordinates(CityCoordinates[index + 1]);
          setIndex((prev: number) => prev + 1);
        }}
      />
      <Button
        title="prev"
        onPress={() => {
          setCoordinates(CityCoordinates[index - 1]);

          setIndex((prev: number) => prev - 1);
        }}
      />
      <Text>{index.toString()}</Text>
    </View>
  );
};
