import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import common from "../../util/common";
import ChatLoadingScreen from "./loading/ChatLoadingScreen";

const ChatScreen = () => {
  const [loading, setLoading] = useState(true);

  //   useEffect(() => {
  //     (async () => {
  //       Promise.resolve((resolve, reject) => {
  //         setLoading(false);
  //         resolve();
  //       });
  //     })();
  //     setLoading(false);
  //   }, []);
  return loading ? (
    <ChatLoadingScreen />
  ) : (
    <View style={styles.container}>
      <Text>ChatScreen</Text>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: common.sizes.m,
    backgroundColor: common.color.backgroundPrimary,
  },
});
