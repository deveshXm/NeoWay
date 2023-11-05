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
import { useNavigation } from "@react-navigation/native";
import { useItenaryContext } from "../context/ItenaryContext";

const VoiceModal = (props) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addItenary } = useItenaryContext();
  const navigation = useNavigation();

  const {
    recording,
    recognizing,
    recordedText,
    startSpeechToText,
    stopSpeechToText,
  } = useVoiceToText();

  const handlePressIn = () => {
    if (!loading) {
      setVisible(true);
      startSpeechToText();
    }
  };

  const handlePressOut = () => {
    if (!loading) {
      stopSpeechToText();
      setVisible(false);
    }
  };

  const heightAnim = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    if (recognizing === false) {
      (async () => {
        try {
          setLoading(true);
          const text = recordedText[0];
          if (text.length) {
            const message = { content: text, role: "user" };
            const newMessages = [...props.messages, message];
            props.setMessages(newMessages);
            if (props.flatRef.current) {
              props.flatRef.current.scrollToEnd({ animated: true });
            }
            const response = await chatRequest(newMessages, props.setMessages);
            console.log(response);
            if (response.newState) {
              addItenary(response.arguments);
              navigation.navigate("Itenary");
            }
          }
        } catch (error) {
          console.log(error);
        } finally {
          if (props.flatRef.current) {
            props.flatRef.current.scrollToEnd({ animated: true });
          }
          setLoading(false);
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
          <Feather name="mic" size={35} color={common.color.buttonPrimary} />
        </View>
        <View style={styles.container}>
          <Text style={styles.textMessage}>
            {loading
              ? "Thinking..."
              : recording
              ? "Listening..."
              : "Press To Speak"}
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
    fontFamily: common.text.poppinsMedium,
    fontSize: common.sizes.ml,
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
