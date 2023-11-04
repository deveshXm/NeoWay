import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

import common from "../../../util/common";
import Text from "../../components/common/Text";
import ItenaryNavigation from "../../navigation/ItenaryNavigation";

const ItenaryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.subHeading}>Total Itenary Price: $1500</Text>
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
  subHeading: {
    marginLeft: common.sizes.l,
    textAlign: "flex-start",
    fontSize: common.sizes.sm,
  },
});
