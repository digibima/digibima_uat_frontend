"use client";
import React from "react";
import { FiCheckCircle } from "react-icons/fi";
import Modal from "@/components/modal";

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
  compAddonlist,
  odAddonlist,
  tpAddonlist,
  odselectedAddon,
  tpselectedAddon,
  comselectedAddon,
  savingAddons,
  noMatchAddons
}) {
  // console.log("hello",noMatchAddons)
  //  const noMatchAddons = selectedPlan?.addons?.nomatch || [];
  const [accessoryData, setAccessoryData] = React.useState([
    { type: "electrical", checked: false, amount: "" },
    { type: "non-electrical", checked: false, amount: "" },
    { type: "cng", checked: false, amount: "" },
  ]);

  const handleAccessoryCheck = (type) => {
    setAccessoryData((prev) =>
      prev.map((item) =>
        item.type === type ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleAmountChange = (type, value) => {
    setAccessoryData((prev) =>
      prev.map((item) =>
        item.type === type ? { ...item, amount: value } : item
      )
    );
  };
  const handleConfirm = () => {
    if (activeTab === "Tab1") {
      handleSaveAddons(addon115Amount);
    } else if (activeTab === "Tab2") {
      const accessoriesPayload = accessoryData
        .filter((item) => item.checked && item.amount)
        .map(({ type, amount }) => ({
          type: type.toLowerCase(),
          amount,
        }));

      onSaveAccessories(accessoriesPayload);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Add Addons"
      onConfirm={handleConfirm}
      confirmText="Save Changes"
      showConfirmButton={false}
      showCancelButton={false}
      width="max-w-5xl"
    >
      <div className="w-full">
        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 ${
              activeTab === "Tab1"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-blue-400"
            }`}
            onClick={() => setActiveTab("Tab1")}
          >
            Addons
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "Tab2"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-blue-400"
            }`}
            onClick={() => setActiveTab("Tab2")}
          >
            Accessories
          </button>
        </div>

        {activeTab === "Tab1" && (
          <div>
            <p className="mb-4 text-gray-600">
              Select the addons you&apos;d like to add.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(String(selectedPlanType) == 1
                ? odAddonlist
                : String(selectedPlanType) == 2
                ? compAddonlist
                : tpAddonlist
              )?.map((addon) => {
                const selectedArray =
                  String(selectedPlanType) == 1
                    ? odselectedAddon
                    : String(selectedPlanType) == 2
                    ? selectedAddon
                    : tpselectedAddon;

                return (
                  <div key={addon.id}>
                    <div
                      onClick={() => handleAddonChange(addon.id)}
                      className={`bg-blue-50 hover:bg-blue-100 cursor-pointer flex items-center p-2 rounded-md border ${
                        selectedArray && addon.id in selectedArray
                          ? "border-blue-500"
                          : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedArray && (addon.id in selectedArray)}
                        onChange={() => {}}
                        className="mr-2 form-checkbox accent-pink-500 h-4 w-4 cursor-pointer"
                      />
                      <label className="text-sm font-medium truncate">
                        {addon.label}
                      </label>
                    </div>

                    {addon.id == 115 && selectedArray && (addon.id in selectedArray) && (
                      <input
                        type="number"
                        className="mt-2 p-1 inputcls"
                        placeholder="Enter amount"
                        value={addon115Amount}
                        onChange={(e) => setAddon115Amount(e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => handleSaveAddons(addon115Amount)}
                disabled={savingAddons}
                className="py-2 px-8 thmbtn flex items-center gap-2"
              >
                {savingAddons ? (
                  <>
                    Saving...
                    <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === "Tab2" && (
          <div>
            <p className="mb-4 text-gray-600">
              Choose Your Additional Accessories
            </p>
            <label className="inline-flex items-center mb-4">
              <input
                type="checkbox"
                checked={showAccessories}
                onChange={(e) => setShowAccessories(e.target.checked)}
                className="mr-2 form-checkbox accent-pink-500 h-4 w-4 cursor-pointer"
              />
              <span className="font-medium text-blue-600 cursor-pointer">
                Additional Accessories
              </span>
            </label>

            {showAccessories && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {accessoryData.map((item) => (
                  <div
                    key={item.type}
                    className="bg-blue-50 p-3 rounded-md border"
                  >
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 form-checkbox accent-pink-500 h-4 w-4 cursor-pointer"
                        checked={item.checked}
                        onChange={() => handleAccessoryCheck(item.type)}
                      />
                      <span className="text-sm font-medium capitalize">
                        {item.type}
                      </span>
                    </label>
                    {item.checked && (
                      <input
                        type="text"
                        placeholder="Enter amount"
                        value={item.amount}
                        onChange={(e) =>
                          handleAmountChange(item.type, e.target.value)
                        }
                        className="mt-2 border rounded px-2 py-1 w-full"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

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
          </div>
        )}
      </div>
    </Modal>
  );
}

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
      {addonsData && Object.keys(addonsData).length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(addonsData)
            .filter(([_, price]) => String(price) !== "0")
            .map(([addonId, price]) => (
              <li
                key={addonId}
                className="flex items-start p-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <FiCheckCircle className="text-green-500 mt-1 mr-3" size={20} />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {fullAddonsName[addonId] || `Addon ${addonId}`}
                  </p>
                  <span className="inline-block mt-1 text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
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
