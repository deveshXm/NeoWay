import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import { Dimensions } from "react-native";
import common from "../../../util/common";
import { FontAwesome5 } from "@expo/vector-icons";

const API_KEY =
  "sk.eyJ1IjoiZGV2ZXNoMTYiLCJhIjoiY2xva3F3N29xMjQyNjJpbjBoZmFlYXA0MCJ9.RxbY7Cf2AR6VugCOX1xjXA";

MapboxGL.setAccessToken(API_KEY);
const { width, height } = Dimensions.get("window");

const initialCoordinates = {
  latitude: 37.78,
  longitude: -122.41,
};

const coordinates = [
  { latitude: 37.78, longitude: -122.41 },
  { latitude: 37.78, longitude: -122.42 },
  // ... more coordinates
];

const MapScreen = () => {
  const [route, setRoute] = useState(null);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const waypoints = coordinates
          .map((coord) => `${coord.longitude},${coord.latitude}`)
          .join(";");

        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?geometries=geojson&access_token=${API_KEY}`
        );

        const json = await response.json();

        if (json.routes && json.routes.length) {
          setRoute(json.routes[0].geometry);
        }
      } catch (err) {
        console.error("Error fetching route:", err);
      }
    };

    if (coordinates.length > 1) {
      fetchRoute();
    }
  }, [coordinates]);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Dark} // Use the Dark theme provided by Mapbox
      >
        <MapboxGL.Camera
          zoomLevel={10}
          centerCoordinate={[
            initialCoordinates.longitude,
            initialCoordinates.latitude,
          ]}
        />

        {/* Markers */}
        {coordinates.map((coord, index) => (
          <MapboxGL.MarkerView
            key={index}
            id={`marker_${index}`}
            coordinate={[coord.longitude, coord.latitude]}
          >
            <FontAwesome5 name="map-marker-alt" size={24} color="white" />
          </MapboxGL.MarkerView>
        ))}

        {/* Route */}
        {route && (
          <MapboxGL.ShapeSource id="routeSource" shape={route}>
            <MapboxGL.LineLayer id="routeLayer" style={styles.route} />
          </MapboxGL.ShapeSource>
        )}
      </MapboxGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: width,
    height: height,
  },
  route: {
    lineColor: common.color.buttonPrimary, // Red color for the route
    lineWidth: 5,
    lineOpacity: 0.85,
  },
  marker: {
    width: 50, // Adjust the size as needed
    height: 50, // Adjust the size as needed
    resizeMode: "contain",
  },
});

export default MapScreen;
