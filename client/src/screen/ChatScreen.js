import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";

import common from "../../util/common";
import ChatLoadingScreen from "./loading/ChatLoadingScreen";
import Button from "../components/common/Button";
import { useNavigation } from "@react-navigation/native";
import useVoiceToText from "../../util/hooks/useVoiceToText";

const ChatScreen = () => {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState([]);
  const { recording, recognizing, recordedText, startSpeechToText } =
    useVoiceToText();

  useEffect(() => {
    if (recognizing === false) {
      const text = recordedText.join(" ");
      const message = { text, user: "currentUser" };
      setMessages([...messages, message]);
    }
  }, [recognizing]);

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
              item.user === "currentUser"
                ? styles.userMessage
                : styles.otherUserMessage
            }
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <Button
          title="Start Speech to Text"
          onPressIn={startSpeechToText}
          // onPressOut={stopSpeechToText}
        />
        {recordedText.map((result, index) => (
          <Text key={index}>{result}</Text>
        ))}
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
