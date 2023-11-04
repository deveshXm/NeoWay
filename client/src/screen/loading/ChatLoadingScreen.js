import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Image, StyleSheet, View } from "react-native";

import common from "../../../util/common";
import Text from "../../components/common/Text";

const ChatLoadingScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={common.color.chatLoading} style="dark" />
      <Image
        source={require("../../../assets/pumba.png")}
        style={styles.image}
      />
      <View style={styles.subContainer}>
        <View>
          <Text style={styles.heading}>Meet your</Text>
          <Text style={styles.heading}>Personal Neoway</Text>
          <Text style={styles.heading}>AI</Text>
        </View>
        <View>
          <Text style={styles.subHeading1}>hakuna matata</Text>
          <Text style={styles.subHeading2}>Hi 👋!! I am Pumbaa</Text>
        </View>
      </View>
    </View>
  );
};

export default ChatLoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: common.color.chatLoading,
    paddingHorizontal: common.sizes.l,
  },
  subContainer: {
    flex: 1,
    marginTop: common.sizes.xl,
    marginBottom: 150,
    justifyContent: "space-between",
    alignItems: "center",
  },
  heading: {
    color: "#002586",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: common.sizes.l,
  },
  subHeading1: {
    color: "#002586",
    fontWeight: 400,
    textAlign: "center",
    fontSize: common.sizes.m,
  },
  subHeading2: {
    color: "#002586",
    textAlign: "center",
  },
  image: {
    position: "absolute",
  },
});
