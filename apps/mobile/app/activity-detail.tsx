import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
//import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
//import api from "@/utils/api";

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams();
  const [activity, setActivity] = useState<any>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      //    const res = await api.get(`/activities/${id}`);
      //    setActivity(res.data);
    };
    fetchDetail();
  }, [id]);

  if (!activity) return null;

  // Convert your [Object] coordinates into {latitude, longitude}
  const mapPoints = activity.coordinates.map((p: any) => ({
    latitude: p.latitude,
    longitude: p.longitude,
  }));
  /* 
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: mapPoints[0]?.latitude || 0,
          longitude: mapPoints[0]?.longitude || 0,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Polyline
          coordinates={mapPoints}
          strokeColor="#00fff2" // Cyber theme primary
          strokeWidth={4}
        />
      </MapView>
    </View>
  );
   */
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
