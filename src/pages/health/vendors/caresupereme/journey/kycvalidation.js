"use client";

import { CallApi, UploadDocument } from "@/api";
import constant from "@/env";
import { showSuccess, showError } from "@/layouts/toaster";

export default async function validateKycStep(
  selfData,
  step1Form,
  kycType,
  values,
  proofs,
  setKycVerified,
  kycVerified,
  setIsPanVerified,
  setVerifiedData,
  setIsPanKycHidden,
  setIsAadharKycHidden,
  setIsOtherKycHidden,
  setShowPanOtpSection,
  setShowKycMismatchModal,
  setKycMismatchMsg,
  insurememberdata,
  setSelfData
) {
  if (!kycType) return (showError("Please select a KYC type."), false);
  try {
    let payload, res;
    if (kycType === "PAN Card") {
      const {
        customerGender,
        customerName,
        customerMobile,
        customerpancardno,
        customerpancardDob,
      } = values;
      const self = Array.isArray(selfData)
  ? selfData[0]
  : selfData; 
  const panGender = customerGender?.toLowerCase();
const panAge = calculateAgeFromDOB(customerpancardDob);
  console.log(customerGender)
  console.log(panAge)
  console.log(self)
  // return;


// const self = Array.isArray(selfData)
//   ? selfData[0]
//   : selfData; 



 const selfMember = insurememberdata?.find(
  (m) => m.name?.toLowerCase() === "self"
);

console.log("selfMember", selfMember);
console.log("selfMember.dob", selfMember?.dob);
console.log("customerpancardDob", customerpancardDob);

if (selfMember && selfMember.dob !== customerpancardDob) {
  
  const mappedGender = customerGender?.toLowerCase();
  const finalFormGender = (mappedGender === "male" || mappedGender === "m") ? "male" : "female";

  setSelfData?.([
    {
      ...selfMember,
      dob: customerpancardDob, 
      gender: finalFormGender,
      age: panAge 
    },
  ]);

  setKycMismatchMsg?.(
    `PAN date of birth (${customerpancardDob}) does not match with selected member (Self - ${selfMember.dob}).`
  );

  setShowKycMismatchModal?.(true);
  setKycVerified(false);
  return false;
}


      if (!customerGender) return (showError("Gender is required."), false);

      if (!customerName) return (showError("Name is required."), false);

      if (!customerMobile)
        return (showError("Mobile Number is required."), false);

      if (!customerpancardno || !customerpancardDob)
        return (showError("PAN Number and DOB are required."), false);

      if (!/^[A-Za-z\s]+$/.test(customerName.trim()))
        return (showError("Name must contain only letters."), false);

      if (!/^[6-9]\d{9}$/.test(customerMobile))
        return (showError("Mobile number must be valid (10 digits)."), false);

      if (
        !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(customerpancardno.trim().toUpperCase())
      )
        return (showError("Invalid PAN number (e.g., ABCDE1234F)."), false);

      let payload = {
        customerGender,
        customerName,
        customerMobile,
        customerpancardno,
        customerpancardDob,
      };
      console.log("payload",payload)
// return false;
      let res = await CallApi(
        constant.API.HEALTH.CARESUPEREME.PANVERIFY,
        "POST",
        payload,
      );

      // CASE 1: KYC done (existing)
      if (res?.status && res?.kyc === "1") {
        showSuccess("PAN verified");

        setKycVerified(true);
        setIsPanVerified?.(true);
        setIsPanKycHidden?.(true);

        const pd =
          res?.pandata?.getCkycEkycInputIO?.kycDetails?.personalIdentifiableData
            ?.personalDetails;

        if (pd) {
          setVerifiedData?.({
            kyctype: "p",
            name: pd.fullName || "",
            gender: pd.gender || "",
            dob: pd.dob || "",
          });
        }

        return true;
      }

      // CASE 2: OTP generated (NEW)
      if (
        res?.responseData?.message?.toLowerCase()?.includes("otp is generated")
      ) {
        showSuccess("OTP sent to your registered mobile number");
        setShowPanOtpSection?.(true);
        return false;
      }

      showError(
        res?.responseData?.message || res?.message || "PAN verification failed",
      );
      return false;
    } 
    else if (kycType === "Aadhar ( Last 4 Digits )") {
      const {
        customerAadharGender,
        customerAadharno,
        customerAadharName,
        customerAadharDob,
      } = values;

      if (
        !customerAadharGender ||
        !customerAadharno ||
        !customerAadharName ||
        !customerAadharDob
      )
        return (showError("All Aadhar fields are required."), false);

      if (!/^\d{4}$/.test(customerAadharno))
        return (showError("Aadhar must be 4 digits."), false);

      if (!/^[A-Za-z\s]+$/.test(customerAadharName))
        return (showError("Name must contain only letters."), false);

      payload = {
        customerAadharGender,
        customerAadharno,
        customerAadharName,
        customerAadharDob,
      };
      res = await CallApi(constant.API.HEALTH.AADHARVERIFY, "POST", payload);

      if (res?.status) {
        showSuccess("Aadhar verified");
        setKycVerified(true);
        setVerifiedData?.({ kyctype: "a" });
        setIsAadharKycHidden?.(true);
        return true;
      }

      showError(
        res?.responseData?.message ||
          res?.message ||
          "Aadhar verification failed",
      );
      return false;
    }

    // Others Verification
    else if (kycType === "Others") {
      const { identity, address } = proofs;
      const identityFile = document.getElementById(`identity-${identity}`)
        ?.files?.[0];
      const addressFile = document.getElementById(`address-${address}`)
        ?.files?.[0];



        
      // return false;

      if (!identity || !address) {
        showError("Select both proof types.");
        return false;
      }

      if (!identityFile || !addressFile) {
        showError("Upload both documents.");
        return false;
      }
    

      const formData = new FormData();
      formData.append("identityfront", identityFile);
      formData.append("addressfront", addressFile);

      try {
        res = await UploadDocument(
          constant.API.HEALTH.CARESUPEREME.UPLOADDOCUMENT,
          "POST",
          formData,
        );
        if (res?.status) {
          showSuccess("Documents verified");
          setKycVerified(true);
          setVerifiedData?.({ kyctype: "o" });
          setIsOtherKycHidden?.(true);
          return true;
        }

        showError(res?.message || "Document verification failed");
      } catch (err) {
        console.error("Upload error:", err);
        showError("Something went wrong during upload");
      }
    }

    setKycVerified(false);
    return false;
  } catch (error) {
    console.error(`${kycType} verification error:`, error);
    showError(`Server error during ${kycType} verification`);
    setKycVerified(false);
    return false;
  }
}
export async function validatePanOtp(
  otp,
  step1Form,
  setKycVerified,
  setIsPanVerified,
  setShowPanOtpSection,
  setIsPanKycHidden,
  setVerifiedData,
) {
  if (!otp || otp.length !== 6) {
    showError("Please enter valid 6-digit OTP");
    return false;
  }

  const customerMobile = step1Form.getValues("customerMobile");
  const customerotp = otp;

  const payload = {
    customerMobile,
    customerotp,
  };

  try {
    const res = await CallApi(
      constant.API.HEALTH.CARESUPEREME.PANOTPVERIFY,
      "POST",
      payload,
    );

    if (res?.status === "success" || res?.responseData?.status === "success") {
      showSuccess("OTP verified successfully");

      setKycVerified(true);
      setIsPanVerified?.(true);
      setShowPanOtpSection(false);
      setIsPanKycHidden?.(true);
      const kycData = res?.responseData?.kycrequest;
      console.log("kycData",kycData);
if (kycData) {
    const verifiedObj = {
      kyctype: "p",
      proposalname: kycData.name || "",  
      gender: kycData.gender === "MALE" ? "Mr" : kycData.gender === "FEMALE" ? "Ms" : "",
      proposaldob: kycData.getdob || "", // "24-06-2004"
    };
    

    // React state update karein
    setVerifiedData?.(verifiedObj);

    // FIX: Session storage mein save karein taaki refresh par data secure rahe
    sessionStorage.setItem("care_verified_kyc_data", JSON.stringify(verifiedObj));
  // 🔥 FIX: OTP ke bad bhi instant form synchronisation lagayein
    if (kycData.name) {
      step1Form.setValue("proposername", kycData.name, { shouldValidate: true });
      step1Form.setValue("customerName", kycData.name, { shouldValidate: true });
    }
    if (kycData.gender) {
      const rawGender = kycData.gender.toUpperCase();
      const mappedTitle = (rawGender === "MALE" || rawGender === "M") ? "Mr" : "Ms";
      const mappedCustomerGender = (rawGender === "MALE" || rawGender === "M") ? "MALE" : "FEMALE";
      
      step1Form.setValue("mr_ms_gender", mappedTitle, { shouldValidate: true });
      step1Form.setValue("customerGender", mappedCustomerGender, { shouldValidate: true });
    }
    if (kycData.getdob) {
      step1Form.setValue("proposerdob1", kycData.getdob, { shouldValidate: true });
      step1Form.setValue("customerpancardDob", kycData.getdob, { shouldValidate: true });
    }
  }

  return true;
}

    showError(res?.responseData?.message || res?.message || "Invalid OTP");
    return false;
  } catch (error) {
    console.error("PAN OTP verify error:", error);
    showError("Server error during OTP verification");
    return false;
  }
}


const calculateAgeFromDOB = (dob) => {
  const [day, month, year] = dob.split("-").map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};