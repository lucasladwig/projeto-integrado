import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

const ControleSensor = ({ minValue, maxValue, sliderValue, onValueChange }) => {
  return (
    <>
      <View style={styles.sliderContainer}>
        <Text style={styles.label}>{minValue}cm</Text>
        <Slider
          style={styles.slider}
          minimumValue={minValue}
          maximumValue={maxValue}
          minimumTrackTintColor="#007bff"
          maximumTrackTintColor="#000000"
          thumbTintColor="#ffffff"
          step={1}
          onValueChange={onValueChange}
          value={sliderValue}
        />
        <Text style={styles.label}>{maxValue}cm</Text>
      </View>
      <View style={styles.sliderContainer}>
        <Text style={styles.valorAtual}>{sliderValue}cm</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 5,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  label: {
    minWidth: 20,
    textAlign: "center",
  },
  valorAtual: {
    fontSize: 24,
    textAlign: "center",
    paddingBottom: 10,
  },
});

export default ControleSensor;
