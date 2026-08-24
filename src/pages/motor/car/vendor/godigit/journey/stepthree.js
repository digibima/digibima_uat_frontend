"use client";
import React from "react";
import { useState, useEffect } from "react";
import constant from "@/env";
import UniversalDatePicker from "../../../../../datepicker/index";
import { format, parse } from "date-fns";

export default function StepThreeForm({
  step3Form,
  onSubmitStep,
  steptwodata,
  inputClass,
  journeydata,
}) {
  const [dates, setDates] = useState({});
  const [isMinor, setIsMinor] = useState(false);
  const handleDateChange = (key, fieldNameInForm) => (date) => {
    if (!date || isNaN(date)) return;

    const formatted = format(date, "dd-MM-yyyy");

    setDates((prev) => ({
      ...prev,
      [key]: { ...prev[key], dob: date },
    }));

    step3Form.setValue(fieldNameInForm, formatted, {
      shouldValidate: true,
    });
    // Check if the nominee is a minor (under 18 years old)
    const age = calculateAge(date);
    setIsMinor(age < 18);
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth();
    if (
      month < birthDate.getMonth() ||
      (month === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (!journeydata?.nominee_details) return;

    try {
      const nominee = JSON.parse(journeydata.nominee_details);

      if (nominee.nomineename) {
        step3Form.setValue("nomineename", nominee.nomineename);
      }

      if (nominee.nomineerelation) {
        step3Form.setValue("nomineerelation", nominee.nomineerelation);
      }

      if (nominee.nomineedob) {
        const parsedDate = parse(nominee.nomineedob, "dd-MM-yyyy", new Date());
        setDates((prev) => ({
          ...prev,
          nominee: { dob: parsedDate },
        }));
        step3Form.setValue("nomineedob", nominee.nomineedob);
      }
      if (nominee.appointeename && nominee.appointeerelation) {
        setIsMinor(true);
        setTimeout(() => {
          step3Form.setValue("appointeename", nominee.appointeename);
          step3Form.setValue("appointeerelation", nominee.appointeerelation);
        }, 0);
      }
    } catch (err) {
      console.error("Invalid nominee_details JSON", err);
    }
  }, [journeydata, step3Form]);
  useEffect(() => {
    if (isMinor) {
      step3Form.register("appointeename", {
        required: "Appointee Name is required",
      });
      step3Form.register("appointeerelation", {
        required: "Please select the appointee relation",
      });
    } else {
      step3Form.unregister("appointeename");
      step3Form.unregister("appointeerelation");
    }
  }, [isMinor, step3Form]);

  useEffect(() => {
    step3Form.setValue("physicalpolicy", "0");
  }, [step3Form]);

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      {/* NOMINEE SECTION */}
      <input type="hidden" {...step3Form.register("step")} value="third" />
      <h2 className="text-xl font-bold text-gray-800 mt-8">Nominee:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          {...step3Form.register("nomineename", {
            required: "Nominee Name is required",
          })}
          placeholder="Enter Nominee Full Name"
          className={inputClass}
        />
        <UniversalDatePicker
          id="nomineedob"
          name="nomineedob"
          className={`nomineedob ...`}
          value={dates?.nominee?.dob || null}
          data-age=""
          onChange={handleDateChange("nominee", "nomineedob")}
          placeholder="Pick a date"
          error={!dates?.nominee?.dob}
        />
        <select
          {...step3Form.register("nomineerelation", {
            required: "Please select the nominee relation",
          })}
          className={inputClass}
        >
          <option value="">Relation</option>
          <option value="Daughter">Daughter</option>
          <option value="Daughterinlaw">Daughterinlaw</option>
          <option value="Grandchild">Grandchild</option>
          <option value="Head">Head</option>
          <option value="Mother">Mother</option>
          <option value="Son">Son</option>
          <option value="Spouse">Spouse</option>
          <option value="Husband">Husband</option>
          <option value="Other">Other</option>
          <option value="Longtimepartner">Longtimepartner</option>
          <option value="Child">Child</option>
          <option value="Sister">Sister</option>
          <option value="Brother">Brother</option>
          <option value="Father">Father</option>

        </select>
        {/* Show Appointee fields if nominee is a minor */}
        {isMinor && (
          <>
            <input
              {...step3Form.register("appointeename", {
                required: "Appointee Name is required",
              })}
              placeholder="Enter Appointee Full Name"
              className={inputClass}
            />
            <select
              {...step3Form.register("appointeerelation", {
                required: "Please select the appointee relation",
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
          </>
        )}
      </div>
      <div className="flex items-center gap-2 mt-4">
        <input
          type="checkbox"
          id="physicalpolicy"
          checked={step3Form.watch("physicalpolicy") === "1"}
          onChange={(e) =>
            step3Form.setValue("physicalpolicy", e.target.checked ? "1" : "0")
          }
          className="h-5 w-5 accent-pink-500"
        />
        <label
          htmlFor="physicalpolicy"
          className="text-sm font-semibold cursor-pointer text-[#1f3b57]"
        >
          Do you want a physical copy?
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
