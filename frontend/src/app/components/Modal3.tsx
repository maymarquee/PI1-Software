import { useState } from 'react';
import { executarTrajeto, ExecutarTrajetoDto } from '@/services/carrinhoService'; 

type Modal3Props = {
  displayValue: string;
  onClose: () => void;
  onCancel: () => void;
  onConfirm?: () => void;
};

export default function Modal3({ displayValue, onClose, onCancel, onConfirm }: Modal3Props) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
  setLoading(true);
  try {
    const trajeto: ExecutarTrajetoDto = {
      comandos: [
        {
          acao: 'frente',
          direcao: null,
          distancia: Number(displayValue),
        },
      ],
    };

    const resposta = await executarTrajeto(trajeto);
    console.log('✅ Resposta do backend:', resposta);
    alert('Comando enviado com sucesso!');
    onConfirm?.();
    onClose();
    } catch (error) {
      console.error('❌ Erro ao enviar comando:', error);
      alert('Falha ao enviar comando para o carrinho.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#fefefe] w-full max-w-md rounded-[28px] p-6 shadow-lg flex flex-col justify-between min-h-[270px]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl text-[#2c2c2c] font-light">Adicionar</h1>
        <button onClick={onClose} className="text-xl font-bold text-[#2c2c2c]">X</button>
      </div>

      <div className="bg-[#2AB907] flex justify-between items-center py-3 px-5 rounded-2xl text-white text-lg font-normal">
        <span>para frente</span>
        <div className="flex items-center gap-2">
          <button className="bg-white/90 text-[#333] border border-black/10 rounded-lg px-4 py-2 text-sm font-normal text-center">
            {displayValue} cm
          </button>
          <span className="text-2xl font-normal">↑</span>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={onCancel}
          className="bg-[#FF0000] w-full py-3 font-light border-none rounded-full text-2xl text-white tracking-wider cursor-pointer"
        >
          cancelar
        </button>

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="bg-[#05A00A] w-full py-3 font-light border-none rounded-full text-2xl text-white tracking-wider cursor-pointer disabled:opacity-60"
        >
          {loading ? 'Enviando...' : 'adicionar'}
        </button>
      </div>
    </div>
  );
}
