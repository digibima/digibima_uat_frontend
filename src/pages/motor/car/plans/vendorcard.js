"use client";
import React, { useState } from "react";
import Modal from "@/components/modal";
import {
  FiTag,
  FiShield,
  FiSettings,
  FiXCircle,
} from "react-icons/fi";
import { MdOutlineReceiptLong } from "react-icons/md";
import Image from "next/image";
import constant from "@/env";

export default function VendorCard({
  data,
  onAddonsClick,
  handlePlanSubmit,
  compared = false,
  disableCompare = false,
  onCompareChange = () => {},
  showCompare = true,
}) {
  console.log("data",data)
  const [showModal, setShowModal] = useState(false);
  const [selectedPremiumData, setSelectedPremiumData] = useState([]);
  const [showAllUnavailable, setShowAllUnavailable] = useState(false);

  const parseToValidNumber = (val) => {
    if (!val) return 0;
    if (typeof val === "number") return val;
    const sanitized = String(val).replace(/[^0-9.]/g, "");
    return Number(sanitized) || 0;
  };

  const displayTitle = data?.title || data?.productName || data?.productname || data?.vendorname || "Insurance Plan";
  const displayIdv = parseToValidNumber(data?.idv || data?.selectedvalue);
  const displayPrice = parseToValidNumber(data?.price || data?.premium);

  const handlePremium = () => {
    const premiumObj = data?.premiumBackup || data?.premium_breakup || data?.premium || {};
    
    let premiumArray = [];
    if (typeof premiumObj === "object" && premiumObj !== null) {
      premiumArray = Object.entries(premiumObj)
        .filter(([_, val]) => parseToValidNumber(val) !== 0)
        .map(([key, value]) => {
          const cleanLabel = key.replace(/_/g, " ").replace(/^\s+|\s+$/g, "").replace(/^-/, "");
          return {
            label: cleanLabel,
            amount: parseToValidNumber(value),
          };
        });
    } else {
      premiumArray = [{ label: "Net Premium", amount: parseToValidNumber(premiumObj) }];
    }
    
    setSelectedPremiumData(premiumArray);
    setShowModal(true);
  };

  const UNAVAILABLE_ADDONS = [
    "Zero Depreciation",
    "Engine Protect",
    "Roadside Assistance",
    "Consumables Cover",
    "Key Replacement",
  ];

  const compareId = `compare-${String(data?.vendorId ?? data?.vid ?? data?.vendorid ?? displayTitle)
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

  return (
    <>
      {/* Card Body Container */}
      <div className="bg-white border border-[#E8ECF3] rounded-[22px] shadow-[0_4px_14px_rgba(15,23,42,0.06)] px-6 py-6 w-full">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
          {/* LEFT SECTION */}
          <div className="flex items-center gap-8 flex-1">
            <div className="w-[90px] h-[90px] rounded-xl border border-[#EEF2F7] bg-white flex items-center justify-center shrink-0 overflow-hidden self-center">
              {data?.logo ? (
                <Image
                  src={`${constant.BASE_URL}/front/logo/${data.logo}`}
                  alt={displayTitle}
                  width={82}
                  height={82}
                  className="object-contain scale-110 p-1"
                />
              ) : (
                <div className="text-[10px] text-gray-400 font-bold uppercase text-center p-1">
                  {displayTitle.substring(0, 10)}
                </div>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-[18px] font-bold text-[#1E293B] leading-none">
                {displayTitle}
              </h2>

              <div className="flex mt-2 text-[14px] text-[#475569] font-medium">
                IDV :
                <span className="font-bold text-[#111827] ml-1">
                  {displayIdv ? `₹ ${displayIdv.toLocaleString("en-IN")}` : "-"}
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => onAddonsClick && onAddonsClick(data)}
                  className="text-[#4478F9] font-semibold text-[13px] hover:underline"
                >
                  <span className="flex items-center gap-1">
                    <FiSettings size={14} />
                    Add-ons
                  </span>
                </button>

                <div className="w-px h-3 bg-[#D8DEE9]" />

                <button
                  type="button"
                  onClick={handlePremium}
                  className="text-[#4478F9] font-semibold text-[13px] hover:underline"
                >
                  <span className="flex items-center gap-1">
                    <MdOutlineReceiptLong size={14} />
                    Premium Break-up
                  </span>
                </button>
              </div>

              {showCompare && (
                <div className="flex justify-start items-center gap-2 mt-3">
                  <input
                    id={compareId}
                    type="checkbox"
                    checked={!!compared}
                    disabled={disableCompare && !compared}
                    onChange={(e) => onCompareChange(e.target.checked)}
                    className="form-checkbox accent-pink-500 h-4 w-4 rounded border border-gray-300 cursor-pointer"
                  />
                  <label
                    htmlFor={compareId}
                    className="text-[#14213D] text-[14px] cursor-pointer"
                  >
                    Compare Plan
                  </label>
                </div>
              )}

              <div className="mt-4">
                <h4 className="text-[14px] font-semibold text-[#374151] mb-2">
                  What’s not included
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(showAllUnavailable ? UNAVAILABLE_ADDONS : UNAVAILABLE_ADDONS.slice(0, 4)).map((addon, idx) => (
                    <span
                      key={idx}
                      className="bg-[#FFF4F4] text-[#C75C5C] border border-[#FAD6D6] rounded-md px-3 py-1 text-[11px] font-medium"
                    >
                      <span className="flex items-center gap-1">
                        <FiXCircle size={12} className="text-[#D64545]" />
                        {addon}
                      </span>
                    </span>
                  ))}
                  {UNAVAILABLE_ADDONS.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setShowAllUnavailable(!showAllUnavailable)}
                      className="bg-[#F4F8FF] text-[#4478F9] rounded-md px-3 py-1 text-[11px] font-semibold hover:bg-blue-100 transition-colors"
                    >
                      {showAllUnavailable ? "View Less" : `+ View More (${UNAVAILABLE_ADDONS.length - 4})`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE BUTTON ACTION */}
          <div className="w-full lg:w-[220px] shrink-0 flex flex-col justify-center">
            <div className="w-full max-w-[220px] mx-auto">
              <button
                type="button"
                onClick={() => handlePlanSubmit && handlePlanSubmit(data?.route || data?.journey_url)}
                className="w-full rounded-t-[16px] rounded-b-none bg-gradient-to-r from-[#3D7AF7] via-[#2F8AF7] to-[#11C7D9] shadow-[0_10px_18px_rgba(0,0,0,0.10)] transition-all duration-200 hover:scale-[1.01]"
              >
                <div className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-white">
                    <FiShield size={17} className="opacity-95 text-white" />
                    <span className="text-[14px] font-medium">Buy Now</span>
                  </div>
                  <div className="mt-2 text-white text-[22px] font-bold tracking-tight">
                    ₹ {displayPrice ? displayPrice.toLocaleString("en-IN") : "-"}
                  </div>
                </div>
              </button>
              <div className="bg-white rounded-b-[16px] border border-[#EEF2F7] border-t-0 text-center py-3 text-[#7C8797] text-[12px] font-medium shadow-[0_8px_18px_rgba(0,0,0,0.05)]">
                Inclusive of all taxes
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Premium Breakdown"
        showConfirmButton={false}
        cancelText="Close"
        width="max-w-5xl"
      >
        {selectedPremiumData?.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-h-64 overflow-y-auto pr-1">
            {selectedPremiumData.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg shadow-sm p-2 hover:shadow-md transition-all"
              >
                <FiTag className="text-blue-500 mt-1" size={20} />
                <div>
                  <p className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                    {item.label}
                  </p>
                  <span className="inline-block mt-1 text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                    ₹ {item.amount?.toLocaleString("en-IN") || "-"}
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