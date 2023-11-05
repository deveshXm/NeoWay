import { ScrollView, Dimensions, StyleSheet, View, Image } from "react-native";
import React, { useState } from "react";
import common from "../../../util/common";
import cardImage from "../../../assets/Card.png";
import ExpenseTable from "../../components/Table";
import Text from "../../components/common/Text";
import { useItenaryContext } from "../../context/ItenaryContext";

const SpendScreen = () => {
  const { state, addItenary } = useItenaryContext();
  const [total, setTotal] = useState(10000);
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.subHeading}>Spend</Text>
      <View style={styles.imageContainer}>
        <View style={styles.subImageContainer}>
          <Text style={styles.subHeading}>Total Balance</Text>
          <Text>${total}</Text>
        </View>
        <Image source={cardImage} style={styles.image} />
      </View>
      <View style={styles.tableContainer}>
        <View style={styles.container2}>
          <Text style={styles.subHeading3}>Category</Text>
          <Text style={styles.subHeading3}>Expected Price</Text>
        </View>
        <ExpenseTable />
      </View>
    </ScrollView>
  );
};

export default SpendScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: common.sizes.s,
    width: Dimensions.width,
    backgroundColor: common.color.chatLoading,
    paddingHorizontal: common.sizes.ml,
  },
  container2: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  tableContainer: {
    flex: 1,
    borderRadius: common.sizes.l,
    backgroundColor: common.color.backgroundPrimary,
    padding: 10,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: 200,
  },
  subHeading: {
    fontSize: common.sizes.m,
    color: common.color.subHeading,
    fontFamily: common.text.poppinsSemiBold,
  },
  subHeading1: {
    fontSize: common.sizes.ms,
    color: common.color.subHeading,
    fontFamily: common.text.poppinsMedium,
  },
  subHeading3: {
    fontSize: common.sizes.ms,
    color: common.color.subHeading2,
    fontFamily: common.text.poppinsSemiBold,
  },
  subImageContainer: {
    position: "absolute",
    backgroundColor: "white",
    padding: common.sizes.l,
    width: "90%",
    height: "70%",
    zIndex: 10,
  },
  image: {
    width: "100%",
    height: "90%",
    objectFit: "fill",
  },
});
