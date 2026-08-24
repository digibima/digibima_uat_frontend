"use client";
import React from "react";
import constant from "@/env";

export default function StepThreeForm({
  step3Form,
  onSubmitStep,
  steptwodata,
  inputClass,
  planType
}) {
  
  const rawMembers = (steptwodata?.members || []).filter(
    (m) => m.name?.toLowerCase() !== "self"
  );

  const parentsAndGrandparents = [
    "father",
    "mother",
    "grandfather",
    "grandmother",
    "fatherinlaw",
    "motherinlaw",
  ];
  const children = ["son", "daughter"];

  const members = [
    ...rawMembers.filter((m) => m.name?.toLowerCase() === "wife"),
    ...rawMembers.filter((m) =>
      parentsAndGrandparents.includes(m.name?.toLowerCase())
    ),
    ...rawMembers.filter((m) => children.includes(m.name?.toLowerCase())),
    ...rawMembers.filter((m) => {
      const name = m.name?.toLowerCase();
      return (
        name !== "wife" &&
        !parentsAndGrandparents.includes(name) &&
        !children.includes(name)
      );
    }),
  ];

  const medicalonetoggleillness = [
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
  ];

  const medicalonetoggletwoillness = [
    "insurer",
    "premium",
    "insurance",
    "diagnosed",
  ];
  // const lifestyletoggletwoillness=['insurer','premium','insurance','diagnosed'];
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6 w-full">
  <h2 className="text-xl font-bold text-gray-800">
    Help us know the medical condition, if any
  </h2>

  {/* Medical History */}
  <div className="space-y-6">
    <div>
      <h3 className="font-semibold text-gray-700 mb-2">Medical History:</h3>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-sm font-medium flex-1 min-w-[200px]">
          1. Does any person(s) to be insured currently or in past
          Diagnosed/Suffered/ Treated/Taken Medication for any medical
          condition?
        </label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            {...step3Form.register("medicalonetoggle")}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-all duration-300"></div>
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md peer-checked:translate-x-full transition-transform duration-300"></div>
        </label>
      </div>

      {step3Form.watch("medicalonetoggle") && (
        <div className="space-y-3 mt-4">
          {Object.entries(constant.QUESTION.CAREDISEASE)
            .filter(([key]) => key.startsWith("1") && key.length <= 3)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([key, question], index) => {
              const number = `1.${index + 1}`;
              const illnessKey =
                medicalonetoggleillness[index] || `unknown_${index}`;
              const questionKey = `medical_1.${index + 1}`;
              const isChecked = step3Form.watch(illnessKey);

              return (
                <div key={key} className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="text-sm font-medium flex-1 min-w-[200px]">{`${number} ${question}`}</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...step3Form.register(illnessKey)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-all duration-300"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md peer-checked:translate-x-full transition-transform duration-300"></div>
                    </label>
                  </div>

                  {isChecked && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {steptwodata?.member?.map((m, memberIndex) => {
                        const memberKey = `${questionKey}_member_${m.id}`;
                        return (
                          <div
                            key={m.id}
                            className="flex flex-col border cursor-pointer rounded-lg p-3 gap-2"
                          >
                            <label className="flex items-center gap-2 text-sm font-medium">
                              <input
                                type="checkbox"
                                {...step3Form.register(
                                  `${illnessKey}main${memberIndex + 1}`
                                )}
                                className="cursor-pointer accent-pink-500 h-4 w-4"
                                data-id={`${index + 1}`}
                                srno="1"
                                user-id={m.id}
                              />
                              {m.name?.split(" ")[0].toUpperCase()}
                            </label>

                            {step3Form.watch(
                              `${illnessKey}main${memberIndex + 1}`
                            ) && (
                              <>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={7}
                                  placeholder="MM/YYYY"
                                  {...step3Form.register(
                                    `${illnessKey}main${memberIndex + 1}date`
                                  )}
                                  onInput={(e) => {
                                    e.target.value = e.target.value
                                      .replace(/[^\d]/g, "")
                                      .replace(
                                        /^(\d{2})(\d{1,4})?$/,
                                        (_, mm, yyyy) =>
                                          yyyy ? `${mm}/${yyyy}` : mm
                                      );
                                  }}
                                  className="border px-2 py-1 rounded-md text-sm"
                                />

                                {key === "113" && (
                                  <textarea
                                    placeholder="Enter description"
                                    rows={2}
                                    className="border px-2 py-1 rounded-md text-sm"
                                    {...step3Form.register(
                                      `${illnessKey}main${memberIndex + 1}desc`
                                    )}
                                  />
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
      )}
    </div>

    {/* Previous/Existing Insurance */}
    <div>
      <h3 className="font-semibold text-gray-700 mb-2">
        Previous/Existing Insurance:
      </h3>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-sm font-medium flex-1 min-w-[200px]">
          2. Details of previous or existing health insurance?
        </label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            {...step3Form.register("medicalonetoggletwo")}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-all duration-300"></div>
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md peer-checked:translate-x-full transition-transform duration-300"></div>
        </label>
      </div>

      {step3Form.watch("medicalonetoggletwo") && (
        <div className="space-y-3 mt-4">
          {Object.entries(constant.QUESTION.CAREDISEASE)
            .filter(([key]) => parseInt(key) >= 21 && parseInt(key) <= 25)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([key, question], index) => {
              const number = `2.${index + 1}`;
              const illnessKey =
                medicalonetoggletwoillness[index] || `unknown_${index}`;
              const isChecked = step3Form.watch(illnessKey);

              return (
                <div key={key} className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="text-sm font-medium flex-1 min-w-[200px]">{`${number} ${question}`}</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...step3Form.register(illnessKey)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-all duration-300"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md peer-checked:translate-x-full transition-transform duration-300"></div>
                    </label>
                  </div>

                  {isChecked && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {steptwodata?.member?.map((m, memberIndex) => {
                        const memberCheckboxKey = `${illnessKey}main${
                          memberIndex + 1
                        }`;
                        const memberInputKey = `${memberCheckboxKey}date`;

                        return (
                          <div
                            key={m.id}
                            className="flex flex-col cursor-pointer border rounded-lg p-3 gap-2"
                          >
                            <label className="flex items-center gap-2 text-sm font-medium">
                              <input
                                type="checkbox"
                                {...step3Form.register(memberCheckboxKey)}
                                className="cursor-pointer accent-pink-500 h-4 w-4"
                                data-id={`${index + 1}`}
                                srno="2"
                                user-id={m.id}
                              />
                              {m.name?.split(" ")[0].toUpperCase()}
                            </label>

                            {step3Form.watch(memberCheckboxKey) && (
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={7}
                                placeholder="MM/YYYY"
                                {...step3Form.register(memberInputKey)}
                                onInput={(e) => {
                                  e.target.value = e.target.value
                                    .replace(/[^\d]/g, "")
                                    .replace(
                                      /^(\d{2})(\d{1,4})?$/,
                                      (_, mm, yyyy) =>
                                        yyyy ? `${mm}/${yyyy}` : mm
                                    );
                                }}
                                className="border px-2 py-1 rounded-md text-sm"
                              />
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
      )}
    </div>
  </div>

  {/* Lifestyle History */}
  <div>
    <h3 className="font-semibold text-gray-700 mb-2">Lifestyle History:</h3>

    <div className="space-y-3 mt-2">
      {Object.entries(constant.QUESTION.LIFESTYLE)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([key, question], index) => {
          const number = `3.${index + 1}`;
          const lifestyleKey = "cigarettes";
          const isChecked = step3Form.watch("lifestyletoggletwo");

          return (
            <div key={key} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-sm font-medium flex-1 min-w-[200px]">{`${number} ${question}`}</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...step3Form.register("lifestyletoggletwo")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-all duration-300"></div>
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md peer-checked:translate-x-full transition-transform duration-300"></div>
                </label>
              </div>

              {isChecked && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {steptwodata?.member?.map((m, memberIndex) => {
                    const checkboxName = `${lifestyleKey}main${
                      memberIndex + 1
                    }`;
                    const dateName = `${checkboxName}date`;

                    return (
                      <div
                        key={m.id}
                        className="flex flex-col border rounded-lg p-3 gap-2"
                      >
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <input
                            type="checkbox"
                            {...step3Form.register(checkboxName)}
                            className="cursor-pointer accent-pink-500 h-4 w-4"
                            data-id={`${index + 1}`}
                            srno="3"
                            user-id={m.id}
                          />
                          {m.name?.split(" ")[0].toUpperCase()}
                        </label>

                        {step3Form.watch(checkboxName) && (
                          <>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={3}
                              placeholder="Daily Packets / 30ml pegs"
                              {...step3Form.register(
                                `${checkboxName}qty`
                              )}
                              onInput={(e) => {
                                e.target.value = e.target.value.replace(
                                  /[^\d]/g,
                                  ""
                                );
                              }}
                              className="border px-2 py-1 rounded-md text-sm"
                            />

                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={7}
                              placeholder="MM/YYYY"
                              {...step3Form.register(dateName)}
                              onInput={(e) => {
                                e.target.value = e.target.value
                                  .replace(/[^\d]/g, "")
                                  .replace(
                                    /^(\d{2})(\d{1,4})?$/,
                                    (_, mm, yyyy) =>
                                      yyyy ? `${mm}/${yyyy}` : mm
                                  );
                              }}
                              className="border px-2 py-1 rounded-md text-sm"
                            />
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
  </div>

  {/* Agreement Checkboxes */}
  <div className="space-y-2 text-sm text-gray-700">
    <label className="flex gap-2 items-start">
      <input
        type="checkbox"
        {...step3Form.register("agreeTnC", { required: true })}
        className="cursor-pointer accent-pink-500 h-4 w-4"
      />
      <span>
        I hereby agree to the{" "}
        <a className="text-blue-600 underline">Terms & Conditions</a> of the
        purchase of this policy. *
      </span>
    </label>

    {/* <label className="flex gap-2 items-start">
      <input
        type="checkbox"
        {...step3Form.register("standingInstruction")}
        className="cursor-pointer accent-pink-500 h-4 w-4"
      />
      <span>
        I would also like to add Standing Instruction on my credit card for
        automatic future renewal premiums.
      </span>
    </label>

    <label className="flex gap-2 items-start">
      <input
        type="checkbox"
        {...step3Form.register("optForEMI")}
        className="cursor-pointer accent-pink-500 h-4 w-4"
      />
      <span>
        I would like to opt for the EMI (Equated Monthly Installment) option
        for payment of premiums.
      </span>
    </label>

    <label className="flex gap-2 items-start">
      <input
        type="checkbox"
        {...step3Form.register("autoDebitBank")}
        className="cursor-pointer accent-pink-500 h-4 w-4"
      />
      <span>
        I authorize the auto-debit of premiums from my bank account for
        automatic payment.
      </span>
    </label> */}
  </div>

  <button
    type="button"
    onClick={onSubmitStep}
    className="mt-4 px-6 py-2 thmbtn w-full sm:w-auto"
  >
    Continue
  </button>
</form>

  );
}
