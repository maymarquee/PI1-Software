"use client";
import { useEffect, useRef } from 'react';

type LogSegmento = {
  distancia?: number | null;
  angulo?: number | null;
  velocidadeMedia?: number | null; 
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

    ctx.clearRect(0, 0, largura, altura);
    
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (!logs || logs.length === 0) {
        ctx.fillStyle = '#9CA3AF';
        ctx.beginPath();
        ctx.arc(largura/2, altura/2, 4, 0, 2 * Math.PI);
        ctx.fill();
        return;
    }

    // bounding box
    let simX = 0;
    let simY = 0;
    let simAngulo = -90; // começa virado pra cima
    
    let minX = 0, maxX = 0;
    let minY = 0, maxY = 0;

    logs.forEach(log => {
      // atualiza ângulo
      if (log.angulo) simAngulo += log.angulo;
      
      // atualiza posição
      if (log.distancia) {
        const rad = simAngulo * (Math.PI / 180);
        simX += Math.cos(rad) * log.distancia;
        simY += Math.sin(rad) * log.distancia;

        // guarda os extremos para saber o tamanho da "caixa" do desenho
        if (simX < minX) minX = simX;
        if (simX > maxX) maxX = simX;
        if (simY < minY) minY = simY;
        if (simY > maxY) maxY = simY;
      }
    });

    const larguraTrajeto = Math.abs(maxX - minX);
    const alturaTrajeto = Math.abs(maxY - minY);
    
    const padding = 40; // espaço extra nas bordas
    const areaUtilLargura = largura - padding;
    const areaUtilAltura = altura - padding;

    let escalaAuto = 3; // valor padrão inicial

    if (larguraTrajeto > 0.1 || alturaTrajeto > 0.1) {
       // calcula quanto precisa reduzir/aumentar para caber na largura e altura
       const escalaX = areaUtilLargura / (larguraTrajeto || 1); // evita div por 0
       const escalaY = areaUtilAltura / (alturaTrajeto || 1);
       
       // escolhe a menor escala para garantir que cabe tudo
       escalaAuto = Math.min(escalaX, escalaY);

       if (escalaAuto > 5) escalaAuto = 5; 
       // se for muito pequeno, deixa dar zoom, mas não infinito
    }
    
    const centroTrajetoX = (minX + maxX) / 2;
    const centroTrajetoY = (minY + maxY) / 2;

    //ponto 00
    // ponto inicial na tela = centro da tela - (centro do trajeto * escala)
    let drawX = (largura / 2) - (centroTrajetoX * escalaAuto);
    let drawY = (altura / 2) - (centroTrajetoY * escalaAuto);
    let drawAngulo = -90;

    // salva o início para desenhar a bolinha cinza depois
    const startX = drawX;
    const startY = drawY;

    ctx.beginPath();
    ctx.moveTo(drawX, drawY);

    logs.forEach(log => {
      ctx.strokeStyle = corLinha;

      if (log.angulo) drawAngulo += log.angulo;

      if (log.distancia) {
        const rad = drawAngulo * (Math.PI / 180);
        
        // aplica a escala calculada
        drawX += Math.cos(rad) * (log.distancia * escalaAuto);
        drawY += Math.sin(rad) * (log.distancia * escalaAuto);

        ctx.lineTo(drawX, drawY);
      }
    });

    ctx.stroke();

    // desenha o ponto de partida (cinza)
    ctx.fillStyle = '#9CA3AF';
    ctx.beginPath();
    ctx.arc(startX, startY, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // desenha a "cabeça" atual (vermelho)
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(drawX, drawY, 5, 0, 2 * Math.PI);
    ctx.fill();

  }, [logs, largura, altura, corLinha]);

  return (
    <div className="relative w-fit mx-auto border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <canvas ref={canvasRef} width={largura} height={altura} className="block" />
    </div>
  );
}