import React, { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";

import common from "../../../util/common";
import Text from "../../components/common/Text";
import ItenaryNavigation from "../../navigation/ItenaryNavigation";
import { useNavigation } from "@react-navigation/native";
import ItenaryLoadingScreen from "../loading/ItenaryLoadingScreen";
import { TouchableHighlight } from "react-native-gesture-handler";

const ItenaryScreen = () => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const handleChat = () => {
    navigation.navigate("Chat");
  };

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
      <View style={styles.bot}>
        <TouchableHighlight
          underlayColor="transparent" // No color is shown under the component when pressed
          activeOpacity={1}
          onPress={handleChat}
          style={styles.button}
        >
          <Image source={require("../../../assets/bot.png")} />
        </TouchableHighlight>
      </View>
      <ItenaryNavigation />
    </View>
  );
};

export default ItenaryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    width: Dimensions.width,
    backgroundColor: common.color.backgroundPrimary,
    marginHorizontal: 0,
  },
  subHeading: {
    marginLeft: common.sizes.l,
    textAlign: "flex-start",
    fontSize: common.sizes.ml,
    color: common.color.subHeading,
    fontFamily: common.text.poppinsSemiBold,
  },
  subHeading1: {
    marginLeft: common.sizes.l,
    fontSize: common.sizes.ms,
    color: common.color.subHeading,
    fontFamily: common.text.poppinsMedium,
    marginTop: -5,
  },
  bot: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  button: {
    borderRadius: 100,
    borderColor: "black",
    borderWidth: StyleSheet.hairlineWidth,
    width: 60,
    height: 60,
  },
});
