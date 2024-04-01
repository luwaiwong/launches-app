import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { SpaceGrotesk_500Medium } from "@expo-google-fonts/space-grotesk";

import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";

import TestLaunchData from "./components/pages/TestLaunchData";
import Dashboard from "./components/pages/Dashboard";
import Loading from "./components/pages/Loading";

import UserData from "./components/data/UserData";

import * as colors from "./components/styles";

export default function App() {
  let userData = new UserData();
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_500Medium,
  });
  if (!fontsLoaded) {
    return <Loading />;
  }
  return (
    <View style={styles.container}>
      <Dashboard data={userData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.BACKGROUND,
    width: "100%",
    height: "100%",
  },
});
