"use client";
import React from "react";

export default function CarDetailsCard({ vehicleDetails = {} }) {
  const {
    city,
    brand,
    model,
    variant,
    regyear,
    policy_expiry,
  } = vehicleDetails;

  const carDetails = [
    { label: "RTO City", value: city },
    { label: "Manufacturer", value: brand },
    { label: "Model", value: model },
    { label: "Variant", value: variant },
    { label: "Registration Year", value: regyear },
    { label: "Policy Expiry", value: policy_expiry },
  ];

  return (
    <div className="w-full lg:w-1/4 bg-white shadow-lg border p-4 rounded-xl">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Private Car</h2>
      <div className="text-sm space-y-2">
        {carDetails.map(
          ({ label, value }, i) =>
            value && (
              <div
                key={i}
                className="flex justify-between border-b border-gray-200 p-2"
              >
                <span className="font-medium">{label}:</span>
                <span className="text-gray-700 font-semibold">{value}</span>
              </div>
            )
        )}
      </div>
    </div>
  );
}
