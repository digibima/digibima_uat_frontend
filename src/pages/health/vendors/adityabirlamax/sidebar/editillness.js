"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { showSuccess, showError  } from "@/layouts/toaster";
import { CallApi, getUserinfo } from "../../../../../api";
import constant from "../../../../../env";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

  const selected = watch("data") || [];
  const isNoDiseaseSelected = selected.includes("No Existing Disease");
  const isAnyOtherSelected = selected.some((d) => d !== "No Existing Disease");

  const router = useRouter();

  useEffect(() => {
    const getToken = localStorage.getItem("token");
    if (getToken) {
      const fetchData = async () => {
        try {
          const res = await getUserinfo(getToken);
          const data = await res.json();
          const pedList = JSON.parse(data?.user?.ped || "{}")?.data || [];
          if (data.status) reset({ data: pedList });
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
     saveIllnessMutation.mutate(formData);
  };
  const queryClient = useQueryClient();

const saveIllnessMutation = useMutation({
  mutationFn: (formData) =>
    CallApi(constant.API.HEALTH.SAVEILLNESS, "POST", formData),
  onSuccess: () => {
    showSuccess("Illness details saved.");
    queryClient.invalidateQueries(["checkoutData"]);
    onClose?.();
    router.push(constant.ROUTES.HEALTH.PLANS);
  },
  onError: () => showError("Failed to save illness data."),
});


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-1">
      <h2 className="text-[18px] font-semibold text-blue-900 mb-3">
        Select Existing Illness
      </h2>

      <div className="flex flex-col gap-3">
        {illnesses.map((illness) => {
          const isChecked = selected.includes(illness);
          return (
            <label
              key={illness}
              className={`relative flex justify-between items-center px-4 py-3 bg-white text-black rounded-xl font-medium border ${
                isChecked ? "border border-gray-400" : "border border-gray-400"
              } ${
                isNoDiseaseSelected
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              {illness}
              <input
                type="checkbox"
                value={illness}
                {...register("data")}
                checked={isChecked}
                onChange={() => toggleSelection(illness)}
                disabled={isNoDiseaseSelected}
                className="form-checkbox accent-pink-500 w-4 h-4"
              />
              {isChecked && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-ping opacity-70"></span>
              )}
            </label>
          );
        })}

        <label
          className={`relative flex justify-between items-center px-4 py-3 bg-white text-black rounded-xl font-medium border ${
            selected.includes("No Existing Disease")
              ? "border border-gray-400"
              : "border border-gray-400"
          } ${
            isAnyOtherSelected
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          }`}
        >
          No Existing Disease
          <input
            type="checkbox"
            value="No Existing Disease"
            {...register("data")}
            checked={selected.includes("No Existing Disease")}
            onChange={() => toggleSelection("No Existing Disease")}
            disabled={isAnyOtherSelected}
            className="form-checkbox accent-pink-500 w-4 h-4"
          />
          {selected.includes("No Existing Disease") && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full animate-ping opacity-70"></span>
          )}
        </label>
      </div>

      <button
        type="submit"
        className="w-full thmbtn py-2 mt-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-md"
      >
        Save & Continue
      </button>
    </form>
  );
}
