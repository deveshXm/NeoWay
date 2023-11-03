import React from "react";

import * as ReactNative from "react-native";
import common from "../../../util/common";

const Input = (props) => {
  return (
    <ReactNative.TextInput
      style={[styles.input, props.style]}
      placeholder={props.placeholder}
    />
  );
};

export default Input;

const styles = ReactNative.StyleSheet.create({
  input: {
    borderWidth: 1,
    paddingVertical: common.sizes.xs,
    paddingHorizontal: common.sizes.s,
    borderRadius: common.sizes.xs,
    borderColor: common.color.textPrimary,
    alignSelf: "stretch",
  },
});
