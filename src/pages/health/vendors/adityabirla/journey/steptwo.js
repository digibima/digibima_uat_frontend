"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import UniversalDatePicker from "../../../../datepicker/index";
import { format, parse, differenceInYears } from "date-fns";
import { isNumber } from "@/styles/js/validation";
import { CallApi } from "@/api";
import constant from "@/env";
import { Controller } from "react-hook-form";
import DropdownWithSearch from "@/pages/lib/DropdownWithSearch";

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
  const { control } = step2Form;

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
  const [natureofdutydata, setNatureOfDutyData] = useState([]);
  const [occupationdata, setOccupationData] = useState([]);
  const [insureData, setInsureData] = useState([]);

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

  const handleAlphabetOnlyKeyDown = (e) => {
    if (
      !/[a-zA-Z\s]/.test(e.key) &&
      !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (isAutoFilled) return;

    const self = steponedata?.self?.[0] || {};
    const u = usersData || {};
    const getVal = (key) => self[key] || u[key] || "";

    const fieldMap = {
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

  const orderedMembers = useMemo(() => {
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

    return [...spouseMembers, ...childrenMembers, ...otherMembers];
  }, [JSON.stringify(steponedata?.members)]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAutoFilled) return;

        const res = await CallApi(
          constant.API.HEALTH.ADITYABIRLA.SAVESTEPTWO,
          "GET"
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
            new Date()
          );

          setDates((prev) => ({
            ...prev,
            self: { dob: parsedDate },
          }));
        }
        setKycData(kyc);

        const natureDuty = res?.nature_of_duty || [];
        const occupationlist = res?.occupation_list || [];

        if (natureDuty.length > 0) {
          const formattedNatureDuty = natureDuty.map((item) => ({
            label: item.Designation,
            value: item.filter_code,
          }));
          setNatureOfDutyData(formattedNatureDuty);
        }

        if (occupationlist.length > 0) {
          const formattedoccupationList = occupationlist.map((item) => ({
            label: item.vchOccupation,
            value: item.intOccupationId,
          }));
          setOccupationData(formattedoccupationList);
        }

        let propDetailsObj = {};
        try {
          const rawPropDetails =
            proposalDetails?.proposer_details ||
            savedData?.[0]?.proposer_details;
          if (typeof rawPropDetails === "string") {
            propDetailsObj = JSON.parse(rawPropDetails);
          } else if (typeof rawPropDetails === "object") {
            propDetailsObj = rawPropDetails || {};
          }
        } catch (err) {
          console.error("proposer_details parse error", err);
        }

        // ========= Bank Details Autofill Fix =========
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
          if (!step2Form.getValues("proposaraccounttype")) {
            step2Form.setValue(
              "proposaraccounttype",
              bankData.type || bankData.account_type || bankData.accounttype || "Savings"
            );
          }
        }

        // ========= Annual Income Autofill Fix =========
        const savedIncome =
          propDetailsObj?.annual_income ||
          propDetailsObj?.annualincome ||
          propDetailsObj?.monthly_income ||
          "";
        if (savedIncome && !step2Form.getValues("annualincome")) {
          step2Form.setValue("annualincome", String(savedIncome));
        }

        const selfData = savedData.find(
          (item) => item.relation?.toLowerCase() === "self"
        );

        if (selfData && !kycData) {
          if (selfData.dob) {
            const parsedDate = parse(selfData.dob, "dd-MM-yyyy", new Date());
            setDates((prev) => ({ ...prev, self: { dob: parsedDate } }));
          }
          step2Form.setValue("proposerheight", selfData.height || "");
          step2Form.setValue("proposerinches", selfData.inch || "");
          step2Form.setValue("proposerweight", selfData.weight || "");

          if (planType == 2 && selfData.attachmentdate) {
            step2Form.setValue(
              "proposerattachmentdate",
              selfData.attachmentdate
            );
          }
        }

        const savedOcc =
          propDetailsObj?.occupation || selfData?.occupation || "";
        if (savedOcc && occupationlist.length > 0) {
          const matchedOcc = occupationlist.find(
            (o) =>
              String(o.intOccupationId) === String(savedOcc) ||
              o.vchOccupation?.toLowerCase() === String(savedOcc).toLowerCase()
          );
          const occVal = matchedOcc ? matchedOcc.intOccupationId : savedOcc;
          step2Form.setValue("proposeroccupation", occVal, {
            shouldValidate: true,
          });
        }

        const savedDuty =
          propDetailsObj?.nature_of_duty || selfData?.nature_of_duty || "";
        if (savedDuty && natureDuty.length > 0) {
          const matchedDuty = natureDuty.find(
            (n) =>
              String(n.filter_code) === String(savedDuty) ||
              n.Designation?.toLowerCase() === String(savedDuty).toLowerCase()
          );
          const dutyVal = matchedDuty ? matchedDuty.filter_code : savedDuty;
          step2Form.setValue("natureofduty", dutyVal, {
            shouldValidate: true,
          });
        }

        const nomineeData = savedData.find((item) =>
          (item.relation || "").toLowerCase().includes("nominee")
        );

        if (nomineeData) {
          step2Form.setValue("nomineename", nomineeData.name || "");
          step2Form.setValue("nomineedob", nomineeData.dob || "");
          const gender = nomineeData.gender?.toLowerCase() || "";
          step2Form.setValue("nomineegender", gender);

          if (nomineeData.appointee_name) {
            step2Form.setValue("appointeename", nomineeData.appointee_name);
          }
          if (nomineeData.appointee_relation) {
            step2Form.setValue(
              "appointeerelation",
              nomineeData.appointee_relation
            );
          }

          // ========= Appointee DOB Autofill Fix =========
          const appDob = nomineeData.appointee_dob || nomineeData.appointeedob;
          if (appDob) {
            step2Form.setValue("appointeedob", appDob);
            const parsedAppDate = parse(appDob, "dd-MM-yyyy", new Date());
            if (!isNaN(parsedAppDate)) {
              setDates((prev) => ({ ...prev, appointee: { dob: parsedAppDate } }));
            }
          }

          if (nomineeData.dob) {
            const parsedDate = parse(
              nomineeData.dob,
              "dd-MM-yyyy",
              new Date()
            );
            setDates((prev) => ({ ...prev, nominee: { dob: parsedDate } }));
          }

          const cleanRelation = nomineeData.relation
            ?.toLowerCase()
            .replace("(nominee)", "")
            .trim();

          const capitalizedRelation =
            cleanRelation.charAt(0).toUpperCase() + cleanRelation.slice(1);

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

  useEffect(() => {
    if (!apiMembers || !apiMembers.length) return;

    let childCounter = 1;
    const relationCounters = {};

    orderedMembers.forEach((member) => {
      const relation = normalizeRelation(member?.name);
      if (!relation || relation === "self" || relation.includes("nominee"))
        return;

      const isChild = isChildRel(relation);
      const prefix = getPrefixByRelation(relation);
      const suffix = isChild ? String(childCounter++) : "";

      relationCounters[relation] = (relationCounters[relation] || 0) + 1;
      const currentMatchOccurrence = relationCounters[relation];

      let matchIndex = 0;
      const apiMember = apiMembers.find((api) => {
        const apiRel = normalizeRelation(api?.relation);
        if (
          apiRel === relation ||
          (isChild &&
            (apiRel.includes("child") ||
              apiRel === "son" ||
              apiRel === "daughter"))
        ) {
          matchIndex += 1;
          return matchIndex === currentMatchOccurrence;
        }
        return false;
      });

      const dobField = suffix ? `${prefix}dob${suffix}` : `${prefix}dob`;
      const relationField = `${prefix}relation${suffix}`;
      const attachField = suffix
        ? `${prefix}attachmentdate${suffix}`
        : `${prefix}attachmentdate`;

      step2Form.setValue(`${prefix}name${suffix}`, apiMember?.name || "");
      step2Form.setValue(`${prefix}height${suffix}`, apiMember?.height || "");
      step2Form.setValue(`${prefix}inches${suffix}`, apiMember?.inch || "");
      step2Form.setValue(`${prefix}weight${suffix}`, apiMember?.weight || "");

      // ========= Member Occupation & Nature of Duty Autofill Fix =========
      if (!isChild) {
        const mOcc =
          apiMember?.occupation ||
          apiMember?.proposer_details?.occupation ||
          "";
        if (mOcc && occupationdata.length > 0) {
          const matchedOcc = occupationdata.find(
            (o) =>
              String(o.value) === String(mOcc) ||
              o.label?.toLowerCase() === String(mOcc).toLowerCase()
          );
          step2Form.setValue(
            `${prefix}occupation${suffix}`,
            matchedOcc ? matchedOcc.value : mOcc
          );
        }

        const mDuty =
          apiMember?.nature_of_duty ||
          apiMember?.proposer_details?.nature_of_duty ||
          "";
        if (mDuty && natureofdutydata.length > 0) {
          const matchedDuty = natureofdutydata.find(
            (n) =>
              String(n.value) === String(mDuty) ||
              n.label?.toLowerCase() === String(mDuty).toLowerCase()
          );
          step2Form.setValue(
            `${prefix}natureofduty${suffix}`,
            matchedDuty ? matchedDuty.value : mDuty
          );
        }
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
  }, [
    apiMembers,
    JSON.stringify(steponedata?.members),
    planType,
    step2Form,
    occupationdata,
    natureofdutydata,
  ]);

  useEffect(() => {
    const sub = step2Form.watch((vals, { name }) => {
      if (name && vals?.[name]) step2Form.clearErrors(name);
    });
    return () => sub?.unsubscribe?.();
  }, [step2Form]);

  let childCounterForRender = 1;
  const selectedNomineeGender = step2Form.watch("nomineegender");
  const nomineeDobValue = step2Form.watch("nomineedob");

  const isNomineeMinor = useMemo(() => {
    if (!nomineeDobValue) return false;
    try {
      const parsedDate = parse(nomineeDobValue, "dd-MM-yyyy", new Date());
      if (isNaN(parsedDate)) return false;
      return differenceInYears(new Date(), parsedDate) < 18;
    } catch (e) {
      return false;
    }
  }, [nomineeDobValue]);

  useEffect(() => {
    if (!isNomineeMinor) {
      step2Form.setValue("appointeename", "");
      step2Form.setValue("appointeedob", "");
      step2Form.setValue("appointeerelation", "");

      step2Form.clearErrors([
        "appointeename",
        "appointeedob",
        "appointeerelation",
      ]);

      step2Form.unregister("appointeename");
      step2Form.unregister("appointeedob");
      step2Form.unregister("appointeerelation");
    }
  }, [isNomineeMinor, step2Form]);

  const nomineeRelationOptions = React.useMemo(
    () => [
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
    ],
    []
  );

  useEffect(() => {
    const currentRelation = step2Form.getValues("nomineerelation");
    if (!currentRelation) return;

    const isValid = nomineeRelationOptions.some(
      (rel) =>
        rel.value === currentRelation &&
        (rel.gender === selectedNomineeGender || rel.gender === "all")
    );

    if (!isValid) {
      step2Form.setValue("nomineerelation", "");
    }
  }, [selectedNomineeGender, step2Form, nomineeRelationOptions]);

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
            className={`${inputClass} cursor-not-allowed`}
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
                      handleDateChange(
                        "self",
                        "proposerattachmentdate"
                      )(date);
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Occupation
          </label>
          <Controller
            name="proposeroccupation"
            control={control}
            rules={{ required: "Please select an Occupation" }}
            render={({ field, fieldState: { error } }) => (
              <>
                <DropdownWithSearch
                  id="proposeroccupation"
                  name="proposeroccupation"
                  options={occupationdata}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select Occupation"
                  className="inputcls"
                  allowOnlyAlphabets={true}
                  onKeyDown={handleAlphabetOnlyKeyDown}
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error.message}</p>
                )}
              </>
            )}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nature of Duty
          </label>
          <Controller
            name="natureofduty"
            control={control}
            rules={{ required: "Please select an Nature of Duty" }}
            render={({ field, fieldState: { error } }) => (
              <>
                <DropdownWithSearch
                  id="natureofduty"
                  name="natureofduty"
                  options={natureofdutydata}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select Nature of Duty"
                  className="inputcls"
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error.message}</p>
                )}
              </>
            )}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="annualincome"
          >
            Annual Income
          </label>
          <input
            id="annualincome"
            {...step2Form.register("annualincome", {
              required: "Annual Income is required",
            })}
            onChange={(e) =>
              isNumber(e, step2Form.setValue, "annualincome")
            }
            maxLength={8}
            placeholder="Enter Annual Income"
            className={inputClass}
          />
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
            onChange={(e) =>
              isNumber(e, step2Form.setValue, "proposerweight")
            }
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
            maxLength={20}
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
            }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="proposaraccounttype"
          >
            Account Type
          </label>
          <select
            id="proposaraccounttype"
            {...step2Form.register("proposaraccounttype", {
              required: "Account Type is required",
            })}
            className={inputClass}
          >
            <option value="">Select Account Type</option>
            <option value="Savings">Savings Account</option>
            <option value="Current">Current Account</option>
            <option value="NRE">NRE Account</option>
            <option value="NRO">NRO Account</option>
          </select>
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
        const dobFieldName = isChild
          ? `${prefix}dob${suffix}`
          : `${prefix}dob`;

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
            <h2 className="font-semibold text-lg capitalize mb-2">
              {titleByRelation(relation)} Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    }
                  )}
                  placeholder={
                    isSpouse
                      ? `Enter ${spouseLabel}'s Full Name`
                      : `Enter ${member.name}'s Full Name`
                  }
                  className={inputClass}
                />
              </div>

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
                  className={`${inputClass} cursor-not-allowed`}
                />
              </div>

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
                                : `${prefix}attachmentdate`
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

              {!isChild && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupation
                    </label>
                    <Controller
                      name={`${prefix}occupation`}
                      control={control}
                      rules={{ required: "Please select an Occupation" }}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <DropdownWithSearch
                            id={`${prefix}occupation`}
                            name={`${prefix}occupation`}
                            options={occupationdata}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select Occupation"
                            className="inputcls"
                            allowOnlyAlphabets={true}
                            onKeyDown={handleAlphabetOnlyKeyDown}
                          />
                          {error && (
                            <p className="text-red-500 text-sm mt-1">
                              {error.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nature of Duty
                    </label>
                    <Controller
                      name={`${prefix}natureofduty`}
                      control={control}
                      rules={{ required: "Please select Nature of Duty" }}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <DropdownWithSearch
                            id={`${prefix}natureofduty`}
                            name={`${prefix}natureofduty`}
                            options={natureofdutydata}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select Nature of Duty"
                            className="inputcls"
                          />
                          {error && (
                            <p className="text-red-500 text-sm mt-1">
                              {error.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>
                </>
              )}

              {isChild && (
                <input
                  type="hidden"
                  value={relation}
                  {...step2Form.register(`${prefix}relation${suffix}`)}
                />
              )}

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
                      }
                    )}
                    onChange={(e) =>
                      isNumber(
                        e,
                        step2Form.setValue,
                        isChild
                          ? `${prefix}height${suffix}`
                          : `${prefix}height`
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
                      }
                    )}
                    onChange={(e) =>
                      isNumber(
                        e,
                        step2Form.setValue,
                        isChild
                          ? `${prefix}inches${suffix}`
                          : `${prefix}inches`
                      )
                    }
                    maxLength={2}
                    placeholder="Inches"
                    className={`${inputClass} w-1/2`}
                  />
                </div>
              </div>

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

      {isNomineeMinor && (
        <>
          <h2 className="text-xl font-bold text-gray-800 mt-8">
            Appointee Details:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="appointeename"
              >
                Appointee Full Name
              </label>
              <input
                id="appointeename"
                {...step2Form.register("appointeename", {
                  required: isNomineeMinor
                    ? "Appointee Name is required"
                    : false,
                })}
                placeholder="Enter Appointee Full Name"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointee Date of Birth
              </label>
              <Controller
                control={step2Form.control}
                name="appointeedob"
                rules={{
                  required: isNomineeMinor
                    ? "Appointee DOB is required"
                    : false,
                }}
                render={({ field, fieldState }) => (
                  <UniversalDatePicker
                    id="appointeedob"
                    name="appointeedob"
                    value={
                      field.value
                        ? parse(field.value, "dd-MM-yyyy", new Date())
                        : null
                    }
                    onChange={(date) => {
                      if (date instanceof Date && !isNaN(date)) {
                        const formatted = format(date, "dd-MM-yyyy");
                        field.onChange(formatted);
                        handleDateChange("appointee", "appointeedob")(date);
                      }
                    }}
                    error={!!fieldState.error}
                    errorText={fieldState.error?.message}
                    placeholder="Select Date of Birth"
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="appointeerelation"
              >
                Relationship with Nominee
              </label>
              <select
                id="appointeerelation"
                {...step2Form.register("appointeerelation", {
                  required: isNomineeMinor
                    ? "Please select Appointee relation"
                    : false,
                })}
                className={inputClass}
              >
                <option value="">Relation</option>
                <option value="Spouse">Spouse</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
              </select>
            </div>
          </div>
        </>
      )}

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