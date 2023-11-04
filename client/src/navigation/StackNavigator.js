import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screen/HomeScreen";
import LandingScreen from "../screen/LandingScreen";
import ItenaryScreen from "../screen/Itenary/ItenaryScreen";
import { CardStyleInterpolators } from "@react-navigation/stack";
import Text from "../components/common/Text";
import common from "../../util/common";
import ChatScreen from "../screen/ChatScreen";

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
  Home: {
    screen: HomeScreen,
    options: {
      title: "",
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      headerLeft: () => null,
    },
  },
};

function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{}}>
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
