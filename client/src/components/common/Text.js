import * as ReactNative from "react-native";
import React from "react";
import common from "../../../util/common";

const Text = (props) => {
  return (
    <ReactNative.Text style={[styles.text, props.style]}>
      {props.children}
    </ReactNative.Text>
  );
};

export default Text;

const styles = ReactNative.StyleSheet.create({
  text: {
    margin: 0,
    padding: 0,
    fontFamily: common.text.secondaryFontFamily,
    color: common.color.textPrimary,
    fontSize: common.sizes.m,
  },
});
