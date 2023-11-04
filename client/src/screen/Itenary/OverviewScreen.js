import { ScrollView, Dimensions, StyleSheet, Text, View } from "react-native";
import React from "react";
import common from "../../../util/common";
import CarouselComponent from "../../components/cards/carouselComponent";
import data from "../../../util/data/itenary.json";

const OverviewScreen = () => {
  return (
    <>
      <ScrollView>
        <View style={styles.container1}>
          <Text style={styles.subHeading1}>{data[0].title}</Text>
          <Text style={styles.content}>{data[0].description}</Text>
          {/* Day1 */}

          {data[0].itenerary.map((item, id) => (
            <View style={styles.container2}>
              <Text style={styles.subHeading2}>{item.day}</Text>
              <Text style={styles.content}>{item.description}</Text>
              {item.activities.map((activity, id) => (
                <View>
                  <View style={styles.container1}>
                    <Text style={styles.subHeading3}>{activity.name}</Text>
                    <Text style={styles.content}>{activity.description} </Text>
                  </View>
                  <CarouselComponent />
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
};

export default OverviewScreen;

const styles = StyleSheet.create({
  container1: {
    flex: 1,
    paddingTop: 10,
    width: Dimensions.width,
    backgroundColor: common.color.backgroundPrimary,
    marginHorizontal: 0,
  },
  container2: {
    flex: 1,
    marginTop: 20,
    paddingTop: 20,
    width: Dimensions.width,
    backgroundColor: common.color.backgroundPrimary,
    marginHorizontal: 0,
  },
  subHeading1: {
    fontSize: common.sizes.ml,
    marginLeft: common.sizes.l,
    color: common.color.subHeading,
    fontFamily: common.text.poppinsSemiBold,
  },
  subHeading2: {
    fontSize: common.sizes.m,
    marginLeft: common.sizes.l,
    color: common.color.subHeading,
    fontFamily: common.text.poppinsSemiBold,
  },
  subHeading3: {
    fontSize: common.sizes.ms,
    marginLeft: common.sizes.l,
    color: common.color.subHeading2,
    fontFamily: common.text.poppinsSemiBold,
  },
  content: {
    fontSize: common.sizes.mxs,
    marginLeft: common.sizes.l,
    color: common.color.content,
    fontFamily: common.text.poppinsRegular,
  },
});
