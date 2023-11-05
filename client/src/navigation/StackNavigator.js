import React from "react";

import { createStackNavigator } from "@react-navigation/stack";
import { CardStyleInterpolators } from "@react-navigation/stack";

import ChatScreen from "../screen/ChatScreen";
import LandingScreen from "../screen/LandingScreen";
import ItenaryScreen from "../screen/Itenary/ItenaryScreen";
import ChatLoadingScreen from "../screen/loading/ChatLoadingScreen";

import common from "../../util/common";

const Stack = createStackNavigator();

const Screens = {
  Landing: {
    screen: LandingScreen,
    options: {
      title: "",
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      headerLeft: () => null,
    },
  },
  ChatLoading: {
    screen: ChatLoadingScreen,
    options: {
      title: "",
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      headerLeft: () => null,
    },
  },
  Chat: {
    screen: ChatScreen,
    options: {
      title: "",
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      headerLeft: () => null,
    },
  },
  Itenary: {
    screen: ItenaryScreen,
    options: {
      title: "Selected Itenaries",
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      headerLeft: () => null,
      headerTitleContainerStyle: {
        marginLeft: common.sizes.l,
      },
    },
  },
};

function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {Object.entries(Screens).map(([name, component], index) => (
        <Stack.Screen
          key={index}
          name={name}
          component={component.screen}
          options={component.options}
        />
      ))}
    </Stack.Navigator>
  );
}

export default StackNavigator;
