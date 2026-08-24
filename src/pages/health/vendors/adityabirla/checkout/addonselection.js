"use client";
import { useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { CallApi,deleteDBData, } from "../../../../../api";
import constant from "../../../../../env";
import { showSuccess, showError } from "@/layouts/toaster";

export default function AddOnSelection({
  addons = {},
  addonsDes = {},
  compulsoryAddons = [],
  selectedAddons = [],
  fullAddonsName = {},
  getCheckoutData,
  setApplyClicked,
  setIsAddOnsModified,
  isSkeletonLoading = false,
}) {
  console.log("addons",addons)
  console.log("selectedAddons",selectedAddons)
  console.log("compulsoryAddons",compulsoryAddons)




    const defaultAddons = useMemo(() => {
      return Object.keys(addons).reduce((acc, key) => {
        acc[key] = !!selectedAddons?.[key];
        return acc;
      }, {});
    }, [addons, selectedAddons]);
    const defaultDropdownValues = useMemo(() => ({
      RIPW: selectedAddons?.RIPW || "",
      PCDED: selectedAddons?.PCDED || "",
      RRTO: selectedAddons?.RRTO || "UPTOSI",
    }), [selectedAddons]);

      const { register, handleSubmit, control, setValue, reset, getValues, watch } =
        useForm({
        defaultValues: {
    addons: defaultAddons,
    dropdownValues: defaultDropdownValues,
    },
    });

  useEffect(() => {
   const nextDefaults = {
    addons: defaultAddons,
    dropdownValues: defaultDropdownValues,
    };
    const cur = getValues();
   const same =
   JSON.stringify(cur?.addons || {}) === JSON.stringify(nextDefaults.addons);
     
    if (!same) reset(nextDefaults);
  }, [
    defaultAddons,
     defaultDropdownValues,
    reset,
    getValues,
  ]);

  const [hasUserChanged, setHasUserChanged] = useState(false);
  const [loading, setLoading] = useState(false);


const onSubmit = async (data) => {
  let selectedKeys = [];

  const addonsData = data.addons || {};
  const dropdownData = data.dropdownValues || {};

  Object.entries(addonsData).forEach(([key, value]) => {
    if (!value) return;

    if (["RRTO", "PCDED", "RIPW"].includes(key)) {
      selectedKeys.push(key, dropdownData[key]);
    } else {
      selectedKeys.push(key);
    }
  });

  if (!hasUserChanged) {
    showError("Please modify at least one add-on before applying.");
    return;
  }

  const payload = { addon: selectedKeys };

  try {
    setLoading(true);

    await CallApi(
      constant.API.HEALTH.ADITYABIRLA.ADDADDONS,
      "POST",
      payload
    );
    await deleteDBData(constant.DBSTORE.HEALTH.ADITYABIRLA.ABIRLACHECKOUTDATA);

    setApplyClicked?.(true);
    setIsAddOnsModified?.(false);
    getCheckoutData?.();

    showSuccess("Add-Ons applied successfully.");
    setHasUserChanged(false);
  } catch (error) {
    showError("Failed to apply add-ons.");
  } finally {
    setLoading(false);
  }
};
  const displayAddOns = Object.entries(addons).filter(([key]) => {
    return !compulsoryAddons.includes(key) || key.toLowerCase() === "ncb";
  });
  if (isSkeletonLoading || displayAddOns.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 px-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="h-4 w-24 bg-gray-300 rounded animate-pulse mb-2" />
            <div className="h-3 w-72 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-8 w-20 bg-purple-200 rounded-full animate-pulse" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="border rounded-2xl p-4 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center animate-pulse"
          >
            <div className="flex-1 pr-4">
              <div className="h-4 w-40 bg-gray-300 rounded mb-2" />
              <div className="h-3 w-64 bg-gray-200 rounded" />
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mt-4 md:mt-0">
              <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl min-w-[120px]">
                <div className="h-10 w-16 bg-gray-300 rounded" />
                <div className="h-4 w-4 bg-gray-300 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 border border-gray-100">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-[20px] font-semibold text-gray-900">
              Add-On Benefits
            </h2>
            <p className="text-sm text-gray-500">
              Enhance your coverage with smart add-ons.
            </p>
          </div>

          <button type="submit" disabled={loading} className="px-6 py-2 thmbtn">
            {loading ? (
              <>
                Applying
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              </>
            ) : (
              "Apply"
            )}
          </button>
        </div>

        <div className="space-y-4">
          {displayAddOns.map(([key, price]) => {          
            const showDropdown = ["RRTO", "PCDED", "RIPW"].includes(key);

            return (
              <div
                key={key}
                className="
                flex items-center justify-between gap-6
                p-5 bg-white border rounded-xl 
                hover:border-purple-300 
              "
              >
                {/* LEFT CONTENT */}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-[15px]">
                    {fullAddonsName[key] || key}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    {addonsDes[key] || "No description available."}
                  </p>
                </div>

                <div className="flex items-center gap-5 ml-auto">
                  {!showDropdown && (
                    <div className="text-right">
                      <p className="text-[11px] text-gray-400 -mb-1">Premium</p>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{Number(price).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {showDropdown && (
                    <select
                      {...register(`dropdownValues.${key}`, {
                        onChange: (e) => {
                          setValue(`dropdownValues.${key}`, e.target.value);
                          setHasUserChanged(true);
                          setApplyClicked?.(false);
                        },
                      })}
                      disabled={!watch(`addons.${key}`)}
                      className="px-4 py-2 border border-gray-300 rounded-lg 
                      text-sm bg-white focus:ring-1 
                      focus:ring-purple-500 focus:border-purple-500
                      transition-all w-36 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <option value="">Select</option>

                      {key === "RIPW" && (
                        <>
                          <option value="3TO1">3 Years to 1 Year</option>
                          <option value="3TO2">3 Years to 2 Years</option>
                        </>
                      )}

                      {key === "PCDED" && (
                        <>
                          <option value="15000">15000</option>
                          <option value="25000">25000</option>
                        </>
                      )}

                      {key === "RRTO" && (
                        <>
                           <option value="SH">Shared Accommodation</option>
                        <option value="YSY">Single Private Room</option>
                          <option value="UPTOSI">UPTOSI</option>
                        </>
                      )}
                    </select>
                  )}

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register(`addons.${key}`, {
                        onChange: (e) => {
                          setValue(`addons.${key}`, e.target.checked);
                          setHasUserChanged(true);
                          setApplyClicked?.(false);

                          if (e.target.checked && key === "RRTO") {
                            setValue(`dropdownValues.${key}`, "UPTOSI");
                          }

                          if (!e.target.checked && showDropdown) {
                            setValue(`dropdownValues.${key}`, "");
                          }
                        },
                      })}
                      className="sr-only peer"
                    />

                    <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-purple-600 transition"></div>

                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-all"></div>
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 thmbtn gap-2"
          >
            {loading ? (
              <>
                Applying
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              </>
            ) : (
              "Apply"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
