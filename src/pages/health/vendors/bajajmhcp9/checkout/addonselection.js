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
  setGlobalLoading,
  isLoading = false,
}) {
  console.log("addons", addons);
  console.log("defaultAddons", defaultAddons);

  // --- Accordion States ---
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
      if (addons[item]) {
        result[item] = "";
      } else {
        let base = item,
          val = "";
        
        const foundMatchKey = Object.keys(addons).find(k => String(item).startsWith(k));
        
        if (foundMatchKey) {
          base = foundMatchKey;
          val = String(item).slice(foundMatchKey.length);
        } else {
          const numMatch = String(item).match(/^([A-Za-z]+)(\d+)$/);
          const rrMatch = String(item).match(/^([A-Z]{2})([A-Z0-9]+)$/i);
          if (numMatch) [base, val] = [numMatch[1], numMatch[2]];
          else if (rrMatch) [base, val] = [rrMatch[1], rrMatch[2]];
        }
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
        
        const foundMatchKey = Object.keys(addons).find(k => base.startsWith(k));
        if (foundMatchKey) {
          base = foundMatchKey;
          val = base.slice(foundMatchKey.length);
        } else {
          const numMatch = base.match(/^([A-Za-z]+)(\d+)$/);
          const rrMatch = base.match(/^([A-Z]{2})([A-Z0-9]+)$/i);
          if (numMatch) [base, val] = [numMatch[1], numMatch[2]];
          else if (rrMatch) [base, val] = [rrMatch[1], rrMatch[2]];
        }
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
  }, [defaultAddons, addons]);

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

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    getValues,
  } = useForm({
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
        setValue(`${match}addonvalue`, String(val || ""));
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

    const isAddonInSelected = (addonKey) => {
      return Object.keys(initialSelected).some(
        (k) => k.toLowerCase() === addonKey.toLowerCase()
      );
    };

    Object.entries(defaults).forEach(([key, val]) => {
      if (isAddonInSelected(key)) return;

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

      const nonDropdownAddons = [
        "addon23", "addon24", "addon25", "ageShield","addonFetalFlourish", "pConsumables", 
        "consumablesPlus", "pProcedureWiseSubLimit", "doubleSumInsuredBenefit", 
        "healthLimitless", "instaShield", "nRInsure", "smartTenure", 
        "stepUpBenefit", "costOfPrescribedExternalMedicalAid",
        "pSuperCumulativeBonusOption100-200", "pCumulativeBonusOptions10-100"
      ];

      for (const [key, checked] of Object.entries(addonsData)) {
        if (checked) {
          const options = addons[key];
          const val = data[`${key}addonvalue`];
          
          if (nonDropdownAddons.includes(key)) {
            selectedKeys.push(key);
            continue;
          }

          if (Array.isArray(options) && options.length > 0 && !val) {
            showError(`Please select a value for ${fullAddonsName[key] || key}.`);
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
      setGlobalLoading?.(true);
      await CallApi(constant.API.HEALTH.BAJAJMHCP9.ADDADDONS, "POST", payload);
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
      setGlobalLoading?.(false);
    }
  };

  const hiddenDropdownOnlyAddons = [
    "asthma", "diabetes", "hypertension", "hyperlipidaemia", 
    "hypothyroidism", "obesity", "noneOfTheAbove", "polcov52",
  ];

  const displayAddOns = Object.entries(addons).filter(
    ([k]) => k && k.trim() !== "" && !hiddenDropdownOnlyAddons.includes(k)
  );

  const categorizedAddOns = useMemo(() => {
    const defaultList = [];
    const discountList = [];
    const optionalList = [];


    const discountKeys = ["pDeductable", "nRInsure", "polcovvolntrycp"]; 

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

  if (isLoading || !displayAddOns.length) {
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
           <div key={i} className="border rounded-2xl p-4 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center animate-pulse">
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

  const renderAddOnCard = ([key, price]) => {
    const isCumulative = key === "cumulative";
    const dropdownOptions = key === "polcov51" ? addons?.polcov52 || [] : price;

    const hasDropdown =
      Array.isArray(dropdownOptions) &&
      dropdownOptions.length > 0 &&
      ![
        "addon23", "addon24", "addon25", "consumablesPlus", 
        "pProcedureWiseSubLimit", "doubleSumInsuredBenefit", "pConsumables","addonFetalFlourish", 
        "healthLimitless", "ageShield", "nRInsure", "smartTenure", 
        "stepUpBenefit", "costOfPrescribedExternalMedicalAid",
        "pSuperCumulativeBonusOption100-200", "pCumulativeBonusOptions10-100"
      ].includes(key);

    const isLocked = !!lockedDefaultKeys[key];

    const isAddonActive = watchedAddons?.[key] || false;

    return (
      <div key={key} className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-violet-200">
        <div className="px-5 py-4">
          <div className="flex items-start justify-between gap-5">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center shrink-0">
                <span className="text-violet-600 text-lg">🛡️</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[15px] font-semibold text-slate-900">
                    {key === "cumulative" ? "Unlimited Protection" : (fullAddonsName[key] || key)}
                  </h3>
                  {isLocked && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium border border-emerald-200">
                      Included
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                  {addonsDes[key] || "No description available."}
                </p>
              </div>
            </div>

            <label className="relative inline-flex cursor-pointer shrink-0">
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
                  const exclusiveAddons = ["addon23", "addon25", "smartTenure"];

                  if (checked && exclusiveAddons.includes(key)) {
                    exclusiveAddons.forEach((addon) => {
                      if (addon !== key) {
                        setValue(`addons.${addon}`, false);
                        setValue(`${addon}addonvalue`, "");
                      }
                    });
                  }

                  setValue(`addons.${key}`, checked);
                  setChanged(true);
                  setIsAddOnsModified?.(true);
                  setApplyClicked?.(false);

                  const initVal = initialSelected?.[key] || "";
                  const firstOpt =
                    key === "instaShield" ? "asthma" :
                    key === "polcov51" ? "IndOption1" :
                    Array.isArray(dropdownOptions) ? String(dropdownOptions?.[0] ?? "") : "";

                  setValue(`${key}addonvalue`, checked ? String(initVal || firstOpt) : "");
                }}
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-violet-600 transition"></div>
              <div className="absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white shadow-md transition-all peer-checked:translate-x-5"></div>
            </label>
          </div>
        </div>

        {isAddonActive && (isCumulative || hasDropdown) && (
          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 animate-fadeIn">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="text-[12px] text-slate-600 font-medium min-w-[120px]">Choose Duration</label>
              {isCumulative && (
                <select
                  {...register("cumulativeaddonvalue")}
                  disabled={!isAddonActive}
                  className="flex-1 min-w-[220px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm shadow-sm focus:border-violet-400"
                >
                  <option value="">Select</option>
                  {price.typeOptions.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {hasDropdown && !isCumulative && (
                <select
                  {...register(`${key}addonvalue`)}
                  disabled={!isAddonActive}
                  defaultValue={getValues(`${key}addonvalue`) || ""}
                  onChange={(e) => {
                    setValue(`${key}addonvalue`, e.target.value);
                    setChanged(true);
                    setIsAddOnsModified?.(true);
                    setApplyClicked?.(false);
                  }}
                  className="flex-1 min-w-[220px] bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm shadow-sm focus:border-violet-400"
                >
                  <option value="" disabled>Select Option</option>
                  {(key === "instaShield"
                    ? ["asthma", "diabetes", "hypertension", "hyperlipidaemia", "hypothyroidism", "obesity", "noneOfTheAbove"]
                    : dropdownOptions
                  ).map((option, i) => {
                    let label = String(option).trim();
                    let value = String(option).trim();

                    if (option === "") {
                      label = "Consumables Plus";
                      value = "consumablesPlus";
                    }

                    const match = label.match(/^([A-Za-z0-9._-]+)\s*\(([^)]+)\)/);
                    if (match) {
                      value = match[1].trim().toUpperCase();
                      label = match[2].trim();
                    }

                    if (["ped", "phe", "prhe"].includes(key)) {
                      label += key === "ped" ? " Year" : " Day" + (option > 1 ? "s" : "");
                    }

                    return (
                      <option key={i} value={value}>{label}</option>
                    );
                  })}
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