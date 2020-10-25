import React from "react";
import { DotIndicator } from "react-native-indicators";
import { StyleSheet, Image, View } from "react-native";
import { theme } from "../utils/theme";

const Loading = () => {
  return (
    <View style={style.container}>
      <View style={style.centerItem}>
        <Image
          source={require("../public/img/mopower_logo.png")}
          style={style.image}
        />
        <DotIndicator
          color={theme.colors.accent}
          count={4}
          size={8}
          style={style.alignItemStart}
        />
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  centerItem: {
    justifyContent: "center",
    backgroundColor: "#ffffff",
    marginTop: "85%",
    alignItems: "center",
    alignContent: "flex-end",
    alignSelf: "center",
  },
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  image: {
    justifyContent: "center",
    backgroundColor: "white",
    width: 250,
    marginVertical: 12,
    height: 40,
    borderRadius: 50,
    padding: 30,
  },
  alignItemStart: {
    alignItems: "flex-start",
  },
});

export default Loading;
