"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { FaChevronLeft, FaCheck, FaBicycle  } from "react-icons/fa";
import StepOneForm from "./stepone.js";
import StepTwoForm from "./steptwo.js";
import StepThreeForm from "./stepthree.js";
import StepFourForm from "./stepfour.js";
import VehicleCard from "../../../../vehicledetails/index.js";

import { showSuccess, showError } from "@/layouts/toaster";
import { validateFields } from "@/styles/js/validation.js";
import constant from "@/env.js";
import validateKycStep from "./kycvalidation.js";
import { CallApi } from "@/api";
import {BikeInsuranceLoader} from "@/components/loader.js";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function StepperForm({ usersData, kycData }) {
  const [loading, setLoading] = useState(false);
  const [submitStepLoader, setSubmitStepLoader] = useState(false);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [kycType, setKycType] = useState("");
  const [sameAddress, setSameAddress] = useState(true);
  const [proofs, setProofs] = useState({ identity: "", address: "" });
  const [fileNames, setFileNames] = useState({});
  const [kycVerified, setKycVerified] = useState(false);
  const [isPanVerified, setIsPanVerified] = useState(false);
  const [verifieddata, setVerifiedData] = useState([]);
  const [steponedata, setStepOneData] = useState([]);
  const [steptwodata, setStepTwoData] = useState([]);
  const [stepthreedata, setStepThreeData] = useState([]);
  const [totalPremium, setTotalPremium] = useState("");
  const [isPanKycHidden, setIsPanKycHidden] = useState(false);
  const [isAadharKycHidden, setIsAadharKycHidden] = useState(false);
  const [isOtherKycHidden, setIsOtherKycHidden] = useState(false);

  const [vehicleDetails, setVehicleDetails] = useState([]);
  const [bikedata, setBikeData] = useState([]);
  const [journeydata, setJourneyData] = useState([]);
  const [userinfodata, setUserInfoData] = useState([]);
  const [bankdata, setBankData] = useState([]);
  const [prevInsurdata, setPrevInsurData] = useState([]);
  const [motortype, setMotorType] = useState([]);

  const searchParams = useSearchParams();
  const summaryData = useMemo(() => {
    const getParsed = (key) => {
      try {
        return JSON.parse(searchParams.get(key) || "[]");
      } catch {
        return [];
      }
    };
    return {
      tenure: searchParams.get("tenure") || "",
      coverAmount: searchParams.get("coverAmount") || "",
      totalPremium: searchParams.get("totalPremium") || "",
      selectedAddons: getParsed("selectedAddons"),
      compulsoryAddons: getParsed("compulsoryAddons"),
      tenurePrices: getParsed("tenurePrices"),
      addons: getParsed("addons"),
      fullAddonsName: getParsed("fullAddonsName"),
    };
  }, [searchParams]);
  useEffect(() => {
    if (summaryData?.totalPremium) {
      setTotalPremium(summaryData.totalPremium);
    }
  }, [summaryData]);

  useEffect(() => {
    const stepFromQuery = parseInt(searchParams.get("step"));
    if (stepFromQuery >= 1 && stepFromQuery <= 4) {
      setCurrentStep(stepFromQuery);
    }
  }, [searchParams]);

  const step1Form = useForm({
    defaultValues: { gstnumber: "" },
    shouldUnregister: false,
  });

  const step2Form = useForm({
    shouldUnregister: true,
  });
  const step3Form = useForm();
  const step4Form = useForm();

  const inputClass = "border border-gray-400 rounded px-3 py-2 text-sm w-full";
   const steps = ["", "", "", ""];

  const back = async () => {
    if (currentStep === 1) {
      router.push(constant.ROUTES.MOTOR.BIKE.BIKEPLANS);
    } else {
      setLoading(true);
      setCurrentStep((prev) => prev - 1);
      setLoading(false);
    }
  };

  const validateFormStepOne = async () => {
    const rawValues = step1Form.getValues();
    if (!kycVerified) {
      showError("Please complete KYC verification before proceeding.");
      return false;
    }
    step1Form.unregister("gstnumber");

    const fieldsValid = await validateFields(step1Form);
    if (!fieldsValid) return false;

    // GST number validation only if value exists
    const gstValue = rawValues.gstnumber?.trim();

    const values = {
      ...rawValues,
      customerpancardDob: rawValues.customerpancardDob,
      sameAddress: sameAddress ? "1" : "0",
    };
    delete values.panDob;
    try {
      setLoading(true);

      const res = await CallApi(
        constant.API.MOTOR.BIKE.SHRIRAM.SAVESTEPONE,
        "POST",
        values
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

    if (
      values.bankloantype === "" &&
      values.financierbranch === "" &&
      enabled
    ) {
      showError("Please fill bank loan provider and branch details.");
      return false;
    }
    if (values.bankloantype === "" && enabled) {
      showError("Please select a bank/loan provider.");
      return false;
    }
    if (values.financierbranch === "" && enabled) {
      showError("Please enter branch name.");
      return false;
    }
    // const validAge = validateStepTwoData(values, steponedata);
    // if (!validAge) return false;

    try {
      setLoading(true);

      const res = await CallApi(
        constant.API.MOTOR.BIKE.SHRIRAM.SAVESTEPONE,
        "POST",
        values
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

  const validateFormStepThree = async (step3Form, steptwodata) => {
    //  setLoading(true); 
    const fieldsValid = await validateFields(step3Form);
    if (!fieldsValid) {
      // setLoading(false);
      return false;
    }


    const data = step3Form.getValues();
    setLoading(true);
    try {
      const res = await CallApi(
        constant.API.MOTOR.BIKE.SHRIRAM.SAVESTEPONE,
        "POST",
        data
      );
      const status = res?.data?.status;
      const errorDesc = res?.data?.apiresponse?.ERROR_DESC;

      if (status === true || res === 1) {
        setStepThreeData(res.data);
        showSuccess("Step 3 saved successfully.");
          setLoading(false); 
        return true;
      } else {
        if (errorDesc) {
          showError(errorDesc);
        } else {
          showError("Step 3 save failed. Please try again.");
        }
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Step 3 API call error:", error);
      showError("Something went wrong while saving Step 3.");
      setLoading(false);
      return false;
    }
    return result;
  };

  const GoToPayment = () => {
    const apiResponse = stepthreedata?.apiresponse;
    const proposal = stepthreedata?.proposal;

    if (!apiResponse?.PROPOSAL_NO) {
      showError("Proposal number not found");
      return;
    }

    const proposalNumber = apiResponse.PROPOSAL_NO;
    const polSysId = apiResponse.POL_SYS_ID;
    const premium = proposal?.premium;
    const productcode = proposal?.productcode;

    if (!polSysId || !premium || !productcode) {
      showError("Required proposal details missing");
      return;
    }

    setLoading(true);

    router.push(
      `/motor/bike/vendor/shriram/payment?proposalNumber=${proposalNumber}&polSysId=${polSysId}&premium=${premium}&productcode=${productcode}`
    );
  };

  const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, 4));

const onSubmitStep = async () => {
    setSubmitStepLoader(true);
    try {
      let isValid = false;
      if (currentStep === 1) {
        isValid = await validateFormStepOne();
      } else if (currentStep === 2) isValid = await validateFormStepTwo();
      else if (currentStep === 3)
        isValid = await validateFormStepThree(step3Form, steptwodata);
      else if (currentStep === 4) isValid = await GoToPayment();
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

    // setLoading(false);
  };

  const handleVerifyPan = async () => {
    const values = step1Form.getValues();
     await validateKycStep(
          step1Form,
          "PAN Card",
          values,
          proofs,
          setKycVerified,
          kycVerified,
          setIsPanVerified,
          setVerifiedData,
          setIsPanKycHidden,
          setIsAadharKycHidden,
          setIsOtherKycHidden
        );
  };

  const handleVerifyAadhar = async () => {
    const values = step1Form.getValues();
    await validateKycStep(
         step1Form,
         "Aadhar ( Last 4 Digits )",
         values,
         proofs,
         setKycVerified,
         kycVerified,
         undefined,
         setVerifiedData,
         setIsPanKycHidden,
         setIsAadharKycHidden,
         setIsOtherKycHidden
       );
  };

  const handleVerifyOther = async () => {
    const values = step1Form.getValues();

    const identityType = proofs.identity;
    const addressType = proofs.address;

    const identityInput = document.getElementById(`identity-${identityType}`);
    const addressInput = document.getElementById(`address-${addressType}`);
    const photoInput = document.getElementById("media-upload");

    const identityFile = identityInput?.files?.[0];
    const addressFile = addressInput?.files?.[0];
    const insurePhoto = photoInput?.files?.[0];

    const kycData = {
      identity: identityType,
      address: addressType,
      identityValue: proofs.identityValue,
      addressValue: proofs.addressValue,
      fatherName: proofs.fatherName,
      identityFile,
      addressFile,
      insurePhoto,
    };

    await validateKycStep(
      step1Form,
      "Others",
      values,
      kycData,
      setKycVerified,
      kycVerified,
      undefined,
      setVerifiedData,
      setIsPanKycHidden,
      setIsAadharKycHidden,
      setIsOtherKycHidden
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await CallApi(
          constant.API.MOTOR.BIKE.SHRIRAM.SAVEDATA,
          "GET"
        );
        if (res?.data?.details) {
          setBikeData(res.data.details);
        }
        if (res?.data?.user) {
          setJourneyData(res.data.user);
          setUserInfoData({
            userdob: res.data.userdob,
            username: res.data.username,
          });

        }
        if (res?.data?.bank) {
          setBankData(res.data.bank);
        }
        if (res?.data?.prevInsurance) {
          setPrevInsurData(res.data.prevInsurance);
        }

        if (res?.data?.aVehicleDetails) {
          setVehicleDetails(res.data.aVehicleDetails);
        }
        if (res?.cache) {
          setMotorType(res.cache);
        }
        // if (res?.journey) {
        //   setJourneyData(res.journey);
        // }

        // const carDataArray = res.data;
        // if (Array.isArray(carDataArray) && carDataArray.length > 0) {
        //   const firstEntry = carDataArray[0];

        //   try {
        //     const parsedDetails = JSON.parse(firstEntry.knowcar_reg_details);
        //     setBikeData(parsedDetails);
        //   } catch (err) {
        //     console.error("Failed to parse knowcar_reg_details:", err);
        //   }
        // }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {loading ? (
        <BikeInsuranceLoader />
      ) : (
        <div className="min-h-screen bgcolor p-4 sm:p-8">
          <button
            onClick={back}
            className="text-blue-700 flex items-center gap-2 mb-4 text-sm font-medium"
          >
            <FaChevronLeft /> Go back to Previous
          </button>

          <div className="max-w-7xl mx-auto lg:flex lg:gap-6 flex-col lg:flex-row">
           <div className="flex-1 bg-white rounded-[32px] shadow p-8">
              {/* Stepper */}
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

              {/* Step Content */}
              <div className="mt-10">
                {currentStep === 1 && (
                  <StepOneForm
                    step1Form={step1Form}
                    kycType={kycType}
                    setKycType={setKycType}
                    handleVerifyPan={handleVerifyPan}
                    handleVerifyAadhar={handleVerifyAadhar}
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
                    setIsPanVerified={setIsPanVerified}
                    isPanVerified={isPanVerified}
                    verifieddata={verifieddata}
                    usersData={usersData}
                    kycData={kycData}
                     bikedata={bikedata}
                    journeydata={journeydata}
                    userinfodata={userinfodata}
                      isPanKycHidden={isPanKycHidden}
                    setIsPanKycHidden={setIsPanKycHidden}
                    isAadharKycHidden={isAadharKycHidden}
                    setIsAadharKycHidden={setIsAadharKycHidden}
                    isOtherKycHidden={isOtherKycHidden}
                    setIsOtherKycHidden={setIsOtherKycHidden}
                  />
                )}
                {currentStep === 2 && (
                  <StepTwoForm
                    step2Form={step2Form}
                    steponedata={steponedata}
                    inputClass={inputClass}
                    onSubmitStep={onSubmitStep}
                    usersData={usersData}
                    bikedata={bikedata}
                    journeydata={journeydata}
                    bankdata={bankdata}
                    prevInsurdata={prevInsurdata}
                    motortype={motortype}
                  />
                )}
                {currentStep === 3 && (
                  <StepThreeForm
                    step3Form={step3Form}
                    steptwodata={steptwodata}
                    inputClass={inputClass}
                    onSubmitStep={onSubmitStep}
                    journeydata={journeydata}
                  />
                )}
                {currentStep === 4 && (
                  <StepFourForm
                    step4Form={step4Form}
                    stepthreedata={stepthreedata}
                    onSubmitStep={onSubmitStep}
                    currentStep={currentStep}
                    totalPremium={totalPremium}
                    onGoToPayment={GoToPayment}
                    motortype={motortype}
                  />
                )}
              </div>
            </div>

         

            <div className="lg:w-1/3 w-full ">
    <div className="w-full lg:w-[415px] bg-white rounded-2xl shadow-sm p-6 text-sm self-start">
        {(motortype === "knowbike" || motortype === "newbike") && (
              <VehicleCard
                vehicleDetails={vehicleDetails}
                title={motortype === "knowbike" ? "Private Bike" : "New Bike"}
                icon={<FaBicycle  className="text-blue-600 text-xl" />}
                currentStep={currentStep}
                onGoToPayment={GoToPayment}
              />
            )}
      </div>
     
    </div>
          </div>
        </div>
      )}
    </>
  );
}
