import React from "react";

const STEPS = [
  "Family Members",
  "Health Details",
  "Choose Plan",
  "Add-ons",
  "Proposal & KYC",
  "Payment & Policy",
];

export default function StepTracker({ currentStep = 1 }) {
  return (
    <div className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;

          const isDone = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div
              key={step}
              className="flex items-center gap-2 min-w-fit"
            >
              {/* STEP CIRCLE */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  ${
                    isDone
                      ? "bg-green-500 text-white"
                      : isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
              >
                {isDone ? "✓" : stepNumber}
              </div>

              {/* STEP LABEL */}
              <span
                className={`text-sm whitespace-nowrap
                  ${
                    isActive
                      ? "text-blue-600 font-medium"
                      : "text-gray-600"
                  }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
