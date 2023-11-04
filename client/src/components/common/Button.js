import React from "react";

import Text from "./Text";
import common from "../../../util/common";
import * as Elements from "@rneui/themed";
import { Image, StyleSheet } from "react-native";

const Button = (props) => {
  return (
    <Elements.Button
      radius={"lg"}
      type="solid"
      color={common.color.buttonPrimary}
      onPress={props.onPress}
      onPressIn={props.onPressIn}
      onPressOut={props.onPressOut}
      buttonStyle={{
        alignSelf: "center",
        gap: common.sizes.m,
        paddingHorizontal: common.sizes.l,
        ...props.style,
      }}
    >
      {props.title}
      <Image source={require("../../../assets/arrow.png")} />
    </Elements.Button>
  );
};

const styles = StyleSheet.create({});

export default Button;
