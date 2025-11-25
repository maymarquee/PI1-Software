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

    const centroX = largura / 2;
    const centroY = altura / 2;
    let x = centroX;
    let y = centroY;
    let anguloAtual = -90; 

    ctx.fillStyle = '#9CA3AF';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (!logs || logs.length === 0) return;

    logs.forEach(log => {
      ctx.strokeStyle = corLinha;

      if (log.angulo !== null && log.angulo !== undefined && log.angulo !== 0) {
        anguloAtual += log.angulo; 
      }

      if (log.distancia !== null && log.distancia !== undefined && log.distancia > 0) {
        const radianos = anguloAtual * (Math.PI / 180);
        x += Math.cos(radianos) * (log.distancia * escala);
        y += Math.sin(radianos) * (log.distancia * escala);
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
    
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();

  }, [logs, largura, altura, corLinha, escala]);

  return (
    <div className="relative w-fit mx-auto border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <canvas ref={canvasRef} width={largura} height={altura} className="block" />
    </div>
  );
}