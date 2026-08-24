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
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const fetchData = useCallback(async () => {
    const { status, amt, txn, referenceno, quoteno } = router.query;
    if (!status || !txn) return;

    const payload = {
      status,
      amt,
      txn,
      referenceno,
      endorsementno: quoteno,
      quoteno,
    };

    setLoading(true);
    try {
      const response = await CallApi("/api/bajaj-myhealthcareplan9/thankyou", "POST", payload);

      if (response?.status === true) {
        setIsSuccess(true);
        setMessage(response?.message || "Transaction successful!");
      } else {
        showError(response?.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error calling API:", error);
      showError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router.query]);

  useEffect(() => {
    if (router.isReady) {
      fetchData();
    }
  }, [router.isReady, fetchData]);

  const handleGoBack = () => router.push("/");

  const { amt, txn } = router.query;

  return (
    <div className="min-h-screen bgcolor flex items-center justify-center p-4 sm:p-8">
      {loading ? (
        <div className="text-center text-gray-500 text-lg font-medium">
          <HealthLoaderOne />
        </div>
      ) : isSuccess ? (
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md space-y-6 text-center border border-blue-100">
          <div className="flex justify-center">
            <Lottie animationData={successAnimation} loop autoplay className="w-40 h-40" />
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

          <p className="text-gray-700">{message}</p>

          <p className="text-md mt-4 mb-3 text-black font-semibold">
            <strong>Transaction ID:</strong>
            <br />
            {txn}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-md font-semibold">
              Amount: ₹{amt}
            </span>
            <button
              onClick={handleGoBack}
              className="thmbtn text-white font-semibold py-3 px-6 rounded-md"
            >
              Go Back
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-red-500">Transaction failed or data not found.</div>
      )}
    </div>
  );
}
