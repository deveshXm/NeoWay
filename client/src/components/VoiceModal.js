import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import Button from "./common/Button";
import useVoiceToText from "../../util/hooks/useVoiceToText";
import common from "../../util/common";

const VoiceModal = (props) => {
  const [visible, setVisible] = useState(false);

  const {
    recording,
    recognizing,
    recordedText,
    startSpeechToText,
    stopSpeechToText,
  } = useVoiceToText();

  const handlePressIn = () => {
    setVisible(true);
    startSpeechToText();
  };

  const handlePressOut = () => {
    setVisible(false);
  };

  const heightAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (recognizing === false) {
      const text = recordedText.join(" ");
      const message = { content: text, role: "user" };
      props.setMessages([...props.messages, message]);
    }
  }, [recognizing]);

  useEffect(() => {
    // Trigger the animation on visibility change
    Animated.timing(heightAnim, {
      toValue: visible ? 300 : 100, // Animate to 300 when visible, and back to 100 when not
      duration: 300, // Set the duration of the animation
      useNativeDriver: false, // Set to false because we're animating layout properties
    }).start();
  }, [visible, heightAnim]);

  const dynamicContainerStyle = {
    height: heightAnim, // Use the animated height value here
    justifyContent: "flex-end",
    borderTopLeftRadius: common.sizes.l,
    borderTopRightRadius: common.sizes.l,
    backgroundColor: common.color.buttonPrimary,
  };

  return (
    <Animated.View style={dynamicContainerStyle}>
      <Button
        title="Start Speech to Text"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      />
      {recordedText.map((result, index) => (
        <Text key={index}>{result}</Text>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  header: {
    backgroundColor: "#4285F4",
    padding: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    padding: 16,
  },
  contentText: {
    fontSize: 16,
  },
  closeButton: {
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default VoiceModal;
