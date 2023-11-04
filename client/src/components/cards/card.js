import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import common from "../../../util/common";
import LinearGradient from "react-native-linear-gradient";

const Card = ({ imageSource, title, description }) => {
  return (
    <View style={styles.card}>
      <Image source={imageSource} style={styles.image} />
      {/* <View style={styles.parentDiv}> */}
        <View style={styles.overlay}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      {/* </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 150,
    height: 150,
    borderRadius: 10,
    overflow: "hidden",
  },
  parentDiv:{
    overflow: "hidden",
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
    objectFit: "fill",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 130, 139, 0.5)",
    // padding: 10,
    justifyContent: "center",
    alignItems: "center",
    top: "50%",
    height: "30%",
  },
  title: {
    fontSize: common.sizes.mxs,
    fontWeight: "bold",
    color: "white",
  },
  description: {
    fontSize: common.sizes.xs,
    color: "white",
  },
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5,
  },
});

export default Card;
