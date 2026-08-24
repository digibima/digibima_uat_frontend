"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";

export default function VehicleCard({ vehicledetails, title, currentStep = 1,onGoToPayment, }) {
   const router = useRouter();
  const pathname = usePathname();
  const isStepFour = currentStep === 4;
  const isJourneyPage = pathname.includes("/motor/car/vendor/shriram/journey");
  if (!vehicledetails) return null;

  return (
    <div className="w-full lg:w-[415px] bg-white rounded-2xl shadow-sm p-6 text-sm self-start">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
          <span>{title}</span>
          <span className="text-xl">🏍️</span>
        </h2>
      </div>

      <div className="text-sm text-gray-700 divide-y divide-gray-200">
        <div className="flex justify-between py-2">
          <span className="font-medium">RTO City:</span>
          <span className="font-bold text-gray-900">{vehicledetails.city}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="font-medium">Manufacturer:</span>
          <span className="font-bold text-gray-900">{vehicledetails.brand}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="font-medium">Model:</span>
          <span className="font-bold text-gray-900">{vehicledetails.model}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="font-medium">Variant:</span>
          <span className="font-bold text-gray-900">{vehicledetails.variant}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="font-medium">Registration Year:</span>
          <span className="font-bold text-gray-900">{vehicledetails.regyear}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="font-medium">Reg. Number:</span>
          <span className="font-bold text-gray-900">{vehicledetails.regnumber}</span>
        </div>
        {vehicledetails.policy_expiry && (
            <div className="flex justify-between py-2">
                <span className="font-medium">Policy Expiry:</span>
                <span
                className={`font-bold ${
                    vehicledetails.policy_expiry?.toLowerCase() === "expired"
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
                >
                {vehicledetails.policy_expiry}
                </span>
            </div>
            )}

      </div>
      
      {isJourneyPage && isStepFour && (
        <button
          onClick={onGoToPayment}
          className="w-full mt-4 py-2 flex items-center justify-center gap-2 thmbtn"
        >
          Go to Payment
        </button>
      )}
    </div>
  );
}
