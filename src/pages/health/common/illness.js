"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { showSuccess, showError } from "../../../layouts/toaster";
import { CallApi, getUserinfo, isAuth } from "../../../api";
import constant from "../../../env";
import Image from "next/image";

export default function IllnessForm() {
  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: { data: [] },
  });

  const illnesses = [
    "Diabetes",
    "Blood Pressure",
    "Asthma",
    "Thyroid",
    "Heart Disease",
    "Other Disease",
  ];
  const illnessImages = {
  "Diabetes": "/images/health/illness/diabetes.png",
  "Blood Pressure": "/images/health/illness/blood-pressure.png",
  "Asthma": "/images/health/illness/asthma.png",
  "Thyroid": "/images/health/illness/thyroid.png",
  "Heart Disease": "/images/health/illness/heart.png",
  "Other Disease": "/images/health/illness/other.png",
  "No Existing Disease": "/images/health/illness/no-existing.png",
};

  const router = useRouter();
  const selected = watch("data") || [];

  const isNoDiseaseSelected = selected.includes("No Existing Disease");
  const isAnyOtherSelected = selected.some((d) => d !== "No Existing Disease");

  useEffect(() => {
    async function getAuth() {
      const isauth = await isAuth();
      if (!isauth) {
        router.replace(constant.ROUTES.INDEX);
      }
    }
    getAuth();
  }, [router]);


useEffect(() => {
  const getToken = localStorage.getItem("token");
  if (getToken) {
    const fetchData = async () => {
      try {
        const res = await getUserinfo(getToken);
        const data = await res.json();
        // console.log(" data :", data);
        // console.log("pre ped data :", data.user?.ped);

        let pedList = [];
        if (data.user?.ped) {
          const parsedPED = JSON.parse(data.user.ped || "{}");
          pedList = parsedPED.data || [];
        }

        if (pedList.length > 0) {
          setValue("data", pedList);
        }

      } catch (error) {
        console.error("Error parsing PED:", error);
      }
    };
    fetchData();
  }
}, [reset, setValue]);


  const toggleSelection = (value) => {
    let newValues = new Set(selected);
    if (newValues.has(value)) {
      newValues.delete(value);
    } else {
      if (value === "No Existing Disease") {
        newValues = new Set(["No Existing Disease"]);
      } else {
        newValues.delete("No Existing Disease");
        newValues.add(value);
      }
    }
    setValue("data", Array.from(newValues));
  };

  const onSubmit = async (formData) => {
    if (formData.data.length === 0) {
      showError("Please select at least one illness.");
      return;
    }
    try {
      const response = await CallApi(
        constant.API.HEALTH.SAVEILLNESS,
        "POST",
        formData
      );

      router.push(constant.ROUTES.HEALTH.PLANS);
    } catch (err) {
      console.error("API error:", err);
      showError("Failed to submit data. Please try again.");
    }
  };

  return (
  <div className="bgcolor px-2 sm:px-4 py-6 sm:py-10">
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-[1100px] mx-auto mt-5 mb-10 px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 py-8 rounded-[64px] bg-white text-center"
    >
      <h2 className="text-[20px] sm:text-[24px] md:text-[28px] text-[#426D98] font-bold sm:leading-snug md:leading-relaxed mb-10">
        Do any member(s) have any existing condition for which they take{" "}
        <br className="hidden sm:inline" />
        regular medication?
      </h2>

      {/* Illness Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center mb-6">

        {illnesses.map((illness) => {

          const isChecked = selected.includes(illness);

          return (

            <div
              key={illness}
              onClick={() => !isNoDiseaseSelected && toggleSelection(illness)}
              className={`flex items-center gap-3 bg-white px-4 py-3 rounded-2xl text-black w-[280px] relative
              border border-gray-200 hover:border-blue-500 hover:shadow-md
              transition-all duration-200 min-h-[52px]
              ${isNoDiseaseSelected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >

              {/* Ping animation */}
              {isChecked && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-ping"></span>
              )}

              {/* Circle checkbox */}
              <div
                className={`w-6 h-6 flex items-center justify-center rounded-full border transition-all duration-200
                ${
                  isChecked
                    ? "bg-blue-600 border-blue-600 text-white scale-105"
                    : "border-gray-300 text-transparent"
                }`}
              >
                ✓
              </div>

              {/* Icon */}
             <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm relative">
              <Image
                src={illnessImages?.[illness] || "/images/default.png"}
                alt={illness || "illness-icon"}
                fill
                className="object-cover"
              />
            </div>

              {/* Text */}
              <span className="text-[15px] font-semibold text-gray-800 flex-1 text-left truncate">
                {illness}
              </span>

              {/* Hidden checkbox (logic same) */}
              <input
                type="checkbox"
                value={illness}
                {...register("data")}
                checked={isChecked}
                onChange={() => toggleSelection(illness)}
                disabled={isNoDiseaseSelected}
                className="hidden"
              />

            </div>

          );

        })}

      </div>


      {/* No Existing Disease */}

      <div className="flex justify-center mb-6">

        <div
          onClick={() =>
            !isAnyOtherSelected && toggleSelection("No Existing Disease")
          }
          className={`flex items-center gap-3 bg-white px-4 py-3 rounded-2xl text-black w-[280px] relative
          border border-gray-200 hover:border-blue-500 hover:shadow-md
          transition-all duration-200 min-h-[52px]
          ${isAnyOtherSelected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >

          {selected.includes("No Existing Disease") && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-ping"></span>
          )}

          <div
            className={`w-6 h-6 flex items-center justify-center rounded-full border transition-all duration-200
            ${
              selected.includes("No Existing Disease")
                ? "bg-blue-600 border-blue-600 text-white scale-105"
                : "border-gray-300 text-transparent"
            }`}
          >
            ✓
          </div>

          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm">
            <Image
              src={illnessImages["No Existing Disease"]}
              alt="healthy"
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          </div>

          <span className="text-[15px] font-semibold text-gray-800 flex-1 text-left truncate">
            No Existing Disease
          </span>

          <input
            type="checkbox"
            value="No Existing Disease"
            {...register("data")}
            checked={selected.includes("No Existing Disease")}
            onChange={() => toggleSelection("No Existing Disease")}
            disabled={isAnyOtherSelected}
            className="hidden"
          />

        </div>

      </div>


      {/* Buttons */}

      <div className="flex justify-center gap-4 flex-wrap">

        <button
          type="button"
          onClick={() => router.push(constant.ROUTES.HEALTH.INSURE)}
          className="px-10 py-2 thmbtn"
        >
          Back
        </button>

        <button
          type="submit"
          className="px-10 py-2 thmbtn"
        >
          View Plans
        </button>

      </div>

    </form>
  </div>
);
}
