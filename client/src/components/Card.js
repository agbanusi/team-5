import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Card } from "react-native-elements";

export default function CardComponent({ date, unitLoaded }) {
  return (
    <Card containerStyle={styles.card}>
      <View style={styles.subContainer}>
        <View>
          <Text style={styles.unit}>{unitLoaded}</Text>
        </View>
        <View>
          <Text style={styles.date}>{date}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F8F9",
  },
  card: {
    justifyContent: "flex-start",
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowRadius: 2,
    elevation: 2,
    shadowOpacity: 0.5,
    marginVertical: 0,
  },
  subContainer: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 18,
  },
  date: {
    fontSize: 14,
    color: "grey",
    fontWeight: "bold",
  },
  unit: {
    fontWeight: "bold",
  },
});
