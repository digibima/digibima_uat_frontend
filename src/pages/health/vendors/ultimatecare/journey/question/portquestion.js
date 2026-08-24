"use client";
import React from "react";
import constant from "@/env";

export default function StepThreeFormPort({
  step3Form,
  onSubmitStep,
  steptwodata,
  inputClass,
}) {
  const CARE = constant?.ULTIMATEPORTQUESTION?.CAREDISEASE || {};
  const all = Object.entries(CARE);
  const diseaseEntries = all
    .filter(([k]) => !String(k).startsWith("H") && String(k) !== "504")
    .sort(([a], [b]) => {
      const na = parseInt(a, 10),
        nb = parseInt(b, 10);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
      if (!Number.isNaN(na)) return -1;
      if (!Number.isNaN(nb)) return 1;
      return String(a).localeCompare(String(b));
    })
    .slice(0, 15);


  const historyEntries = all
    .filter(([k]) => String(k).startsWith("H"))
    .sort(([a], [b]) => String(a).localeCompare(String(b)));

  const lifestyleEntry =
    all.find(([k]) => String(k) === "504") ||
    (constant?.QUESTION?.LIFESTYLE?.["31"]
      ? ["31", constant.QUESTION.LIFESTYLE["31"]]
      : null);

  const members = steptwodata?.member || steptwodata?.members || [];

  const NEEDS_DESC = new Set(["210", "502", "503"]);


  const medMasterName = "port_medical_master";
  const insMasterName = "port_insurance_master";

  const medMasterOn = step3Form.watch(medMasterName);
  const insMasterOn = step3Form.watch(insMasterName);

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">
        Port Risk & Declarations
      </h2>

      <div className="space-y-6">
        <h3 className="font-semibold text-gray-700 mb-2">Medical History:</h3>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            1. Does any person(s) to be insured currently or in past Diagnosed /
            Suffered / Treated / Taken Medication for any medical condition?
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              {...step3Form.register(medMasterName)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-all duration-300"></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md peer-checked:translate-x-full transition-transform duration-300"></div>
          </label>
        </div>

        {medMasterOn &&
          diseaseEntries.length > 0 &&
          diseaseEntries.map(([key, question], idx) => {
            const toggleName = `port_toggle_${key}`;
            const isOn = step3Form.watch(toggleName);

            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">{`1.${
                    idx + 1
                  } ${question}`}</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...step3Form.register(toggleName)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-all duration-300"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md peer-checked:translate-x-full transition-transform duration-300"></div>
                  </label>
                </div>

                {isOn && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {members.map((m, i) => {
                      const base = `${key}main${i + 1}`;
                      const memCheck = base;
                      const dateName = `${base}date`;
                      const descName = `${base}desc`;

                      return (
                        <div
                          key={m?.id ?? i}
                          className="flex flex-col border rounded-lg p-3 gap-2 cursor-pointer"
                        >
                          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              {...step3Form.register(memCheck)}
                              className="cursor-pointer accent-pink-500 h-4 w-4"
                            />
                            {(m?.name?.split(" ")[0] || "MEMBER").toUpperCase()}
                          </label>

                          {step3Form.watch(memCheck) && (
                            <>
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={7}
                                placeholder="MM/YYYY"
                                data-id={`${i + 1}`} 
                                {...step3Form.register(dateName)}
                                data-age={m.age}
                                data-dob={m.dob}
                                user-id={m.id}
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
                              {NEEDS_DESC.has(String(key)) && (
                                <textarea
                                  rows={2}
                                  placeholder="Enter description / details"
                                  {...step3Form.register(descName)}
                                  className="border px-2 py-1 rounded-md text-sm"
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

      <div className="space-y-6">
        <h3 className="font-semibold text-gray-700 mb-2">
          Previous/Existing Insurance:
        </h3>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            2. Details of previous or existing health insurance?
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              {...step3Form.register(insMasterName)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-all duration-300"></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md peer-checked:translate-x-full transition-transform duration-300"></div>
          </label>
        </div>

        {insMasterOn &&
          historyEntries.length > 0 &&
          historyEntries.map(([key, question], idx) => {
            const toggleName = `port_hist_toggle_${key}`;
            const isOn = step3Form.watch(toggleName);

            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">{`2.${
                    idx + 1
                  } ${question}`}</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...step3Form.register(toggleName)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-all duration-300"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md peer-checked:translate-x-full transition-transform duration-300"></div>
                  </label>
                </div>

                {isOn && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {members.map((m, i) => {
                      const base = `${key}main${i + 1}`;
                      const memCheck = base;
                      const dateName = `${base}date`;

                      return (
                        <div
                          key={m?.id ?? i}
                          className="flex flex-col border rounded-lg p-3 gap-2 cursor-pointer"
                        >
                          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              {...step3Form.register(memCheck)}
                              className="cursor-pointer accent-pink-500 h-4 w-4"
                            />
                            {(m?.name?.split(" ")[0] || "MEMBER").toUpperCase()}
                          </label>

                          {step3Form.watch(memCheck) && (
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={7}
                              placeholder="MM/YYYY"
                              data-id={`${i + 1}`} 
                              {...step3Form.register(dateName)}
                              data-age={m.age}
                              data-dob={m.dob}
                              user-id={m.id}
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

      {lifestyleEntry && (
        <div className="space-y-6">
          <h3 className="font-semibold text-gray-700 mb-2">
            Lifestyle History:
          </h3>
          {(() => {
            const [key, question] = lifestyleEntry;
            const toggleName = `port_life_toggle_${key}`;
            const isOn = step3Form.watch(toggleName);

            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">{`3.1 ${question}`}</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...step3Form.register(toggleName)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-all duration-300"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md peer-checked:translate-x-full transition-transform duration-300"></div>
                  </label>
                </div>

                {isOn && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {members.map((m, i) => {
                      const base = `${key}main${i + 1}`;
                      const memCheck = base;
                      const qtyName = `${base}qty`;
                      const dateName = `${base}date`;

                      return (
                        <div
                          key={m?.id ?? i}
                          className="flex flex-col border rounded-lg p-3 gap-2 cursor-pointer"
                        >
                          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              {...step3Form.register(memCheck)}
                              className="cursor-pointer accent-pink-500 h-4 w-4"
                            />
                            {(m?.name?.split(" ")[0] || "MEMBER").toUpperCase()}
                          </label>

                          {step3Form.watch(memCheck) && (
                            <>
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={3}
                                placeholder="Quantity / Units"
                                {...step3Form.register(qtyName)}
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
                                data-id={`${i + 1}`} 
                                {...step3Form.register(dateName)}
                                data-age={m.age}
                                data-dob={m.dob}
                                user-id={m.id}
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
          })()}
        </div>
      )}

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
