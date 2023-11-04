import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";

const ChatScreen = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      Promise.resolve((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, 5000);
      });
    })();
    setLoading(false);
  }, []);
  return (
    <View>
      <Text>ChatScreen</Text>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({});
