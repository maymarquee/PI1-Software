
type Modal3Props = {
  displayValue: string;
};

export default function Modal3({ displayValue }: Modal3Props) {
  return (
    <div className={"bg-[#fefefe] w-[881px] h-[270px] rounded-[42px] p-[24px] font-[var(--font-league-spartan)] shadow-[0px_10px_25px_rgba(0,0,0,0.1)] flex flex-col"}>
      <h1 className={"text-[2.4rem] text-[#2c2c2c] font-[300] mb-6"}>Adicionar</h1>
      
      <div className={"bg-[#34c759] flex justify-between font-[var(--font-league-spartan)] items-center py-[12px] px-[24px] rounded-[28px] border-none text-[#FFFFFF] text-[1.8rem] font-normal mb-5"}>
        <span>para frente</span>
        <div className={"flex items-center gap-4"}>
          <button className={"bg-white/90 text-[#333] border border-black/10 rounded-lg w-[90px] p-[5px] text-base font-normal font-[var(--font-league-spartan)] text-center cursor-pointer transition-colors duration-200"}>
            {displayValue} cm
          </button>
          <span className={"text-[2rem] font-[400]"}>↑</span>
        </div>
      </div>
      
      <div className={"mt-auto flex justify-center gap-[16px]"}>
        <button className={"bg-[#FF0000] w-[43%] p-[5px] font-[300] border-none rounded-[72px] font-spartan text-[40px] text-[#FFFFFF] tracking-[4px] cursor-pointer transition-transform duration-100 "}>
          cancelar
        </button>
        <button className={"bg-[#05A00A] w-[43%] p-[5px] font-[300] border-none rounded-[72px] font-spartan text-[40px] text-[#FFFFFF] tracking-[4px] cursor-pointer transition-transform duration-100 "}>
          adicionar
        </button>
      </div>
    </div>
  );
}