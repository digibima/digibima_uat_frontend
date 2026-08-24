"use client";
import { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  CallApi,
  deleteDBData,
  storeDBData,
  getDBData,
} from "../../../../../api";
import constant from "../../../../../env";
import { showSuccess, showError } from "@/layouts/toaster";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

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
  coverage,
}) {
  const [expandedTabs, setExpandedTabs] = useState({
    default: true,
    optional: true,
    discount: true,
  });

  const toggleTab = (tabName) => {
    setExpandedTabs((prev) => ({ ...prev, [tabName]: !prev[tabName] }));
  };

  const normalizedAddons = useMemo(() => {
    return Array.isArray(selectedAddons)
      ? selectedAddons
      : typeof selectedAddons === "string" && selectedAddons.startsWith("[")
        ? JSON.parse(selectedAddons)
        : Object.values(selectedAddons || {});
  }, [selectedAddons]);

  const pedDefaultValue = normalizedAddons.includes("1")
    ? "1"
    : normalizedAddons.includes("2")
      ? "2"
      : "";

  const opdToken = (normalizedAddons || []).find((a) =>
    /^opd(500|5000|plus)$/i.test(String(a)),
  );

  const opdDefaultValue = opdToken
    ? String(opdToken).replace(/opd/i, "")
    : normalizedAddons.includes("500")
      ? "500"
      : normalizedAddons.includes("5000")
        ? "5000"
        : "";

  const initialAddons = useMemo(() => {
    const map = {};
    Object.keys(addons || {}).forEach((k) => {
      map[k] = normalizedAddons.includes(k);
    });
    map.ped = normalizedAddons.includes("ped");
    map.opd = Boolean(opdToken) || normalizedAddons.includes("opd");
    return map;
  }, [addons, normalizedAddons, opdToken]);

  const { register, handleSubmit, control, setValue, reset, getValues } = useForm({
    defaultValues: {
      addons: initialAddons,
      pedaddonvalue: pedDefaultValue,
      opdaddonvalue: opdDefaultValue,
    },
  });

  const [hasUserChanged, setHasUserChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  const watchedAddonsMap = useWatch({
    control,
    name: "addons",
    defaultValue: initialAddons,
  });

  const pedChecked = watchedAddonsMap?.ped;
  const icChecked = watchedAddonsMap?.ic;
  const opdChecked = watchedAddonsMap?.opd;

  useEffect(() => {
    const nextAddons = {};
    Object.keys(addons || {}).forEach((k) => {
      nextAddons[k] = normalizedAddons.includes(k);
    });

    nextAddons.ped = normalizedAddons.includes("ped");

    const nextOpdToken = (normalizedAddons || []).find((a) =>
      /^opd(500|5000|plus)$/i.test(String(a)),
    );

    nextAddons.opd = Boolean(nextOpdToken) || normalizedAddons.includes("opd");

    const nextPedVal = normalizedAddons.includes("1")
      ? "1"
      : normalizedAddons.includes("2")
        ? "2"
        : "";

    const nextOpdVal = nextOpdToken
      ? String(nextOpdToken).replace(/opd/i, "")
      : normalizedAddons.includes("500")
        ? "500"
        : normalizedAddons.includes("5000")
          ? "5000"
          : "";

    reset({
      addons: nextAddons,
      pedaddonvalue: nextPedVal,
      opdaddonvalue: nextOpdVal,
    });
  }, [reset, addons, selectedAddons, normalizedAddons]);

  useEffect(() => {
    if (opdToken) {
      setValue("addons.opd", true, { shouldDirty: false });
      setValue("opdaddonvalue", String(opdToken).replace(/opd/i, ""), {
        shouldDirty: false,
      });
    }

    if (normalizedAddons.includes("ped")) {
      setValue("addons.ped", true, {shouldDirty: false });
      setValue("pedaddonvalue", pedDefaultValue, { shouldDirty: false });
    }
  }, [opdToken, normalizedAddons, pedDefaultValue, setValue]);

  const onSubmit = async (data) => {
    let selectedKeys = [];
    const addonsData = data.addons || {};

    const isPedChecked = addonsData.ped;
    const pedValue = data.pedaddonvalue;

    const isOpdChecked = addonsData.opd;
    const opdValue = data.opdaddonvalue;

    Object.entries(addonsData).forEach(([key, checked]) => {
      if (checked && key !== "ped" && key !== "opd") {
        selectedKeys.push(key);
      }
    });

    if (!hasUserChanged) {
      showError("Please modify at least one add-on before applying.");
      return;
    }
    if (isPedChecked && addonsData.ic) {
      return showError("You can select either PED or IC, not both.");
    }

    if (isPedChecked) {
      if (!pedValue)
        return showError(
          "Please select a value for PED Wait Period Modification.",
        );

      if (["1", "2"].includes(pedValue)) {
        selectedKeys.push("ped", pedValue);
      }
    } else {
      selectedKeys = selectedKeys.filter((val) => val !== "1" && val !== "2");
    }

    if (isOpdChecked) {
      if (!opdValue) return showError("Please select a value for OPD.");

      if (["500", "5000", "plus"].includes(opdValue)) {
        selectedKeys.push(`opd${opdValue}`);
        selectedKeys = selectedKeys.filter(
          (val) => val !== "opd" && val !== "500" && val !== "5000",
        );
      }
    } else {
      selectedKeys = selectedKeys.filter(
        (val) =>
          !/^opd(500|5000)$/i.test(String(val)) &&
          val !== "500" &&
          val !== "5000",
      );
    }

    try {
      setLoading(true);

      const payload = { addon: selectedKeys };

      await CallApi(
        constant.API.HEALTH.ULTIMATECARE.ADDADDONS,
        "POST",
        payload,
      );

      await deleteDBData(constant.DBSTORE.HEALTH.ULTIMATE.ULTIMATECHECKOUTDATA);

      if (getCheckoutData) await getCheckoutData();

      setApplyClicked?.(true);
      setIsAddOnsModified?.(false);

      showSuccess("Add-Ons applied successfully.");
      setHasUserChanged(false);
    } catch (error) {
      console.error("Apply failed:", error);
      showError("Failed to apply add-ons.");
    } finally {
      setLoading(false);
    }
  };

  const optionalAddOns = Object.entries(addons).filter(([key]) => {
    if (String(coverage).toLowerCase() === "unlimited") {
      if (["tm", "uc", "ib"].includes(key)) {
        return false;
      }
    }

    return !compulsoryAddons.includes(key);
  });

  const categorizedAddOns = useMemo(() => {
    const defaultList = [];
    const discountList = [];
    const optionalList = [];

    const discountKeys = ["smartTenure"];

    optionalAddOns.forEach(([key, price]) => {
      if (discountKeys.includes(key) || key.toLowerCase().includes("discount")) {
        discountList.push([key, price]);
      } else {
        optionalList.push([key, price]);
      }
    });

    return { defaultList, discountList, optionalList };
  }, [optionalAddOns]);

  if (isSkeletonLoading || optionalAddOns.length === 0) {
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

  const safeDesObj = addonsDes || {};

  const renderAddOnCard = ([key, price]) => {
    const lowerKey = String(key).toLowerCase();
    const isPED = lowerKey === "ped";
    const isOPD = lowerKey === "opd";

    const rowDesc =
      safeDesObj[lowerKey] ||
      safeDesObj[key] ||
      "No description available.";

    const isAddonActive = watchedAddonsMap?.[key] || false;
    const hasDropdown = isPED || isOPD;

    return (
      <div key={key} className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-violet-200">
        <div className="px-5 py-4 flex items-center justify-between gap-6">
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-[15px]">
              {fullAddonsName[key] || key}
            </p>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              {rowDesc}
            </p>
          </div>

          <div className="flex items-center gap-5 ml-auto">
            {!isPED && !isOPD && (
              <div className="text-right">
                <p className="text-[11px] text-gray-400 -mb-1">Premium</p>
                <p className="text-lg font-bold text-gray-900">
                  ₹{Number(price).toLocaleString()}
                </p>
              </div>
            )}

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register(`addons.${key}`)}
                className="sr-only peer"
                checked={isAddonActive}
                onChange={(e) => {
                  setValue(`addons.${key}`, e.target.checked);
                  setHasUserChanged(true);
                  setIsAddOnsModified?.(true);
                  setApplyClicked?.(false);
                }}
                disabled={
                  (key === "ped" && icChecked) ||
                  (key === "ic" && pedChecked)
                }
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-purple-600 transition"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow"></div>
            </label>
          </div>
        </div>

        {hasDropdown && isAddonActive && (
          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 transition-all animate-fadeIn">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="text-[12px] text-slate-600 font-medium min-w-[120px]">Choose Option</label>
              
              {/* PED DROPDOWN */}
              {isPED && (
                <select
                  {...register("pedaddonvalue")}
                  disabled={!pedChecked || icChecked}
                  className="flex-1 min-w-[220px] bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm focus:border-purple-500"
                  onChange={() => {
                    setHasUserChanged(true);
                    setIsAddOnsModified?.(true);
                    setApplyClicked?.(false);
                  }}
                >
                  <option value="" disabled>Select</option>
                  <option value="1">1 Year</option>
                  <option value="2">2 Years</option>
                </select>
              )}

              {/* OPD DROPDOWN */}
              {isOPD && (
                <select
                  {...register("opdaddonvalue")}
                  disabled={!opdChecked}
                  className="flex-1 min-w-[220px] bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm focus:border-purple-500"
                  onChange={() => {
                    setHasUserChanged(true);
                    setIsAddOnsModified?.(true);
                    setApplyClicked?.(false);
                  }}
                >
                  <option value="" disabled>Select</option>
                  <option value="500">₹500</option>
                  <option value="5000">₹5000</option>
                  <option value="plus">OPD Plus</option>
                </select>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 border border-gray-100">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-[20px] font-semibold text-gray-900">Add-On Benefits</h2>
            <p className="text-sm text-gray-500">Enhance your coverage with smart add-ons.</p>
          </div>

          <button type="submit" className="px-6 py-2 thmbtn" disabled={loading}>
            {loading ? (
              <>Applying <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span></>
            ) : ("Apply")}
          </button>
        </div>

        <div className="space-y-4">
          
          {categorizedAddOns.defaultList.length > 0 && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => toggleTab("default")}
                className="w-full flex justify-between items-center bg-slate-50 px-5 py-4 font-semibold text-slate-800 text-sm md:text-base border-b border-slate-200"
              >
                <span>Default Add-Ons ({categorizedAddOns.defaultList.length})</span>
                <span className="text-xl text-slate-500 transition-transform duration-200">
                  {expandedTabs.default ? <FiChevronUp /> : <FiChevronDown />}
                </span>
              </button>
              {expandedTabs.default && (
                <div className="p-4 space-y-4 bg-white transition-all">
                  {categorizedAddOns.defaultList.map(renderAddOnCard)}
                </div>
              )}
            </div>
          )}

          {categorizedAddOns.optionalList.length > 0 && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => toggleTab("optional")}
                className="w-full flex justify-between items-center bg-slate-50 px-5 py-4 font-semibold text-slate-800 text-sm md:text-base border-b border-slate-200"
              >
                <span>Optional Add-Ons ({categorizedAddOns.optionalList.length})</span>
                <span className="text-xl text-slate-500 transition-transform duration-200">
                  {expandedTabs.optional ? <FiChevronUp /> : <FiChevronDown />}
                </span>
              </button>
              {expandedTabs.optional && (
                <div className="p-4 space-y-4 bg-white transition-all">
                  {categorizedAddOns.optionalList.map(renderAddOnCard)}
                </div>
              )}
            </div>
          )}

          {categorizedAddOns.discountList.length > 0 && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => toggleTab("discount")}
                className="w-full flex justify-between items-center bg-slate-50 px-5 py-4 font-semibold text-slate-800 text-sm md:text-base border-b border-slate-200"
              >
                <span>Discount Add-Ons ({categorizedAddOns.discountList.length})</span>
                <span className="text-xl text-slate-500 transition-transform duration-200">
                  {expandedTabs.discount ? <FiChevronUp /> : <FiChevronDown />}
                </span>
              </button>
              {expandedTabs.discount && (
                <div className="p-4 space-y-4 bg-white transition-all">
                  {categorizedAddOns.discountList.map(renderAddOnCard)}
                </div>
              )}
            </div>
          )}

        </div>

        <div className="mt-6 flex justify-end">
          <button type="submit" className="px-6 py-2 thmbtn flex items-center justify-center gap-2" disabled={loading}>
            {loading ? (
              <>Applying <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span></>
            ) : ("Apply")}
          </button>
        </div>
      </form>
    </div>
  );
}