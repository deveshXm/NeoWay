import React from "react";
import { StyleSheet, Text, View } from "react-native";
import color from "../../util/color";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={{color: "black"}}>HomeScreen</Text>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.backgroundPrimary,
  },
});
