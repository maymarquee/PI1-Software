// Arquivo: simulador_esp32.js
// "SIMULADOR" DA ESP PARA TESTAR SE A REQUISIÇÃO CHEGOU CORRETAMENTE
const express = require('express');
const axios = require('axios'); // axios para o ESP32 "falar de volta"
const app = express();
app.use(express.json());

const PORTA_CARRINHO = 4000; // Onde o carrinho "falso" vai rodar
const URL_BACKEND_REPORTAR = 'http://localhost:3001/trajetos/reportar';

// Rota que o Backend (Nest.js) vai chamar
app.post('/trajeto', (req, res) => {
  console.log('--- [SIMULADOR ESP32] ---');
  console.log('Recebi um novo trajeto para executar!');
  console.log('Payload Recebido:', req.body);

  const { runId, comandos } = req.body;

  // 1. Imediatamente respondo ao backend que recebi o comando
  res.status(200).json({ status: 'recebido', runId: runId });

  // 2. Simulo o trabalho... (ex: 3 segundos)
  console.log(`[SIMULADOR ESP32] Executando ${comandos.length} comandos...`);
  setTimeout(() => {
    // 3. Após o trabalho, eu (o carrinho) reporto os dados de volta
    console.log(`[SIMULADOR ESP32] Trabalho concluído. Reportando para ${URL_BACKEND_REPORTAR}...`);

    const dadosDoTrajeto = {
      runId: runId,
      status: 'concluido',
      velocidade: '5km/h (simulado)',
      tempo: '3s (simulado)'
    };

    // Faço a chamada de volta para o Nest.js
    axios.post(URL_BACKEND_REPORTAR, dadosDoTrajeto)
      .then(response => {
        console.log('[SIMULADOR ESP32] Backend confirmou o recebimento do log.');
      })
      .catch(error => {
        console.error('[SIMULADOR ESP32] ERRO AO REPORTAR:', error.message);
      });

  }, 3000);
});

app.listen(PORTA_CARRINHO, () => {
  console.log(`>>> Simulador do Carrinho (ESP32) rodando em http://localhost:${PORTA_CARRINHO}`);
});