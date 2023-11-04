import { ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import common from "../../../util/common";
import CarouselComponent from "../../components/cards/carouselComponent";
import itenaryData from "../../../util/data/itenary.json";
import Text from "../../components/common/Text";

const OverviewScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.container1}>
        <View style={styles.alignmentContainer}>
          <Text style={styles.subHeading1}>{itenaryData[0].title}</Text>
          <Text style={styles.content}>{itenaryData[0].description}</Text>

          {itenaryData[0].itenary.map((item, index) => (
            <View key={index} style={styles.container2}>
              <Text style={styles.subHeading2}>{item.day}</Text>
              <Text style={styles.content}>{item.description}</Text>
              {item.activities.map((activity, index) => (
                <View key={index}>
                  <View>
                    <Text style={styles.subHeading3}>{activity.name}</Text>
                    <Text style={styles.content}>{activity.description} </Text>
                  </View>
                  <CarouselComponent />
                </View>
              ))}
            </View>
          ))}
        </View>
        
      </View>
    </ScrollView>
  );
};

export default OverviewScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: common.color.chatLoading,
    paddingVertical: common.sizes.xl,
  },
  container1: {
    flex: 1,
    marginBottom: common.sizes.dxxxl,
  },
  container2: {
    marginVertical: 20,
    padding: common.sizes.m,
    backgroundColor: common.color.backgroundPrimary,
    borderRadius: common.sizes.m,
  },
  alignmentContainer: {
    marginHorizontal: common.sizes.ml,
  },
  subHeading1: {
    fontSize: common.sizes.ml,
    color: common.color.subHeading,
    fontFamily: common.text.poppinsSemiBold,
  },
  subHeading2: {
    padding: common.sizes.s,
    fontSize: common.sizes.m,
    color: common.color.subHeading,
    fontFamily: common.text.poppinsSemiBold,
  },
  subHeading3: {
    padding: common.sizes.s,
    fontSize: common.sizes.ms,
    color: common.color.subHeading2,
    fontFamily: common.text.poppinsSemiBold,
  },
  content: {
    borderRadius: common.sizes.m,
    padding: common.sizes.s,
    fontSize: common.sizes.mxs,
    color: common.color.content,
    fontFamily: common.text.poppinsRegular,
  },
});
