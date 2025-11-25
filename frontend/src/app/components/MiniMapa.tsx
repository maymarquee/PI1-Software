"use client";
import { useEffect, useRef } from 'react';

// Define o formato do dado que vem do banco de dados (via logSegmento)
type LogSegmento = {
  distancia?: number | null;
  angulo?: number | null;
};

interface MiniMapaProps {
  logs?: LogSegmento[];
  largura?: number;
  altura?: number;
  corLinha?: string;
  escala?: number; 
}

export default function MiniMapa({ 
  logs = [], 
  largura = 300, 
  altura = 200, 
  corLinha = '#007aff', 
  escala = 3 
}: MiniMapaProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // 1. Limpar o Canvas antes de desenhar
    ctx.clearRect(0, 0, largura, altura);
    
    // 2. Configuração Visual da Linha
    ctx.strokeStyle = corLinha;
    ctx.lineWidth = 4; // Linha um pouco mais grossa para visibilidade
    ctx.lineCap = 'round'; // Pontas arredondadas
    ctx.lineJoin = 'round'; // Cantos arredondados nas curvas

    // 3. Definir Ponto Inicial (Centro do Canvas)
    const centroX = largura / 2;
    const centroY = altura / 2;

    // Variáveis da "Tartaruga"
    let x = centroX;
    let y = centroY;
    let anguloAtual = -90; // -90 graus = Apontando para CIMA

    // 4. Desenhar Ponto de Partida (Bolinha Cinza)
    ctx.fillStyle = '#9CA3AF'; // Cinza
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();

    // 5. Começar o Traçado
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Se não tiver logs, encerra aqui
    if (!logs || logs.length === 0) return;

    // 6. Loop para processar cada segmento do histórico
    logs.forEach(log => {
      
      // CASO A: ROTAÇÃO
      // Se o log tem ângulo, atualizamos a direção da "cabeça"
      if (log.angulo !== null && log.angulo !== undefined && log.angulo !== 0) {
        // Somamos ao ângulo atual.
        // Nota: Dependendo do seu motor, direita pode ser + ou -
        // Aqui assumimos: + é Direita (Horário), - é Esquerda (Anti-horário)
        anguloAtual += log.angulo; 
      }

      // CASO B: MOVIMENTO
      // Se o log tem distância, calculamos o novo X,Y e desenhamos a linha
      if (log.distancia !== null && log.distancia !== undefined && log.distancia > 0) {
        // Converter graus para radianos (necessário para Math.cos/sin)
        const radianos = anguloAtual * (Math.PI / 180);
        
        // Calcular nova posição
        // Nota: Y soma ou subtrai? No Canvas, Y cresce para baixo.
        // Math.sin(-90) é -1, então somar vai diminuir Y (ir para cima), o que está certo.
        x += Math.cos(radianos) * (log.distancia * escala);
        y += Math.sin(radianos) * (log.distancia * escala);
        
        // Desenha a linha até o novo ponto
        ctx.lineTo(x, y);
      }
    });

    // Finaliza o desenho da linha
    ctx.stroke();

    // 7. Desenhar Ponto Final (Bolinha Vermelha ou da cor da marca)
    ctx.fillStyle = '#EF4444'; // Vermelho
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();

  }, [logs, largura, altura, corLinha, escala]);

  return (
    <div className="relative w-fit mx-auto border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <canvas 
        ref={canvasRef} 
        width={largura} 
        height={altura}
        className="block" // Remove espaços extras do inline-block
      />
      {/* Legenda Opcional Flutuante */}
      <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 bg-white/80 px-2 py-1 rounded">
        Escala: 1cm = {escala}px
      </div>
    </div>
  );
}