"use client";

import React, { useEffect, useState } from "react";
import { FaRegCreditCard } from "react-icons/fa";
import Lottie from "lottie-react";
import handShake from "@/animation/policygenerate.json";
import { showError } from "@/layouts/toaster";
import { CallApi } from "@/api";
import { useSearchParams } from "next/navigation";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const proposalNumber = searchParams.get("proposalNumber");

  const [amount, setAmont] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await CallApi(
          "/api/motor-car-zuno/payment",
          "POST",
          {}
        );

        setPaymentData(response?.data);
        setAmont(response?.nPremium);
      } catch (err) {
        console.error("Payment API Error:", err);
        showError("Failed to generate payment link.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, []);

  const handlePayment = () => {
    const paymentLink = paymentData?.data?.paymentLink;

    if (paymentLink) {
      setRedirecting(true);
      window.location.href = paymentLink;
    } else {
      showError("Payment link not generated.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bgcolor flex items-center justify-center p-6">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-blue-100 animate-pulse">
          <div className="h-40 w-full bg-gray-200 rounded-xl mb-6"></div>
          <div className="h-6 bg-gray-200 rounded-md w-2/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded-md w-3/4 mx-auto mb-3"></div>
          <div className="h-4 bg-gray-200 rounded-md w-5/6 mx-auto mb-6"></div>
          <div className="h-12 bg-gray-300 rounded-full w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bgcolor flex items-center justify-center sm:p-8">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md text-center border border-blue-100">

        <div className="flex justify-center">
          <Lottie
            animationData={handShake}
            loop
            className="h-40 w-40 md:h-52 md:w-52 lg:h-64 lg:w-64"
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-800">
          Proposal:{" "}
          <span className="text-indigo-600">{proposalNumber || "N/A"}</span>
        </h2>

         <p className="text-lg font-semibold text-gray-700 mt-3">
          Premium Amount:{" "}
          <span className="text-green-600">
            ₹{amount || "0.00"}
          </span>
        </p>

        <p className="text-sm text-gray-600 py-3">
          Click below to continue to secure payment gateway.
        </p>
        <button
          onClick={handlePayment}
          disabled={redirecting}
          className="w-full thmbtn text-white font-semibold py-3 rounded-md flex items-center justify-center gap-2"
        >
          <FaRegCreditCard className="text-lg" />
          {redirecting ? "Redirecting..." : "Proceed To Pay"}
        </button>
      </div>
    </div>
  );
}
