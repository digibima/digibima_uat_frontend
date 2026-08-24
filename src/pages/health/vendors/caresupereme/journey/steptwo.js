"use client";
import React, { useState, useEffect, useCallback } from "react";
import UniversalDatePicker from "../../../../datepicker/index";
import { format, parse } from "date-fns";
import { isNumber } from "@/styles/js/validation";
import { CallApi } from "@/api";
import constant from "@/env";
import { Controller } from "react-hook-form";
import { useMemo } from "react";

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
  planType,
}) {
  const [insureData, setInsureData] = useState([]);
  useEffect(() => {
    if (String(planType) != 2) {
      const values = step2Form.getValues();

      Object.keys(values).forEach((key) => {
        if (key.includes("attachmentdate")) {
          step2Form.unregister(key, {
            keepValue: false,
            keepError: false,
            keepDirty: false,
            keepTouched: false,
          });

          step2Form.setValue(key, undefined);
          step2Form.clearErrors(key);
        }
      });
    }
  }, [planType, step2Form]);

  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [dates, setDates] = useState({});
  const [apiMembers, setApiMembers] = useState([]);
  const [kycData, setKycData] = useState(null);

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
    [step2Form],
  );

  useEffect(() => {
    if (isAutoFilled) return;

    const self = steponedata?.self?.[0] || {};
    const u = usersData || {};
    const getVal = (key) => self[key] || u[key] || "";

    const fieldMap = {
      // proposername: "kyc_name",
      // proposerdob2: "dob",
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

    try {
      const bank = u.bank_details ? JSON.parse(u.bank_details) : {};
      if (!step2Form.getValues("proposarbankaccount")) {
        step2Form.setValue("proposarbankaccount", bank.account || "");
      }
      if (!step2Form.getValues("proposarbankifsc")) {
        step2Form.setValue("proposarbankifsc", bank.ifsc || "");
      }
    } catch (err) {
      console.error("Bank details parse error", err);
    }

    setIsAutoFilled(true);
  }, [isAutoFilled, step2Form, steponedata, usersData]);

  const allMembers = steponedata?.members || [];

  const spouseMembers = allMembers.filter((m) =>
    ["wife", "husband"].includes(m.name?.toLowerCase()),
  );
  const childrenMembers = allMembers.filter((m) =>
    ["son", "daughter"].includes(m.name?.toLowerCase()),
  );
  const otherMembers = allMembers.filter(
    (m) =>
      !["self", "wife", "husband"].includes(m.name?.toLowerCase()) &&
      !["son", "daughter"].includes(m.name?.toLowerCase()) &&
      !m.name?.toLowerCase().includes("nominee"),
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

        const res = await CallApi(
          constant.API.HEALTH.CARESUPEREME.SAVESTEPTWO,
          "GET",
        );
        const savedData = res.data || [];
        const kyc = res?.kycdata || null;
        const proposalDetails = res?.prposaldetails || {};
      setInsureData(res?.insure || []);
        if (proposalDetails?.name) {
          step2Form.setValue("proposername", proposalDetails.name, {
            shouldValidate: true,
          });
        }

        if (proposalDetails?.dob) {
          step2Form.setValue("proposerdob2", proposalDetails.dob, {
            shouldValidate: true,
          });

          const parsedDate = parse(
            proposalDetails.dob,
            "dd-MM-yyyy",
            new Date(),
          );

          setDates((prev) => ({
            ...prev,
            self: { dob: parsedDate },
          }));
        }
        setKycData(kyc);
        const raw = res.bank_details;
        if (raw) {
          const bankData =
            typeof raw === "object"
              ? typeof raw.bank_details === "string"
                ? JSON.parse(raw.bank_details)
                : raw
              : {};
          if (!step2Form.getValues("proposarbankaccount")) {
            step2Form.setValue("proposarbankaccount", bankData.account || "");
          }
          if (!step2Form.getValues("proposarbankifsc")) {
            step2Form.setValue("proposarbankifsc", bankData.ifsc || "");
          }
        }

        const selfData = savedData.find(
          (item) => item.relation?.toLowerCase() === "self",
        );

        if (selfData && !kycData) {
          if (selfData.dob) {
            const parsedDate = parse(selfData.dob, "dd-MM-yyyy", new Date());
            setDates((prev) => ({ ...prev, self: { dob: parsedDate } }));
          }
          step2Form.setValue("proposerheight", selfData.height || "");
          step2Form.setValue("proposerinches", selfData.inch || "");
          step2Form.setValue("proposerweight", selfData.weight || "");
          step2Form.setValue(
            "proposeroccupation",
            selfData.gender === "MALE" ? "Salaried" : "Unemployed",
          );
          if (planType == 2 && selfData.attachmentdate) {
            step2Form.setValue(
              "proposerattachmentdate",
              selfData.attachmentdate,
            );
          }
        }

       const nomineeData = savedData.find((item) =>
  (item.relation || "").toLowerCase().includes("nominee"),
);

if (nomineeData) {
  step2Form.setValue("nomineename", nomineeData.name || "");
  step2Form.setValue("nomineedob", nomineeData.dob || "");

  step2Form.setValue(
    "nomineegender",
    (nomineeData.gender || "").toLowerCase()
  );

  if (nomineeData.dob) {
    const parsedDate = parse(nomineeData.dob, "dd-MM-yyyy", new Date());
    setDates((prev) => ({ ...prev, nominee: { dob: parsedDate } }));
  }

const cleanRelation = nomineeData.relation
  ?.replace(/\(.*?\)/g, "")
  .trim();

const capitalizedRelation =
  cleanRelation?.charAt(0).toUpperCase() +
  cleanRelation?.slice(1).toLowerCase();

const genderLower = (nomineeData.gender || "").toLowerCase();

step2Form.setValue("nomineegender", genderLower);

setTimeout(() => {
  step2Form.setValue("nomineerelation", capitalizedRelation || "");
}, 0);
}

        setApiMembers(savedData);
        setIsAutoFilled(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [isAutoFilled, step2Form, kycData, planType]);

  //  Apply KYC to form (Highest Priority)
  // useEffect(() => {
  //   if (!kycData) return;

  //   // Name
  //   if (kycData?.name) {
  //     step2Form.setValue("proposername", kycData.name, {
  //       shouldValidate: true,
  //     });
  //   }

  //   // DOB
  //   if (kycData?.getdob) {
  //     step2Form.setValue("proposerdob2", kycData.getdob, {
  //       shouldValidate: true,
  //     });

  //     const parsed = parse(kycData.getdob, "dd-MM-yyyy", new Date());

  //     setDates((prev) => ({
  //       ...prev,
  //       self: { dob: parsed },
  //     }));
  //   }
  // }, [kycData, step2Form]);

/** Prefill members directly mapping with the ordered UI fields */
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
        const apiRel = normalizeRelation(api?.relation);
        if (apiRel === relation || (isChild && (apiRel.includes("child") || apiRel === "son" || apiRel === "daughter"))) {
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

  const selectedNomineeGender = step2Form.watch("nomineegender");

  const nomineeRelationOptions = [
    { value: "Wife", gender: "female" },
    { value: "Husband", gender: "male" },
    { value: "Father", gender: "male" },
    { value: "Mother", gender: "female" },
    { value: "Son", gender: "male" },
    { value: "Daughter", gender: "female" },
    { value: "Grand Mother", gender: "female" },
    { value: "Grand Father", gender: "male" },
    { value: "Brother", gender: "male" },
    { value: "Sister", gender: "female" },
    { value: "Brother-In-Law", gender: "male" },
    { value: "Sister-In-Law", gender: "female" },
    { value: "Mother-In-Law", gender: "female" },
    { value: "Father-In-Law", gender: "male" },
    { value: "Uncle", gender: "male" },
    { value: "Legal Heir", gender: "all" },
  ];
// useEffect(() => {
//   const currentRelation = step2Form.getValues("nomineerelation");

//   if (currentRelation) return; 

//   step2Form.setValue("nomineerelation", "");
// }, [selectedNomineeGender]);
const filteredNomineeRelations = nomineeRelationOptions.filter(
  (rel) =>
    !selectedNomineeGender ||
    rel.gender === selectedNomineeGender ||
    rel.gender === "all"
);

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Self:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="proposername2"
          >
            Proposer Name
          </label>

          <input
            id="proposername2"
            {...step2Form.register("proposername", {
              required: "Name is required",
            })}
            readOnly={true}
            placeholder="Enter Name"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>

         <input
  {...step2Form.register("proposerdob2", {
    required: "Proposer DOB required",
  })}
  readOnly={true}
  value={step2Form.watch("proposerdob2") || ""}
  placeholder="DD-MM-YYYY"
  className={inputClass}
/>
        </div>

        {planType == 2 && (
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachment Date
            </label>

            <Controller
              control={step2Form.control}
              name="proposerattachmentdate"
              rules={{
                required:
                  planType == 2 ? "Proposer Attachment Date required" : false,
              }}
              render={({ field, fieldState }) => (
                <UniversalDatePicker
                  id="proposerattachmentdate"
                  name="proposerattachmentdate"
                  value={
                    field.value
                      ? parse(field.value, "dd-MM-yyyy", new Date())
                      : null
                  }
                  onChange={(date) => {
                    if (date instanceof Date && !isNaN(date)) {
                      const formatted = format(date, "dd-MM-yyyy");
                      field.onChange(formatted);
                      handleDateChange("self", "proposerattachmentdate")(date);
                    }
                  }}
                  error={!!fieldState.error}
                  errorText={fieldState.error?.message}
                  placeholder="Select Date"
                />
              )}
            />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="proposeroccupation"
          >
            Occupation
          </label>

          <select
            id="proposeroccupation"
            {...step2Form.register("proposeroccupation", {
              required: "Please select an occupation",
            })}
            className={inputClass}
          >
            <option value="">Select Occupation</option>
            <option value="Salaried">Salaried</option>
            <option value="Self Employed">Self Employed</option>
            <option value="Unemployed">Unemployed</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height
          </label>

          <div className="flex gap-2">
            <input
              {...step2Form.register("proposerheight", {
                required: "Height (Feet) is required",
              })}
              onChange={(e) =>
                isNumber(e, step2Form.setValue, "proposerheight")
              }
              maxLength={1}
              placeholder="Feet"
              className={`${inputClass} w-1/2`}
            />

            <input
              {...step2Form.register("proposerinches", {
                required: "Height (Inches) is required",
              })}
              onChange={(e) =>
                isNumber(e, step2Form.setValue, "proposerinches")
              }
              maxLength={2}
              placeholder="Inches"
              className={`${inputClass} w-1/2`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="proposerweight"
          >
            Weight (KG)
          </label>

          <input
            id="proposerweight"
            {...step2Form.register("proposerweight", {
              required: "Weight is required",
            })}
            onChange={(e) => isNumber(e, step2Form.setValue, "proposerweight")}
            maxLength={3}
            placeholder="Enter Weight"
            className={inputClass}
          />
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800">Bank Details:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="proposarbankaccount"
          >
            Bank Account Number
          </label>

          <input
            id="proposarbankaccount"
            {...step2Form.register("proposarbankaccount", {
              required: "Bank Account is required",
            })}
            placeholder="Enter Account Number"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="proposarbankifsc"
          >
            IFSC Code
          </label>

          <input
            id="proposarbankifsc"
            {...step2Form.register("proposarbankifsc", {
              required: "Bank IFSC is required",
            })}
            placeholder="Enter IFSC Code"
            className={inputClass}
            maxLength={11}
          />
        </div>
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
          <div key={index} className="mt-6 space-y-3">
            {/* Heading */}
            <h2 className="font-semibold text-lg capitalize mb-2">
              {titleByRelation(relation)} Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>

                <input
                  {...step2Form.register(
                    isChild ? `${prefix}name${suffix}` : `${prefix}name`,
                    {
                      required: isSpouse
                        ? `${spouseKeyLabel}name is required`
                        : "Name is required",
                    },
                  )}
                  placeholder={
                    isSpouse
                      ? `Enter ${spouseLabel}'s Full Name`
                      : `Enter ${member.name}'s Full Name`
                  }
                  className={inputClass}
                />
              </div>

              {/* DOB */}
              <div className="flex flex-col gap-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>

              <input
                  {...step2Form.register(dobFieldName, {
                    required: isSpouse
                      ? `${spouseKeyLabel}dob is required`
                      : "Please select a valid date",
                  })}
                  readOnly={true}
                  value={step2Form.watch(dobFieldName) || ""}
                  placeholder="DD-MM-YYYY"
                  className={inputClass}
                />
              </div>

              {/* Attachment Date */}
              {planType == 2 && (
                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attachment Date
                  </label>

                  <Controller
                    control={step2Form.control}
                    name={
                      isChild
                        ? `${prefix}attachmentdate${suffix}`
                        : `${prefix}attachmentdate`
                    }
                    rules={{
                      required:
                        planType === 2 ? "Attachment Date is required" : false,
                    }}
                    render={({ field, fieldState }) => (
                      <UniversalDatePicker
                        id={
                          isChild
                            ? `${prefix}attachmentdate${suffix}`
                            : `${prefix}attachmentdate`
                        }
                        name={
                          isChild
                            ? `${prefix}attachmentdate${suffix}`
                            : `${prefix}attachmentdate`
                        }
                        value={
                          field.value
                            ? parse(field.value, "dd-MM-yyyy", new Date())
                            : null
                        }
                        onChange={(date) => {
                          if (date instanceof Date && !isNaN(date)) {
                            const formatted = format(date, "dd-MM-yyyy");
                            field.onChange(formatted);

                            handleDateChange(
                              `${prefix}${suffix}`,
                              isChild
                                ? `${prefix}attachmentdate${suffix}`
                                : `${prefix}attachmentdate`,
                            )(date);
                          }
                        }}
                        placeholder="Select Date"
                        error={!!fieldState.error}
                        errorText={fieldState.error?.message}
                      />
                    )}
                  />
                </div>
              )}

              {/* Relation / Occupation */}
              {(isChild || isSpouse) && (
                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isChild ? "Child Relation" : "Occupation"}
                  </label>

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
                  ) : (
                    <select
                      {...step2Form.register(`${prefix}occupation`, {
                        required: `${spouseKeyLabel}occupation is required`,
                      })}
                      className={inputClass}
                    >
                      <option value="">Select</option>
                      <option value="Salaried">Salaried</option>
                      <option value="Self Employed">Self Employed</option>
                      <option value="Unemployed">Unemployed</option>
                    </select>
                  )}
                </div>
              )}

              {/* Height */}
              <div className="flex flex-col gap-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>

                <div className="flex gap-2">
                  <input
                    {...step2Form.register(
                      isChild ? `${prefix}height${suffix}` : `${prefix}height`,
                      {
                        required: isSpouse
                          ? `${spouseKeyLabel}height is required`
                          : "Height (Feet) is required",
                      },
                    )}
                    onChange={(e) =>
                      isNumber(
                        e,
                        step2Form.setValue,
                        isChild
                          ? `${prefix}height${suffix}`
                          : `${prefix}height`,
                      )
                    }
                    maxLength={1}
                    placeholder="Feet"
                    className={`${inputClass} w-1/2`}
                  />

                  <input
                    {...step2Form.register(
                      isChild ? `${prefix}inches${suffix}` : `${prefix}inches`,
                      {
                        required: isSpouse
                          ? `${spouseKeyLabel}inches is required`
                          : "Height (Inches) is required",
                      },
                    )}
                    onChange={(e) =>
                      isNumber(
                        e,
                        step2Form.setValue,
                        isChild
                          ? `${prefix}inches${suffix}`
                          : `${prefix}inches`,
                      )
                    }
                    maxLength={2}
                    placeholder="Inches"
                    className={`${inputClass} w-1/2`}
                  />
                </div>
              </div>

              {/* Weight */}
              <div className="flex flex-col gap-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (KG)
                </label>

                <input
                  {...step2Form.register(
                    isChild ? `${prefix}weight${suffix}` : `${prefix}weight`,
                    {
                      required: isSpouse
                        ? `${spouseKeyLabel}weight is required`
                        : "Weight is required",
                    },
                  )}
                  onChange={(e) =>
                    isNumber(
                      e,
                      step2Form.setValue,
                      isChild ? `${prefix}weight${suffix}` : `${prefix}weight`,
                    )
                  }
                  maxLength={3}
                  placeholder="Enter Weight"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        );
      })}

      <h2 className="text-xl font-bold text-gray-800 mt-8">Nominee:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nominee Gender */}
        <div className="flex flex-col gap-1">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="nomineegender"
          >
            Gender
          </label>

          <select
            id="nomineegender"
            {...step2Form.register("nomineegender", {
              required: "Nominee Gender is required",
            })}
            className={inputClass}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Nominee Full Name */}
        <div className="flex flex-col gap-1">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="nomineename"
          >
            Nominee Full Name
          </label>

          <input
            id="nomineename"
            {...step2Form.register("nomineename", {
              required: "Nominee Name is required",
            })}
            placeholder="Enter Nominee Full Name"
            className={inputClass}
          />
        </div>

        {/* Nominee DOB */}
        <div className="flex flex-col gap-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>

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
                placeholder="Select DOB"
              />
            )}
          />
        </div>

        {/* Relation */}
        <div className="flex flex-col gap-1">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="nomineerelation"
          >
            Relationship with Proposer
          </label>

          <select
            id="nomineerelation"
            {...step2Form.register("nomineerelation", {
              required: "Please select the nominee relation",
            })}
            className={inputClass}
          >
            <option value="">Select Relation</option>

            {filteredNomineeRelations.map((rel) => (
              <option key={rel.value} value={rel.value}>
                {rel.value}
              </option>
            ))}
          </select>
        </div>
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
