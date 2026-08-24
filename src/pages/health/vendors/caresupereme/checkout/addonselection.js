"use client";
import { useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import { CallApi } from "../../../../../api";
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
}) {
  const OPD_VALUES = useMemo(() => ({ base: "opd", plus: "opdp" }), []);
  const IC_VALUES = useMemo(() => ({ base: "ic", plus: "icp" }), []);
  const CS_VALUES = useMemo(() => ({ base: "cs", plus: "csp" }), []);
  const NCB_VALUES = useMemo(() => ({ base: "ncb", plus: "cbb" }), []);

  // --- Accordion States ---
  const [expandedTabs, setExpandedTabs] = useState({
    default: true,
    optional: true,
    discount: true,
  });

  const toggleTab = (tabName) => {
    setExpandedTabs((prev) => ({ ...prev, [tabName]: !prev[tabName] }));
  };

  const normalizedAddons = useMemo(() => {
    let arr;
    if (Array.isArray(selectedAddons)) arr = selectedAddons;
    else if (
      typeof selectedAddons === "string" &&
      selectedAddons.startsWith("[")
    ) {
      try {
        arr = JSON.parse(selectedAddons);
      } catch {
        arr = [];
      }
    } else {
      arr = Object.values(selectedAddons || {});
    }
    return arr.map(String).filter(Boolean);
  }, [selectedAddons]);

  const pedDefaultValue = useMemo(() => {
    if (normalizedAddons.includes("1")) return "1";
    if (normalizedAddons.includes("2")) return "2";
    return "";
  }, [normalizedAddons]);

  const icDefaultValue = useMemo(() => {
    if (normalizedAddons.includes(IC_VALUES.plus)) return IC_VALUES.plus;
    if (
      normalizedAddons.includes(IC_VALUES.base) ||
      normalizedAddons.includes("ic")
    )
      return IC_VALUES.base;
    return "";
  }, [normalizedAddons, IC_VALUES.base, IC_VALUES.plus]);

  const csDefaultValue = useMemo(() => {
    if (normalizedAddons.includes(CS_VALUES.plus)) return CS_VALUES.plus;
    if (
      normalizedAddons.includes(CS_VALUES.base) ||
      normalizedAddons.includes("cs")
    )
      return CS_VALUES.base;
    return "";
  }, [normalizedAddons, CS_VALUES.base, CS_VALUES.plus]);

  const opdDefaultValue = useMemo(() => {
    if (normalizedAddons.includes(OPD_VALUES.plus)) return OPD_VALUES.plus;
    if (
      normalizedAddons.includes(OPD_VALUES.base) ||
      normalizedAddons.includes("opd")
    )
      return OPD_VALUES.base;
    return "";
  }, [normalizedAddons, OPD_VALUES.base, OPD_VALUES.plus]);

  const ncbDefaultValue = useMemo(() => {
    if (normalizedAddons.includes(NCB_VALUES.plus)) return NCB_VALUES.plus;
    if (
      normalizedAddons.includes(NCB_VALUES.base) ||
      normalizedAddons.includes("ncb") ||
      compulsoryAddons.includes("ncb")
    )
      return NCB_VALUES.base;
    return "";
  }, [normalizedAddons, compulsoryAddons, NCB_VALUES.base, NCB_VALUES.plus]);

  const defaultAddons = useMemo(() => {
    const map = Object.keys(addons).reduce((acc, key) => {
      const lower = key.toLowerCase();
      if (lower === "ped") {
        acc.ped =
          normalizedAddons.includes("ped") ||
          normalizedAddons.includes("1") ||
          normalizedAddons.includes("2");
      } else if (lower === "ic") {
        acc.ic =
          normalizedAddons.includes("ic") ||
          normalizedAddons.includes(IC_VALUES.base) ||
          normalizedAddons.includes(IC_VALUES.plus);
      } else if (lower === "cs") {
        acc.cs =
          normalizedAddons.includes("cs") ||
          normalizedAddons.includes(CS_VALUES.base) ||
          normalizedAddons.includes(CS_VALUES.plus);
      } else if (lower === "opd") {
        acc.opd =
          normalizedAddons.includes("opd") ||
          normalizedAddons.includes(OPD_VALUES.base) ||
          normalizedAddons.includes(OPD_VALUES.plus);
      } else if (lower === "ncb") {
        acc.ncb =
          compulsoryAddons.includes("ncb") ||
          normalizedAddons.includes("ncb") ||
          normalizedAddons.includes(NCB_VALUES.base) ||
          normalizedAddons.includes(NCB_VALUES.plus);
      } else {
        acc[key] = normalizedAddons.includes(String(key));
      }
      return acc;
    }, {});

    if (!("ped" in map))
      map.ped =
        normalizedAddons.includes("ped") ||
        normalizedAddons.includes("1") ||
        normalizedAddons.includes("2");
    if (!("ic" in map))
      map.ic =
        normalizedAddons.includes("ic") ||
        normalizedAddons.includes(IC_VALUES.base) ||
        normalizedAddons.includes(IC_VALUES.plus);
    if (!("cs" in map))
      map.cs =
        normalizedAddons.includes("cs") ||
        normalizedAddons.includes(CS_VALUES.base) ||
        normalizedAddons.includes(CS_VALUES.plus);
    if (!("opd" in map))
      map.opd =
        normalizedAddons.includes("opd") ||
        normalizedAddons.includes(OPD_VALUES.base) ||
        normalizedAddons.includes(OPD_VALUES.plus);
    if (!("ncb" in map))
      map.ncb =
        compulsoryAddons.includes("ncb") ||
        normalizedAddons.includes("ncb") ||
        normalizedAddons.includes(NCB_VALUES.base) ||
        normalizedAddons.includes(NCB_VALUES.plus);

    return map;
  }, [
    addons,
    normalizedAddons,
    compulsoryAddons,
    IC_VALUES.base,
    IC_VALUES.plus,
    CS_VALUES.base,
    CS_VALUES.plus,
    OPD_VALUES.base,
    OPD_VALUES.plus,
    NCB_VALUES.base,
    NCB_VALUES.plus,
  ]);

  const { register, handleSubmit, control, setValue, reset, getValues } =
    useForm({
      defaultValues: {
        addons: defaultAddons,
        pedaddonvalue: pedDefaultValue,
        icaddonvalue: icDefaultValue,
        csaddonvalue: csDefaultValue,
        opdaddonvalue: opdDefaultValue,
        ncbaddonvalue: ncbDefaultValue,
      },
    });

  useEffect(() => {
    const nextDefaults = {
      addons: defaultAddons,
      pedaddonvalue: pedDefaultValue,
      icaddonvalue: icDefaultValue,
      csaddonvalue: csDefaultValue,
      opdaddonvalue: opdDefaultValue,
      ncbaddonvalue: ncbDefaultValue,
    };
    const cur = getValues();
    const same =
      JSON.stringify(cur?.addons || {}) ===
        JSON.stringify(nextDefaults.addons) &&
      cur?.pedaddonvalue === nextDefaults.pedaddonvalue &&
      cur?.icaddonvalue === nextDefaults.icaddonvalue &&
      cur?.csaddonvalue === nextDefaults.csaddonvalue &&
      cur?.opdaddonvalue === nextDefaults.opdaddonvalue &&
      cur?.ncbaddonvalue === nextDefaults.ncbaddonvalue;

    if (!same) reset(nextDefaults);
  }, [
    defaultAddons,
    pedDefaultValue,
    icDefaultValue,
    csDefaultValue,
    opdDefaultValue,
    ncbDefaultValue,
    reset,
    getValues,
  ]);

  const [hasUserChanged, setHasUserChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  const watchedAddonsMap = useWatch({
    control,
    name: "addons",
    defaultValue: defaultAddons,
  });

  const pedChecked = watchedAddonsMap?.ped;
  const icChecked = watchedAddonsMap?.ic;
  const csChecked = watchedAddonsMap?.cs;
  const opdChecked = watchedAddonsMap?.opd;
  const ncbChecked = watchedAddonsMap?.ncb;

  const isPedSelected = !!pedChecked;
  const isIcSelected = !!icChecked;
  const isCsSelected = !!csChecked;
  const isOpdSelected = !!opdChecked;
  const isNcbSelected = !!ncbChecked;

  const onSubmit = async (data) => {
    let selectedKeys = [];
    const addonsData = data.addons || {};
    const isPed = addonsData.ped;
    const isIc = addonsData.ic;
    const isCs = addonsData.cs;
    const isOpd = addonsData.opd;
    const isNcb = addonsData.ncb;
    const pedValue = data.pedaddonvalue;
    const icValue = data.icaddonvalue;
    const csValue = data.csaddonvalue;
    const opdValue = data.opdaddonvalue;
    const ncbValue = data.ncbaddonvalue;

    if (isPed && isIc) {
      showError("Please select only one option between PED and IC.");
      return;
    }

    Object.entries(addonsData).forEach(([key, checked]) => {
      if (checked && !["ped", "ic", "cs", "opd", "ncb"].includes(key)) {
        selectedKeys.push(key);
      }
    });
    if (!hasUserChanged) {
      showError("Please modify at least one add-on before applying.");
      return;
    }
    if (isPed) {
      if (!pedValue)
        return showError(
          "Please select a value for PED Wait Period Modification.",
        );
      if (["1", "2"].includes(pedValue)) selectedKeys.push("ped", pedValue);
    } else {
      selectedKeys = selectedKeys.filter((v) => v !== "1" && v !== "2");
    }

    if (isIc) {
      if (!icValue)
        return showError("Please select a value for Instant Cover.");
      if ([IC_VALUES.base, IC_VALUES.plus].includes(icValue))
        selectedKeys.push("ic", icValue);
    }

    if (isCs) {
      if (!csValue) return showError("Please select a value for Claim Shield.");
      if ([CS_VALUES.base, CS_VALUES.plus].includes(csValue))
        selectedKeys.push("cs", csValue);
    }

    if (isOpd) {
      if (!opdValue) return showError("Please select a value for OPD.");
      if ([OPD_VALUES.base, OPD_VALUES.plus].includes(opdValue))
        selectedKeys.push("opd", opdValue);
    }

    if (isNcb) {
      if (!ncbValue)
        return showError("Please select a value for No Claim Bonus.");
      if ([NCB_VALUES.base, NCB_VALUES.plus].includes(ncbValue))
        selectedKeys.push("ncb", ncbValue);
    }

    const removeIfPlusPresent = (arr, base, plus) => {
      return arr.includes(plus) ? arr.filter((item) => item !== base) : arr;
    };

    let filteredKeys = [...selectedKeys];

    filteredKeys = removeIfPlusPresent(filteredKeys, "ic", "icp");
    filteredKeys = removeIfPlusPresent(filteredKeys, "cs", "csp");
    filteredKeys = removeIfPlusPresent(filteredKeys, "opd", "opdp");
    filteredKeys = [...new Set(filteredKeys)];
    const payload = { addon: filteredKeys };
    try {
      setLoading(true);
      await CallApi(
        constant.API.HEALTH.CARESUPEREME.ADDADDONS,
        "POST",
        payload,
      );
      setApplyClicked?.(true);
      setIsAddOnsModified?.(false);
      getCheckoutData?.();
      showSuccess("Add-Ons applied successfully.");
      setHasUserChanged(false);
    } catch (error) {
      console.error("Apply failed:", error);
      showError("Failed to apply add-ons.");
    } finally {
      setLoading(false);
    }
  };

  const displayAddOns = Object.entries(addons).filter(([key]) => {
    return !compulsoryAddons.includes(key) || key.toLowerCase() === "ncb";
  });

  // --- TAB CATEGORIZATION LOGIC ---
  const categorizedAddOns = useMemo(() => {
    const defaultList = [];
    const discountList = [];
    const optionalList = [];

    const discountKeys = ["smartTenure"];

    displayAddOns.forEach(([key, price]) => {
      const lower = key.toLowerCase();
      const isCompulsory = compulsoryAddons.includes(key);

      if (isCompulsory && lower !== "ncb") {
        defaultList.push([key, price]);
      } else if (discountKeys.includes(key) || lower.includes("discount")) {
        discountList.push([key, price]);
      } else {
        optionalList.push([key, price]);
      }
    });

    return { defaultList, discountList, optionalList };
  }, [displayAddOns, compulsoryAddons]);

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

  const renderAddOnCard = ([key, price]) => {
    const lower = key.toLowerCase();
    const isPED = lower === "ped";
    const isIC = lower === "ic";
    const isCS = lower === "cs";
    const isOPD = lower === "opd";
    const isNCB = lower === "ncb";

    const isAddonActive = watchedAddonsMap?.[key] || false;
    const hasDropdown = isPED || isIC || isCS || isOPD || isNCB;

    return (
      <div
        key={key}
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-violet-200"
      >
        <div className="flex items-center justify-between gap-6 p-5 bg-white">
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-[15px]">
              {fullAddonsName[key] || key}
            </p>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              {addonsDes[key] || "No description available."}
            </p>
          </div>

          <div className="flex items-center gap-5 ml-auto">
            {!hasDropdown && (
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
                disabled={(isPED && isIcSelected) || (isIC && isPedSelected)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setValue(`addons.${key}`, checked);

                  setHasUserChanged(true);
                  setIsAddOnsModified?.(true);
                  setApplyClicked?.(false);

                  if (checked) {
                    if (key === "ped") setValue("pedaddonvalue", "1");
                    else if (key === "ic") setValue("icaddonvalue", "ic");
                    else if (key === "cs") setValue("csaddonvalue", "csp");
                    else if (key === "opd") setValue("opdaddonvalue", "opd");
                    else if (key === "ncb") setValue("ncbaddonvalue", "ncb");
                  }
                }}
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-purple-600 transition peer-focus:ring-2 peer-focus:ring-purple-500"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow"></div>
            </label>
          </div>
        </div>

        {hasDropdown && isAddonActive && (
          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 transition-all animate-fadeIn">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="text-[12px] text-slate-600 font-medium min-w-[120px]">
                Choose Option
              </label>

              <select
                {...register(
                  isPED
                    ? "pedaddonvalue"
                    : isIC
                      ? "icaddonvalue"
                      : isCS
                        ? "csaddonvalue"
                        : isOPD
                          ? "opdaddonvalue"
                          : "ncbaddonvalue",
                )}
                disabled={
                  !(isPED
                    ? isPedSelected
                    : isIC
                      ? isIcSelected
                      : isCS
                        ? isCsSelected
                        : isOPD
                          ? isOpdSelected
                          : isNcbSelected)
                }
                className="flex-1 min-w-[220px] bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                defaultValue={
                  isPED
                    ? pedDefaultValue
                    : isIC
                      ? icDefaultValue
                      : isCS
                        ? csDefaultValue
                        : isOPD
                          ? opdDefaultValue
                          : ncbDefaultValue
                }
                onChange={() => {
                  setHasUserChanged(true);
                  setIsAddOnsModified?.(true);
                  setApplyClicked?.(false);
                }}
              >
                <option value="" disabled>
                  Select
                </option>

                {isPED && (
                  <>
                    <option value="1">1 Year</option>
                    <option value="2">2 Years</option>
                  </>
                )}
                {isIC && (
                  <>
                    <option value="ic">Instant Cover</option>
                    <option value="icp">Instant Cover Advanced</option>
                  </>
                )}
                {isCS && (
                  <>
                    <option value="csp">Claim Shield Plus</option>
                  </>
                )}
                {isOPD && (
                  <>
                    <option value="opd">OPD</option>
                    <option value="opdp">OPD Plus</option>
                  </>
                )}
                {isNCB && (
                  <>
                    <option value="ncb">CB Super</option>
                    <option value="cbb">CB Booster</option>
                  </>
                )}
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
        {/* Header */}
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
                Applying{" "}
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              </>
            ) : (
              "Apply"
            )}
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
                <span>
                  Default Add-Ons ({categorizedAddOns.defaultList.length})
                </span>
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
                <span>
                  Optional Add-Ons ({categorizedAddOns.optionalList.length})
                </span>
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
                <span>
                  Discount Add-Ons ({categorizedAddOns.discountList.length})
                </span>
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
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 thmbtn gap-2"
          >
            {loading ? (
              <>
                Applying{" "}
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
