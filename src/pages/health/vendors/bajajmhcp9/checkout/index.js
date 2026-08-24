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
import { CallApi, storeDBData } from "../../../../../api";
import constant from "../../../../../env";

export default function ProposalUI() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [addons, setAddons] = useState({});
  const [addonsDes, setAddonsDes] = useState({});
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [defaultAddons, setDefaultAddons] = useState([]);
  const [fullAddonsName, setFullAddonsName] = useState({});
  const [compulsoryAddons, setCompulsoryAddons] = useState([]);
  const [coverageOptions, setCoverageOptions] = useState([]);
  const [coverAmount, setCoverAmount] = useState("");
  const [tenureOptions, setTenureOptions] = useState([]);
  const [tenure, setTenure] = useState("");
  const [tenurePrices, setTenurePrices] = useState({});
  const [tenuretxn, setTenureTxn] = useState([]);
  const [totalPremium, setTotalPremium] = useState("");
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
    fetchCheckoutData();
  }, []);
  useEffect(() => {
    // console.log(tenuretxn);
  }, [tenuretxn]);

const fetchCheckoutData = async () => {

  setLoading(true);
setProposalLoading(true);
  return CallApi(constant.API.HEALTH.BAJAJMHCP9.CHECKOUT)

    .then((res) => {
// console.log("res",res)
      setSelectedAddons(res.selected_addon || []);
      setDefaultAddons(res.default_addon || []);
      setAddons(res["addOn_Value"] || {});
      setFullAddonsName(res.addonname || {});
      setAddonsDes(res.addondes || {});
      setCompulsoryAddons(res.compulsoryaddon || []);
      setCoverageOptions(res.coveragelist || []);
      setCoverAmount(res.coverage || "");
      setPincode(res.pincode || "");
      setTotalPremium(res.totalamount || "");
      setTenureOptions(res.tenureList || []);
      setTenure(res.tenure || "");
      setInsurers(res.aInsureData || []);
      setChildList(res.child || []);
      setGender(res.gender || "");
      setKycRequired(res.kyc === "1");

      const allMembers = res.aInsureData || [];
      const memberCount = allMembers.length;

      setMemberName(`Self(${memberCount})`);

    })

    .catch((err)=>console.error(err))

   .finally(() => {
      setLoading(false);
      setProposalLoading(false);
    });
}

useEffect(() => {
  if (!coverAmount || tenureOptions.length === 0) return;

  const fetchPrices = async () => {
    setProposalLoading(true);

    const newPrices = {};
    const allTxnData = {};

    try {
      for (const t of tenureOptions) {
        try {
          const res = await CallApi(
            constant.API.HEALTH.BAJAJMHCP9.PlANCHECKOUT,
            "POST",
            {
              tenure: t,
              coverage: coverAmount,
            }
          );

          if (res?.data) {
            newPrices[t] = res.data.premium;
            allTxnData[t] = res.data;

            setTenurePrices(prev => ({
              ...prev,
              [t]: res.data.premium,
            }));

            setTenureTxn(prev => ({
              ...prev,
              [t]: res.data,
            }));
          }
        } catch (err) {
          console.error("Price error:", err);
        }
      }
    } finally {
      setProposalLoading(false); 
    }
  };

  fetchPrices();
}, [coverAmount, tenureOptions]);

  // console.log(tenuretxn);

  const basePremium = tenurePrices[tenure] || 0;


  const handleCoverageOrTenureChange = (type, value) => {
    const updatedPayload =
      type === "coverage"
        ? { coverage: value }
        : { coverage: coverAmount, tenure: value };

    if (type === "coverage") setCoverAmount(value);
    else setTenure(value);

    setLoading(true);
    CallApi(constant.API.HEALTH.FILTERPLAN, "POST", updatedPayload)
      .then(() => fetchCheckoutData())
      .catch(console.error)
      .finally(() => setLoading(false));
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
        {/* LEFT */}
        <div className="flex-1">
          <CoverageAmount
            coverAmount={coverAmount}
            setCoverAmount={(val) =>
              handleCoverageOrTenureChange("coverage", val)
            }
             isLoading={loading}
            coverageOptions={coverageOptions}
          />

          <PolicyPeriodOptions
            tenureOptions={tenureOptions}
            tenure={tenure}
            setTenure={(val) => handleCoverageOrTenureChange("tenure", val)}
            tenurePrices={tenurePrices}
               isSkeletonLoading={loading}
          />

          <AddOnSelection
            coverAmount={coverAmount}
            addons={addons}
            addonsDes={addonsDes}
            compulsoryAddons={compulsoryAddons}
            fullAddonsName={fullAddonsName}
            selectedAddons={selectedAddons}
            defaultAddons={defaultAddons}
            getCheckoutData={fetchCheckoutData}
            setApplyClicked={setApplyClicked}
            setIsAddOnsModified={setIsAddOnsModified}
            setGlobalLoading={setLoading}
            isLoading={loading}
          />

          <MemberDetails
            memberName={memberName}
            count={3}
            onEdit={() => setIsSlideOpen(true)}
          />
        </div>

        <SummaryCard
          tenure={tenure}
          tenuretxn={tenuretxn}
          tenurePrices={tenurePrices}
          coverAmount={coverAmount}
          compulsoryAddons={compulsoryAddons}
          fullAddonsName={fullAddonsName}
          selectedAddons={selectedAddons}
          defaultAddons={defaultAddons}
          addons={addons}
          totalPremium={totalPremium}
          applyClicked={applyClicked}
          isAddOnsModified={isAddOnsModified}
          loading={loading}
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
