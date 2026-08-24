"use client";
import React, { useState } from "react";
import { useRouter } from "next/router";
import constant from "@/env";
import Modal from "@/components/modal";
import { FiTag } from "react-icons/fi";
import Image from "next/image";
import { shriramimage } from "@/images/Image";

export default function VendorCard({ data, onAddonsClick ,handlePlanSubmit}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPremiumData, setSelectedPremiumData] = useState([]);
  const router = useRouter();
  const handlePremium = () => {
    const premium = data.premiumBackup || {};
    const premiumArray = Object.entries(premium).map(([key, value]) => ({
      label: key,
      amount: value,
    }));
    setSelectedPremiumData(premiumArray);
    setShowModal(true);
  };
  return (
    <>
      <div className="w-full h-full min-h-[310px] bg-white rounded-3xl shadow-xl p-5 relative overflow-hidden hover:transition-transform duration-300 group">
        <div className="flex flex-col items-center text-center gap-3 mt-2">
         
          <div className="w-28 h-25 rounded-xl bg-gradient-to-br from-white via-blue-50 to-white shadow-md border border-blue-100 flex items-center justify-center overflow-hidden hover:shadow-lg transition-all duration-300">
            <Image
              src={shriramimage}
              alt={data.title}
              className="h-auto w-[100%] object-contain"
            />
          </div>

          <h2 className="text-blue-900 font-bold text-lg tracking-wide capitalize">
            {data.title || "Unknown Vendor"}
          </h2>

          <p className="text-gray-600 text-sm">
            Cover Value (IDV):{" "}
            <span className="text-black font-semibold">
              ₹ {data.idv?.toLocaleString() || "-"}
            </span>
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
             onClick={() => handlePlanSubmit(data.route)}
            className="p-6 bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white font-semibold py-2 rounded-xl shadow-lg hover:from-[#2563EB] hover:to-[#0891B2] transition-all duration-300"
          >
            Buy Now – ₹ {data.price?.toLocaleString() || "-"}
          </button>

          <div className="flex justify-center gap-6 text-blue-600 text-sm font-medium mt-1">
            <button
              onClick={() => onAddonsClick(data)}
              className="hover:underline transition"
            >
              Add-ons
            </button>
            <button
              onClick={handlePremium}
              className="hover:underline transition"
            >
              Premium Break-up
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-50 via-white to-transparent rounded-b-3xl blur-[1px] opacity-60 pointer-events-none" />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Premium Backup"
        showConfirmButton={false}
        cancelText="Close"
        width="max-w-5xl"
      >
        {selectedPremiumData?.filter((item) => item.amount !== 0).length > 0 ? ( 
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-h-64 overflow-y-auto pr-1">
            {selectedPremiumData
              .filter((item) => item.amount !== 0) 
              .map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg shadow-sm p-2 hover:shadow-md transition-all"
                >
                  <FiTag className="text-blue-500 mt-1" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {item.label}
                    </p>
                    <span className="inline-block mt-1 text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                      ₹ {item.amount?.toLocaleString() || "-"}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-gray-600 text-sm">No premium backup data found.</p>
        )}
      </Modal>
    </>
  );
}
