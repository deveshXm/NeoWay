import "react-native-gesture-handler";

import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import Context from "./src/context/context";
import color from "./util/color";

export default function App() {
  return (
    <NavigationContainer>
      <Context.Provider value={{}}>
        <SafeAreaView style={styles.container}>
          <StatusBar backgroundColor={color.backgroundPrimary} style="dark" />
          <StackNavigator />
        </SafeAreaView>
      </Context.Provider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
