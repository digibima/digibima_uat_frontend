"use client";
import React, { useState } from "react";
import Modal from "@/components/modal";

export default function UpdateIdvModal({
  open,
  onClose,
  value,
  setValue,
  min,
  max,
  onUpdate,
}) {
  const [loading, setLoading] = useState(false);
  

  const handleClick = async () => {
    setLoading(true);
    await onUpdate();
    setLoading(false);
  };

  return (
    <Modal
  isOpen={open}
  onClose={onClose}
  title="Car insured value (IDV)"
  onConfirm={handleClick}
  confirmText={loading ? "Updating..." : "Update"}
  showConfirmButton={!loading}
  width="max-w-md"
  
>
<style jsx>{`
  :global(.hidecls) {
    overflow-y: visible !important;
  }
`}</style>
  <div className="flex flex-col gap-6 mt-4">

    {/* IDV INPUT */}
   <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-3">
  
  <label className="text-sm font-semibold text-gray-700">
    Your IDV
  </label>

  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 font-semibold">
      ₹
    </span>

    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-36 pl-8 pr-3 py-2 text-right font-bold text-gray-800
                 border border-blue-500 rounded-lg bg-white
                 focus:outline-none focus:ring-2 focus:ring-blue-400
                 shadow-sm"
    />
  </div>

</div>


  {/* SIP-STYLE RANGE SLIDER */}
<div>
  {(() => {
    const currentVal = Number(value) || Number(min);
    const minimum = Number(min);
    const maximum = Number(max);
    
    const percentage = maximum > minimum ? ((currentVal - minimum) / (maximum - minimum)) * 100 : 0;

    return (
      <div className="relative h-3 rounded-full bg-gray-200">

        <div
          className="absolute h-3 rounded-full bg-blue-500 transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />

        <div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white
                     border-4 border-blue-500 rounded-full shadow-lg"
          style={{ left: `calc(${percentage}% - 12px)` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          value={value || min} 
          onChange={(e) => setValue(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
    );
  })()}

  <div className="flex justify-between text-xs text-gray-500 mt-2">
    <span>{min}</span>
    <span>{max}</span>
  </div>
</div>

  </div>
</Modal>

  );
}
