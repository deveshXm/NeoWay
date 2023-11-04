import { ScrollView, Dimensions, StyleSheet, Text, View } from "react-native";
import React from "react";
import common from "../../../util/common";
import TravelCard from "../../components/cards/travelCard";

import travelData from "../../../util/data/travel.json";

const TransportScreen = () => {
  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.subHeading}>Transport</Text>
        <Text style={styles.subHeading1}>Total Results: 20+</Text>
        <View style={styles.container2}>
          {travelData.map((data, index) => (
            <TravelCard
              key={index}
              transportName={data.transportName}
              transportLogo={data.transportLogo}
              departureTime={data.departureTime}
              duration={data.duration}
              arrivalTime={data.arrivalTime}
              boardingPoint={data.boardingPoint}
              destinationAddress={data.destinationAddress}
              discountCode={data.discountCode}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default TransportScreen;

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
    marginHorizontal: 10,
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
});
