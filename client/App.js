import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import Context from "./src/context/context";
import color from "./util/color";

export default function App() {
  return (
    <Context.Provider value={{}}>
      <NavigationContainer>
        <SafeAreaView>
          <StatusBar backgroundColor={color.backgroundPrimary} style="dark" />
          <View style={styles.container}>
            <StackNavigator />
          </View>
        </SafeAreaView>
      </NavigationContainer>
    </Context.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
