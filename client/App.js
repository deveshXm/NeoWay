import "react-native-gesture-handler";

import { useCallback } from "react";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";

import common from "./util/common";
import Context from "./src/context/context";
import StackNavigator from "./src/navigation/StackNavigator";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    TechnaSans: require("./assets/fonts/TechnaSans-Regular.otf"),
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
    <NavigationContainer>
      <Context.Provider value={{}}>
        <SafeAreaView style={styles.container}>
          <View style={styles.container} onLayout={onLayoutRootView}>
            <StatusBar
              backgroundColor={common.color.backgroundPrimary}
              style="dark"
            />
            <StackNavigator />
          </View>
        </SafeAreaView>
      </Context.Provider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
});
