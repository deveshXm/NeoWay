import { StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

const ChatLoadingScreen = () => {
  useEffect(() => {
    setTimeout(() => {
      useNavigation().navigate("Itenary");
    }, 5000);
  }, []);
  return (
    <View>
      <Text>ChatLoadingScreen</Text>
    </View>
  );
};

export default ChatLoadingScreen;

const styles = StyleSheet.create({});
