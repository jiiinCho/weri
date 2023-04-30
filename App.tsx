import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { weatherContext } from "@src/models";
import { StatusBar } from "expo-status-bar";

import { Weather } from "./src/components";

const { RealmProvider } = weatherContext;

const App = () => {
  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="auto" />
      <Weather />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
