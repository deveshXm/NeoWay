import { Image, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import common from "../../../util/common";

const ChatLoadingScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={common.color.chatLoading} style="dark" />
      <Image source={require("../../../assets/pumba.png")}  />
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
  },
});
