"use client";

import React, { useRef, useEffect, useState } from "react";
import axios from 'axios';
import Modal1 from './components/Modal1';
import Modal2 from './components/Modal2';
import Modal3 from './components/Modal3';
import Modal4 from './components/Modal4';
import MiniMapa from './components/MiniMapa';
import toast, { Toaster } from 'react-hot-toast';

import {
  FaPlay, FaStar, FaRegStar, FaArrowUp, FaUndo, FaChevronRight,
  FaTimes, FaPlus, FaHandSparkles, FaDoorOpen, FaDoorClosed, FaTrash
} from "react-icons/fa";
import { FaRotateRight } from "react-icons/fa6";

// --- TIPOS ---

type ComandoDto = {
  acao: 'frente' | 'rotacionar';
  valor?: number;
  direcao?: 'esquerda' | 'direita';
}

type LogSegmento = {
  distancia?: number | null;
  angulo?: number | null;
  velocidadeMedia?: number | null;
  criadoEm?: string;
};

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
  logsSegmento?: LogSegmento[];
}

const transformarRotasParaDto = (rotas: any[]): ComandoDto[] => {
  return rotas.map(rota => {
    if (rota.action === 'para frente') {
      return { acao: 'frente', valor: Number(rota.value) };
    }
    if (rota.action === 'rotacionar direita') {
      return { acao: 'rotacionar', direcao: 'direita' };
    }
    if (rota.action === 'rotacionar esquerda') {
      return { acao: 'rotacionar', direcao: 'esquerda' };
    }
    return null;
  }).filter(Boolean) as ComandoDto[];
};

export default function Home() {
  
  // Estados
  const [rotasExemplo, setRotasExemplo] = useState<any[]>([]);
  const [trajetosAnteriores, setTrajetosAnteriores] = useState<TrajetoAnterior[]>([]);
  const [trajetoExpandido, setTrajetoExpandido] = useState<number | null>(null);

  // Estados de Monitoramento
  const [isExecutando, setIsExecutando] = useState(false);
  const [trajetoRealLogs, setTrajetoRealLogs] = useState<LogSegmento[]>([]);

  // UI
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [showModal4, setShowModal4] = useState(false);
  const [pendingValue, setPendingValue] = useState<string>('10');
  const [isLoading, setIsLoading] = useState(false);

  // --- 1. CARREGAR DADOS ---
  useEffect(() => {
    const carregarTrajetos = async () => {
      try {
        const response = await axios.get('http://localhost:3001/trajetos');
        if (Array.isArray(response.data)) setTrajetosAnteriores(response.data);
      } catch (error) { console.error(error); }
    };
    carregarTrajetos();
  }, []);

  // --- 2. POLLING ---
  useEffect(() => {
    let intervalo: NodeJS.Timeout;
    if (isExecutando) {
      intervalo = setInterval(async () => {
        try {
          const response = await axios.get('http://localhost:3001/trajetos/feedback');
          const novosEventos = response.data;
          if (novosEventos && novosEventos.length > 0) {
            setTrajetoRealLogs(prev => [...prev, ...novosEventos]);
          }
        } catch (error) { console.error(error); }
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [isExecutando]);
  
  const calcularEstatisticas = (logs?: LogSegmento[]) => {
    if (!logs || logs.length === 0) {
      return { distanciaTotal: 0, tempoTotal: 0, velocidadeMedia: 0 };
    }

    // 1. Distância Total: Soma de todas as distâncias reportadas
    const distanciaTotal = logs.reduce((acc, log) => acc + (Number(log.distancia) || 0), 0);

    // 2. Velocidade Média: Média aritmética simples das velocidades
    const somaVelocidade = logs.reduce((acc, log) => acc + (Number(log.velocidadeMedia) || 0), 0);
    const velocidadeMedia = logs.length > 0 ? somaVelocidade / logs.length : 0;

    // 3. Tempo Total: Diferença entre o último e o primeiro timestamp
    let tempoTotal = 0;
    if (logs.length > 1 && logs[0].criadoEm && logs[logs.length - 1].criadoEm) {
      const inicio = new Date(logs[0].criadoEm).getTime();
      const fim = new Date(logs[logs.length - 1].criadoEm!).getTime();
      tempoTotal = (fim - inicio) / 1000; // Converte ms para segundos
    }

    return { distanciaTotal, tempoTotal, velocidadeMedia };
  };

  // --- AÇÕES ---
  const handleOtimizarRota = () => {
    if (rotasExemplo.length < 2) return;
    const rotasOtimizadas = [];
    let rotaAnterior = null;
    for (const rotaAtual of rotasExemplo) {
      if (rotaAnterior === null) { rotaAnterior = { ...rotaAtual }; continue; }
      if (rotaAtual.action === 'para frente' && rotaAnterior.action === 'para frente') {
        const valorAtual = Number(rotaAtual.value) || 0;
        const valorAnterior = Number(rotaAnterior.value) || 0;
        rotaAnterior.value = String(valorAnterior + valorAtual);
        rotaAnterior.id = rotaAtual.id;
      } else if ((rotaAtual.action === 'rotacionar direita' && rotaAnterior.action === 'rotacionar esquerda') || (rotaAtual.action === 'rotacionar esquerda' && rotaAnterior.action === 'rotacionar direita')) {
        rotaAnterior = null;
      } else {
        rotasOtimizadas.push(rotaAnterior);
        rotaAnterior = { ...rotaAtual };
      }
    }
    if (rotaAnterior !== null) rotasOtimizadas.push(rotaAnterior);
    setRotasExemplo(rotasOtimizadas);
    toast.success("Rota otimizada!");
  };

  const handleIniciar = () => {
    if (rotasExemplo.length === 0) { toast.error("Adicione rotas antes de iniciar!"); return; }
    setShowModal4(true);
  };

  const handleConfirmarEnvio = async (nomeDoTrajeto?: string) => {
    setShowModal4(false);
    setTrajetoRealLogs([]);
    setIsExecutando(true);
    setIsLoading(true);

    const payload = {
      comandos: transformarRotasParaDto(rotasExemplo),
      nome: nomeDoTrajeto || null
    };

    toast.promise(
      axios.post('http://localhost:3001/carrinho/executar', payload),
      {
        loading: 'Enviando trajeto...',
        success: (response) => {
          setIsLoading(false);
          return 'Carrinho iniciado! Acompanhe o trajeto no mapa.';
        },
        error: (err) => {
          console.error(err);
          setIsLoading(false);
          setIsExecutando(false);
          return 'Falha ao conectar com o carrinho.';
        }
      }
    );
  };

  const handleNovoTrajeto = () => {
    setIsExecutando(false);
    setRotasExemplo([]);
    setTrajetoRealLogs([]);
    toast("Pronto para planejar um novo trajeto.");
  };

  const handleInterromperTrajeto = async () => {
    setIsLoading(true);
    try {
      await axios.post('http://localhost:3001/carrinho/interruptar');
      toast.success('Parada enviada!');
    } catch (err) { toast.error('Erro ao parar.'); } finally { setIsLoading(false); }
  };

  // --- HELPERS ---
  const handleAdicionarRota = () => setShowModal1(true);
  const handleOpenModal2 = () => { setShowModal1(false); setShowModal2(true); };
  const handleModal2Confirm = (val: string) => { setPendingValue(val); setShowModal2(false); setShowModal3(true); };
  const handleModal3Confirm = () => { setRotasExemplo(r => [...r, { id: Date.now(), action: 'para frente', value: pendingValue }]); setShowModal3(false); setShowModal1(false); };
  const handleAddRotateRight = () => { setRotasExemplo(r => [...r, { id: Date.now(), action: 'rotacionar direita' }]); setShowModal1(false); };
  const handleAddRotateLeft = () => { setRotasExemplo(r => [...r, { id: Date.now(), action: 'rotacionar esquerda' }]); setShowModal1(false); };
  const handleModalCancelAll = () => { setShowModal1(false); setShowModal2(false); setShowModal3(false); setShowModal4(false); };
  const handleDeleteRoute = (id: number) => setRotasExemplo(prev => prev.filter(r => r.id !== id));

  const handleAbrirPorta = async () => { setIsLoading(true); try { await axios.post('http://localhost:3001/carrinho/abrir-porta'); toast.success('Porta aberta!'); } catch (e) { toast.error('Erro.'); } setIsLoading(false); };
  const handleFecharPorta = async () => { setIsLoading(true); try { await axios.post('http://localhost:3001/carrinho/fechar-porta'); toast.success('Porta fechada!'); } catch (e) { toast.error('Erro.'); } setIsLoading(false); };

  const handleReplay = async (trajeto: TrajetoAnterior) => {
    const comandosReplay = trajeto.comandos.map(cmd => ({
      id: Date.now() + Math.random(),
      action: cmd.acao === 'frente' ? 'para frente' : (cmd.direcao === 'direita' ? 'rotacionar direita' : 'rotacionar esquerda'),
      value: cmd.valor ? String(cmd.valor) : undefined
    }));
    setRotasExemplo(comandosReplay);
    setIsExecutando(false);
    toast.success("Trajeto carregado para replay!");
  };

  const handleToggleFavorito = async (id: number) => {
    setTrajetosAnteriores(prev => prev.map(t => t.id === id ? { ...t, isFavorito: !t.isFavorito } : t));
    try {
      await axios.patch(`http://localhost:3001/trajetos/${id}/favorito`);
      toast.success("Favorito atualizado!");
    } catch (error) {
      setTrajetosAnteriores(prev => prev.map(t => t.id === id ? { ...t, isFavorito: !t.isFavorito } : t));
      toast.error("Erro.");
    }
  };

  const getActionColor = (action: string) => {
    if (action === "para frente") return "bg-brand-green";
    if (action === "rotacionar direita") return "bg-brand-light-blue";
    if (action === "rotacionar esquerda") return "bg-yellow-600";
    return "bg-gray-500";
  };

  const formatarData = (isoString: string) => new Date(isoString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

  const trajetosFavoritos = trajetosAnteriores.filter(t => t.isFavorito);
  const trajetosHistorico = trajetosAnteriores.filter(t => !t.isFavorito);

  const renderTrajetoItem = (trajeto: TrajetoAnterior) => {
    const stats = calcularEstatisticas(trajeto.logsSegmento);

    return (
      <div key={trajeto.id} className="bg-[#F6F6F6] rounded-lg p-4 transition-all mb-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-brand-text cursor-pointer hover:underline flex-grow" onClick={() => setTrajetoExpandido(trajetoExpandido === trajeto.id ? null : trajeto.id)}>
            {trajeto.nome || `Trajeto #${trajeto.id}`}
          </span>
          <div className="flex gap-2 mr-2">
            <button onClick={() => handleToggleFavorito(trajeto.id)} className={trajeto.isFavorito ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"}>
              {trajeto.isFavorito ? <FaStar /> : <FaRegStar />}
            </button>
            <button onClick={() => handleReplay(trajeto)} className="text-brand-blue" title="Reutilizar Trajeto"><FaPlay /></button>
            <button onClick={() => handleExcluirTrajeto(trajeto.id)} className="text-red-400 hover:text-red-600" title="Excluir" disabled={isLoading}>
              <FaTrash />
            </button>
          </div>
          <span className="text-sm text-gray-500 mr-2">{formatarData(trajeto.dataExecucao)}</span>
          <span className={`text-gray-400 transform transition-transform cursor-pointer p-1 ${trajetoExpandido === trajeto.id ? 'rotate-90' : ''}`} onClick={() => setTrajetoExpandido(trajetoExpandido === trajeto.id ? null : trajeto.id)}>
            <FaChevronRight />
          </span>
        </div>
        {trajetoExpandido === trajeto.id && (
          <div className="mt-4 space-y-4 text-sm text-gray-600">
            <div className="mb-4 border rounded bg-white p-2 flex justify-center flex-col items-center">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2 w-full text-left">Mapa Realizado</p>
              {trajeto.logsSegmento && trajeto.logsSegmento.length > 0 ? (
                <MiniMapa logs={trajeto.logsSegmento} largura={280} altura={150} corLinha="#2AB907" escala={2} />
              ) : (
                <div className="h-24 w-full flex items-center justify-center bg-gray-50 rounded text-gray-400 text-xs">Sem dados.</div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center border-b pb-3">
              <div>
                <span className="font-bold block text-brand-text">{stats.distanciaTotal.toFixed(1)} cm</span>
                <span className="text-xs text-gray-400">DISTÂNCIA</span>
              </div>
              <div>
                <span className="font-bold block text-brand-text">{stats.tempoTotal.toFixed(1)} s</span>
                <span className="text-xs text-gray-400">TEMPO</span>
              </div>
              <div>
                <span className="font-bold block text-brand-text">{stats.velocidadeMedia.toFixed(0)}</span>
                <span className="text-xs text-gray-400">RPM MÉDIA</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Comandos Enviados</p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                {trajeto.comandos.map((cmd, idx) => {
                  let bgClass = 'bg-gray-500';
                  let icon = null;
                  let texto = '';
                  if (cmd.acao === 'frente') { bgClass = 'bg-brand-green'; icon = <FaArrowUp />; texto = 'Para Frente'; }
                  else if (cmd.direcao === 'direita') { bgClass = 'bg-brand-light-blue'; icon = <FaRotateRight />; texto = 'Rotacionar Direita'; }
                  else if (cmd.direcao === 'esquerda') { bgClass = 'bg-yellow-600'; icon = <FaUndo />; texto = 'Rotacionar Esquerda'; }
                  return (
                    <div key={idx} className={`${bgClass} text-white py-2 px-3 rounded-lg flex items-center justify-between text-xs`}>
                      <div className="flex items-center gap-2"><span className="text-base">{icon}</span><span className="font-medium">{texto}</span></div>
                      {cmd.valor && <span className="bg-white/20 px-2 py-0.5 rounded font-mono">{cmd.valor} cm</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleExcluirTrajeto = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este trajeto?")) return;

    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:3001/trajetos/${id}`);
      // Remove da lista visualmente
      setTrajetosAnteriores((prev) => prev.filter((t) => t.id !== id));
      toast.success("Trajeto excluído!");
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao excluir.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <div className="min-h-screen bg-brand-background p-8 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* --- COLUNA ESQUERDA (Controle) --- */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-brand-text">
                  {isExecutando ? "🔴 Executando Trajeto" : "Trajeto"}
                </h3>
                {!isExecutando && (
                  <div className="flex gap-2">
                    <button onClick={handleOtimizarRota} disabled={isLoading || rotasExemplo.length < 2} className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                      <FaHandSparkles /> Otimizar
                    </button>
                    <button onClick={handleAdicionarRota} disabled={isLoading} className="bg-brand-blue text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                      ADICIONAR ROTA <FaPlus />
                    </button>
                  </div>
                )}
              </div>

              {/* CAIXA PRINCIPAL */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6 min-h-[350px] flex flex-col">

                {/* CENÁRIO 1: EXECUTANDO (MOSTRA O MAPA) */}
                {isExecutando && (
                  <div className="flex-grow flex flex-col relative">
                    <div className="flex-grow flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
                      <MiniMapa
                        logs={trajetoRealLogs}
                        largura={400} altura={300}
                        corLinha="#2AB907" escala={2}
                      />
                      <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs text-green-600 animate-pulse font-bold border border-green-200 shadow-sm">
                        ● Ao Vivo
                      </div>
                    </div>
                  </div>
                )}

                {/* CENÁRIO 2: PLANEJAMENTO (MOSTRA A LISTA OU O TEXTO VAZIO) */}
                {!isExecutando && (
                  <div className="flex-grow flex flex-col">
                    {rotasExemplo.length === 0 ? (
                      // ESTADO VAZIO (Igual ao print que você mandou)
                      <div className="flex-grow flex items-center justify-center text-gray-300 text-sm select-none">
                        Adicione rotas para iniciar um trajeto.
                      </div>
                    ) : (
                      // LISTA DE COMANDOS (COLORIDOS)
                      <div className="space-y-2 max-h-[300px] overflow-y-auto p-2">
                        {rotasExemplo.map((rota) => (
                          <div key={rota.id} className="flex items-center gap-2">
                            <button onClick={() => handleDeleteRoute(rota.id)} className="text-brand-red"><FaTimes /></button>
                            <div className={`${getActionColor(rota.action)} text-white py-3 px-4 rounded-lg flex-grow text-sm flex justify-between items-center shadow-sm`}>
                              <span className="font-medium flex items-center gap-2">
                                {rota.action === 'para frente' && <FaArrowUp />}
                                {rota.action === 'rotacionar direita' && <FaRotateRight />}
                                {rota.action === 'rotacionar esquerda' && <FaUndo />}
                                {rota.action.toUpperCase()}
                              </span>
                              {rota.value && <span className="bg-white/20 px-2 py-1 rounded font-mono text-xs">{rota.value} cm</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* BOTÃO DE AÇÃO */}
              {!isExecutando ? (
                <button onClick={handleIniciar} disabled={isLoading || rotasExemplo.length === 0} className="w-full bg-brand-green text-white py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:bg-gray-300">
                  {isLoading ? "Enviando..." : "INICIAR"}
                </button>
              ) : (
                <button onClick={handleNovoTrajeto} className="w-full bg-gray-500 text-white py-3 rounded-full font-semibold hover:opacity-90">
                  CRIAR NOVO TRAJETO
                </button>
              )}
            </div>

            {/* --- DIREITA: HISTÓRICO --- */}
            <div>
              {/* Favoritos */}
              {trajetosFavoritos.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-brand-text mb-4">⭐ Trajetos Favoritos</h3>
                  <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
                    {trajetosFavoritos.map(renderTrajetoItem)}
                  </div>
                </div>
              )}
              <div className="flex gap-4 mb-4">
                <button onClick={handleAbrirPorta} disabled={isLoading} className="w-full bg-brand-blue text-white py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"><FaDoorOpen /> ABRIR PORTA</button>
                <button onClick={handleFecharPorta} disabled={isLoading} className="w-full bg-gray-500 text-white py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"><FaDoorClosed /> FECHAR PORTA</button>
              </div>
              <button onClick={handleInterromperTrajeto} disabled={isLoading} className="w-full bg-brand-red text-white py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">INTERROMPER O TRAJETO <FaTimes /></button>
            
              {/* Histórico */}
              <h3 className="text-2xl font-bold text-brand-text mb-4">Histórico de Trajetos</h3>
              <div className="bg-white rounded-lg shadow-lg p-6 h-fit mb-6">
                <div className="space-y-3">
                  {trajetosHistorico.length === 0 && <p className="text-center text-gray-400 text-sm py-4">Sem histórico recente.</p>}
                  {trajetosHistorico.map(renderTrajetoItem)}
                </div>
              </div>

              </div>

          </div>
        </div>
      </div>

      {/* Modais */}
      {showModal1 && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><Modal1 onOpenValue={handleOpenModal2} onClose={handleModalCancelAll} onAddRotateRight={handleAddRotateRight} onAddRotateLeft={handleAddRotateLeft} /></div>}
      {showModal2 && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><Modal2 initialValue={pendingValue} onClose={handleModalCancelAll} onCancel={() => { setShowModal2(false); setShowModal1(true); }} onConfirm={handleModal2Confirm} /></div>}
      {showModal3 && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><Modal3 displayValue={pendingValue} onClose={handleModalCancelAll} onCancel={() => { setShowModal3(false); setShowModal2(true); }} onConfirm={handleModal3Confirm} /></div>}
      {showModal4 && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><Modal4 onClose={handleModalCancelAll} onSkip={() => handleConfirmarEnvio()} onConfirm={(nome) => handleConfirmarEnvio(nome)} /></div>}
    </>
  );
}