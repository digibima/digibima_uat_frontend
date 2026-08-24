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
    await onUpdate(); // run the passed function from parent
    setLoading(false);
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Bike insured value (IDV)"
      onConfirm={handleClick}
      confirmText={loading ? "Updating..." : "Update"}
      showConfirmButton={!loading}
      width="max-w-md"
    >
      <div className="flex flex-col gap-6 mt-4">
        <div className="flex items-center gap-3">
          <label className="font-medium">Your IDV:</label>
          <input
            type="text"
            className="border border-blue-600 rounded px-3 py-1 w-32"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <div>
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer mt-2 bg-gradient-to-r from-blue-600 to-violet-300"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
