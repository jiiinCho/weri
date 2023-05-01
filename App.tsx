import { useCallback } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { COLORS } from "@src/consts";
import { weatherContext } from "@src/models";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import { Weather } from "./src/components";

import "react-native-gesture-handler";

const { RealmProvider } = weatherContext;

const App = () => {
  const [fontsLoaded] = useFonts({
    DMBold: require("./assets/fonts/DMSans-Bold.ttf"),
    DMMedium: require("./assets/fonts/DMSans-Medium.ttf"),
    DMRegular: require("./assets/fonts/DMSans-Regular.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.root} onLayout={onLayoutRootView}>
      <StatusBar style="auto" />
      <Weather />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default () => {
  return (
    <RealmProvider>
      <App />
    </RealmProvider>
  );
};
