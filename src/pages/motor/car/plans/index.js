"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CallApi } from "@/api";
import constant from "@/env";
import { FaChevronLeft, FaCar, FaInfoCircle } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import PaCoverModal from "./pacovermodal";
import AddonModal, { VendorAddonModal } from "./addonmodal";
import UpdateIdvModal from "./updateIdvmodal";
import VendorCard from "./vendorcard";
import VehicleCard from "../../vehicledetails/index";
import { MotorCardSkeleton } from "@/components/loader";
import GotoHealth from "@/components/gotohealth";
import { showError } from "@/layouts/toaster";
import { io } from "socket.io-client";

export default function Plans() {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [IsAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [isCompany, setIsCompany] = useState(false);
  const [paModalOpen, setIsPaModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Tab1");
  const [showAccessories, setShowAccessories] = useState(false);
  const [savingAddons, setSavingAddons] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quoteError, setQuoteError] = useState(false);
  const [planTypes, setPlanTypes] = useState([]);
  const [fullAddonsName, setFullAddonsName] = useState({});
  const [addons, setAddons] = useState([]);
  const [selectedAddon, setSelectedAddon] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [vendorPlans, setVendorPlans] = useState([]);
  const [addAddonModal, setAddAddonModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPlanType, setSelectedPlanType] = useState("");
  const [premiumBackupData, setPremiumBackupData] = useState(null);
  const [idvMin, setIdvMin] = useState(null);
  const [idvMax, setIdvMax] = useState(null);
  const [selectedIdv, setSelectedIdv] = useState(null);
  const [paCoverChecked, setPaCoverChecked] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState([]);
  const [idv, setIdv] = useState();
  const [motortype, setMotorType] = useState([]);
  const [Addonlist, setAddonlist] = useState([]);
  const [compAddonlist, setCompAddonlist] = useState([]);
  const [odAddonlist, setOdAddonlist] = useState([]);
  const [tpAddonlist, setTpAddonlist] = useState([]);
  const [addon115Amount, setAddon115Amount] = useState("");
  const [addon120Amount, setAddon120Amount] = useState("");
  const [currentOdometerReading, setCurrentOdometerReading] = useState("");
  const [insuredNoOfKms, setInsuredNoOfKms] = useState("");
  const [comselectedAddon, setComSelectedAddon] = useState([]);
  const [odselectedAddon, setOdSelectedAddon] = useState([]);
  const [tpselectedAddon, setTpSelectedAddon] = useState([]);
  const [addonDiscount, setAddonDiscount] = useState([]);

  const [changingPlanType, setChangingPlanType] = useState(false);
  const [compared, setCompared] = useState([]);

  // Socket Core States
  const [socketData, setSocketData] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const router = useRouter();

  // ---------- helpers for compare ----------
  const getPlanKey = (plan) =>
    `${String(plan?.vendorId || plan?.vid || plan?.vendorid || "")}|${String(
      plan?.title || plan?.productname || plan?.productName || "",
    )}|${String(plan?.price || plan?.premium || "")}`;

  const isCompared = (plan) =>
    compared.some((p) => getPlanKey(p) === getPlanKey(plan));

  const handleCompareChange = (plan, checked) => {
    setCompared((prev) => {
      const key = getPlanKey(plan);
      const exists = prev.some((p) => getPlanKey(p) === key);

      if (checked) {
        if (exists || prev.length >= 3) return prev;
        const next = [...prev, plan];
        return next;
      } else {
        const next = prev.filter((p) => getPlanKey(p) !== key);
        return next;
      }
    });
  };

  const removeCompared = (plan) =>
    setCompared((prev) =>
      prev.filter((p) => getPlanKey(p) !== getPlanKey(plan)),
    );

  const compareDisabledForOthers = compared.length >= 3;

  const handleCompareCTA = () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("compareType", "car");
        sessionStorage.setItem("comparePlans:car", JSON.stringify(compared));
        sessionStorage.setItem(
          "compareBack",
          window.location.pathname + window.location.search,
        );
      }
      router.push("/compare/category/carcompare");
    } catch (e) {
      console.warn("Compare CTA navigation failed", e);
    }
  };
  // ----------------------------------------

  // 1. Core WebSocket Synchronization Hook
  useEffect(() => {
    const socket = io("https://stage.digibima.com", {
      path: "/socket.io/",
      transports: ["websocket"],
      upgrade: false,
      forceNew: true,
    });
    setSocketData(socket);

    socket.on("connect", () => {
      setSocketId(socket.id);
    });

    socket.on("plan_response", (incoming) => {
      console.log("Stream payload response segment received:", incoming);
      if (!incoming) return;

      const incomingVId = incoming.vendorId || incoming.vid || incoming.vendorid || incoming.value;
      const incomingProduct = String(incoming.productName || incoming.productname || incoming.product || "").toLowerCase().trim();


      if (String(incoming.status) === "0" || incoming.status === false) {
        setVendorPlans((prevPlans) => 
          prevPlans.filter((p) => {
            const currentId = String(p.vid || p.vendorId || p.vendorid || "").trim();
            const currentProduct = String(p.productname || p.productName || p.vendorname || p.title || "").toLowerCase().trim();
            
            if (incomingVId && currentId === String(incomingVId).trim()) return false;
            if (incomingProduct && currentProduct.includes(incomingProduct)) return false;
            return true;
          })
        );
        return;
      }

      let actualPlanObj = { ...incoming };
      if (incoming.data && typeof incoming.data === 'object' && !Array.isArray(incoming.data)) {
        actualPlanObj = { ...incoming.data, ...incoming };
      }

      if (!actualPlanObj.route && incoming.data && incoming.data.route) {
        actualPlanObj.route = incoming.data.route;
      }

      const vId = actualPlanObj.vid || actualPlanObj.vendorId || actualPlanObj.vendorid || actualPlanObj.value;
      const fallbackName = String(actualPlanObj.productname || actualPlanObj.productName || actualPlanObj.vendorname || actualPlanObj.product || "").toLowerCase().trim();

      if (!vId && !fallbackName) return;

      setVendorPlans((prevPlans) => {
        const existsIndex = prevPlans.findIndex((p) => {
          const currentId = String(p.vid || p.vendorId || p.vendorid || "").trim();
          const currentName = String(p.productname || p.productName || p.vendorname || p.title || "").toLowerCase().trim();
          
          if (vId && currentId === String(vId).trim()) return true;
          if (fallbackName && currentName.includes(fallbackName)) return true;
          return false;
        });

        const resolvedId = vId || (existsIndex !== -1 ? (prevPlans[existsIndex].vid || prevPlans[existsIndex].vendorId) : "");
        const dynamicRoute = constant.ROUTES.MOTOR.VENDOR.CAR[String(resolvedId)] || actualPlanObj.route || "";
        const completePlanChunk = { ...actualPlanObj, route: dynamicRoute, socketStatus: "1" }; 

        if (existsIndex !== -1) {
          const updatedPlans = [...prevPlans];
          updatedPlans[existsIndex] = {
            ...updatedPlans[existsIndex],
            ...completePlanChunk
          };
          
          if (completePlanChunk.minrange) setIdvMin(completePlanChunk.minrange);
          if (completePlanChunk.maxrange) setIdvMax(completePlanChunk.maxrange);
          if (completePlanChunk.idv) setIdv(completePlanChunk.idv);
          if (completePlanChunk.selectedvalue || completePlanChunk.idv) {
            setSelectedIdv(completePlanChunk.selectedvalue || completePlanChunk.idv);
          }
          
          return updatedPlans;
        }

        if (completePlanChunk.minrange) setIdvMin(completePlanChunk.minrange);
        if (completePlanChunk.maxrange) setIdvMax(completePlanChunk.maxrange);
        if (completePlanChunk.idv) setIdv(completePlanChunk.idv);
        if (completePlanChunk.selectedvalue || completePlanChunk.idv) {
          setSelectedIdv(completePlanChunk.selectedvalue || completePlanChunk.idv);
        }

        return [...prevPlans, completePlanChunk];
      });

      setLoading(false);
    });

    socket.on("plan_completed", (data) => {
      setLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  useEffect(() => {
    async function getDetails() {
      try {
        setLoading(true);
        const res = await CallApi(constant.API.MOTOR.CAR.PLANS, "GET");
        
        const resData = res?.data ? res.data : res;
        if (!resData) return;

        sessionStorage.setItem(
          "motorcarfullAddonsName",
          JSON.stringify(resData.addons || {}),
        );
        
        if (resData.under === "company") {
          setIsCompany(true);
        }

        const apiSelectedAddons = (resData.selectedaddons || []).map(String);
        setSelectedAddon(apiSelectedAddons);
        setComSelectedAddon(apiSelectedAddons);
        setOdSelectedAddon(apiSelectedAddons);
        setTpSelectedAddon(apiSelectedAddons);

        const planTypeKeys = Object.keys(resData.plantype || {});
        let planType = null;
        if (planTypeKeys.includes("2")) planType = 2;
        else if (planTypeKeys.includes("1")) planType = 1;
        else if (planTypeKeys.includes("3")) planType = 3;
        setSelectedPlanType(planType);

        let addonSource = {};
        if (planType === 2) addonSource = resData.addons || {};
        else if (planType === 1) addonSource = resData.odaddons || {};
        else if (planType === 3) addonSource = resData.tpaddons || {};
        setAddons(
          Object.entries(addonSource).map(([key, label]) => ({
            id: key,
            label: label.trim(),
          })),
        );

        const plantypeObj = resData.plantype || {};
        const plantypeList = Object.entries(plantypeObj).map(
          ([key, label]) => ({
            id: key,
            label,
          }),
        );
        setPlanTypes(plantypeList);

        const vendorArr = resData.vendor || [];
        setFullAddonsName(resData.addons || {});
        const activeVendors = vendorArr.filter((v) => v.isActive === "1");
        setVendorList(activeVendors);

        // ==================== CORE VEHICLE DETAILS FIX ====================
        console.log("resData.vehicledetails", resData.vehicledetails);
        
        if (resData.vehicledetails && typeof resData.vehicledetails === 'object') {
          const normalizedVehicle = {
            ...resData.vehicledetails,
            registration_date: resData.vehicledetails.date || "", 
            reg_date: resData.vehicledetails.date || "",
            regnumber: resData.vehicledetails.regnumber || "",
            brand: resData.vehicledetails.brand || ""
          };
          
          setVehicleDetails(normalizedVehicle); 
        } else {
          setVehicleDetails({});
        }
        // ==================================================================

        const paCover = resData.pacover;
        if (paCover === "1") setPaCoverChecked(true);

        setMotorType(res?.cache || "knowcar");

        setCompAddonlist(
          Object.entries(resData.addons || {}).map(([key, label]) => ({
            id: key,
            label: label.trim(),
          })),
        );
        setOdAddonlist(
          Object.entries(resData.odaddons || {}).map(([key, label]) => ({
            id: key,
            label: label.trim(),
          })),
        );
        setTpAddonlist(
          Object.entries(resData.tpaddons || {}).map(([key, label]) => ({
            id: key,
            label: label.trim(),
          })),
        );
        setAddonDiscount(
          Object.entries(resData.discount || {}).map(([key, label]) => ({
            id: key,
            label: label.trim(),
          })),
        );
      } catch (error) {
        console.error("Error loading plan data:", error);
      } finally {
        if (!socketId) setLoading(false);
      }
    }
    getDetails();
  }, [shouldRefetch, socketId]);

  const getQuote = useCallback(async () => {
    if (!vendorList.length || !socketId) return;
    try {
      setLoading(true);
      setQuoteError(false);
      setVendorPlans([]);

      const socketPayload = vendorList.map((vendorPayload) => {
        const route = constant.ROUTES.MOTOR.VENDOR.CAR[String(vendorPayload.vid)] || "";
        const vendorWithRoute = { 
          ...vendorPayload, 
          route 
        };
        return { data: vendorWithRoute };
      });

      let token = localStorage.getItem("token");
      let options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
        body: JSON.stringify({
          plans: socketPayload,
          socketId: socketId,
          quotetype: "motor",
          deployment: "developement",
        }),
      };

      const api = "https://stage.digibima.com/node-api/motorplans/motor-quotation-generate";
      let response = await fetch(api, options);
      let apiData = await response.json();

      if (!apiData || !apiData.status) {
        setQuoteError(true);
        setLoading(false);
        return;
      }

      if (apiData.data && Array.isArray(apiData.data.plans) && apiData.data.plans.length > 0) {
        const processedPlans = apiData.data.plans.map((p) => {
          const currentId = p.vid || p.vendorId || (p.data && (p.data.vid || p.data.vendorId));
          const route = constant.ROUTES.MOTOR.VENDOR.CAR[String(currentId)] || p.route || (p.data && p.data.route) || "";
          return { ...p, ...(p.data || {}), route, socketStatus: "" };
        });
        
        setVendorPlans(processedPlans);
      }
      
      setLoading(false);

    } catch (error) {
      console.error("Error initiating streaming quote layer:", error);
      setQuoteError(true);
      setLoading(false);
    }
  }, [vendorList, socketId]);

  useEffect(() => {
    if (socketId && vendorList.length > 0) {
      getQuote();
    }
  }, [getQuote, socketId, vendorList]);

  const handleIdvUpdate = async () => {
    try {
      setLoading(true);
      const response = await CallApi(
        constant.API.MOTOR.CAR.UPDATEIDV,
        "POST",
        selectedIdv,
      );
      if (response.status === "1") {
        setIsUpdateModalOpen(false);
        setShouldRefetch((prev) => !prev);
      } else {
        alert("Failed to update IDV");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error updating IDV:", error);
      alert("An error occurred while updating IDV.");
      setLoading(false);
    }
  };

  const handleAddonChange = (id) => {
    const toggleAddon = (prev) => {
      const current = Array.isArray(prev)
        ? [...prev]
        : Object.values(prev || {})
            .filter((v) => v !== 0 && v !== "0")
            .map(String);

      const addonId = String(id);
      if (current.includes(addonId)) {
        return current.filter((x) => x !== addonId);
      }
      return [...current, addonId];
    };

    if (String(selectedPlanType) === "1") {
      setOdSelectedAddon(toggleAddon);
    } else if (String(selectedPlanType) === "2") {
      setSelectedAddon(toggleAddon);
    } else {
      setTpSelectedAddon(toggleAddon);
    }
  };

  const handleSaveAddons = async (addonInputs = {}) => {
    let currentAddons;
    let payloadKey;

    if (String(selectedPlanType) === "1") {
      currentAddons = odselectedAddon;
      payloadKey = "odselectedaddon";
    } else if (String(selectedPlanType) === "3") {
      currentAddons = tpselectedAddon;
      payloadKey = "tpselectedaddon";
    } else {
      currentAddons = selectedAddon;
      payloadKey = "selectedaddon";
    }

    const addonIds = Array.isArray(currentAddons)
      ? currentAddons.map(String)
      : Object.keys(currentAddons || {});
    const presentAddon = addonIds.includes("103") || addonIds.includes("104");
    const requireAddon = addonIds.includes("101");

    if (presentAddon && !requireAddon) {
      showError(
        "Zero / Nil Depreciation cover is mandatory when you select the Consumable Cover/Engine Protector",
      );
      const filteredAddons = addonIds.filter(
        (id) => id !== "103" && id !== "104",
      );
      const newAddons = {};
      filteredAddons.forEach((id) => {
        newAddons[id] = currentAddons[id];
      });

      if (String(selectedPlanType) == 1) setOdSelectedAddon(newAddons);
      else if (String(selectedPlanType) == 3) setTpSelectedAddon(newAddons);
      else setSelectedAddon(newAddons);
      return;
    }

    try {
      setSavingAddons(true);
      const payload = {
        [payloadKey]: addonIds,
        addon115Amount: addonInputs.addon115Amount || "",
        currentOdometerReading: addonInputs.currentOdometerReading || "",
        insuredNoOfKms: addonInputs.insuredNoOfKms || "",
        addon120Amount: addonInputs.addon120Amount || "",
      };
      const res = await CallApi(
        constant.API.MOTOR.CAR.ADDADDONS,
        "POST",
        payload,
      );

      if (res.status) {
        setIsAddonModalOpen(false);
        setShouldRefetch((prev) => !prev);
      } else {
        console.error("Addon update failed:", res);
      }
    } catch (error) {
      console.error("Failed to save addons:", error);
    } finally {
      setSavingAddons(false);
    }
  };

  const handlePlanTypeChange = async (e) => {
    const newPlanType = e.target.value;
    setSelectedPlanType(newPlanType);

    try {
      setChangingPlanType(true);
      setLoading(true);
      setQuoteError(false);
      setVendorPlans([]);

      await CallApi(constant.API.MOTOR.CAR.CHANGEPLAN, "POST", {
        pacover: paCoverChecked ? "1" : "0",
        planetype: newPlanType,
      });

      setShouldRefetch((prev) => !prev);
    } catch (error) {
      console.error("Plan type change failed:", error);
      setQuoteError(true);
      setLoading(false);
    } finally {
      setChangingPlanType(false);
    }
  };

  const handlePaCoverSave = async ({ payload, checked }) => {
    setPaCoverChecked(checked);
    try {
      setLoading(true);
      setVendorPlans([]);
      if (checked) {
        await CallApi(constant.API.MOTOR.CAR.CHANGEPLAN, "POST", {
          pacover: "1",
          planetype: selectedPlanType,
        });
      } else {
        await CallApi(constant.API.MOTOR.CAR.PACOVERREASON, "POST", payload);
      }
      setShouldRefetch((prev) => !prev);
    } catch (error) {
      console.error("Error updating PA Cover:", error);
      setLoading(false);
    }
  };

  const handleSaveAccessories = async (accessoriesPayload) => {
    try {
      const res = await CallApi(
        constant.API.MOTOR.CAR.ACCESSORIES,
        "POST",
        accessoriesPayload,
      );
      if (res.status === "1" || res.status === true) {
        setShouldRefetch((prev) => !prev);
      } else {
        console.error("Accessories update failed:", res);
      }
    } catch (err) {
      console.error("Error while saving accessories:", err);
    }
  };

  const handlePlanSubmit = (plan) => {
    const route = typeof plan === "string" ? plan : plan?.route;
    if (!route) {
      console.warn("No route found for the selected plan.");
      return;
    }
    router.push(route);
  };

  const handleRedirect = () => {
    if (motortype === "knowcar" || motortype === "") {
      router.push(constant.ROUTES.MOTOR.SELECTVEHICLE);
    } else if (motortype === "newcar") {
      router.push(constant.ROUTES.MOTOR.CAR.NEWCAR);
    }
  };

  return (
    <div className="bgcolor p-6 min-h-screen overflow-x-hidden">
      <div className="mb-1">
        <button
          onClick={handleRedirect}
          className="text-blue-700 flex items-center gap-2 mb-4 text-sm font-medium"
        >
          <FaChevronLeft /> Go back to Previous
        </button>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div className="w-full p-6 rounded-3xl shadow-2xl bg-[#fff]">
          <div className="flex flex-col md:flex-row md:items-end gap-5 flex-wrap">
            {/* Plan Type */}
            <div className="flex flex-col w-44">
              <label className="font-semibold text-[#426D98] mb-2 text-sm">
                Plan Type
              </label>
              <select
                className="border border-blue-300 rounded-xl px-4 py-2 text-sm text-[#1f3b57] bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                value={selectedPlanType}
                onChange={handlePlanTypeChange}
              >
                {planTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* PA Cover */}
            <div
              className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#cfe2ff] to-[#d6eaff] rounded-2xl shadow-md hover:shadow-lg transition ${
                isCompany ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
              onClick={() => !isCompany && setIsPaModalOpen(true)}
            >
              <input
                type="checkbox"
                id="pa-cover"
                className="form-checkbox accent-pink-500 h-4 w-4 rounded border border-gray-300"
                checked={paCoverChecked}
                readOnly
                disabled={isCompany}
              />
              <label
                htmlFor="pa-cover"
                className={`text-sm font-medium text-[#1f3b57] ${
                  isCompany ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
              >
                PA Cover
              </label>
              <span className="text-blue-600 text-sm font-bold">
                <FaInfoCircle />
              </span>
            </div>

            {/* IDV Input */}
            <div className="flex items-center gap-2">
              <label className="font-semibold text-[#426D98] text-sm whitespace-nowrap">
                IDV:
              </label>
              <input
                type="text"
                value={idv || ""}
                readOnly
                className="border border-blue-300 rounded-xl px-4 py-2 w-28 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedIdv(idv);
                  setIsUpdateModalOpen(true);
                }}
                className="thmbtn text-white px-6 py-2 rounded-xl"
              >
                Update
              </button>
              <button
                onClick={() => setIsAddonModalOpen(true)}
                className="thmbtn text-white px-6 py-2 rounded-xl"
              >
                Addons
              </button>
            </div>
          </div>
        </div>
      </div>

      <PaCoverModal
        open={paModalOpen}
        onClose={() => setIsPaModalOpen(false)}
        setPaCoverChecked={setPaCoverChecked}
        onSave={handlePaCoverSave}
      />

      <UpdateIdvModal
        open={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        value={selectedIdv}
        setValue={setSelectedIdv}
        min={idvMin}
        max={idvMax}
        onUpdate={handleIdvUpdate}
      />

      <AddonModal
        open={IsAddonModalOpen}
        onClose={() => setIsAddonModalOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        compAddonlist={compAddonlist}
        tpAddonlist={tpAddonlist}
        odAddonlist={odAddonlist}
        addonDiscount={addonDiscount}
        selectedPlanType={selectedPlanType}
        selectedAddon={selectedAddon}
        handleAddonChange={handleAddonChange}
        handleSaveAddons={handleSaveAddons}
        showAccessories={showAccessories}
        setShowAccessories={setShowAccessories}
        onSaveAccessories={handleSaveAccessories}
        addon115Amount={addon115Amount}
        setAddon115Amount={setAddon115Amount}
        currentOdometerReading={currentOdometerReading}
        setCurrentOdometerReading={setCurrentOdometerReading}
        insuredNoOfKms={insuredNoOfKms}
        setInsuredNoOfKms={setInsuredNoOfKms}
        setAddon120Amount={setAddon120Amount}
        addon120Amount={addon120Amount}
        comselectedAddon={comselectedAddon}
        odselectedAddon={odselectedAddon}
        tpselectedAddon={tpselectedAddon}
        savingAddons={savingAddons}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 py-6">
        {/* Left: VendorCard Section (9 columns) */}
        <div className="lg:col-span-9">
          <div className="grid grid-cols-1 gap-6">
            {vendorPlans
              .filter((plan) => {
                
                return plan?.socketStatus === "1";
              })
              .map((plan) => (
                <VendorCard
                  key={plan.vendorId || plan.vid || plan.vendorid || plan.title || Math.random()}
                  data={plan}
                  onAddonsClick={(vendorData) => {
                    setSelectedPlan(vendorData);
                    setAddAddonModal(true);
                  }}
                  handlePlanSubmit={handlePlanSubmit}
                  showCompare={vendorPlans.filter(p => p.socketStatus === "1").length > 1}
                  compared={isCompared(plan)}
                  disableCompare={compareDisabledForOthers && !isCompared(plan)}
                  onCompareChange={(checked) =>
                    handleCompareChange(plan, checked)
                  }
                />
              ))}
            
            {(loading || changingPlanType || vendorPlans.filter(p => p.socketStatus === "1").length === 0) &&
              Array.from({
                length: Math.max(1, Math.min(3, (vendorList.length || 3) - vendorPlans.filter(p => p.socketStatus === "1").length)),
              }).map((_, idx) => <MotorCardSkeleton key={`skeleton-${idx}`} />)}

            {!loading && vendorPlans.filter(p => p.socketStatus === "1").length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-10">
                No Plans Available
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm p-6 text-sm sticky top-6 mb-10">
            {vehicleDetails && Object.keys(vehicleDetails).length > 0 && (motortype === "knowcar" || motortype === "newcar") && (
              <VehicleCard
                vehicleDetails={vehicleDetails}
                title={motortype === "knowcar" ? "Private Car" : "New Car"}
                icon={<FaCar className="text-blue-600 text-xl" />}
              />
            )}
          </div>
          <GotoHealth />
        </div>
      </div>

      <VendorAddonModal
        isOpen={addAddonModal}
        fullAddonsName={fullAddonsName}
        onClose={() => {
          setAddAddonModal(false);
          setSelectedPlan(null);
        }}
        selectedPlan={selectedPlan}
      />

      {compared.length > 0 && (
        <div className="fixed right-4 bottom-4 z-50 w-80 max-w-[88vw] rounded-xl shadow-2xl bg-white border border-gray-200">
          <div className="px-4 py-3 border-b">
            <h3 className="text-sm font-semibold text-gray-800">
              Compare Plans
            </h3>
          </div>

          <div className="max-h-72 overflow-y-auto px-3 py-2 space-y-2">
            {compared.map((p) => (
              <div
                key={getPlanKey(p)}
                className="flex items-center gap-3 rounded-lg border border-gray-100 px-2 py-2"
              >
                <div className="h-10 w-10 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                  {p?.logo ? (
                    <img
                      src={`${constant.BASE_URL}/front/logo/${p.logo}`}
                      alt={p.productname || p.productName || "logo"}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-gray-500">No Logo</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {p?.title || p?.productname || p?.productName || p?.vendorname || "—"}
                  </div>
                  <div className="text-xs text-gray-600">
                    ₹{" "}
                    {(p?.price || p?.premium)?.toLocaleString?.("en-IN") || "-"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeCompared(p)}
                  className="p-1 rounded hover:bg-gray-100"
                  aria-label="Remove"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}

            {compared.length < 3 && (
              <div className="text-center text-[11px] font-semibold text-gray-400 mt-2">
                SELECT UPTO {3 - compared.length} MORE PLAN
                {3 - compared.length > 1 ? "S" : ""} TO COMPARE
              </div>
            )}
          </div>

          <div className="p-3">
            <button
              type="button"
              onClick={handleCompareCTA}
              disabled={compared.length < 2}
              className={`w-full px-4 py-2 thmbtn ${
                compared.length >= 2 ? "" : "opacity-60 cursor-not-allowed"
              }`}
            >
              Compare Plans
            </button>
          </div>
        </div>
      )}
    </div>
  );
}