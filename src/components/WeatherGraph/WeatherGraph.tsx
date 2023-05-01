import React from "react";
import { View } from "react-native";
import {
  Canvas,
  Line,
  Path,
  Skia,
  SkPath,
  vec,
} from "@shopify/react-native-skia";
import { WeatherForecast } from "@src/consts";
import { curveBasis, line, scaleLinear, scaleTime } from "d3";

import { styles } from "./WeatherGraph.styles";

interface GraphData {
  min: number;
  max: number;
  curve: false | SkPath | null;
}

type WeatherGraphData = { time: string; temperature: number };

type WeatherItemProps = {
  weather: WeatherForecast;
  width: number;
  height: number;
};

export const WeatherGraph = ({ weather, width, height }: WeatherItemProps) => {
  const graphHeight = height * 0.75;
  const graphWidth = width;

  const makeGraph = (data: WeatherGraphData[]): GraphData => {
    const min = Math.min(...weather.temperature);
    const max = Math.max(...weather.temperature);

    const y = scaleLinear().domain([0, max]).range([graphHeight, 35]);
    const x = scaleTime()
      .domain([
        new Date(weather.time[0]),
        new Date(weather.time[weather.time.length - 1]),
      ])
      .range([10, graphWidth - 10]);

    const curvedLine = line<WeatherGraphData>()
      .x(({ time }: WeatherGraphData) => x(new Date(time)))
      .y(({ temperature }: WeatherGraphData) => y(temperature))
      .curve(curveBasis)(data);

    const skPath = !!curvedLine && Skia.Path.MakeFromSVGString(curvedLine);

    return {
      max,
      min,
      curve: skPath,
    };
  };

  const { temperature, time } = weather;
  const weatherGraphData: WeatherGraphData[] = temperature.map(
    (temperatureItem, index) => ({
      temperature: temperatureItem,
      time: time[index],
    })
  );

  const graphData = makeGraph(weatherGraphData).curve;

  if (!graphData) {
    return null;
  }

  return (
    <View style={styles.root}>
      <Canvas
        style={{
          width: graphWidth,
          height: graphHeight,
        }}
      >
        <Line
          p1={vec(0, graphHeight)}
          p2={vec(0, graphWidth)}
          color="lightgrey"
          style="stroke"
          strokeWidth={1}
        />
        <Line
          p1={vec(10, 130)}
          p2={vec(400, 130)}
          color="lightgrey"
          style="stroke"
          strokeWidth={1}
        />
        <Line
          p1={vec(10, 250)}
          p2={vec(400, 250)}
          color="lightgrey"
          style="stroke"
          strokeWidth={1}
        />
        <Line
          p1={vec(10, 370)}
          p2={vec(400, 370)}
          color="lightgrey"
          style="stroke"
          strokeWidth={1}
        />
        <Path style="stroke" path={graphData} strokeWidth={4} color="#6231ff" />
      </Canvas>
    </View>
  );
};
