import { useEffect, useState } from "react";
import Voice from "@react-native-voice/voice";

export default useVoiceToText = () => {
  let [recording, setRecording] = useState(false);
  let [recordedText, setRecordedText] = useState([]);
  let [recognizing, setRecognizing] = useState(null);

  useEffect(() => {
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startSpeechToText = async () => {
    await Voice.start("en-US");
    setRecordedText([]);
    setRecording(true);
    setRecognizing(true);
  };

  const stopSpeechToText = async () => {
    await Voice.stop();
    setRecording(false);
  };

  const onSpeechResults = (result) => {
    setRecordedText(result.value);
    setRecognizing(false);
  };

  const onSpeechError = (error) => {
    console.log(error);
  };

  return {
    recording,
    recognizing,
    recordedText,
    setRecording,
    setRecognizing,
    setRecordedText,
    startSpeechToText,
    stopSpeechToText,
  };
};
