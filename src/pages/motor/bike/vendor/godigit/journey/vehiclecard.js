"use client";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function VehicleCard({
  vehicleDetails,
  title,
  icon,
  currentStep = 1,
  onGoToPayment,
  kycError,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isStepFour = currentStep === 4;
  const isJourneyPage = pathname.includes("/motor/bike/vendor/godigit/journey");



  if (!vehicleDetails) return null;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
          <span>{title}</span>
          <span className="text-xl">{icon || "🏍️"}</span>
        </h2>
      </div>

      {/* Vehicle Details */}
      <div className="text-sm text-gray-700 divide-y divide-gray-200">
        {vehicleDetails.city && (
          <Info label="RTO City" value={vehicleDetails.city} />
        )}
        {vehicleDetails.brand && (
          <Info label="Manufacturer" value={vehicleDetails.brand} />
        )}
        {vehicleDetails.model && (
          <Info label="Model" value={vehicleDetails.model} />
        )}
        {vehicleDetails.variant && (
          <Info label="Variant" value={vehicleDetails.variant} />
        )}
        {vehicleDetails.regyear && (
          <Info label="Registration Year" value={vehicleDetails.regyear} />
        )}
        {vehicleDetails.regnumber && (
          <Info label="Reg. Number" value={vehicleDetails.regnumber} />
        )}
        {vehicleDetails.policy_expiry && (
          <Info
            label="Policy Expiry"
            value={vehicleDetails.policy_expiry}
            highlightRed={
              vehicleDetails.policy_expiry.toLowerCase() === "expired"
            }
          />
        )}
      </div>


      {isStepFour && kycError?.kycVerificationStatus === "NOT_DONE" && (
        <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded-xl">
          <h3 className="text-red-700 font-semibold">KYC Required</h3>

          <p className="text-sm text-red-600 mt-1">
            {kycError?.kycReason || "Please complete your KYC to proceed."}
          </p>

          {kycError?.link && (
            <a
              href={kycError.link}
             
              className="block mt-3 text-blue-600 underline font-medium"
            >
              👉 Click here to complete your KYC
            </a>
          )}

          <p className="text-sm text-gray-700 mt-2">
            Please click the link above and complete your KYC. You will be able
            to proceed with the payment only after completing it.
          </p>
        </div>
      )}

      {/* Payment Button */}
      {isJourneyPage && isStepFour && (
        <button
          onClick={onGoToPayment}

          className={`w-full mt-4 py-2 flex items-center justify-center gap-2 thmbtn}`}
        >
         Go to Payment
        </button>
      )}
    </>
  );
}

function Info({ label, value, highlightRed = false }) {
  return (
    <div className="flex justify-between py-2">
      <span className="font-medium">{label}:</span>
      <span
        className={`font-bold ${
          highlightRed ? "text-red-600" : "text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
