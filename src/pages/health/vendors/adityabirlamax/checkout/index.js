"use client";

import React, { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";
import CoverageAmount from "./coverageamount";
import PolicyPeriodOptions from "./policyperiodoptions";
import AddOnSelection from "./addonselection";
import MemberDetails from "./editmember";
import SummaryCard from "./rightsection";
import SlidePanel from "../../../sidebar/index";
import {
  CallApi,
  getDBData,
  storeDBData,
  deleteDBData,
  clearDBData
} from "../../../../../api";
import { isObjectDataChanged } from "@/pages/api/helpers";
import { showError, showSuccess } from "@/layouts/toaster";
import constant from "../../../../../env";

export default function ProposalUI() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState(null);

  // Core states
  const [addons, setAddons] = useState({});
  const [addonsDes, setAddonsDes] = useState({});
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [fullAddonsName, setFullAddonsName] = useState({});
  const [compulsoryAddons, setCompulsoryAddons] = useState([]);
  const [coverageOptions, setCoverageOptions] = useState([]);
  const [coverAmount, setCoverAmount] = useState("");
  const [tenureOptions, setTenureOptions] = useState([]);
  const [tenure, setTenure] = useState("");
  const [tenurePrices, setTenurePrices] = useState({});
  const [totalPremium, setTotalPremium] = useState("");
  const [checkoutTotalPremium, setCheckoutTotalPremium] = useState("");
  const [insurers, setInsurers] = useState([]);
  const [childList, setChildList] = useState([]);
  const [gender, setGender] = useState("");
  const [kycRequired, setKycRequired] = useState(false);
  const [isSlideOpen, setIsSlideOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [memberName, setMemberName] = useState("");
  const [applyClicked, setApplyClicked] = useState(false);
  const [isAddOnsModified, setIsAddOnsModified] = useState(false);

  const [proposalLoading, setProposalLoading] = useState(false);

  useEffect(() => {
    const fetchCheckoutData = async () => {
        setLoading(true);
  setProposalLoading(true);
      try {
        const cached = await getDBData(constant.DBSTORE.HEALTH.ADITYABIRLAMAX.ABIRLACHECKOUTDATA);

        if (cached) {
          populateData(cached);
          setOriginalData(cached);
          setLoading(false);
          return;
        }
        const res = await CallApi(constant.API.HEALTH.ADITYABIRLAMAX.CHECKOUT);
        if (res) {
          populateData(res);
          setOriginalData(res);
          await storeDBData(constant.DBSTORE.HEALTH.ADITYABIRLAMAX.ABIRLACHECKOUTDATA, res);
        }
      } catch (err) {
        console.error("Error fetching ABIRLACHECKOUTDATA:", err);
        showError("Failed to load checkout data.");
       } finally {
    setLoading(false);
    setProposalLoading(false);
  }
    };

    fetchCheckoutData();
  }, []);

  // Set all states from API or cache data
  const populateData = (res) => {
    setSelectedAddons(res.selected_addon || []);
  setAddons(res["addon value"] || {});
    // setAddons(res["selected_addon_value"] || {});
    setFullAddonsName(res.addonname || {});
    setAddonsDes(res.addondes || {});
    setCompulsoryAddons(res.compulsoryaddon || []);
    setCoverageOptions(res.coveragelist || []);
    setCoverAmount(res.coverage || "");
    setPincode(res.pincode || "");
    setTotalPremium(res.totalamount || "");
    setCheckoutTotalPremium(res.totalamount || "");
    setTenureOptions(res.tenureList || []);
    setTenure(res.tenure || "");
    setInsurers(res.aInsureData || []);
    setChildList(res.child || []);
    setGender(res.gender || "");
    setKycRequired(res.kyc === "1");
    const memberCount = (res.aInsureData || []).length;
    setMemberName(`Self(${memberCount})`);
  };
  

  //  Fetch price when coverage or tenure changes
  useEffect(() => {
    if (!coverAmount || tenureOptions.length === 0) return;

    const fetchPrices = async () => {
      const cacheKey = constant.DBSTORE.HEALTH.ADITYABIRLAMAX.ABIRLACHECKOUTTENUREDATA;

      try {
        setProposalLoading(true);
        const cached = await getDBData(cacheKey);
        if (
          cached &&
          cached.coverage === coverAmount &&
          JSON.stringify(cached.tenureOptions) === JSON.stringify(tenureOptions)
        ) {
          setTenurePrices(cached.tenurePrices || {});
          return;
        }
        const newPrices = {};

        for (const t of tenureOptions) {
          try {
             setProposalLoading(true);
            const res = await CallApi(
              constant.API.HEALTH.ADITYABIRLAMAX.PlANCHECKOUT,
              "POST",
              { tenure: t, coverage: coverAmount }
            );
            if (res?.data?.premium) {
              newPrices[t] = res.data.premium;
              setTenurePrices((prev) => ({
                ...prev,
                [t]: res.data.premium,
              }));
            }
          } catch (err) {
            console.error(`Price fetch error for tenure ${t}:`, err);
          }
           finally{
    setProposalLoading(false);
  }
        }

        await deleteDBData(cacheKey);
        // deleteDBData("healthplandata"),
        // deleteDBData("healthplanvendor"),

        await storeDBData(cacheKey, {
          coverage: coverAmount,
          tenureOptions,
          tenurePrices: newPrices,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Error fetching PlanCheckout data:", err);
      }
 finally {
    setProposalLoading(false);
  }
    };

    fetchPrices();
  }, [coverAmount, tenureOptions]);

  const handleCoverageOrTenureChange = async (type, value) => {
    const updatedPayload =
      type === "coverage"
        ? { coverage: value }
        : { coverage: coverAmount, tenure: value };

    const newState = {
      ...originalData,
      coverage: type === "coverage" ? value : coverAmount,
      tenure: type === "tenure" ? value : tenure,
    };

    const changed = isObjectDataChanged(originalData, newState);

    if (!changed) {
      showSuccess("No changes, using cached data.");
      return;
    }

    try {
      setLoading(true);
 setProposalLoading(true);
      await CallApi(constant.API.HEALTH.FILTERPLAN, "POST", updatedPayload);

      const res = await CallApi(constant.API.HEALTH.ADITYABIRLAMAX.CHECKOUT);
      if (res) {
        populateData(res);
        setOriginalData(res);
        // await Promise.all([
        //   deleteDBData(constant.DBSTORE.HEALTH.PLANS.HEALTHPLANDATA),
        //   deleteDBData(constant.DBSTORE.HEALTH.PLANS.HEALTHPLANVENDOR),
        //   deleteDBData(constant.DBSTORE.HEALTH.CARE.CARECHECKOUTDATA),
        //   deleteDBData(constant.DBSTORE.HEALTH.ULTIMATE.ULTIMATECHECKOUTDATA),
        //   deleteDBData(constant.DBSTORE.HEALTH.BAJAJ.BAJAJCHECKOUTDATA),
        //       deleteDBData(constant.DBSTORE.HEALTH.ADITYABIRLA.ABIRLACHECKOUTDATA),
          
        // ]);
         await clearDBData();
        await storeDBData(constant.DBSTORE.HEALTH.ADITYABIRLAMAX.ABIRLACHECKOUTDATA, res);
      }
    } catch (err) {
      console.error("Error updating plan:", err);
      showError("Failed to update plan.");
    }
finally {
  setLoading(false);
  setProposalLoading(false);
}
  };

  const refreshCheckoutData = async () => {
    try {
       setProposalLoading(true);
      const res = await CallApi(constant.API.HEALTH.ADITYABIRLAMAX.CHECKOUT);
      if (res) {
        populateData(res);
        setOriginalData(res);
        await deleteDBData(constant.DBSTORE.HEALTH.ADITYABIRLAMAX.ABIRLACHECKOUTDATA);
        await storeDBData(constant.DBSTORE.HEALTH.ADITYABIRLAMAX.ABIRLACHECKOUTDATA, res);
      }
    } catch (err) {
      console.error("Error refreshing add-on data:", err);
     } finally {
    setProposalLoading(false);
  }
    
  };

  return (
    <div className="bgcolor min-h-screen px-3 sm:px-10 lg:px-20 py-6">
      <button
        type="button"
        onClick={() => router.push("/health/common/plans")}
        className="inline-flex items-center text-base text-indigo-700 mb-4 hover:underline gap-1"
      >
        <FiArrowLeft className="text-lg" />
        Go back to Previous
      </button>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <CoverageAmount
            coverAmount={coverAmount}
            setCoverAmount={(val) =>
              handleCoverageOrTenureChange("coverage", val)
            }
            coverageOptions={coverageOptions}
            isSkeletonLoading={loading}
          />

          <PolicyPeriodOptions
            tenureOptions={tenureOptions}
            tenure={tenure}
            setTenure={(val) => handleCoverageOrTenureChange("tenure", val)}
            tenurePrices={tenurePrices}
            isSkeletonLoading={loading}
          />

          <AddOnSelection
            addons={addons}
            addonsDes={addonsDes}
            compulsoryAddons={compulsoryAddons}
            fullAddonsName={fullAddonsName}
            selectedAddons={selectedAddons}
            getCheckoutData={refreshCheckoutData}
            setApplyClicked={setApplyClicked}
            setIsAddOnsModified={setIsAddOnsModified}
            isSkeletonLoading={loading}
            setProposalLoading={setProposalLoading}
          />

          <MemberDetails
            memberName={memberName}
            count={3}
            onEdit={() => setIsSlideOpen(true)}
          />
        </div>

        <SummaryCard
          tenure={tenure}
          tenurePrices={tenurePrices}
          coverAmount={coverAmount}
          compulsoryAddons={compulsoryAddons}
          fullAddonsName={fullAddonsName}
          selectedAddons={selectedAddons}
          addons={addons}
          totalPremium={totalPremium}
          checkoutTotalPremium={checkoutTotalPremium}
          applyClicked={applyClicked}
          isAddOnsModified={isAddOnsModified}
            proposalLoading={proposalLoading}
        />
      </div>

      {isSlideOpen && (
        <SlidePanel
          isSlideOpen={isSlideOpen}
          setIsSlideOpen={setIsSlideOpen}
          pincode={pincode}
          memberName={memberName}
          setPincode={setPincode}
          setMemberName={setMemberName}
        />
      )}
    </div>
  );
}
