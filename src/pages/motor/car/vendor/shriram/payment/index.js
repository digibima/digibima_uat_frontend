"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { FaRegCreditCard } from "react-icons/fa";
import Lottie from "lottie-react";
import handShake from "@/animation/policygenerate.json";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const proposalNumber = searchParams.get("proposalNumber");
  const sProdCode = searchParams.get("productcode");
  const nQuoteId = searchParams.get("polSysId");
  const nPremium = searchParams.get("premium");
  const returnURL = "https://stage.digibima.com/return/api/shriramcarthankyou.php";
  //const gatewayURL = "http://novaapi.shriramgi.com/Novapymt/MyDefaultCC.aspx";
  const gatewayURL = "http://novaapiuat.shriramgi.com/uatnovapymt/MyDefaultCC.aspx";
  // http://novaapi.shriramgi.com/Novapymt/MyDefaultCC.aspx
  //const gatewayURL = "https://www.google.com/";
  const gateway = "CCAVENUE";

  return (
    <div className="min-h-screen bgcolor flex items-center justify-center sm:p-8">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md  text-center border border-blue-100">
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
          Thank you for choosing us for your motor insurance needs. After your
          payment is processed, you&apos;ll receive a confirmation email with your
          policy details.
        </p>

        {/* Token Input (optional/future use) */}
        <input
          type="hidden"
          name="token"
          className="w-full border border-gray-300 p-3 rounded-md"
        />
        <form action={gatewayURL} method="POST" className="space-y-4">
          <input name="createdBy" value="LC331" readOnly className="hidden" />
          <input type="hidden" name="paymentFrom" value={gateway} />
          <input type="hidden" name="prodCode" value={sProdCode} />
          <input type="hidden" name="QuoteId" value={nQuoteId} />
          <input type="hidden" name="amount" value={nPremium} />
          <input type="hidden" name="sourceUrl" value={returnURL} />
          <input type="hidden" name="DbFrom" value="NOVA" />
          <input type="hidden" name="application" value="DigibimaIns" />
          <input type="hidden" name="prodName" value={sProdCode} />

          <button
            type="submit"
            className="w-full thmbtn text-white font-semibold py-3 rounded-md flex items-center justify-center gap-2 "
          >
            <FaRegCreditCard className="text-lg" />
            Pay ₹{nPremium || "-"} Now
          </button>
        </form>
      </div>
    </div>
  );
}
