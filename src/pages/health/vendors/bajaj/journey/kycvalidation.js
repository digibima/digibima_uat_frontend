"use client";

import { CallApi, UploadDocument } from "@/api";
import constant from "@/env";
import { showSuccess, showError } from "@/layouts/toaster";

export default async function validateKycStep(
  step1Form,
  kycType,
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
  setSelfData
) {

  if (!kycType) return showError("Please select a KYC type."), false;
    try {
      let payload, res;

    
      
    if (kycType === "CKYC") {

      let type = values.ckycSubType;
      let number = values.docNumber;
      let dob = values.docDob;
      let gender = values.docGender;
      const transactionid = finalTxn?.transactionid;


      if (!type || !number || !dob || !gender) {
        showError("All CKYC fields are required.");
        return false;
      }

      const selfMember = insurememberdata?.find(
      (m) => m.name?.toLowerCase() === "self"
      );

      if (selfMember && selfMember.dob !== dob) {
        setSelfData?.([
          {
            ...selfMember,
            dob,
            gender: gender === "M" ? "male" : gender === "F" ? "female" : selfMember.gender,
          },
        ]);

        setShowKycMismatchModal?.(true);
        setKycVerified(false);
        return false;
      }

      const payload = { type, number, dob, gender, transactionid };

      try {
        const res = await CallApi(
          constant.API.HEALTH.BAJAJ.IDENTITYVERIFY,
          "POST",
          payload
        );


        if (res?.status == 1 || res?.status == "1" || res?.status === true) {
          showSuccess("CKYC verified");
          setKycVerified(true);
          
          const decryptedData = res?.data?.decrypted || {};
          
          setVerifiedData?.({ 
            kyctype: "c", 
            ...decryptedData,
            dob: decryptedData.dob || payload.dob, 
            gender: decryptedData.gender || (decryptedData.title === "MR" ? "M" : "F")
          });
          
          setIsCKYCHidden?.(true);
          return true;
        }
        showError(res?.responseData?.message || res?.message || "CKYC verification failed.");
        return false;

      } catch (error) {
        console.error("CKYC API Error:", error);
        showError("Something went wrong during CKYC verification.");
        return false;
      }
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
          res?.responseData?.message || res?.message || "Aadhar verification failed"
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
          res = await UploadDocument(
            constant.API.HEALTH.BAJAJ.UPLOADDOCUMENT,
            "POST",
            formData
          );
          if (res?.status) {
            showSuccess("Documents verified");
            setKycVerified(true);
            setIsOtherKycHidden(true);
            setVerifiedData?.({ kyctype: "o" });
            
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
    return false;
  }
}
