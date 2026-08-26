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
  console.log("vehicleDetails", vehicleDetails);
  const router = useRouter();
  const pathname = usePathname();

  const isStepFour = currentStep === 4;
  const isJourneyPage =
    pathname.includes("/motor/car/vendor/shriram/journey") ||
    pathname.includes("/motor/bike/vendor/shriram/journey");

  // Check agar current page car ka hai
  const isCar = pathname.includes("/car");

  if (!vehicleDetails) return null;

  // Key ko automated Capital/Clean text mein convert karne ke liye function (No hardcoded keys)
  const formatKeyName = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Safe Value Helper: missing/empty hone par "--" return karega
  const getValue = (val) => {
    if (val === null || val === undefined || String(val).trim() === "") {
      return "--";
    }
    return String(val);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
          <span>{title}</span>
          <span className="text-xl">{icon || "🏍️"}</span>
        </h2>
      </div>

      <div className="text-sm text-gray-700 divide-y divide-gray-200">
        {isCar ? (
          /* CAR KE CASE MEIN: Peera object dynamic loop ho kar saare key-value print honge */
          Object.entries(vehicleDetails).map(([key, val]) => (
            <div key={key} className="flex justify-between py-2 gap-4">
              <span className="font-medium text-gray-600">
                {formatKeyName(key)}:
              </span>
              <span
                className={`font-bold text-right ${
                  key === "policy_expiry" &&
                  String(val).toLowerCase() === "expired"
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                {getValue(val)}
              </span>
            </div>
          ))
        ) : (
          /* BIKE / OTHER CASES MEIN: Specific Standard Fields */
          <>
            <div className="flex justify-between py-2">
              <span className="font-medium">RTO City:</span>
              <span className="font-bold text-gray-900">
                {getValue(vehicleDetails.city)}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="font-medium">Manufacturer:</span>
              <span className="font-bold text-gray-900">
                {getValue(vehicleDetails.brand)}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="font-medium">Model:</span>
              <span className="font-bold text-gray-900">
                {getValue(vehicleDetails.model)}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="font-medium">Variant:</span>
              <span className="font-bold text-gray-900">
                {getValue(vehicleDetails.variant)}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="font-medium">Registration Year:</span>
              <span className="font-bold text-gray-900">
                {getValue(vehicleDetails.regyear)}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="font-medium">Reg. Number:</span>
              <span className="font-bold text-gray-900">
                {getValue(vehicleDetails.regnumber)}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="font-medium">Policy Expiry:</span>
              <span
                className={`font-bold ${
                  vehicleDetails.policy_expiry?.toLowerCase() === "expired"
                    ? "text-red-600"
                    : "text-gray-900"
                }`}
              >
                {getValue(vehicleDetails.policy_expiry)}
              </span>
            </div>
          </>
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