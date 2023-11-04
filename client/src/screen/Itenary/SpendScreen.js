import {
  ScrollView,
  Dimensions,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import React from "react";
import common from "../../../util/common";
import cardImage from "../../../assets/Card.png";
import ExpenseTable from "../../components/Table";

const SpendScreen = () => {
  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.subHeading}>Spend</Text>
        <Text style={styles.subHeading1}>Total Budget: 20+</Text>
        <View style={styles.imageContainer}>
          <Image source={cardImage} style={styles.image} />
          {/* <Text style={styles.subHeading1}>Total Budget: 20+</Text> */}
        </View>
        <View style={styles.container2}>
          <Text style={styles.subHeading3}>Category</Text>
          <Text style={styles.subHeading3}>Expected Price</Text>
        </View>
        <View style={styles.tableContainer}>
          <Text style={styles.subHeading3}>
          </Text>
          <ExpenseTable />
        </View>
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
    backgroundColor: common.color.backgroundPrimary,
    marginHorizontal: 0,
  },
  container2: {
    flex: 1,
    paddingTop: 20,
    width: Dimensions.width,
    backgroundColor: common.color.backgroundPrimary,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 30,
  },
  tableContainer: {
    flex: 1,
    paddingTop: 20,
    width: Dimensions.width,
    flexDirection: "row",
    marginHorizontal: 30,
  },
  imageContainer: {
    paddingTop: 20,
    width: Dimensions.width,
    backgroundColor: common.color.backgroundPrimary,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    height: 200,
  },
  subHeading: {
    fontSize: common.sizes.m,
    marginLeft: common.sizes.l,
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
  subHeading3: {
    fontSize: common.sizes.ms,
    color: common.color.subHeading2,
    fontFamily: common.text.poppinsSemiBold,
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
    objectFit: "fill",
  },
});
