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
import DocumentOcrUpload from "@/components/DocumentOcrUpload";

export default function StepOneForm({
 step1Form,
  kycType,
  setKycType,
  handleVerifyIdentity,
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
  verifiedData,    
  isCKYCHidden,      
  setIsCKYCHidden,
  isOtherKycHidden,  
  setIsOtherKycHidden,
  setQuoteData,
  setNewPincode,
  setOldPincode,
  onSubmitStep ,
  setPlanType,
  setInsureMemberData
}) 
{
  //  console.log(kycType,isOtherKycHidden)
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
  const [isVerifying, setIsVerifying] = useState(false);

  const [fetchedPincode, setFetchedPincode] = useState("");
  const [hasUserChangedPin, setHasUserChangedPin] = useState(false);

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

  // House / Building Name
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


  const handleDateChange = useCallback(
    (key, field) => (date) => {
      if (date instanceof Date && !isNaN(date)) {
        const formatted = format(date, "dd-MM-yyyy");
        setDates((prev) => ({ ...prev, [key]: date }));
        step1Form.setValue(field, formatted, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    },
    [step1Form]
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
                  constant.API.HEALTH.BAJAJMHCP9.CHANGEPINCODE,
                  "POST",
                  { newpincode: value }
                );
                if (quoteResponse?.status) {
                  setQuoteData({
                    totalpremium: quoteResponse.totalpremium,
                    basepremium: quoteResponse.basepremium,
                    coverage: quoteResponse.coverage,
                  });
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
    [fetchedPincode, step1Form, setOldPincode, setNewPincode, setQuoteData]
  );

  useEffect(() => {
    const fetchDataONE = async () => {
      try {
        const res = await CallApi(
          constant.API.HEALTH.BAJAJMHCP9.SAVESTEPONE,
          "GET"
        );
        setUsersData(res);
        if (res?.members) {
          setInsureMemberData(res.members);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDataONE();
  }, [step1Form,setInsureMemberData]);

  useEffect(() => {
    if (!usersData || isUserPrefilled) return;

    const user = usersData.data || {};
    const userInfo = usersData.user?.[0] || {};
    const contact = JSON.parse(user.contact_details || "{}");
    const permanent = JSON.parse(user.permanent_address || "{}");
    const comm = JSON.parse(user.comunication_address || "{}");
 setPlanType(usersData.plantype);
const typeMap = {
  c: "CKYC",
  o: "Others",
};

const kycCode = usersData.cacheData?.toLowerCase();
const kycLabel = typeMap[kycCode];


    const set = step1Form.setValue;
    const directFields = {
      proposername: user.kyc_name,
      mr_ms_gender: user.gender,
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

    if (user.dob) {
      const [dd, mm, yyyy] = user.dob.split("-");
      const dob = new Date(`${yyyy}-${mm}-${dd}`);
      handleDateChange("customerpancardno", "customerpancardDob")(dob);
      handleDateChange("proposal", "proposerdob1")(dob);
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

    setIsUserPrefilled(true);
  }, [
    usersData,
    isUserPrefilled,
    setKycType,
    setKycVerified,
    setIsCKYCHidden,
    setIsOtherKycHidden,
    step1Form,
    handlePincodeInput,
    handleDateChange,
    setSameAddress,
    setPlanType
  ]);

useEffect(() => {
    if (
      !verifiedData ||
      Object.keys(verifiedData).length === 0 ||
      isVerifiedPrefilled
    )
      return;

    const set = step1Form.setValue;

    let finalFullName = verifiedData.fullName || "";
    // console.log("verifiedData",verifiedData)
    if (verifiedData.firstName) {
      const parts = [
        verifiedData.firstName,
        verifiedData.middleName,
        verifiedData.lastName
      ].filter(Boolean);
      
      finalFullName = parts.join(" ").trim();
    }

    const map = {
      docNumber: "customerpancardno",
      dob: "customerpancardDob",
      gender: "mr_ms_gender",
      proposaldob: "proposerdob1",
      address1: "house",
      address2: "colony",
      pincode: "Pincode",
      city: "City",
      state: "State",
    };

    const isNameDirty = step1Form.formState?.dirtyFields?.proposername;
    if (finalFullName && !isNameDirty) {
      set("proposername", finalFullName);
    }

    Object.entries(map).forEach(([apiKey, formKey]) => {
      const isDirty = step1Form.formState?.dirtyFields?.[formKey];
      if (verifiedData[apiKey] && !isDirty) {
        
        if (apiKey === "dob" && verifiedData.dob) {
          try {
            const [dd, mm, yyyy] = verifiedData.dob.split("-");
            const parsedDate = new Date(`${yyyy}-${mm}-${dd}`);
            
            handleDateChange("customerpancardno", "customerpancardDob")(parsedDate);
            handleDateChange("proposal", "proposerdob1")(parsedDate);
          } catch (e) {
            console.error("Date parse error", e);
          }
        } 
        else if (apiKey === "gender" && verifiedData.gender) {
          const g = verifiedData.gender?.toUpperCase();
          set(formKey, g === "M" || g === "MALE" ? "Mr" : "Ms");
        } 
        else {
          set(formKey, verifiedData[apiKey]);
          
          if (formKey === "Pincode") {
            handlePincodeInput({ target: { name: "Pincode", value: verifiedData[apiKey] } });
          }
        }
      }
    });

    if (verifiedData.kyctype === "c") setIsCKYCHidden(true);
    if (verifiedData.kyctype === "o") setIsOtherKycHidden(true);

    setIsVerifiedPrefilled(true);
  }, [
    verifiedData,
    isVerifiedPrefilled,
    step1Form,
    handleDateChange,
    setIsCKYCHidden,
    setIsOtherKycHidden,
    handlePincodeInput
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


  if (kycType !== "CKYC") {
    unregister("ckycSubType");
    unregister("docNumber");
    unregister("docDob");
    unregister("docGender");
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

      <label className="block font-semibold cursor-pointer">
        Select Proposer
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
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
  {["CKYC", "Others"].map((type) => (
    <label
      key={type}
                         className={`relative flex items-center px-4 py-3 rounded-md border text-sm w-full transition-all duration-200
  ${type === "Others"
      ? "opacity-50 cursor-not-allowed bg-gray-100"
      : "cursor-pointer"}
  ${
    kycType === type
      ? "border-pink-500 bg-pink-50"
      : "border-gray-400 bg-white"
  }`}
    >
      <input
        {...step1Form.register("kycType")}
        type="checkbox"
        value={type}
        checked={kycType === type}
        disabled={type === "Others"}
        onChange={() => setKycType(type)}
        className="mr-2 accent-pink-500 h-4 w-4"
      />
      {type}
    </label>
  ))}
</div>

{kycType === "CKYC" && !isCKYCHidden && (
  <div className="mt-3">
    <label className="block font-semibold">Select Identity Type</label>
    <select
      {...step1Form.register("ckycSubType", { required: "Please select identity type" })}
      value={step1Form.watch("ckycSubType") || ""}
      onChange={(e) => step1Form.setValue("ckycSubType", e.target.value, { shouldValidate: true })}
      className={inputClass}
    >
      <option value="">-- Select Identity --</option>
      <option value="A">Passport</option>
      <option value="B">Voter ID</option>
      <option value="C">PAN</option>
      <option value="D">Driving License</option>
      <option value="E">UID (Aadhar)</option>
      <option value="F">NREGA Job Card</option>
      <option value="G">GSTIN (Corporate)</option>
      <option value="Z">CKYC Number</option>
    </select>
  </div>
)}


{kycType === "CKYC" && !isCKYCHidden && step1Form.watch("ckycSubType") && (
  <div className="space-y-2 mt-3">
    <label className="block font-semibold">Provide Identity Info</label>
     <div className="flex flex-col md:flex-row gap-4">
       <select
        {...step1Form.register("docGender", { required: "Gender required" })}
        className="h-[40px] px-3 border border-gray-300 rounded-md text-sm w-full md:w-[150px]"
      >
        <option value="">Gender</option>
        <option value="M">Male</option>
        <option value="F">Female</option>
      </select>
      <input
        {...step1Form.register("docNumber", { required: "Document number required" })}
        placeholder="Document Number"
       className="h-[40px] px-4 border border-gray-300 rounded-md text-sm w-full md:w-[220px]"
      />

      <Controller
        control={step1Form.control}
        name="docDob"
        rules={{ required: "DOB is required" }}
        render={({ field, fieldState }) => (
          <UniversalDatePicker
            id="docDob"
            name="docDob"
            value={field.value ? parse(field.value, "dd-MM-yyyy", new Date()) : null}
            onChange={(date) => {
              if (date instanceof Date && !isNaN(date)) {
                field.onChange(format(date, "dd-MM-yyyy"));
              }
            }}
            placeholder="Pick DOB"
            error={!!fieldState.error}
            errorText={fieldState.error?.message}
          />
        )}
      />
    </div>

<button
  type="button"
  onClick={async () => {
    setIsVerifying(true);
    const ckycValues = step1Form.getValues([
      "ckycSubType",
      "docNumber",
      "docDob",
      "docGender",
    ]);
    await handleVerifyIdentity(ckycValues);
    setIsVerifying(false);
  }}
  className="px-6 py-2 thmbtn text-wrap flex items-center justify-center gap-2"
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
        setIsVerifying(true);
        await handleVerifyOther();
        setIsVerifying(false);
      }}
       className="px-6 py-2 thmbtn text-wrap flex items-center justify-center gap-2"
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
  disabled={kycVerified}
  className="border border-gray-300 px-3 py-2 rounded text-sm md:col-span-2 disabled:bg-gray-100"
>
  <option value="">Mr/Ms</option>
  <option value="Mr">Mr</option>
  <option value="Ms">Ms</option>
  <option value="Mrs">Mrs</option>
</select>

            <input
  {...step1Form.register("proposername")}
  placeholder="Full Name as per your ID Card"
  readOnly={kycVerified}
  onInput={(e) => {
    if (!kycVerified) {
      e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
    }
  }}
  className="border border-gray-300 px-3 py-2 rounded text-sm w-full md:col-span-6 read-only:bg-gray-100"
/>

            <div className="md:col-span-4">
             <Controller
                control={step1Form.control}
                name="proposerdob1"
                rules={{ required: "Please select a valid date" }}
                render={({ field, fieldState }) => (
                  <UniversalDatePicker
                    {...field}
                    id="proposerdob1"
                    name="proposerdob1"
                    className={inputClass}
                    disabled={kycVerified} 
                    value={
                      field.value
                        ? parse(field.value, "dd-MM-yyyy", new Date())
                        : null
                    }
                    onChange={(date) => {
                      if (!kycVerified && date instanceof Date && !isNaN(date)) {
                        const formatted = format(date, "dd-MM-yyyy");
                        setDates((prev) => ({ ...prev, proposal: date }));
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

      <label className="block font-semibold cursor-pointer">
        Current Address
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["house", "colony", "Landmark", "City", "State", "Pincode"].map(
          (field) => (
            <input
              key={field}
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
            <input
              key={field}
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
          ))}
        </div>
      )}

      <label className="block font-semibold cursor-pointer">
        Contact Details
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <input
          {...step1Form.register("contactemail")}
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
