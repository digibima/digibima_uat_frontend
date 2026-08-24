"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { FaChevronLeft, FaCheck, FaCar } from "react-icons/fa";
import StepOneForm from "./stepone.js";
import StepTwoForm from "./steptwo.js";
import StepThreeForm from "./stepthree.js";
import StepFourForm from "./stepfour.js";
import VehicleCard from "./vehiclecard.js";
import { showSuccess, showError } from "@/layouts/toaster";
import { validateFields } from "@/styles/js/validation.js";
import constant from "@/env.js";
import validateKycStep from "./kycvalidation.js";
import { CallApi } from "@/api";
import CarInsuranceLoader from "@/components/loader.js";
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
 const [proofFiles, setProofFiles] = useState({});
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
  const [cardata, setCarData] = useState([]);
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
      router.push(constant.ROUTES.MOTOR.CAR.PLANS);
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
        constant.API.MOTOR.CAR.ZUNO.SAVESTEPONE,
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
  //    if (
  //   values.proofprovidedforncb === "renewalnotice" 
  //   &&
  //   (!values.proofOfdocumentfile || values.proofOfdocumentfile.length === 0)
  // ) {
  //   showError("Please upload proof of document.");
  //   return false;
  // }
    // if (!validAge) return false;

    try {
      setLoading(true);

      const res = await CallApi(
        constant.API.MOTOR.CAR.ZUNO.SAVESTEPONE,
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
    // setLoading(true); 

    const fieldsValid = await validateFields(step3Form);
    if (!fieldsValid) {
      // setLoading(false); 
      return false;
    }

    const data = step3Form.getValues();
setLoading(true);
    try {
      const res = await CallApi(
        constant.API.MOTOR.CAR.ZUNO.SAVESTEPONE,
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
        setLoading(false); // Stop loader on failure
        return false;
      }
    } catch (error) {
      console.error("Step 3 API call error:", error);
      showError("Something went wrong while saving Step 3.");
      setLoading(false); // Stop loader on error
      return false;
    }
  };

  const GoToPayment = () => {
    const apiResponse = stepthreedata?.apiresponse;
    const proposal = stepthreedata?.proposal;
const details = stepthreedata?.details?.contact_details;
const contact = typeof details === "string" ? JSON.parse(details) : details;

// console.log(stepthreedata?.details?.name);

    // return false;
    if (!proposal?.proposalNo) {
      showError("Proposal number not found");
      return;
    }

    const proposalNumber = proposal?.proposalNo;
    const name = stepthreedata?.details?.name;
    const email = contact.contactemail;
    const mobile = contact.contactmobile;
    const premium = proposal?.premium;


    // if (!proposalNumber || !name || !email|| !mobile || !premium) {
    if (!proposalNumber ) {
      showError("Required proposal details missing");
      return;
    }

    setLoading(true);

    router.push(
      `/motor/car/vendor/zuno/payment?proposalNumber=${proposalNumber}`
    );
    // router.push(
    //   `/motor/car/vendor/zuno/payment?proposalNumber=${proposalNumber}&name=${name}&email=${email}&mobile=${mobile}&premium=${premium}`
    // );
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

  // ✅ Front & Back file inputs
  const identityFrontInput = document.getElementById(`identity-${identityType}-front`);
  const identityBackInput = document.getElementById(`identity-${identityType}-back`);


  const identityfrontFile = identityFrontInput?.files?.[0];
  const identitybackFile = identityBackInput?.files?.[0];

  const kycData = {
    identity: identityType,
    identityValue: proofs.identityValue,

    identityfrontFile,
    identitybackFile,

  };

  // console.log("FINAL KYC DATA:", kycData);

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
          constant.API.MOTOR.CAR.ZUNO.SAVEDATA,
          "GET"
        );
        if (res?.data?.details) {
          setCarData(res.data.details);
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
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {loading ? (
        <CarInsuranceLoader />
      ) : (
        <div className="min-h-screen bgcolor px-4 py-6 sm:px-6 md:px-8">
          <button
            onClick={back}
            className="text-blue-700 flex items-center gap-2 mb-4 text-sm font-medium"
          >
            <FaChevronLeft /> Go back to Previous
          </button>

          <div className="max-w-7xl mx-auto grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-8">
              <div className="bg-white rounded-[32px] shadow p-4 sm:p-6 md:p-8">
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
                            <span className="text-sm text-gray-700">
                              {label}
                            </span>
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
                      setLoading={setLoading}
                      sameAddress={sameAddress}
                      setSameAddress={setSameAddress}
                      fileNames={fileNames}
                      setFileNames={setFileNames}
                      proofFiles={proofFiles}
                      setProofFiles={setProofFiles}
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
                      cardata={cardata}
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
                      cardata={cardata}
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
            </div>
            <div className="col-span-12 md:col-span-4 self-start">
              <div className="bg-white rounded-[32px] shadow p-4 sm:p-6 md:p-8">
                   {(motortype === "knowcar" || motortype === "newcar") && (
                <VehicleCard
                  vehicleDetails={vehicleDetails}
                  title={motortype === "knowcar" ? "Private Car" : "New Car"}
                  icon={<FaCar className="text-blue-600 text-xl" />}
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
