"use client";
import React from "react";
import questionnaire from "@/context/adityabirlaped";

export default function StepThreeForm({
  step3Form,
  onSubmitStep,
  steptwodata,
}) {
  const members = steptwodata?.member || steptwodata?.members || [];

const renderField = (name, field) => {
  const placeholder = field.placeholder || field.text || "Enter details";

  if (field.type === "select") {
    return (
      <select
        {...step3Form.register(name)}
        className="border px-2 py-1 rounded-md text-sm w-full bg-white"
      >
        <option value="">Select {field.text}</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        rows={2}
        placeholder={placeholder}
        {...step3Form.register(name)}
        className="border px-2 py-1 rounded-md text-sm w-full"
      />
    );
  }

  if (field.type === "date") {
    return (
      <input
        type="text"
        maxLength={7}
        placeholder="MM/YYYY"
        {...step3Form.register(name)}
        onInput={(e) => {
          e.target.value = e.target.value
            .replace(/[^\d]/g, "")
            .replace(
              /^(\d{2})(\d{1,4})?$/,
              (_, mm, yyyy) => (yyyy ? `${mm}/${yyyy}` : mm)
            );
        }}
        className="border px-2 py-1 rounded-md text-sm w-full"
      />
    );
  }

  if (field.type === "number") {
    return (
      <input
        type="text"
        placeholder="Enter Quantity"
        {...step3Form.register(name)}
        className="border px-2 py-1 rounded-md text-sm w-full"
      />
    );
  }

  return (
    <input
      type="text"
      placeholder={placeholder}
      {...step3Form.register(name)}
      className="border px-2 py-1 rounded-md text-sm w-full"
    />
  );
};

  const renderQuestion = (question, index, sectionNo) => {
    const toggleName = `${question.key}_toggle`;
    const isChecked = step3Form.watch(toggleName);

    if (question.type === "checkbox") {
      return (
        <label
          key={question.question_id}
          className="flex gap-2 items-start"
        >
          <input
            type="checkbox"
            {...step3Form.register(question.key)}
            className="cursor-pointer accent-pink-500 h-4 w-4"
          />
          <span>{question.text}</span>
        </label>
      );
    }

if (question.type === "text" || question.type === "number") {
  const toggleName = `${question.key}_toggle`;
  const enabled = step3Form.watch(toggleName);

  return (
    <div
      key={question.question_id}
      className="space-y-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-sm font-medium flex-1 min-w-[200px]">
          {sectionNo}.{index + 1} {question.text}
        </label>

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

      {enabled && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {members.map((member, memberIndex) => {
            const memberCheck = `${question.key}_${memberIndex}`;
            const memberOn =
              step3Form.watch(memberCheck);

            return (
              <div
                key={member.id || memberIndex}
                className="flex flex-col border rounded-lg p-3 gap-2"
              >
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    {...step3Form.register(
                      memberCheck
                    )}
                    className="accent-pink-500 h-4 w-4"
                  />
                  {member.name
                    ?.split(" ")[0]
                    ?.toUpperCase()}
                </label>

                {memberOn && (
                  <div className="mt-1">
                    {renderField(
                      `${question.key}_${memberIndex}_value`,
                      question
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

    return (
      <div key={question.question_id} className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-sm font-medium flex-1 min-w-[200px]">
            {sectionNo}. {question.text}
          </label>

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

        {isChecked && members.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {members.map((member, memberIndex) => {
              const memberCheck = `${question.key}_${memberIndex}`;
              const enabled = step3Form.watch(memberCheck);

              return (
                <div
                  key={member.id || memberIndex}
                  className="flex flex-col border cursor-pointer rounded-lg p-3 gap-2"
                >
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      {...step3Form.register(memberCheck)}
                      className="cursor-pointer accent-pink-500 h-4 w-4"
                    />
                    {member.name?.split(" ")[0].toUpperCase()}
                  </label>

                  {enabled &&
                    question.children?.map((child) => {
                      const fieldName = `${question.key}_${memberIndex}_${child.key}`;

                      return (
                        <div key={child.key}>
                          <label className="text-xs font-medium block mb-1">
                            {child.text}
                          </label>
                          {renderField(fieldName, child)}
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="space-y-6 w-full"
    >
      <h2 className="text-xl font-bold text-gray-800">
        Help us know the medical condition, if any
      </h2>

      {questionnaire.sections.map((section, sIndex) => (
        <div key={section.key} className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">
              {section.title}:
            </h3>

            {section.main_question && (
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <label className="text-sm font-medium flex-1 min-w-[200px]">
                  {section.main_question.text}
                </label>
              </div>
            )}

            <div className="space-y-3 mt-2">
              {section.questions.map((question, index) =>
                renderQuestion(question, index, sIndex + 1)
              )}
            </div>
          </div>
        </div>
      ))}

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