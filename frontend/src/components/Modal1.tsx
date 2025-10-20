export default function Modal1() {
  return (
    // Esta é a div principal que será nosso retângulo branco.
    <div className={"bg-[#fefefe] w-[881px] h-[321px] rounded-[42px] p-[24px] font-[var(--font-league-spartan)] shadow-[0px_10px_25px_rgba(0,0,0,0.1)] flex flex-col"}>
      <h1 className={"text-[2.4rem] text-[#2c2c2c] font-[300] mb-6"}>Adicionar</h1>

      <div className={"bg-[#34c759] flex justify-between font-[var(--font-league-spartan)] items-center py-[12px] px-[24px] rounded-[28px] border-none text-[#FFFFFF] text-[1.8rem] font-normal  mb-[20px]"}>
        <span>para frente</span>
        <div className={"flex items-center gap-4"}>
          <button className={"bg-white/90 text-[#333] border border-black/10 rounded-lg w-[90px] p-[10px] text-base font-normal font-[var(--font-league-spartan)] text-center cursor-pointer transition-colors duration-200"}>
            Valor
          </button>
          <span className={"text-[2rem] font-[400]"}>↑</span>
        </div>
      </div>

      <button className={"bg-[#007aff] flex justify-between font-[var(--font-league-spartan)] items-center py-[12px] px-[24px] rounded-[28px] border-none text-[#FFFFFF] text-[1.8rem] font-normal cursor-pointer transition-colors mb-[20px]"}>
        <span>rotacionar direita</span>
        <span className={"text-[2rem] font-[400]"}>↷</span>
      </button>

      <button className={"bg-[#c67c00] flex justify-between font-[var(--font-league-spartan)] items-center py-[12px] px-[24px] rounded-[28px] border-none text-[#FFFFFF] text-[1.8rem] font-normal cursor-pointer transition-colors mb-[20px]"}>
        <span>rotacionar esquerda </span>
        <span className={"text-[2rem] font-[400]"}>↶</span>
      </button>

    </div>
  );
}