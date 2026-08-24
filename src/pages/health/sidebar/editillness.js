"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { showSuccess, showError  } from "@/layouts/toaster";
import { CallApi, getUserinfo } from "../../../api";
import constant from "../../../env";
import { deleteDBData ,clearDBData} from "../../../api";
import { isListChanged } from "@/pages/api/helpers";
import { useRef } from "react";
import Image from "next/image";

export default function EditIllnessComponent({ onClose }) {
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

  const selected = watch("data") || [];
  const isNoDiseaseSelected = selected.includes("No Existing Disease");
  const isAnyOtherSelected = selected.some((d) => d !== "No Existing Disease");
const originalIllnessRef = useRef([]);
  const router = useRouter();

  useEffect(() => {
    const getToken = localStorage.getItem("token");
    if (getToken) {
      const fetchData = async () => {
        try {
          const res = await getUserinfo(getToken);
          const data = await res.json();
          const pedList = JSON.parse(data?.user?.ped || "{}")?.data || [];
         if (data.status) {
          reset({ data: pedList });
          originalIllnessRef.current = pedList; 
        }
        } catch (error) {
          console.error("Error parsing PED:", error);
        }
      };
      fetchData();
    }
  }, [reset]);

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

if (response?.status) {
  const changed = isListChanged(originalIllnessRef.current, formData.data);
  if (changed) {
     await clearDBData();
  }
  
  showSuccess("Illness details saved.");
  onClose?.();
  
  router.push(constant.ROUTES.HEALTH.PLANS);
  setTimeout(() => {
     router.refresh();
  }, 100);
}
else {
  showError("Failed to save illness data.");
}

    } catch (err) {
      console.error("API error:", err);
      showError("Failed to submit data. Please try again.");
    }
  };

  return (
<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full px-1 overflow-hidden">
      <h2 className="text-[18px] font-semibold text-blue-900 mb-3">
        Select Existing Illness
      </h2>

      {/* Illness Cards */}
<div className="space-y-4 flex-1 overflow-y-auto pr-1 pb-5">

  {illnesses.map((illness) => {
    const isChecked = selected.includes(illness);

    return (
      <div
        key={illness}
        onClick={() => !isNoDiseaseSelected && toggleSelection(illness)}
        className={`flex items-center gap-3 bg-white px-4 py-3 rounded-2xl text-black w-full relative
        border border-gray-200 hover:border-blue-500 hover:shadow-md
        transition-all duration-200 min-h-[52px]
        ${isNoDiseaseSelected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >

        <div
          className={`w-7 h-7 flex items-center justify-center rounded-full border transition-all duration-200
          ${isChecked
            ? "bg-blue-600 border-blue-600 text-white scale-105"
            : "border-gray-300 text-transparent"
          }`}
        >
          ✓
        </div>

        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 shadow-sm relative">
          <Image
            src={illnessImages?.[illness] || "/images/default.png"}
            alt={illness || "illness"}
            fill
            className="object-cover"
          />
        </div>

        <span className="text-[15px] font-semibold text-gray-800 flex-1 text-left truncate">
          {illness}
        </span>

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


  <div
    onClick={() =>
      !isAnyOtherSelected && toggleSelection("No Existing Disease")
    }
    className={`flex items-center gap-3 bg-white px-4 py-3 rounded-2xl text-black w-full relative
    border border-gray-200 hover:border-blue-500 hover:shadow-md
    transition-all duration-200 min-h-[52px]
    ${isAnyOtherSelected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    `}
  >

    <div
      className={`w-7 h-7 flex items-center justify-center rounded-full border transition-all duration-200
      ${selected.includes("No Existing Disease")
        ? "bg-blue-600 border-blue-600 text-white scale-105"
        : "border-gray-300 text-transparent"
      }`}
    >
      ✓
    </div>

    <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 shadow-sm relative">
          <Image
            src={illnessImages["No Existing Disease"]}
            alt="illness"
            fill
            className="object-cover"
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

<div className="bg-white pt-0 pb-0 ">
  <button
    type="submit"
    className="w-full thmbtn py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-md"
  >
    Save & Continue
  </button>
</div>
    </form>
  );
}
