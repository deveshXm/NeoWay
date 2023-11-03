import React from "react";
import { Image, StyleSheet, Touchable, View } from "react-native";

import common from "../../util/common";
import Text from "../components/common/Text";
import Button from "../components/common/Button";
import { useNavigation } from "@react-navigation/native";

const LandingScreen = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/home_icon.png")} />
      <View style={styles.subContainer}>
        <Text style={styles.heading}>
          Discover a Hotel & Resort to Book a Suitable Room
        </Text>
        <Text style={styles.subHeading}>
          The hotel and resort business is one of the best and loyal business in
          the global market. We are the agency that helps to book you a good
          room in a suitable palace at a reasonable price.
        </Text>
        <Button title="Get Started" onPress={handleGetStarted} />
      </View>
    </View>
  );
};

export default LandingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: common.color.backgroundPrimary,
  },
  subContainer: {
    marginTop: common.sizes.l,
    gap: common.sizes.m,
  },
  heading: {
    textAlign: "center",
  },
  subHeading: {
    textAlign: "center",
    fontSize: common.sizes.s,
  },
});
