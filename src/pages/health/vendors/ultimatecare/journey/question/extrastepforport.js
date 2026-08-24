"use client";
import React, { useState, useEffect, useCallback } from "react";
import UniversalDatePicker from "../../../../../datepicker/index";
import { format, parse } from "date-fns";
import { isNumber } from "@/styles/js/validation";
import { CallApi } from "@/api";
import constant from "@/env";
import { Controller } from "react-hook-form";
import DropdownWithSearch from "../../../../../lib/DropdownWithSearch";

export default function ExtraStepForPortForm({
  stepPortForm,
  steponedata,
  inputClass,
  onSubmitStep,
  usersData,
  setTenureYear,
    setPortMemberData
}) {
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [insurdata, setInsurData] = useState([]);
 
  const { control } = stepPortForm;
useEffect(() => {
  const fetchData = async () => {
    try {
      if (isAutoFilled) return;

      const res = await CallApi(
        constant.API.HEALTH.ULTIMATECARE.SAVESTEPPORT,
        "GET"
      );

      if (res?.status) {
        if (Array.isArray(res.insured)) {
          setInsurData(
            res.insured.map((item) => ({
              value: item.id,
              label: item.lookupdatavaluekey
            }))
          );
           if (res.members) {
              setPortMemberData(res.members); 
            }
        }
        stepPortForm.setValue("porttenure", res.tenure || "");
        if (res.data) {
          stepPortForm.reset({
            insurername: res.data.insurername || "",
            policynumber: res.data.policynumber || "",
            prepolicyexpirydate: res.data.prepolicyexpirydate || "",
            // policystartdate: res.data.policystartdate || "",
            policyenddate: res.data.policyenddate || "",
            firstpolicynumber: res.data.firstpolicynumber || "",
            firstpolicystartdate: res.data.firstpolicystartdate || "",
            prepolicyplanname: res.data.prepolicyplanname || "",
            prepolicytype: res.data.prepolicytype || "",
            prepolicysuminsured: res.data.prepolicysuminsured || "",
            prepolicycumbonus: res.data.prepolicycumbonus || "",
             porttenure: res.tenure || "",
          });
        }

        if (res.plantype && typeof usersData?.setPlanType === "function") {
          usersData.setPlanType(res.plantype);
        }
         if (res.tenure) {
          setTenureYear(res.tenure);  
          if (typeof usersData?.setTenureYear === "function") {
            usersData.setTenureYear(res.tenure);
          }
        }
      }

      setIsAutoFilled(true);
    } catch (error) {
      console.error("Portability Step GET Error:", error);
    }
  };

  fetchData();
}, [isAutoFilled,setTenureYear, stepPortForm, usersData,  setPortMemberData]);



  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
   
      <h2 className="text-xl font-bold text-gray-800 mt-8">
        Previous Policy Details:
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
        <div>
               <input
      type="hidden"
      {...stepPortForm.register("porttenure")}
    />
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Insurer Name
          </label>
          <Controller
            name="insurername"
            control={control}
            rules={{ required: "Please select an insurance company" }}
            render={({ field, fieldState: { error } }) => (
              <>
               <DropdownWithSearch
                  id="insurername"
                  name="insurername"
                  options={insurdata}   
                  value={field.value}   
                  onChange={field.onChange}
                  placeholder="Select Insurer Name"
                  className="inputcls"
                />

                {error && (
                  <p className="text-red-500 text-sm mt-1">{error.message}</p>
                )}
              </>
            )}
          />
        </div>

       
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Policy Number
          </label>
          <input
            {...stepPortForm.register("policynumber", {
              required: "Policy Number is required",
            })}
            placeholder="Enter Policy Number"
            className={inputClass}
          />
        </div>

      
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pre-Policy Start Date
          </label>
          <Controller
            control={stepPortForm.control}
            name="prepolicyexpirydate"
            rules={{ required: "Pre-Policy Start Date is required" }}
            render={({ field, fieldState }) => (
              <UniversalDatePicker
                id="prepolicyexpirydate"
                name="prepolicyexpirydate"
                value={
                  field.value
                    ? parse(field.value, "dd-MM-yyyy", new Date())
                    : null
                }
                onChange={(date) => {
                  if (date instanceof Date && !isNaN(date)) {
                    field.onChange(format(date, "dd-MM-yyyy"));
                  }
                }}
                placeholder="Select Expiry Date"
                error={!!fieldState.error}
                errorText={fieldState.error?.message}
              />
            )}
          />
        </div>

   


       
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Policy End Date
          </label>
          <Controller
            control={stepPortForm.control}
            name="policyenddate"
            rules={{ required: "Policy End Date is required" }}
            render={({ field, fieldState }) => (
              <UniversalDatePicker
                id="policyenddate"
                name="policyenddate"
                value={
                  field.value
                    ? parse(field.value, "dd-MM-yyyy", new Date())
                    : null
                }
                onChange={(date) => {
                  if (date instanceof Date && !isNaN(date)) {
                    field.onChange(format(date, "dd-MM-yyyy"));
                  }
                }}
                placeholder="Select End Date"
                error={!!fieldState.error}
                errorText={fieldState.error?.message}
              />
            )}
          />
        </div>

 
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Policy Number
          </label>
          <input
            {...stepPortForm.register("firstpolicynumber", {
              required: "First Policy Number is required",
            })}
            placeholder="Enter First Policy Number"
            className={inputClass}
          />
        </div>

  
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Policy Start Date
          </label>
          <Controller
            control={stepPortForm.control}
            name="firstpolicystartdate"
            rules={{ required: "First Policy Start Date is required" }}
            render={({ field, fieldState }) => (
              <UniversalDatePicker
                id="firstpolicystartdate"
                name="firstpolicystartdate"
                value={
                  field.value
                    ? parse(field.value, "dd-MM-yyyy", new Date())
                    : null
                }
                onChange={(date) => {
                  if (date instanceof Date && !isNaN(date)) {
                    field.onChange(format(date, "dd-MM-yyyy"));
                  }
                }}
                placeholder="Select Start Date"
                error={!!fieldState.error}
                errorText={fieldState.error?.message}
              />
            )}
          />
        </div>

 

   
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pre Policy Plan Name
          </label>
          <input
            {...stepPortForm.register("prepolicyplanname", {
              required: "Pre Policy Plan Name is required",
            })}
            placeholder="Enter Plan Name"
            className={inputClass}
             maxLength={5}
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault();
                }
              }}
          />
        </div>

   
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pre Policy Type
          </label>
          <select
            {...stepPortForm.register("prepolicytype", {
              required: "Pre Policy Type is required",
            })}
            className={inputClass}
          >
            <option value="">Select Type</option>
            <option value="individual">Individual</option>
            <option value="multi">MultiIndividual</option>
            <option value="floater">Floater</option>
          </select>
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pre Policy Sum Insured
          </label>
          <input
            {...stepPortForm.register("prepolicysuminsured", {
              required: "Sum Insured is required",
            })}
            placeholder="Enter Sum Insured"
            className={inputClass}
          />
        </div>

 
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pre Policy Cumulative Bonus
          </label>
          <input
            {...stepPortForm.register("prepolicycumbonus", {
              required: "Cumulative Bonus is required",
            })}
            placeholder="Enter Cumulative Bonus"
            className={inputClass}
          />
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
