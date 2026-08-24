"use client";

import { CallApi, UploadDocument } from "@/api";
import constant from "@/env";
import { showSuccess, showError } from "@/layouts/toaster";

export default async function validateKycStep(
  selfData,
  step1Form,
  kycType,
  values,
  totalPremium,
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
  setKycMismatchMsg
) {
  const tp = Number(totalPremium ?? values?.totalPremium ?? 0);
  if (tp > 50000 && kycType !== "PAN Card") {
    showError("For policies above ₹50,000, PAN verification is mandatory.");
    return false;
  }

  if (!kycType) {
    showError("Please select a KYC type.");
    return false;
  }

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


      

const panGender = customerGender?.toLowerCase();
const panAge = calculateAgeFromDOB(customerpancardDob);

const self = Array.isArray(selfData)
  ? selfData[0]
  : selfData; 

if (!self) {
  showError("Self data not available");
  return false;
}


// if (!self) {
//   showError("Self data not found.");
//   return false;
// }

// Gender match
if (self.gender?.toLowerCase() !== panGender) {

  setKycMismatchMsg?.(
    `PAN gender does not match with selected member (Self - ${self.age} Years).`
  );

  setShowKycMismatchModal?.(true);

  return false;
}


// Age match (±1 year)
if (Math.abs(self.age - panAge) > 1) {

  setKycMismatchMsg?.(
    `PAN date of birth does not match with selected member (Self - ${self.age} Years).`
  );

  setShowKycMismatchModal?.(true);

  return false;
}

      // return false;

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


      let res = await CallApi(
        constant.API.HEALTH.ULTIMATECARE.PANVERIFY,
        "POST",
        payload,
      );

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
        return showError("All Aadhar fields are required."), false;

      if (!/^\d{4}$/.test(customerAadharno))
        return showError("Aadhar must be 4 digits."), false;

      if (!/^[A-Za-z\s]+$/.test(customerAadharName))
        return showError("Name must contain only letters."), false;

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
          "Aadhar verification failed"
      );
      return false;
    }

    else if (kycType === "Others") {
      const { identity, address } = proofs;

      const identityFile = document.getElementById(`identity-${identity}`)
        ?.files?.[0];
      const addressFile = document.getElementById(`address-${address}`)
        ?.files?.[0];



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
        const res = await UploadDocument(
          constant.API.HEALTH.ULTIMATECARE.UPLOADDOCUMENT,
          "POST",
          formData
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
  setVerifiedData
) {
  if (!otp || otp.length !== 6) {
    showError("Please enter valid 6-digit OTP");
    return false;
  }

  const customerMobile = step1Form.getValues("customerMobile");
  const customerotp = otp;

  const payload = {
    customerMobile,
    customerotp
  };

  try {
    const res = await CallApi(
      constant.API.HEALTH.ULTIMATECARE.PANOTPVERIFY, 
      "POST",
      payload
    );

    if (res?.status === "success" || res?.responseData?.status === "success") {
      showSuccess("OTP verified successfully");

      setKycVerified(true);
      setIsPanVerified?.(true);
      setShowPanOtpSection(false);
          setIsPanKycHidden?.(true);
            const kycData = res?.responseData?.kycrequest;
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
  }

  return true;
}

    showError(
      res?.responseData?.message ||
        res?.message ||
        "Invalid OTP"
    );
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
