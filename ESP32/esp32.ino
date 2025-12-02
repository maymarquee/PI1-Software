#include <ESPmDNS.h>
#include <ESP32Servo.h>
#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h> 
#include <Arduino_JSON.h>
#include <ArduinoOTA.h>
#include <PID_v1.h>
#include <WiFiUdp.h> 

const char* ssid = "Note10";
const char* password = "esp32_pi1";

// IP COMPUTADOR
const char* pcIp = "192.168.136.40"; 
const int pcPort = 3001;

// URL montada dinamicamente
const String backendUrl = "http://" + String(pcIp) + ":" + String(pcPort) + "/carrinho/status"; 

// CONFIGURAÇÃO DOS LOGS UDP
WiFiUDP udp;
const int udpPort = 4210; // Porta para escutar os logs no PC

#define IN1 27
#define IN2 14
#define ENA 26
#define IN3 23
#define IN4 22
#define ENB 21

// --- Servo ---
const int servoPin = 25;

// --- Encoders ---
const int encoderR_PIN = 34;
const int encoderL_PIN = 32;

// --- Geometria ---
const float PULSOS_POR_VOLTA = 20.0;
const float RAIO_RODA_CM = 3.45;
const float CM_POR_PULSO = (2.0 * 3.1415 * RAIO_RODA_CM) / PULSOS_POR_VOLTA;

WebServer server(80);
Servo servoMotor;

// Controle
volatile bool trajetoInterrompido = false;
int currentTrajetoId = 0; 

// Encoders (Volatile para Interrupção)
volatile long pulsosR = 0;
volatile long pulsosL = 0;
volatile int lastStateR = 0;
volatile int lastStateL = 0;
unsigned long lastTimeR = 0;
unsigned long lastTimeL = 0;
float rpmR = 0, rpmL = 0;

// PID
double erroRPM, correcaoPID;
double setpoint = 0; 
double Kp = 2.0;  
double Ki = 0.4;  
double Kd = 0.1; 
PID pid(&erroRPM, &correcaoPID, &setpoint, Kp, Ki, Kd, DIRECT);

void IRAM_ATTR encoderR_ISR() {
  int state = digitalRead(encoderR_PIN);
  if (lastStateR == LOW && state == HIGH) {
    pulsosR++;
    unsigned long now = micros();
    if (lastTimeR != 0) {
      float dt = (now - lastTimeR) / 1e6;
      rpmR = (1.0 / dt) / PULSOS_POR_VOLTA * 60.0;
    }
    lastTimeR = now;
  }
  lastStateR = state;
}

void IRAM_ATTR encoderL_ISR() {
  int state = digitalRead(encoderL_PIN);
  if (lastStateL == LOW && state == HIGH) {
    pulsosL++;
    unsigned long now = micros();
    if (lastTimeL != 0) {
      float dt = (now - lastTimeL) / 1e6;
      rpmL = (1.0 / dt) / PULSOS_POR_VOLTA * 60.0;
    }
    lastTimeL = now;
  }
  lastStateL = state;
}

void pararCarrinho() {
  digitalWrite(IN1, LOW); digitalWrite(IN2, LOW); analogWrite(ENA, 0);
  digitalWrite(IN3, LOW); digitalWrite(IN4, LOW); analogWrite(ENB, 0);
}

void moverServo(int angulo) {
  angulo = constrain(angulo, 0, 180);
  servoMotor.write(angulo);
  delay(500); 
}

void resetarEncoders() {
  noInterrupts();
  pulsosR = 0; pulsosL = 0;
  rpmR = 0; rpmL = 0;
  interrupts();
}

float calcularDistanciaMediaCm() {
  long media = (pulsosR + pulsosL) / 2;
  return media * CM_POR_PULSO;
}

void enviarFeedback(float distancia, float angulo, float velocidade) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(backendUrl);
    http.addHeader("Content-Type", "application/json");

    String json = "{";
    if (currentTrajetoId > 0) json += "\"trajetoId\":" + String(currentTrajetoId);
    if (json.length() > 1 && distancia != 0) json += ",";
    if (distancia != 0) json += "\"distancia\":" + String(distancia);
    if (json.length() > 1 && angulo != 0) json += ",";
    if (angulo != 0) json += "\"angulo\":" + String(angulo);
    if (json.length() > 1) json += ",";
    json += "\"velocidade\":" + String(velocidade);
    json += "}";
    int httpResponseCode = http.POST(json);
    
    if (httpResponseCode <= 0) {
      debug("ERRO HTTP Feedback: " + http.errorToString(httpResponseCode));
    }
    http.end();
  } else {
    debug("ERRO: Sem Wi-Fi para Feedback");
  }
}


void executarCicloPID(int velocidadeBase) {
  if (micros() - lastTimeR > 500000) rpmR = 0; 
  if (micros() - lastTimeL > 500000) rpmL = 0;

  erroRPM = rpmR - rpmL; 
  pid.Compute();

  int motorR = velocidadeBase + correcaoPID; 
  int motorL = velocidadeBase - correcaoPID;

  motorR = constrain(motorR, 0, 255);
  motorL = constrain(motorL, 0, 255);

  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW); analogWrite(ENA, motorL);
  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW); analogWrite(ENB, motorR);
}

// Move para frente e retorna a distância percorrida
float moverFrentePID(float distanciaMetaCm, int velocidadeAlvo, float &velocidadeMediaOut) {
  resetarEncoders();
  float distanciaPercorrida = 0;
  float velocidadeAtual = 10.0; // Usei float para o cálculo de 1.2 
  unsigned long tempoInicio = millis();

  debugVal("Iniciando PID. Meta", distanciaMetaCm);

  while (distanciaPercorrida < distanciaMetaCm) {
    server.handleClient();
    if (trajetoInterrompido) {
      pararCarrinho();
      debug("!!! Movimento Interrompido !!!");
      // Calcula média parcial se interromper
      unsigned long tempoFim = millis();
      float segundos = (tempoFim - tempoInicio) / 1000.0;
      if (segundos > 0) velocidadeMediaOut = distanciaPercorrida / segundos;
      return distanciaPercorrida; 
    }

    if (velocidadeAtual < velocidadeAlvo) {
      executarCicloPID((int)velocidadeAtual);
      velocidadeAtual = velocidadeAtual * 1.2; 
      
      if (velocidadeAtual > velocidadeAlvo) velocidadeAtual = velocidadeAlvo;
    } else {
      executarCicloPID(velocidadeAlvo);
    }

    distanciaPercorrida = calcularDistanciaMediaCm();
    delay(10);
  }
  
  pararCarrinho();
  unsigned long tempoFim = millis();
  float tempoSegundos = (tempoFim - tempoInicio) / 1000.0;

  if (tempoSegundos > 0) {
    velocidadeMediaOut = distanciaPercorrida / tempoSegundos; // cm/s
  } else {
    velocidadeMediaOut = 0;
  }

  debugVal("Distancia Atingida", distanciaPercorrida);
  debugVal("Velocidade Media Calc", velocidadeMediaOut);

  return distanciaPercorrida; 
}

void rotacionar(String direcao) {
  int velocidade = 150;
  int tempoRotacao = 552; 

  debug("Rotacionando: " + direcao);

  if (direcao == "direita") {
    digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW); analogWrite(ENA, velocidade);
    digitalWrite(IN3, LOW);  digitalWrite(IN4, HIGH); analogWrite(ENB, velocidade);
  } else {
    digitalWrite(IN1, LOW);  digitalWrite(IN2, HIGH); analogWrite(ENA, velocidade);
    digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);  analogWrite(ENB, velocidade);
  }

  unsigned long start = millis();
  while(millis() - start < tempoRotacao) {
    server.handleClient();
    if (trajetoInterrompido) { pararCarrinho(); return; }
    delay(1);
  }
  pararCarrinho();
}

void handleInterromper() {
  trajetoInterrompido = true;
  pararCarrinho();
  server.send(200, "text/plain", "EMERGENCIA");
  enviarFeedback(0, 0, 0); 
}

void handleAbrirPorta() {
  moverServo(50);
  server.send(200, "text/plain", "Porta Aberta");
}

void handleFecharPorta() {
  moverServo(160);
  server.send(200, "text/plain", "Porta Fechada");
}

void handleExecutarTrajeto() {
  if (server.method() != HTTP_POST) {
    server.send(405, "text/plain", "Method Not Allowed");
    return;
  }

  String jsonPayload = server.arg("plain");
  JSONVar data = JSON.parse(jsonPayload);

  if (JSON.typeof(data) == "undefined") {
    server.send(400, "text/plain", "JSON invalido");
    debug("ERRO: JSON Invalido");
    return;
  }

  if (data.hasOwnProperty("trajetoId")) {
    currentTrajetoId = (int)data["trajetoId"];
    debugVal("Novo Trajeto ID", currentTrajetoId);
  } else {
    currentTrajetoId = 0;
    debug("Aviso: Trajeto sem ID");
  }

  server.send(200, "text/plain", "Trajeto Iniciado");
  
  trajetoInterrompido = false;
  JSONVar comandos = data["comandos"];
  int num = comandos.length();

  debugVal("Qtd Comandos", num);

  for (int i = 0; i < num; i++) {
    if (trajetoInterrompido) break;

    String acao = (const char*)comandos[i]["acao"];

    if (acao == "frente") {
      double valorMeta = (double)comandos[i]["valor"];
      int velAlvo = 180;
      float velocidadeMediaReal = 0;
      float distanciaReal = moverFrentePID((float)valorMeta, velAlvo, velocidadeMediaReal);
      
      enviarFeedback(distanciaReal, 0, velocidadeMediaReal);

    } else if (acao == "rotacionar") {
      String direcao = (const char*)comandos[i]["direcao"];
      
      rotacionar(direcao);
      float anguloEstimado = (direcao == "direita") ? 90.0 : -90.0;
      enviarFeedback(0, anguloEstimado, 150.0);
    }

    delay(200); 
  }
  
  pararCarrinho();
  debug("Trajeto Finalizado");
  currentTrajetoId = 0; 
}

void setup() {
  Serial.begin(115200);
  delay(1000); 

  pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT); pinMode(ENA, OUTPUT);
  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT); pinMode(ENB, OUTPUT);
  servoMotor.attach(servoPin);

  pinMode(encoderR_PIN, INPUT); pinMode(encoderL_PIN, INPUT);
  attachInterrupt(digitalPinToInterrupt(encoderR_PIN), encoderR_ISR, CHANGE);
  attachInterrupt(digitalPinToInterrupt(encoderL_PIN), encoderL_ISR, CHANGE);

  pid.SetMode(AUTOMATIC);
  pid.SetSampleTime(50);
  pid.SetOutputLimits(-255, 255);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Conectando WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi Conectado! IP: " + WiFi.localIP().toString());

  ArduinoOTA.setHostname("Carrinho-ESP32");
  ArduinoOTA.begin();

  server.on("/trajeto", HTTP_POST, handleExecutarTrajeto);
  server.on("/interruptar", HTTP_POST, handleInterromper);
  server.on("/abrirPorta", HTTP_POST, handleAbrirPorta);
  server.on("/fecharPorta", HTTP_POST, handleFecharPorta);
  
  server.begin();
}

void loop() {
  server.handleClient(); 
  ArduinoOTA.handle();   
}