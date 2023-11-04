import { StyleSheet, Text, View } from "react-native";
import React from "react";
import common from "../../../util/common";

const ItenaryLoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Planning </Text>
      <Text style={styles.heading}>for you ...</Text>
    </View>
  );
};

export default ItenaryLoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: common.color.buttonPrimary,
    height: "100%",
    paddingHorizontal: common.sizes.xl,
  },
  heading: {
    fontSize: common.sizes.xl,
    fontFamily:common.text.poppinsExtraBold,
    color:common.color.backgroundPrimary,
    margin:-20
  }
});
