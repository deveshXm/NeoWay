import React from "react";
import { StyleSheet, View } from "react-native";

import common from "../../util/common";
import Text from "../components/common/Text";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const navigation = useNavigation();
  const handleSearch = () => {
    navigation.navigate("Selected Itenaries");
  };
  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Text style={styles.heading}>Enter Details</Text>
        <View style={styles.input}>
          <Text style={styles.subHeading}>Enter city of departure</Text>
          <Input placeholder="Enter location" />
        </View>
        <View style={styles.input}>
          <Text style={styles.subHeading}>Your goals for the trip</Text>
          <Input placeholder="Have fun with the family" />
        </View>
        <View style={styles.input}>
          <Text style={styles.subHeading}>Enter City</Text>
          <Input placeholder="New Delhi" />
        </View>
        <Text style={{ ...styles.subHeading, textAlign: "center" }}>Or</Text>
        <View style={styles.input}>
          <Text style={styles.subHeading}>Let us Choose</Text>
          <Input placeholder="Choose" />
        </View>
        <Button title="Search" onPress={handleSearch} />
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
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
