"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm, Controller } from "react-hook-form";
import UniversalDatePicker from "../../../../datepicker/index";
import { FaChevronLeft, FaCheck } from "react-icons/fa";
import StepOneForm from "./stepone.js";
import StepTwoForm from "./steptwo.js";
import StepThreeForm from "./stepthree.js";
import ExtraStepForPortForm from "./question/extrastepforport.js";
import StepFourForm from "./stepfour.js";
import SummaryCard from "../checkout/rightsection.js";
import { showSuccess, showError } from "@/layouts/toaster";
import { validateFields } from "@/styles/js/validation.js";
import validateStepTwoData from "./validatesteptwoagedata.js";
import constant from "@/env.js";
import validateKycStep from "./kycvalidation.js";
import { CallApi, getDBData, clearDBData } from "@/api";
import { HealthLoaderOne } from "@/components/loader";
import Modal from "@/components/modal.js";
import Image from "next/image";

import { format, parse } from "date-fns";
import {
  FaUserShield,
  FaBirthdayCake,
  FaExclamationTriangle,
  FaMale,
  FaFemale,
} from "react-icons/fa";

export default function StepperForm({ usersData, kycData }) {
  const [loading, setLoading] = useState(false);
  const [submitStepLoader, setSubmitStepLoader] = useState(false);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [insurememberdata, setInsureMemberData] = useState([]);
  const [kycType, setKycType] = useState("");
  const [sameAddress, setSameAddress] = useState(true);
  const [proofs, setProofs] = useState({ identity: "", address: "" });
  const [fileNames, setFileNames] = useState({});
  const [kycVerified, setKycVerified] = useState(false);
  const [verifiedData, setVerifiedData] = useState([]);
  const [steponedata, setStepOneData] = useState([]);
  const [steptwodata, setStepTwoData] = useState([]);
  const [stepthreedata, setStepThreeData] = useState([]);
  const [totalPremium, setTotalPremium] = useState("");
  const [isCKYCHidden, setIsCKYCHidden] = useState(false);
  const [isOtherKycHidden, setIsOtherKycHidden] = useState(false);
  const [tenureTxn, setTenureTxn] = useState(null);
  const [finalTxn, setFinalTxn] = useState(null);
  const [planType, setPlanType] = useState("");
  const [quoteData, setQuoteData] = useState({totalpremium: "", basepremium: "", coverage: "",});

  const [oldPincode, setOldPincode] = useState("");
  const [newPincode, setNewPincode] = useState("");

  const [showKycMismatchModal, setShowKycMismatchModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selfData, setSelfData] = useState([]);
  const [isMemberUpdated, setIsMemberUpdated] = useState(false);

  const [prevPremiumBeforeMemberUpdate, setPrevPremiumBeforeMemberUpdate] =
    useState(null);

  const updateUrlPremium = (total, base, coverage) => {
    const params = new URLSearchParams(window.location.search);

    params.set("totalPremium", String(total));

    params.set("basePremium", String(base));

    params.set("coverage", String(coverage));

    router.replace(`${router.pathname}?${params.toString()}`, undefined, {
      shallow: true,
    });
  };

    useEffect(() => {
      console.log("insurememberdata",insurememberdata)
    }, [insurememberdata]);
  const handlePremiumUpdate = async (total, base, coverage) => {
    setQuoteData({
      totalpremium: total,
      basepremium: base,
      coverage,
    });

    updateUrlPremium(total, base, coverage);

    await clearDBData();
  };
  const [summaryData, setSummaryData] = useState({
    tenure: 0,
    coverAmount: 0,
    totalPremium: 0,
    basePremium: 0,
    coverage: 0,
    defaultAddons: [],
    selectedAddons: [],
    compulsoryAddons: [],
    tenurePrices: {},
    addons: {},
    fullAddonsName: {},
    tenuretxn: {},
  });

  useEffect(() => {
    const storedData = sessionStorage.getItem("myhealthcaresummarycard");

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setSummaryData(parsed);
      } catch (err) {
        console.error("SessionStorage parse error:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (summaryData?.totalPremium) {
      setTotalPremium(summaryData.totalPremium);
    }
  }, [summaryData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const stepFromQuery = parseInt(params.get("step"));

    if (stepFromQuery >= 1 && stepFromQuery <= 5) {
      setCurrentStep(stepFromQuery);
    }
  }, []);

  const step1Form = useForm();
  const step2Form = useForm();
  const stepPortForm = useForm();
  const step3Form = useForm();
  const step4Form = useForm();

  const inputClass = "border border-gray-400 rounded px-3 py-2 text-sm w-full";
  // const steps = ["", "", "", ""];
  const steps = planType === "1" ? ["", "", "", ""] : ["", "", "", "", ""];
  // const steps = ["Step", "Step", "Step", ""];

  const back = async () => {
    if (currentStep === 1) {
      router.push(constant.ROUTES.HEALTH.BAJAJ.CHECKOUT);
    } else {
      setLoading(true);
      setCurrentStep((prev) => prev - 1);
      setLoading(false);
    }
  };

  const validateFormStepOne = async () => {
    step1Form.unregister("kycType");
    const rawValues = step1Form.getValues();
 if (!kycVerified) {
      showError("Please complete KYC verification before proceeding.");
      return false;
    }
    const fieldsValid = await validateFields(step1Form);
    if (!fieldsValid) return false;

    // --- GENDER MISMATCH VALIDATION START ---
    const selfMember = insurememberdata?.find(
      (m) => m.name?.toLowerCase() === "self"
    );

    if (selfMember && kycVerified) {
      const kycGenderRaw = verifiedData?.gender || step1Form.getValues("docGender") || "";
      const kycGender = kycGenderRaw.toUpperCase() === "M" || kycGenderRaw.toUpperCase() === "MALE" 
        ? "male" 
        : kycGenderRaw.toUpperCase() === "F" || kycGenderRaw.toUpperCase() === "FEMALE" 
          ? "female" 
          : "";

      const memberGender = selfMember.gender?.toLowerCase();
      console.log("kycGender",kycGender);
      console.log("memberGender",memberGender);
      console.log("kycGender",kycGender);
      console.log("memberGender",memberGender);
      if (kycGender && memberGender && kycGender !== memberGender) {
        
        showError(`Gender mismatch! Selected member is ${memberGender.toUpperCase()} but KYC verified is ${kycGender.toUpperCase()}.`);
        return false; 
      }
      // console.log("hello")
    }
 
    // return false;
    // --- GENDER MISMATCH VALIDATION END ---

    const values = {
      ...rawValues,
      customerpancardDob: rawValues.customerpancardDob,
      sameAddress: sameAddress ? "1" : "0",
    };
    delete values.panDob;
    try {
      setLoading(true);
      const res = await CallApi(
        constant.API.HEALTH.BAJAJ.SAVESTEPONE,
        "POST",
        values,
      );
      if (res === 1 || res?.status) {
        setStepOneData(res);
        return true;
      } else {
        console.error("API failed or returned unexpected value:", res);
        showError(res.error);
        return false;
      }
    } catch (error) {
      console.error("API call error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const validateFormStepTwo = async () => {
    const values = step2Form.getValues();
    const fieldsValid = await validateFields(step2Form);
    if (!fieldsValid) return false;
    const rawValues = step2Form.getValues();
    const nomineeDob = values.nomineedob;
    // console.log(values);
    // return false;
    const validAge = validateStepTwoData(values, steponedata);
    if (!validAge) return false;
    try {
      setLoading(true);
      const res = await CallApi(
        constant.API.HEALTH.BAJAJ.SAVESTEPTWO,
        "POST",
        values,
      );
      if (res === 1 || res?.status) {
        setStepTwoData(res);
        return true;
      } else {
        console.error("Step 2 API failed or returned unexpected value:", res);
        return false;
      }
    } catch (error) {
      console.error("Step 2 API call error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const validateFormExtraStep = async () => {
    const fieldsValid = await validateFields(stepPortForm);
    if (!fieldsValid) return false;

    const values = stepPortForm.getValues();
    console.log("values",values)
    try {
      setLoading(true);

      const res = await CallApi(
        constant.API.HEALTH.BAJAJ.SAVESTEPPORT,
        "POST",
        values,
      );

      if (res === 1 || res?.status) {
        setStepThreeData(res);
        return true;
      } else {
        console.error("Portability API failed:", res);
        showError(res.error || "Something went wrong.");
        return false;
      }
    } catch (error) {
      console.error("Port Step API Error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const validateFormStepThree = async (step3Form, steptwodata) => {
    const data = step3Form.getValues();
    const members = steptwodata?.member || [];
    const agreeTnC = data.agreeTnC;

    if (!agreeTnC) {
      step3Form.setFocus("agreeTnC");
      showError(
        "Please agree to Terms & Conditions and Standing Instruction to continue.",
      );
      return false;
    }

    let transformed = [];

    try {
      transformed = members.map((m) => {
        const memberData = {};

        const processQuestions = (questions) => {
          Object.values(questions).forEach((q) => {
            const toggle = data[q.name]?.toggle;
            const selectedMembers = data[q.name]?.members || [];

            if (toggle && selectedMembers.includes(m.id)) {
              const remark = data[q.name]?.remarks?.[m.id]?.trim();

              // Validation
              if (!remark) {
                step3Form.setFocus(`${q.name}.remarks.${m.id}`);

                showError(`Please enter remark for ${q.label}`);

                throw new Error("Remark missing");
              }
              memberData[q.name] = remark;
            }
          });
        };

        processQuestions(constant.BAJAJQUESTION.HEALTH);
        processQuestions(constant.BAJAJQUESTION.LIFESTYLE);

        return {
          id: m.id,
          name: m.name,
          data: memberData,
        };
      });
     console.log("transformed",transformed);
     
      const res = await CallApi(
        constant.API.HEALTH.BAJAJ.SAVESTEPTHREE,
        "POST",
        transformed,
      );

      if (res === 1 || res?.status) {
        setStepThreeData(res);
        return true;
      } else {
        console.error("Step 3 API failed or returned unexpected value:", res);
        return false;
      }
    } catch (error) {
      console.error("Step 3 API call error:", error);
      return false;
    }
  };

  const GoToPayment = async () => {
    setLoading(true);
    try {
      const res = await CallApi(constant.API.HEALTH.BAJAJ.CREATEPOLICY, "POST");

      const status = res?.status;

      if (status === "1" || status === 1 || status === true) {
        const paymentLink = res?.data?.paymentlink;

        if (paymentLink) {
          router.push(
            `/health/vendors/bajaj/payment?paymentLink=${paymentLink}`,
          );
        } else {
          const backendMsg =
            res?.data?.msg || "Payment link not received from server.";
          showError(backendMsg);
        }
      } else {
        const fallbackMsg = "Something went wrong while creating policy.";
        const backendMsg =
          res?.error?.[0]?.errDescription || res?.message || fallbackMsg;
        showError(backendMsg);
      }
    } catch (error) {
      console.error("API Error", error);
      showError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const maxStep = planType === "1" ? 4 : 5;
  const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, maxStep));

  const onSubmitStep = async () => {
    setSubmitStepLoader(true);
    try {
      let isValid = false;

      if (currentStep === 1) {
        isValid = await validateFormStepOne();
      } else if (currentStep === 2) {
        isValid = await validateFormStepTwo();
      } else if (planType !== "1" && currentStep === 3) {
        isValid = await validateFormExtraStep();
      } else if (currentStep === (planType === "1" ? 3 : 4)) {
        isValid = await validateFormStepThree(step3Form, steptwodata);
      } else if (currentStep === (planType === "1" ? 4 : 5)) {
        return await GoToPayment();
      }

      if (!isValid) {
        setSubmitStepLoader(false);
        return;
      }
      const formToUse =
        currentStep === 1
          ? step1Form
          : currentStep === 2
            ? step2Form
            : currentStep === 3
              ? step3Form
              : step4Form;
      goNext();
    } catch (e) {
    } finally {
      setSubmitStepLoader(false);
    }
  };

  const handleVerifyIdentity = async () => {
    const values = step1Form.getValues();
    await validateKycStep(
      step1Form,
      "CKYC",
      values,
      proofs,
      setKycVerified,
      kycVerified,
      setVerifiedData,
      setIsCKYCHidden,
      setIsOtherKycHidden,
      finalTxn,
      insurememberdata,
      setShowKycMismatchModal,
      setSelfData,
    );
  };

  const handleVerifyOther = async () => {
    const values = step1Form.getValues();
    await validateKycStep(
      step1Form,
      "Others",
      values,
      proofs,
      setKycVerified,
      kycVerified,
      setVerifiedData,
      setIsCKYCHidden,
      setIsOtherKycHidden,
    );
  };
  useEffect(() => {
    if (quoteData.totalpremium) {
    }
  }, [quoteData]);

  useEffect(() => {
    const fetchFromDB = async () => {
      try {
        const data = await getDBData(constant.DBSTORE.HEALTH.BAJAJ.TENURETXN);
        if (data) {
          // console.log("Retrieved from DB:", data);
          setTenureTxn(data);
        } else {
          // console.log("No data found for tenureTxn");
        }
      } catch (err) {
        console.error("Error retrieving data:", err);
      }
    };

    fetchFromDB();
  }, []);

  useEffect(() => {
    if (!tenureTxn || !summaryData?.tenure) return;

    const selectedTenure = String(summaryData.tenure);
    const txnObj = tenureTxn[selectedTenure];
    // console.log("txn id",txnObj)
    if (txnObj) {
      setFinalTxn(txnObj);
    } else {
      console.warn("No matching txn found for tenure:", selectedTenure);
    }
  }, [tenureTxn, summaryData]);

  return (
    <>
      {loading ? (
        <HealthLoaderOne />
      ) : (
        <div className="min-h-screen bgcolor p-4 sm:p-8">
          <button
            onClick={back}
            className="text-blue-700 flex items-center gap-2 mb-4 text-sm font-medium"
          >
            <FaChevronLeft /> Go back to Previous
          </button>
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
            <div className="flex-1 bg-white rounded-[32px] shadow p-8">
              <div className="flex justify-between items-center">
                {steps.map((label, i) => {
                  const sn = i + 1;
                  const active = sn === currentStep;
                  const done = sn < currentStep;
                  return (
                    <div
                      key={sn}
                      className={`flex items-center ${
                        sn !== steps.length ? "w-full" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full border flex justify-center items-center text-sm font-medium ${
                            done || active
                              ? "thmbtn text-white border-white-600"
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          {done ? <FaCheck size={12} /> : sn}
                        </div>
                        {label && (
                          <span className="text-sm text-gray-700">{label}</span>
                        )}
                      </div>
                      {sn !== steps.length && (
                        <div
                          className={`flex-1 h-0.5 mx-2 ${
                            done ? "thmbtn" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-10">
                {currentStep === 1 && (
                  <StepOneForm
                    step1Form={step1Form}
                    kycType={kycType}
                    finalTxn={finalTxn}
                    setKycType={setKycType}
                    handleVerifyIdentity={handleVerifyIdentity}
                    handleVerifyOther={handleVerifyOther}
                    loading={loading}
                    sameAddress={sameAddress}
                    setSameAddress={setSameAddress}
                    fileNames={fileNames}
                    setFileNames={setFileNames}
                    proofs={proofs}
                    setProofs={setProofs}
                    inputClass={inputClass}
                    onSubmitStep={onSubmitStep}
                    kycVerified={kycVerified}
                    setKycVerified={setKycVerified}
                    verifiedData={verifiedData}
                    usersData={usersData}
                    kycData={kycData}
                    isCKYCHidden={isCKYCHidden}
                    setIsCKYCHidden={setIsCKYCHidden}
                    isOtherKycHidden={isOtherKycHidden}
                    setIsOtherKycHidden={setIsOtherKycHidden}
                    setQuoteData={setQuoteData}
                    setNewPincode={setNewPincode}
                    setOldPincode={setOldPincode}
                    setPlanType={setPlanType}
                    setInsureMemberData={setInsureMemberData}
                  />
                )}
                {currentStep === 2 && (
                  <StepTwoForm
                    step2Form={step2Form}
                    steponedata={steponedata}
                    inputClass={inputClass}
                    onSubmitStep={onSubmitStep}
                    usersData={usersData}
                    planType={planType}
                  />
                )}
                {planType !== "1" && currentStep === 3 && (
                  <ExtraStepForPortForm
                    stepPortForm={stepPortForm}
                    steptwodata={steptwodata}
                    inputClass={inputClass}
                    onSubmitStep={onSubmitStep}
                  />
                )}

                {currentStep === (planType === "1" ? 3 : 4) && (
                  <StepThreeForm
                    step3Form={step3Form}
                    steptwodata={steptwodata}
                    inputClass={inputClass}
                    onSubmitStep={onSubmitStep}
                  />
                )}

                {currentStep === (planType === "1" ? 4 : 5) && (
                  <StepFourForm
                    step4Form={step4Form}
                    stepthreedata={stepthreedata}
                    onSubmitStep={onSubmitStep}
                    currentStep={currentStep}
                    totalPremium={
                      quoteData.totalpremium || summaryData.totalPremium
                    }
                    basePremium={
                      quoteData.basepremium || summaryData.basePremium
                    }
                    coverage={quoteData.coverage || summaryData.coverage}
                    onGoToPayment={GoToPayment}
                    planType={planType}
                  />
                )}
              </div>
            </div>

            <SummaryCard
              tenure={summaryData.tenure}
              coverAmount={summaryData.coverAmount}
              totalPremium={quoteData.totalpremium || summaryData.totalPremium}
              basePremium={quoteData.basepremium || summaryData.basePremium}
              coverage={quoteData.coverage || summaryData.coverage}
              selectedAddons={summaryData.selectedAddons}
              compulsoryAddons={summaryData.compulsoryAddons}
              tenurePrices={summaryData.tenurePrices}
              defaultAddons={summaryData.defaultAddons}
              addons={summaryData.addons}
              fullAddonsName={summaryData.fullAddonsName}
              tenuretxn={tenureTxn || summaryData.tenuretxn}
              currentStep={currentStep}
              onGoToPayment={GoToPayment}
              newPincode={newPincode}
              oldPincode={oldPincode}
              planType={planType}
              isMemberUpdated={isMemberUpdated}
              prevPremiumBeforeMemberUpdate={prevPremiumBeforeMemberUpdate}
            />
          </div>
        </div>
      )}

      <Modal
        isOpen={showKycMismatchModal}
        onClose={() => setShowKycMismatchModal(false)}
        title="KYC Details Mismatch"
        showCancelButton
        showConfirmButton
        confirmText="Update Member Details"
        cancelText="Cancel"
        width="max-w-xl"
        isLoading={modalLoading}
        onConfirm={async () => {
          try {
            setModalLoading(true);

            setPrevPremiumBeforeMemberUpdate(
              quoteData?.totalpremium || summaryData?.totalPremium,
            );

            const payload = {
              age: selfData?.[0]?.age,
              dob: selfData?.[0]?.dob,
              id: selfData?.[0]?.id,
              gender: selfData?.[0]?.gender,
            };

            const res = await CallApi(
              constant.API.HEALTH.BAJAJ.UPDATEAGE,
              "POST",
              payload,
            );

            if (res === 1 || res?.status) {
              const premiumData = res?.premium || {};
              const proposerDob = res?.proposardata?.[0]?.dob;

              if (proposerDob) {
                step1Form.setValue("docDob", proposerDob, {
                  shouldValidate: true,
                  shouldDirty: true,
                });

                setInsureMemberData((prev) =>
                  prev.map((member) =>
                    member.name?.toLowerCase() === "self"
                      ? {
                          ...member,
                          dob: proposerDob,
                          age: selfData?.[0]?.age,
                          // gender: selfData?.[0]?.gender,
                        }
                      : member
                  )
                );
                console.log("insurememberdata",insurememberdata)
              }
              const existingData = JSON.parse(
                sessionStorage.getItem("myhealthcaresummarycard") || "{}",
              );

              const tenureKey = String(existingData.tenure);

              const updatedTenureTxn = {
                ...(existingData.tenuretxn || {}),
                [tenureKey]: {
                  ...(existingData.tenuretxn?.[tenureKey] || {}),
                  totalpremium: premiumData.totalpremium,
                  premium: premiumData.basepremium1,
                  discount: premiumData.discount,
                  coverage: premiumData.coverage,
                },
              };
              const updatedSummary = {
                ...existingData,
                totalPremium: premiumData.totalpremium,
                basePremium: premiumData.basepremium1,
                coverage: premiumData.coverage,
                discount: premiumData.discount,
                tenuretxn: updatedTenureTxn,
              };

              // 1. SESSION STORAGE UPDATE
              sessionStorage.setItem(
                "myhealthcaresummarycard",
                JSON.stringify(updatedSummary),
              );

              // 2. SUMMARY STATE UPDATE
              setSummaryData(updatedSummary);

              // 3. QUOTE DATA UPDATE
              setQuoteData({
                totalpremium: premiumData.totalpremium,
                basepremium: premiumData.basepremium1,
                coverage: premiumData.coverage,
                discount: premiumData.discount,
              });

              // 4. TOTAL PREMIUM UPDATE
              setTotalPremium(premiumData.totalpremium);

              // 5. TENURETXN UPDATE
              setTenureTxn((prev) => {
                if (!prev) return prev;

                const tenureKey = String(updatedSummary.tenure);

                return {
                  ...prev,

                  [tenureKey]: {
                    ...prev[tenureKey],

                    totalpremium: premiumData.totalpremium,

                    premium: premiumData.basepremium1,

                    discount: premiumData.discount,

                    coverage: premiumData.coverage,
                  },
                };
              });

              setIsMemberUpdated(true);

              await clearDBData();

              step1Form.resetField("customerpancardno");

              step1Form.resetField("customerpancardDob");

              setShowKycMismatchModal(false);

              showSuccess("Member details updated successfully.");
            } else {
              showError(res?.error || "Failed to update member details");
            }
          } catch (err) {
            console.error(err);
            showError("Server error. Please try again.");
          } finally {
            setModalLoading(false);
          }
        }}
      >


        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* TOP HEADER */}

          <div className="bg-gradient-to-r from-[#2F4A7E] to-[#4F7BCB] px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-white/15 flex items-center justify-center">
                  <FaUserShield className="text-white text-lg" />
                </div>

                <div>
                  <h4 className="font-semibold text-white">
                    Self Member Details
                  </h4>

                  <p className="text-blue-100 text-xs">
                    Update insured member information
                  </p>
                </div>
              </div>

              <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                Primary Insured
              </div>
            </div>
          </div>

          {/* FORM SECTION */}

          <div className="space-y-6 p-6">
            {/* DOB */}

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FaBirthdayCake className="text-[#2F4A7E]" />
                Date of Birth
              </label>

              <Controller
                control={step1Form.control}
                name="modalDob"
                render={({ field, fieldState }) => (
                  <UniversalDatePicker
                    id="modalDob"
                    name="modalDob"
                    value={
                      field.value
                        ? parse(field.value, "dd-MM-yyyy", new Date())
                        : null
                    }
                    onChange={(date) => {
                      if (date instanceof Date && !isNaN(date)) {
                        const formattedDob = format(date, "dd-MM-yyyy");

                        field.onChange(formattedDob);

                        const today = new Date();

                        let age = today.getFullYear() - date.getFullYear();

                        const monthDiff = today.getMonth() - date.getMonth();

                        if (
                          monthDiff < 0 ||
                          (monthDiff === 0 && today.getDate() < date.getDate())
                        ) {
                          age--;
                        }

                        setSelfData((prev) => {
                          if (!Array.isArray(prev)) {
                            return [
                              {
                                ...prev,
                                dob: formattedDob,
                                age,
                              },
                            ];
                          }

                          return prev.map((item, i) =>
                            i === 0
                              ? {
                                  ...item,
                                  dob: formattedDob,
                                  age,
                                }
                              : item,
                          );
                        });
                      }
                    }}
                    placeholder="Select DOB"
                    error={!!fieldState.error}
                    errorText={fieldState.error?.message}
                  />
                )}
              />

              {selfData?.[0]?.age && (
                <div className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  Age: {selfData?.[0]?.age} Years
                </div>
              )}
            </div>

            {/* GENDER */}

           
          </div>
        </div>

        {/* FOOTER */}

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs leading-relaxed text-slate-600">
            Please ensure DOB and gender exactly match your KYC / PAN records.
            Updating details may recalculate your premium amount.
          </p>
        </div>
      </Modal>
    </>
  );
}
