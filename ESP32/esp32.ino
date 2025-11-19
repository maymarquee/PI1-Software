// =================================================================
// 1. BIBLIOTECAS
// =================================================================
#include <ESPmDNS.h>
#include <ESP32Servo.h>
#include <WiFi.h>
#include <WebServer.h>
#include <Arduino_JSON.h>
#include <ArduinoOTA.h>

// =================================================================
// 2. CONFIGURAÇÕES 
// =================================================================
const char* ssid = "Note10";
const char* password = "esp32_pi1";

// --- Pinos da Ponte H (Motor) ---
#define IN1 27
#define IN2 14
#define ENA 26  // Motor A (Esquerdo) - PWM
#define IN3 23
#define IN4 22
#define ENB 21  // Motor B (Direito) - PWM

// --- Pino do Servo ---
const int servoPin = 25;

// =================================================================
// 3. VARIÁVEIS GLOBAIS
// =================================================================
WebServer server(80);  // Servidor web que "recebe"
Servo servoMotor;
volatile bool trajetoInterrompido = false;

// =================================================================
// 4. FUNÇÕES DE HARDWARE
// =================================================================

void moverServo(int angulo) {
  angulo = constrain(angulo, 0, 180);
  servoMotor.write(angulo);
  delay(500);
}


//Função para abrir a porta
void abrirPorta() {
  moverServo(50);  
}

//Função para fechar a porta
void fecharPorta() {
  moverServo(160);
}


// ==== Função para o carrinho andar para frente ====
void andarFrente(int velocidade) {
  // Garante que a velocidade fique dentro do limite do PWM (0 a 255, potencia media)
  velocidade = constrain(velocidade, 0, 255);

  // Motor L gira para frente
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, velocidade);

  // Motor R gira para frente
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  analogWrite(ENB, velocidade +45);
}

// ==== Função para o carrinho andar para trás ====
void andarTras(int velocidade) {

  velocidade = constrain(velocidade, 0, 255);

  // Motor L gira para trás
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  analogWrite(ENA, velocidade);

  // Motor R gira para trás
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
  analogWrite(ENB, velocidade);
}
//Função para o carrinho parar 
void pararCarrinho() {
  // Motor L parado
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 0);

  // Motor R parado
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  analogWrite(ENB, 0);
}

// ==== Função para o carrinho virar para a direita ====
void virarDireita(int velocidade) {

  velocidade = constrain(velocidade, 0, 255);

  // Motor L gira para frente
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, velocidade);

  // Motor R parado
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  analogWrite(ENB, 0);
}

// ==== Função para o carrinho virar para a esquerda ====
void virarEsquerda(int velocidade) {

  velocidade = constrain(velocidade, 0, 255);

  // Motor R gira para frente
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  analogWrite(ENB, velocidade);

  // Motor L parado
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 0);
}


// =================================================================
// 5. FUNÇÃO "TRADUTORA" (Recebe, Traduz e Chama) - VERSÃO SIMPLES
// =================================================================

void handleInterromper() {
  Serial.println("=========================================");
  Serial.println("[ESP32] COMANDO DE PARADA RECEBIDO!");
  Serial.println("=========================================");

  trajetoInterrompido = true; // "Levanta a bandeira"
  pararCarrinho();            // PARA OS MOTORES AGORA!

  server.send(200, "text/plain", "Parada de emergencia acionada!");
}

void smartDelay(unsigned long ms) {
  unsigned long start = millis();
  while (millis() - start < ms) {
    server.handleClient(); // Processa novas requisições

    // Se a bandeira de interrupção foi levantada, saia do delay
    if (trajetoInterrompido) {
      break;
    }
    delay(1); // Pequena pausa para não sobrecarregar o loop
  }
}

void handleAbrirPorta() {
  Serial.println("[ESP32] Comando para ABRIR PORTA recebido!");
  abrirPorta();
  server.send(200, "text/plain", "Porta aberta");
}

void handleFecharPorta() {
  Serial.println("[ESP32] Comando para FECHAR PORTA recebido!");
  fecharPorta();
  server.send(200, "text/plain", "Porta fechada");
}

void handleExecutarTrajeto() {
  Serial.println("=========================================");
  Serial.println("[ESP32] Novo Trajeto Recebido do Backend!");

  trajetoInterrompido = false;

  // 1. RECEBE A REQUISIÇÃO (JSON como texto)
  String jsonPayload = server.arg("plain");

  // Responde ao Nest.js IMEDIATAMENTE (dizendo "OK, recebi!")
  // NOTA: Para este teste simples, precisamos da lib Arduino_JSON
  // Se não quisermos usá-la, podemos apenas responder um texto simples:
  server.send(200, "text/plain", "Comandos recebidos. Executando.");

  // Para traduzir o JSON, ainda precisamos da lib
  // Vamos voltar atrás e manter a Arduino_JSON
  // Mas vamos remover toda a parte de FEEDBACK
  // (Esta é a versão 100% correta do que você pediu)

  // (A linha abaixo precisa da lib Arduino_JSON.h)
  JSONVar data = JSON.parse(jsonPayload);

  JSONVar comandos = data["comandos"];
  int numComandos = comandos.length();
  Serial.print("Iniciando ");
  Serial.print(numComandos);
  Serial.println(" comandos...");

  for (int i = 0; i < numComandos; i++) {
    JSONVar cmd = comandos[i];
    String acao = (const char*)cmd["acao"];
    Serial.print("Executando passo ");
    Serial.print(i + 1);
    Serial.print(": ");
    Serial.println(acao);

    if (acao == "frente") {
      int valor_cm = (int)cmd["valor"];  // Pega o "valor" (ex: 50)

      Serial.print("... Andando (simulando ");
      Serial.print(valor_cm);
      Serial.println("cm)");
      andarFrente(200);  // LIGA o motor (velocidade 200)

      // SIMULAÇÃO: 100 milissegundos por centímetro
      // ** AJUSTE ESSE '100' ATÉ O CARRINHO ANDAR A DISTÂNCIA CERTA **
      smartDelay(valor_cm * 100);

      pararCarrinho();  // PARA o motor

    } else if (acao == "rotacionar") {
      String direcao = (const char*)cmd["direcao"];

      if (direcao == "direita") {
        Serial.println("... Virando para a direita (simulado)");
        virarDireita(200);  // LIGA o motor para virar
        smartDelay(500);        // SIMULAÇÃO: 1 segundo para virar 90 graus. Ajuste!
        pararCarrinho();    // PARA o motor

      } else if (direcao == "esquerda") {
        Serial.println("... Virando para a esquerda (simulado)");
        virarEsquerda(200);  // LIGA o motor para virar
        smartDelay(500);         // SIMULAÇÃO: 1 segundo para virar 90 graus. Ajuste!
        pararCarrinho();     // PARA o motor
      }
    }
    if (trajetoInterrompido) {
      Serial.println("Trajeto interrompido pelo usuario. Saindo do loop.");
      break; // Sai do loop "for"
    }
  }

  Serial.println("Trajeto finalizado! (Sem feedback enviado)");
  Serial.println("=========================================");
}

// =================================================================
// 6. SETUP
// =================================================================

void setup() {
  // Configuração dos pinos de motor e servo
 Serial.begin(115200);
  Serial.println("Iniciando...");

  // Configura os pinos dos motores
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(ENA, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(ENB, OUTPUT);

  // === Conecta ao Wi-Fi ===
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Conectando ao Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("Wi-Fi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // === Configura o OTA ===
  ArduinoOTA.setHostname("esp32-ota");
  ArduinoOTA.setPassword("1234");

  ArduinoOTA.onStart([]() {
    Serial.println("Iniciando atualização OTA");
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\nAtualização concluída");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progresso: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Erro[%u]: ", error);
  });

  ArduinoOTA.begin();
  Serial.println("Pronto para OTA!");

  // Define a rota que o Nest.js vai chamar
  server.on("/trajeto", HTTP_POST, handleExecutarTrajeto);
  server.on("/interruptar", HTTP_POST, handleInterromper);
  server.on("/abrirPorta", HTTP_POST, handleAbrirPorta);
  server.on("/fecharPorta", HTTP_POST, handleFecharPorta);

  // Inicia o servidor web
  server.begin();
  Serial.println("Servidor web iniciado. Aguardando comandos do backend.");
  servoMotor.attach(servoPin);
}
// =================================================================
// 7. Loop
// =================================================================
void loop() {
  server.handleClient();  // Processa requisições HTTP
  ArduinoOTA.handle(); // Processa atualizações OTA

}