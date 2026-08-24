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
}) {
  const [priceChangeMsg, setPriceChangeMsg] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const isStepFour = currentStep === 4;
  const isCheckoutPage = pathname.includes(
    "/health/vendors/caresupereme/checkout",
  );
  const isJourneyPage = pathname.includes(
    "/health/vendors/caresupereme/journey",
  );
  const [isResume, setIsResume] = useState(false);

  useEffect(() => {
    const resume = sessionStorage.getItem("care_resume") === "1";
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
    const currentAddonValues = compulsoryAddons.map((key) => addons[key] || 0);
    if (
      JSON.stringify(prevAddonsRef.current) !==
      JSON.stringify(currentAddonValues)
    ) {
      setAddonLoading(true);
      prevAddonsRef.current = currentAddonValues;
      setTimeout(() => setAddonLoading(false), 600);
    }
  }, [addons, compulsoryAddons]);

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
const summaryData = {
  tenure,
  coverAmount,
  totalPremium,
  checkoutTotalPremium,
  basepremium: basePremium,
  coverage,
  selectedAddons,
  compulsoryAddons,
  tenurePrices,
  addons,
  fullAddonsName,
};

  sessionStorage.setItem(
    "careSuperemeSummaryCard",
    JSON.stringify(summaryData)
  );

  setLoading(true);
  router.push("/health/vendors/caresupereme/journey");
  };
  const priceChangeReason = `The PIN code in your address is different from the PIN code you chose while taking quote. Hence, the total premium is revised.`;
  useEffect(() => {}, [priceChangeMsg]);

  const handleBrowse = () => {
    window.open(
      "https://stage.digibima.com/broucher/caresupreme.pdf",
      "_blank",
    );
  };

  return (
    <div className="w-full lg:w-[415px] bg-white rounded-[32px] shadow-sm p-6 text-sm self-start">
      <h2 className="text-base font-semibold text-[#003366] mb-1">Summary</h2>

      <div className="flex items-center justify-between text-sm font-semibold text-black mb-3">
        <p className="text-gray-600 mb-1">
          Base Premium - {tenure} {tenure === 1 ? "Year" : "Years"}
        </p>
        {priceLoading ? (
          <span className="flex items-center space-x-1 animate-bounce">
            <div className="w-2 h-2 bg-gray-500 rounded-full" />
            <div className="w-2 h-2 bg-gray-500 rounded-full delay-150" />
            <div className="w-2 h-2 bg-gray-500 rounded-full delay-300" />
          </span>
        ) : (
          <span>{formatPrice(basePremium || selectedTenurePrice)}</span>
        )}
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Coverage</span>
        <span className="font-semibold text-black">
          {formatAmount(coverage || coverAmount)}
        </span>
      </div>
      <p className="text-sm font-semibold text-[#003366] mt-4 mb-2">
        Add-On(s) benefits
      </p>
      <div className="space-y-1 text-gray-700">
        {compulsoryAddons.length > 0 ? (
          compulsoryAddons.map((key) => (
            <div className="flex justify-between" key={key}>
              <span>{fullAddonsName[key] || key}</span>
              {addonLoading ? (
                <span className="flex items-center space-x-1 animate-bounce">
                  <div className="w-2 h-2 bg-gray-500 rounded-full" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full delay-150" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full delay-300" />
                </span>
              ) : (
                <span>{formatPrice(addons[key])}</span>
              )}
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-xs">No mandatory add-ons.</div>
        )}
      </div>

      {selectedAddons && Object.values(selectedAddons).length > 0 && (
        <>
          <p className="text-sm font-semibold text-[#003366] mt-6 mb-2">
            Selected Optional Add-Ons
          </p>
          <div className="space-y-1 text-gray-700">
            {Object.entries(selectedAddons).map(([k, key]) => {
              if (
                key === "ncb" &&
                Object.values(selectedAddons).includes("cbb")
              ) {
                return null;
              }

              if (
                (key === "ic" && hasPlusVariant.ic) ||
                (key === "cs" && hasPlusVariant.cs) ||
                (key === "opd" && hasPlusVariant.opd)
              ) {
                return null;
              }

              if (
                (key === "1" || key === "2") &&
                Object.values(selectedAddons).includes("ped")
              ) {
                return null;
              }

              let rightSide;

              if (key === "icp") {
                rightSide = formatPrice(addons["ic"] || 0);
              } else if (key === "csp") {
                rightSide = formatPrice(addons["cs"] || 0);
              } else if (key === "opdp") {
                rightSide = formatPrice(addons["opd"] || 0);
              } else if (key === "cbb") {
                rightSide = formatPrice(addons["ncb"] || 0);
              } else {
                rightSide = formatPrice(addons[key] || 0);
              }
              if (key === "ped") {
                const pedDurationEntry = Object.entries(selectedAddons).find(
                  ([_, val]) => val === "1" || val === "2",
                );
                if (pedDurationEntry?.[1] === "1") {
                  rightSide = "1 Year";
                } else if (pedDurationEntry?.[1] === "2") {
                  rightSide = "2 Years";
                } else {
                  rightSide = "Duration Not Set";
                }
              }

              return (
                <div className="flex justify-between" key={k}>
                  <span>
                    {key === "ncb" ? "CB SUPER" : fullAddonsName[key] || key}
                  </span>
                  <span>{rightSide}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
      <div className="mt-4 border-t pt-3 font-semibold text-black">
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
        <div className="flex justify-between mt-2">
          <span>Total Premium</span>
          <span>{formatPrice(totalPremium)}</span>
        </div>
      </div>
      <div>
        {!isJourneyPage && (
          <button
            onClick={handleProceed}
            className="w-full mt-4 py-2 flex items-center justify-center gap-2 thmbtn"
          >
            Proceed to Proposal <BsArrowRight />
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
          (isResume || currentStep === (planType == 2 ? 5 : 4)) && (
            <button
              onClick={onGoToPayment}
              className="w-full mt-4 py-2 flex items-center justify-center gap-2 thmbtn"
            >
              Go to Payment
            </button>
          )}
      </div>
    </div>
  );
}
