"use client";
import React, { useState, useEffect, useCallback } from "react";
import { isAlpha, isNumber } from "@/styles/js/validation";
import { FiLoader, FiUploadCloud, FiCheckCircle } from "react-icons/fi";
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
  const [docLoading, setDocLoading] = useState(false);
  const [docUploaded, setDocUploaded] = useState(false);
  const [dates, setDates] = useState({
    pancardno: "",
    aadhar: "",
    proposal: "",
  });

  const handleDateChange = useCallback(
    (key, field) => (date) => {
      const formatted = format(date, "dd-MM-yyyy");
      setDates((prev) => ({ ...prev, [key]: date }));
      step1Form.setValue(field, formatted, { shouldValidate: true });
    },
    [step1Form],
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
    [step1Form],
  );

  // ---------------- Document OCR Handler ----------------
  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setDocLoading(true);
    try {
      const response = await fetch(
        "https://api.digibima.in/python/document/gettext",
        {
          method: "POST",
          body: formData,
        }
      );

      const resData = await response.json();
      console.log(response);
      console.log("resData", resData);

      if (resData?.status && resData?.data) {
        const data = resData.data;
        showSuccess("Document details extracted successfully!");
        setDocUploaded(true);

        // Auto-populate Father's Name into Proofs state & Form
        if (data.father_name) {
          setProofs((prev) => ({
            ...prev,
            fatherName: data.father_name,
          }));
          step1Form.setValue("fathername", data.father_name, { shouldValidate: true });
        }

        // Auto-populate Name
        if (data.name) {
          step1Form.setValue("name", data.name, { shouldValidate: true });
          step1Form.setValue("proposername", data.name, { shouldValidate: true });
        }

        // Auto-populate DOB
        if (data.dob) {
          const formattedDob = data.dob.replace(/\//g, "-");
          step1Form.setValue("proposaldob", formattedDob, { shouldValidate: true });
          step1Form.setValue("proposerdob1", formattedDob, { shouldValidate: true });
        }

        // Auto-populate Gender Prefix
        if (data.gender) {
          const gen = data.gender.toUpperCase();
          const genderPrefix = gen.includes("FEMALE") || gen === "F" ? "Ms" : "Mr";
          step1Form.setValue("mr_ms_gender", genderPrefix, { shouldValidate: true });
        }

        // Auto-populate Mobile
        if (data.mobile) {
          step1Form.setValue("contactmobile", data.mobile, { shouldValidate: true });
        }

        // Auto-populate Address fields
        if (data.address) {
          step1Form.setValue("address", data.address, { shouldValidate: true });
        }
        if (data.colony) {
          step1Form.setValue("colony", data.colony, { shouldValidate: true });
        }
        if (data.landmark) {
          step1Form.setValue("landmark", data.landmark, { shouldValidate: true });
        }
        if (data.city || data.district) {
          step1Form.setValue("city", data.city || data.district, { shouldValidate: true });
        }
        if (data.state) {
          step1Form.setValue("state", data.state, { shouldValidate: true });
        }
        if (data.pincode) {
          step1Form.setValue("pincode", data.pincode, { shouldValidate: true });
          handlePincodeInput({ target: { name: "pincode", value: data.pincode } });
        } else if (data.address) {
          const matchedPin = data.address.match(/\b\d{6}\b/);
          if (matchedPin && matchedPin[0]) {
            const pin = matchedPin[0];
            step1Form.setValue("pincode", pin, { shouldValidate: true });
            handlePincodeInput({ target: { name: "pincode", value: pin } });
          }
        }
      } else {
        showError("Unable to extract details from the uploaded file.");
      }
    } catch (err) {
      console.error("Document upload API error:", err);
      showError("Failed to upload and parse document.");
    } finally {
      setDocLoading(false);
    }
  };

  // Sync hidden "name" & "proposaldob" fields with "proposername" & "proposerdob1"
  const proposerNameWatch = step1Form.watch("proposername");
  const proposerDobWatch = step1Form.watch("proposerdob1");

  useEffect(() => {
    if (proposerNameWatch) {
      step1Form.setValue("name", proposerNameWatch, { shouldValidate: true });
    }
  }, [proposerNameWatch, step1Form]);

  useEffect(() => {
    if (proposerDobWatch) {
      step1Form.setValue("proposaldob", proposerDobWatch, { shouldValidate: true });
    }
  }, [proposerDobWatch, step1Form]);

  //------------------------- verify already ----------------------------
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

    if (kycLabel) {
      setKycType(kycLabel);
      step1Form.setValue("kycType", kycLabel, { shouldValidate: true });
      setKycVerified(true);

      if (kycCode === "p") {
        setIsPanVerified(true);
        setIsPanKycHidden(true);
      }
      if (kycCode === "a") {
        setIsPanVerified(true);
        setIsAadharKycHidden(true);
      }
      if (kycCode === "o") {
        setIsPanVerified(true);
        setIsOtherKycHidden(true);
      }
    }

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
      step1Form.setValue("proposerdob1", userinfodata.userdob || "");
      step1Form.setValue("name", userinfodata.username || "");
      step1Form.setValue("proposername", userinfodata.username || "");
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
      name: "kyc_name",
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
  }, [usersData, step1Form, handlePincodeInput]);

  const isPanAlreadyVerified = isPanVerified;

  useEffect(() => {
    if (!verifieddata || Object.keys(verifieddata).length === 0) return;
    const set = step1Form.setValue;

    const map = {
      pan: "pancardno",
      dob: "pancardDob",
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
          set("proposaldob", verifieddata.dob);
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
      set("name", fullName);
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
    address: ["AADHAR", "PASSPORT", "VOTER ID", "DRIVING LICENSE", "FORM 60"],
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
      step1Form.setValue("proposername", journeydata.name || "");
      step1Form.setValue("name", journeydata.name || "");
      step1Form.setValue("proposerdob1", journeydata.dob || "");
      step1Form.setValue("proposaldob", journeydata.dob || "");

      const contact = safeParse(journeydata.contact_details);
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
      unregister("pancardDob");
    }
    if (kycType !== "Aadhar ( Last 4 Digits )") {
      unregister("aadharno");
      unregister("aadharName");
      unregister("aadharDob");
      unregister("aadhargender");
    }
    if (kycType !== "Others") {
      unregister("identityProof");
      unregister("addressProof");
    }
  }, [kycType, step1Form.unregister]);

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <h2 className="text-2xl font-bold text-[#2F4A7E] mb-1">
        Great! Let’s Start with proposer details
      </h2>
      <p className="text-gray-500">We’ll begin with some basic information.</p>
      <input type="hidden" {...step1Form.register("step")} value="one" />

      {/* Hidden inputs to preserve backend payload values */}
      <input type="hidden" {...step1Form.register("name")} />
      <input type="hidden" {...step1Form.register("proposaldob")} />

      {cardata?.under == "company" && (
        <div>
          <label className="block font-semibold text-sm mb-1">
            Name & Date of Incorporation<span className="text-red-500">*</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <select
              {...step1Form.register("ms")}
              className={`text-sm md:col-span-2 ${inputClass}`}
            >
              <option value="">Mr/Ms</option>
              <option value="Mr">Mr</option>
              <option value="Ms">Ms</option>
              <option value="Mrs">Mrs</option>
            </select>

            <input
              {...step1Form.register("companyname")}
              placeholder="Company Name"
              className={`text-sm w-full md:col-span-6 ${inputClass}`}
            />

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

      {/* ------------ SINGLE ROW COMPACT UPLOAD DOCUMENT FIELD ------------ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
        <div className="flex flex-row items-center justify-between p-2.5 px-3 border border-dashed border-cyan-400 rounded-md bg-cyan-50/40 gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <FiUploadCloud className="text-cyan-600 text-base flex-shrink-0" />
            <span className="text-xs font-medium text-gray-700 truncate">
              Quick Auto-Fill via Document OCR
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {docUploaded && (
              <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                <FiCheckCircle /> Filled
              </span>
            )}
            <input
              type="file"
              id="doc-quick-upload"
              className="hidden"
              accept="image/*,application/pdf"
              onChange={handleDocumentUpload}
              disabled={docLoading}
            />
            <label
              htmlFor="doc-quick-upload"
              className={`px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium rounded cursor-pointer flex items-center gap-1 transition-all whitespace-nowrap ${
                docLoading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {docLoading ? (
                <>
                  <FiLoader className="animate-spin" /> Uploading...
                </>
              ) : (
                "Upload Doc"
              )}
            </label>
          </div>
        </div>

        {/* Column 2: Blank Column */}
        <div></div>
      </div>

      <label className="block font-semibold cursor-pointer">Proposer KYC</label>
      <div className="flex flex-col sm:flex-row gap-3">
        {["PAN Card", "Aadhar ( Last 4 Digits )", "Others"].map((type) => (
          <label
            key={type}
            className={`relative flex items-center px-4 py-3 rounded-md border text-sm w-full transition-all duration-200
  ${
    type === "PAN Card" || type === "Aadhar ( Last 4 Digits )"
      ? "opacity-50 cursor-not-allowed bg-gray-100"
      : "cursor-pointer"
  }
  ${
    kycType === type ? "border-gray-400 bg-white" : "border-gray-400 bg-white"
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
              disabled={
                type === "PAN Card" || type === "Aadhar ( Last 4 Digits )"
              }
              onChange={() => setKycType(type)}
              className="mr-2 accent-pink-500 h-4 w-4"
            />

            {type}
          </label>
        ))}
      </div>

      {/* PAN Card Section */}
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

      {/* Aadhar Section */}
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

      {/* Others Section */}
      {kycType === "Others" && !isOtherKycHidden && (
        <div className="space-y-6">
          <div className="max-w-xs w-full">
            <label className="labelcls">Father&apos;s Name</label>
            <input
              type="text"
              className={inputClass}
              value={proofs.fatherName || ""}
              onChange={(e) => {
                const val = e.target.value;
                setProofs((prev) => ({ ...prev, fatherName: val }));
                step1Form.setValue("fathername", val);
              }}
              placeholder="Father Name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(fields).map(([type, options]) => (
              <div key={type}>
                <label className="labelcls uppercase">
                  {type} Proof Type <span className="text-xs text-red-500 font-normal lowercase">(pdf only)</span>
                </label>

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
                        delete newFiles[`${type}-${previousProofType}`];
                        return newFiles;
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

                {proofs[type] && (
                  <div className="mt-2 space-y-2">
                    <label
                      htmlFor={`${type}-${proofs[type]}`}
                      className="block w-full cursor-pointer border border-gray-300 p-2 rounded-md flex items-center justify-between bg-gray-100 hover:bg-gray-200 overflow-hidden"
                    >
                      <span className="truncate block w-full text-sm text-gray-700">
                        Selected:{" "}
                        <span title={fileNames[`${type}-${proofs[type]}`]}>
                          {fileNames[`${type}-${proofs[type]}`]?.slice(0, 30) ||
                            "Choose PDF File"}
                          {fileNames[`${type}-${proofs[type]}`]?.length > 30
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
                      id={`${type}-${proofs[type]}`}
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) {
                          if (selectedFile.type !== "application/pdf") {
                            showError("Only PDF files are allowed for identity/address proofs.");
                            e.target.value = "";
                            return;
                          }
                          setFileNames({
                            ...fileNames,
                            [`${type}-${proofs[type]}`]: selectedFile.name || "",
                          });
                        }
                      }}
                    />

                    <input
                      type="text"
                      placeholder={
                        proofs[type] === "AADHAR"
                          ? "AADHAR NO. (LAST 4 DIGIT)"
                          : `${proofs[type]} NO`
                      }
                      className={inputClass}
                      maxLength={
                        proofValidationRules[proofs[type]]?.maxLength ||
                        undefined
                      }
                      inputMode={
                        proofValidationRules[proofs[type]]?.inputMode || "text"
                      }
                      pattern={
                        proofValidationRules[proofs[type]]?.pattern || undefined
                      }
                      value={proofs[`${type}Value`] || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (proofs[type] === "AADHAR") {
                          if (/^\d{0,4}$/.test(value)) {
                            setProofs({ ...proofs, [`${type}Value`]: value });
                          }
                        } else if (proofs[type] === "PAN") {
                          if (/^[A-Z0-9]{0,10}$/i.test(value)) {
                            setProofs({
                              ...proofs,
                              [`${type}Value`]: value.toUpperCase(),
                            });
                          }
                        } else {
                          setProofs({ ...proofs, [`${type}Value`]: value });
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            ))}

            <div>
              <label className="labelcls">Upload Media</label>
              <div className="flex flex-col gap-2 items-start">
                <input
                  type="file"
                  id="media-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const objectUrl = URL.createObjectURL(file);
                      setMediaPreview(objectUrl);
                    }
                  }}
                />

                <label
                  htmlFor="media-upload"
                  className="px-4 py-2 bg-cyan-500 text-white rounded cursor-pointer"
                >
                  Choose Photo
                </label>
                {mediaPreview && (
                  <div className="relative w-24 h-24">
                    <Image
                      name="insurephoto"
                      src={mediaPreview}
                      alt="Preview"
                      fill
                      className="object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const missingFields = [];
              const finalData = {
                fathername: proofs.fatherName,
                proofs: {},
                insurephoto: mediaPreview,
              };

              if (!proofs.fatherName?.trim()) {
                missingFields.push("Father's Name");
              }

              Object.entries(fields).forEach(([type]) => {
                const selectedProofType = proofs[type];
                const proofKey = `${type}-${selectedProofType}`;

                if (!selectedProofType) {
                  missingFields.push(`${type} Proof Type`);
                } else {
                  if (!fileNames[proofKey]) {
                    missingFields.push(`${selectedProofType} File`);
                  }
                  if (!proofs[`${type}Value`]) {
                    missingFields.push(`${selectedProofType} NO`);
                  }

                  finalData.proofs[type] = {
                    type: selectedProofType,
                    fileName: fileNames[proofKey],
                    value: proofs[`${type}Value`],
                  };
                }
              });

              if (!mediaPreview) {
                missingFields.push("Upload Media");
              }

              if (missingFields.length > 0) {
                showError(`Please fill: ${missingFields.join(", ")}`);
                return;
              }

              handleVerifyOther(finalData);
            }}
            className="px-4 py-2 thmbtn flex items-center gap-2"
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