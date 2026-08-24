"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { FaRegCreditCard } from "react-icons/fa";
import Lottie from "lottie-react";
import handShake from "@/animation/policygenerate.json";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const proposalNumber = searchParams.get("proposalNumber");
  const proposalEncode = searchParams.get("proposalEncode");
    const returnURL = searchParams.get("returnURL");
  const gatewayURL = searchParams.get("gatewayURL");
  const guId = searchParams.get("guid");
  // const returnURL = "https://stage.digibima.com/return/api/carethankyou.php";
  // const gatewayURL = "https://apiuat.careinsurance.com/portalui/PortalPaymentV2.run";

  // Temporary static CSRF — in real case fetch from API
  const csrfToken = "491F8765-7AE0-4484-84D7-18132A6B637B";

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
          Proposal:{" "}
          <span className="text-indigo-600">{proposalNumber || "N/A"}</span>
        </h2>
        <p className="text-sm text-gray-600 py-3">
          Thank you for choosing us for your health insurance needs. After your
          payment is processed, you&apos;ll receive a confirmation email with all
          policy details.
        </p>

        <form action={gatewayURL} method="POST" name="PAYMENTFORM" className="space-y-4">
          <input type="hidden" name="CSRF" value={guId} />
          <input type="hidden" name="proposalNum" value={proposalEncode} />
          <input type="hidden" name="source" value="PARTNER" />
          <input type="hidden" name="returnURL" value={returnURL} />

          <button
            type="submit"
            className="w-full bg-[#7998F4] text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-purple-600 transition"
          >
            <FaRegCreditCard className="text-lg" />
            Payment
          </button>
        </form>
      </div>
    </div>
  );
}
