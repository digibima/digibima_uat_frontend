"use client";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { CallApi } from "@/api";
import {BikeInsuranceLoader} from "@/components/loader";
import { showError } from "@/layouts/toaster";
import Lottie from "lottie-react";
import successAnimation from "@/animation/success.json";
import Ribbon from "@/animation/ribbon.json";

export default function ThankYou() {
  const [loading, setLoading] = useState(true);
  const [policyData, setPolicyData] = useState(null);
  const router = useRouter();

  const hasRun = useRef(false);

  const qv = (v) => (Array.isArray(v) ? v[0] : v || "");

  useEffect(() => {
    if (!router.isReady) return;
    if (hasRun.current) return;
    hasRun.current = true;

    const policynumber = qv(router.query.policynumber);
    const param1 = qv(router.query.Param1);
    const param2 = qv(router.query.Param2);
    const policyurl = qv(router.query.policyurl);

    const baseKey = `thankyou_mcar_${policynumber}_${param1}_${param2}`;
    const fetchedKey = `${baseKey}_done`;
    const dataKey = `${baseKey}_data`;


    try {
      if (typeof window !== "undefined" && sessionStorage.getItem(fetchedKey)) {
        const cached = sessionStorage.getItem(dataKey);
        if (cached) {
          try {
            setPolicyData(JSON.parse(cached));
          } catch (_) {
          }
        }
        setLoading(false);
        return;
      }
    } catch (_) {
    }

    const run = async () => {
      setLoading(true);

      const payload = {
        policy: policynumber,
        parm1: param1,
        parm2: param2,
        policyurl: policyurl,
      };

      try {
        const response = await CallApi(
          "/api/motor-bike-shriram/thankyou",
          "POST",
          payload
        );
        if (response?.status && response?.data) {
          setPolicyData(response.data);
          try {
            sessionStorage.setItem(fetchedKey, "1");
            sessionStorage.setItem(dataKey, JSON.stringify(response.data));
          } catch (_) {}
        } else {
          showError(response?.message || "Something went wrong");
        }
      } catch (error) {
        console.error("Error calling API:", error);
        showError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [router.isReady, router.query]);

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
              className="absolute w-60 h-60  pointer-events-none"
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
