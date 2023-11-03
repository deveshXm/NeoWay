import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import common from "../../../util/common";
import Text from "../../components/common/Text";
import ItenaryNavigation from "../../navigation/ItenaryNavigation";

const ItenaryScreen = () => {
  const navigation = useNavigation();
  const handleSearch = () => {
    navigation.navigate("Selected Itenaries");
  };
  return (
    <View style={styles.container}>
      <ItenaryNavigation />
    </View>
  );
};

export default ItenaryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.width,
    backgroundColor: common.color.backgroundPrimary,
    marginHorizontal: 0,
  },
});
