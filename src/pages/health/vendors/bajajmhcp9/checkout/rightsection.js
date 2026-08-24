"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { BsArrowRight } from "react-icons/bs";
import { FiInfo, FiDownload } from "react-icons/fi";
import { showError } from "@/layouts/toaster";

export default function SummaryCard({
  tenure = "",
  tenurePrices = {},
  coverAmount = "",
  selectedAddons = [],
  defaultAddons = [],
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
  tenuretxn,
   planType,
    loading=false,
    proposalLoading
}) {
  // console.log(tenuretxn)
  const selectedTenureData = tenuretxn?.[tenure] || {};
   const finalTotalPremium = selectedTenureData?.totalpremium || totalPremium;
 const selectedDiscount = selectedTenureData?.discount || 0;
  const router = useRouter();
  const pathname = usePathname();
    const isStepFour = currentStep === 4;
  const isCheckoutPage = pathname.includes("/health/vendors/bajajmhcp9/checkout");
  const isJourneyPage = pathname.includes("/health/vendors/bajajmhcp9/journey");

  const [priceChangeMsg, setPriceChangeMsg] = useState("");
  const [priceLoading, setPriceLoading] = useState(false);

  const prevPricesRef = useRef({});
  const prevTotalRef = useRef(totalPremium);

  const formatAmount = (amt) => (Number(amt) === 100 ? "1 Cr" : `${amt} Lac`);
  const formatPrice = (val) => `₹ ${(val || 0).toLocaleString()}`;
  const selectedTenurePrice = tenurePrices[tenure] || 0;


  const getAddonName = (key) => {
    const cleanedKey = key.replace(/[0-9]+$/g, "").replace(/SIMAX\d*/i, "").trim();
    const baseMatch = Object.keys(fullAddonsName).find((name) => key.startsWith(name));
    return (
      fullAddonsName[key] ||
      fullAddonsName[cleanedKey] ||
      (baseMatch ? fullAddonsName[baseMatch] : key)
    );
  };

 
  const parsedSelected = useMemo(() => {
    const toArr =
      Array.isArray(selectedAddons)
        ? selectedAddons
        : typeof selectedAddons === "string" && selectedAddons.startsWith("[")
        ? JSON.parse(selectedAddons || "[]")
        : Object.values(selectedAddons || []);
    const out = {};
    for (const raw of toArr) {
      const item = String(raw);
      let base = item, val = "";
      const numMatch = item.match(/^([A-Za-z]+)(\d+)$/);
      const rrMatch = item.match(/^([A-Z]{2})([A-Z0-9]+)$/i);
      if (numMatch) [base, val] = [numMatch[1], numMatch[2]];
      else if (rrMatch) [base, val] = [rrMatch[1], rrMatch[2]];
      out[base] = (val || "").toUpperCase();
    }
    return out;
  }, [selectedAddons]);


  const parsedDefaults = useMemo(() => {
    const out = {};
    if (!defaultAddons) return out;

    if (Array.isArray(defaultAddons)) {
      for (const raw of defaultAddons) {
        const item = String(raw);
        let base = item, val = "";
        const numMatch = item.match(/^([A-Za-z]+)(\d+)$/);
        const rrMatch = item.match(/^([A-Z]{2})([A-Z0-9]+)$/i);
        if (numMatch) [base, val] = [numMatch[1], numMatch[2]];
        else if (rrMatch) [base, val] = [rrMatch[1], rrMatch[2]];
        out[base] = (val || "").toUpperCase();
      }
      return out;
    }

    for (const [k, v] of Object.entries(defaultAddons || {})) {
      if (v == null) continue;
      let val = String(v).trim();
      const parenIdx = val.indexOf("(");
      if (parenIdx > 0) val = val.slice(0, parenIdx).trim();
      val = val.split(" ")[0].trim();
      out[k] = val.toUpperCase();
    }
    return out;
  }, [defaultAddons]);


  const initialSelected = useMemo(() => {
    const hasSelected =
      (Array.isArray(selectedAddons) && selectedAddons.length > 0) ||
      (typeof selectedAddons === "string" &&
        selectedAddons.startsWith("[") &&
        JSON.parse(selectedAddons || "[]").length > 0) ||
      (!!selectedAddons && typeof selectedAddons === "object" && Object.keys(selectedAddons).length > 0);

    return hasSelected ? parsedSelected : parsedDefaults;
  }, [selectedAddons, parsedSelected, parsedDefaults]);


  useEffect(() => {
    if (Object.keys(prevPricesRef.current).length === 0) {
      prevPricesRef.current = tenurePrices;
      return;
    }
    if (JSON.stringify(prevPricesRef.current) !== JSON.stringify(tenurePrices)) {
      setPriceLoading(true);
      prevPricesRef.current = tenurePrices;
      setTimeout(() => setPriceLoading(false), 600);
    }
  }, [tenurePrices]);

  
  useEffect(() => {
    if (prevTotalRef.current && prevTotalRef.current !== totalPremium) {
      const oldPrice = formatPrice(prevTotalRef.current);
      const newPrice = formatPrice(totalPremium);
      const isPincodeChanged = oldPincode?.trim() && newPincode?.trim();

      setPriceChangeMsg(
        isPincodeChanged
          ? `The PIN code in your address (${oldPincode}) is different from the PIN code you chose while taking quote (${newPincode}). Hence, the total premium is revised from ${oldPrice} to ${newPrice}.`
          : `You have changed your plan, members, or coverage. Hence, the total premium is revised from ${oldPrice} to ${newPrice}.`
      );
    }
    prevTotalRef.current = totalPremium;
  }, [totalPremium, oldPincode, newPincode]);

const handleProceed = () => {
  if (isAddOnsModified && !applyClicked) {
    showError("Please click Apply to save your AddOns changes before proceeding.");
    return;
  }

  const myhealthcare9SummaryCard = {
    tenure,
    coverAmount,
    basePremium,
    coverage: coverAmount,
    totalPremium,

    selectedAddons,
    defaultAddons,
    compulsoryAddons,
    addons,
    fullAddonsName,
    tenurePrices,
    tenuretxn,
  };

  sessionStorage.setItem(
    "bajajmhcp9summarycard",
    JSON.stringify(myhealthcare9SummaryCard)
  );

  router.push("/health/vendors/bajajmhcp9/journey");
};



  const handleBrowse = () =>
    window.open(
      "https://stage.digibima.com/broucher/bajamyhealthcare.pdf",
      "_blank"
    );

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
          <span>
            {/* {formatPrice(basePremium || selectedTenurePrice)} */}
            {formatPrice(finalTotalPremium)}
            </span>
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
              <span>{getAddonName(key)}</span>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-xs">No mandatory add-ons.</div>
        )}
      </div>

     
      {initialSelected && Object.keys(initialSelected).length > 0 && (
        <>
          <p className="text-sm font-semibold text-[#003366] mt-6 mb-2">
            Selected Optional Add-Ons
          </p>
          <div className="space-y-1 text-gray-700">
            {Object.entries(initialSelected).map(([base, val]) => {
              const keyForName = `${base}${val || ""}`;
              return (
                <div className="flex justify-between" key={keyForName}>
                  <span>{getAddonName(keyForName)}</span>
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
              <div className="absolute right-0 top-full mt-1 w-[300px] p-3 bg-gradient-to-br from-teal-100 to-blue-50 text-gray-800 text-sm rounded-xl shadow-lg border border-blue-200 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out z-10 whitespace-normal pointer-events-none">
                <p className="leading-relaxed text-[13px]">{priceChangeMsg}</p>
              </div>
            </div>
            <span className="text-gray-400 text-xs">
              <FiInfo size={14} />
            </span>
          </div>
        )}


        <div className="flex justify-between">
          <span>Discount</span>
          <span className="text-green-600">- {formatPrice(selectedDiscount)}</span>
        </div>

        <div className="flex justify-between text-base mt-1">
          <span>Total Premium</span>
          <span className="text-blue-700 font-bold">{formatPrice(finalTotalPremium)}</span>
        </div>
      
      </div>

      <div>
        {!isJourneyPage && (
<button
  disabled={proposalLoading}
  onClick={handleProceed}
  className={`w-full mt-4 py-2 flex items-center justify-center gap-2 thmbtn ${
    proposalLoading
      ? "opacity-50 cursor-not-allowed"
      : ""
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
         {isJourneyPage && (
  ((planType == 2 && currentStep === 5) || (planType != 2 && isStepFour)) && (
    <button
      onClick={onGoToPayment}
      className="w-full mt-4 py-2 flex items-center justify-center gap-2 thmbtn"
    >
      Go to Payment
    </button>
  )
)}
      </div>
    </div>
  );
}
