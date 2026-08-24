"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import successAnimation from "@/animation/success.json";
import Ribbon from "@/animation/ribbon.json";
import {BikeInsuranceLoader} from "@/components/loader";

export default function ThankYou() {

  const searchParams = useSearchParams();
  const hasRun = useRef(false);

  // Extract policy number
  let policynumber =
    searchParams.get("p_policy_ref") ||
    searchParams.get("policyref") ||
    "";

  console.log("Policy Number =", policynumber);

  // Dummy loading + policyData (since not defined)
  const [loading, setLoading] = useState(false);
  const [policyData, setPolicyData] = useState(true);

  return (
    <div className="min-h-screen bgcolor flex items-center justify-center p-4 sm:p-8">
      {loading ? (
        <div className="text-center text-gray-500 text-lg font-medium">
          <BikeInsuranceLoader />
        </div>
      ) : policyData ? (
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md space-y-6 text-center border border-blue-100">
          <div className="flex justify-center">
            <Lottie
              animationData={successAnimation}
              loop={true}
              autoplay={true}
              className="w-40 h-40"
            />
          </div>

          <div className="relative flex items-center justify-center">
            <Lottie
              animationData={Ribbon}
              loop={true}
              autoplay={true}
              className="absolute w-60 h-60 pointer-events-none"
            />
            <h2 className="text-3xl font-bold text-gray-800 relative z-10">
              Thank You! 🎉
            </h2>
          </div>

          <p className="text-gray-700">
            Your policy has been successfully generated.
          </p>

          <p className="text-md mt-4 mb-3 text-black font-semibold">
            <strong>Policy Number:</strong>
            <br />
            {policynumber || "N/A"}
          </p>

          <a
            href="#"
            className="thmbtn text-white font-semibold py-3 rounded-md flex items-center justify-center gap-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fas fa-download mr-2"></i>
            Download Policy
          </a>
        </div>
      ) : (
        <div className="min-h-screen text-center text-red-500">
          Policy data not found.
        </div>
      )}
    </div>
  );
}
