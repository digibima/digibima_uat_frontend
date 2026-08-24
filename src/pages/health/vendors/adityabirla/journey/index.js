"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm ,Controller} from "react-hook-form";
import { parse, isAfter, isBefore,format } from "date-fns";
import { FaChevronLeft, FaCheck } from "react-icons/fa";
import StepOneForm from "./stepone.js";
import StepTwoForm from "./steptwo.js";
import StepThreeForm from "./stepthree.js";
import ExtraStepForPortForm from "./question/extrastepforport.js";
import StepFourForm from "./stepfour.js";
import SummaryCard from "../checkout/rightsection.js";
import { showSuccess, showError } from "@/layouts/toaster";
import { validateFields } from "@/styles/js/validation.js";
import validateStepTwoData from "./validatesteptwoagedata.js";
import constant from "@/env.js";
import validateKycStep, { validatePanOtp } from "./kycvalidation.js";
import { CallApi, clearDBData } from "@/api";
import { HealthLoaderOne } from "@/components/loader";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import Modal from "@/components/modal.js";
import questionnaire from "@/context/adityabirlaped";
import UniversalDatePicker from "@/pages/datepicker/index.js";
import Image from "next/image";
import {
  FaUserShield,
  FaBirthdayCake,
  FaExclamationTriangle,
  FaMale,
  FaFemale,
} from "react-icons/fa";
const parseIfString = (val) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val;
  } catch {
    return val;
  }
};

// step two attachmentDate validation
const validateAttachmentStepTwo = (dob, attachmentDate) => {
  if (!dob || !attachmentDate) return true;

  const dobDate = parse(dob, "dd-MM-yyyy", new Date());
  const attachDate = parse(attachmentDate, "dd-MM-yyyy", new Date());
  const today = new Date();

  if (isBefore(attachDate, dobDate)) {
    return "Attachment date cannot be before Date of Birth";
  }

  if (isAfter(attachDate, today)) {
    return "Attachment date cannot be in the future";
  }

  return true;
};

const getMemberLabelFromKey = (key, steponedata) => {
  if (key === "proposerattachmentdate") return "Proposer";

  if (key === "spouseattachmentdate") return "Spouse";

  if (key.startsWith("childattachmentdate")) {
    const num = key.replace("childattachmentdate", "");
    return `Child ${num}`;
  }
  const relation = key.replace("attachmentdate", "");

  const found = steponedata?.members?.find(
    (m) => m.name?.toLowerCase() === relation.toLowerCase(),
  );

  if (found?.name) {
    return found.name
      .replace(/inlaw/, " In-law")
      .replace(/^\w/, (c) => c.toUpperCase());
  }

  return relation.replace(/^\w/, (c) => c.toUpperCase());
};
const toNumber = (v) => {
  const n = Number(String(v || "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

// step two attachmentDate validation end

// ================== Port Date Helpers start ==================

const parseDDMMYYYY = (str) => {
  if (!str) return null;

  const [dd, mm, yyyy] = str.split("-");
  return new Date(yyyy, mm - 1, dd);
};

const diffDays = (a, b) => Math.floor(Math.abs(b - a) / (1000 * 60 * 60 * 24));
// Remove time part
const normalizeDate = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// ================== Port Date Helpers End ==================
export default function StepperForm({ usersData, kycData }) {
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [submitStepLoader, setSubmitStepLoader] = useState(false);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [insurememberdata, setInsureMemberData] = useState([]);
  const [kycType, setKycType] = useState("");
  const [selfData, setSelfData] = useState([{}]);
  const [sameAddress, setSameAddress] = useState(true);
  const [proofs, setProofs] = useState({ identity: "", address: "" });
  const [fileNames, setFileNames] = useState({});
  const [kycVerified, setKycVerified] = useState(false);
  const [isPanVerified, setIsPanVerified] = useState(false);
  const [verifiedData, setVerifiedData] = useState([]);
  const [steponedata, setStepOneData] = useState([]);
  const [steptwodata, setStepTwoData] = useState([]);
  const [stepthreedata, setStepThreeData] = useState([]);
  const [totalPremium, setTotalPremium] = useState("");
  const [checkoutTotalPremium, setCheckoutTotalPremium] = useState("");
  const [isPanKycHidden, setIsPanKycHidden] = useState(false);
  const [isAadharKycHidden, setIsAadharKycHidden] = useState(false);
  const [isOtherKycHidden, setIsOtherKycHidden] = useState(false);
  const [portMemberData, setPortMemberData] = useState({});
  const [panOtpVisible, setPanOtpVisible] = useState(false);
  const [panOtpValue, setPanOtpValue] = useState("");
  const [isPanOtpVerifying, setIsPanOtpVerifying] = useState(false);
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [txnId, setTxnId] = useState("");
   const [paymentData, setPaymentData] = useState(null);

  // const [initialPremium, setInitialPremium] = useState(null);
  const [kycUrl, setKycUrl] = useState("");
  const initialPremiumRef = React.useRef(null);
  const [quoteData, setQuoteData] = useState({
    totalpremium: "",
    basepremium: "",
    coverage: "",
  });

  const [isMemberUpdated, setIsMemberUpdated] = useState(false);
  const [prevPremiumBeforeMemberUpdate, setPrevPremiumBeforeMemberUpdate] =
    useState(null);

  const [oldPincode, setOldPincode] = useState("");
  const [newPincode, setNewPincode] = useState("");
  const [planType, setPlanType] = useState("");
  const [portTenure, setPortTenure] = useState("");
  const [resumeQuote, setResumeQuote] = useState(null);
  const [resumeFinal, setResumeFinal] = useState(null);

  const [showKycMismatchModal, setShowKycMismatchModal] = useState(false);
  const [kycMismatchMsg, setKycMismatchMsg] = useState("");
  const searchParams = useSearchParams();


  useEffect(() => {
    console.log("insurememberdata", insurememberdata);
  }, [insurememberdata]);

  useEffect(() => {
    const resume = sessionStorage.getItem("adityabirla_resume");

    if (!resume) return;

   const quote = sessionStorage.getItem("adityaBirlaMaxSummaryCard");

    const final = sessionStorage.getItem("adityabirla_final_summary");

    if (quote) {
      try {
        setResumeQuote(JSON.parse(quote));
      } catch {}
    }

    if (final) {
      try {
        const parsed = JSON.parse(final);

        setResumeFinal(parsed);
        setStepThreeData(parsed);
      } catch {}
    }

    sessionStorage.removeItem("adityabirla_resume");
  }, []);

  useEffect(() => {
    const stepFromQuery = parseInt(searchParams.get("step"));

    const max = planType === "1" ? 4 : 5;

    if (stepFromQuery && stepFromQuery >= 1 && stepFromQuery <= max) {
      setCurrentStep(stepFromQuery);
    }
  }, [searchParams, planType]);

const summaryData = useMemo(() => {
  if (resumeQuote) return resumeQuote;

const stored = sessionStorage.getItem(
  "adityaBirlaMaxSummaryCard"
);

  if (stored) {
    return JSON.parse(stored);
  }

  return {};
}, [resumeQuote]);

  useEffect(() => {
    if (!summaryData?.tenure) return;

    const quoteSummary = {
      tenure: summaryData.tenure,
      coverAmount: summaryData.coverAmount,
      totalPremium: quoteData.totalpremium || summaryData.totalPremium,
      basePremium: quoteData.basepremium || summaryData.basepremium,
      coverage: quoteData.coverage || summaryData.coverage,

      //
      selectedAddons: parseIfString(summaryData.selectedAddons),
      compulsoryAddons: parseIfString(summaryData.compulsoryAddons),
      tenurePrices: parseIfString(summaryData.tenurePrices),
      addons: parseIfString(summaryData.addons),
      fullAddonsName: parseIfString(summaryData.fullAddonsName),

      planType,
    };

 sessionStorage.setItem(
  "adityaBirlaMaxSummaryCard",
  JSON.stringify(quoteSummary),
);
  }, [summaryData, quoteData, planType]);

  useEffect(() => {
    if (summaryData?.totalPremium) {
      setTotalPremium(summaryData.totalPremium);
    }

    if (summaryData?.checkoutTotalPremium && checkoutTotalPremium === "") {
      setCheckoutTotalPremium(summaryData.checkoutTotalPremium);
    }
  }, [summaryData, checkoutTotalPremium]);

  useEffect(() => {
    const stepFromQuery = parseInt(searchParams.get("step"));
    if (stepFromQuery >= 1 && stepFromQuery <= 4) {
      setCurrentStep(stepFromQuery);
    }
  }, [searchParams]);

  const step1Form = useForm();
  const step2Form = useForm();
  const stepPortForm = useForm();
  const step3Form = useForm();
  const step4Form = useForm();

  const inputClass = "border border-gray-400 rounded px-3 py-2 text-sm w-full";
  // const steps = ["", "", "", ""];
  const steps = planType === "1" ? ["", "", "", ""] : ["", "", "", "", ""];
  // const steps = ["Step", "Step", "Step", ""];

  const back = async () => {
    if (currentStep === 1) {
      router.push(constant.ROUTES.HEALTH.ADITYABIRLA.CHECKOUT);
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
    console.log(rawValues)

    if (!rawValues.colony) step1Form.unregister("colony");
      if (!rawValues.Landmark) step1Form.unregister("Landmark");
      if (!rawValues.commcurrentcolony) step1Form.unregister("commcurrentcolony");
      if (!rawValues.commcurrentLandmark) step1Form.unregister("commcurrentLandmark");


      step1Form.clearErrors(["colony", "Landmark", "commcurrentcolony", "commcurrentLandmark"]);

      const fieldsValid = await validateFields(step1Form);
      if (!fieldsValid) return false;


        // --- DYNAMIC GENDER & DOB MISMATCH VALIDATION ---
    
        const formTitleGender = step1Form.getValues("mr_ms_gender") || "";
    
        const apiMemberGender = insurememberdata?.[0]?.gender || "";
    
        const normalizedForm =
          formTitleGender.toLowerCase() === "mr" ||
          formTitleGender.toLowerCase() === "male"
            ? "male"
            : "female";
            const normalizedApi =
              apiMemberGender.toLowerCase() === "male" ||
              apiMemberGender.toLowerCase() === "m"
                ? "male"
                : "female";
        
            console.log("Button Click Verification:", {
              normalizedForm,
              normalizedApi,
            });
            if (normalizedForm !== normalizedApi) {
              showError(
                `Gender mismatch! Selected member is ${normalizedApi.toUpperCase()} but KYC verified is ${normalizedForm.toUpperCase()}.`,
              );
              return false; 
            }
    
        // =============================================================================
        // --- MISMATCH VALIDATION END ---
        
    const values = {
      ...rawValues,
      customerpancardDob: rawValues.customerpancardDob,
      sameAddress: sameAddress ? "1" : "0",
    };
    delete values.panDob;
    try {
      setLoading(true);
      const res = await CallApi(
        constant.API.HEALTH.ADITYABIRLA.SAVESTEPONE,
        "POST",
        values,
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
    console.log("values",values);
    if (String(planType) != 2) {
      Object.keys(values).forEach((k) => {
        if (k.includes("attachmentdate")) {
          delete values[k];
        }
      });
    }
    const fieldsValid = await validateFields(step2Form);
    if (!fieldsValid) return false;
    const rawValues = step2Form.getValues();
    const nomineeDob = values.nomineedob;
    const validAge = validateStepTwoData(values, steponedata);
    if (!validAge) return false;

    // ========= Step 2 Attachment Validation =========
    if (String(planType) == 2) {
      for (let key in values) {
        if (!key.includes("attachmentdate")) continue;

        const attachmentDate = values[key];

        let dob = "";

        // proposer special case
        if (key === "proposerattachmentdate") {
          dob = values.proposerdob2;
        } else {
          const dobKey = key.replace("attachmentdate", "dob");
          dob = values[dobKey];
        }

        const result = validateAttachmentStepTwo(dob, attachmentDate);

        if (result !== true) {
          const label = getMemberLabelFromKey(key, steponedata);

          const finalMsg = `${label}  ${result}`;

          step2Form.setError(key, {
            type: "manual",
            message: finalMsg,
          });

          step2Form.setFocus(key);

          showError(finalMsg);

          return false;
        }
      }
    }
    // =============================================
    // ========= Occupation Validation Fix (With Toast) =========
      let isOccupationValid = true;
      for (const key of Object.keys(values)) {
        if (key.includes("occupation")) {
          const val = values[key];

          if (!val || val === "no-selection") {
            const label = getMemberLabelFromKey(key, steponedata) || "Member";
            const msg = `${label}: Please select an Occupation`;
            step2Form.setError(key, {
              type: "manual",
              message: "Please select an Occupation",
            });

            step2Form.setFocus(key);

            showError(msg);

            isOccupationValid = false;
            break; 
          }
        }
      }

      if (!isOccupationValid) return false;
      // ==========================================================

    try {
      setLoading(true);
      const res = await CallApi(
        constant.API.HEALTH.ADITYABIRLA.SAVESTEPTWO,
        "POST",
        values,
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

  const validateFormExtraStep = async () => {
    const membersRaw = portMemberData || {};

    const membersArray = Array.isArray(membersRaw)
      ? membersRaw
      : membersRaw[""] || [];

    const fieldsValid = await validateFields(stepPortForm);
    if (!fieldsValid) return false;

    const values = stepPortForm.getValues();

    const startStr = values.prepolicyexpirydate;
    const endStr = values.policyenddate;
    const firstStr = values.firstpolicystartdate;
    const porttenure = String(values.porttenure || "");

    // ================== Port Tenure Validation ==================

    const rawTenure = String(values.porttenure || "").trim();
    const tenureYears = parseInt(rawTenure, 10);

    if (isNaN(tenureYears) || ![1, 2, 3].includes(tenureYears)) {
      showError(
        "Please select your policy tenure (1, 2, or 3 years) to continue.",
      );
      return false;
    }

    // ================== Dates ==================

    const today = normalizeDate(new Date());

    const start = normalizeDate(parseDDMMYYYY(startStr));
    const end = normalizeDate(parseDDMMYYYY(endStr));
    const first = normalizeDate(parseDDMMYYYY(firstStr));

    // ================== 1. Format ==================

    if (!start || !end || !first) {
      showError(
        "Please enter all dates in DD-MM-YYYY format as mentioned in your policy document.",
      );
      return false;
    }

    // ================== 2. No Future ==================

    if (
      start.getTime() > today.getTime() ||
      first.getTime() > today.getTime()
    ) {
      showError(
        "Policy start dates cannot be in the future. Please check your policy copy.",
      );
      return false;
    }

    // ================== 3. Order ==================

    if (first.getTime() > start.getTime()) {
      showError(
        "First policy start date must be earlier than your current policy start date.",
      );
      return false;
    }

    if (end.getTime() <= start.getTime()) {
      showError("Policy end date must be later than the policy start date.");
      return false;
    }

    // ================== 4. End Date ±30 Days From Today ==================

    const diffFromToday = diffDays(today, end);

    if (diffFromToday < -30 || diffFromToday > 30) {
      showError(
        "Your previous policy must have expired within the last 30 days or should expire within the next 30 days to apply for portability.",
      );
      return false;
    }

    // ================== 5. Tenure Date Check (Only for 1 & 2 Years) ==================

    if (porttenure !== "3") {
      const expectedEnd = normalizeDate(start);
      expectedEnd.setFullYear(expectedEnd.getFullYear() + tenureYears);

      const minEnd = normalizeDate(expectedEnd);
      minEnd.setDate(minEnd.getDate() - 30);

      const maxEnd = normalizeDate(expectedEnd);
      maxEnd.setDate(maxEnd.getDate() + 30);

      if (end < minEnd || end > maxEnd) {
        showError(
          "Your policy duration does not match the selected tenure. Please verify your policy period.",
        );
        return false;
      }
    }

    // ================== 6. Min 1 Year ==================

    const policyDays = diffDays(start, end);

    if (policyDays < 335) {
      showError(
        "Minimum 1 year of continuous health insurance coverage is required for portability.",
      );
      return false;
    }

    // ================== 7. First Policy Start Date Validation ==================

    if (porttenure === "1" || porttenure === "2") {
      const expectedFirst = normalizeDate(new Date(today));

      // Today - tenure years
      expectedFirst.setFullYear(expectedFirst.getFullYear() - tenureYears);

      // ±30 Days Range
      const minFirst = normalizeDate(new Date(expectedFirst));
      minFirst.setDate(minFirst.getDate() - 30);

      const maxFirst = normalizeDate(new Date(expectedFirst));
      maxFirst.setDate(maxFirst.getDate() + 30);

      // Range Check
      if (first < minFirst || first > maxFirst) {
        showError(
          "As per insurer guidelines, your first policy start date should be around " +
            tenureYears +
            " year(s) before today (within ±30 days). Please verify your policy document.",
        );
        return false;
      }

      // Extra Rule for 1 Year Tenure
      if (porttenure === "1") {
        if (first.getTime() !== start.getTime()) {
          showError(
            "As per insurer rules, for 1 year portability, your first policy start date and previous policy start date must be the same.",
          );
          return false;
        }
      }
    }

    // ================== 8. Recent Period Check (Skip for 3 Years) ==================

    if (porttenure !== "3") {
      const recentDays = diffDays(start, end);

      const expected = tenureYears * 365;

      const minAllowed = expected - 30;
      const maxAllowed = expected + 30;

      if (recentDays < minAllowed || recentDays > maxAllowed) {
        showError(
          "Your last policy period does not match the selected tenure. Please recheck your policy details.",
        );
        return false;
      }
    }

    // ================== 9. Member Attachment Validation ==================

    const firstPolicyDate = normalizeDate(parseDDMMYYYY(firstStr));

    if (!firstPolicyDate) {
      showError(
        "Please enter a valid first policy start date as per your records.",
      );
      return false;
    }

    for (let member of membersArray) {
      const attachDate = normalizeDate(parseDDMMYYYY(member.attachmentdate));

      if (!attachDate) {
        showError(`Please enter a valid attachment date for ${member.name}.`);
        return false;
      }

      const name = (member.name || "").toLowerCase();

      // Self Rule
      if (name === "self") {
        // console.log(attachDate.getTime());
        // console.log(attachDate.getTime());
        // if (attachDate.getTime() !== firstPolicyDate.getTime()) {
        //   showError(
        //     "Self member must be covered from the first policy start date.",
        //   );
        //   return false;
        // }
      }

      // Others Rule
      else {
        if (attachDate < firstPolicyDate) {
          showError(
            `${member.name} must be added after the first policy start date.`,
          );
          return false;
        }
      }
    }

    try {
      setLoading(true);

      const res = await CallApi(
        constant.API.HEALTH.ADITYABIRLA.SAVESTEPPORT,
        "POST",
        values,
      );

      if (res === 1 || res?.status) {
        setStepThreeData(res);
        return true;
      }

      showError(res.error || "Something went wrong");
      return false;
    } catch (err) {
      console.error("Port API Error:", err);
      showError("Server error. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

const validateFormStepThree = async (step3Form, steptwodata) => {
  try {
    const data = step3Form.getValues();
    const members = steptwodata?.member || steptwodata?.members || [];

  
    const isTruthy = (val) => {
      if (!val) return false;
      if (typeof val === "boolean") return val;
      const str = String(val).toLowerCase().trim();
      return str === "true" || str === "yes" || str === "on" || str === "1";
    };

    if (!data.agreeTnC) {
      step3Form.setFocus("agreeTnC");
      showError("Please agree to Terms & Conditions to continue.");
      return false;
    }

    let hasError = false;
    let firstInvalidInput = null;

    const markInvalid = (name) => {
      const el = document.querySelector(`[name="${name}"]`);
      if (el) {
        el.classList.add("border-red-500");
        if (!firstInvalidInput) firstInvalidInput = el;
      }
      hasError = true;
    };

    const clearInvalid = (name) => {
      const el = document.querySelector(`[name="${name}"]`);
      el?.classList.remove("border-red-500");
    };

    const validateMonthYear = (value, name) => {
      if (!value) return true;

      const parts = String(value).trim().split("/");

      if (parts.length !== 2) {
        markInvalid(name);
        return false;
      }

      const mm = Number(parts[0]);
      const yyyy = Number(parts[1]);

      if (!mm || mm < 1 || mm > 12 || !yyyy || parts[1].length !== 4) {
        markInvalid(name);
        return false;
      }

      clearInvalid(name);
      return true;
    };

    const result = [];


    members.forEach((member, memberIndex) => {
      const memberData = {
        id: member.id,
        age: member.age,
        dob: member.dob,
        data: [],
      };

      questionnaire.sections.forEach((section, sectionIndex) => {
        if (!section?.questions?.length) return;

        section.questions.forEach((question, questionIndex) => {
          const did = `${sectionIndex + 1}.${questionIndex + 1}`;

          if (question.type === "toggle") {
            const toggleName = `${question.key}_toggle`;

            if (!isTruthy(data[toggleName])) return;

       
            if (question.children?.length) {
              const memberCheckName = `${question.key}_${memberIndex}`;

              if (!isTruthy(data[memberCheckName])) return;

              const extra = {};

              question.children.forEach((child) => {
                const fieldName = `${question.key}_${memberIndex}_${child.key}`;
                const value = data[fieldName];

                if (
                  child.type === "text" ||
                  child.type === "textarea" ||
                  child.type === "number"
                ) {
                  if (!String(value || "").trim()) {
                    markInvalid(fieldName);
                  } else {
                    clearInvalid(fieldName);
                  }
                }

                if (child.type === "date") {
                  validateMonthYear(value, fieldName);
                }

                extra[child.key] = value || "";
              });

              memberData.data.push({
                did,
                question_id: question.question_id,
                question_text: question.text,
                answer: "Yes",
                member_checked: true,
                extra,
              });

              return;
            }

            // simple toggle
            memberData.data.push({
              did,
              question_id: question.question_id,
              question_text: question.text,
              answer: "Yes",
              member_checked: false,
              extra: {},
            });

            return;
          }

          // ==========================
          // TEXT / NUMBER QUESTIONS
          // ==========================
          if (
            question.type === "text" ||
            question.type === "number" ||
            question.type === "textarea"
          ) {
            // lifestyle section
            if (section.key === "lifestyle") {
              const toggleName = `${question.key}_toggle`;

              if (!isTruthy(data[toggleName])) return;

              const memberCheckName = `${question.key}_${memberIndex}`;

              if (!isTruthy(data[memberCheckName])) return;

              const valueField = `${question.key}_${memberIndex}_value`;
              const dateField = `${question.key}_${memberIndex}_date`;

              const value = data[valueField];
              const date = data[dateField];

              if (!String(value || "").trim()) {
                markInvalid(valueField);
              } else {
                clearInvalid(valueField);
              }

              if (date) validateMonthYear(date, dateField);

              memberData.data.push({
                did,
                question_id: question.question_id,
                question_text: question.text,
                answer: value || "",
                member_checked: true,
                extra: {
                  value: value || "",
                  date: date || "",
                },
              });

              return;
            }

            // previous section
            if (section.key === "previous") {
              const val = data[question.key];

              if (!String(val || "").trim()) return;

              memberData.data.push({
                did,
                question_id: question.question_id,
                question_text: question.text,
                answer: val,
                member_checked: false,
                extra: {},
              });
            }
          }
        });
      });

      if (memberData.data.length) {
        result.push(memberData);
      }
    });

    // =========================================================
    // 3. STRICT PED COUNT LIMIT CHECK (MAX 3)
    // =========================================================
    const pedMembersCount = result.length; // Members having selected PEDs

    let totalPedQuestionsCount = 0; // Total selected PED questions across all members
    result.forEach((m) => {
      totalPedQuestionsCount += m.data ? m.data.length : 0;
    });

    if (pedMembersCount > 3 || totalPedQuestionsCount > 3) {
      showError("Pre-Existing Diseases (PED) cannot be selected for more than 3 members/conditions.");
      return false; // Blocks navigation to next step
    }

    // =========================================================
    // 4. Required Field Errors Check
    // =========================================================
    if (hasError) {
      if (firstInvalidInput) {
        firstInvalidInput.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        firstInvalidInput.focus();
      }

      showError("Please fill all required fields correctly.");
      return false;
    }

    // =========================================================
    // 5. API CALL
    // =========================================================
    const res = await CallApi(
      constant.API.HEALTH.ADITYABIRLA.SAVESTEPTHREE,
      "POST",
      result
    );

    if (res === 1 || res?.status) {
      setStepThreeData(res);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "adityaBirlaStepFourData",
          JSON.stringify(res)
        );
        sessionStorage.setItem("planType", planType.toString());
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error("STEP3 FUNCTION ERROR =>", error);
    return false;
  }
};

  const GoToPayment = async () => {
    setLoading(true);
    try {
      const res = await CallApi(
        constant.API.HEALTH.ADITYABIRLA.INITIATE,
        "POST",
      );

      const status = res?.status;

      if (status === "1" || status === 1 || status === true) {
        const paymentUrl = res?.payment_links?.web;

        if (paymentUrl) {
          router.push(
            `/health/vendors/adityabirla/payment?paymentUrl=${encodeURIComponent(paymentUrl)}`,
          );
        } else {
          showError("Payment link not received.");
        }
      } else {
        const fallbackMsg = "Something went wrong while creating policy.";
        const backendMsg =
          res?.error?.[0]?.errDescription || res?.message || fallbackMsg;
        showError(backendMsg);
      }
    } catch (error) {
      console.error("API Error", error);
      showError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
 const GoToCreatePolicy = async () => {
  setLoading(true);

  try {
    const payload = {
      txn_id: paymentData.data?.txn_id,
      customer_id: paymentData.data?.customer_id,
      amount: paymentData.data?.amount,
    };

    // console.log("CREATE POLICY PAYLOAD =>", payload);
// return false;
    const res = await CallApi(
      constant.API.HEALTH.ADITYABIRLA.CREATEPOLICY,
      "POST",
      payload
    );

    // console.log("Create Policy Response =>", res);

     const status = res?.status;
          const policyNumber = res?.data?.policyNumber;
   
       if (status === "1" || status === 1 || status === true) {
           router.push(
             `/health/vendors/adityabirla/payment/thankyou?policyNumber=${encodeURIComponent(policyNumber)}`,
           );
         } else {
           const fallbackMsg = "Something went wrong while creating policy.";
           const backendMsg =
             res?.error?.[0]?.errDescription || res?.message || fallbackMsg;
           showError(backendMsg);
         }
       } catch (error) {
    console.error("API Error", error);
    showError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const maxStep = planType === "1" ? 4 : 5;
  const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, maxStep));

  const onSubmitStep = async () => {
    setSubmitStepLoader(true);
    try {
      let isValid = false;

      if (currentStep === 1) {
        isValid = await validateFormStepOne();
      } else if (currentStep === 2) {
        isValid = await validateFormStepTwo();
      } else if (planType !== "1" && currentStep === 3) {
        isValid = await validateFormExtraStep();
      } else if (currentStep === (planType === "1" ? 3 : 4)) {
        isValid = await validateFormStepThree(step3Form, steptwodata);
      } else if (currentStep === (planType === "1" ? 4 : 5)) {
        return await GoToPayment();
      } else if (currentStep === (planType === "1" ? 4 : 5)) {
        return await GoToCreatePolicy();
      }

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
      selfData,
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
      setIsOtherKycHidden,
      setPanOtpVisible,
      setShowKycMismatchModal,
      setKycMismatchMsg,
      setKycUrl,
      insurememberdata,
      setSelfData
    );
  };
  const handleVerifyPanOtp = async () => {
    await validatePanOtp(
      panOtpValue,
      step1Form,
      setKycVerified,
      setIsPanVerified,
      setPanOtpVisible,
      setIsPanKycHidden,
      setVerifiedData,
    );
  };

  const handleVerifyAadhar = async () => {
    const values = step1Form.getValues();
    await validateKycStep(
      selfData,
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
      setIsOtherKycHidden,
    );
  };

  const handleVerifyOther = async () => {
    const values = step1Form.getValues();
    await validateKycStep(
      selfData,
      step1Form,
      "Others",
      values,
      proofs,
      setKycVerified,
      kycVerified,
      undefined,
      setVerifiedData,
      setIsPanKycHidden,
      setIsAadharKycHidden,
      setIsOtherKycHidden,
    );
  };
  useEffect(() => {
    if (quoteData.totalpremium) {
    }
  }, [quoteData]);
  useEffect(() => {
    const kycSuccess = searchParams.get("kycVerificationSuccess");

    if (kycSuccess !== null) {
      if (kycSuccess === "true") {
        setKycError({
          kycVerificationStatus: "DONE",
        });
      }

      if (kycSuccess === "false") {
        setKycError({
          kycVerificationStatus: "NOT_DONE",
          kycReason: "KYC verification failed. Please try again.",
        });
      }

      setCurrentStep(4);
    }
  }, [searchParams]);
  useEffect(() => {
    const transactionId = searchParams.get("transactionId");
    if (!transactionId) return;

    const fetchKycStatus = async () => {
      try {
        const res = await CallApi(
          constant.API.HEALTH.ADITYABIRLA.KYCRESULT,
          "POST",
          { transactionId },
        );

        // console.log("KYC RESPONSE:", res);

        const status = res?.applicationStatus;

        //Check KYC status from API (NOT URL)
        if (status == "auto_approved") {
          showSuccess("KYC completed successfully");

          const user = res?.userDetails;

          const genderMap = {
            M: "Mr",
            F: "Ms",
            Male: "Mr",
            Female: "Ms",
          };

          // Update UI
          setKycVerified(true);
          setIsPanVerified(true);
          setIsPanKycHidden(true);
          setKycType("PAN Card");

          // Fill form
          step1Form.setValue("kycType", "PAN Card", {
            shouldValidate: true,
            shouldDirty: true,
          });

          step1Form.setValue("proposername", user?.FullName || "");
          step1Form.setValue("proposerdob1", user?.DOB || "");
          step1Form.setValue("mr_ms_gender", genderMap[user?.Gender] || "");


                    // Permanent Address
          const address = user?.PermanentAddress1 || "";

          const parts = address
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);

          const house = parts.slice(0, 5).join(", ");       
          const colony = parts.slice(5, 7).join(", ");      
          const landmark = parts.slice(7).join(", ");       

          step1Form.setValue("house", house, {
            shouldValidate: true,
          });

          step1Form.setValue("colony", colony, {
            shouldValidate: false,
          });

          step1Form.setValue("Landmark", landmark, {
            shouldValidate: false,
          });

            step1Form.setValue(
              "City",
              user?.PermanentAddressCity || "",
              { shouldValidate: true }
            );

            step1Form.setValue(
              "State",
              user?.PermanentAddressState || "",
              { shouldValidate: true }
            );

          // step1Form.setValue(
          //   "Pincode",
          //   user?.PermanentAddressPincode || "",
          //   { shouldValidate: true }
          // );
        } else {
          // KYC failed or pending
          showError("KYC not completed. Please try again.");

          setKycVerified(false);
          setIsPanVerified(false);
        }
      } catch (err) {
        console.error("KYC API ERROR:", err);
        showError("Something went wrong while verifying KYC");
      }
    };

    fetchKycStatus();
  }, [searchParams, step1Form]);
  useEffect(() => {
    const status = searchParams.get("status");
    const orderId = searchParams.get("order_id");

    if (status === "CHARGED" && orderId) {
      const storedPlanType = sessionStorage.getItem("planType");

      setPlanType(storedPlanType); // IMPORTANT

      const finalStep = storedPlanType === "1" ? 4 : 5;
      // console.log("Final Step:", finalStep);

      setCurrentStep(finalStep);

      const savedData = sessionStorage.getItem("adityaBirlaStepFourData");

      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setStepThreeData(parsed);
        } catch (e) {
          console.error("Session parse error", e);
        }
      }

      CallApi(
        `${constant.API.HEALTH.ADITYABIRLA.PAYMENTSTATUS}?order_id=${orderId}`,
        "GET",
      )
        .then((res) => {
          // console.log("Payment Status:", res);

          if (res?.status === true) {
            setIsPaymentVerified(true);
            setTxnId(res?.txn_id);
              setPaymentData(res);
            showSuccess(res?.message || "Payment successful");
          } else {
            setIsPaymentVerified(false);
            showError(res?.message || "Payment failed");
          }
        })
        .catch((err) => {
          console.error(err);
          setIsPaymentVerified(false);
        });
    }
  }, [searchParams]);

  return (
    <>
      {loading ? (
        <HealthLoaderOne />
      ) : (
        <div className="min-h-screen bgcolor p-4 sm:p-8">
          <button
            onClick={back}
            className="text-blue-700 flex items-center gap-2 mb-4 text-sm font-medium"
          >
            <FaChevronLeft /> Go back to Previous
          </button>
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
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
                    handleVerifyPanOtp={handleVerifyPanOtp}
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
                    verifiedData={verifiedData}
                    usersData={usersData}
                    kycData={kycData}
                    isPanKycHidden={isPanKycHidden}
                    setIsPanKycHidden={setIsPanKycHidden}
                    isAadharKycHidden={isAadharKycHidden}
                    setIsAadharKycHidden={setIsAadharKycHidden}
                    isOtherKycHidden={isOtherKycHidden}
                    setIsOtherKycHidden={setIsOtherKycHidden}
                    setQuoteData={setQuoteData}
                 
                    setNewPincode={setNewPincode}
                    setOldPincode={setOldPincode}
                    setPlanType={setPlanType}
                    setPortTenure={setPortTenure}
                    setSelfData={setSelfData}
                    panOtpVisible={panOtpVisible}
                    setPanOtpVisible={setPanOtpVisible}
                    panOtpValue={panOtpValue}
                    setPanOtpValue={setPanOtpValue}
                    isPanOtpVerifying={isPanOtpVerifying}
                    setIsPanOtpVerifying={setIsPanOtpVerifying}
                    kycUrl={kycUrl}
                     setInsureMemberData={setInsureMemberData}
                  />
                )}
                {currentStep === 2 && (
                  <StepTwoForm
                    step2Form={step2Form}
                    steponedata={steponedata}
                    inputClass={inputClass}
                    onSubmitStep={onSubmitStep}
                    usersData={usersData}
                    planType={planType}
                  />
                )}
                {planType !== "1" && currentStep === 3 && (
                  <ExtraStepForPortForm
                    stepPortForm={stepPortForm}
                    steptwodata={steptwodata}
                    setPortMemberData={setPortMemberData}
                    inputClass={inputClass}
                    onSubmitStep={onSubmitStep}
                  />
                )}
                {currentStep === (planType === "1" ? 3 : 4) && (
                  <StepThreeForm
                    step3Form={step3Form}
                    steptwodata={steptwodata}
                    inputClass={inputClass}
                    onSubmitStep={onSubmitStep}
                  />
                )}
                {currentStep === (planType === "1" ? 4 : 5) && (
                  <StepFourForm
                    step4Form={step4Form}
                    stepthreedata={resumeFinal || stepthreedata}
                    onSubmitStep={onSubmitStep}
                    currentStep={currentStep}
                    totalPremium={
                      quoteData.totalpremium || summaryData.totalPremium
                    }
                    basePremium={
                      quoteData.basepremium || summaryData.basepremium
                    }
                    coverage={quoteData.coverage || summaryData.coverage}
                    onGoToPayment={GoToPayment}
                    onGoToPolicy={GoToCreatePolicy}
                    planType={planType}
                  />
                )}
              </div>
            </div>

            {/* Summary Card */}
            <SummaryCard
              tenure={summaryData.tenure}
              coverAmount={summaryData.coverAmount}
              totalPremium={toNumber(
                quoteData.totalpremium || summaryData.totalPremium,
              )}
              checkoutTotalPremium={checkoutTotalPremium}
              basePremium={quoteData.basepremium || summaryData.basepremium}
              coverage={quoteData.coverage || summaryData.coverage}
              selectedAddons={summaryData.selectedAddons}
              compulsoryAddons={summaryData.compulsoryAddons}
              tenurePrices={summaryData.tenurePrices}
              addons={summaryData.addons}
              fullAddonsName={summaryData.fullAddonsName}
              currentStep={currentStep}
              onGoToPayment={GoToPayment}
              onGoToPolicy={GoToCreatePolicy}
              newPincode={newPincode}
              oldPincode={oldPincode}
              planType={planType}
              isMemberUpdated={isMemberUpdated}
              prevPremiumBeforeMemberUpdate={prevPremiumBeforeMemberUpdate}
              isPaymentVerified={isPaymentVerified}
            />
          </div>
        </div>
      )}
    <Modal
          isOpen={showKycMismatchModal}
          onClose={() => setShowKycMismatchModal(false)}
          title="DOB Mismatch Alert"
          showCancelButton
          showConfirmButton
          confirmText="Update Details"
          cancelText="Cancel"
          width="max-w-2xl"
         isLoading={modalLoading}
        onConfirm={async () => {
  try {
    setModalLoading(true); 
    
   setPrevPremiumBeforeMemberUpdate(
  toNumber(quoteData?.totalpremium || summaryData?.totalPremium || 0)
);
    
    const dbSelfFallback = usersData?.members?.find(
      (m) => m?.name?.toLowerCase() === "self",
    );
    const verifiedMemberId = selfData?.[0]?.id || dbSelfFallback?.id || "";
    
    const payload = {
      id: verifiedMemberId,
      age: selfData?.[0]?.age,
      dob: selfData?.[0]?.dob,
      gender: selfData?.[0]?.gender,
    };
    
    console.log("Age Update Payload:", payload);
    const res = await CallApi(
      constant.API.HEALTH.ADITYABIRLA.UPDATEAGE,
      "POST",
      payload,
    );

    if (res === 1 || res?.status) {
      console.log("updateAge Response:", res);
      
      const proposerDob = res?.members?.[0]?.dob || res?.proposardata?.[0]?.dob;

      if (proposerDob) {
        step1Form.setValue("customerpancardDob", proposerDob, {
          shouldValidate: true,
          shouldDirty: true,
        });
        
        setInsureMemberData((prev) =>
          prev.map((member) =>
            member.name?.toLowerCase() === "self"
              ? {
                  ...member,
                  dob: proposerDob,
                  age: res?.members?.[0]?.age || selfData?.[0]?.age,
                }
              : member,
          ),
        );
      }
      
      const updatedTotalPremium = res?.premium?.totalpremium || res?.totalpremium;
      const updatedBasePremium = res?.premium?.basepremium1 || res?.basepremium;
      const updatedCoverage = res?.coverage; 

      setQuoteData((prev) => ({
        ...prev,
        totalpremium: updatedTotalPremium,
        basepremium: updatedBasePremium,
        ...(updatedCoverage && { coverage: updatedCoverage }),
      }));

      const existing = JSON.parse(
        sessionStorage.getItem("adityaBirlaMaxSummaryCard") || "{}"
      );

      sessionStorage.setItem(
        "adityaBirlaMaxSummaryCard",
        JSON.stringify({
          ...existing,
          totalPremium: updatedTotalPremium,
          basePremium: updatedBasePremium,
          ...(updatedCoverage && { coverage: updatedCoverage }),
        })
      );

      await clearDBData();

      setIsMemberUpdated(true);
      setShowKycMismatchModal(false);
      showSuccess("Member details updated successfully. Please verify PAN again.");
    } else {
      showError(res?.error || "Failed to update member details");
    }
  } catch (err) {
    console.error("Update API Error:", err);
    showError("Server error. Please try again.");
  } finally {
    setModalLoading(false); 
  }
}}
        >
          <p className="text-gray-700 mb-4">
            Your PAN details do not match with selected member. Please update
            details below.
          </p>
  
          <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FaBirthdayCake className="text-[#2F4A7E]" />
                Date of Birth (Self)
              </label>
  
              <Controller
                control={step1Form.control}
                name="modalDob"
                render={({ field, fieldState }) => (
                  <UniversalDatePicker
                    id="modalDob"
                    name="modalDob"
                    value={
                      field.value
                        ? parse(field.value, "dd-MM-yyyy", new Date())
                        : null
                    }
                    onChange={(date) => {
                      if (date instanceof Date && !isNaN(date)) {
                        const formattedDob = format(date, "dd-MM-yyyy");
  
                        field.onChange(formattedDob);
  
                        // Age Calculation logic
                        const today = new Date();
                        let age = today.getFullYear() - date.getFullYear();
                        const monthDiff = today.getMonth() - date.getMonth();
  
                        if (
                          monthDiff < 0 ||
                          (monthDiff === 0 && today.getDate() < date.getDate())
                        ) {
                          age--;
                        }
  
                        setSelfData((prev) => {
                          if (!Array.isArray(prev)) {
                            return [{ ...prev, dob: formattedDob, age }];
                          }
  
                          return prev.map((item, i) =>
                            i === 0
                              ? {
                                  ...item,
                                  dob: formattedDob,
                                  age,
                                }
                              : item,
                          );
                        });
                      }
                    }}
                    placeholder="Select DOB"
                    error={!!fieldState.error}
                    errorText={fieldState.error?.message}
                  />
                )}
              />
  
              {/* Calculated Age Display */}
              {selfData?.[0]?.age && (
                <div className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  Age: {selfData?.[0]?.age} Years
                </div>
              )}
            </div>
  
          </div>
  
          {/* Footer Note */}
          <p className="mt-4 text-xs text-gray-500 leading-relaxed">
            Please ensure that the selected age and gender match the details on
            your PAN card before continuing. Updating details may recalculate your
            premium amount.
          </p>
        </Modal>
    </>
  );
}
