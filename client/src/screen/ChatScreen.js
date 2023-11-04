import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, View } from "react-native";

import common from "../../util/common";
import ChatLoadingScreen from "./loading/ChatLoadingScreen";
import VoiceModal from "../components/VoiceModal";
import Text from "../components/common/Text";

// [
//   {
//     user: "currentUser",
//     text: "hi",
//   },
// ];

// {
//   botMessage : {
//     content : text,
//     role : assistant | user
//   },
//   newState : {}
// }

// {
//   messages : [
//     {
//       botMessage : {
//         content : text,
//         role : assistant | user
//       },
//     },
//   ],
//   state : {}
// }

const ChatScreen = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    (async () => {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          setLoading(false);
          resolve();
        }, 2000);
      });
    })();
  }, []);

  return loading ? (
    <ChatLoadingScreen />
  ) : (
    <View style={styles.container}>
      <FlatList
        style={{
          paddingHorizontal: common.sizes.m,
        }}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={
              item.role === "user" ? styles.userMessage : styles.botMessage
            }
          >
            {item.role !== "user" ? (
              <Image
                source={require("../../assets/mascot.png")}
                style={styles.image}
              />
            ) : null}
            <View
              style={
                item.role === "user"
                  ? styles.subUserMessage
                  : styles.subBotMessage
              }
            >
              <Text style={styles.messageText}>{item.content}</Text>
            </View>
            {item.role === "user" ? (
              <Image
                source={require("../../assets/bot.png")}
                style={styles.image}
              />
            ) : null}
          </View>
        )}
      />
      <VoiceModal
        messages={messages}
        setMessages={setMessages}
      />
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: common.color.backgroundPrimary,
  },
  messageText: {
    fontSize: common.sizes.ms,
    color: "white",
    flexWrap: "wrap", // Ensure text wraps to the next line if it's too long
  },
  subUserMessage: {
    padding: common.sizes.ms,
    borderRadius: common.sizes.l,
    marginVertical: common.sizes.xs,
    backgroundColor: common.color.buttonPrimary,
    flexShrink: 1, // Allow the container to shrink to fit the text if needed
  },
  subBotMessage: {
    backgroundColor: common.color.botPrimary,
    padding: common.sizes.ms,
    borderRadius: common.sizes.l,
    marginVertical: common.sizes.xs,
    flexShrink: 1, // Same as above
  },
  userMessage: {
    flexDirection: "row",
    alignSelf: "flex-end",
    marginTop: common.sizes.m,
  },
  botMessage: {
    flexDirection: "row",
    alignSelf: "flex-start",
    marginTop: common.sizes.m,
  },
  image: {
    borderRadius: 100,
    borderColor: "light-gray",
    borderWidth: 1,
  },
});
