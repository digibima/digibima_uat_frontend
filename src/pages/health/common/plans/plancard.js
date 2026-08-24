"use client";
import Image from "next/image";
import React, { useState } from "react";
import { FiArrowRight, FiSettings, FiList } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import { HiCheckCircle } from "react-icons/hi";
import Modal from "@/components/modal";
import constant from "../../../../env";
import { useRouter } from "next/navigation"; 
import {
  FiTag,
  FiShield,
  FiFileText,
  FiHeadphones,
  FiXCircle,
} from "react-icons/fi";

const PlanCard = ({
  plan = {}, 
  allPlans = [],
  handlePlanSubmit,
  disableCompare = false,
  onCompareChange = () => {},
  compared = false,
}) => {
  console.log("Rendering individual card plan context:", plan);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const { logo = "", productname = "—", coverage = "", premium = "" } = plan;

  const yearlyPremiumNumber = Number(
    String(premium ?? "")
      .replace(/,/g, "")
  );

  const monthlyPremium = Math.round(
    (yearlyPremiumNumber || 0) / 12
  ).toLocaleString("en-IN");

  const displayCoverage =
    coverage === 100 || coverage === "100"
      ? "1 Cr"
      : coverage === "Unlimited" || coverage === "unlimited"
      ? "Unlimited"
      : `${coverage} Lakh`;

  const compareId = `compare-${String(productname || "")
    .toLowerCase()
    .replace(/\s+/g, "-")}-${String(coverage || "")}`;

  return (
    <div>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`${productname} Add-ons`}
        width="max-w-3xl"
        height="max-h-[70vh]"
        showConfirmButton={false}
        confirmText="Yes, Delete"
        cancelText="No, Cancel"
      >
        <div className="space-y-2 text-sm text-gray-700">
          <p className="font-semibold text-base text-blue-900">
            Available Add-ons:
          </p>
          {Array.isArray(plan?.addons) && plan.addons.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {plan.addons.map((addon, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 bg-blue-50 text-blue-900 px-4 py-2 rounded-md shadow hover:bg-blue-100 transition"
                >
                  <HiCheckCircle className="text-green-600 mt-1 text-lg" />
                  <span className="text-sm font-medium">{addon}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No add-ons available.</p>
          )}
        </div>
      </Modal>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handlePlanSubmit(plan);
        }}
        className="bg-white rounded-[30px] border border-blue-100 shadow-md p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 hover:shadow-xl transition-all duration-300 w-full"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-3/4 flex-wrap">
          
          <div className="w-28 h-20 rounded-xl bg-white shadow-md border border-blue-100 flex items-center justify-center overflow-hidden relative">
            {logo ? (
              <Image
                src={`${constant.BASE_URL}/front/logo/${logo}`}
                alt={productname}
                width={80}
                height={40}
                className="object-contain" // FIXED: logos distort nahi honge contain use karne se
              />
            ) : (
              <span className="text-xs text-blue-700 font-semibold">
                No Logo
              </span>
            )}
          </div>

          <div className="text-left">
            <h3 className="text-lg font-bold text-blue-900 mb-1 uppercase tracking-wide break-words">
              {productname}
            </h3>
            
            <div className="flex gap-2 text-sm text-indigo-600">
              <span
                className="hover:underline cursor-pointer flex items-center gap-1"
                onClick={() => setShowModal(true)}
              >
                <FiSettings size={14} />
                Addons
              </span>

              <span className="text-gray-400">|</span>

              <span
                className="hover:underline cursor-pointer flex items-center gap-1"
                onClick={() => router.push("/health/common/plans/plans-feature")}
              >
                <FiList size={14} />
                View Features
              </span>
            </div>

            {allPlans.length > 1 && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  id={compareId}
                  type="checkbox"
                  className="form-checkbox accent-pink-500 h-4 w-4 rounded border border-gray-300"
                  checked={!!compared}
                  disabled={disableCompare && !compared}
                  onChange={(e) => onCompareChange(plan, e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Compare this plan"
                />
                <label
                  htmlFor={compareId}
                  className={`text-sm labelcls select-none ${
                    disableCompare && !compared
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 cursor-pointer"
                  }`}
                  onClick={(e) => {
                    if (disableCompare && !compared) e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  Compare
                </label>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start sm:items-center sm:ml-auto">
            <span className="text-xs text-gray-500 font-semibold">Cover</span>
            <span className="bg-gradient-to-r from-sky-100 to-sky-50 text-blue-800 font-semibold text-sm px-4 py-1.5 rounded-full shadow mt-1 whitespace-nowrap">
              {displayCoverage}
            </span>
          </div>
        </div>

        <div className="w-full sm:w-auto text-left sm:text-right">
          <button
            type="submit"
            className="px-6 py-2 text-sm flex items-center justify-center thmbtn w-full sm:w-auto"
          >
            <span className="flex items-center whitespace-nowrap">
              <FaRupeeSign className="text-sm mr-1" />
              {monthlyPremium} / month
            </span>
            <FiArrowRight className="ml-1" />
          </button>
          
          <div className="text-sm flex items-center justify-center sm:justify-center text-gray-500 mt-1 italic gap-1">
            <FaRupeeSign className="text-xs" />
            {premium}/Year
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlanCard;