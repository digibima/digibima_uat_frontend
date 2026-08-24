"use client";
import React from "react";
import { Controller } from "react-hook-form";
import constant from "@/env";

export default function StepThreeForm({
  step3Form,
  onSubmitStep,
  steptwodata,
}) {
  const { control, watch, register, setValue, handleSubmit, formState } =
    step3Form;

  const watchAll = watch();

 const handleMemberToggle = (questionName, memberId, checked) => {
  const current = watch(`${questionName}.members`) || [];

  // Prevent selecting more than 2 members
  if (checked && current.length >= 1) {
    showError(
      "For more than 2 PED members selected, please contact administration."
    );
    return;
  }

  const updated = checked
    ? [...current, memberId]
    : current.filter((id) => id !== memberId);

  setValue(`${questionName}.members`, updated);
};

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6 w-full">
      <h2 className="text-xl font-bold text-gray-800">
        Help us know the medical condition, if any
      </h2>

      <div className="space-y-6">
        <h3 className="font-semibold text-gray-700 mb-2">Medical History:</h3>

        {Object.entries(constant.BAJAJQUESTION.HEALTH).map(([key, q]) => {
          const isActive = watch(`${q.name}.toggle`);
          const selectedMembers = watch(`${q.name}.members`) || [];

          return (
            <div key={key} className="mb-6">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium flex-1 min-w-[200px]">
                  {`${key}. ${q.label || q}`}
                </label>

                <Controller
                  name={`${q.name}.toggle`}
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-all duration-300"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md peer-checked:translate-x-full transition-transform duration-300"></div>
                    </label>
                  )}
                />
              </div>

              {isActive && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {steptwodata?.member?.map((m) => {
                    const shortName = m.name.split(" ")[0];
                    const checked = selectedMembers.includes(m.id);
                    return (
                      <div key={m.id} className="space-y-2">
                        <label
                          className={`flex items-center cursor-pointer border rounded-lg p-3 gap-2 ${
                            checked ? "border-pink-500 bg-pink-50" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              handleMemberToggle(q.name, m.id, e.target.checked)
                            }
                            className="accent-pink-500 h-4 w-4"
                          />

                          <span className="text-sm font-medium">
                            {shortName.toUpperCase()}
                          </span>
                        </label>

                        {checked && (
                          <textarea
                            rows={2}
                            placeholder="Enter remark..."
                            {...register(`${q.name}.remarks.${m.id}`)}
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

      <div className="space-y-6">
        <h3 className="font-semibold text-gray-700 mb-2">Lifestyle History:</h3>

        {Object.entries(constant.BAJAJQUESTION.LIFESTYLE).map(([key, q]) => {
          const isActive = watch(`${q.name}.toggle`);
          const selectedMembers = watch(`${q.name}.members`) || [];

          return (
            <div key={key} className="mb-6">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium flex-1 min-w-[200px]">
                  {`${key}. ${q.label || q}`}
                </label>

                <Controller
                  name={`${q.name}.toggle`}
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-all duration-300"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md peer-checked:translate-x-full transition-transform duration-300"></div>
                    </label>
                  )}
                />
              </div>

              {isActive && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {steptwodata?.member?.map((m) => {
                    const shortName = m.name.split(" ")[0];
                    const checked = selectedMembers.includes(m.id);
                    return (
                      <div key={m.id} className="space-y-2">
                        <label
                          className={`flex items-center cursor-pointer border rounded-lg p-3 gap-2 ${
                            checked ? "border-pink-500 bg-pink-50" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              handleMemberToggle(q.name, m.id, e.target.checked)
                            }
                            className="accent-pink-500 h-4 w-4"
                          />

                          <span className="text-sm font-medium">
                            {shortName.toUpperCase()}
                          </span>
                        </label>

                        {checked && (
                          <textarea
                            rows={2}
                            placeholder="Enter remark..."
                            {...register(`${q.name}.remarks.${m.id}`)}
                            className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
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

      <div className="space-y-2 text-sm text-gray-700">
        <label className="flex gap-2 items-start">
          <input
            type="checkbox"
            {...register("agreeTnC")}
            className="cursor-pointer accent-pink-500 h-4 w-4"
          />
          <span>
            I hereby agree to the{" "}
            <a className="text-blue-600 underline">Terms & Conditions</a> of the
            purchase of this policy. *
          </span>
        </label>
      </div>

      <button
        type="button"
        onClick={() => onSubmitStep()}
        className="mt-4 px-6 py-2 thmbtn w-full sm:w-auto"
      >
        Continue
      </button>
    </form>
  );
}
