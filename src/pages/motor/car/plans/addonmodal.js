"use client";
import React from "react";
import Modal from "@/components/modal";
import {
  FiShield,
  FiTruck,
  FiPercent,
  FiTool,
  FiCheckCircle,
  FiLayers,
} from "react-icons/fi";

export default function AddonModal({
  open,
  onClose,
  activeTab,
  setActiveTab,
  addons,
  selectedPlanType,
  selectedAddon,
  handleAddonChange,
  handleSaveAddons,
  showAccessories,
  setShowAccessories,
  onSaveAccessories,
  addon115Amount,
  setAddon115Amount,
  currentOdometerReading,
  setCurrentOdometerReading,
  insuredNoOfKms,
  setInsuredNoOfKms,
  setAddon120Amount,
  addon120Amount,
  compAddonlist,
  odAddonlist,
  tpAddonlist,
  addonDiscount,
  odselectedAddon,
  tpselectedAddon,
  comselectedAddon,
  savingAddons,
}) {
  // console.log("tpselectedAddon",tpselectedAddon)
  // console.log("odselectedAddon",odselectedAddon)
  // console.log("comselectedAddon",comselectedAddon)
  // console.log("selectedAddon",selectedAddon)
  const commonBtnClass =
    "flex items-center justify-center gap-2 min-h-[44px] min-w-[150px] px-5 py-2.5 rounded-2xl text-sm font-semibold backdrop-blur-md border transition-colors duration-300";

  const iconClass = "w-5 h-5 flex items-center justify-center text-lg";
  // ONLY for Comprehensive
  const [compTab, setCompTab] = React.useState("od");

  const [accessoryData, setAccessoryData] = React.useState([
    { type: "electrical", checked: false, amount: "" },
    { type: "non-electrical", checked: false, amount: "" },
    { type: "cng", checked: false, amount: "" },
  ]);

  const handleAccessoryCheck = (type) => {
    setAccessoryData((prev) =>
      prev.map((item) =>
        item.type === type ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const handleAmountChange = (type, value) => {
    setAccessoryData((prev) =>
      prev.map((item) =>
        item.type === type ? { ...item, amount: value } : item,
      ),
    );
  };

  const selectedArray =
    String(selectedPlanType) === "1"
      ? odselectedAddon
      : String(selectedPlanType) === "2"
        ? selectedAddon
        : tpselectedAddon;
  const normalizedSelectedArray = Array.isArray(selectedArray)
    ? selectedArray.map(String)
    : Object.values(selectedArray || {})
        .filter((value) => value !== 0 && value !== "0")
        .map(String);

  // console.log("normalizedSelectedArray", normalizedSelectedArray);
  // ===================== DISCOUNT ADDON IDS (ONLY COMP) =====================
  const discountAddonIds =
    String(selectedPlanType) === "2"
      ? addonDiscount?.map((a) => String(a.id))
      : [];

  const addonList =
    String(selectedPlanType) === "2"
      ? compTab === "od"
        ? odAddonlist?.filter(
            (addon) => !discountAddonIds.includes(String(addon.id)),
          )
        : compTab === "tp"
          ? tpAddonlist
              ?.filter(
                (tpAddon) =>
                  !odAddonlist?.some(
                    (odAddon) => String(odAddon.id) === String(tpAddon.id),
                  ),
              )
              ?.filter((addon) => !discountAddonIds.includes(String(addon.id)))
          : []
      : String(selectedPlanType) === "1"
        ? odAddonlist
        : tpAddonlist;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Add Addons"
      showConfirmButton={false}
      showCancelButton={false}
      width="max-w-5xl"
    >
      <div className="w-full">
        <div className="flex flex-wrap gap-3 mb-6">
          {String(selectedPlanType) === "2" ? (
            <>
              {[
                { key: "od", label: "OD Addons", icon: <FiShield /> },
                { key: "tp", label: "TP Addons", icon: <FiTruck /> },
                { key: "discount", label: "Discount", icon: <FiPercent /> },
                { key: "accessories", label: "Accessories", icon: <FiTool /> },
              ].map((tab) => {
                const isActive = compTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setCompTab(tab.key)}
                    className={`${commonBtnClass} ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg border-transparent"
                        : "bg-white/70 text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    <span
                      className={`${iconClass} ${
                        isActive ? "text-white" : "text-blue-500"
                      }`}
                    >
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                );
              })}
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab("Tab1")}
                className={`${commonBtnClass} ${
                  activeTab === "Tab1"
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg border-transparent"
                    : "bg-white/70 text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <span className={iconClass}>
                  <FiLayers />
                </span>
                Addons
              </button>

              <button
                onClick={() => setActiveTab("Tab2")}
                className={`${commonBtnClass} ${
                  activeTab === "Tab2"
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg border-transparent"
                    : "bg-white/70 text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <span className={iconClass}>
                  <FiTool />
                </span>
                Accessories
              </button>
            </>
          )}
        </div>

        {((String(selectedPlanType) !== "2" && activeTab === "Tab1") ||
          (String(selectedPlanType) === "2" &&
            (compTab === "od" || compTab === "tp"))) && (
          <>
            <p className="mb-4 text-gray-600">
              Select the addons you&apos;d like to add.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {addonList?.map((addon) => {
                const isChecked = normalizedSelectedArray.includes(
                  String(addon.id),
                );

                return (
                  <div key={addon.id}>
                    {/* CARD UI */}
                    <div
                      onClick={() => handleAddonChange(addon.id)}
                      className={`group flex items-center cursor-pointer rounded-2xl border transition-all duration-300
                        p-4 shadow-sm gap-3
                        bg-white/60 backdrop-blur-xl
                        hover:shadow-lg hover:-translate-y-1 hover:bg-white/80
                        ${
                          isChecked
                            ? "border-blue-500/60 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100"
                            : "border-gray-200"
                        }`}
                    >
                      <div
                        className={`h-6 w-6 min-w-[24px] min-h-[24px] flex-shrink-0
                        rounded-lg flex items-center justify-center transition-all duration-300
                        border text-white
                        ${
                          isChecked
                            ? "bg-blue-600 border-blue-700 shadow-md scale-110"
                            : "border-gray-300 bg-white"
                        }
                      `}
                      >
                        {isChecked && <FiCheckCircle size={16} />}
                      </div>

                      <span className="text-sm font-semibold uppercase text-gray-800">
                        {addon.label}
                      </span>
                    </div>

                    {/* Amount input (UNCHANGED LOGIC) */}
                    {addon.id == 115 && isChecked && (
                      <input
                        type="number"
                        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                        placeholder="Enter amount"
                        value={addon115Amount}
                        onChange={(e) => setAddon115Amount(e.target.value)}
                      />
                    )}
                    {addon.id == 125 && isChecked && (
                      <div className="mt-4 space-y-2">
                        <input
                          type="number"
                          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                          placeholder="Enter Current Odometer Reading"
                          value={currentOdometerReading}
                          onChange={(e) =>
                            setCurrentOdometerReading(e.target.value)
                          }
                        />
                        <input
                          type="number"
                          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                          placeholder="Enter Insured No. Of KMs"
                          value={insuredNoOfKms}
                          onChange={(e) => setInsuredNoOfKms(e.target.value)}
                        />
                      </div>
                    )}

                    {addon.id == 120 && isChecked && (
                      <select
                        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                        value={addon120Amount}
                        onChange={(e) => setAddon120Amount(e.target.value)}
                      >
                        <option value="">Select Voluntary Deductible</option>
                        <option value="2500">Rs. 2,500</option>
                        <option value="5000">Rs. 5,000</option>
                        <option value="7500">Rs. 7,500</option>
                        <option value="15000">Rs. 15,000</option>
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ===================== DISCOUNT ===================== */}
        {String(selectedPlanType) === "2" && compTab === "discount" && (
          <>
            <p className="mb-4 text-gray-600">Select discount addons</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {addonDiscount?.map((addon) => {
                const isChecked = normalizedSelectedArray.includes(
                  String(addon.id),
                );

                return (
                  <div key={addon.id}>
                    <div
                      onClick={() => handleAddonChange(addon.id)}
                      className={`group flex items-center cursor-pointer rounded-2xl border transition-all duration-300
                p-4 shadow-sm gap-3
                bg-white/60 backdrop-blur-xl
                hover:shadow-lg hover:-translate-y-1 hover:bg-white/80
                ${
                  isChecked
                    ? "border-blue-500/60 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100"
                    : "border-gray-200"
                }`}
                    >
                      <div
                        className={`h-6 w-6 min-w-[24px] min-h-[24px] flex-shrink-0
                  rounded-lg flex items-center justify-center transition-all duration-300
                  border text-white
                  ${
                    isChecked
                      ? "bg-blue-600 border-blue-700 shadow-md scale-110"
                      : "border-gray-300 bg-white"
                  }`}
                      >
                        {isChecked && <FiCheckCircle size={16} />}
                      </div>

                      <span className="text-sm font-semibold uppercase text-gray-800">
                        {addon.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ===================== ACCESSORIES ===================== */}
        {((String(selectedPlanType) === "2" && compTab === "accessories") ||
          (String(selectedPlanType) !== "2" && activeTab === "Tab2")) && (
          <>
            <p className="mb-4 text-gray-600">
              Choose Your Additional Accessories
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {accessoryData.map((item) => (
                <div
                  key={item.type}
                  onClick={() => handleAccessoryCheck(item.type)}
                  className={`rounded-xl border px-4 py-4 cursor-pointer transition-all
                    ${
                      item.checked
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-6 w-6 min-w-[24px] min-h-[24px] flex-shrink-0
                      rounded-lg flex items-center justify-center transition-all duration-300
                      border text-white
                      ${
                        item.checked
                          ? "bg-blue-600 border-blue-700 shadow-md scale-110"
                          : "border-gray-300 bg-white"
                      }
                    `}
                    >
                      {item.checked && <FiCheckCircle size={16} />}
                    </div>

                    <span className="text-sm font-semibold uppercase text-gray-800">
                      {item.type}
                    </span>
                  </div>

                  {item.checked && (
                    <input
                      type="text"
                      placeholder="Enter amount"
                      value={item.amount}
                      onChange={(e) =>
                        handleAmountChange(item.type, e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Accessories Save (UNCHANGED LOGIC) */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  const accessoriesPayload = accessoryData
                    .filter((item) => item.checked && item.amount)
                    .map(({ type, amount }) => ({
                      type: type.toLowerCase(),
                      amount,
                    }));
                  onSaveAccessories(accessoriesPayload);
                  onClose();
                }}
                className="py-2 px-8 thmbtn"
              >
                Save Changes
              </button>
            </div>
          </>
        )}

        {/* ===================== GLOBAL SAVE (ADDONS) ===================== */}
        {!(
          (String(selectedPlanType) === "2" && compTab === "accessories") ||
          (String(selectedPlanType) !== "2" && activeTab === "Tab2")
        ) && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() =>
                handleSaveAddons({
                  addon115Amount,
                  addon120Amount,
                  currentOdometerReading,
                  insuredNoOfKms,
                })
              }
              disabled={savingAddons}
              className="py-2 px-8 thmbtn flex items-center gap-2"
            >
              {savingAddons ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ===================== VENDOR ADDON MODAL (UNCHANGED) ===================== */

export function VendorAddonModal({
  isOpen,
  onClose,
  selectedPlan,
  fullAddonsName,
}) {
  const addonKeys = ["selectedaddon", "tpselectedaddon", "odselectedaddon"];
  const currentAddonKey = addonKeys.find((key) => selectedPlan?.addons?.[key]);

  const addonsData = currentAddonKey
    ? selectedPlan.addons[currentAddonKey]
    : {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vendor Add-ons"
      showConfirmButton={false}
      showCancelButton={true}
      cancelText="Close"
      width="max-w-5xl"
    >
      {selectedPlan?.package && (
        <div className="mb-4 flex items-center p-3 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
          <FiCheckCircle
            className="text-green-500 mt-1 mr-3"
            size={20}
          />

          <p className="text-sm text-gray-800">
            <span className="font-semibold text-gray-900">
              Package Name :
            </span>{" "}
            <span className="font-bold text-blue-700">
              {selectedPlan.package}
            </span>
          </p>
        </div>
      )}
      {addonsData && Object.keys(addonsData).length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(addonsData)
            .filter(([_, price]) => String(price) !== "0")
            .map(([addonId, price]) => (
              <li
                key={addonId}
                className="flex items-start p-3 bg-white border rounded-xl shadow-sm"
              >
                <FiCheckCircle className="text-green-500 mt-1 mr-3" size={20} />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {fullAddonsName[addonId] || `Addon ${addonId}`}
                  </p>
                  <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                    ₹ {price}
                  </span>
                </div>
              </li>
            ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-600">
          No addons available for this plan.
        </p>
      )}
    </Modal>
  );
}
