import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screen/HomeScreen";
import LandingScreen from "../screen/LandingScreen";
import ItenaryScreen from "../screen/Itenary/ItenaryScreen";

const Stack = createStackNavigator();

function StackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Get Started" component={LandingScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Selected Itenaries" component={ItenaryScreen} />
    </Stack.Navigator>
  );
}

export default StackNavigator;
