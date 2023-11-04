import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";

import common from "../../../util/common";
import Text from "../../components/common/Text";
import ItenaryNavigation from "../../navigation/ItenaryNavigation";
import { useNavigation } from "@react-navigation/native";
import ItenaryLoadingScreen from "../loading/ItenaryLoadingScreen";

const ItenaryScreen = () => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          setLoading(false);
          resolve();  
        }, 2000);
      });
    })();
  }, []);

  return loading ? (
    <ItenaryLoadingScreen />
  ) : (
    <View style={styles.container}>
      <Text style={styles.subHeading}>Selected Itenaries</Text>
      <Text style={styles.subHeading1}>Total Results: 20+</Text>
      <ItenaryNavigation />
    </View>
  );
};

export default ItenaryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:20,
    width: Dimensions.width,
    backgroundColor: common.color.backgroundPrimary,
    marginHorizontal: 0,
  },
  subHeading: {
    marginLeft: common.sizes.l,
    textAlign: "flex-start",
    fontSize: common.sizes.ml,
    color:common.color.subHeading,
    fontFamily: common.text.poppinsSemiBold,
  },
  subHeading1: {
    marginLeft: common.sizes.l,
    fontSize: common.sizes.ms,
    color:common.color.subHeading,
    fontFamily: common.text.poppinsMedium,
    marginTop:-5,
  },
});
