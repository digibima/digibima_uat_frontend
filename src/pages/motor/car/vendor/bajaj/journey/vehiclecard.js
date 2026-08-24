"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";

export default function VehicleCard({
  vehicleDetails,
  title,
  icon,
  currentStep = 1,
  onGoToPayment,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isStepFour = currentStep === 4;
  const isJourneyPage = pathname.includes("/motor/car/vendor/bajaj/journey")  ;
  if (!vehicleDetails) return null;

  return (
    <>
     <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
          <span>{title}</span>
          <span className="text-xl">{icon || "🏍️"}</span>
        </h2>
      </div>

      <div className="text-sm text-gray-700 divide-y divide-gray-200">
        {vehicleDetails.city && (
          <div className="flex justify-between py-2">
            <span className="font-medium">RTO City:</span>
            <span className="font-bold text-gray-900">{vehicleDetails.city}</span>
          </div>
        )}
        {vehicleDetails.brand && (
          <div className="flex justify-between py-2">
            <span className="font-medium">Manufacturer:</span>
            <span className="font-bold text-gray-900">{vehicleDetails.brand}</span>
          </div>
        )}
        {vehicleDetails.model && (
          <div className="flex justify-between py-2">
            <span className="font-medium">Model:</span>
            <span className="font-bold text-gray-900">{vehicleDetails.model}</span>
          </div>
        )}
        {vehicleDetails.variant && (
          <div className="flex justify-between py-2">
            <span className="font-medium">Variant:</span>
            <span className="font-bold text-gray-900">{vehicleDetails.variant}</span>
          </div>
        )}
        {vehicleDetails.regyear && (
          <div className="flex justify-between py-2">
            <span className="font-medium">Registration Year:</span>
            <span className="font-bold text-gray-900">{vehicleDetails.regyear}</span>
          </div>
        )}
        {vehicleDetails.regnumber && (
          <div className="flex justify-between py-2">
            <span className="font-medium">Reg. Number:</span>
            <span className="font-bold text-gray-900">{vehicleDetails.regnumber}</span>
          </div>
        )}
        {vehicleDetails.policy_expiry && (
          <div className="flex justify-between py-2">
            <span className="font-medium">Policy Expiry:</span>
            <span
              className={`font-bold ${
                vehicleDetails.policy_expiry.toLowerCase() === "expired"
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
            >
              {vehicleDetails.policy_expiry}
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
    </>
  );
}
