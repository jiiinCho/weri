import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Text as DefaultText, View } from "react-native";
import {
  Canvas,
  Easing,
  Group,
  Line,
  Path,
  runTiming,
  Skia,
  SkPath,
  Text,
  useComputedValue,
  useFont,
  useValue,
  vec,
} from "@shopify/react-native-skia";
import { WeatherForecast } from "@src/consts";
import { curveBasis, line, scaleLinear, scaleTime } from "d3";

import DMSansRegular from "../../../assets/fonts/DMSans-Regular.ttf";
import { styles } from "./WeatherGraph.styles";
interface GraphData {
  min: number;
  max: number;
  curve: false | SkPath | null;
}

type WeatherGraphData = {
  time: string;
  temperature: number;
};

type WeatherMetaData = {
  weatherGraph: WeatherGraphData[];
  minTemperature: number;
  maxTemperature: number;
  name: string;
};

type YAxisMeta = {
  yAxisText: number[];
  yAxisPosition: number[];
  name: string;
};

type XAxisMeta = {
  xAxisText: number[];
  yAxisPositionUnit: number;
};

type WeatherItemProps = {
  weather: WeatherForecast[];
  width: number;
  height: number;
  currentIndex: number;
  swipeDirection: "right" | "left";
};

export const WeatherGraph = ({
  weather,
  width,
  height,
  currentIndex,
  swipeDirection,
}: WeatherItemProps) => {
  const graphHeight = height * 0.6;
  const graphWidth = width;

  const margin = {
    left: 20,
    right: 20,
    bottom: 20,
    top: 20,
  };

  const transition = useValue(1);
  const state = useValue({
    current: 0,
    next: 1,
  });

  const yAxisRef = useRef<YAxisMeta[]>([]);
  const xAxisRef = useRef<XAxisMeta | undefined>(undefined);

  const makeGraph = useCallback(
    (data: WeatherMetaData): GraphData => {
      const { minTemperature, maxTemperature, weatherGraph, name } = data;

      const minThird = Math.floor(minTemperature / 2);
      const maxThird = Math.floor(maxTemperature / 2);
      const yMinRange = minThird * 2 - 2 * 2;
      const yMaxRange = maxThird * 2 + 2 * 2;

      const y = scaleLinear()
        .domain([yMinRange, yMaxRange])
        .range([graphHeight - margin.bottom, margin.top]);

      const yAxisText = y.ticks();
      const yAxisPosition = yAxisText.map((text: number) => y(text));

      const yAxisMeta: YAxisMeta = { yAxisText, yAxisPosition, name };
      const previousYAxis = yAxisRef.current;
      const found = previousYAxis.find(
        ({ name: cityName }) => cityName === name
      );
      if (!found) {
        yAxisRef.current = [...previousYAxis, yAxisMeta];
      }

      const x = scaleTime()
        .domain([
          new Date(weatherGraph[0].time),
          new Date(weatherGraph[weatherGraph.length - 1].time),
        ])
        .range([margin.left, graphWidth - margin.right]);

      const curvedLine = line<WeatherGraphData>()
        .x(({ time }: WeatherGraphData) => x(new Date(time)))
        .y(({ temperature }: WeatherGraphData) => y(temperature))
        .curve(curveBasis)(weatherGraph);

      const skPath = !!curvedLine && Skia.Path.MakeFromSVGString(curvedLine);

      return {
        max: maxTemperature,
        min: minTemperature,
        curve: skPath,
      };
    },
    [
      graphHeight,
      graphWidth,
      margin.bottom,
      margin.left,
      margin.right,
      margin.top,
    ]
  );

  const getWeatherGraphData = useCallback(
    (weatherItem: WeatherForecast): WeatherMetaData => {
      const { temperature, time, name } = weatherItem;
      const min = Math.min(...temperature);
      const max = Math.max(...temperature);

      const weatherGraph = temperature.map((temperatureItem, index) => ({
        temperature: temperatureItem,
        time: time[index],
      }));

      if (!xAxisRef.current) {
        const xAxisText = time.map((timeString: string) =>
          new Date(timeString).getHours()
        );

        xAxisRef.current = {
          xAxisText,
          yAxisPositionUnit:
            (graphWidth - margin.left - margin.left) / xAxisText.length,
        };
      }

      return {
        weatherGraph,
        minTemperature: min,
        maxTemperature: max,
        name,
      };
    },
    [graphWidth, margin.left]
  );

  const graphData = useRef<GraphData[]>(
    weather.map((weatherItem: WeatherForecast) =>
      makeGraph(getWeatherGraphData(weatherItem))
    )
  );

  const [yAxis, setYAxis] = useState<YAxisMeta | undefined>(
    yAxisRef.current[0]
  );

  const transitionStart = useCallback(
    (end: number) => {
      state.current = {
        current: end,
        next: state.current.current,
      };

      const yAxisMeta = yAxisRef.current?.[end];
      setYAxis(yAxisMeta);

      transition.current = 0;
      runTiming(transition, 1, {
        duration: 750,
        easing: Easing.inOut(Easing.cubic),
      });
    },
    [state, transition]
  );

  const path = useComputedValue(() => {
    if (weather.length < 2) {
      return graphData.current[state.current.current].curve || "0";
    }

    const start = graphData.current[state.current.current].curve;
    const end = graphData.current[state.current.next].curve;

    if (!start || !end) {
      return "0";
    }

    const result = start.interpolate(end, transition.current);

    if (!result) {
      return "0";
    }

    return result.toSVGString();
  }, [state, transition]);

  const fontSize = 16;
  const font = useFont(DMSansRegular, fontSize);

  useEffect(() => {
    const previousGraphData = graphData.current;

    if (graphData.current.length < weather.length) {
      const newMaps = makeGraph(getWeatherGraphData(weather[currentIndex]));
      graphData.current = [...previousGraphData, newMaps];
    }

    let targetIndex =
      swipeDirection === "left"
        ? previousGraphData.length + 1
        : previousGraphData.length - 1;
    if (targetIndex < 0) {
      targetIndex = 0;
    }

    if (targetIndex > currentIndex) {
      targetIndex = currentIndex;
    }

    transitionStart(targetIndex);
  }, [
    currentIndex,
    getWeatherGraphData,
    makeGraph,
    swipeDirection,
    transitionStart,
    weather,
  ]);

  if (!graphData.current.length || !font || !yAxis || !xAxisRef.current) {
    return null;
  }

  return (
    <>
      <View style={styles.root}>
        <DefaultText>Helsinki</DefaultText>
        <Canvas
          style={{
            width: graphWidth,
            height: graphHeight,
          }}
        >
          <Path style="stroke" path={path} strokeWidth={4} color="#6231ff" />
          {yAxis.yAxisPosition.map((yPosition: number, index: number) => (
            <Group key={index}>
              <Line
                p1={vec(margin.left, yPosition)}
                p2={vec(graphWidth - margin.right, yPosition)}
                color="lightgrey"
                style="stroke"
                strokeWidth={1}
                opacity={transition}
              />
              <Text
                text={yAxis.yAxisText[index].toString()}
                font={font}
                y={yPosition + fontSize * 0.4}
                opacity={transition}
              />
            </Group>
          ))}
          {xAxisRef.current.xAxisText.map((text: number, index: number) => {
            const xPosition = xAxisRef.current
              ? xAxisRef.current.yAxisPositionUnit * index + margin.left
              : 0;

            if (index % 6 !== 0) {
              return null;
            }
            return (
              <Group key={index}>
                <Line
                  p1={vec(xPosition, margin.top)}
                  p2={vec(xPosition, graphHeight - margin.bottom)}
                  color="lightgrey"
                  style="stroke"
                  strokeWidth={1}
                  opacity={transition}
                />
                <Text
                  text={text.toString()}
                  font={font}
                  x={xPosition}
                  y={graphHeight}
                  opacity={transition}
                />
              </Group>
            );
          })}
        </Canvas>
      </View>
      <Button
        onPress={() => {
          transitionStart(1);
        }}
        title="next"
      />
      <Button
        onPress={() => {
          transitionStart(0);
        }}
        title="prev"
      />
    </>
  );
};
