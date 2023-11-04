import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import OverviewScreen from "../screen/Itenary/OverviewScreen";
import TransportScreen from "../screen/Itenary/TransportScreen";
import SpendScreen from "../screen/Itenary/SpendScreen";
import common from "../../util/common";

const Tab = createMaterialTopTabNavigator();

const Screens = {
  OverView: {
    screen: OverviewScreen,
    options: {
      tabBarLabel: "Overview",
    },
  },
  Transport: {
    screen: TransportScreen,
    options: {
      topBarLabel: "Transport",
    },
  },
  Spend: {
    screen: SpendScreen,
    options: {
      title: "Spend Analysis",
    },
  },
};

function ItenaryNavigation() {
  return (
    <Tab.Navigator
      screenOptions={{
        activeTintColor: common.color.navigatorPrimary,
        inactiveTintColor: common.color.navigatorPrimary,
        tabBarItemStyle: {
          padding: 0,
        },
        tabBarLabelStyle: {
          textAlign: "left",
          fontSize: common.sizes.s,
          fontFamily: common.text.secondaryFontFamily,
          textTransform: "none",
        },
        tabBarIndicatorStyle: {
          backgroundColor: common.color.indicatorPrimary,
        },
        tabBarPressColor: "transparent",
      }}
    >
      {Object.entries(Screens).map(([name, component], index) => (
        <Tab.Screen
          key={index}
          name={name}
          component={component.screen}
          options={component.options}
        />
      ))}
    </Tab.Navigator>
  );
}

export default ItenaryNavigation;
