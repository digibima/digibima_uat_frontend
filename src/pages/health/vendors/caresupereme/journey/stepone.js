"use client";
import React, { useState, useEffect, useCallback } from "react";
import { isAlpha, isNumber } from "@/styles/js/validation";
import { FiLoader } from "react-icons/fi";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import UniversalDatePicker from "../../../../datepicker/index";
import { CallApi } from "@/api";
import constant from "@/env";
import { format, parse } from "date-fns";
import { Controller } from "react-hook-form";
import { getDBData, storeDBData, deleteDBData,clearDBData  } from "@/api";
import DocumentOcrUpload from "@/components/DocumentOcrUpload";

export default function StepOneForm({
  step1Form,
  kycType,
  setKycType,
  handleVerifyPan,
  handleVerifyAadhar,
  handleVerifyOther,
  loading,
  sameAddress,
  setSameAddress,
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
  verifiedData,
  setStepOneData,
  kycData,
  isPanKycHidden,
  setIsPanKycHidden,
  isAadharKycHidden,
  setIsAadharKycHidden,
  isOtherKycHidden,
  setIsOtherKycHidden,
  setQuoteData,
  setOldPincode,
  setNewPincode,
  setPlanType,
  setPortTenure,
  setSelfData,

  panOtpVisible,
  setPanOtpVisible,
  panOtpValue,
  setPanOtpValue,
  setIsPanOtpVerifying,
  handleVerifyPanOtp,
  isPanOtpVerifying,
  updateUrlPremium,
  setVerifiedData,
  setInsureMemberData
}) {
  const isPanAlreadyVerified = isPanVerified;
  const [dates, setDates] = useState({
    customerpancardno: "",
    aadhar: "",
    proposal: "",
  });
  const [priceChangeLoading, setPriceChangeLoading] = useState(false);
  const [usersData, setUsersData] = useState(false);
  const [isUserPrefilled, setIsUserPrefilled] = useState(false);
  const [isVerifiedPrefilled, setIsVerifiedPrefilled] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  const [isVerifyingPan, setIsVerifyingPan] = useState(false);
  const [isVerifyingAadhar, setIsVerifyingAadhar] = useState(false);
  const [isVerifyingOther, setIsVerifyingOther] = useState(false);

  const [fetchedPincode, setFetchedPincode] = useState("");
  const [hasUserChangedPin, setHasUserChangedPin] = useState(false);
  const [isKycLocked, setIsKycLocked] = useState(false);

  // STATES TO HIDE KYC SECTIONS

  const handleDateChange = useCallback(
    (key, field) => (date) => {
      if (date instanceof Date && !isNaN(date)) {
        const formatted = format(date, "dd-MM-yyyy");
        // field.onChange(formatted);

        // const formatted = format(date, "dd-MM-yyyy");
        setDates((prev) => ({ ...prev, [key]: date }));
        step1Form.setValue(field, formatted, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    },
    [step1Form],
  );
  const handlePincodeInput = useCallback(
    async (e) => {
      const value = e.target.value.trim();
      const fieldId = e.target.name || e.target.id;

      if (!/^\d{6}$/.test(value)) return;

      try {
        const res = await CallApi(constant.API.HEALTH.ACPINCODE, "POST", {
          pincode: value,
        });

        if (res?.length > 0) {
          const { state, district } = res[0];

          if (fieldId === "Pincode") {
            step1Form.setValue("City", district);
            step1Form.setValue("State", state);

            if (!fetchedPincode) {
              setFetchedPincode(value);
              setOldPincode(value);
              setHasUserChangedPin(false);
            } else if (value !== fetchedPincode) {
              setHasUserChangedPin(true);
              step1Form.setValue("newpincode", value);
              setNewPincode(value);

              try {
                const quoteResponse = await CallApi(
                  constant.API.HEALTH.CARESUPEREME.CHANGEPINCODE,
                  "POST",
                  { newpincode: value },
                );
                if (quoteResponse?.status) {
                  const updatedQuote = {
                    totalpremium: quoteResponse.totalpremium,
                    basepremium: quoteResponse.basepremium,
                    coverage: quoteResponse.coverage,
                  };
                  setQuoteData(updatedQuote);
                  updateUrlPremium(
                    updatedQuote.totalpremium,
                    updatedQuote.basepremium,
                    updatedQuote.coverage,
                  );
                 await clearDBData();
                }
              } catch (error) {
                console.error("CHANGEPINCODE error:", error);
              }
            }
          } else if (fieldId === "commcurrentPincode") {
            step1Form.setValue("commcurrentCity", district);
            step1Form.setValue("commcurrentState", state);
          }
        } else {
          if (fieldId === "Pincode") {
            step1Form.setValue("City", "");
            step1Form.setValue("State", "");
          } else if (fieldId === "commcurrentPincode") {
            step1Form.setValue("commcurrentCity", "");
            step1Form.setValue("commcurrentState", "");
          }
        }
      } catch (error) {
        console.error("Pincode API Error:", error);
      }
    },
  [
  fetchedPincode,
  step1Form,
  setOldPincode,
  setNewPincode,
  setQuoteData,
  updateUrlPremium
]
  );


const handleOcrData = (data) => {
  console.log("Extracted OCR Data:", data); 

  const set = (key, val) => {
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      step1Form.setValue(key, String(val).trim(), { shouldValidate: true });
    }
  };

  set("customerName", data.name);
  set("proposername", data.name);
  set("name", data.name);

  if (data.dob) {
    const formattedDob = data.dob.replace(/\//g, "-");
    set("customerpancardDob", formattedDob);
    set("proposerdob1", formattedDob);
    set("proposaldob", formattedDob);
  }

  if (data.gender) {
    const gen = data.gender.toUpperCase();
    const isFemale = gen.includes("FEMALE") || gen === "F";
    set("customerGender", isFemale ? "FEMALE" : "MALE");
    set("mr_ms_gender", isFemale ? "Ms" : "Mr");
  }

  set("customerMobile", data.mobile);
  set("contactmobile", data.mobile);

  const fullAddress = data.address || "";
  
  const addressParts = fullAddress.split(",").map((part) => part.trim()).filter(Boolean);


  const houseValue =
    data.house ||
    data.house_no ||
    data.building ||
    data.premise ||
    (addressParts.length > 0 ? addressParts.slice(0, 2).join(", ") : fullAddress);

  const colonyValue =
    data.colony ||
    data.street ||
    data.area ||
    data.sector ||
    (addressParts.length > 2 ? addressParts[2] : "");

  const landmarkValue =
    data.landmark ||
    data.landmark_name ||
    data.locality ||
    data.location ||
    (addressParts.length > 3 ? addressParts.slice(3).join(", ") : "");

  set("house", houseValue);
  set("address", houseValue);
  set("commcurrenthouse", houseValue);

  set("colony", colonyValue || houseValue);
  set("commcurrentcolony", colonyValue || houseValue);

  set("Landmark", landmarkValue || houseValue);
  set("landmark", landmarkValue || houseValue);
  set("commcurrentLandmark", landmarkValue || houseValue);
  set("commcurrentlandmark", landmarkValue || houseValue);

  const cityValue = data.city || data.district;
  set("City", cityValue);
  set("city", cityValue);
  set("commcurrentCity", cityValue);
  set("commcurrentcity", cityValue);

  set("State", data.state);
  set("state", data.state);
  set("commcurrentState", data.state);
  set("commcurrentstate", data.state);

  const pin = data.pincode || fullAddress.match(/\b\d{6}\b/)?.[0];
  if (pin) {
    set("Pincode", pin);
    set("pincode", pin);
    set("commcurrentPincode", pin);
    set("commcurrentpincode", pin);

    handlePincodeInput?.({ target: { name: "Pincode", value: pin } });
    handlePincodeInput?.({ target: { name: "pincode", value: pin } });
  }
};
  useEffect(() => {
    const fetchDataONE = async () => {
      try {
        const res = await CallApi(
          constant.API.HEALTH.CARESUPEREME.SAVESTEPONE,
          "GET",
        );
        setUsersData(res);
        setInsureMemberData(res.members);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDataONE();
  }, [step1Form,setStepOneData,setInsureMemberData]);

  useEffect(() => {
    if (!usersData || isUserPrefilled) return;

    const user = usersData.data || {};
    const userInfo = usersData.user?.[0] || {};
    const contact = JSON.parse(user.contact_details || "{}");
    const permanent = JSON.parse(user.permanent_address || "{}");
    const comm = JSON.parse(user.comunication_address || "{}");
    setPlanType(usersData.plantype);
    setPortTenure(usersData.tenure);

const members = usersData?.members;

if (Array.isArray(members)) {
  const selfMember = members.find(
    (m) => m?.name?.toLowerCase() === "self"
  ) || members[0];
  
  if (selfMember) {
    setSelfData([
      {
        ...selfMember, 
        id: selfMember.id || "",
        age: Number(selfMember.age || ""),
        dob: selfMember.dob || "",
        gender: (selfMember.gender || "").toLowerCase(),
      },
    ]);
    
    if (selfMember.dob) {
      step1Form.setValue("modalDob", selfMember.dob);
    }
  }
}


    const typeMap = {
      p: "PAN Card",
      a: "Aadhar ( Last 4 Digits )",
      o: "Others",
    };

    const kycCode = usersData.cacheData?.toLowerCase();
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

    const set = step1Form.setValue;
    const directFields = {
      // proposername: user.kyc_name,
      // mr_ms_gender: user.gender,
      contactemail: userInfo.email,
      contactmobile: userInfo.mobile,
      contactemergency: contact.contactemergency,
      house: permanent.address1,
      colony: permanent.address2,
      Landmark: permanent.landmark,
      City: permanent.city,
      State: permanent.state,
      Pincode: userInfo.pincode,
    };

    Object.entries(directFields).forEach(([formKey, value]) => {
      const isDirty = step1Form.formState?.dirtyFields?.[formKey];
      if (value && !isDirty) {
        set(formKey, value, { shouldValidate: true });

        if (formKey === "Pincode") {
          set("oldpincode", value, { shouldValidate: true });
          handlePincodeInput({ target: { name: "Pincode", value } });
        }
      }
    });

    if (user.pan) {
      set("customerpancardno", user.pan, { shouldValidate: true });
    }

 // selfMember ki dhoondhi hui DOB array se nikal kar dono form fields mein set karein
    const membersArray = usersData?.members;
    const targetSelf = Array.isArray(membersArray) 
      ? membersArray.find((m) => m?.name?.toLowerCase() === "self") || membersArray[0]
      : null;

    const liveDob = targetSelf?.dob || user.dob; // Response format: "11-06-2001" ya "dd-MM-yyyy"

    if (liveDob) {
      set("customerpancardDob", liveDob, { shouldValidate: true, shouldDirty: true });

      // UniversalDatePicker ke local dates object map state ko sync rakhein
      const [dd, mm, yyyy] = liveDob.split("-");
      const parsedDateObj = new Date(`${yyyy}-${mm}-${dd}`);
      
      setDates((prev) => ({
        ...prev,
        customerpancardno: parsedDateObj,
      }));
    }

    if (comm.status === "1") {
      setSameAddress(false);

      const commFields = {
        commcurrenthouse: comm.commcurrenthouse,
        commcurrentcolony: comm.commcurrentcolony,
        commcurrentLandmark: comm.commcurrentlandmark,
        commcurrentCity: comm.commcurrentcity,
        commcurrentState: comm.commcurrentstate,
        commcurrentPincode: comm.commcurrentpincode,
      };

      Object.entries(commFields).forEach(([formKey, value]) => {
        if (value) {
          set(formKey, value, { shouldValidate: true });
          if (formKey === "commcurrentPincode") {
            handlePincodeInput({
              target: { name: "commcurrentPincode", value },
            });
          }
        }
      });
    }
  // ================= PAN KYC DATA AUTO FILL =================
    if (
      usersData?.cacheData === "p" &&
      usersData?.kycdata &&
      !isVerifiedPrefilled
    ) {
      const { name, gender, getdob } = usersData.kycdata;

      if (name) {
        step1Form.setValue("proposername", name, {
          shouldValidate: true,
        });
        // Agar aapke full name input form field ka id 'customerName' hai, toh use bhi set karein:
        step1Form.setValue("customerName", name, { shouldValidate: true });
      }

      // Gender mapping aur UI fill logic update
      if (gender) {
        const rawGender = gender.toUpperCase();
        
        // 1. Parent verified details ki key set karein ("Mr" / "Ms")
        // const mappedGender = (rawGender === "MALE" || rawGender === "M") ? "Mr" : "Ms";
        // step1Form.setValue("mr_ms_gender", mappedGender, { shouldValidate: true });

        // 2. FIX: UI par input select box ya radio ("MALE" / "FEMALE") ko select dikhane ke liye
        const formCustomerGender = (rawGender === "MALE" || rawGender === "M") ? "MALE" : "FEMALE";
        step1Form.setValue("customerGender", formCustomerGender, { shouldValidate: true });
      }

      // DOB
      if (getdob) {
        const [dd, mm, yyyy] = getdob.split("-");
        const dob = new Date(`${yyyy}-${mm}-${dd}`);
        handleDateChange("proposal", "proposerdob1")(dob);
        handleDateChange("customerpancardno", "customerpancardDob")(dob);
      }

      if (usersData?.cacheData === "p") {
        setIsKycLocked(true);
      }
    }

    setIsUserPrefilled(true);
  }, [
    usersData,
    isUserPrefilled,
    setKycType,
    setKycVerified,
    setIsPanVerified,
    setIsPanKycHidden,
    setIsAadharKycHidden,
    setIsOtherKycHidden,
    step1Form,
    handlePincodeInput,
    handleDateChange,
    setSameAddress,
    setPlanType,
    setPortTenure,
    setSelfData,
     isVerifiedPrefilled,
  ]);

useEffect(() => {
  // 1️⃣ Pehle state check karein, agar khali ho toh sessionStorage se recover karein
  let currentVerifiedData = verifiedData;
  if (!currentVerifiedData || Object.keys(currentVerifiedData).length === 0) {
    const savedKyc = sessionStorage.getItem("care_verified_kyc_data");
    if (savedKyc) {
      try {
        currentVerifiedData = JSON.parse(savedKyc);
        if (typeof setVerifiedData === "function") {
          setVerifiedData(currentVerifiedData); // Parent state sync
        }
      } catch (e) {
        console.error("Error parsing cached kyc data", e);
      }
    }
  }

  if (
    !currentVerifiedData ||
    Object.keys(currentVerifiedData).length === 0 ||
    isVerifiedPrefilled
  )
    return;

  const set = step1Form.setValue;

  // 2️⃣ Dono cases ke liye keys handle karein (Direct PAN Data aur OTP Verified Data)
  const nameValue = currentVerifiedData.proposalname || currentVerifiedData.name || "";
  const dobValue = currentVerifiedData.proposaldob || currentVerifiedData.dob || "";
  const genderValue = currentVerifiedData.gender || "";

  // 3️⃣ Name Populating
  if (nameValue) {
    set("proposername", nameValue, { shouldValidate: true });
    set("customerName", nameValue, { shouldValidate: true });
  }

  // 4️⃣ Gender Populating ("Mr" / "Ms")
  if (genderValue) {
    set("mr_ms_gender", genderValue, { shouldValidate: true });
    
    // UI selection mapping ("MALE" / "FEMALE")
    const customerGenderMapped = (genderValue === "Mr" || genderValue.toUpperCase() === "MALE") ? "MALE" : "FEMALE";
    set("customerGender", customerGenderMapped, { shouldValidate: true });
  }

  // 5️⃣ Date of Birth Populating (Dono fields + DatePicker State Map Sync)
  if (dobValue) {
    set("proposerdob1", dobValue, { shouldValidate: true, shouldDirty: true });
    set("customerpancardDob", dobValue, { shouldValidate: true, shouldDirty: true });

    try {
      const [dd, mm, yyyy] = dobValue.split("-");
      const parsedDateObj = new Date(`${yyyy}-${mm}-${dd}`);
      if (!isNaN(parsedDateObj.getTime())) {
        setDates((prev) => ({
          ...prev,
          proposal: parsedDateObj,
          customerpancardno: parsedDateObj,
        }));
      }
    } catch (err) {
      console.error("Error parsing DOB object:", err);
    }
  }

  // 6️⃣ Address, Email & remaining fields map if present
  const optionalMap = {
    pan: "customerpancardno",
    permLine1: "house",
    permLine2: "colony",
    permLine3: "Landmark",
    permCity: "City",
    permState: "State",
    permPin: "Pincode",
    email: "contactemail",
  };

  Object.entries(optionalMap).forEach(([apiKey, formKey]) => {
    const isDirty = step1Form.formState?.dirtyFields?.[formKey];
    if (currentVerifiedData[apiKey] && !isDirty) {
      set(formKey, currentVerifiedData[apiKey], { shouldValidate: true });
    }
  });

  // 7️⃣ KYC Sections Hide and Lock Logic
  const currentKycType = currentVerifiedData.kyctype || "p";
  if (currentKycType === "p") setIsPanKycHidden(true);
  if (currentKycType === "a") setIsAadharKycHidden(true);
  if (currentKycType === "o") setIsOtherKycHidden(true);

  setIsVerifiedPrefilled(true);
  
  if (currentKycType === "p") {
    setIsKycLocked(true);
  }
}, [
  verifiedData,
  isVerifiedPrefilled,
  step1Form,
  handleDateChange,
  setIsPanKycHidden,
  setIsAadharKycHidden,
  setIsOtherKycHidden,
  setVerifiedData,
]);

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

  useEffect(() => {
    const unregister = step1Form.unregister;
    if (kycType !== "PAN Card") {
      unregister("customerpancardno");
      unregister("customerpancardDob");
    }
    if (kycType !== "Aadhar ( Last 4 Digits )") {
      unregister("aadharLast4");
      unregister("aadharName");
      unregister("aadharDob");
      unregister("aadharGender");
    }
    if (kycType !== "Others") {
      unregister("identityProof");
      unregister("addressProof");
      // optional: unregister file upload fields too
    }
  }, [kycType, step1Form.unregister]);

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <h2 className="text-2xl font-bold text-[#2F4A7E] mb-1">
        Great! Let’s Start with proposer details
      </h2>
      <p className="text-gray-500">We’ll begin with some basic information.</p>

      <label className="block font-semibold cursor-pointer">
        Select Proposer
      </label>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 items-center">
  <select
    {...step1Form.register("proposar", {
      required: "Please select a proposer",
    })}
    className={inputClass}
  >
    <option value="SELF">SELF</option>
  </select>

  <DocumentOcrUpload onExtracted={handleOcrData} id="vendor1-ocr" />
</div>
      
      <input type="hidden" {...step1Form.register("oldpincode")} />
      <input
        type="hidden"
        {...step1Form.register("newpincode")}
        value="000000"
      />
      <label className="block font-semibold cursor-pointer">Proposer KYC</label>
      <div className="flex flex-col sm:flex-row gap-3">
        {["PAN Card", "Aadhar ( Last 4 Digits )", "Others"].map((type) => (
          <label
            key={type}
             className={`relative flex items-center px-4 py-3 rounded-md border text-sm w-full transition-all duration-200
  ${type === "Aadhar ( Last 4 Digits )"
      ? "opacity-50 cursor-not-allowed bg-gray-100"
      : "cursor-pointer"}
  ${
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
               disabled={type === "Aadhar ( Last 4 Digits )"}
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
        <div className="space-y-3">
          <label className="block font-semibold text-sm text-gray-700">
            Please Provide PAN Card Info
          </label>

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-3">
            {/* Gender */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="customerGender"
              >
                Gender
              </label>

              <select
                id="customerGender"
                {...step1Form.register("customerGender")}
                className="h-[40px] px-3 border border-gray-300 rounded-md text-sm w-full"
              >
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1 md:col-span-5">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="customerName"
              >
                Full Name
              </label>

              <input
                id="customerName"
                {...step1Form.register("customerName")}
                placeholder="As per PAN"
                className="h-[40px] px-3 border border-gray-300 rounded-md text-sm w-full"
              />
            </div>

            {/* Mobile */}
            <div className="flex flex-col gap-1 md:col-span-3">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="customerMobile"
              >
                Mobile Number
              </label>

              <input
                id="customerMobile"
                {...step1Form.register("customerMobile")}
                maxLength={10}
                placeholder="Enter Mobile"
                className="h-[40px] px-3 border border-gray-300 rounded-md text-sm w-full"
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                  step1Form.setValue("customerMobile", onlyNums);
                }}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* PAN */}
            <div className="flex flex-col gap-1 md:col-span-3">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="customerpancardno"
              >
                PAN Number
              </label>

              <input
                id="customerpancardno"
                {...step1Form.register("customerpancardno")}
                maxLength={10}
                placeholder="ABCDE1234F"
                className="h-[40px] px-3 border border-gray-300 rounded-md text-sm w-full"
                onChange={(e) => {
                  const upper = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "");

                  step1Form.setValue("customerpancardno", upper);
                }}
              />
            </div>

            {/* DOB */}
            <div className="flex flex-col gap-1 md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>

              <Controller
                control={step1Form.control}
                name="customerpancardDob"
                rules={{ required: "DOB is required" }}
                render={({ field, fieldState }) => (
                  <UniversalDatePicker
                    id="customerpancardDob"
                    name="customerpancardDob"
                    value={
                      field.value
                        ? parse(field.value, "dd-MM-yyyy", new Date())
                        : null
                    }
                    onChange={(date) => {
                      if (date instanceof Date && !isNaN(date)) {
                        field.onChange(format(date, "dd-MM-yyyy"));
                      }
                    }}
                    error={!!fieldState.error}
                    errorText={fieldState.error?.message}
                    placeholder="Select DOB"
                  />
                )}
              />
            </div>

            {/* Verify */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <input
                type="button"
                onClick={async () => {
                  setIsVerifyingPan(true);
                  await handleVerifyPan();
                  setIsVerifyingPan(false);
                }}
                disabled={isPanAlreadyVerified || isVerifyingPan}
                value={
                  isPanAlreadyVerified
                    ? "VERIFIED"
                    : isVerifyingPan
                      ? "Verifying..."
                      : "VERIFY"
                }
                className={`px-4 py-2 thmbtn cursor-pointer
          ${isPanAlreadyVerified ? "bg-green-600 cursor-not-allowed" : ""}
          ${isVerifyingPan ? "opacity-70 cursor-not-allowed" : ""}
        `}
              />
            </div>
          </div>

          {/* OTP */}
          {panOtpVisible && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="flex flex-col gap-1 md:col-span-3">
                <input
                  id="panOtp"
                  value={panOtpValue}
                  maxLength={6}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                    setPanOtpValue(onlyNums);
                  }}
                  placeholder="Enter OTP"
                  className="h-[40px] px-3 border border-gray-300 rounded-md text-sm w-full"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <input
                  type="button"
                  onClick={async () => {
                    try {
                      setIsPanOtpVerifying(true);
                      await handleVerifyPanOtp();
                    } finally {
                      setIsPanOtpVerifying(false);
                    }
                  }}
                  disabled={isPanOtpVerifying}
                  value={isPanOtpVerifying ? "Verifying..." : "Verify OTP"}
                  className={`thmbtn px-4 py-2 cursor-pointer
    ${isPanOtpVerifying ? "opacity-70 cursor-not-allowed" : ""}
  `}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {kycType === "Aadhar ( Last 4 Digits )" && (
        <div className="space-y-3">
          <label className="block font-semibold text-sm text-gray-700">
            Please Provide Aadhar Card Info
          </label>

          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-4">
            {/* Gender */}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="aadharGender"
              >
                Gender
              </label>

              <select
                id="aadharGender"
                {...step1Form.register("aadharGender")}
                className="border border-gray-300 px-3 py-2 rounded w-full text-sm"
              >
                <option value="">Select</option>
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Mrs">Mrs</option>
              </select>
            </div>

            {/* Aadhar Last 4 */}
            <div className="flex flex-col gap-1 sm:col-span-5">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="aadharLast4"
              >
                Aadhar Last 4 Digits
              </label>

              <input
                id="aadharLast4"
                type="text"
                {...step1Form.register("aadharLast4")}
                maxLength={4}
                onChange={(e) => isNumber(e, step1Form.setValue, "aadharLast4")}
                placeholder="Enter Last 4 Digits"
                className="border border-gray-300 px-3 py-2 rounded w-full text-sm"
              />
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1 sm:col-span-5">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="aadharName"
              >
                Full Name
              </label>

              <input
                id="aadharName"
                type="text"
                {...step1Form.register("aadharName")}
                onChange={(e) => isAlpha(e, step1Form.setValue, "aadharName")}
                placeholder="As per Aadhar"
                className="border border-gray-300 px-3 py-2 rounded w-full text-sm"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            {/* DOB */}
            <div className="flex flex-col gap-1 sm:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>

              <UniversalDatePicker
                id="aadharDob"
                name="aadharDob"
                value={dates.aadhar}
                onChange={(date) => {
                  if (date instanceof Date && !isNaN(date)) {
                    handleDateChange("aadhar", "aadharDob");
                  }
                }}
                placeholder="Select DOB"
                error={!dates.aadhar}
                errorText="Please select a valid date"
              />
            </div>

            {/* Verify Button */}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 opacity-0">
                Verify
              </label>

              <button
                type="button"
                onClick={async () => {
                  setIsVerifyingAadhar(true);
                  await handleVerifyAadhar();
                  setIsVerifyingAadhar(false);
                }}
                className="px-6 py-2 thmbtn flex items-center justify-center gap-2"
                disabled={isVerifyingAadhar}
              >
                {isVerifyingAadhar ? (
                  <>
                    <span>Verifying</span>
                    <FiLoader className="animate-spin text-base" />
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
        <div className="space-y-2">
          <label className="block font-semibold cursor-pointer">
            Please Provide Other Card Info
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.entries(fields).map(([type, options]) => (
              <div key={type}>
                <label className="block text-sm font-medium mb-1 uppercase text-gray-700">
                  {type} PROOF TYPE
                </label>
                <select
                  className={`w-full ${inputClass}`}
                  onChange={(e) =>
                    setProofs({ ...proofs, [type]: e.target.value })
                  }
                  value={proofs[type] || ""}
                >
                  <option value="">Select Type</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                {proofs[type] && (
                  
                  <div className="relative mt-2">
                    <label
                      htmlFor={`${type}-${proofs[type]}`}
                      className="block w-full cursor-pointer border-2 border-dashed border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-4 py-2 rounded-md text-center truncate"
                    >
                      <UploadFileIcon
                        className="text-indigo-500 mb-2 mr-1"
                        fontSize="small"
                      />
                      {fileNames[`${type}-${proofs[type]}`] || "Upload File"}
                    </label>
                    <input
                      id={`${type}-${proofs[type]}`}
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        setFileNames({
                          ...fileNames,
                          [`${type}-${proofs[type]}`]:
                            e.target.files?.[0]?.name || "",
                        })
                      }
                    />
                  </div>
                )}


              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={async () => {
              setIsVerifyingOther(true);
              await handleVerifyOther();
              setIsVerifyingOther(false);
            }}
            className="px-6 py-2 thmbtn text-wrap flex items-center justify-center gap-2"
            disabled={isVerifyingOther}
          >
            {isVerifyingOther ? (
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
        <div className="space-y-3">
          <label className="block font-semibold text-sm text-gray-700">
            Proposer&apos;s Details
          </label>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Gender */}
            <div className="flex flex-col md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>

              <select
                {...step1Form.register("mr_ms_gender")}
                disabled={isKycLocked}
                className="border border-gray-300 px-3 py-2 rounded text-sm w-full focus:outline-none focus:ring-1 focus:ring-pink-400"
              >
                <option value="">Select</option>
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Mrs">Mrs</option>
              </select>
            </div>

            {/* Full Name */}
            <div className="flex flex-col md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>

              <input
                {...step1Form.register("proposername")}
                readOnly={isKycLocked}
                placeholder="As per your ID Card"
                className="border border-gray-300 px-3 py-2 rounded text-sm w-full focus:outline-none focus:ring-1 focus:ring-pink-400"
              />
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>

              <div
                className={isKycLocked ? "pointer-events-none opacity-70" : ""}
              >
                <Controller
                  control={step1Form.control}
                  disabled={isKycLocked}
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
                      disabled={isKycLocked}
                      onChange={(date) => {
                        if (date instanceof Date && !isNaN(date)) {
                          const formatted = format(date, "dd-MM-yyyy");
                          setDates((prev) => ({ ...prev, proposal: date }));
                          field.onChange(formatted);
                        }
                      }}
                      placeholder="Select DOB"
                      error={!!fieldState.error}
                      errorText={fieldState.error?.message}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <label className="block font-semibold cursor-pointer">
        Current Address
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["house", "colony", "Landmark", "City", "State", "Pincode"].map(
          (field) => (
            <div key={field} className="flex flex-col">
              {/* Label */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.replace(/^[a-z]/, (c) => c.toUpperCase())}
              </label>

              {/* Input */}
              <input
                {...step1Form.register(field, {
                  onChange:
                    field === "Pincode"
                      ? (e) => isNumber(e, step1Form.setValue, "Pincode")
                      : undefined,
                })}
                onInput={
                  field === "Pincode"
                    ? (e) => {
                        handlePincodeInput(e);
                      }
                    : undefined
                }
                placeholder={field.replace(/^[a-z]/, (c) => c.toUpperCase())}
                className={inputClass}
                maxLength={field === "Pincode" ? 6 : undefined}
              />
            </div>
          ),
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
            if (same) setUserInteracted(false);

            const get = step1Form.getValues;
            const set = step1Form.setValue;

            if (same) {
              [
                ["house", "commcurrenthouse"],
                ["colony", "commcurrentcolony"],
                ["Landmark", "commcurrentLandmark"],
                ["City", "commcurrentCity"],
                ["State", "commcurrentState"],
                ["Pincode", "commcurrentPincode"],
              ].forEach(([permanent, communication]) => {
                const value = get(permanent) || "";
                set(communication, value, { shouldValidate: true });
                if (
                  communication === "commcurrentPincode" &&
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
                "commcurrentLandmark",
                "commcurrentCity",
                "commcurrentState",
                "commcurrentPincode",
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
            "commcurrentLandmark",
            "commcurrentCity",
            "commcurrentState",
            "commcurrentPincode",
          ].map((field) => (
            <div key={field} className="flex flex-col">
              {/* Label */}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field
                  .replace("comm", "")
                  .replace(/([A-Z])/g, " $1")
                  .trim()}
              </label>

              {/* Input */}
              <input
                {...step1Form.register(field, {
                  onChange: (e) => {
                    if (field === "commcurrentPincode") {
                      isNumber(e, step1Form.setValue, field);
                      handlePincodeInput(e);
                    }
                    setUserInteracted(true);
                  },
                })}
                placeholder={field
                  .replace("comm", "")
                  .replace(/([A-Z])/g, " $1")
                  .trim()}
                className={inputClass}
                maxLength={field === "commcurrentPincode" ? 6 : undefined}
              />
            </div>
          ))}
        </div>
      )}

      <label className="block font-semibold cursor-pointer">
        Contact Details
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {/* Email */}
        <div className="flex flex-col gap-1">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="contactemail"
          >
            Email Address
          </label>

          <input
  id="contactemail"
  {...step1Form.register("contactemail")}
  placeholder="Enter Email"
  className={inputClass}
  onKeyDown={(e) => {
    if (e.key === " ") {
      e.preventDefault();
    }
  }}
  onInput={(e) => {
    e.target.value = e.target.value.replace(/\s/g, "");
  }}
/>
        </div>

        {/* Mobile */}
        <div className="flex flex-col gap-1">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="contactmobile"
          >
            Mobile Number
          </label>

          <input
            id="contactmobile"
            {...step1Form.register("contactmobile", {
              onChange: (e) => isNumber(e, step1Form.setValue, "contactmobile"),
            })}
            placeholder="Enter Mobile"
            className={inputClass}
            maxLength={10}
          />
        </div>

        {/* Emergency */}
        <div className="flex flex-col gap-1">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="contactemergency"
          >
            Emergency Contact
          </label>

          <input
            id="contactemergency"
            {...step1Form.register("contactemergency", {
              onChange: (e) =>
                isNumber(e, step1Form.setValue, "contactemergency"),
            })}
            placeholder="Enter Emergency Number"
            className={inputClass}
            maxLength={10}
          />
        </div>
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
