"use client";

import React from "react";

export default function Home() {
  // Dados estáticos para a demonstração da tela principal (vazios, sem integração)
  const rotasExemplo: any[] = [];

  const trajetosAnterioresExemplo = [
    { id: 1, nome: "Trajeto I" },
    { id: 2, nome: "Trajeto II" },
    { id: 3, nome: "Trajeto III" },
  ];

  // Funções placeholder para os botões
  const handleAdicionarRota = () => {
    console.log("Botão ADICIONAR ROTA + clicado");
  };

  const handleInterromperTrajeto = () => {
    console.log("Botão INTERROMPER O TRAJETO X clicado");
  };

  const handleIniciar = () => {
    console.log("Botão INICIAR clicado");
  };

  // Retorna a cor do botão baseado na ação (para rotas de exemplo)
  const getActionColor = (action: string) => {
    if (action === "para frente") return "bg-brand-green";
    if (action === "rotacionar direita") return "bg-brand-blue";
    if (action === "rotacionar esquerda") return "bg-yellow-600";
    return "bg-gray-500";
  };

  // Retorna o ícone da ação (para rotas de exemplo)
  const getActionIcon = (action: string) => {
    if (action === "para frente") return "↑";
    if (action === "rotacionar direita") return "↻";
    if (action === "rotacionar esquerda") return "↺";
    return "";
  };

  return (
    <div className="min-h-screen bg-brand-background p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna Esquerda */}
          <div>
            {/* Seção Testando... (fora da caixa branca) */}
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

            {/* Título Trajeto e Botão Adicionar Rota (fora da caixa) */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-brand-text">Trajeto</h3>
              <button
                onClick={handleAdicionarRota}
                className="bg-brand-blue text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                ADICIONAR ROTA +
              </button>
            </div>

            {/* Painel Esquerdo - Trajeto */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="space-y-2 min-h-[200px] p-4">
                {/* Conteúdo da caixa de trajeto, sem borda e sem texto inicial */}
                {rotasExemplo.map((rota) => (
                      <div
                        key={rota.id}
                        className={`${getActionColor(rota.action)} text-white py-3 px-4 rounded-lg flex items-center justify-between`}
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
                    ))
                }
              </div>
            </div>

            {/* Botão INICIAR (fora da caixa, abaixo do Trajeto) */}
            <button
              onClick={handleIniciar}
              className="w-full bg-brand-green text-white py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              INICIAR
            </button>
          </div>

          {/* Coluna Direita */}
          <div>
            {/* Título Trajetos anteriores (fora da caixa) */}
            <h3 className="text-2xl font-bold text-brand-text mb-4">Trajetos anteriores</h3>
            {/* Painel Direito - Trajetos Anteriores (menor) */}
            <div className="bg-white rounded-lg shadow-lg p-6 h-fit mb-6">
              <div className="space-y-3">
                {trajetosAnterioresExemplo.map((trajeto) => (
                  <div
                    key={trajeto.id}
                    className="bg-[#F6F6F6] rounded-lg p-4 hover:border-brand-blue cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-brand-text">{trajeto.nome}</span>
                      <span className="text-gray-400">›</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botão INTERROMPER O TRAJETO X (fora da caixa, abaixo dos Trajetos Anteriores) */}
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
  );
}
