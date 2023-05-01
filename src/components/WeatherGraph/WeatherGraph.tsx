import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Text as DefaultText, View } from "react-native";
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
import {
  COLORS,
  DIMENSIONS,
  FONT_SIZES,
  WeatherForecast,
  WeatherInfo,
} from "@src/consts";
import { getWeatherInfo } from "@src/utils";
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
  const graphHeight = height * 0.6 - DIMENSIONS.paginatorHeight;
  const graphWidth = width;
  const temperatureUnit = useValue(weather[0].temperatureUnit);

  const margin = {
    left: 30,
    right: 30,
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

  const fontSize = FONT_SIZES.md;
  const font = useFont(DMSansRegular, fontSize);

  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo[]>(
    getWeatherInfo(weather)
  );

  const translateY = useRef(new Animated.Value(25)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const previousGraphData = graphData.current;

    if (graphData.current.length < weather.length) {
      const newWeather = weather[currentIndex];
      const newWeatherInfo = getWeatherInfo([newWeather]);
      setWeatherInfo((previousWeatherInfo: WeatherInfo[]) => [
        ...previousWeatherInfo,
        ...newWeatherInfo,
      ]);

      const newMaps = makeGraph(getWeatherGraphData(newWeather));
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

    translateY.setValue(25);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 350,
      easing: Easing.cubic,
      useNativeDriver: true,
    }).start();

    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 350,
      easing: Easing.cubic,
      useNativeDriver: true,
    }).start();
  }, [
    currentIndex,
    getWeatherGraphData,
    makeGraph,
    opacity,
    swipeDirection,
    transitionStart,
    translateY,
    weather,
  ]);

  if (!graphData.current.length || !font || !yAxis || !xAxisRef.current) {
    return null;
  }

  return (
    <View style={styles.root}>
      <Animated.View
        style={[
          styles.currentTemperatureContainer,
          {
            opacity,
            width,
            paddingLeft: margin.left,
            paddingRight: margin.right,
            transform: [{ translateY }],
          },
        ]}
      >
        <DefaultText style={styles.currentTemperature}>
          {weatherInfo[currentIndex].currentTemperature}
        </DefaultText>
        <DefaultText style={styles.temperatureUnit}>
          {temperatureUnit.current}
        </DefaultText>
      </Animated.View>
      <Animated.View
        style={{
          opacity,
          width,
          paddingLeft: margin.left,
          paddingRight: margin.right,
          transform: [{ translateY }],
        }}
      >
        <View style={styles.temperatureInfo}>
          <DefaultText style={styles.title}>
            {weatherInfo[currentIndex].name}
          </DefaultText>
          <View style={styles.minMaxTemperatureContainer}>
            <DefaultText style={styles.minMaxTemperature}>
              {`H: ${weatherInfo[currentIndex].highestTemperature}${temperatureUnit.current}`}
            </DefaultText>
            <DefaultText
              style={[styles.minMaxTemperature, styles.spacing]}
            >{`L: ${weatherInfo[currentIndex].lowestTemperature}${temperatureUnit.current}`}</DefaultText>
          </View>
        </View>
      </Animated.View>
      <Canvas
        style={{
          width: graphWidth,
          height: graphHeight,
        }}
      >
        <Path
          style="stroke"
          path={path}
          strokeWidth={4}
          color={COLORS.primary}
        />
        {yAxis.yAxisPosition.map((yPosition: number, index: number) => (
          <Group key={index}>
            <Line
              p1={vec(margin.left, yPosition)}
              p2={vec(graphWidth - margin.right, yPosition)}
              color={COLORS.lightGrey}
              style="stroke"
              strokeWidth={0.5}
              opacity={transition}
            />
            <Text
              text={
                index === yAxis.yAxisPosition.length - 1
                  ? temperatureUnit.current
                  : yAxis.yAxisText[index].toString()
              }
              font={font}
              color={COLORS.grey}
              x={graphWidth - margin.right + 2}
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
                color={COLORS.lightGrey}
                style="stroke"
                strokeWidth={0.75}
                opacity={transition}
              />
              <Text
                text={text < 9 ? `0${text.toString()}` : text.toString()}
                font={font}
                color={COLORS.grey}
                x={xPosition}
                y={graphHeight}
                opacity={transition}
              />
            </Group>
          );
        })}
      </Canvas>
    </View>
  );
};
