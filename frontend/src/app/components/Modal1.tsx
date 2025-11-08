type Modal1Props = {
  onOpenValue: () => void;
  onClose: () => void;
  onAddRotateRight: () => void;
  onAddRotateLeft: () => void;
};

export default function Modal1({ onOpenValue, onClose, onAddRotateRight, onAddRotateLeft }: Modal1Props) {
  return (
    <div className="bg-[#fefefe] w-full max-w-md rounded-[28px] p-6 shadow-lg flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl text-[#2c2c2c] font-light">Adicionar</h1>
        <button onClick={onClose} className="text-xl font-bold text-[#2c2c2c]">X</button>
      </div>

      <div className="bg-[#2AB907] flex justify-between items-center py-3 px-5 rounded-2xl text-white text-lg font-normal">
        <span>para frente</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenValue}
            className="bg-white/90 text-[#333] border border-black/10 rounded-lg px-4 py-2 text-sm font-normal text-center cursor-pointer"
          >
            Valor
          </button>
          <span className="text-2xl font-normal">↑</span>
        </div>
      </div>

      <button onClick={onAddRotateRight} className="bg-[#007aff] flex justify-between items-center py-3 px-5 rounded-2xl text-white text-lg font-normal cursor-pointer">
        <span>rotacionar direita</span>
        <span className="text-2xl font-normal">↷</span>
      </button>

      <button onClick={onAddRotateLeft} className="bg-[#c67c00] flex justify-between items-center py-3 px-5 rounded-2xl text-white text-lg font-normal cursor-pointer">
        <span>rotacionar esquerda</span>
        <span className="text-2xl font-normal">↶</span>
      </button>
    </div>
  );
}
