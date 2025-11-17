'use client';
import { useState } from 'react';

type Modal2Props = {
  initialValue?: string;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: (value: string) => void;
};

export default function Modal2({ initialValue = '10', onClose, onCancel, onConfirm }: Modal2Props) {
    const [value, setValue] = useState(initialValue);
    return (
        <div className="bg-[#fefefe] w-full max-w-md rounded-[28px] p-6 shadow-lg flex flex-col justify-between min-h-[270px]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl text-[#2c2c2c] font-light">Digite o valor</h2>
                <button onClick={onClose} className="text-xl font-bold text-[#2c2c2c]">X</button>
            </div>
            <div className="flex items-center border-2 border-[#007aff] rounded-xl p-4 bg-[#f8f8f8]">
                <input
                    type="number"
                    className="w-full border-none outline-none bg-transparent text-lg font-normal text-[#333]"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
                <span className="text-lg font-normal text-[#888] pl-2 whitespace-nowrap">cm</span>
            </div>

            <div className="mt-4 flex justify-center gap-4">
                <button onClick={onCancel} className="bg-[#FF0000] w-full py-3 font-light border-none rounded-full text-2xl text-white tracking-wider cursor-pointer">
                    cancelar
                </button>
                <button onClick={() => onConfirm(value)} className="bg-[#05A00A] w-full py-3 font-light border-none rounded-full text-2xl text-white tracking-wider cursor-pointer">
                    adicionar
                </button>
            </div>
        </div>
  );
}
