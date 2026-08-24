"use client";
import React, { useState, useEffect, useCallback } from "react";
import { isAlpha, isNumber } from "@/styles/js/validation";
import { FiLoader } from "react-icons/fi";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import UniversalDatePicker from "../../../../../datepicker/index";
import { CallApi } from "@/api";
import constant from "@/env";
import { format, parse } from "date-fns";
import { Controller } from "react-hook-form";
import { showSuccess, showError } from "@/layouts/toaster";
import Image from "next/image";
import { dummyUploadimage } from "@/images/Image";

export default function StepOneForm({
  step1Form,
  kycType,
  setKycType,
  handleVerifyPan,
  handleVerifyAadhar,
  handleVerifyOther,
  loading,
  fileNames,
  setFileNames,
  proofFiles,
  setProofFiles,
  proofs,
  setProofs,
  inputClass,
  kycVerified,
  setKycVerified,
  setIsPanVerified,
  onSubmitStep,
  isPanVerified,
  verifieddata,
  setStepOneData,
  usersData,
  kycData,
  cardata,
  sameAddress,
  setSameAddress,
  journeydata,
  userinfodata,
  isPanKycHidden,
  setIsPanKycHidden,
  isAadharKycHidden,
  setIsAadharKycHidden,
  isOtherKycHidden,
  setIsOtherKycHidden,
}) {
  const [mediaPreview, setMediaPreview] = useState(null);
  const [dates, setDates] = useState({
    pancardno: "",
    aadhar: "",
    proposal: "",
  });
   const [isVerifying, setIsVerifying] = useState(false);

  const handleDateChange = useCallback(
    (key, field) => (date) => {
      const formatted = format(date, "dd-MM-yyyy");
      setDates((prev) => ({ ...prev, [key]: date }));
      step1Form.setValue(field, formatted, { shouldValidate: true });
    },
    [step1Form]
  );
  const handlePincodeInput = useCallback(
    async (e) => {
      const value = e.target.value;
      const fieldId = e.target.name || e.target.id;
      if (value && value.length === 6) {
        try {
          const res = await CallApi(constant.API.HEALTH.ACPINCODE, "POST", {
            pincode: value,
          });

          if (res?.length > 0) {
            const { state, district } = res[0];

            if (fieldId === "pincode") {
              step1Form.setValue("city", district);
              step1Form.setValue("state", state);
            } else if (fieldId === "commcurrentpincode") {
              step1Form.setValue("commcurrentcity", district);
              step1Form.setValue("commcurrentstate", state);
            }
          }
        } catch (error) {
          console.error("Error fetching pincode info:", error);
        }
      }
    },
    [step1Form]
  );
  //------------------------- verifiy already ----------------------------
  const hasPrefilledUsersData = React.useRef(false);
  useEffect(() => {
    if (!kycData) return;

    const typeMap = {
      p: "PAN Card",
      a: "Aadhar ( Last 4 Digits )",
      o: "Others",
    };

    const kycCode = kycData.kyctype?.toLowerCase();
    const kycLabel = typeMap[kycCode];

    // if (kycLabel) {
    //   setKycType(kycLabel);
    //   step1Form.setValue("kycType", kycLabel, { shouldValidate: true });
    //   setKycVerified(true);

    //   if (kycCode === "p") {
    //     setIsPanVerified(true);
    //     setIsPanKycHidden(true);
    //   }
    //   if (kycCode === "a") {
    //     setIsPanVerified(true);
    //     setIsAadharKycHidden(true);
    //   }
    //   if (kycCode === "o") {
    //     setIsPanVerified(true);
    //     setIsOtherKycHidden(true);
    //   }
    // }

    const formatted = typeMap[kycData?.kyctype?.toLowerCase()];
    if (formatted) {
      setKycType(formatted);
      step1Form.setValue("kycType", formatted, { shouldValidate: true });
      setKycVerified(true);
    }
  }, [
    kycData,
    setKycType,
    setIsPanVerified,
    setIsPanKycHidden,
    setIsAadharKycHidden,
    setIsOtherKycHidden,
    setKycVerified,
    step1Form,
  ]);

  useEffect(() => {
    if (!userinfodata) return;
    if (cardata?.under === "individual") {
      step1Form.setValue("proposaldob", userinfodata.userdob || "");
      step1Form.setValue("name", userinfodata.username || "");
    }
  }, [userinfodata, cardata?.under, step1Form]);

  useEffect(() => {
    if (!journeydata) return;
    if (cardata?.under === "company") {
      const safeParse = (val) => {
        try {
          return val ? JSON.parse(val) : {};
        } catch {
          return {};
        }
      };
      const company = safeParse(journeydata.company_details);
      step1Form.setValue("ms", company.ms || "");
      step1Form.setValue("companyname", company.companyname || "");
      step1Form.setValue("dobincorporation", company.dobincorporation || "");
      step1Form.setValue("gstnumber", company.gstnumber || "");
    }
  }, [journeydata, cardata?.under, step1Form]);

  useEffect(() => {
    if (!usersData || hasPrefilledUsersData.current) return;

    const set = step1Form.setValue;

    const directFields = {
      proposername: "kyc_name",
      mr_ms_gender: "mr_mrs",
      email: "email",
      contactmobile: "mobile",
      contactemergency: "emergency_mobile",
      address: "address",
      colony: "colony",
      landmark: "landmark",
      city: "city",
      state: "state",
      pincode: "pincode",
    };

    Object.entries(directFields).forEach(([formKey, userKey]) => {
      if (usersData[userKey]) {
        set(formKey, usersData[userKey], { shouldValidate: true });
      }
      if (formKey === "pincode") {
        handlePincodeInput({
          target: { name: "pincode", value: usersData[userKey] },
        });
      }
    });

    // step1Form.setValue("email", usersData.email || "");
    // step1Form.setValue("contactmobile", usersData.mobile || "");
    // step1Form.setValue("pincode", usersData.pincode || "");
  }, [usersData, step1Form, handlePincodeInput]);

  const isPanAlreadyVerified = isPanVerified;

  useEffect(() => {
    if (!verifieddata || Object.keys(verifieddata).length === 0) return;
    const set = step1Form.setValue;

    const map = {
      pan: "pancardno",
      dob: "pancarddob",
      gender: "mr_ms_gender",
      proposalname: "proposername",
      proposaldob: "proposerdob1",
      permLine1: "address",
      permLine2: "colony",
      permLine3: "landmark",
      permCity: "city",
      permState: "state",
      permPin: "pincode",
      email: "email",
    };

    Object.entries(map).forEach(([apiKey, formKey]) => {
      if (verifieddata[apiKey]) {
        if (apiKey === "dob") {
          const [dd, mm, yyyy] = verifieddata.dob.split("-");
          handleDateChange(
            "proposal",
            "proposerdob1"
          )(new Date(`${yyyy}-${mm}-${dd}`));
        } else if (apiKey === "gender") {
          const g = verifieddata.gender?.toUpperCase();
          set(formKey, g === "M" ? "Mr" : g === "F" ? "Ms" : "");
        } else {
          set(formKey, verifieddata[apiKey]);
        }
      }
    });

    const fullName = `${verifieddata.firstName || ""} ${
      verifieddata.lastName || ""
    }`.trim();
    if (fullName) {
      set("proposername", fullName);
      set("customerAadharName", fullName);
    }

    if (verifieddata.permCorresSameflag === "Y") {
      setSameAddress(true);
      ["address", "colony", "landmark", "city", "state", "pincode"].forEach(
        (key) => {
          set(`commcurrent${key}`, step1Form.getValues(key));
        }
      );
    }
  }, [verifieddata, step1Form, handleDateChange, setSameAddress]);

  useEffect(() => {
    if (!sameAddress) return;

    const get = step1Form.getValues;
    const set = step1Form.setValue;

    const syncFields = () => {
      [
        ["address", "commcurrenthouse"],
        ["colony", "commcurrentcolony"],
        ["landmark", "commcurrentlandmark"],
        ["city", "commcurrentcity"],
        ["state", "commcurrentstate"],
        ["pincode", "commcurrentpincode"],
      ].forEach(([permanent, communication]) => {
        set(communication, get(permanent));
      });
    };

    const subscription = step1Form.watch((values, { name }) => {
      const permKeys = [
        "address",
        "colony",
        "landmark",
        "city",
        "state",
        "pincode",
      ];
      if (permKeys.includes(name)) {
        syncFields();
      }
    });

    return () => subscription.unsubscribe();
  }, [sameAddress, step1Form, handleDateChange, setSameAddress]);

  const fields = {
    identity: [
      "AADHAR",
      "PAN",
      "PASSPORT",
      "VOTER ID",
      "DRIVING LICENSE",
      "FORM 60",
    ],
  };
  const proofValidationRules = {
    AADHAR: { maxLength: 4, inputMode: "numeric", pattern: "\\d*" },
    PAN: { maxLength: 10, inputMode: "text", pattern: "[A-Z0-9]*" },
    PASSPORT: { maxLength: 9, inputMode: "text" },
    VOTERID: { maxLength: 12, inputMode: "text" },
    "VOTER ID": { maxLength: 12, inputMode: "text" },
    "DRIVING LICENSE": { maxLength: 16, inputMode: "text" },
    "FORM 60": { maxLength: 10, inputMode: "text" },
  };

  useEffect(() => {
    if (journeydata && Object.keys(journeydata).length > 0) {
      const safeParse = (val) => {
        try {
          return val ? JSON.parse(val) : {};
        } catch {
          return {};
        }
      };
      step1Form.setValue("mr_ms_gender", journeydata.gender || "");
      step1Form.setValue("proposername", journeydata.name || "" || "");

      step1Form.setValue("proposerdob1", journeydata.dob || "");

      const contact = safeParse(journeydata.contact_details);
      // step1Form.setValue("contactmobile", contact.contactmobile || "");
      step1Form.setValue("contactemergency", contact.contactemergency || "");

      const address = safeParse(journeydata.permanent_address);
      step1Form.setValue("address", address.address1 || "");
      step1Form.setValue("colony", address.address2 || "");
      step1Form.setValue("landmark", address.landmark || "");
      step1Form.setValue("city", address.city || "");
      step1Form.setValue("state", address.state || "");
      step1Form.setValue("pincode", address.pincode || "");

      const comm = safeParse(journeydata.comunication_address);
      step1Form.setValue("commcurrenthouse", comm.commcurrenthouse || "");
      step1Form.setValue("commcurrentcolony", comm.commcurrentcolony || "");
      step1Form.setValue("commcurrentlandmark", comm.commcurrentlandmark || "");
      step1Form.setValue("commcurrentcity", comm.commcurrentcity || "");
      step1Form.setValue("commcurrentstate", comm.commcurrentstate || "");
      step1Form.setValue("commcurrentpincode", comm.commcurrentpincode || "");
    }
  }, [journeydata, step1Form]);
  useEffect(() => {
    const unregister = step1Form.unregister;
    if (kycType !== "PAN Card") {
      unregister("pancardno");
      unregister("pancarddob");
    }
    if (kycType !== "Aadhar ( Last 4 Digits )") {
      unregister("aadharno");
      unregister("aadharName");
      unregister("aadharDob");
      unregister("aadhargender");
    }
    if (kycType !== "Others") {
      unregister("identityProof");
      // optional: unregister file upload fields too
    }
  }, [kycType, step1Form.unregister]);

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <h2 className="text-2xl font-bold text-[#2F4A7E] mb-1">
        Great! Let’s Start with proposer details
      </h2>
      <p className="text-gray-500">We’ll begin with some basic information.</p>
      <input type="hidden" {...step1Form.register("step")} value="one" />
      {cardata?.under == "individual" && (
        <div>
          <label className="block font-semibold cursor-pointer">
            Name & DOB *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <input
              {...step1Form.register("name")}
              placeholder="Full Name as per your ID Card"
              className={inputClass}
            />

            <Controller
              control={step1Form.control}
              name="proposaldob"
              rules={{ required: "Please select a valid date" }}
              render={({ field, fieldState }) => (
                <UniversalDatePicker
                  id="proposaldob"
                  name="proposaldob"
                  className={inputClass}
                  value={
                    field.value
                      ? parse(field.value, "dd-MM-yyyy", new Date())
                      : null
                  }
                  onChange={(date) => {
                    if (date instanceof Date && !isNaN(date)) {
                      const formatted = format(date, "dd-MM-yyyy");
                      field.onChange(formatted);
                    }
                  }}
                  placeholder="Pick a date"
                  error={!!fieldState.error}
                  errorText={fieldState.error?.message}
                />
              )}
            />
          </div>
        </div>
      )}
      {cardata?.under == "company" && (
        <div>
          <label className="block font-semibold text-sm mb-1">
            Name & Date of Incorporation<span className="text-red-500">*</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* M/S Select */}
            <select
              {...step1Form.register("ms")}
              className={`text-sm md:col-span-2 ${inputClass}`}
            >
              <option value="">Mr/Ms</option>
              <option value="Mr">Mr</option>
              <option value="Ms">Ms</option>
              <option value="Mrs">Mrs</option>
            </select>

            {/* Company Name */}
            <input
              {...step1Form.register("companyname")}
              placeholder="Company Name"
              className={`text-sm w-full md:col-span-6 ${inputClass}`}
            />

            {/* Date of Incorporation */}
            <div className="md:col-span-4">
              <Controller
                control={step1Form.control}
                name="dobincorporation"
                rules={{ required: "Please select a valid date" }}
                render={({ field, fieldState }) => (
                  <UniversalDatePicker
                    id="dobincorporation"
                    name="dobincorporation"
                    className={inputClass}
                    value={
                      field.value
                        ? parse(field.value, "dd-MM-yyyy", new Date())
                        : null
                    }
                    onChange={(date) => {
                      if (date instanceof Date && !isNaN(date)) {
                        const formatted = format(date, "dd-MM-yyyy");
                        field.onChange(formatted);
                      }
                    }}
                    placeholder="Pick a date"
                    error={!!fieldState.error}
                    errorText={fieldState.error?.message}
                  />
                )}
              />
            </div>
          </div>
        </div>
      )}

      <label className="block font-semibold cursor-pointer">Proposer KYC</label>
      <div className="flex flex-col sm:flex-row gap-3">
        {["PAN Card", "Aadhar ( Last 4 Digits )", "Others"].map((type) => (
          <label
            key={type}
            className={`relative flex items-center px-4 py-3 rounded-md border text-sm cursor-pointer w-full transition-all duration-200 ${
              kycType === type
                ? "border-gray-400 bg-white"
                : "border-gray-400 bg-white"
            }`}
          >
            {kycType === type && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-ping opacity-70"></span>
            )}
            <input
              {...step1Form.register("kycType")}
              type="checkbox"
              value={type}
              checked={kycType === type}
              // disabled={kycVerified}
              onChange={() => setKycType(type)}
              // onChange={() => !kycVerified && setKycType(type)}
              className="mr-2 accent-pink-500 h-4 w-4"
            />

            {type}
          </label>
        ))}
      </div>

      {/* PAN Card Section - Hidden if already verified via PAN */}
      {kycType === "PAN Card" && !isPanKycHidden && (
        <div className="space-y-2">
          <label className="block font-semibold cursor-pointer">
            Please Provide PAN Card Info
          </label>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              {...step1Form.register("pancardno")}
              maxLength={10}
              placeholder="PAN No."
              className="h-[40px] px-4 border border-gray-300 rounded-md text-sm w-full md:w-[220px]"
              onChange={(e) => {
                const upper = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "");
                step1Form.setValue("pancardno", upper);
              }}
            />

           <Controller
              control={step1Form.control}
              name="pancarddob"
              rules={{ required: "DOB is required" }}
              render={({ field, fieldState }) => (
                <UniversalDatePicker
                  id="pancarddob"
                  name="pancarddob"
                  value={
                    field.value
                      ? parse(field.value, "dd-MM-yyyy", new Date())
                      : null
                  }
                  onChange={(date) => {
                    if (date instanceof Date && !isNaN(date)) {
                      const formatted = format(date, "dd-MM-yyyy");
                      field.onChange(formatted);
                    }
                   
                  }}
                  error={!!fieldState.error}
                  errorText={fieldState.error?.message}
                  placeholder="Pick a date"
                />
              )}
            />

            <input
              type="button"
              onClick={handleVerifyPan}
              disabled={isPanAlreadyVerified || loading}
              value={
                isPanAlreadyVerified
                  ? "VERIFIED"
                  : loading
                  ? "Verifying..."
                  : "VERIFY"
              }
              className={`px-4 py-2 thmbtn
      ${isPanAlreadyVerified ? "bg-green-600 cursor-not-allowed" : ""}
      ${loading ? "opacity-70 cursor-not-allowed" : ""}
    `}
            />
          </div>
        </div>
      )}

      {kycType === "Aadhar ( Last 4 Digits )" && (
        <div className="space-y-2">
          <label className="block font-medium">
            Please Provide Aadhar Card Info
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-4">
            <select
              {...step1Form.register("aadhargender")}
              className="border border-gray-300 px-3 py-2 rounded w-full text-sm sm:col-span-2"
            >
              <option value="">Mr/Ms</option>
              <option value="Mr">Mr</option>
              <option value="Ms">Ms</option>
              <option value="Mrs">Mrs</option>
            </select>

            <input
              type="text"
              {...step1Form.register("aadharno")}
              maxLength={4}
              onChange={(e) => isNumber(e, step1Form.setValue, "aadharno")}
              placeholder="AADHAR NO. (LAST 4 DIGIT)"
              className="border border-gray-300 px-3 py-2 rounded w-full text-sm sm:col-span-5"
            />

            <input
              type="text"
              {...step1Form.register("aadharName")}
              onChange={(e) => isAlpha(e, step1Form.setValue, "aadharName")}
              placeholder="FULL NAME AS PER AADHAR"
              className="border border-gray-300 px-3 py-2 rounded w-full text-sm sm:col-span-5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-5">
               <Controller
              control={step1Form.control}
              name="aadharDob"
              rules={{ required: "DOB is required" }}
              render={({ field, fieldState }) => (
                <UniversalDatePicker
                  id="aadharDob"
                  name="aadharDob"
                  value={
                    field.value
                      ? parse(field.value, "dd-MM-yyyy", new Date())
                      : null
                  }
                  onChange={(date) => {
                    if (date instanceof Date && !isNaN(date)) {
                      const formatted = format(date, "dd-MM-yyyy");
                      field.onChange(formatted);
                    }
                    // handleDateChange(
                    //   "customerpancardno",
                    //   "customerpancardDob"
                    // )(date);
                  }}
                  error={!!fieldState.error}
                  errorText={fieldState.error?.message}
                  placeholder="Pick a date"
                />
              )}
            />
            </div>

            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleVerifyAadhar}
                className="w-full px-1 py-2 thmbtn flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" /> Verifying...
                  </>
                ) : (
                  "VERIFY"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {kycType === "Others" && !isOtherKycHidden && (
  <div className="space-y-6">
    {/* Proof Type Dropdowns */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(fields).map(([type, options]) => (
        <div key={type}>
          <label className="labelcls uppercase">{type} Proof Type</label>

          {/* Select Dropdown */}
          <select
            className={inputClass}
            value={proofs[type] || ""}
            onChange={(e) => {
              const selected = e.target.value;
              const previousProofType = proofs[type];
              const updatedProofs = { ...proofs, [type]: selected };

              if (previousProofType && previousProofType !== selected) {
                updatedProofs[`${type}Value`] = "";
                setFileNames((prev) => {
                  const newFiles = { ...prev };
                  delete newFiles[`${type}-${previousProofType}-front`];
                  delete newFiles[`${type}-${previousProofType}-back`];
                  return newFiles;
                });
                setProofFiles((prev) => {
                  const newObjs = { ...prev };
                  delete newObjs[`${type}-${previousProofType}-front`];
                  delete newObjs[`${type}-${previousProofType}-back`];
                  return newObjs;
                });
              }

              setProofs(updatedProofs);
            }}
          >
            <option value="">Select Type</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>

    {/* File Upload Section — New Separate Row */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(fields).map(([type]) =>
        proofs[type] ? (
          <React.Fragment key={type}>
            {["front", "back"].map((side) => (
              <div key={`${type}-${side}`}>
                <label
                  htmlFor={`${type}-${proofs[type]}-${side}`}
                  className="block w-full cursor-pointer border border-gray-300 p-2 rounded-md flex items-center justify-between bg-gray-100 hover:bg-gray-200 overflow-hidden"
                >
                  <span className="truncate block w-full text-sm text-gray-700">
                    {side === "front" ? "Front Side:" : "Back Side:"}{" "}
                    <span title={fileNames[`${type}-${proofs[type]}-${side}`]}>
                      {fileNames[`${type}-${proofs[type]}-${side}`]?.slice(0, 30) ||
                        "Choose File"}
                      {fileNames[`${type}-${proofs[type]}-${side}`]?.length > 30
                        ? "..."
                        : ""}
                    </span>
                  </span>
                  <Image
                    src={dummyUploadimage}
                    className="h-5 w-5 ml-2 flex-shrink-0"
                    alt="Upload"
                  />
                </label>

                <input
                  type="file"
                  id={`${type}-${proofs[type]}-${side}`}
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const fileObj = e.target.files?.[0] || null;
                    const key = `${type}-${proofs[type]}-${side}`;

                    setFileNames((prev) => ({
                      ...prev,
                      [key]: fileObj?.name || "",
                    }));

                    setProofFiles((prev) => ({
                      ...prev,
                      [key]: fileObj,
                    }));
                  }}
                />
              </div>
            ))}
          </React.Fragment>
        ) : null
      )}
    </div>

    {/* Verify Button */}
    <button
      type="button"
      onClick={async () => {
        const missingFields = [];
        const finalData = {
          fathername: proofs.fatherName,
          proofs: {},
          insurephoto: mediaPreview,
        };

        Object.entries(fields).forEach(([type]) => {
          const selectedProofType = proofs[type];
          if (!selectedProofType) {
            missingFields.push(`${type} Proof Type`);
          } else {
            const frontKey = `${type}-${selectedProofType}-front`;
            const backKey = `${type}-${selectedProofType}-back`;

            finalData.proofs[type] = {
              type: selectedProofType,
              frontFileName: fileNames[frontKey],
              backFileName: fileNames[backKey],
              frontFileObj: proofFiles[frontKey],
              backFileObj: proofFiles[backKey],
              value: proofs[`${type}Value`],
            };
          }
        });
         setIsVerifying(true);
        await handleVerifyOther(finalData);
        setIsVerifying(false);
      }}
      className="px-4 py-2 thmbtn flex items-center gap-2"
      disabled={isVerifying}
    >
      {isVerifying ? (
        <>
          <span>Verifying</span>
      <FiLoader className="animate-spin text-base" />
        </>
      ) : (
        "VERIFY"
      )}
    </button>
  </div>
)}


      {kycVerified && (
        <div className="space-y-2">
          <label className="block font-semibold text-sm">
            Proposer&apos;s details:
          </label>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <select
              {...step1Form.register("mr_ms_gender")}
              className="border border-gray-300 px-3 py-2 rounded text-sm md:col-span-2"
            >
              <option value="">Mr/Ms</option>
              <option value="Mr">Mr</option>
              <option value="Ms">Ms</option>
              <option value="Mrs">Mrs</option>
            </select>

            <input
              {...step1Form.register("proposername")}
              placeholder="Full Name as per your ID Card"
              className="border border-gray-300 px-3 py-2 rounded text-sm w-full md:col-span-6"
            />

            <div className="md:col-span-4">
              <Controller
                control={step1Form.control}
                name="proposerdob1"
                rules={{ required: "Please select a valid date" }}
                render={({ field, fieldState }) => (
                  <UniversalDatePicker
                    id="proposerdob1"
                    name="proposerdob1"
                    className={inputClass}
                    value={
                      field.value
                        ? parse(field.value, "dd-MM-yyyy", new Date())
                        : null
                    }
                    onChange={(date) => {
                      if (date instanceof Date && !isNaN(date)) {
                        const formatted = format(date, "dd-MM-yyyy");
                        field.onChange(formatted);
                      }
                    }}
                    placeholder="Pick a date"
                    error={!!fieldState.error}
                    errorText={fieldState.error?.message}
                  />
                )}
              />
            </div>
          </div>
        </div>
      )}

      {cardata?.under == "company" && (
        <div>
          <label className="block font-semibold text-sm mb-1">GST Number</label>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                {...step1Form.register("gstnumber")}
                className={inputClass}
                placeholder="Enter GST Number"
              />
            </div>
          </div>
        </div>
      )}

      <label className="block font-semibold cursor-pointer">
        Permanent Address*
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["address", "colony", "landmark", "city", "state", "pincode"].map(
          (field) => (
            <input
              key={field}
              {...step1Form.register(field, {
                onChange:
                  field === "pincode"
                    ? (e) => isNumber(e, step1Form.setValue, "pincode")
                    : undefined,
              })}
              onInput={
                field === "pincode"
                  ? (e) => {
                      handlePincodeInput(e);
                    }
                  : undefined
              }
              placeholder={field.replace(/^[a-z]/, (c) => c.toUpperCase())}
              className={inputClass}
              maxLength={field === "pincode" ? 6 : undefined}
            />
          )
        )}
      </div>
      <label className="block font-semibold cursor-pointer">
        Communication Address
        <input
          type="checkbox"
          checked={sameAddress}
          className="ml-2 accent-pink-500 h-4 w-4"
          onChange={(e) => {
            const same = e.target.checked;
            setSameAddress(same);

            const get = step1Form.getValues;
            const set = step1Form.setValue;

            if (same) {
              [
                ["address", "commcurrenthouse"],
                ["colony", "commcurrentcolony"],
                ["landmark", "commcurrentlandmark"],
                ["city", "commcurrentcity"],
                ["state", "commcurrentstate"],
                ["pincode", "commcurrentpincode"],
              ].forEach(([permanent, communication]) => {
                const value = get(permanent) || "";
                set(communication, value, { shouldValidate: true });
                if (
                  communication === "commcurrentpincode" &&
                  value.length === 6
                ) {
                  handlePincodeInput({
                    target: { name: communication, value },
                  });
                }
              });
            } else {
              [
                "commcurrenthouse",
                "commcurrentcolony",
                "commcurrentlandmark",
                "commcurrentcity",
                "commcurrentstate",
                "commcurrentpincode",
              ].forEach((communication) => {
                set(communication, "", { shouldValidate: true });
              });
            }
          }}
        />
        <span className="ml-2">Same As Permanent Address</span>
      </label>

      {!sameAddress && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {[
            "commcurrenthouse",
            "commcurrentcolony",
            "commcurrentlandmark",
            "commcurrentcity",
            "commcurrentstate",
            "commcurrentpincode",
          ].map((field) => (
            <input
              key={field}
              {...step1Form.register(field, {
                onChange:
                  field === "commcurrentpincode"
                    ? (e) =>
                        isNumber(e, step1Form.setValue, "commcurrentpincode")
                    : undefined,
              })}
              onInput={
                field === "commcurrentpincode" ? handlePincodeInput : undefined
              }
              onBlur={
                field === "commcurrentpincode" ? handlePincodeInput : undefined
              }
              placeholder={field
                .replace("comm", "")
                .replace(/([A-Z])/g, " $1")
                .trim()}
              className={inputClass}
              maxLength={field === "commcurrentpincode" ? 6 : undefined}
            />
          ))}
        </div>
      )}

      <label className="block font-semibold cursor-pointer">
        Contact Details
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <input
          {...step1Form.register("email")}
          placeholder="Email Address"
          className={inputClass}
        />
        <input
          {...step1Form.register("contactmobile", {
            onChange: (e) => isNumber(e, step1Form.setValue, "contactmobile"),
          })}
          placeholder="Mobile Number"
          className={inputClass}
          maxLength={10}
        />

        <input
          {...step1Form.register("contactemergency", {
            onChange: (e) =>
              isNumber(e, step1Form.setValue, "contactemergency"),
          })}
          placeholder="Emergency Mobile No."
          className={inputClass}
          maxLength={10}
        />
      </div>

      <button
        type="button"
        onClick={onSubmitStep}
        className="mt-4 px-6 py-2 thmbtn"
      >
        Continue
      </button>
    </form>
  );
}
