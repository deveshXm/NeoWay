import React from "react";
import { StyleSheet, View } from "react-native";

import common from "../../util/common";
import Text from "../components/common/Text";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useNavigation } from "@react-navigation/native";

const ItenaryScreen = () => {
  const navigation = useNavigation();
  const handleSearch = () => {
    navigation.navigate("Selected Itenaries");
  };
  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Text style={styles.heading}>Enter Details</Text>
      </View>
    </View>
  );
};

export default ItenaryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: common.color.backgroundPrimary,
  },
  subContainer: {
    gap: common.sizes.m,
    paddingHorizontal: common.sizes.l,
    width: "100%",
  },
  heading: {
    textAlign: "center",
  },
  subHeading: {
    textAlign: "flex-start",
    fontSize: common.sizes.s,
  },
  input: {
    alignSelf: "stretch",
  },
});
