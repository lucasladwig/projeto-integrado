import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import axios from 'axios';

const Calibrador = () => {
  const [calibradorValor, setCalibradorValor] = useState(50);

  const calibrarSensor = async (valor) => {
    const servidor = 'localhsot:8000/config';
    try {
      const resposta = await axios.patch(servidor, {
        calibradorValor: valor
      });
      console.log('Resposta:', resposta.data);
    } catch (error) {
      console.error('Error sending value to backend:', error);
    }
  };

  const handleSensorChange = (valor) => {
    setCalibradorValor(valor);
    calibrarSensor(valor);
  };

  return (
    <View style={styles.container}>
      <Slider
        style={{width: 200, height: 40}}
        minimumValue={50}
        maximumValue={150}
        minimumTrackTintColor="#307ecc"
        maximumTrackTintColor="#000000"
        step={1}
        value={calibradorValor}
        onValueChange={handleSensorChange}
      />
      <Text>Value: {calibradorValor} cm</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default Calibrador;
