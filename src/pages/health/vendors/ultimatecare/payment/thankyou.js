"use client";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { CallApi } from "@/api";
import { HealthLoaderOne} from "@/components/loader";
import { showError } from "@/layouts/toaster";
import Lottie from "lottie-react";
import successAnimation from "@/animation/success.json";
import Ribbon from "@/animation/ribbon.json";

export default function ThankYou() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [policyData, setPolicyData] = useState(null);

  const fetchData = useCallback(async () => {
    const payload = {
      policy: router.query.policynumber,
      parm1: router.query.Param1,
      parm2: router.query.Param2,
      policyurl: router.query.policyurl,
    };

    setLoading(true);
    try {
      const response = await CallApi(
        "/api/health-ultimatecare/thankyou",
        "POST",
        payload
      );
      if (response?.status && response?.data) {
        setPolicyData(response.data);
      }

      if (!response?.status) {
        showError(response.message || "Something went wrong");
        return;
      }
    } catch (error) {
      console.error("Error calling API:", error);
      showError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router.query]);

useEffect(() => {
  if (!router.isReady) return;

  const pathname = router.pathname;
  const requiredPath = "/health/vendors/ultimatecare/payment/thankyou";
  const { policynumber, Param1, Param2, policyurl } = router.query;

  if (
    pathname !== requiredPath ||
    !policynumber ||
    policyurl === undefined
  ) {
    router.replace("/health/vendors/ultimatecare/journey?payment=failed");
    return;
  }

  fetchData();
}, [router, fetchData]); // ✅ simplified


  return (
    <div className="min-h-screen bgcolor flex items-center justify-center p-4 sm:p-8">
      {loading ? (
        <div className="text-center text-gray-500 text-lg font-medium">
          <HealthLoaderOne />
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
           {policyData.policy}
          </p>
          <a
            href={policyData.policyURL}
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
