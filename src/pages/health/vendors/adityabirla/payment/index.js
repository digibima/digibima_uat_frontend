"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FaRegCreditCard } from "react-icons/fa";
import Lottie from "lottie-react";
import handShake from "@/animation/policygenerate.json";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const paymentUrl = searchParams.get("paymentUrl");
  



  const handlePaymentClick = () => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    }
  };
const policyNumber = searchParams.get("policyNumber");
const isUnderwriting =
  policyNumber !== null && !policyNumber.trim();
if (isUnderwriting) {
  console.log("policyNumber",isUnderwriting)
  return (
    <div className="min-h-screen bg-[#C8EDFE] flex items-center justify-center sm:p-8">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <div className="flex justify-center">
          <Lottie
            animationData={handShake}
            loop
            className="h-40 w-40 md:h-52 md:w-52 lg:h-64 lg:w-64"
          />
        </div>

        <h2 className="text-2xl font-bold text-green-600">
          Thank You!
        </h2>

        <p className="text-gray-700 mt-4">
          Your payment has been successfully received.
        </p>

        <p className="text-sm text-gray-600 mt-2">
          Your policy is currently under underwriting review.
          Once the review is completed, your policy document
          will be issued and shared with you.
        </p>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            Policy Status: <strong>Underwriting in Progress</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-[#C8EDFE] flex items-center justify-center sm:p-8">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        
        <div className="flex justify-center">
          <Lottie
            animationData={handShake}
            loop
            className="h-40 w-40 md:h-52 md:w-52 lg:h-64 lg:w-64"
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-800">
          Redirecting to Payment
        </h2>

        <p className="text-sm text-gray-600 py-3">
          Please wait while we securely redirect you to the payment gateway.
          If it doesn’t happen automatically, click the button below.
        </p>

        {/* ✅ NEW BUTTON */}
        <button
          onClick={handlePaymentClick}
          className="w-full bg-[#7998F4] text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-purple-600 transition"
        >
          <FaRegCreditCard className="text-lg" />
          Proceed to Payment
        </button>

      </div>
    </div>
  );
}