"use client";
import { useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { CallApi } from "../../../../../api";
import constant from "../../../../../env";
import { showSuccess, showError } from "@/layouts/toaster";
import { FiChevronDown, FiChevronUp } from "react-icons/fi"; 

export default function AddOnSelection({
  coverAmount,
  addons = {},
  addonsDes = {},
  compulsoryAddons = [],
  defaultAddons = [],
  selectedAddons = [],
  fullAddonsName = {},
  getCheckoutData,
  setApplyClicked,
  setIsAddOnsModified,
}) {

  const [expandedTabs, setExpandedTabs] = useState({
    default: true,
    optional: true,
    discount: true,
  });

  const toggleTab = (tabName) => {
    setExpandedTabs((prev) => ({ ...prev, [tabName]: !prev[tabName] }));
  };

  const parsedSelected = useMemo(() => {
    const arr = Array.isArray(selectedAddons)
      ? selectedAddons
      : typeof selectedAddons === "string" && selectedAddons.startsWith("[")
      ? JSON.parse(selectedAddons)
      : Object.values(selectedAddons || []);

    const result = {};
    for (const item of arr) {
      if (addons[item]) result[item] = "";
      else {
        let base = item,
        val = "";
        const numMatch = String(item).match(/^([A-Za-z]+)(\d+)$/);
        const rrMatch = String(item).match(/^([A-Z]{2})([A-Z0-9]+)$/i);
        if (numMatch) [base, val] = [numMatch[1], numMatch[2]];
        else if (rrMatch) [base, val] = [rrMatch[1], rrMatch[2]];
        result[base] = val || "";
      }
    }
    return result;
  }, [selectedAddons, addons]);

  const parsedDefaults = useMemo(() => {
    const out = {};
    if (!defaultAddons) return out;

    if (Array.isArray(defaultAddons)) {
      for (const item of defaultAddons) {
        let base = String(item),
          val = "";
        const numMatch = base.match(/^([A-Za-z]+)(\d+)$/);
        const rrMatch = base.match(/^([A-Z]{2})([A-Z0-9]+)$/i);
        if (numMatch) [base, val] = [numMatch[1], numMatch[2]];
        else if (rrMatch) [base, val] = [rrMatch[1], rrMatch[2]];
        out[base] = (val || "").toUpperCase();
      }
      return out;
    }

    for (const [k, v] of Object.entries(defaultAddons || {})) {
      if (v == null) continue;
      let val = String(v).trim();
      const parenIdx = val.indexOf("(");
      if (parenIdx > 0) val = val.slice(0, parenIdx).trim();
      val = val.split(" ")[0].trim();
      out[k] = val.toUpperCase();
    }
    return out;
  }, [defaultAddons]);

  const lockedDefaultKeys = useMemo(() => {
    const map = {};
    Object.keys(parsedDefaults || {}).forEach((base) => {
      const match = Object.keys(addons || {}).find(
        (k) => k.toLowerCase() === base.toLowerCase()
      );
      if (match) map[match] = true;
    });
    return map;
  }, [parsedDefaults, addons]);

  const initialSelected = useMemo(() => {
    const hasSelected =
      (Array.isArray(selectedAddons) && selectedAddons.length > 0) ||
      (typeof selectedAddons === "string" &&
        selectedAddons.startsWith("[") &&
        JSON.parse(selectedAddons || "[]").length > 0) ||
      (!!selectedAddons &&
        typeof selectedAddons === "object" &&
        Object.keys(selectedAddons).length > 0);

    return hasSelected ? parsedSelected : parsedDefaults;
  }, [selectedAddons, parsedSelected, parsedDefaults]);

  const default_Addons = useMemo(() => {
    const map = {};
    for (const key of Object.keys(addons)) {
      map[key] = Object.keys(initialSelected).some(
        (sel) => sel.toLowerCase() === key.toLowerCase()
      );
    }
    return map;
  }, [addons, initialSelected]);

  const { register, handleSubmit, control, setValue, reset, getValues } =
    useForm({
      defaultValues: { addons: default_Addons },
    });

  const watchedAddons = useWatch({ control, name: "addons" });

  useEffect(() => {
    const next = { addons: default_Addons };
    if (JSON.stringify(getValues().addons) !== JSON.stringify(next.addons)) {
      reset(next);
    }
  }, [default_Addons, reset, getValues]);

  useEffect(() => {
    for (const [base, val] of Object.entries(initialSelected)) {
      const match = Object.keys(addons).find(
        (k) => k.toLowerCase() === base.toLowerCase()
      );
      if (!match) continue;

      setValue(`addons.${match}`, true);
      if (Array.isArray(addons[match])) {
        setValue(`${match}addonvalue`, (val || "").toUpperCase());
      }
    }
  }, [initialSelected, addons, setValue]);

  useEffect(() => {
    if (initialSelected?.RR) return;

    const rrOptions = addons["RR"];
    if (!rrOptions || !Array.isArray(rrOptions)) return;

    let defaultRR = "";
    if (coverAmount >= 3 && coverAmount <= 10) defaultRR = "SPA";
    else if (coverAmount > 10) defaultRR = "ACTUAL";
    else defaultRR = "";

    const current = getValues("RRaddonvalue");

    if (!current || current !== defaultRR) {
      if (defaultRR) {
        setValue("addons.RR", true);
        setValue("RRaddonvalue", defaultRR);
      } else {
        setValue("addons.RR", false);
        setValue("RRaddonvalue", "");
      }
    }
  }, [coverAmount, addons, getValues, setValue, initialSelected]);

  useEffect(() => {
    const defaults = {
      ped: "3",
      prhe: "60",
      phe: "90",
      sdwp: "2",
    };

    Object.entries(defaults).forEach(([key, val]) => {
      if (initialSelected?.[key]) return;

      const options = addons[key];
      if (!Array.isArray(options)) return;

      const currentVal = getValues(`${key}addonvalue`);
      const isChecked = getValues(`addons.${key}`);

      if (!currentVal && !isChecked) {
        setValue(`addons.${key}`, true);
        setValue(`${key}addonvalue`, String(val));
      }
    });
  }, [addons, getValues, setValue, initialSelected]);

  const [loading, setLoading] = useState(false);
  const [changed, setChanged] = useState(false);

  const onSubmit = async (data) => {
    try {
      const addonsData = data.addons || {};
      const selectedKeys = [];

      for (const [key, checked] of Object.entries(addonsData)) {
        if (checked) {
          const options = addons[key];
          const val = data[`${key}addonvalue`];
          if (["addon23", "addon24", "addon25"].includes(key)) {
            selectedKeys.push(key);
            continue;
          }

          if (Array.isArray(options) && options.length > 0 && !val) {
            showError(
              `Please select a value for ${fullAddonsName[key] || key}.`
            );
            return;
          }

          selectedKeys.push(val ? key + val : key);
        }
      }

      if (!changed) {
        showError("Please modify at least one add-on before applying.");
        return;
      }

      const payload = { addon: [...new Set(selectedKeys)] };

      setLoading(true);
      await CallApi(constant.API.HEALTH.BAJAJ.ADDADDONS, "POST", payload);
      showSuccess("Add-Ons applied successfully.");
      getCheckoutData?.();
      setApplyClicked?.(true);
      setIsAddOnsModified?.(false);
      setChanged(false);
    } catch (error) {
      console.error("Apply failed:", error);
      showError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const displayAddOns = Object.entries(addons).filter(
    ([k]) => !compulsoryAddons.includes(k) || k.toLowerCase() === "ncb"
  );

  const categorizedAddOns = useMemo(() => {
    const defaultList = [];
    const discountList = [];
    const optionalList = [];

    const discountKeys = ["smartTenure"];

    displayAddOns.forEach(([key, price]) => {
      const isLocked = !!lockedDefaultKeys[key];
      
      if (isLocked) {
        defaultList.push([key, price]);
      } else if (discountKeys.includes(key) || key.toLowerCase().includes("discount")) {
        discountList.push([key, price]);
      } else {
        optionalList.push([key, price]);
      }
    });

    return { defaultList, discountList, optionalList };
  }, [displayAddOns, lockedDefaultKeys]);

  if (!displayAddOns.length)
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

  const renderAddOnCard = ([key, price]) => {
    const hasDropdown =
      Array.isArray(price) &&
      price.length > 0 &&
      !["addon23", "addon24", "addon25"].includes(key);

    const isLocked = !!lockedDefaultKeys[key];
    const isAddonActive = watchedAddons?.[key] || false;

    return (
      <div key={key} className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-violet-200">
        
        {/* CARD CONTENT ROW */}
        <div className="flex items-center justify-between gap-6 p-5">
          {/* LEFT SIDE */}
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-[15px] flex items-center gap-2">
              {fullAddonsName[key] || key}

              {isLocked && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                  Default
                </span>
              )}
            </p>

            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              {addonsDes[key] || "No description available."}
            </p>
          </div>

          <div className="flex items-center gap-5 ml-auto">
            {!hasDropdown && !Array.isArray(price) && (
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
                checked={isAddonActive}
                className="sr-only peer"
                onClick={(e) => {
                  if (isLocked) e.preventDefault();
                }}
                onChange={(e) => {
                  if (isLocked) return;
                  const checked = e.target.checked;

                  setValue(`addons.${key}`, checked);
                  setChanged(true);
                  setIsAddOnsModified?.(true);
                  setApplyClicked?.(false);

                  const initVal = initialSelected?.[key] || "";
                  const firstOpt = Array.isArray(price) ? String(price?.[0] ?? "") : "";

                  setValue(
                    `${key}addonvalue`,
                    checked ? initVal || firstOpt : ""
                  );
                }}
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
              
              <select
                {...register(`${key}addonvalue`)}
                className="flex-1 min-w-[220px] bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                disabled={!isAddonActive}
                defaultValue={getValues(`${key}addonvalue`) || ""}
                onChange={(e) => {
                  setValue(`${key}addonvalue`, e.target.value);
                  setChanged(true);
                  setIsAddOnsModified?.(true);
                  setApplyClicked?.(false);
                }}
              >
                <option value="" disabled>Select</option>
                {price.map((option, i) => {
                  let label = String(option).trim();
                  let value = label.toUpperCase();

                  const match = label.match(/^([A-Za-z0-9._-]+)\s*\(([^)]+)\)/);
                  if (match) {
                    value = match[1].trim().toUpperCase();
                    label = match[2].trim();
                  }

                  if (["ped", "phe", "prhe"].includes(key))
                    label += key === "ped"
                      ? " Year"
                      : " Day" + (option > 1 ? "s" : "");

                  return (
                    <option key={i} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        )}

      </div>
    );
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 border border-gray-100">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-[20px] font-semibold text-gray-900">Add-On Benefits</h2>
            <p className="text-sm text-gray-500">Choose from available add-ons to enhance your plan.</p>
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