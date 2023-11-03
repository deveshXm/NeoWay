import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import OverviewScreen from "../screen/Itenary/OverviewScreen";
import TransportScreen from "../screen/Itenary/TransportScreen";
import SpendScreen from "../screen/Itenary/SpendScreen";

const Tab = createMaterialTopTabNavigator();

const Screens = {
  OverView: OverviewScreen,
  Transport: TransportScreen,
  "Spend Analysis": SpendScreen,
};

function ItenaryNavigation() {
  return (
    <Tab.Navigator>
      {Object.entries(Screens).map(([name, component], index) => (
        <Tab.Screen key={index} name={name} component={component} />
      ))}
    </Tab.Navigator>
  );
}

export default ItenaryNavigation;
