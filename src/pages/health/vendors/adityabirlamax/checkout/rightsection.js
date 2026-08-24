"use client";
import { useRouter, usePathname } from "next/navigation";
import { BsArrowRight } from "react-icons/bs";
import { useState, useEffect, useRef } from "react";
import { showSuccess, showError } from "@/layouts/toaster";
import { FiInfo, FiDownload } from "react-icons/fi";
import { CallApi } from "@/api";
import constant from "@/env.js";

const formatPrice = (val) => {
  const num = Number(val);
  if (!num || isNaN(num)) return "₹ 0";
  return `₹ ${num.toLocaleString()}`;
};

export default function SummaryCard({
  tenure = "",
  tenurePrices = {},
  coverAmount = "",
  selectedAddons = [],
  compulsoryAddons = [],
  fullAddonsName = {},
  addons = {},
  totalPremium = 0,
  basePremium = 0,
  coverage = 0,
  currentStep = 1,
  onGoToPayment,
  applyClicked,
  isAddOnsModified,
  oldPincode,
  newPincode,
  planType,
  isMemberUpdated,
  prevPremiumBeforeMemberUpdate,
  checkoutTotalPremium,
  isPaymentVerified,
  onGoToPolicy,
  proposalLoading
}) {
  console.log("addons", addons);

  const [priceChangeMsg, setPriceChangeMsg] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const isStepFour = currentStep === 4;
  const isCheckoutPage = pathname.includes(
    "/health/vendors/adityabirlamax/checkout",
  );
  const isJourneyPage = pathname.includes(
    "/health/vendors/adityabirlamax/journey",
  );
  const [isResume, setIsResume] = useState(false);

  useEffect(() => {
    const resume = sessionStorage.getItem("adityabirlamax_resume") === "1";
    setIsResume(resume);
  }, []);

  const [priceLoading, setPriceLoading] = useState(false);
  const [addonLoading, setAddonLoading] = useState(false);
  const [totalLoading, setTotalLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const prevPricesRef = useRef({});
  const prevAddonsRef = useRef([]);
  const prevTotalRef = useRef(totalPremium);
  const hasMountedRef = useRef(false);
  const formatAmount = (amt) => (Number(amt) === 100 ? "1 Cr" : `${amt} Lac`);
  const formatPrice = (val) => `₹ ${(val || 0).toLocaleString()}`;
  const selectedTenurePrice = tenurePrices[tenure] || 0;

  useEffect(() => {
    if (Object.keys(prevPricesRef.current).length === 0) {
      prevPricesRef.current = tenurePrices;
      return;
    }
    if (
      JSON.stringify(prevPricesRef.current) !== JSON.stringify(tenurePrices)
    ) {
      setPriceLoading(true);
      prevPricesRef.current = tenurePrices;
      setTimeout(() => setPriceLoading(false), 600);
    }
  }, [tenurePrices]);

  useEffect(() => {
    if (!checkoutTotalPremium) {
      setPriceChangeMsg("");
      return;
    }

    const normalize = (val) => Number(String(val).replace(/,/g, "").trim());

    const total = normalize(totalPremium);
    const checkout = normalize(checkoutTotalPremium);

    if (isNaN(total) || isNaN(checkout)) {
      setPriceChangeMsg("");
      return;
    }

    if (total !== checkout) {
      const oldPrice = formatPrice(checkout);
      const newPrice = formatPrice(total);

      const isPincodeChanged = oldPincode?.trim() && newPincode?.trim();

      if (isMemberUpdated && prevPremiumBeforeMemberUpdate) {
        setPriceChangeMsg(
          `You updated the member's age or gender. Hence, the total premium is revised from ${oldPrice} to ${newPrice}.`,
        );
        return;
      }

      if (isPincodeChanged) {
        setPriceChangeMsg(
          `The PIN code in your address (${oldPincode}) is different from the PIN code you chose while taking quote (${newPincode}). Hence, the total premium is revised from ${oldPrice} to ${newPrice}.`,
        );
      } else {
        setPriceChangeMsg(
          `You have changed your plan, members, or coverage. Hence, the total premium is revised from ${oldPrice} to ${newPrice}.`,
        );
      }
    } else {
      setPriceChangeMsg("");
    }
  }, [
    totalPremium,
    checkoutTotalPremium,
    oldPincode,
    newPincode,
    isMemberUpdated,
    prevPremiumBeforeMemberUpdate,
  ]);

  const allSelectedValues = new Set(Object.values(selectedAddons) || []);
  const hasPlusVariant = {
    ic: allSelectedValues.has("icp"),
    cs: allSelectedValues.has("csp"),
    opd: allSelectedValues.has("opdp"),
  };

  const handleProceed = () => {
    if (isAddOnsModified && !applyClicked) {
      showError(
        "Please click Apply to save your AddOns changes before proceeding.",
      );
      return;
    }

    const journeyData = {
      tenure,
      coverAmount,
      totalPremium,
      checkoutTotalPremium,
      selectedAddons,
      tenurePrices,
      addons,
      fullAddonsName,
    };

    sessionStorage.setItem("adityaBirlaMaxPlusSummaryCard", JSON.stringify(journeyData));

    setLoading(true);
    router.push(`/health/vendors/adityabirlamax/journey`);
  };
  // ---------------------------------

  const priceChangeReason = `The PIN code in your address is different from the PIN code you chose while taking quote. Hence, the total premium is revised.`;
  useEffect(() => {}, [priceChangeMsg]);

  const handleBrowse = () => {
    window.open(
      "https://stage.digibima.com/broucher/activonemaxbrochure.pdf",
      "_blank",
    );
  };

  return (
    <div className="w-full lg:w-[415px] bg-white rounded-[32px] shadow-md p-6 text-sm self-start">
      <h2 className="text-base font-semibold text-[#003366] mb-2">Summary</h2>

      {/* Base Premium */}
      <div className="flex items-start justify-between gap-3 text-sm font-semibold text-black mb-4">
        <p className="text-gray-600 leading-snug max-w-[70%]">
          Base Premium - {tenure} {tenure === 1 ? "Year" : "Years"}
        </p>

        {priceLoading ? (
          <span className="flex items-center space-x-1 animate-bounce">
            <div className="w-2 h-2 bg-gray-500 rounded-full" />
            <div className="w-2 h-2 bg-gray-500 rounded-full delay-150" />
            <div className="w-2 h-2 bg-gray-500 rounded-full delay-300" />
          </span>
        ) : (
          <span className="text-right min-w-[90px] font-semibold">
            {formatPrice(basePremium || selectedTenurePrice)}
          </span>
        )}
      </div>

      {/* Coverage */}
      <div className="flex items-start justify-between gap-3 text-sm mb-3">
        <span className="text-gray-600">Coverage</span>
        <span className="font-semibold text-black text-right min-w-[90px]">
          {formatAmount(coverage || coverAmount)}
        </span>
      </div>

      <p className="text-sm font-semibold text-[#003366] mt-4 mb-2">
        Add-On(s) benefits
      </p>

      {/* Addons */}
      {selectedAddons && Object.values(selectedAddons).length > 0 && (
        <>
          <p className="text-sm font-semibold text-[#003366] mt-6 mb-3">
            Selected Optional Add-Ons
          </p>

          <div className="space-y-2 text-sm">
            {Object.entries(selectedAddons).map(([key, value]) => {
              if (!value) return null;

              const addonLabel = fullAddonsName[key] || key;
              const isDropdown = value !== true;

             let leftLabel = addonLabel;
              let rawPrice = addons[key];

              if (rawPrice && typeof rawPrice === 'object') {
                rawPrice = rawPrice[value] || 0; 
              }

              let rightSide = formatPrice(rawPrice || 0);

              if (isDropdown) {
                const selectedLabel = fullAddonsName[value] || value;
                leftLabel = `${addonLabel} (${selectedLabel})`;
              }

              return (
                <div
                  className="flex items-start justify-between gap-3"
                  key={key}
                >
                  <span className="text-gray-700 leading-snug max-w-[70%]">
                    {leftLabel}
                  </span>

                  <span className={`text-right min-w-[90px] font-medium ${Number(rawPrice) < 0 ? "text-red-500" : "text-black"}`}>
                  {rightSide}
                </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Total */}
      <div className="mt-5 border-t pt-4 font-semibold text-black">
        {priceChangeMsg && (
          <div className="flex justify-end items-center gap-2 mt-1">
            <div className="relative group">
              <span className="text-blue-600 text-sm underline cursor-pointer">
                Why Price Change
              </span>

              <div
                className="absolute right-0 top-full mt-1 w-[300px] p-3 bg-gradient-to-br from-teal-100 to-blue-50 
          text-gray-800 text-sm rounded-xl shadow-lg border border-blue-200 
          opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 
          transition-all duration-300 ease-out z-10 whitespace-normal pointer-events-none"
              >
                <p className="leading-relaxed text-[13px]">{priceChangeMsg}</p>
              </div>
            </div>

            <span className="text-gray-400 text-xs">
              <FiInfo size={14} />
            </span>
          </div>
        )}

        <div className="flex justify-between mt-3">
          <span>Total Premium</span>
          <span className="text-right min-w-[90px]">
            {formatPrice(totalPremium)}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div>
        {!isJourneyPage && (
          <button
            onClick={handleProceed}
            disabled={proposalLoading}
            className={`w-full mt-4 py-2 flex items-center justify-center gap-2 thmbtn ${
              proposalLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {proposalLoading ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Please wait...
              </>
            ) : (
              <>
                Proceed to Proposal <BsArrowRight />
              </>
            )}
          </button>
        )}

        {isCheckoutPage && (
          <button
            onClick={handleBrowse}
            className="w-full mt-4 py-2 flex items-center justify-center gap-2 thmbtn"
          >
            Plan Brochure <FiDownload />
          </button>
        )}

        {isJourneyPage &&
          !isPaymentVerified &&
          (isResume || currentStep === (planType == 2 ? 5 : 4)) && (
            <button
              onClick={onGoToPayment}
              className="w-full mt-4 py-2 flex items-center justify-center gap-2 thmbtn"
            >
              Go to Payment
            </button>
          )}
        {isJourneyPage &&
          isPaymentVerified &&
          currentStep >= (planType == 2 ? 5 : 4) && (
            <button
              onClick={onGoToPolicy}
              className="w-full mt-4 py-2 flex items-center justify-center gap-2 thmbtn"
            >
              Create Policy
            </button>
          )}
      </div>
    </div>
  );
}