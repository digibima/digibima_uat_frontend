"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import constant from "../../../env";
import { CallApi } from "../../../api";
import UniversalDatePicker from "../../datepicker/index";
import { format, parse } from "date-fns";
import { showSuccess, showError } from "../../../layouts/toaster";
import { carTwo } from "@/images/Image";

export default function KnowCarStepTwo() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm();

  const [under, setUnder] = useState("individual");
  const [dates, setDates] = useState({ regDate: "", regDateRaw: null });

  const router = useRouter();

  useEffect(() => {
    register("carregdate", { required: true });
    register("brandyear", { required: true });
  }, [register]);

  // GET Saved Data & Vahan Data
  useEffect(() => {
    async function getSavedResponse() {
      try {
        const response = await CallApi(
          constant.API.MOTOR.CAR.KNOWCARDETAILSTWO,
          "GET"
        );

        if (response?.status) {
          const pageData = response.data || {};
          const vahanData = response.vahandata || {};

          const brandVal = pageData.brand || vahanData.brand || "";
          const modelVal = pageData.model || vahanData.model || "";
          const regDateVal = pageData.carregdate || vahanData.regno || "";
          const underVal = pageData.under || "individual";

          // Agar brandyear saved page data me ho toh wo use karo, varna registration date se extract karo
          let brandYearVal = pageData.brandyear || "";

          if (regDateVal) {
            try {
              const parsedDate = parse(regDateVal, "dd-MM-yyyy", new Date());
              if (!isNaN(parsedDate.getTime())) {
                setDates({
                  regDate: regDateVal,
                  regDateRaw: parsedDate,
                });
                if (!brandYearVal) {
                  brandYearVal = parsedDate.getFullYear().toString();
                }
              }
            } catch (err) {
              console.error("Error parsing registration date:", err);
            }
          }

          reset({
            brand: brandVal,
            model: modelVal,
            carregdate: regDateVal,
            brandyear: brandYearVal,
            under: underVal,
          });

          setUnder(underVal);
        }
      } catch (error) {
        console.error("Error fetching car details:", error);
      }
    }
    getSavedResponse();
  }, [reset]);

  // Handle Date Selection and Auto-set Year Of Manufacture
  const handleDateChange = (key) => (date) => {
    if (!date || isNaN(date.getTime())) return;
    const formatted = format(date, "dd-MM-yyyy");
    
    setDates({ [key]: formatted, [`${key}Raw`]: date });
    setValue("carregdate", formatted);

    // Register date se year nikal kar brandyear input me set karna
    const extractedYear = date.getFullYear().toString();
    setValue("brandyear", extractedYear);
  };

  const onSubmit = async (data) => {
    try {
      const response = await CallApi(
        constant.API.MOTOR.CAR.KNOWCARDETAILSTWO,
        "POST",
        data
      );
      if (response) {
        router.push(constant.ROUTES.MOTOR.CAR.KNOWCARSTEPTHREE);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const onInvalid = (errors) => {
    const firstField = Object.keys(errors)[0];
    const message = errors[firstField]?.message;

    const fallbackMessages = {
      brand: "Brand is required",
      model: "Model is required",
      carregdate: "Car registration date is required",
      brandyear: "Manufacturing year is required",
      under: "Please select individual or company",
    };

    showError(
      message || fallbackMessages[firstField] || "Please correct the form."
    );
  };

  return (
    <>
      <div className="bgcolor py-6 sm:py-10 min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="w-full max-w-6xl mx-auto rounded-[64px] bg-white shadow-lg px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10">
          {/* Heading */}
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[#426D98] text-center">
            Motor insurance provides essential coverage against accidents.
          </h2>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {/* Left Side: Image */}
            <div className="hidden md:col-span-2 md:flex justify-center items-center p-4">
              <div className="w-full max-w-[220px] sm:max-w-xs">
                <Image
                  src={carTwo}
                  alt="Home with Umbrella"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="md:col-span-2">
              <form
                onSubmit={handleSubmit(onSubmit, onInvalid)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                {/* Car Register Under */}
                <div className="sm:col-span-2">
                  <label className="labelcls">Car Register Under</label>
                  <div className="flex items-center bg-[#E9F1FF] rounded-full p-1 w-fit shadow-sm">
                    {["individual", "company"].map((type) => (
                      <label key={type} className="cursor-pointer">
                        <input
                          type="radio"
                          value={type}
                          {...register("under", { required: true })}
                          className="peer hidden"
                          checked={under === type}
                          onChange={() => {
                            setUnder(type);
                            setValue("under", type);
                          }}
                        />
                        <div
                          className={`
                            px-5 py-1.5 rounded-full text-sm font-semibold capitalize
                            text-[#2F4A7E] hover:bg-[#d3e6ff]
                            transition-all duration-300 ease-in-out
                            peer-checked:bg-[#7998F4] 
                            peer-checked:text-white
                          `}
                        >
                          {type}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Manufacture Input */}
                <div>
                  <label className="labelcls">Manufacture</label>
                  <input
                    type="text"
                    id="brand"
                    {...register("brand", { required: true })}
                    placeholder="Enter brand name"
                    className="inputcls"
                    readOnly={true}
                  />
                </div>

                {/* Model & Variant Input */}
                <div>
                  <label className="labelcls">Model & Variant</label>
                  <input
                    type="text"
                    id="model"
                    {...register("model", { required: true })}
                    placeholder="Enter model and variant"
                    className="inputcls"
                    readOnly={true}
                  />
                </div>

                {/* Register Date */}
                <div>
                  <label className="labelcls">Register Date</label>
                  <UniversalDatePicker
                    id="carregdate"
                    name="carregdate"
                    className="inputcls"
                    value={dates.regDateRaw}
                    onChange={handleDateChange("regDate")}
                    placeholder="Pick a start date"
                    error={!dates.regDate}
                    errorText="Please select a valid date"
                    readOnly={true}
                    disabled={true}
                  />
                </div>

                {/* Year of Manufacture Input */}
                <div>
                  <label className="labelcls">Year Of Manufacture</label>
                  <input
                    type="text"
                    id="brandyear"
                    {...register("brandyear", { required: true })}
                    placeholder="YYYY"
                    className="inputcls"
                    readOnly={true}
                  />
                </div>

                {/* Buttons */}
                <div className="sm:col-span-2 flex flex-wrap gap-3 justify-start">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(constant.ROUTES.MOTOR.SELECTVEHICLE)
                    }
                    className="px-6 py-2 text-white rounded-full text-sm font-semibold shadow-md hover:scale-105 transition"
                    style={{
                      background: "#7998F4",
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-white rounded-full text-sm font-semibold shadow-md hover:scale-105 transition"
                    style={{
                      background: "#7998F4",
                    }}
                  >
                    Continue
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}