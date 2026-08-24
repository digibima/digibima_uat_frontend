"use client";
import React, { useState, useEffect, useCallback } from "react";
import UniversalDatePicker from "../../../../datepicker/index";
import { format, parse } from "date-fns";
import { isNumber } from "@/styles/js/validation";
import { CallApi } from "@/api";
import constant from "@/env";
import { Controller } from "react-hook-form";
import { useMemo } from "react";

// --- helpers ---
const normalizeRelation = (rel = "") => rel?.toLowerCase().trim();

const getPrefixByRelation = (relation) => {
  const r = normalizeRelation(relation);
  if (r === "son" || r === "daughter") return "child";
  if (r === "husband" || r === "wife") return "spouse"; 
  return r || "";
};

const isChildRel = (relation) => {
  const r = normalizeRelation(relation);
  return r === "son" || r === "daughter";
};
const isSpouseRel = (relation) => {
  const r = normalizeRelation(relation);
  return r === "husband" || r === "wife";
};

const titleByRelation = (relation) => {
  const r = normalizeRelation(relation);
  if (!r) return "";
  if (r === "husband") return "Husband";
  if (r === "wife") return "Spouse";
  return r.charAt(0).toUpperCase() + r.slice(1);
};

export default function StepTwoForm({
  step2Form,
  steponedata,
  inputClass,
  onSubmitStep,
  usersData,
  planType
}) {
  // console.log("steponedata",steponedata);
  // console.log("usersData",usersData);
  const [insureData, setInsureData] = useState([]);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [dates, setDates] = useState({});
  const [apiMembers, setApiMembers] = useState([]);
  const [occupationList, setOccupationList] = useState({});
  const [selfGender, setSelfGender] = useState("");

  const handleDateChange = useCallback(
    (key, fieldNameInForm) => (date) => {
      if (!date || isNaN(date)) return;
      const formatted = format(date, "dd-MM-yyyy");
      setDates((prev) => ({ ...prev, [key]: { ...prev[key], dob: date } }));
      step2Form.clearErrors(fieldNameInForm);
      step2Form.setValue(fieldNameInForm, formatted, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    },
    [step2Form]
  );

  useEffect(() => {
    if (isAutoFilled) return;

    // console.log("steponedata",steponedata)
const self = steponedata?.self?.[0] || {};

// ONLY self data source
const getVal = (key) => self[key] || "";

    const fieldMap = {
      proposername: "kyc_name",
      proposerdob2: "dob",
      proposerheight: "height",
      proposerinches: "inch",
      proposerweight: "weight",
      proposeroccupation: "occupation",
    };

    Object.entries(fieldMap).forEach(([formKey, dataKey]) => {
      if (!step2Form.getValues(formKey)) {
        step2Form.setValue(formKey, getVal(dataKey));
      }
    });

    if (!step2Form.getValues("proposerdob2") && getVal("dob")) {
      const parsedDate = parse(getVal("dob"), "dd-MM-yyyy", new Date());
      setDates((prev) => ({ ...prev, self: { dob: parsedDate } }));
    }

    // try {
    //   const bank = u.bank_details ? JSON.parse(u.bank_details) : {};
    //   if (!step2Form.getValues("proposarbankaccount")) {
    //     step2Form.setValue("proposarbankaccount", bank.account || "");
    //   }
    //   if (!step2Form.getValues("proposarbankifsc")) {
    //     step2Form.setValue("proposarbankifsc", bank.ifsc || "");
    //   }
    // } catch (err) {
    //   console.error("Bank details parse error", err);
    // }

    // setIsAutoFilled(true);
  }, [isAutoFilled, step2Form, steponedata, usersData]);

  const allMembers = steponedata?.members || [];

  const spouseMembers = allMembers.filter((m) =>
    ["wife", "husband"].includes(m.name?.toLowerCase())
  );
  const childrenMembers = allMembers.filter((m) =>
    ["son", "daughter"].includes(m.name?.toLowerCase())
  );
  const otherMembers = allMembers.filter(
    (m) =>
      !["self", "wife", "husband"].includes(m.name?.toLowerCase()) &&
      !["son", "daughter"].includes(m.name?.toLowerCase()) &&
      !m.name?.toLowerCase().includes("nominee")
  );

  // Final members order
const orderedMembers = useMemo(() => {
  return [
    ...spouseMembers,
    ...childrenMembers,
    ...otherMembers,
  ];
}, [spouseMembers, childrenMembers, otherMembers]);

  let childCount = 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAutoFilled) return;

        const res = await CallApi(constant.API.HEALTH.BAJAJ.SAVESTEPTWO, "GET");
        const savedData = res.data || [];
        // console.log("hello world", res);
        setOccupationList(res.occupationlist || {});
 setInsureData(res?.insure || []);
 
       const selfData = savedData.find(
  (item) => item.relation?.toLowerCase() === "self"
);

if (selfData) {
    setSelfGender(selfData.gender?.toLowerCase() || "");
  let proposerData = {};

  try {
    proposerData = selfData.proposer_details
      ? JSON.parse(selfData.proposer_details)
      : {};
  } catch (e) {
    console.log("proposer_details parse error", e);
  }

const stepOneSelf = steponedata?.self?.[0] || {};

step2Form.setValue(
  "proposername",
  stepOneSelf.kyc_name || ""
);

step2Form.setValue(
  "proposerdob2",
  stepOneSelf.dob || ""
);

 if (stepOneSelf.dob) {
  const parsedDate = parse(
    stepOneSelf.dob,
    "dd-MM-yyyy",
    new Date()
  );

    setDates((prev) => ({
      ...prev,
      self: { dob: parsedDate },
    }));
  }

  step2Form.setValue(
    "proposerheight",
    proposerData.height || selfData.height || ""
  );

  step2Form.setValue(
    "proposerinches",
    proposerData.inch || selfData.inch || ""
  );

  step2Form.setValue(
    "proposerweight",
    proposerData.weight || selfData.weight || ""
  );

  step2Form.setValue(
    "monthlyincom",
    proposerData.monthlyincom || ""
  );

  step2Form.setValue(
    "proposeroccupation",
    proposerData.occupation || selfData.occupation || ""
  );
}

        const nomineeData = savedData.find((item) =>
          (item.relation || "").toLowerCase().includes("nominee")
        );
        if (nomineeData) {
          step2Form.setValue("nomineename", nomineeData.name || "");
          step2Form.setValue("nomineedob", nomineeData.dob || "");
          if (nomineeData.dob) {
            const parsedDate = parse(nomineeData.dob, "dd-MM-yyyy", new Date());
            setDates((prev) => ({ ...prev, nominee: { dob: parsedDate } }));
          }
          const cleanRelation = nomineeData.relation
            ?.replace(/[^a-z]/gi, "")
            .replace(/nominee/gi, "")
            .trim();
          const capitalizedRelation =
            cleanRelation?.charAt(0).toUpperCase() +
            cleanRelation?.slice(1).toLowerCase();
          step2Form.setValue("nomineerelation", capitalizedRelation || "");
        }

        setApiMembers(savedData);
        setIsAutoFilled(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [isAutoFilled, step2Form,steponedata]);

  /** Prefill members from API into form fields (ONLY for members present in Step One) */
  useEffect(() => {
    if (!apiMembers || !apiMembers.length) return;

    let childCounter = 1;
    const relationCounters = {};

    orderedMembers.forEach((member) => {
      const relation = normalizeRelation(member?.name);
      if (!relation || relation === "self" || relation.includes("nominee")) return;

      const isChild = isChildRel(relation);
      const prefix = getPrefixByRelation(relation);
      const suffix = isChild ? String(childCounter++) : "";

      relationCounters[relation] = (relationCounters[relation] || 0) + 1;
      const currentMatchOccurrence = relationCounters[relation];

      let matchIndex = 0;
      const apiMember = apiMembers.find((api) => {
        if (normalizeRelation(api?.relation) === relation) {
          matchIndex += 1;
          return matchIndex === currentMatchOccurrence;
        }
        return false;
      });
      // ---------------------------------------------------------

      const dobField = suffix ? `${prefix}dob${suffix}` : `${prefix}dob`;
      const relationField = `${prefix}relation${suffix}`;
      const attachField = suffix ? `${prefix}attachmentdate${suffix}` : `${prefix}attachmentdate`;

      step2Form.setValue(`${prefix}name${suffix}`, apiMember?.name || "");
      step2Form.setValue(`${prefix}height${suffix}`, apiMember?.height || "");
      step2Form.setValue(`${prefix}inches${suffix}`, apiMember?.inch || "");
      step2Form.setValue(`${prefix}weight${suffix}`, apiMember?.weight || "");

      if (!isChild) {
        step2Form.setValue(
          `${prefix}occupation${suffix}`,
          apiMember?.gender === "MALE" ? "Salaried" : "Unemployed"
        );
      }

      if (isChild) {
        step2Form.setValue(relationField, relation, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }

      // Set DOB from steponedata
      const finalDob = member?.dob || "";
      step2Form.setValue(dobField, finalDob, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      step2Form.clearErrors(dobField);

      if (planType == 2 && apiMember?.attachmentdate) {
        step2Form.setValue(attachField, apiMember.attachmentdate, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
        step2Form.clearErrors(attachField);
      }
    });
  }, [apiMembers, steponedata?.members,orderedMembers, step2Form, planType]);


  useEffect(() => {
    const sub = step2Form.watch((vals, { name }) => {
      if (name && vals?.[name]) step2Form.clearErrors(name);
    });
    return () => sub?.unsubscribe?.();
  }, [step2Form]);

        let childCounterForRender = 1;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Self:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          {...step2Form.register("proposername", {
            required: "Name is required",
          })}
          readOnly
          placeholder="Proposer Name"
          onInput={(e) => {
            e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
          }}
          className={inputClass}
        />

   <input
  {...step2Form.register("proposerdob2", {
    required: "Proposer DOB required",
  })}
  readOnly={true}
  value={step2Form.watch("proposerdob2") || ""}
  placeholder="DD-MM-YYYY"
  className={inputClass}
/>

        <select
          {...step2Form.register("proposeroccupation", {
            required: "Please select an occupation",
          })}
          className={`${inputClass} max-h-10 overflow-y-auto`}
          style={{ height: "auto" }}
        >
          <option value="" disabled selected>
            Select Occupation
          </option>
          {Object.entries(occupationList).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            {...step2Form.register("proposerheight", {
              required: "Height (Feet) is required",
            })}
            onChange={(e) => isNumber(e, step2Form.setValue, "proposerheight")}
            maxLength={1}
            placeholder="Height (Feet)"
            className={`${inputClass} w-1/2`}
          />
          <input
            {...step2Form.register("proposerinches", {
              required: "Height (Inches) is required",
            })}
            onChange={(e) => isNumber(e, step2Form.setValue, "proposerinches")}
            maxLength={2}
            placeholder="Height (Inches)"
            className={`${inputClass} w-1/2`}
          />
        </div>

        <input
          {...step2Form.register("proposerweight", {
            required: "Weight is required",
          })}
          onChange={(e) => isNumber(e, step2Form.setValue, "proposerweight")}
          maxLength={3}
          placeholder="Weight (KG)"
          className={inputClass}
        />
        <input
          {...step2Form.register("monthlyincom", {
            required: "Monthly Incom is required",
          })}
          onChange={(e) => isNumber(e, step2Form.setValue, "monthlyincom")}
          placeholder="Monthly Incom"
          className={inputClass}
        />
      </div>

      {orderedMembers.map((member, index) => {
        const relation = normalizeRelation(member?.name);
        const isChild = isChildRel(relation);
        const isSpouse = isSpouseRel(relation);

        const prefix = getPrefixByRelation(relation);
        const suffix = isChild ? childCounterForRender++ : "";
        const dobFieldName = isChild ? `${prefix}dob${suffix}` : `${prefix}dob`;

        const spouseLabel = isSpouse
          ? relation === "husband"
            ? "Husband"
            : "Spouse"
          : "";
        const spouseKeyLabel = isSpouse
          ? relation === "husband"
            ? "husband"
            : "spouse"
          : "";

        return (
          <div key={index} className="mt-6">
            <h2 className="font-semibold text-lg capitalize mb-4">
              {titleByRelation(relation)} Details:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                {...step2Form.register(
                  isChild ? `${prefix}name${suffix}` : `${prefix}name`,
                  {
                    required: isSpouse
                      ? `${spouseKeyLabel}name is required`
                      : "Name is required",
                  }
                )}
                placeholder={
                  isSpouse
                    ? `Enter ${spouseLabel}'s Full Name`
                    : `Enter ${member.name}'s Full Name`
                }
                  onInput={(e) => {
                e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
              }}
                className={inputClass}
              />

              <input
                {...step2Form.register(dobFieldName,{
                  required: isSpouse
                    ? `${spouseKeyLabel}dob is required`
                    : "DOB is required",
                })}
                readOnly={true}
                value={
                  member?.dob || step2Form.watch(dobFieldName) || ""
                }
                placeholder="DD-MM-YYYY"
                className={inputClass}
              />

              {isChild ? (
                <select
                  {...step2Form.register(`${prefix}relation${suffix}`, {
                    required: "Please select a relation",
                  })}
                  hidden
                  className={`${inputClass}`}
                  style={{ pointerEvents: "none", touchAction: "none" }} 
                  tabIndex={-1}
                >
                  <option value="">Child Relation</option>
                  <option value="son">Son</option>
                  <option value="daughter">Daughter</option>
                </select>
              ) : isSpouse ? (
                <select
                  {...step2Form.register(`${prefix}occupation`, {
                    required: `${spouseKeyLabel}occupation is required`,
                  })}
                  className={inputClass}
                  style={{ height: "auto" }}
                >
                  <option value="" disabled selected>
                    Select Occupation
                  </option>
                  {Object.entries(occupationList).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              ) : null}

              <div className="flex gap-2">
                <input
                  {...step2Form.register(
                    isChild ? `${prefix}height${suffix}` : `${prefix}height`,
                    {
                      required: isSpouse
                        ? `${spouseKeyLabel}height is required`
                        : "Height (Feet) is required",
                    }
                  )}
                  onChange={(e) =>
                    isNumber(
                      e,
                      step2Form.setValue,
                      isChild ? `${prefix}height${suffix}` : `${prefix}height`
                    )
                  }
                  maxLength={1}
                  placeholder={
                    isSpouse ? `${spouseLabel} Height (Feet)` : "Height (Feet)"
                  }
                  className={`${inputClass} w-1/2`}
                />
                <input
                  {...step2Form.register(
                    isChild ? `${prefix}inches${suffix}` : `${prefix}inches`,
                    {
                      required: isSpouse
                        ? `${spouseKeyLabel}inches is required`
                        : "Height (Inches) is required",
                    }
                  )}
                  onChange={(e) =>
                    isNumber(
                      e,
                      step2Form.setValue,
                      isChild ? `${prefix}inches${suffix}` : `${prefix}inches`
                    )
                  }
                  maxLength={2}
                  placeholder={
                    isSpouse
                      ? `${spouseLabel} Height (Inches)`
                      : "Height (Inches)"
                  }
                  className={`${inputClass} w-1/2`}
                />
              </div>

              <input
                {...step2Form.register(
                  isChild ? `${prefix}weight${suffix}` : `${prefix}weight`,
                  {
                    required: isSpouse
                      ? `${spouseKeyLabel}weight is required`
                      : "Weight is required",
                  }
                )}
                onChange={(e) =>
                  isNumber(
                    e,
                    step2Form.setValue,
                    isChild ? `${prefix}weight${suffix}` : `${prefix}weight`
                  )
                }
                maxLength={3}
                placeholder={
                  isSpouse ? `${spouseLabel} Weight (KG)` : "Weight (KG)"
                }
                className={inputClass}
              />
            </div>
          </div>
        );
      })}

      <h2 className="text-xl font-bold text-gray-800 mt-8">Nominee:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          {...step2Form.register("nomineename", {
            required: "Nominee Name is required",
          })}
          placeholder="Enter Nominee Full Name"
            onInput={(e) => {
                e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
              }}
          className={inputClass}
        />
        <Controller
          control={step2Form.control}
          name="nomineedob"
          rules={{ required: "Nominee DOB is required" }}
          render={({ field, fieldState }) => (
            <UniversalDatePicker
              id="nomineedob"
              name="nomineedob"
              value={
                field.value
                  ? parse(field.value, "dd-MM-yyyy", new Date())
                  : null
              }
              onChange={(date) => {
                if (date instanceof Date && !isNaN(date)) {
                  const formatted = format(date, "dd-MM-yyyy");
                  field.onChange(formatted);
                  handleDateChange("nominee", "nomineedob")(date);
                }
              }}
              error={!!fieldState.error}
              errorText={fieldState.error?.message}
              placeholder="Pick a date"
            />
          )}
        />

        <select
          {...step2Form.register("nomineerelation", {
            required: "Please select the nominee relation",
          })}
          className={inputClass}
        >
          <option value="">Relation</option>
          {selfGender === "male" && (
            <option value="Spouse">Wife</option>
          )}

          {selfGender === "female" && (
            <option value="Husband">Husband</option>
          )}
          <option value="Father">Father</option>
          <option value="Mother">Mother</option>
          <option value="Brother">Brother</option>
          <option value="Sister">Sister</option>
          <option value="Son">Son</option>
          <option value="Daughter">Daughter</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onSubmitStep}
        className="mt-6 px-6 py-2 thmbtn"
      >
        Continue
      </button>
    </form>
  );
}
