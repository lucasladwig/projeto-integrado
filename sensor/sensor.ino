#include "Ultrasonic.h"      // Importa a biblioteca necessária para operar o sensor ultrassônico (by Erick Simões)
#include "SoftwareSerial.h"  // Importa a biblioteca necessária para operar o módulo WiFi (by Dirk Kaar)

#define DEBUG true

const int pinoEcho = 7;     // Pino que recebe sinal do sensor (echo)
const int pinoTrigger = 6;  // Pino que envia sinal para o sensor (trigger)
const int pinoBuzzer = 4;   // Pino que envia sinal para o Buzzer
const String endpoint = "/logging";
const String server = "localhost:8090";
const String host = "localhost";
const String portPOST = "8090";
const int portGET = 8080;
const String pathPOST = "/logging";
const String pathGET = "/config";
const String SSID = "PREDO";
const String password = "pikachu0";

SoftwareSerial esp8266(2, 3);  // RX pino 2, TX pino 3

Ultrasonic ultrasonic(pinoTrigger, pinoEcho);  // Inicializa pinos do sensor ultrassonico no arduino

int distancia;     // Recebe a distância medida (cm) pelo sensor ultrassonico
String resultado;  // Guarda a medida em string para imprimir na tela
int valorPot = 0;  // Recebe o valor do potenciometro (de 0 a 1023)

// CONFIGURA O SISTEMA
void setup()
{
  pinMode(pinoEcho, INPUT);      // Define pinoEcho como entrada
  pinMode(pinoTrigger, OUTPUT);  // Define pinoTrigger como saída
  pinMode(pinoBuzzer, OUTPUT);   // Define pinoBuzzer como saída
  Serial.begin(115200);          // Define velocidade de conexão com porta serial

  //sendPOSTRequest("SSID", "password", "example.com", "/your_endpoint", "param1=value1&param2=value2");


  // Configuração do módulo WiFi
  esp8266.begin(115200);
  String conectadoIP = "";

  while (conectadoIP.indexOf("OK") == -1)
  {
    sendData("AT+RST\r\n", 2000, DEBUG);  // rst
    // Conecta a rede wireless
    String command = "AT+CWJAP=\"";
    command += SSID;
    command += "\",\"";
    command += password;
    command += "\"\r\n";
    sendData(command, 2000, DEBUG);
    delay(10000);
    conectadoIP = sendData("AT+CWMODE=1\r\n", 2000, DEBUG);
    // Mostra o endereco IP
    sendData("AT+CIFSR\r\n", 2000, DEBUG);
    // Configura para multiplas conexoes
    sendData("AT+CIPMUX=1\r\n", 2000, DEBUG);
    // Inicia o web server na porta 80
    sendData("AT+CIPSERVER=1,80\r\n", 2000, DEBUG);
  }
}

// INICIA AS LEITURAS E LÓGICAS DO SISTEMA
void loop()
{
  // if (esp8266.available())  // Verifica se o ESP8266 esta enviando dados
  // {
  //   String receivedData = esp8266.readStringUntil("\r");  // Lê os dados recebidos até o retorno de carro (\r) mandado no param de 192.168.0.185
  //   //Serial.print(receivedData);
  //   //receiveData(receivedData);
  // }

  // String teste = sendGETRequest(host, portGET, pathGET);
  // Serial.print(teste);

  sendData("AT+HTTPCLIENT=2,0,\"http://2804:14d:baa0:9b19:2d27:2561:c04a:acb7:8080/config\"", 5000, DEBUG);

  esp8266.println("AT+CIPSTART=4,\"TCP\",\"2804:14d:baa0:9b19:2d27:2561:c04a:acb7\",8080");
  delay(1000);
  while (esp8266.available()) {
    Serial.println(esp8266.readStringUntil('\n')); 
  }
  
  String cmd = "GET / HTTP/1.1\r\nHost: 2804:14d:baa0:9b19:2d27:2561:c04a:acb7:8080/config\r\nConnection: close\r\n\r\n";
  esp8266.println("AT+CIPSEND=4," + String(cmd.length() + 4));

  esp8266.println(cmd);
  delay(1000);
  esp8266.println(""); 
  if (esp8266.available()) {
    Serial.write(esp8266.read());
  }


  // Dispara o método que calcula a distância medida pelo sensor e imprime na tela
  hcsr04();
  Serial.print("Distancia ");
  Serial.print(resultado);
  Serial.println("cm");


  String dados = "{\"distancia\": " + resultado + "}";
  //sendPOSTRequest(host, portPOST, pathPOST, dados);

  //sendPOSTRequestTESTE(dados);

  // Define em qual distância o buzzer começa a emitir som
  if (distancia <= (valorPot / 20) + 30) // A distancia do sensor varia de 30-80cm
  {
    tone(pinoBuzzer, 1500, distancia * 5); // Emite som com mais frequencia conforme diminui a distância
  }
  else
  {
    noTone(pinoBuzzer); // Desativa o buzzer caso a distancia seja maior que a ajustada no potenciometro
  }
}

// CALCULA A DISTÂNCIA MEDIDA PELO SENSOR
void hcsr04()
{
  // Envia um pulso do sensor para medir distancia
  digitalWrite(pinoTrigger, LOW);
  delayMicroseconds(2);
  digitalWrite(pinoTrigger, HIGH);
  delayMicroseconds(10);
  digitalWrite(pinoTrigger, LOW);

  distancia = (ultrasonic.read(CM));  // Guarda o valor medido da distância em cm
  resultado = String(distancia);      // Transforma a distancia em string para impressão na tela
  delay(distancia * 10);              // Delay com base na distância medida (melhora frequência do beep)

  // Garante que o delay de leitura varie conforme a distância medida
  if (distancia > ((valorPot / 20) + 30)) // Delay de 100ms para distancias maiores que 80cm
  {
    delay(100);
  }
  else
  {
    delay(distancia * 20); // Delay com base na distância medida (melhora frequência do beep)
  }
}

void receiveData(String receivedData)
{
  if (receivedData.indexOf("POST") != -1)
  {
    int index = receivedData.indexOf("=");  // Encontra a posição do caractere '='

    if (index != -1) {
      String valorString = receivedData.substring(index + 1);  // Obtém a substring após '='

      // Encontra a posição do primeiro não dígito após '='
      int posNaoDigito = valorString.length();  // Inicialmente, assume o final da string
      for (int i = 0; i < valorString.length(); i++) {
        if (!isdigit(valorString.charAt(i))) {
          posNaoDigito = i;
          break;
        }
      }

      // Obtém a substring com os caracteres antes do primeiro não dígito
      String proximosDigitos = valorString.substring(0, posNaoDigito);

      // Verifica se a substring é composta apenas por dígitos
      bool saoDigitos = true;
      for (int i = 0; i < proximosDigitos.length(); i++) {
        if (!isdigit(proximosDigitos.charAt(i))) {
          saoDigitos = false;
          break;
        }
      }

      // Se forem dígitos, converte para inteiro
      if (saoDigitos && proximosDigitos.length() > 0 && proximosDigitos.length() <= 3) {
        int valorNumerico = proximosDigitos.toInt();  // Converte a string para um valor inteiro
        Serial.print("Valor numérico após '=' é: ");
        Serial.println(valorNumerico);  // Exibe o valor numérico obtido
        valorPot = valorNumerico;

        // Resposta HTTP
        String resposta = "Requisição recebida com sucesso!\r\n";
        String respostaHTTP = "HTTP/1.1 200 OK\r\n";
        respostaHTTP += "Content-Type: text/plain\r\n";
        respostaHTTP += "Content-Length: " + String(resposta.length()) + "\r\n";  // 36
        respostaHTTP += "\r\n";
        respostaHTTP += resposta;

        String cipsendCmd = "AT+CIPSEND=0," + String(respostaHTTP.length());  // 0 é o ID da conexão, pode variar se usar conexões múltiplas
        esp8266.println(cipsendCmd);
        delay(100);  // Dê um tempo para o ESP8266 se preparar para receber os dados

        esp8266.print(respostaHTTP);

        // Finalize com o comando AT+CIPCLOSE=
        String closeCommand = "AT+CIPCLOSE\r\n";
        sendData(closeCommand, 3000, DEBUG);  // Feche a conexão
      }
    }
  }
}

String sendData(String command, const int timeout, boolean debug)
{
  // Envio dos comandos AT para o modulo
  String response = "";
  esp8266.print(command);
  long int time = millis();
  while ((time + timeout) > millis()) {
    while (esp8266.available()) {
      // The esp has data so display its output to the serial window
      char c = esp8266.read();  // read the next character.
      response += c;
    }
  }
  if (debug) {
    Serial.print(response);
  }
  return response;
}

void sendPOSTRequest(String host, String portPOST, String pathPOST, String data) {
  // Envia requisição POST
  String postRequest = "POST ";
  postRequest += pathPOST;
  postRequest += " HTTP/1.1\r\n";
  postRequest += "Host: ";
  postRequest += host;
  postRequest += ":";
  postRequest += portPOST;
  postRequest += "\r\n";
  postRequest += "Content-Type: application/x-www-form-urlencoded\r\n";
  postRequest += "Content-Length: ";
  postRequest += String(data.length());
  postRequest += "\r\n\r\n";
  postRequest += data;

  String cipsendCmd = "AT+CIPSEND=0," + String(postRequest.length());  // 0 é o ID da conexão, pode variar se usar conexões múltiplas
  esp8266.println(cipsendCmd);
  delay(1000);  // Dê um tempo para o ESP8266 se preparar para receber os dados

  esp8266.print(postRequest);

  // Finalize com o comando AT+CIPCLOSE=
  String closeCommand = "AT+CIPCLOSE\r\n";
  sendData(closeCommand, 3000, DEBUG);  // Feche a conexão

}


String sendGETRequest(String host, int portGET, String pathGET) {
  // String requisicaoGET = "GET /config HTTP/1.1\r\nHost: 2804:14d:baa0:9b19:2d27:2561:c04a:acb7:8080\r\n\r\n";
  // int tamanhoRequisicao = requisicaoGET.length();

  // Serial.println("Enviando requisição GET...");
  // esp8266.print("AT+CIPSEND=");
  // esp8266.println(tamanhoRequisicao);
  // delay(2000);

  // esp8266.println(requisicaoGET);
  // delay(10000);
  // while (esp8266.available()) {
  //     // The esp has data so display its output to the serial window
  //     char c = esp8266.read();  // read the next character.
  //     Serial.print(c);
  //   }
  esp8266.print("AT+HTTPCLIENT=2,0,\"http://2804:14d:baa0:9b19:2d27:2561:c04a:acb7:8080/config\",,,2");
  while (esp8266.available()) {
    // The esp has data so display its output to the serial window
    char c = esp8266.read();  // read the next character.
    Serial.print(c);
  }
}




void sendPOSTRequestTESTE(String postMessage)
{
    unsigned int l=postMessage.length();
    esp8266.print("AT+CIPSEND=");
    esp8266.println(l);
    Serial.println(esp8266.readString());
    esp8266.println("PUT /logging HTTP/1.1");//Need this to change to POST or atleast allow sending JSON object
    esp8266.println("Host:localhost:8090");
    esp8266.print("Content-Length: ");
    esp8266.println(String(postMessage.length()));
    Serial.println(esp8266.readString());
    esp8266.println();
    esp8266.println(postMessage);//Probably an issue with this one
    delay(10000);
}
