import React from "react";

import Text from "./Text";
import common from "../../../util/common";
import * as Elements from "@rneui/themed";
import { Image, StyleSheet } from "react-native";

const Button = ({ title, onPress, style }) => {
  return (
    <Elements.Button
      radius={"lg"}
      type="solid"
      color={common.color.buttonPrimary}
      buttonStyle={{
        alignSelf: "center",
        gap: common.sizes.m,
        paddingHorizontal: common.sizes.l,
      }}
    >
      {title}
      <Image source={require("../../../assets/arrow.png")} />
    </Elements.Button>
  );
};

const styles = StyleSheet.create({});

export default Button;
