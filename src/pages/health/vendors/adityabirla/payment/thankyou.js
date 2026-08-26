"use client";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { CallApi } from "@/api";
import { HealthLoaderOne } from "@/components/loader";
import { showError } from "@/layouts/toaster";
import Lottie from "lottie-react";
import successAnimation from "@/animation/success.json";
import Ribbon from "@/animation/ribbon.json";

export default function ThankYou() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [policyData, setPolicyData] = useState(null);


  // ================= URL Validation =================
  useEffect(() => {
    if (!router.isReady) return;

    const policyNumber = router.query.policyNumber;
    const proposalNumber = router.query.proposalNumber; 
    const policyurl = router.query.policyurl;

    if (
      router.asPath.includes("policyNumber=") &&
      (!policyNumber || policyNumber === "") &&
      !proposalNumber
    ) {
      setPolicyData({ pending: true });
      setLoading(false);
      return;
    }

    if (policyNumber || proposalNumber) {
      setPolicyData({
        policy: policyNumber || null,
        proposal: proposalNumber || null,
        policyURL: policyurl,
      });

      setLoading(false);
      return;
    }

    setLoading(false);
  }, [router.isReady, router.query, router.asPath]);

  // ================= UI =================
  return (
    <div className="min-h-screen bgcolor flex items-center justify-center p-4 sm:p-8">
      {loading ? (
        <div className="text-center text-gray-500 text-lg font-medium">
          <HealthLoaderOne />
        </div>
      ) : policyData ? (
        policyData.pending ? (
          <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md text-center space-y-4 border border-yellow-200">
            <h2 className="text-2xl font-bold text-yellow-600">
              Payment Successful ⏳
            </h2>

            <p className="text-sm text-gray-500">
              Your policy is currently under underwriting review. Once approved,
              your policy document will be generated and shared with you.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md space-y-6 text-center border border-blue-100">
            <div className="flex justify-center">
              <Lottie
                animationData={successAnimation}
                loop
                autoplay
                className="w-40 h-40"
              />
            </div>

            <div className="relative flex items-center justify-center">
              <Lottie
                animationData={Ribbon}
                loop
                autoplay
                className="absolute w-60 h-60 pointer-events-none"
              />

              <h2 className="text-3xl font-bold text-gray-800 relative z-10">
                Thank You! 🎉
              </h2>
            </div>

            <p className="text-gray-700">
              Your {policyData.policy ? "policy" : "proposal"} has been
              successfully generated.
            </p>

            <p className="text-md mt-4 mb-3 text-black font-semibold">
              <strong>
                {policyData.policy ? "Policy Number:" : "Proposal Number:"}
              </strong>
              <br />
              {policyData.policy || policyData.proposal}
            </p>

            {policyData.policyURL && (
              <a
                href={policyData.policyURL}
                className="thmbtn text-white font-semibold py-3 rounded-md flex items-center justify-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fas fa-download mr-2"></i>
                Download Policy
              </a>
            )}
          </div>
        )
      ) : (
        <div className="min-h-screen text-center text-red-500">
          Policy data not found.
        </div>
      )}
    </div>
  );
}