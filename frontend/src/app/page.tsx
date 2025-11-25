"use client";

import React, { useRef, useEffect, useState } from "react";
import axios from 'axios';
import Modal1 from './components/Modal1';
import Modal2 from './components/Modal2';
import Modal3 from './components/Modal3';
import Modal4 from './components/Modal4'; 
import toast, { Toaster } from 'react-hot-toast';
import { 
  FaPlay, 
  FaStar, 
  FaRegStar, 
  FaArrowUp, 
  FaUndo, 
  FaChevronRight, 
  FaTimes, 
  FaPlus, 
  FaHandSparkles, 
  FaDoorOpen, 
  FaDoorClosed 
} from "react-icons/fa";
import { FaRotateRight } from "react-icons/fa6";

type ComandoDto = {
  acao: 'frente' | 'rotacionar';
  valor?: number;
  direcao?: 'esquerda' | 'direita';
}

type Comando = {
  id: number;
  acao: string;
  valor?: number;
  direcao?: string;
}

type TrajetoAnterior = {
  id: number;
  dataExecucao: string;
  comandos: Comando[];
  distanciaTotal: number;
  tempoTotalEstimado: number;
  velocidadeMedia: number;
  nome: string | null;
  isFavorito: boolean;
}

const transformarRotasParaDto = (rotas: any[]): ComandoDto[] => {
  return rotas.map(rota => {
    if (rota.action === 'para frente') {
      return {
        acao: 'frente',
        valor: Number(rota.value)
      };
    }
    if (rota.action === 'rotacionar direita') {
      return {
        acao: 'rotacionar',
        direcao: 'direita'
      };
    }
    if (rota.action === 'rotacionar esquerda') {
      return {
        acao: 'rotacionar',
        direcao: 'esquerda'
      };
    }
    return null;
  }).filter(Boolean) as ComandoDto[];
};

export default function Home() {
  const [rotasExemplo, setRotasExemplo] = useState<any[]>([]);
  const [trajetoExpandido, setTrajetoExpandido] = useState<number | null>(null);
  const [trajetosAnteriores, setTrajetosAnteriores] = useState<TrajetoAnterior[]>([]);
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [showModal4, setShowModal4] = useState(false); 
  const [pendingValue, setPendingValue] = useState<string>('10');
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Buscar dados do Backend
  useEffect(() => {
    const carregarTrajetos = async () => {
      try {
        const response = await axios.get('http://localhost:3001/trajetos');
        setTrajetosAnteriores(response.data); 
      } catch (error) {
        console.error("Erro ao carregar trajetos anteriores:", error);
        toast.error("Não foi possível carregar o histórico de trajetos.");
      }
    };
    carregarTrajetos();
  }, []); 

  // Hook de Desenho (Mini-Mapa)
  useEffect(() => {
    const desenharTrajeto = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;

      const w = canvas.width;
      const h = canvas.height;
      const escala = 2; 
      let x = w / 2;
      let y = h / 2;
      let angulo = -90; 

      ctx.clearRect(0, 0, w, h);

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#2AB907';
      ctx.fill();

      ctx.strokeStyle = '#007aff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);

      for (const rota of rotasExemplo) {
        if (rota.action === 'para frente') {
          const dist = (Number(rota.value) || 0) * escala;
          const rad = angulo * (Math.PI / 180);
          x += Math.cos(rad) * dist;
          y += Math.sin(rad) * dist;
          ctx.lineTo(x, y);
        } else if (rota.action === 'rotacionar direita') {
          angulo += 90;
        } else if (rota.action === 'rotacionar esquerda') {
          angulo -= 90;
        }
      }

      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#FF0000';
      ctx.fill();
    };

    desenharTrajeto();
    
  }, [rotasExemplo]);

  const handleAdicionarRota = () => {
    setShowModal1(true);
  };
  const handleOpenModal2 = () => {
    setShowModal1(false);
    setShowModal2(true);
  };
  const handleModal2Confirm = (value: string) => {
    setPendingValue(value);
    setShowModal2(false);
    setShowModal3(true);
  };
  const handleModal3Confirm = () => {
    setRotasExemplo((r) => [...r, { id: Date.now(), action: 'para frente', value: pendingValue }]);
    setShowModal3(false);
    setShowModal1(false);
  };
  const handleModalCancelAll = () => {
    setShowModal1(false);
    setShowModal2(false);
    setShowModal3(false);
    setShowModal4(false); // <-- MUDANÇA: Adicionar Modal4 aqui
  };
  const handleAddRotateRight = () => {
    setRotasExemplo((r) => [...r, { id: Date.now(), action: 'rotacionar direita' }]);
    setShowModal1(false);
  };
  const handleAddRotateLeft = () => {
    setRotasExemplo((r) => [...r, { id: Date.now(), action: 'rotacionar esquerda' }]);
    setShowModal1(false);
  };
  const handleDeleteRoute = (id: number) => {
    setRotasExemplo((prevRotas) => prevRotas.filter((rota) => rota.id !== id));
  };


  // --- Funções Principais (Ações) ---
  
  // MUDANÇA: handleIniciar agora SÓ abre o modal
  const handleIniciar = () => {
    if (rotasExemplo.length === 0) {
      toast.error("Adicione rotas antes de iniciar!");
      return;
    }
    // Em vez de 'prompt', abre o Modal4
    setShowModal4(true);
  };

  // MUDANÇA: Nova função que REALMENTE envia o trajeto
  const handleConfirmarEnvio = async (nomeDoTrajeto?: string) => {
    // Fecha o modal de nome
    setShowModal4(false);

    const comandosParaEnviar = transformarRotasParaDto(rotasExemplo);
    const payload = { 
      comandos: comandosParaEnviar,
      nome: nomeDoTrajeto || null // Passa o nome ou null
    };

    setIsLoading(true);
    
    toast.promise(
      axios.post('http://localhost:3001/carrinho/executar', payload),
      {
        loading: 'Enviando trajeto...',
        success: (response) => {
          if (response.data && response.data.trajetoSalvo) {
            setTrajetosAnteriores(
              (anteriores) => [response.data.trajetoSalvo, ...anteriores]
            );
          }
          setRotasExemplo([]); // Limpa o trajeto atual
          setIsLoading(false);
          return 'Trajeto enviado com sucesso!';
        },
        error: (err) => {
          console.error("Erro ao enviar trajeto:", err);
          setIsLoading(false);
          return 'Falha ao enviar trajeto.';
        }
      }
    );
  };
  
  const handleInterromperTrajeto = async () => {
    setIsLoading(true);
    toast.promise(
      axios.post('http://localhost:3001/carrinho/interruptar'),
      {
        loading: 'Enviando comando de parada...',
        success: () => {
          setIsLoading(false);
          return 'Comando de parada enviado!';
        },
        error: (err) => {
          console.error("Erro ao enviar comando de parada:", err);
          setIsLoading(false);
          return 'Falha ao enviar comando de parada.';
        }
      }
    );
  };
  
  const handleAbrirPorta = async () => {
    setIsLoading(true);
    toast.promise(
      axios.post('http://localhost:3001/carrinho/abrir-porta'),
      {
        loading: 'Abrindo a porta...',
        success: () => {
          setIsLoading(false);
          return 'Comando para abrir a porta enviado!';
        },
        error: (err) => {
          console.error("Erro ao enviar comando de abrir porta:", err);
          setIsLoading(false);
          return 'Falha ao enviar comando.';
        }
      }
    );
  };

  const handleFecharPorta = async () => {
    setIsLoading(true);
    toast.promise(
      axios.post('http://localhost:3001/carrinho/fechar-porta'),
      {
        loading: 'Fechando a porta...',
        success: () => {
          setIsLoading(false);
          return 'Comando para fechar a porta enviado!';
        },
        error: (err) => {
          console.error("Erro ao enviar comando de fechar porta:", err);
          setIsLoading(false);
          return 'Falha ao enviar comando.';
        }
      }
    );
  };

  const handleReplay = async (trajeto: TrajetoAnterior) => {
    console.log(`Re-executando trajeto #${trajeto.id}`);
    setIsLoading(true); 
    const payload = { 
      comandos: trajeto.comandos.map(cmd => ({
        acao: cmd.acao,
        valor: cmd.valor,
        direcao: cmd.direcao
      })),
      nome: trajeto.nome ? `${trajeto.nome} (Repetição)` : `Repetição do #${trajeto.id}`
    };
    
    toast.promise(
      axios.post('http://localhost:3001/carrinho/executar', payload),
      {
        loading: `Repetindo "${trajeto.nome || `Trajeto #${trajeto.id}`}"...`,
        success: (response) => {
          if (response.data && response.data.trajetoSalvo) {
            setTrajetosAnteriores(
              (anteriores) => [response.data.trajetoSalvo, ...anteriores]
            );
          }
          setIsLoading(false);
          return 'Trajeto repetido com sucesso!';
        },
        error: (err) => {
          console.error("Erro ao repetir trajeto:", err);
          setIsLoading(false);
          return 'Falha ao repetir trajeto.';
        }
      }
    );
  };

  const handleOtimizarRota = () => {
    if (rotasExemplo.length < 2) return; 

    const rotasOtimizadas = [];
    let rotaAnterior = null;

    for (const rotaAtual of rotasExemplo) {
      if (rotaAnterior === null) {
        rotaAnterior = { ...rotaAtual };
        continue;
      }

      if (rotaAtual.action === 'para frente' && rotaAnterior.action === 'para frente') {
        const valorAtual = Number(rotaAtual.value) || 0;
        const valorAnterior = Number(rotaAnterior.value) || 0;
        rotaAnterior.value = String(valorAnterior + valorAtual);
        rotaAnterior.id = rotaAtual.id;
      }
      else if (
        (rotaAtual.action === 'rotacionar direita' && rotaAnterior.action === 'rotacionar esquerda') ||
        (rotaAtual.action === 'rotacionar esquerda' && rotaAnterior.action === 'rotacionar direita')
      ) {
        rotaAnterior = null;
      }
      else {
        rotasOtimizadas.push(rotaAnterior);
        rotaAnterior = { ...rotaAtual };
      }
    }

    if (rotaAnterior !== null) {
      rotasOtimizadas.push(rotaAnterior);
    }
    setRotasExemplo(rotasOtimizadas);
    toast.success("Rota otimizada!");
  };

  const handleToggleFavorito = async (id: number) => {
    setIsLoading(true);
    let novoEstado = false;
    try {
      const response = await axios.patch(`http://localhost:3001/trajetos/${id}/favorito`);
      novoEstado = response.data.isFavorito;
      setTrajetosAnteriores((anteriores) => 
        anteriores.map((t) => 
          t.id === id ? { ...t, isFavorito: novoEstado } : t
        )
      );
      
      if (novoEstado) {
        toast.success("Adicionado aos favoritos!");
      } else {
        toast.success("Removido dos favoritos.");
      }
    } catch (error) {
      console.error("Erro ao favoritar trajeto:", error);
      toast.error("Falha ao favoritar o trajeto.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- Funções Helper ---
  const getActionColor = (action: string) => {
    if (action === "para frente") return "bg-brand-green";
    if (action === "rotacionar direita") return "bg-brand-light-blue";
    if (action === "rotacionar esquerda") return "bg-yellow-600";
    return "bg-gray-500";
  };
  
  const formatarData = (isoString: string) => {
    const data = new Date(isoString);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --- Listas Computadas para Renderização ---
  const trajetosFavoritos = trajetosAnteriores.filter(t => t.isFavorito);
  const trajetosHistorico = trajetosAnteriores.filter(t => !t.isFavorito);

  //
  // --- INÍCIO DO HTML (JSX) ---
  //
  return (
    <>
      <Toaster 
        position="top-center"
        reverseOrder={false}
      />

      <div className="min-h-screen bg-brand-background p-8 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* =====================================
              COLUNA ESQUERDA
              =====================================
            */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-brand-text">Trajeto</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleOtimizarRota}
                    disabled={isLoading || rotasExemplo.length < 2}
                    className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    title="Otimizar rota (juntar comandos repetidos)"
                  >
                    <FaHandSparkles /> Otimizar
                  </button>
                  <button
                    onClick={handleAdicionarRota}
                    disabled={isLoading}
                    className="bg-brand-blue text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    ADICIONAR ROTA <FaPlus />
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                
                <div className="space-y-2 min-h-[200px] p-4">
                  {rotasExemplo.length === 0 && (
                    <p className="text-gray-400 text-center pt-16">
                      Adicione rotas para iniciar um trajeto.
                    </p>
                  )}
                  {rotasExemplo.map((rota) => (
                    <div key={rota.id} className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteRoute(rota.id)}
                        disabled={isLoading}
                        className="text-brand-red text-lg font-bold leading-none p-1 rounded-full hover:bg-brand-red/20 transition-colors disabled:opacity-50"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <FaTimes />
                      </button>
                      <div
                        className={`${getActionColor(rota.action)} text-white py-3 px-4 rounded-lg flex items-center justify-between flex-grow`}
                      >
                        <span>{rota.action}</span>
                        <div className="flex items-center gap-2">
                          {rota.value && (
                            <span className="text-sm bg-white text-brand-green px-2 py-1 rounded">
                              {rota.value} cm
                            </span>
                          )}
                          <span className="text-lg">
                            {rota.action === 'para frente' && <FaArrowUp />}
                            {rota.action === 'rotacionar direita' && <FaRotateRight/>}
                            {rota.action === 'rotacionar esquerda' && <FaUndo />}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {rotasExemplo.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-center text-sm font-medium text-gray-500 mb-2">Pré-visualização do Trajeto</h4>
                    <canvas 
                      ref={canvasRef} 
                      width="400"
                      height="250"
                      className="bg-gray-50 border rounded-lg mx-auto block max-w-full"
                    >
                      Seu navegador não suporta o Canvas.
                    </canvas>
                  </div>
                )}

              </div>

              <button
                onClick={handleIniciar}
                disabled={isLoading || rotasExemplo.length === 0}
                className="w-full bg-brand-green text-white py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? "Enviando..." : "INICIAR"}
              </button>
            </div>

            {/* =====================================
              COLUNA DIREITA
              =====================================
            */}
            <div>
              {/* Seção de Favoritos */}
              {trajetosFavoritos.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-brand-text mb-4">⭐ Trajetos Favoritos</h3>
                  <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
                    <div className="space-y-3">
                      {trajetosFavoritos.map((trajeto) => (
                        <div key={trajeto.id} className="bg-[#F6F6F6] rounded-lg p-4 transition-all">
                          <div className="flex items-center justify-between">
                            <span 
                              className="font-medium text-brand-text cursor-pointer hover:underline"
                              onClick={() => setTrajetoExpandido(trajetoExpandido === trajeto.id ? null : trajeto.id)}
                            >
                              {trajeto.nome || `Trajeto #${trajeto.id}`}
                            </span>
                            
                            <button 
                              onClick={() => handleToggleFavorito(trajeto.id)}
                              disabled={isLoading}
                              title={trajeto.isFavorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                              className={`text-xl px-2 py-1 rounded-md hover:bg-gray-200 disabled:opacity-30 ${
                                trajeto.isFavorito ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"
                              }`}
                            >
                              {trajeto.isFavorito ? <FaStar /> : <FaRegStar />}
                            </button>
                            
                            <button 
                              onClick={() => handleReplay(trajeto)}
                              disabled={isLoading}
                              title="Re-executar este trajeto"
                              className="text-xl px-2 py-1 rounded-md text-brand-blue hover:bg-gray-200 disabled:opacity-30"
                            >
                              <FaPlay />
                            </button>
                            
                            <span 
                              className={`text-gray-400 transform transition-transform cursor-pointer ${trajetoExpandido === trajeto.id ? 'rotate-90' : ''}`}
                              onClick={() => setTrajetoExpandido(trajetoExpandido === trajeto.id ? null : trajeto.id)}
                            >
                              <FaChevronRight />
                            </span>
                          </div>
                          {trajetoExpandido === trajeto.id && (
                            <div className="mt-4 space-y-4 text-sm text-gray-600">
                              <div className="grid grid-cols-3 gap-2 mb-3 text-center border-b pb-3">
                                <div>
                                  <span className="block text-xs font-bold uppercase text-gray-400">Distância</span>
                                  <span className="block text-lg font-medium text-brand-text">
                                    {trajeto.distanciaTotal?.toFixed(1) ?? 0} cm
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-xs font-bold uppercase text-gray-400">Tempo (Est.)</span>
                                  <span className="block text-lg font-medium text-brand-text">
                                    {trajeto.tempoTotalEstimado?.toFixed(1) ?? 0} s
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-xs font-bold uppercase text-gray-400">Vel. Média</span>
                                  <span className="block text-lg font-medium text-brand-text">
                                    {trajeto.velocidadeMedia?.toFixed(1) ?? 0} cm/s
                                  </span>
                                </div>
                              </div>

                              <div>
                                <p className="font-bold">Comandos executados:</p>
                                <ul className="list-disc pl-5 space-y-1 mt-1">
                                  {trajeto.comandos.map((cmd) => (
                                    <li key={cmd.id}>
                                      {cmd.acao === 'frente' 
                                        ? `Andar ${cmd.valor} cm`
                                        : `Rotacionar para a ${cmd.direcao}`
                                      }
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Seção de Histórico */}
              <h3 className="text-2xl font-bold text-brand-text mb-4">Histórico de Trajetos</h3>
              <div className="bg-white rounded-lg shadow-lg p-6 h-fit mb-6">
                <div className="space-y-3">
                  {trajetosAnteriores.length === 0 && (
                    <p className="text-gray-500 text-center">Nenhum trajeto executado ainda.</p>
                  )}
                  {trajetosAnteriores.length > 0 && trajetosHistorico.length === 0 && (
                    <p className="text-gray-500 text-center">Todo o histórico está nos favoritos.</p>
                  )}

                  {trajetosHistorico.map((trajeto) => (
                    <div
                      key={trajeto.id}
                      className="bg-[#F6F6F6] rounded-lg p-4 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span 
                          className="font-medium text-brand-text cursor-pointer hover:underline"
                          onClick={() => setTrajetoExpandido(trajetoExpandido === trajeto.id ? null : trajeto.id)}
                        >
                            {trajeto.nome || `Trajeto #${trajeto.id}`}
                        </span>
                        
                        <button 
                          onClick={() => handleToggleFavorito(trajeto.id)}
                          disabled={isLoading}
                          title={trajeto.isFavorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                          className={`text-xl px-2 py-1 rounded-md hover:bg-gray-200 disabled:opacity-30 ${
                            trajeto.isFavorito ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"
                          }`}
                        >
                          {trajeto.isFavorito ? <FaStar /> : <FaRegStar />}
                        </button>
                        
                        <button 
                          onClick={() => handleReplay(trajeto)}
                          disabled={isLoading}
                          title="Re-executar este trajeto"
                          className="text-xl px-2 py-1 rounded-md text-brand-blue hover:bg-gray-200 disabled:opacity-30"
                        >
                          <FaPlay />
                        </button>
                        
                        <span className="text-sm text-gray-500">
                            {formatarData(trajeto.dataExecucao)}
                        </span>
                        
                        <span 
                          className={`text-gray-400 transform transition-transform cursor-pointer ${trajetoExpandido === trajeto.id ? 'rotate-90' : ''}`}
                          onClick={() => setTrajetoExpandido(trajetoExpandido === trajeto.id ? null : trajeto.id)}
                        >
                          <FaChevronRight />
                        </span>
                      </div>
                      
                      {trajetoExpandido === trajeto.id && (
                        <div className="mt-4 space-y-4 text-sm text-gray-600">
                          <div className="grid grid-cols-3 gap-2 mb-3 text-center border-b pb-3">
                            <div>
                              <span className="block text-xs font-bold uppercase text-gray-400">Distância</span>
                              <span className="block text-lg font-medium text-brand-text">
                                {trajeto.distanciaTotal?.toFixed(1) ?? 0} cm
                              </span>
                            </div>
                            <div>
                              <span className="block text-xs font-bold uppercase text-gray-400">Tempo (Est.)</span>
                              <span className="block text-lg font-medium text-brand-text">
                                {trajeto.tempoTotalEstimado?.toFixed(1) ?? 0} s
                              </span>
                            </div>
                            <div>
                              <span className="block text-xs font-bold uppercase text-gray-400">Vel. Média</span>
                              <span className="block text-lg font-medium text-brand-text">
                                {trajeto.velocidadeMedia?.toFixed(1) ?? 0} cm/s
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="font-bold">Comandos executados:</p>
                            <ul className="list-disc pl-5 space-y-1 mt-1">
                              {trajeto.comandos.map((cmd) => (
                                <li key={cmd.id}>
                                  {cmd.acao === 'frente' 
                                    ? `Andar ${cmd.valor} cm`
                                    : `Rotacionar para a ${cmd.direcao}`
                                  }
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-4 mb-4">
                <button
                  onClick={handleAbrirPorta}
                  disabled={isLoading}
                  className="w-full bg-brand-blue text-white py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? "..." : <><FaDoorOpen /> ABRIR PORTA</>}
                </button>
                <button
                  onClick={handleFecharPorta}
                  disabled={isLoading}
                  className="w-full bg-gray-500 text-white py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? "..." : <><FaDoorClosed /> FECHAR PORTA</>}
                </button>
              </div>
              
              <button
                onClick={handleInterromperTrajeto}
                disabled={isLoading}
                className="w-full bg-brand-red text-white py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? "..." : <>INTERROMPER O TRAJETO <FaTimes /></>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals overlays */}
      {showModal1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Modal1 onOpenValue={handleOpenModal2} onClose={handleModalCancelAll} onAddRotateRight={handleAddRotateRight} onAddRotateLeft={handleAddRotateLeft} />
        </div>
      )}
      {showModal2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Modal2 initialValue={pendingValue} onClose={handleModalCancelAll} onCancel={() => { setShowModal2(false); setShowModal1(true); }} onConfirm={handleModal2Confirm} />
        </div>
      )}
      {showModal3 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Modal3 displayValue={pendingValue} onClose={handleModalCancelAll} onCancel={() => { setShowModal3(false); setShowModal2(true); }} onConfirm={handleModal3Confirm} />
        </div>
      )}

      {/* --- MUDANÇA 6: Adicionar o Modal4 ao JSX --- */}
      {showModal4 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Modal4 
            onClose={handleModalCancelAll}
            onSkip={() => handleConfirmarEnvio()} // Chama sem nome
            onConfirm={(nome) => handleConfirmarEnvio(nome)} // Chama com nome
          />
        </div>
      )}
      {/* --- FIM DA MUDANÇA 6 --- */}
    </>
  );
}