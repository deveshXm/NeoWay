import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import common from "../../../util/common";

const TravelCard = ({
  transportName,
  transportLogo,
  departureTime,
  duration,
  arrivalTime,
  boardingPoint,
  destinationAddress,
  discountCode,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainerParent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: transportLogo }} style={styles.logo} />
        </View>
        <Text style={styles.transportName}>{transportName}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.timeContainer}>
          <Text style={styles.travelTime}>
            {boardingPoint} {departureTime}
          </Text>
          <Text style={styles.travelTime}> {duration}</Text>
          <Text style={styles.travelTime}>
            {destinationAddress} {arrivalTime}
          </Text>
        </View>
        <Text style={styles.travelDiscount}>
          Use Code : NeoWay60 and get 60% instant cashback
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: common.color.travelCardBackground,
    borderRadius: common.sizes.xs,
    margin: common.sizes.xs,
    padding: common.sizes.xs,
    flexDirection: "column",
    borderBlockColor: common.color.travelCardBorder,
  },
  imageContainerParent: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: common.sizes.l,
    height: common.sizes.l,
    backgroundColor: common.color.backgroundPrimary,
    borderRadius: 100,
    marginRight: common.sizes.xs,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  details: {
    flex: 1,
    marginTop: common.sizes.xs,
    fontFamily: common.text.poppinsMedium,
    flexDirection: "column",
  },
  transportName: {
    fontSize: common.sizes.ms,
    fontFamily: common.text.poppinsMedium,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  travelTime: {
    fontSize: common.sizes.s,
    fontFamily: common.text.poppinsMedium,
  },
  travelDiscount: {
    fontSize: common.sizes.xs,
    fontFamily: common.text.poppinsMedium,
    color: common.color.travelCardDiscount,
    textAlign: "center",
  },
});

export default TravelCard;
