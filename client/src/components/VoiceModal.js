import React, { useEffect, useRef, useState } from "react";
import { Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Touchable,
  Image,
} from "react-native";
import Button from "./common/Button";
import useVoiceToText from "../../util/hooks/useVoiceToText";
import common from "../../util/common";
import chatRequest from "../../util/api/fetchChatRequest";
import { TouchableHighlight } from "react-native-gesture-handler";

const VoiceModal = (props) => {
  const [visible, setVisible] = useState(false);

  const {
    recording,
    recognizing,
    recordedText,
    startSpeechToText,
    stopSpeechToText,
  } = useVoiceToText();

  const handlePressIn = (event) => {
    if (visible) {
      event.preventDefault();
    } else {
      startSpeechToText();
    }
  };

  const handlePressOut = (event) => {
    if (visible) {
      event.preventDefault();
    } else {
      stopSpeechToText();
    }
  };

  const heightAnim = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    if (recognizing === false) {
      (async () => {
        try {
          setVisible(true);
          const text = recordedText.join(" ");
          const message = { content: text, role: "user" };
          const newMessages = [...props.messages, message];
          props.setMessages(newMessages);
          await chatRequest(
            newMessages,
            props.botState,
            props.setMessages,
            props.setBotState
          );
        } catch (error) {
          console.log(error);
        } finally {
          setVisible(false);
        }
      })();
      console.log(props.messages);
    }
  }, [recognizing]);

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: visible ? 400 : 200,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [visible, heightAnim]);

  const dynamicContainerStyle = {
    height: heightAnim,
  };

  return (
    <TouchableHighlight
      underlayColor="transparent"
      title="Start Speech to Text"
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={dynamicContainerStyle}>
        <View style={styles.mic}>
          <Feather name="mic" size={50} color={common.color.buttonPrimary} />
        </View>
        <View style={styles.container}>
          <Text style={styles.textMessage}>
            {recording ? "Listening..." : "Press To Speak"}
          </Text>
        </View>
      </Animated.View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: common.sizes.xl,
    borderTopRightRadius: common.sizes.xl,
    backgroundColor: common.color.buttonPrimary,
  },
  textMessage: {
    color: common.color.backgroundPrimary,
    fontFamily: common.text.poppinsSemiBold,
    fontSize: common.sizes.l,
  },
  mic: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 10,
    backgroundColor: common.color.backgroundPrimary,
    borderRadius: 100,
    padding: 20,
    shadowColor: "#000", // This is a black shadow
    shadowOffset: { width: 0, height: 4 }, // The shadow will be 4 points below the mic
    shadowOpacity: 0.3, // Opacity of the shadow; 1.0 is fully opaque
    shadowRadius: 5, // Blur radius of the shadow
    elevation: 8,
  },
});

export default VoiceModal;
