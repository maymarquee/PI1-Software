"use client";

import React from "react";
// Certifique-se de que o caminho para seus componentes está correto
import Modal1 from './components/Modal1';
import Modal2 from './components/Modal2';
import Modal3 from './components/Modal3';

export default function Home() {
  // Dados estáticos para a demonstração da tela principal (vazios, sem integração)
  const [rotasExemplo, setRotasExemplo] = React.useState<any[]>([]);
  const [trajetoExpandido, setTrajetoExpandido] = React.useState<number | null>(null);

  // modal flow state
  const [showModal1, setShowModal1] = React.useState(false);
  const [showModal2, setShowModal2] = React.useState(false);
  const [showModal3, setShowModal3] = React.useState(false);
  const [pendingValue, setPendingValue] = React.useState<string>('10');

  const trajetosAnterioresExemplo = [
    { id: 1, nome: "Trajeto I", velocidade: "5km/h", tempo: "5 min" },
    { id: 2, nome: "Trajeto II", velocidade: "5km/h", tempo: "5 min" },
    { id: 3, nome: "Trajeto III", velocidade: "5km/h", tempo: "5 min" },
  ];

  const handleAdicionarRota = () => {
    setShowModal1(true);
  };

  // Esta função agora fecha o Modal1 antes de abrir o Modal2
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

  const handleInterromperTrajeto = () => {
    console.log("Botão INTERROMPER O TRAJETO X clicado");
  };

  const handleIniciar = () => {
    console.log("Botão INICIAR clicado");
  };

  const getActionColor = (action: string) => {
    if (action === "para frente") return "bg-brand-green";
    if (action === "rotacionar direita") return "bg-brand-light-blue";
    if (action === "rotacionar esquerda") return "bg-yellow-600";
    return "bg-gray-500";
  };

  const getActionIcon = (action: string) => {
    if (action === "para frente") return "↑";
    if (action === "rotacionar direita") return "↻";
    if (action === "rotacionar esquerda") return "↺";
    return "";
  };

  return (
    <>
      <div className="min-h-screen bg-brand-background p-8 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna Esquerda */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-brand-text mb-4">Testando...</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="sensores" className="rounded text-brand-green focus:ring-brand-green" defaultChecked />
                    <label htmlFor="sensores" className="text-brand-text">Sensores</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="componentes" className="rounded text-brand-green focus:ring-brand-green" defaultChecked />
                    <label htmlFor="componentes" className="text-brand-text">Componentes</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="objeto-carrinho" className="rounded text-brand-green focus:ring-brand-green" />
                    <label htmlFor="objeto-carrinho" className="text-brand-text">Objeto depositado no carrinho</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="objeto-pote" className="rounded text-brand-green focus:ring-brand-green" />
                    <label htmlFor="objeto-pote" className="text-brand-text">Objeto depositado no pote</label>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-brand-text">Trajeto</h3>
                <button
                  onClick={handleAdicionarRota}
                  className="bg-brand-blue text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  ADICIONAR ROTA +
                </button>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="space-y-2 min-h-[200px] p-4">
                  {rotasExemplo.map((rota) => (
                    <div key={rota.id} className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteRoute(rota.id)}
                        className="text-brand-red text-lg font-bold leading-none p-1 rounded-full hover:bg-brand-red/20 transition-colors"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        X
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
                          <span>{getActionIcon(rota.action)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleIniciar}
                className="w-full bg-brand-green text-white py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                INICIAR
              </button>
            </div>

            {/* Coluna Direita */}
            <div>
              <h3 className="text-2xl font-bold text-brand-text mb-4">Trajetos anteriores</h3>
              <div className="bg-white rounded-lg shadow-lg p-6 h-fit mb-6">
                <div className="space-y-3">
                  {trajetosAnterioresExemplo.map((trajeto) => (
                    <div
                      key={trajeto.id}
                      className="bg-[#F6F6F6] rounded-lg p-4 cursor-pointer transition-all"
                      onClick={() => setTrajetoExpandido(trajetoExpandido === trajeto.id ? null : trajeto.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-brand-text">{trajeto.nome}</span>
                        <span className={`text-gray-400 transform transition-transform ${trajetoExpandido === trajeto.id ? 'rotate-90' : ''}`}>
                          ›
                        </span>
                      </div>
                      {trajetoExpandido === trajeto.id && (
                        <div className="mt-4 space-y-2 text-sm text-gray-600">
                          <p>velocidade | {trajeto.velocidade}</p>
                          <p>tempo | {trajeto.tempo}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleInterromperTrajeto}
                className="w-full bg-brand-red text-white py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                INTERROMPER O TRAJETO ✕
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
    </>
  );
}
