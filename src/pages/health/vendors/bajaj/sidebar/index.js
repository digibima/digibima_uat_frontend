"use client";

import React, { useState, useEffect, useRef } from "react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import { showSuccess, showError } from  "@/layouts/toaster";
import InsureSidebarComponent from "./editmember";
import EditIllnessComponent from "./editillness";
import { CallApi } from "../../../../../api";
import constant from "../../../../../env";
import { useRouter } from "next/navigation";

const SlidePanel = ({
  isSlideOpen,
  setIsSlideOpen,
  pincode,
  memberName,
  setPincode,
  setMemberName,
}) => {
  const [showPincodePanel, setShowPincodePanel] = useState(false);
  const [showMemberPanel, setShowMemberPanel] = useState(false);
  const [showIllnessPanel, setShowIllnessPanel] = useState(false);
  const [cities, setCities] = useState({});
  const [error, setError] = useState("");
  const [displayedPincode, setDisplayedPincode] = useState(pincode);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const pincodeRef = useRef();
   const router = useRouter();

  const handleCloseAll = () => {
    setShowPincodePanel(false);
    setShowMemberPanel(false);
    setShowIllnessPanel(false);
    setIsSlideOpen(false);
    setCities({});
    setError("");
  };
    useEffect(() => {
   setDisplayedPincode(pincode)
  }, [pincode]);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pincodeRef.current && !pincodeRef.current.contains(e.target)) {
        setCities({});
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCities = async (cleaned) => {
    if (/^\d{5,6}$/.test(cleaned)) {
      try {
        const res = await CallApi(constant.API.HEALTH.PINCODE, "POST", {
          pincode: cleaned,
        });
        setCities(res);
        setError("");
      } catch (err) {
        setCities({});
        setError("Error fetching city list. Try again.");
        setIsButtonEnabled(false);
      }
    } else {
      setCities({});
    }
  };

  const handleCityClick = (pin) => {
    setDisplayedPincode(pin);
    setPincode(pin);
    setCities({});
    setIsButtonEnabled(true);
  };
const updatePincode = async () => {
  if (!isButtonEnabled) return;

  setLoading(true);
  try {
    const res = await CallApi(
      constant.API.HEALTH.UPDATEPINCODE,
      "POST",
      { findpincode: displayedPincode }
    );
    if (res?.status) {
      showSuccess("Pincode updated successfully!");
      router.push(constant.ROUTES.HEALTH.PLANS);
    } else {
      showError(res?.message || "Failed to update pincode. Try again.");
    }
  } catch (error) {
    console.error("UPDATEPINCODE Error:", error);
    showError("Something went wrong while updating pincode.");
  } finally {
    setLoading(false);
    handleCloseAll();
  }
};


  return (
    <div className="md:col-span-3">
      <div className="bg-white border rounded-[30px] shadow-md p-4">
        <div className="text-base font-semibold text-[gray-800] mb-1">
          Members Covered
        </div>
        <div
          className="text-sm text-[#3ACC22] cursor-pointer underline hover:text-blue-800"
          onClick={() => setIsSlideOpen(true)}
        >
          Edit Members
        </div>
      </div>

      {isSlideOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-sm h-full shadow-2xl px-3 py-6 relative rounded-l-xl transition-transform duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              {showPincodePanel || showMemberPanel || showIllnessPanel ? (
                <button
                  onClick={() => {
                    setShowPincodePanel(false);
                    setShowMemberPanel(false);
                    setShowIllnessPanel(false);
                  }}
                  className="text-blue-800"
                >
                  <ArrowBackIcon />
                </button>
              ) : (
                <div />
              )}
              <h2 className="text-lg font-semibold text-blue-900">
                {showPincodePanel
                  ? "Change Pincode"
                  : showMemberPanel
                  ? "Edit Insured Member"
                  : showIllnessPanel
                  ? "Edit Illness"
                  : "Edit Your Search"}
              </h2>
              <button
                onClick={handleCloseAll}
                className="text-gray-500 hover:text-red-500"
              >
                <CloseIcon />
              </button>
            </div>

            {!showPincodePanel && !showMemberPanel && !showIllnessPanel && (
              <div className="divide-y divide-gray-200">
                <div
                  className="flex items-center justify-between py-4 cursor-pointer"
                  onClick={() => setShowMemberPanel(true)}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-2 rounded-full">
                      <PersonIcon className="text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Insured Members</p>
                      <p className="font-medium text-gray-800">{memberName}</p>
                    </div>
                  </div>
                  <ChevronRightIcon className="text-gray-400" />
                </div>

                <div
                  className="flex items-center justify-between py-4 cursor-pointer"
                  onClick={() => setShowPincodePanel(true)}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-2 rounded-full">
                      <LocationOnIcon className="text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pincode</p>
                      <p className="font-medium text-gray-800">
                        {displayedPincode || pincode}
                      </p>
                    </div>
                  </div>
                  <ChevronRightIcon className="text-gray-400" />
                </div>
                <div
                  className="flex items-center justify-between py-4 cursor-pointer"
                  onClick={() => setShowIllnessPanel(true)}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-2 rounded-full">
                      <HealthAndSafetyIcon className="text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Medical History</p>
                      <p className="font-medium text-gray-800">Edit Illness</p>
                    </div>
                  </div>
                  <ChevronRightIcon className="text-gray-400" />
                </div>
              </div>
            )}

            {showPincodePanel && (
              <div ref={pincodeRef} className="relative">
                <div className="mb-3">
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Enter Pincode
                  </label>
                  <input
                    type="text"
                    value={displayedPincode} 
                    maxLength={6}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "");
                      setPincode(cleaned);
                      setDisplayedPincode(cleaned);
                      fetchCities(cleaned);
                      setIsButtonEnabled(false);
                    }}
                    className="w-full border rounded-md px-4 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  {error && (
                    <p className="text-red-600 text-xs mt-1">{error}</p>
                  )}
                </div>

                {Object.keys(cities).length > 0 && (
                  <div className="absolute z-10 bg-white border rounded-md shadow-lg w-full mt-1 max-h-40 overflow-y-auto">
                    {Object.entries(cities).map(([pin, city]) => (
                      <div
                        key={pin}
                        onClick={() => handleCityClick(pin)}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 cursor-pointer"
                      >
                        {pin} - ({city})
                      </div>
                    ))}
                  </div>
                )}

               <div className="mt-8">
                  <button
                    onClick={updatePincode}
                    disabled={!isButtonEnabled || loading}
                    className={`w-full px-6 py-2 thmbtn ${
                      !isButtonEnabled || loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Processing..." : "Continue"}
                  </button>
                </div>


              </div>
            )}

            {showMemberPanel && (
              <InsureSidebarComponent onClose={handleCloseAll} />
            )}
            {showIllnessPanel && (
              <EditIllnessComponent onClose={handleCloseAll} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SlidePanel;
