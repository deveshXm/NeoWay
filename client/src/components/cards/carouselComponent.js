import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Carousel from "react-native-snap-carousel";
import Card from "./card";

const images = [
  { id: 1, source: require("../../../assets/hotel.png") },
  { id: 2, source: require("../../../assets/hotel.png") },
  { id: 3, source: require("../../../assets/hotel.png") },
  { id: 4, source: require("../../../assets/hotel.png") },
  { id: 5, source: require("../../../assets/hotel.png") },
  // Add more images as needed
];

const CarouselComponent = () => {
  const renderCarouselItem = ({ item, index }) => {
    return (
      <View >
        {/* <Image source={item.source} style={styles.image} />
        <LinearGradient
          colors={["red", "violet"]}
          style={styles.gradientOverlay}
        /> */}
        <Card  />
      </View>
    );
  };

  return (
    <Carousel
      data={images}
      renderItem={renderCarouselItem}
      sliderWidth={350} // Width of the carousel container
      itemWidth={150} // Width of each carousel item
      // firstItem={Math.floor(images.length / 2)} 
    />
  );
};

const styles = StyleSheet.create({
  carouselItem: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "fill",
    borderRadius: 10,
  },
});

export default CarouselComponent;
