import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./src/navigation/StackNavigator";
import Context from "./src/context/context";

export default function App() {
  return (
    <Context.Provider>
      <View style={styles.container}>
        <NavigationContainer>
          <SafeAreaView>
            <StatusBar backgroundColor="#1F1F1F" style="light" />
            <StackNavigator />
          </SafeAreaView>
        </NavigationContainer>
      </View>
    </Context.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F1F1F",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
});
