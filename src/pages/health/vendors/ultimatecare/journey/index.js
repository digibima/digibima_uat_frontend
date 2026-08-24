"use client";
import { parse, isAfter, isBefore,format  } from "date-fns";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm ,Controller} from "react-hook-form";
import { FaChevronLeft, FaCheck } from "react-icons/fa";
import StepOneForm from "./stepone.js";
import StepTwoForm from "./steptwo.js";
import StepThreeForm from "./stepthree.js";
import StepThreeFormPort  from "./question/portquestion.js";
import ExtraStepForPortForm  from "./question/extrastepforport.js";
import portquestionvalidation  from "./question/portquestionvalidation.js";
import StepFourForm from "./stepfour.js";
import SummaryCard from "../checkout/rightsection.js";
import { showSuccess, showError } from "@/layouts/toaster";
import { validateFields } from "@/styles/js/validation.js";
import validateStepTwoData from "./validatesteptwoagedata.js";
import constant from "@/env.js";
import validateKycStep , { validatePanOtp }from "./kycvalidation.js";
import { CallApi ,deleteDBData,clearDBData } from "@/api";
import { HealthLoaderOne } from "@/components/loader";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import Modal from "@/components/modal.js";
import UniversalDatePicker from "@/pages/datepicker/index.js";
import Image from "next/image";
import {
  FaUserShield,
  FaBirthdayCake,
  FaExclamationTriangle,
  FaMale,
  FaFemale,
} from "react-icons/fa";


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
    (m) => m.name?.toLowerCase() === relation.toLowerCase()
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

const diffDays = (a, b) =>
  Math.floor((b - a) / (1000 * 60 * 60 * 24));
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

  const [planType, setPlanType] = useState("");
  const [portTenure, setPortTenure] = useState("");
   const [tenureYear, setTenureYear] = useState("");
  const initialPremiumRef = React.useRef(null);
  const [isPaymentFailed, setIsPaymentFailed] = useState(false);
  const [quoteData, setQuoteData] = useState({
    totalpremium: "",
    basepremium: "",
    coverage: "",
  });
    const [isMemberUpdated, setIsMemberUpdated] = useState(false);
    const [prevPremiumBeforeMemberUpdate, setPrevPremiumBeforeMemberUpdate] =
      useState(null);

      const [resumeQuote, setResumeQuote] = useState(null);
        const [resumeFinal, setResumeFinal] = useState(null);

  const [oldPincode, setOldPincode] = useState("");
  const [newPincode, setNewPincode] = useState("");
    const [insurdata, setInsurData] = useState([]);
    const [showKycMismatchModal, setShowKycMismatchModal] = useState(false);
    const [kycMismatchMsg, setKycMismatchMsg] = useState("");

  const searchParams = useSearchParams();

      useEffect(() => {
        console.log("insurememberdata",insurememberdata)
      }, [insurememberdata]);
const updateUrlPremium = (total, base, coverage) => {
  const existing = JSON.parse(
    sessionStorage.getItem("ultimateSummaryCard") || "{}"
  );

  sessionStorage.setItem(
    "ultimateSummaryCard",
    JSON.stringify({
      ...existing,
      totalPremium: total,
      basepremium: base,
      coverage,
    })
  );
};

useEffect(() => {

  const quote = sessionStorage.getItem("ultimate_quote_summary");
  const final = sessionStorage.getItem("ultimate_final_summary");

  // 🔥 ALWAYS LOAD QUOTE (important)
  if (quote) {
    const parsedQuote = JSON.parse(quote);

    setResumeQuote(parsedQuote);

setQuoteData({
  totalpremium: parsedQuote.totalPremium,
  basepremium: parsedQuote.basepremium,
  coverage: parsedQuote.coverage,
});
  }

  if (final) {
    try {
      const parsed = JSON.parse(final);
      setResumeFinal(parsed);
      setStepThreeData(parsed);
    } catch {}
  }

}, []);

      useEffect(() => {
        const stepFromQuery = parseInt(searchParams.get("step"));
    
        const max = planType === "1" ? 4 : 5;
    
        if (stepFromQuery && stepFromQuery >= 1 && stepFromQuery <= max) {
          setCurrentStep(stepFromQuery);
        }
      }, [searchParams, planType]);

const summaryData = useMemo(() => {
  if (resumeQuote) {
    return resumeQuote;
  }

  try {
    const storedData = sessionStorage.getItem(
      "ultimateSummaryCard"
    );

    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (err) {
    console.error(err);
  }

  return {
    tenure: "",
    coverAmount: "",
    totalPremium: "",
    checkoutTotalPremium: "",
    basepremium: "",
    coverage: "",
    selectedAddons: {},
    compulsoryAddons: [],
    tenurePrices: {},
    addons: {},
    fullAddonsName: {},
  };
}, [resumeQuote]);


useEffect(() => {
  // if (!router.isReady) return;

  // if (!summaryData?.tenure && !quoteData?.totalpremium) return;

  const quoteSummary = {
    tenure: summaryData.tenure,
    coverAmount: summaryData.coverAmount,
    totalPremium: quoteData.totalpremium || summaryData.totalPremium,
   basepremium: quoteData.basepremium || summaryData.basepremium,
    coverage: quoteData.coverage || summaryData.coverage,
    selectedAddons: summaryData.selectedAddons,
    compulsoryAddons: summaryData.compulsoryAddons,
    tenurePrices: summaryData.tenurePrices,
    addons: summaryData.addons,
    fullAddonsName: summaryData.fullAddonsName,
    planType,
  };

  sessionStorage.setItem("ultimate_quote_summary", JSON.stringify(quoteSummary));
 

}, [summaryData, quoteData, planType]);

      useEffect(() => {
        if (stepthreedata?.status) {
          sessionStorage.setItem(
            "ultimate_final_summary",
            JSON.stringify(stepthreedata),
          );
        }
      }, [stepthreedata]);

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
  // const steps = ["Step", "Step", "Step", ""];
  const steps = planType === "1" ? ["", "", "", ""] : ["", "", "", "", ""];

  const back = async () => {
    if (currentStep === 1) {
      router.push(constant.ROUTES.HEALTH.ULTIMATECARE.CHECKOUT);
    } else {
      setLoading(true);
      setCurrentStep((prev) => prev - 1);
      setLoading(false);
    }
  };

  const validateFormStepOne = async () => {
    const rawValues = step1Form.getValues();

    const tp =
      typeof totalPremium === "number"
        ? totalPremium
        : Number(String(totalPremium).replace(/[^\d.]/g, "")); 

    if (tp > 50000 && kycType !== "PAN Card") {
      showError("For policies above ₹50,000, PAN verification is mandatory.");
      return false;
    }
    if (!kycVerified) {
      showError("Please complete KYC verification before proceeding.");
      return false;
    }


 // =========================================================================
    // 🔥 LIVE GENDER MISMATCH VALIDATION FOR ULTIMATE PLAN (STRICT INTERCEPTOR)
    // =========================================================================
    const formTitleGender = step1Form.getValues("mr_ms_gender") || "";
    const apiMemberGender = insurememberdata?.[0]?.gender || "";

    // Dono values ko lower-case karke standard 'male' ya 'female' mein convert karna
    const normalizedForm = (formTitleGender.toLowerCase() === "mr" || formTitleGender.toLowerCase() === "male") ? "male" : "female";
    const normalizedApi = (apiMemberGender.toLowerCase() === "male" || apiMemberGender.toLowerCase() === "m") ? "male" : "female";

    console.log("Ultimate Button Click Verification:", { normalizedForm, normalizedApi });

    // Agar user ka select kiya hua option backend verified criteria se alag hai, toh break karein
    if (normalizedForm !== normalizedApi) {
      showError(`Gender mismatch! Selected member is ${normalizedApi.toUpperCase()} but KYC verified is ${normalizedForm.toUpperCase()}.`);
      return false; // Dynamic forward progression block ho jayega
    }
    // =========================================================================

    const fieldsValid = await validateFields(step1Form);
    if (!fieldsValid) return false;

    const values = {
      ...rawValues,
      customerpancardDob: rawValues.customerpancardDob,
      sameAddress: sameAddress ? "1" : "0",
    };
    delete values.panDob;
    try {
      setLoading(true);
      const res = await CallApi(
        constant.API.HEALTH.ULTIMATECARE.SAVESTEPONE,
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
    // console.log(planType);
    const values = step2Form.getValues();
if (String(planType) != 2) {

  Object.keys(values).forEach((k) => {
    if (k.includes("attachmentdate")) {
      delete values[k];
    }
  });
}

    // return false;
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


    try {
      setLoading(true);
      const res = await CallApi(
        constant.API.HEALTH.ULTIMATECARE.SAVESTEPTWO,
        "POST",
        values
      );
      if (res === 1 || res?.status) {
         sessionStorage.setItem("planType", planType);
     console.log("planType", planType)
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
  showError("Please select your policy tenure (1, 2, or 3 years) to continue.");
  return false;
}

// ================== Dates ==================

const today = normalizeDate(new Date());

const start = normalizeDate(parseDDMMYYYY(startStr));
const end = normalizeDate(parseDDMMYYYY(endStr));
const first = normalizeDate(parseDDMMYYYY(firstStr));
// ================== 1. Format ==================

if (!start || !end || !first) {
  showError("Please enter all dates in DD-MM-YYYY format as mentioned in your policy document.");
  return false;
}

// ================== 2. No Future ==================

if (start.getTime() > today.getTime() || first.getTime() > today.getTime()) {
  showError("Policy start dates cannot be in the future. Please check your policy copy.");
  return false;
}

// ================== 3. Order ==================

if (first.getTime() > start.getTime()) {
  showError("First policy start date must be earlier than your current policy start date.");
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
    "Your previous policy must have expired within the last 30 days or should expire within the next 30 days to apply for portability."
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
      "Your policy duration does not match the selected tenure. Please verify your policy period."
    );
    return false;
  }
}

// ================== 6. Min 1 Year ==================

const policyDays = diffDays(start, end);

if (policyDays < 335) {
  showError(
    "Minimum 1 year of continuous health insurance coverage is required for portability."
  );
  return false;
}

// ================== 7. First Policy Start Date Validation ==================

if (porttenure === "1" || porttenure === "2") {

  const expectedFirst = normalizeDate(new Date(today));

  // Today - tenure years
  expectedFirst.setFullYear(
    expectedFirst.getFullYear() - tenureYears
  );

  // ±30 Days Range
  const minFirst = normalizeDate(new Date(expectedFirst));
  minFirst.setDate(minFirst.getDate() - 30);

  const maxFirst = normalizeDate(new Date(expectedFirst));
  maxFirst.setDate(maxFirst.getDate() + 30);

  // Range Check
  if (first < minFirst || first > maxFirst) {
    showError(
      "As per insurer guidelines, your first policy start date should be around "
      + tenureYears +
      " year(s) before today (within ±30 days). Please verify your policy document."
    );
    return false;
  }

  // Extra Rule for 1 Year Tenure
  if (porttenure === "1") {
    if (first.getTime() !== start.getTime()) {
      showError(
        "As per insurer rules, for 1 year portability, your first policy start date and previous policy start date must be the same."
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
      "Your last policy period does not match the selected tenure. Please recheck your policy details."
    );
    return false;
  }
}

// ================== 9. Member Attachment Validation ==================

const firstPolicyDate = normalizeDate(parseDDMMYYYY(firstStr));

if (!firstPolicyDate) {
  showError("Please enter a valid first policy start date as per your records.");
  return false;
}

for (let member of membersArray) {
  const attachDate = normalizeDate(
    parseDDMMYYYY(member.attachmentdate)
  );

  if (!attachDate) {
    showError(`Please enter a valid attachment date for ${member.name}.`);
    return false;
  }

  const name = (member.name || "").toLowerCase();

  // Self Rule
  if (name === "self") {
    if (attachDate.getTime() !== firstPolicyDate.getTime()) {
      showError(
        "Self member must be covered from the first policy start date."
      );
      return false;
    }
  }

  // Others Rule
  else {
    if (attachDate < firstPolicyDate) {
      showError(
        `${member.name} must be added after the first policy start date.`
      );
      return false;
    }
  }
}



    try {
      setLoading(true);

      const res = await CallApi(
        constant.API.HEALTH.ULTIMATECARE.SAVESTEPPORT,
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
    const data = step3Form.getValues();
    const members = steptwodata?.member || [];
    const agreeTnC = data.agreeTnC;
    const standingInstruction = data.standingInstruction;
    let hasError = false;
    let firstInvalidInput = null;
    let dobErrorShown = false;


    if (!agreeTnC) {
      if (!agreeTnC) step3Form.setFocus("agreeTnC");
      showError(
        "Please agree to Terms & Conditions and Standing Instruction to continue."
      );
      return false;
    }

    const sectionMap = {
      1: [
        "cancer",
        "heart",
        "hypertension",
        "breathing",
        "endocrine",
        "diabetes",
        "muscles",
        "liver",
        "kidney",
        "auto",
        "congenital",
        "hivaids",
        "any",
        "has",
        "hasany",
      ],
      2: ["insurer", "premium", "insurance", "diagnosed"],
      3: ["cigarettes"],
    };

    Object.values(sectionMap)
      .flat()
      .forEach((key) => {
        members.forEach((m, index) => {
          const checkKey = `${key}main${index + 1}`;
          const dateKey = `${checkKey}date`;

          const isChecked = data[checkKey];
          const dateValue = data[dateKey];
          const input = document.querySelector(`input[name="${dateKey}"]`);
          const trimmed = dateValue?.trim() || "";

          if (isChecked) {
            if (!trimmed) {
              if (input) {
                input.classList.add("border-red-500");
                if (!firstInvalidInput) firstInvalidInput = input;
              }
              hasError = true;
              return;
            }

            const [mm, yyyy] = trimmed.split("/");
            const month = parseInt(mm, 10);
            const year = parseInt(yyyy, 10);

            if (!month || month < 1 || month > 12) {
              if (input) {
                input.classList.add("border-red-500");
                if (!firstInvalidInput) firstInvalidInput = input;
              }
              hasError = true;
              return;
            }

            const inputDOB = input?.getAttribute("data-dob");
            if (inputDOB) {
              const [day, dobMM, dobYYYY] = inputDOB.split("-");
              const dobDate = new Date(
                Number(dobYYYY),
                Number(dobMM) - 1,
                Number(day)
              );
              const inputDate = new Date(year, month - 1);

              const dobMonth = dobDate.getMonth();
              const dobYear = dobDate.getFullYear();
              const inputMonth = inputDate.getMonth();
              const inputYear = inputDate.getFullYear();

              const today = new Date();
              const currentMonth = today.getMonth();
              const currentYear = today.getFullYear();

              const isBeforeDOB =
                inputYear < dobYear ||
                (inputYear === dobYear && inputMonth < dobMonth);

              const isInFuture =
                inputYear > currentYear ||
                (inputYear === currentYear && inputMonth > currentMonth);

              if (isBeforeDOB || isInFuture) {
                input.classList.add("border-red-500");
                if (!firstInvalidInput) firstInvalidInput = input;
                hasError = true;

                if (!dobErrorShown) {
                  showError(
                    isBeforeDOB
                      ? "Date cannot be before member's Date of Birth (MM/YYYY)."
                      : "Date cannot be in the future (MM/YYYY)."
                  );
                  dobErrorShown = true;
                }
                return;
              }
            }

            input?.classList.remove("border-red-500");
          } else {
            input?.classList.remove("border-red-500");
          }
        });
      });

    if (hasError) {
      if (firstInvalidInput) {
        firstInvalidInput.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        firstInvalidInput.focus();
      }
      showError(
        "Please fill valid MM/YYYY (month ≤ 12, not before DOB or future) for all selected members."
      );
      return false;
    }

    const getExtraFields = (keyPrefix) => ({
      des: data[`${keyPrefix}desc`] || "",
      quantity: data[`${keyPrefix}qty`] || 0,
    });

    const result = [];

    members.forEach((m, index) => {
      const memberData = {
        id: m.id,
        age: m.age,
        dob: m.dob,
        data: [],
      };

      Object.entries(sectionMap).forEach(([section, keys]) => {
        keys.forEach((key, keyIndex) => {
          const checkKey = `${key}main${index + 1}`;
          const dateKey = `${checkKey}date`;

          if (data[checkKey] && data[dateKey]) {
            const extra = getExtraFields(checkKey);

            memberData.data.push({
              did: `${section}.${keyIndex + 1}`,
              date: data[dateKey],
              des: extra.des,
              quantity: section === "3" ? extra.quantity : 0,
            });
          }
        });
      });

      if (memberData.data.length > 0) {
        result.push(memberData);
      }
    });
    
    try {
      const res = await CallApi(
        constant.API.HEALTH.ULTIMATECARE.SAVESTEPTHREE,
        "POST",
        result
      );
      if (res === 1 || res?.status) {
        setStepThreeData(res);
        return true;
      } else {
        console.error("Step 3 API failed or returned unexpected value:", res);
        return false;
      }
    } catch (error) {
      console.error("Step 3 API call error:", error);
      return false;
    }
    return result;
  };

  const GoToPayment = async () => {
    setLoading(true);
    try {
      const res = await CallApi(
        constant.API.HEALTH.ULTIMATECARE.CREATEPOLICY,
        "POST"
      );
  const status = res?.status
   if (status === "1" || status === 1 || status === true) {
    
      const response = await CallApi(
         constant.API.HEALTH.ULTIMATECARE.GETPROPOSAL,
        "POST"
      );
       const proposalNumber = response?.proposalNumber;
       const guid = response?.guid;
       const proposalEncode = response?.proposalencode;
       const returnURL = response?.returnurl;
       const gatewayURL = response?.getwayurl;
     
      if (response?.proposalNumber) {
        router.push(
          `/health/vendors/ultimatecare/payment?proposalNumber=${proposalNumber}&proposalEncode=${proposalEncode}&guid=${guid}&returnURL=${returnURL}&gatewayURL=${gatewayURL}`
        );
      }
    } else {
      const fallbackMsg = "Something went wrong while creating policy.";
      const backendMsg =
        res?.error?.[0]?.errDescription || res?.message || fallbackMsg;
      showError(backendMsg);
    }
    } catch (error) {
      console.error("API Error", error);
    } finally {
      setLoading(false);
    }
  };

  const maxStep = planType === "1" ? 4 : 5;

const goNext = () => 
  setCurrentStep((prev) => Math.min(prev + 1, maxStep));


  const onSubmitStep = async () => {
    setSubmitStepLoader(true);
    try {
      let isValid = false;
        if (currentStep === 1) isValid = await validateFormStepOne();
        else if (currentStep === 2) isValid = await validateFormStepTwo();
        else if (planType !== "1" && currentStep === 3) {
          isValid = await validateFormExtraStep(stepPortForm, steptwodata);
        }
        else if (currentStep === (planType === "1" ? 3 : 4)) {
          if (planType == "1") {
            isValid = await validateFormStepThree(step3Form, steptwodata);
          } else {
            isValid = await portquestionvalidation(step3Form, steptwodata, setStepThreeData);
          }
        }
        else if (currentStep === (planType === "1" ? 4 : 5)) {
          isValid = await GoToPayment();
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
      totalPremium,
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
  insurememberdata,
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
  setVerifiedData
    );
  };

  const handleVerifyAadhar = async () => {
    const values = step1Form.getValues();
    await validateKycStep(
      selfData,
      step1Form,
      "Aadhar ( Last 4 Digits )",
      values,
      totalPremium,
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
    await validateKycStep(
      selfData,
      step1Form,
      "Others",
      values,
      totalPremium,
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
  useEffect(() => {
    if (quoteData.totalpremium) {
    }
  }, [quoteData]);
useEffect(() => {
  const paymentStatus = searchParams.get("payment");

  if (paymentStatus === "failed") {

    setIsPaymentFailed(true);
    showError("Payment failed. Please try again.");

    const sessionPlanType = sessionStorage.getItem("planType");

    if (sessionPlanType) {
      setPlanType(sessionPlanType); 
    }

    const lastStep = sessionPlanType === "1" ? 4 : 5;

    setCurrentStep(lastStep);
    const quote = sessionStorage.getItem("ultimate_quote_summary");

    if (quote) {
      const parsedQuote = JSON.parse(quote);

      setResumeQuote(parsedQuote);

      setQuoteData({
  totalpremium: parsedQuote.totalPremium,
  basepremium: parsedQuote.basepremium,
  coverage: parsedQuote.coverage,
});
    }
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
                     updateUrlPremium={updateUrlPremium}
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
                          setInsureMemberData={setInsureMemberData}
                     setVerifiedData={setVerifiedData}
                  />
                )}
                {currentStep === 2 && (
                  <StepTwoForm
                    step2Form={step2Form}
                    steponedata={steponedata}
                    inputClass={inputClass}
                    onSubmitStep={onSubmitStep}
                    usersData={usersData}
                    planType ={planType }
                  />
                )}
                {planType !== "1" && currentStep === 3 && (
              <ExtraStepForPortForm
                stepPortForm={stepPortForm}
                steptwodata={steptwodata}
                setPortMemberData={setPortMemberData}
                inputClass={inputClass}
                 insurdata={insurdata}
                onSubmitStep={onSubmitStep}
                 setTenureYear={setTenureYear}
                 usersData={usersData}
              />
              )}
              {currentStep === (planType === "1" ? 3 : 4) && (
            planType === "1" ? (
                    <StepThreeForm
                      step3Form={step3Form}
                      steptwodata={steptwodata}
                      inputClass={inputClass}
                      onSubmitStep={onSubmitStep}
                    />
                  ) : (
                    <StepThreeFormPort
                      step3Form={step3Form}
                      steptwodata={steptwodata}
                      inputClass={inputClass}
                      onSubmitStep={onSubmitStep}
                    />
                  )
                )}

                {currentStep === (planType === "1" ? 4 : 5) && (
                  <StepFourForm
                    step4Form={step4Form}
                    stepthreedata={stepthreedata}
                    onSubmitStep={onSubmitStep}
                    currentStep={currentStep}
                    totalPremium={totalPremium}
                    onGoToPayment={GoToPayment}
                    planType={planType}
                  />
                )}
              </div>
            </div>

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
              newPincode={newPincode}
              oldPincode={oldPincode}
               planType={planType}
                 isMemberUpdated={isMemberUpdated}
              prevPremiumBeforeMemberUpdate={prevPremiumBeforeMemberUpdate}
               isPaymentFailed={isPaymentFailed}
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
        quoteData?.totalpremium || summaryData?.totalPremium,
      );

      const dbSelfFallback = steponedata?.members?.find(
        (m) => m?.name?.toLowerCase() === "self"
      );
      const verifiedMemberId = selfData?.[0]?.id || dbSelfFallback?.id || "";

      const payload = {
        id: verifiedMemberId,
        age: selfData?.[0]?.age,
        dob: selfData?.[0]?.dob,
        gender: selfData?.[0]?.gender,
      };

      if (!payload.id) {
        showError("Member ID is missing. Please reload or verify details again.");
        setModalLoading(false);
        return;
      }

      const res = await CallApi(
        constant.API.HEALTH.ULTIMATECARE.UPDATEAGE,
        "POST",
        payload,
      );

      if (res === 1 || res?.status) {
        const proposerDob = res?.members?.[0]?.dob || res?.proposardata?.[0]?.dob;

        if (proposerDob) {
          step1Form.setValue("customerpancardDob", proposerDob, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }

        const premiumData = res?.premium || {};
        
        setQuoteData({
          totalpremium: premiumData.totalpremium || res.totalpremium,
          basepremium: premiumData.basepremium || res.basepremium,
          coverage: premiumData.coverage || res.coverage,
        });
        
        const existingSummary = JSON.parse(
          sessionStorage.getItem("ultimateSummaryCard") || "{}"
        );

        const updatedSummary = {
          ...existingSummary,
          totalPremium: premiumData.totalpremium || res.totalpremium,
          basepremium: premiumData.basepremium || res.basepremium,
          coverage: premiumData.coverage || res.coverage,
          checkoutTotalPremium: premiumData.totalpremium || res.totalpremium, 
        };

        sessionStorage.setItem("ultimateSummaryCard", JSON.stringify(updatedSummary));
        sessionStorage.setItem("ultimate_quote_summary", JSON.stringify(updatedSummary));

        updateUrlPremium(res.totalpremium, res.basepremium, res.coverage);
        
        await clearDBData();

        setIsMemberUpdated(true);
        setShowKycMismatchModal(false);
        showSuccess("Member details updated. Please verify PAN again.");
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
    Your PAN details do not match with selected member. Please update details below.
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
              field.value ? parse(field.value, "dd-MM-yyyy", new Date()) : null
            }
            onChange={(date) => {
              if (date instanceof Date && !isNaN(date)) {
                const formattedDob = format(date, "dd-MM-yyyy");
                field.onChange(formattedDob);

                const today = new Date();
                let age = today.getFullYear() - date.getFullYear();
                const monthDiff = today.getMonth() - date.getMonth();

                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
                  age--;
                }

                setSelfData((prev) => {
                  if (!Array.isArray(prev)) {
                    return [{ ...prev, dob: formattedDob, age }];
                  }
                  return prev.map((item, i) =>
                    i === 0 ? { ...item, dob: formattedDob, age } : item
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

      {selfData?.[0]?.age && (
        <div className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Age: {selfData?.[0]?.age} Years
        </div>
      )}
    </div>

    {/* <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Gender</p>
      <div className="grid grid-cols-2 gap-4">
        {["male", "female"].map((g) => (
          <label
            key={g}
            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
              selfData?.[0]?.gender === g ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200 bg-white hover:border-blue-300"
            }`}
          >
            <input
              type="radio"
              name="modalGender"
              value={g}
              hidden
              checked={selfData?.[0]?.gender === g}
              onChange={() => {
                setSelfData((prev) => {
                  if (!Array.isArray(prev)) return [{ ...prev, gender: g }];
                  return prev.map((item, i) => i === 0 ? { ...item, gender: g } : item);
                });
              }}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`relative h-10 w-10 overflow-hidden rounded-full ${selfData?.[0]?.gender === g ? "ring-2 ring-blue-500" : ""}`}>
                  <Image
                    src={g === "male" ? "/images/health/insure/father.jpg" : "/images/health/insure/wife.jpg"}
                    alt={g}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{g === "male" ? "Male" : "Female"}</p>
                  <p className="text-xs text-gray-500">Select insured gender</p>
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div> */}
  </div>
<p className="mt-4 text-xs text-gray-500 leading-relaxed">
  Please ensure that the selected age matches the details on your PAN card before continuing. Updating details may recalculate your premium amount.
</p>
</Modal>
    </>
  );
}
