import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";

import common from "../../util/common";
import ChatLoadingScreen from "./loading/ChatLoadingScreen";
import Button from "../components/common/Button";
import { useNavigation } from "@react-navigation/native";

const ChatScreen = () => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const currentUser = "You";
  const otherUser = "Friend";

  const sendMessage = () => {
    if (newMessage.trim() !== "") {
      const message = { text: newMessage, user: currentUser };
      setMessages([...messages, message]);
      setNewMessage("");

      // Simulate a reply from the other user after a delay
      setTimeout(() => {
        const reply = { text: "Hi there!", user: otherUser };
        setMessages([...messages, reply]);
      }, 1000); // Simulate a one-second delay for the reply
    }
  };

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
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={
              item.user === currentUser
                ? styles.userMessage
                : styles.otherUserMessage
            }
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={(text) => setNewMessage(text)}
          placeholder="Type your message..."
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007BFF",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  otherUserMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    color: "white",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginRight: 8,
    padding: 8,
  },
});
