"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FaRegCreditCard } from "react-icons/fa";
import Lottie from "lottie-react";
import handShake from "@/animation/policygenerate.json";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const paymentUrl = searchParams.get("paymentUrl");

  // useEffect(() => {
  //   if (paymentUrl) {
  //     const timer = setTimeout(() => {
  //       window.location.href = paymentUrl;
  //     }, 1500);

  //     return () => clearTimeout(timer);
  //   }
  // }, [paymentUrl]);

  const handlePaymentClick = () => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    }
  };

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