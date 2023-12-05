import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Alert, Image } from "react-native";
import ControleSensor from "./components/ControleSensor";
import axios from "axios";

export default function App() {
  const [minValue, maxValue] = [50, 150];
  const [sliderValue, setSliderValue] = useState(100);
  const [ultimaMedicao, setUltimaMedicao] = useState(null);
  // const baseURL = "http://150.162.219.26:8000"
  const baseURL = "http://192.168.18.53:8000"

  // Atualiza valor na tela conforme slider
  const handleSliderChange = (valor) => {
    setSliderValue(valor);
  };

  // Envelopa funcão de enviar configuração para o servidor
  const handleEnviarConfigSensor = () => {    
    enviarConfigSensor(sliderValue);
  };

  // Envia o valor de configuração do sensor para o servidor
  const enviarConfigSensor = async (valor) => {
    try {
      const response = await axios.patch(`${baseURL}/config`, {
        distancia: valor,
      });
      Alert.alert("Successo", `Distância calibrada para ${valor}cm`);
      console.log("Successo:", response.data);
    } catch (error) {
      console.error("Erro ao alterar distância no servidor:", error);
    }
  };

  // Retorna a ultima medição registrada no servidor
  const pegarUltimaMedicao = async () => {
    try {
      const response = await axios.get(`${baseURL}/logging/ultimo`);
      // console.log("Última distância:", `${response.data.distancia}cm`);
      setUltimaMedicao(response.data.distancia);
    } catch (error) {
      console.error("Error fetching latest value:", error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      pegarUltimaMedicao();
    }, 1000); // Polling every 1000 milliseconds (1 second)

    return () => clearInterval(intervalId); // Clear the interval when the component unmounts
  }, []);

  return (
    <>
      <View style={styles.container}>
        <Image
          style={styles.logo}
          source={require("./assets/parking-logo.png")}
        />
        <Text style={styles.titulo}>APP EstacionaFacil</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.subtitulo}>Calibração do sensor:</Text>
        <ControleSensor
          minValue={minValue}
          maxValue={maxValue}
          sliderValue={sliderValue}
          onValueChange={handleSliderChange}
        />
        <Button title="Enviar" onPress={handleEnviarConfigSensor} />
      </View>

      <View style={styles.container}>
        <Text style={styles.subtitulo}>Leitura atual do sensor:</Text>
        <Text style={styles.leitura}>
          {ultimaMedicao ? `${ultimaMedicao}cm` : "Carregando..."}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 50,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    paddingBottom: 20,
  },
  subtitulo: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    paddingBottom: 20,
  },
  leitura: {
    fontSize: 24,
    textAlign: "center",
    paddingBottom: 20,
  },
  logo: {
    height: 140,
    width: 140,
    marginTop: 50,
  },
});
