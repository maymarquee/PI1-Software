"use client";

import { useState } from 'react';

// Definimos os tipos de props que o modal vai receber
type Modal4Props = {
  onClose: () => void;  // Função para fechar (clicando no 'X' ou 'Cancelar')
  onSkip: () => void;   // Função para "Pular" (salvar sem nome)
  onConfirm: (name: string) => void; // Função para "Salvar" (com nome)
};

export default function Modal4({ onClose, onSkip, onConfirm }: Modal4Props) {
  // Estado local para guardar o nome que o usuário digita
  const [name, setName] = useState('');

  // Função para lidar com o "Salvar".
  // Se o nome estiver vazio, ele age como "Pular".
  // Se tiver nome, ele salva com nome.
  const handleConfirmClick = () => {
    if (name.trim() === '') {
      onSkip();
    } else {
      onConfirm(name);
    }
  };

  return (
    <div className="bg-[#fefefe] w-full max-w-md rounded-[28px] p-6 shadow-lg flex flex-col justify-between min-h-[270px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-[#2c2c2c] font-light">Salvar Trajeto</h2>
        <button onClick={onClose} className="text-xl font-bold text-[#2c2c2c]">X</button>
      </div>
      
      <p className="text-gray-600 mb-2">Dê um nome para este trajeto (opcional):</p>
      
      {/* O campo de input, estilizado como o Modal2 */}
      <div className="flex items-center border-2 border-[#007aff] rounded-xl p-4 bg-[#f8f8f8]">
        <input
          type="text"
          className="w-full border-none outline-none bg-transparent text-lg font-normal text-[#333]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Trajeto 1"
        />
      </div>

      <div className="mt-4 flex justify-center gap-4">
        {/* Botão de Pular (estilo 'cancelar', mas cinza) */}
        <button 
          onClick={onSkip} 
          className="bg-gray-500 w-full py-3 font-light border-none rounded-full text-2xl text-white tracking-wider cursor-pointer"
        >
          Pular
        </button>
        {/* Botão de Salvar (estilo 'confirmar') */}
        <button 
          onClick={handleConfirmClick} 
          className="bg-[#05A00A] w-full py-3 font-light border-none rounded-full text-2xl text-white tracking-wider cursor-pointer"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}