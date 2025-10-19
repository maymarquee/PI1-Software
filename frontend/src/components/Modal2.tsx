'use client';
import { useState } from 'react';
import styles from './Modal2.module.css';

export default function Modal2() {
    const [value, setValue] = useState('10');
    return (
        <div className={"bg-[#fefefe] w-[881px] h-[270px] rounded-[42px] p-[24px] font-[var(--font-league-spartan)] shadow-[0px_10px_25px_rgba(0,0,0,0.1)] flex flex-col"}>
            <h2 className={"text-[2.4rem] text-[#2c2c2c] font-[300] mb-6"}>Digite o valor</h2>
            <div className={"flex items-center border-2 border-[#007aff] rounded-[17px] p-[22px] bg-[#f8f8f8]"}>
                <input
                    type="number"
                    className={"w-[60px] border-none outline-none bg-transparent font-spartan text-[1.8rem] font-normal text-[#333]"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
                <span className={"text-[1.8rem] font-normal text-[#888] pl-2 whitespace-nowrap"}>| cm</span>
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