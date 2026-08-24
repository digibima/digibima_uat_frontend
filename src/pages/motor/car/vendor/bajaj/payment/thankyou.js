"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import Lottie from "lottie-react";
import successAnimation from "@/animation/success.json";
import Ribbon from "@/animation/ribbon.json";
import CarInsuranceLoader from "@/components/loader";
import { showError } from "@/layouts/toaster";

import { CallApi } from "@/api";
import constant  from "@/env";

export default function ThankYou() {

  console.log(`${constant.BASE_URL}`)
  const searchParams = useSearchParams();
  const hasRun = useRef(false);

  const policynumber =
    searchParams.get("p_policy_ref") ||
    searchParams.get("policyref") ||
    "";

  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  // ⭐ FIX: fetchPolicy wrapped inside useCallback so dependency stays stable
  const fetchPolicy = useCallback(async () => {
    if (!policynumber) return;

    setLoading(true);

 try {
    const response = await CallApi(
      "/api/motor-bajaj/thankyou",
      "POST",
      { policynumber }
    );

    if (response?.status && response?.policypdf) {
      setPdfUrl(`${constant.BASE_URL}/${response.policypdf}`);
    } else {
      showError(response?.message || "Unable to fetch policy PDF.");
    }
  } catch (error) {
    console.error("API Error:", error);
    showError("Something went wrong, please try again.");
  } finally {
    setLoading(false);
  }

  }, [policynumber]);

  useEffect(() => {
    if (!hasRun.current && policynumber) {
      hasRun.current = true;
      fetchPolicy();
    }
  }, [policynumber, fetchPolicy]);

  if (!policynumber) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl font-semibold">
        Policy number missing in URL.
      </div>
    );
  }

  return (
    <div className="min-h-screen bgcolor flex items-center justify-center p-4 sm:p-8">
      {loading ? (
        <CarInsuranceLoader />
      ) : (
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

          <p className="text-md mt-4 mb-3 text-black font-semibold">
            <strong>Policy Number:</strong>
            <br />
            {policynumber}
          </p>

          <a
            href={pdfUrl || "#"}
            className="thmbtn text-white font-semibold py-3 rounded-md flex items-center justify-center gap-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fas fa-download mr-2"></i>
            {pdfUrl ? "Download Policy" : "PDF Not Available"}
          </a>

        </div>
      )}
    </div>
  );
}
