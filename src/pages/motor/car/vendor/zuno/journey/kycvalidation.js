"use client";

import { CallApi, UploadDocument } from "@/api";
import constant from "@/env";
import { showSuccess, showError } from "@/layouts/toaster";

export default async function validateKycStep(
  step1Form,
  kycType,
  values,
  data,
  setKycVerified,
  kycVerified,
  setIsPanVerified,
  setVerifiedData,
  setIsPanKycHidden,
  setIsAadharKycHidden,
  setIsOtherKycHidden
) {
  //  console.log(values)
  if (!kycType) return showError("Please select a KYC type."), false;
  try {
    let payload, res;
    if (kycType === "PAN Card") {
      const { pancardno, pancarddob } = values;
      if (!pancardno || !pancarddob)
        return showError("PAN Number and DOB are required."), false;

      if (
        !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pancardno.trim().toUpperCase())
      )
        return showError("Invalid PAN number (e.g., ABCDE1234F)."), false;

      payload = {
        pancardno,
        pancarddob,
      };
      // console.log(payload)
      res = await CallApi(constant.API.HEALTH.PANVERIFY, "POST", payload);

      if (res?.status && res?.kyc === "1") {
        showSuccess("PAN verified");
        setKycVerified(true);
        setIsPanVerified?.(true);
        setVerifiedData?.({ kyctype: "p" });
        setIsPanKycHidden?.(true);

        const pd =
          res?.pandata?.getCkycEkycInputIO?.kycDetails?.personalIdentifiableData
            ?.personalDetails;
        if (pd) setVerifiedData(pd);
        return true;
      }

      showError(
        res?.responseData?.message || res?.message || "PAN verification failed"
      );
    }

    // Aadhar Verification
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

    // Others Verification
  else if (kycType === "Others") {
  // match your actual field key exactly (usually lowercase)
  const identity = data?.proofs?.identity?.type || data?.identity;
  const identityfrontFile = data?.proofs?.identity?.frontFileObj || data?.identityfrontFile;
  const identitybackFile  = data?.proofs?.identity?.backFileObj  || data?.identitybackFile;

  if (!identity || !identityfrontFile || !identitybackFile) {
    showError("Missing fields or files.");
    return false;
  }

  const formData = new FormData();
  formData.append("identityfront", identityfrontFile);
  formData.append("identityback", identitybackFile);
  formData.append("identitytypeproof", identity.toLowerCase());

  // (Optional) Debug logs:
  for (let [key, value] of formData.entries()) {
    // console.log(key, value);
  }
  // return false;

  try {
    const res = await UploadDocument(
      constant.API.MOTOR.CAR.ZUNO.UPLOADDOCUMENT,
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

  setKycVerified(false);
  return false;
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
