import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import common from "../../../util/common";
import Mapbox from "@rnmapbox/maps";

Mapbox.setAccessToken(
  "sk.eyJ1IjoiZGV2ZXNoMTYiLCJhIjoiY2xva3F3N29xMjQyNjJpbjBoZmFlYXA0MCJ9.RxbY7Cf2AR6VugCOX1xjXA"
);

const MapScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.page}>
        <View style={styles.container}>
          <Mapbox.MapView style={styles.map} />
        </View>
      </View>
    </ScrollView>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: common.color.chatLoading,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    height: 400,
    width: 400,
  },
  map: {
    flex: 1,
  },
});
