"use client";
import React from "react";
import constant from "@/env";
import questionCode from "@/context/carepedcode"
 const CARE_GROUP_MAP = {
    1: [11, 12],
    2: [21, 22, 23, 24, 25, 26, 27, 28],
    3: [31],
    4: [41, 42, 43, 44, 45, 46, 47, 48],
    5: [51, 52, 53],
    6: [61, 62],
    7: [71, 72, 73, 74, 75, 76, 77, 78],
    8: [81, 82, 83, 84, 85],
    9: [91, 92, 93, 94, 95, 96],
    10: [101, 102, 103, 104],
    11: [111, 112, 113, 114, 115],
    12: [121, 122, 123, 124],
    13: [131, 132, 133, 134],
    14: [141, 142],
    15: [151],
    16: [161],
    17: [171],
    18: [181, 182, 183],
    19: [191],
    20: [201],
    21: [211],
    22: [221],
    23: [231],
    24: [241],
    25: [251],
    26: [261],
  };

export default function StepThreeFormPort({
  step3Form,
  onSubmitStep,
  steptwodata,
  inputClass,
}) {
  const CARE = questionCode?.CAREPORT || {};
  const groupedCARE = {
    1: "Does any person(s) to be insured have any pre-existing diseases or is on any medication?",
    2: "High cholesterol/Hyperlipidemia or Cardiovascular or Heart Disease or undergone heart treatment?",
    3: "Hypertension / High Blood Pressure?",
    4: "Respiratory Disorder (Asthma/COPD/Bronchitis/lung disease, etc.)?",
    5: "Thyroid Disorders?",
    6: "Diabetes (High Blood Sugar)?",
    7: "Disease of the Brain / Neurological Disorder / Spinal Disease?",
    8: "Mental Illness (Psychiatric Disorder)?",
    9: "Pancreatitis or Liver disease?",
    10: "Kidney / Urinary track / Reproductive Organ Disease?",
    11: "Blood Disorder?",
    12: "Autoimmune Disorder?",
    13: "Sexually Transmitted Disease (STDs)?",
    14: "Obesity/High BMI, Any disease/health adversity/injury/condition/treatment not mentioned above?",
    15: "Have you had any adverse finding to any diagnostic test or procedures, have symptoms or complaints needing doctors consultation, been advised or had been hospitalized for more than 5 days in total, or undergone any surgery in the last 12 months? If yes, please provide details in the additional information section below?",
    16: "Have you consulted a doctor or a health professional four or more times during the last six months or have any follow-up in the upcoming year? (This excludes visits for common cold, cough, flu, acute respiratory tract infection or pregnancy )?",
    17: "Do you smoke, consume alcohol, or chew tobacco, ghutka or paan?",
    18: "Alcohol?",
    19: "Chewing Tobacco/Gutka/Pan Masala/Mawa etc?",
    20: "Smoking (Bidi/Cigarrete/Cigar/E-Cigarrete etc.)?",
    21: "Recreational Drugs?",
    22: "Has any of the person(s) to be insured ever filed a claim with their current / previous insurer?",
    23: "Has any proposal(s) for health insurance of the new person(s) to be insured, been declined cancelled or charged a higher premium?",
    24: "Is any of the person(s) proposed for insurance covered under any other health insurance policy with the Care Health Insurance?",
    25: "Does any of the insured members fall in the category of Politically Exposed Persons (PEPs)?",
    26: "Does any member fall under the category of Diffrently Abled Persons?",
  };
 

  const getEntriesByGroup = (groupId) => {
    const keys = CARE_GROUP_MAP[groupId] || [];

    return keys
      .map((k) => [k, CARE[k]])
      .filter(([k]) => CARE[k]) 
      .sort(([a], [b]) => Number(a) - Number(b));
  };

 const members = React.useMemo(() => {
  return steptwodata?.member || steptwodata?.members || [];
}, [steptwodata]);


  const medMasterName = "port_medical_master";
  const insMasterName = "port_insurance_master";

  const medMasterOn = step3Form.watch(medMasterName);
  const insMasterOn = step3Form.watch(insMasterName);
  // const values = step3Form.watch();

  const allValues = step3Form.watch();

    const { getValues, setValue } = step3Form;

    React.useEffect(() => {
      Object.keys(CARE_GROUP_MAP).forEach((groupId) => {
        const masterName = `port_group${groupId}_master`;
        const isOn = getValues(masterName);

        if (!isOn) {
          const keys = CARE_GROUP_MAP[groupId] || [];

          members.forEach((_, i) => {
            keys.forEach((key) => {
              setValue(`${key}main${i + 1}`, false);
            });
          });
        }
      });
    }, [members, getValues, setValue]);
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">
        Port Risk & Declarations
      </h2>

      {Object.keys(groupedCARE).map((groupId) => {
        const entries = getEntriesByGroup(groupId);
        if (!entries.length) return null;
        const isSingle = entries.length === 1;

        let masterName = isSingle ? null : `port_group${groupId}_master`;
        let togglePrefix = `port_group${groupId}_toggle_`;
        const id = Number(groupId);

        const masterOn = isSingle
          ? true
          : masterName
            ? step3Form.watch(masterName)
            : true;
        return (
          <div key={groupId} className="space-y-6">
            {masterName && !isSingle && (
              <div className="flex items-center justify-between">
                <label className="text-md text-gray-700">
                  {`${groupId}. ${groupedCARE[groupId]}`}
                </label>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...step3Form.register(masterName)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600"></div>
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-full"></div>
                </label>
              </div>
            )}

            {/* SUB QUESTIONS */}
            {masterOn &&
              entries.map(([key, question], idx) => {
               const keyStr = String(key);
const meta = questionCode?.CAREPORT?.META?.[keyStr] || {};
                // console.log("KEY:", key, "META:", meta);
                const fields = meta?.fields || {};
                const hasExisting = !!fields.date;
                const hasFurther = !!fields.further;
                const hasMalignancy = !!fields.malignancy;
                const hasSmoke = !!fields.smoke;
                const hasInsulin = !!fields.insulin;
                const hasObesity = !!fields.obesity;
                const hasDrugs = !!fields.drugs;
                const hasSpecify = !!fields.specify;
                const hasMedicine = !!fields.medicine;
                const hasDisability = !!fields.impairmentType;
                const hasAlcohol = !!fields.frequency;
                const hasUnit = !!fields.unit;
                const hasQuantity = !!fields.quantity || !!fields.volume;
                const toggleName = `${togglePrefix}${key}`;
                const isOn = step3Form.watch(toggleName);
                const groupValues = step3Form.watch(
                  members.map((_, i) => `${key}main${i + 1}`),
                );
                const memberSelected = groupValues?.some(Boolean);

                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        className={
                          isSingle
                            ? "text-md text-gray-700"
                            : "text-sm text-gray-600 pl-2"
                        }
                      >
                        {isSingle
                          ? `${groupId}. ${question}`
                          : `${groupId}.${idx + 1} ${question}`}
                      </label>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          {...step3Form.register(toggleName)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600"></div>
                        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-full"></div>
                      </label>
                    </div>

                    {/* MEMBER UI SAME */}
                    {(isOn || memberSelected) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {members.map((m, i) => {
                          const base = `${key}main${i + 1}`;
                          const memCheck = base;
                          const dateName = `${base}date`;
                          const qtyName = `${base}qty`;

                          return (
                            <div
                              key={i}
                              className="flex flex-col border rounded-lg p-3 gap-2"
                            >
                              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                <input
                                  type="checkbox"
                                  {...step3Form.register(memCheck)}
                                  className="cursor-pointer"
                                />
                                {(
                                  m?.name?.split(" ")[0] || "MEMBER"
                                ).toUpperCase()}
                              </label>

                              {step3Form.watch(memCheck) && (
                                <>
                                  {/* Existing Since */}
                                  {hasExisting && (
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      maxLength={7}
                                      onInput={(e) => {
                                        e.target.value = e.target.value
                                          .replace(/[^\d]/g, "")
                                          .replace(
                                            /^(\d{2})(\d{1,4})?$/,
                                            (_, mm, yyyy) =>
                                              yyyy ? `${mm}/${yyyy}` : mm,
                                          );
                                      }}
                                      {...step3Form.register(`${base}date`, {
                                        validate: (val) => {
                                          if (!val) return true;
                                          if (!/^\d{2}\/\d{4}$/.test(val))
                                            return "Invalid format";
                                          const [mm] = val.split("/");
                                          if (mm < 1 || mm > 12)
                                            return "Invalid month";
                                          return true;
                                        },
                                      })}
                                      placeholder="MM/YYYY"
                                      className="border px-2 py-1 rounded-md text-sm"
                                    />
                                  )}
                                  {hasMalignancy && (
                                    <div className="flex flex-col gap-1 text-sm">
                                      <label className="font-medium">
                                        Was Malignancy detected?
                                      </label>

                                      <div className="flex gap-4">
                                        <label className="flex items-center gap-1 cursor-pointer">
                                          <input
                                            type="radio"
                                            value="yes"
                                            {...step3Form.register(
                                              `${base}malignancy`,
                                            )}
                                            className="cursor-pointer"
                                          />
                                          Yes
                                        </label>

                                        <label className="flex items-center gap-1 cursor-pointer">
                                          <input
                                            type="radio"
                                            value="no"
                                            {...step3Form.register(
                                              `${base}malignancy`,
                                            )}
                                             className="cursor-pointer"
                                          />
                                          No
                                        </label>
                                      </div>
                                    </div>
                                  )}
                                  {hasSmoke && (
                                    <div className="flex flex-col gap-1 text-sm">
                                      <label className="font-medium">
                                        smoke, consume alcohol, or chew tobacco,
                                        ghutka or paan?
                                      </label>

                                      <div className="flex gap-4">
                                        <label className="flex items-center gap-1 cursor-pointer">
                                          <input
                                            type="radio"
                                            value="yes"
                                            {...step3Form.register(
                                              `${base}smoke`,
                                            )}
                                             className="cursor-pointer"
                                          />
                                          Yes
                                        </label>

                                        <label className="flex items-center gap-1 cursor-pointer">
                                          <input
                                            type="radio"
                                            value="no"
                                            {...step3Form.register(
                                              `${base}smoke`,
                                            )}
                                             className="cursor-pointer"
                                          />
                                          No
                                        </label>
                                      </div>
                                    </div>
                                  )}

                                  {/* Further */}
                                  {hasFurther && (
                                    <input
                                      type="text"
                                      {...step3Form.register(`${base}further`)}
                                      placeholder="Enter Details"
                                      className="border px-2 py-1 rounded-md text-sm"
                                    />
                                  )}

                                  {/* Specify */}
                                  {hasSpecify && (
                                    <textarea
                                      {...step3Form.register(`${base}specify`)}
                                      placeholder="Please Specify"
                                      className="border px-2 py-1 rounded-md text-sm"
                                    />
                                  )}

                                  {/* Insulin */}
                                  {hasInsulin && (
                                    <div className="flex flex-col gap-1 text-sm">
                                      <label className="font-medium">
                                        Have you taken insulin?
                                      </label>

                                      <div className="flex gap-4">
                                        <label className="flex items-center gap-1 cursor-pointer">
                                          <input
                                            type="radio"
                                            value="yes"
                                            {...step3Form.register(
                                              `${base}insulin`,
                                            )}
                                             className="cursor-pointer"
                                          />
                                          Yes
                                        </label>

                                        <label className="flex items-center gap-1 cursor-pointer">
                                          <input
                                            type="radio"
                                            value="no"
                                            {...step3Form.register(
                                              `${base}insulin`,
                                            )}
                                             className="cursor-pointer"
                                          />
                                          No
                                        </label>
                                      </div>
                                    </div>
                                  )}

                                  {/* Obesity */}
                                  {hasObesity && (
                                    <div className="flex flex-col gap-1 text-sm">
                                      <label className="font-medium">
                                        Have you taken Obesity?
                                      </label>

                                      <div className="flex gap-4">
                                        <label className="flex items-center gap-1 cursor-pointer">
                                          <input
                                            type="radio"
                                            value="yes"
                                            {...step3Form.register(
                                              `${base}obesity`,
                                            )}
                                             className="cursor-pointer"
                                          />
                                          Yes
                                        </label>

                                        <label className="flex items-center gap-1 cursor-pointer">
                                          <input
                                            type="radio"
                                            value="no"
                                            {...step3Form.register(
                                              `${base}obesity`,
                                            )}
                                             className="cursor-pointer"
                                          />
                                          No
                                        </label>
                                      </div>
                                    </div>
                                  )}

                                  {/* Drugs */}
                                  {hasDrugs && (
                                    <div className="flex flex-col gap-1 text-sm">
                                      <label className="font-medium">
                                        Do you use recreational drugs?
                                      </label>

                                      <div className="flex gap-4">
                                        <label className="flex items-center gap-1 cursor-pointer">
                                          <input
                                            type="radio"
                                            value="yes"
                                            {...step3Form.register(
                                              `${base}drugs`,
                                            )}
                                             className="cursor-pointer"
                                          />
                                          Yes
                                        </label>

                                        <label className="flex items-center gap-1 cursor-pointer">
                                          <input
                                            type="radio"
                                            value="no"
                                            {...step3Form.register(
                                              `${base}drugs`,
                                            )}
                                             className="cursor-pointer"
                                          />
                                          No
                                        </label>
                                      </div>
                                    </div>
                                  )}

                                  {/* Medicine */}
                                  {hasMedicine && (
                                    <input
                                      type="text"
                                      {...step3Form.register(`${base}medicine`)}
                                      placeholder="Medicine"
                                      className="border px-2 py-1 rounded-md text-sm"
                                    />
                                  )}

                                  {/* Disability */}
                                  {hasDisability && (
                                    <>
                                      <input
                                        {...step3Form.register(
                                          `${base}impairmentType`,
                                        )}
                                         className="border px-2 py-1 rounded-md text-sm"
                                        placeholder="Type"
                                      />
                                      <input
                                        {...step3Form.register(
                                          `${base}impairmentPercent`,
                                        )}
                                         className="border px-2 py-1 rounded-md text-sm"
                                        placeholder="%"
                                      />
                                      <input
                                        {...step3Form.register(`${base}udid`)}
                                         className="border px-2 py-1 rounded-md text-sm"
                                        placeholder="UDID"
                                      />
                                    </>
                                  )}

                                  {/* Alcohol */}
                                  {hasAlcohol && (
                                    <>
                                      <select
                                        {...step3Form.register(
                                          `${base}frequency`,
                                        )}
                                         className="border px-2 py-1 rounded-md text-sm"
                                      >
                                        <option value="">Frequency</option>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                      </select>

                                      {hasUnit && (
                                        <input
                                          {...step3Form.register(`${base}unit`)}
                                          placeholder="Unit"
                                           className="border px-2 py-1 rounded-md text-sm"
                                        />
                                      )}

                                      {hasQuantity && (
                                        <input
                                          {...step3Form.register(
                                            `${base}quantity`,
                                          )}
                                           className="border px-2 py-1 rounded-md text-sm"
                                          placeholder="Quantity"
                                        />
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        );
      })}

      <div className="space-y-2 text-sm text-gray-700">
        <label className="flex gap-2 items-start">
          <input
            type="checkbox"
            {...step3Form.register("agreeTnC", { required: true })}
            className="cursor-pointer accent-pink-500 h-4 w-4"
          />
          <span>
            I hereby agree to the{" "}
            <a className="text-blue-600 underline">Terms & Conditions</a>.
          </span>
        </label>
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
