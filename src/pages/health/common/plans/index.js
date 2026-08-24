"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { CallApi, CallSocket } from "../../../../api";
import constant from "../../../../env";
import { flushSync } from "react-dom";
import Image from "next/image";
import { io } from "socket.io-client";

import FilterForm from "./filter";
import PlanCard from "./plancard";
import SlidePanel from "../../sidebar";
import { HealthPlanCardSkeleton } from "../../loader";
import { AnimatePresence, motion } from "framer-motion";

import { getDBData, storeDBData, deleteDBData, clearDBData } from "../../../../api";

const normalizeCoverageToLower = (val, list = []) => {
  if (!val) return "";

  // handle unlimited
  if (String(val).toLowerCase() === "unlimited") {
    return "Unlimited";
  }

  // add this condition
  if (Number(val) === 100) {
    return "100";
  }

  if (!Array.isArray(list) || list.length < 2) return "";

  const n = Number(val);
  const arr = [...list].filter(v => !isNaN(Number(v))).sort((a, b) => a - b);
  const idx = arr.indexOf(n);
  if (idx === -1) return "";
  if (idx === arr.length - 1) return String(arr[arr.length - 2]);
  return String(arr[idx]);
};

export default function HealthPlan() {
  const [vendorData, setVendorData] = useState([]);
  const [livePlans, setLivePlans] = useState([]); 
  const [coveragelist, setCoveragelist] = useState([]);
  const [covertypelist, setCovertypelist] = useState({});
  const [tenurelist, setTenurelist] = useState([]);
  const [filters, setFilters] = useState({
    plantype: "",
    coverage: "",
    tenure: "",
    covertype: "",
    porttenure: "",
  });

  const [loadingPlans, setLoadingPlans] = useState(true);
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const [isSlideOpen, setIsSlideOpen] = useState(false);
  const [showPincodePanel, setShowPincodePanel] = useState(false);
  const [showMemberPanel, setShowMemberPanel] = useState(false);
  const [pincode, setPincode] = useState("");
  const [memberName, setMemberName] = useState("");
  const [socketdata, setSocketData] = useState(null);
  const [socketid, setSocketId] = useState(null);

  const [filterChanged, setFilterChanged] = useState(false);
  const [compared, setCompared] = useState([]);

  const originalFiltersRef = useRef({});
  const vendorFetchedRef = useRef(false);
  const isFromCacheRef = useRef(false); 
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm();

  const handleFilterChange = ({ target: { name, value } }) =>
    setFilters((prev) => ({ ...prev, [name]: value }));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("refresh")) {
      (async () => {
        await clearDBData();
        setVendorData([]);
        setLivePlans([]);
        setShouldRefetch((prev) => !prev); 
      })();
    }
  }, []);

  // 1. Socket Initialize Engine Hook
  useEffect(() => {
   const socket = io("https://stage.digibima.com", {
  path: "/socket.io/",
  transports: ["websocket"], 
  upgrade: false,          
  forceNew: true
});
    setSocketData(socket);

    socket.on("connect", () => {
      // console.log("Socket Connected Successfully! ID is:", socket.id);
      setSocketId(socket.id); 
    });

    socket.on("plan_response", (incoming) => {
      console.log("New raw plan data:", incoming);
      
      const actualPlanObj = incoming && incoming.data ? incoming.data : incoming;

      if (!actualPlanObj?.productname || !actualPlanObj?.premium) return;

      setLivePlans((prevPlans) => {
        const exists = prevPlans.some(
          (p) => p?.productname === actualPlanObj?.productname && p?.vendorid === actualPlanObj?.vendorid
        );
        return exists ? prevPlans : [...prevPlans, actualPlanObj];
      });
    });

    socket.on("plan_completed", (data) => {
      // console.log("Saare plans successfully aa chuke hain, loader stopping...", data);
      setLoadingPlans(false); 
      setLivePlans((currentPlans) => {
        return [...currentPlans]; 
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socketid) {
      // console.log("Waiting for socket connection to get ID...");
      return;
    }

    const loadPlanData = async () => {
      try {
        setLoadingPlans(true);
        await new Promise((r) => setTimeout(r, 200));
        
        const cachedVendors = await getDBData(constant.DBSTORE.HEALTH.PLANS.HEALTHPLANVENDOR);
        
        if (cachedVendors && Array.isArray(cachedVendors) && cachedVendors.length) {
          // console.log("Cache Hit: Loading components from IndexedDB");
          isFromCacheRef.current = true; 
          setLivePlans(cachedVendors);
          setLoadingPlans(false);
        } else {
          isFromCacheRef.current = false;
          setLivePlans([]);
        }

        const cachedMaster = await getDBData(constant.DBSTORE.HEALTH.PLANS.HEALTHPLANDATA);
        
        let res = null;
        if (cachedMaster) {
          res = cachedMaster.data ? cachedMaster.data : cachedMaster;
          // console.log("Loaded Master Filters Config from Cache:", res);
        }
        
        let socketPayload = [];
        let verifiedVendorsList = [];

        if (!res) {
          const apiRes = await CallApi(constant.API.HEALTH.PLANDATA);
          res = apiRes?.data ? apiRes.data : apiRes;
          // console.log("res.vendor from master API:", res?.vendor);
        }

        if (res && res.vendor) {
          const vendorDataArray = res.vendor || [];
          
          for (const vendor of vendorDataArray) {
            // Drop dummy/empty configurations entirely
            if (!vendor?.vid || !vendor?.vendorname || vendor?.vendorname === "—") {
              // console.log("Strict Filtering out garbage schema context:", vendor);
              continue; 
            }

            const vidStr = String(vendor.vid);
            const matchedRoute = constant.ROUTES?.HEALTH?.VENDOR?.[vidStr] || "";
            
            const vendorWithRoute = { 
              ...vendor, 
              route: matchedRoute || vendor.route || "" 
            };
            
            socketPayload.push({ data: vendorWithRoute });
            verifiedVendorsList.push(vendorWithRoute); 
          }
        }

        if (!isFromCacheRef.current && socketPayload.length > 0) {
          let token = localStorage.getItem("token");
          console.log("token",token)
          let options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
              "Expires": "0",
            },
            body: JSON.stringify({ plans: socketPayload, socketId: socketid }),
          };

          console.log("Starting Stream with verified verified configurations:", options);

          const api = "https://stage.digibima.com/node-api/healthplans/health-quotation-generate";
          let response = await fetch(api, options);
          let apiData = await response.json();
          console.log("HTTP API stream started response:", apiData);

          if (cachedMaster === null && res) {
            await storeDBData(constant.DBSTORE.HEALTH.PLANS.HEALTHPLANDATA, res);
          }
        }

        if (res) {
          setVendorData(verifiedVendorsList.length > 0 ? verifiedVendorsList : (res.vendor || []));
          
          setCoveragelist(res.coveragelist || []);
          setTenurelist(res.tenurelist || []);
          setCovertypelist(res.covertypelist || {});
          setPincode(res.pincode || "");

          const normalizedCoverage = normalizeCoverageToLower(res.coverage, res.coveragelist);

          const mapPortTenureLabel = (v) => {
            const s = String(v || "").trim();
            if (!s) return "";
            if (s === "1") return "1 Year";
            if (s === "2") return "2 Years";
            return "3 Years & Above";
          };

          setFilters({
            plantype: res.plantype?.toString() || "",
            coverage: normalizedCoverage,
            tenure: res.tenure?.toString() || "",
            covertype: res.covertype?.toString() || "",
            porttenure: mapPortTenureLabel(res.porttenure),
          });

          const allMembers = res.aInsureData || [];
          setMemberName(`Self(${allMembers.length})`);

          originalFiltersRef.current = {
            plantype: res.plantype?.toString() || "",
            coverage: normalizedCoverage,
            tenure: res.tenure?.toString() || "",
            covertype: res.covertype?.toString() || "",
            porttenure: mapPortTenureLabel(res.porttenure),
          };

          setShouldRefetch(false);
        }
      } catch (e) {
        console.error("Error in loadPlanData:", e);
        setLoadingPlans(false);
      }
    };

    loadPlanData();
  }, [shouldRefetch, socketid]);

  useEffect(() => {
    if (!vendorData.length) return;
    if (vendorFetchedRef.current && !shouldRefetch) return;
    if (isFromCacheRef.current) return; 

    if (!loadingPlans && livePlans.length > 0) {
      vendorFetchedRef.current = true;
      (async () => {
        try {
          await storeDBData(constant.DBSTORE.HEALTH.PLANS.HEALTHPLANVENDOR, livePlans);
          // console.log("Successfully cached fully loaded streaming plans into IndexedDB.");
        } catch (err) {
          console.error("Failed to back up plans data:", err);
        }
      })();
    }
  }, [vendorData, shouldRefetch, loadingPlans, livePlans]);

  const normalizeFilterPayload = (f = {}) => ({
    plantype: String(f.plantype || ""),
    coverage: String(f.coverage || ""),
    tenure: String(f.tenure || ""),
    covertype: String(f.covertype || ""),
    porttenure: String(f.porttenure || ""),
  });

  const areFiltersSame = (a, b) =>
    JSON.stringify(normalizeFilterPayload(a)) ===
    JSON.stringify(normalizeFilterPayload(b));

  const filterData = useMemo(() => {
    const arr = [...(coveragelist || [])].sort((a, b) => a - b);
    const coverageOptions = ["Select"];

    arr.forEach((val) => {
      if (String(val).toLowerCase() === "unlimited") {
        coverageOptions.push({
          label: "Unlimited",
          value: "Unlimited",
        });
        return;
      }

      const num = Number(val);
      if (!isNaN(num)) {
        const label = num === 100 ? "1 Cr" : `${num} Lac`;
        coverageOptions.push({
          label,
          value: String(num),
        });
      }
    });

    const baseFilters = [
      {
        label: "Plan Type",
        name: "plantype",
        options: ["Select", "Base", "Port"],
        value: filters.plantype || "",
      },
      {
        label: "Coverage",
        name: "coverage",
        options: coverageOptions,
        value: filters.coverage || "",
      },
      {
        label: "Cover",
        name: "covertype",
        options: ["Select", ...Object.values(covertypelist || {})],
        value: filters.covertype || "",
      },
      {
        label: "Insurers",
        name: "insurers",
        options: ["Select", "TATA AIG", "Care"],
        value: filters.insurers || "",
      },
      {
        label: "Features",
        name: "features",
        options: ["Select", "OPD", "Daycare"],
        value: filters.features || "",
      },
      {
        label: "Tenure",
        name: "tenure",
        options: [
          "Select",
          ...(tenurelist || []).map((v) => `${v} Year${v > 1 ? "s" : ""}`),
        ],
        value: filters.tenure || "",
      },
    ];

    const isPort =
      filters.plantype === "2" ||
      (typeof filters.plantype === "string" &&
        filters.plantype.toLowerCase() === "port");

    if (isPort) {
      baseFilters.push({
        label: "Port Tenure",
        name: "porttenure",
        options: ["Select", "1 Year", "2 Years", "3 Years & Above"],
        value: filters.porttenure || "",
      });
    }
    return baseFilters;
  }, [coveragelist, tenurelist, filters, covertypelist]);

  useEffect(() => {
    reset(
      filterData.reduce((acc, item) => {
        acc[item.name] = item.value || "";
        return acc;
      }, {})
    );
  }, [filterData, reset]);

  const onSubmit = async (data) => {
    const formatted = {
      coverage: data.coverage ?? "",
      covertype: data?.covertype,
      tenure: data.tenure?.replace(/\s*Years?$/, ""),
      plantype: data?.plantype,
    };

    if (data?.plantype === "2" || data?.plantype?.toLowerCase() === "port") {
      formatted.porttenure = data?.porttenure?.replace(/\s*Years?$/, "") || "";
    }

    try {
      setLivePlans([]); 
      setLoadingPlans(true);
      
      const res = await CallApi(
        constant.API.HEALTH.FILTERPLAN,
        "POST",
        formatted
      );

      const changed = !areFiltersSame(originalFiltersRef.current, formatted);

      if (res.status) {
        if (changed) {
          await clearDBData();
          vendorFetchedRef.current = false;
          isFromCacheRef.current = false; 

          setTimeout(() => {
            setVendorData([]); 
            setLivePlans([]); 
            setShouldRefetch((p) => !p);
          }, 400);
        }
      } else {
        setLivePlans([]);
      }

      setLoadingPlans(false);
    } catch (err) {
      console.error("Filter error:", err);
      setLoadingPlans(false);
    }
  };

  const handlePlanSubmit = (plan) => {
    if (!plan?.route)
      return console.warn("No route found for the selected plan.");
    router.push(plan.route);
  };

  const getPlanKey = (plan) =>
    `${String(plan?.productname || "")}|${String(
      plan?.coverage || ""
    )}|${String(plan?.premium || "")}`;

  const isCompared = (plan) =>
    compared.some((p) => getPlanKey(p) === getPlanKey(plan));

  const handleCompareChange = (plan, checked) => {
    if (checked) {
      if (isCompared(plan)) return;
      if (compared.length >= 3) return; 
      setCompared((prev) => [...prev, plan]);
    } else {
      setCompared((prev) =>
        prev.filter((p) => getPlanKey(p) !== getPlanKey(plan))
      );
    }
  };

  const removeCompared = (plan) =>
    setCompared((prev) =>
      prev.filter((p) => getPlanKey(p) !== getPlanKey(plan))
    );

  const compareDisabledForOthers = compared.length >= 3;

  const handleCompareCTA = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("compareType", "health");
      sessionStorage.setItem("comparePlans:health", JSON.stringify(compared));
      sessionStorage.setItem(
        "compareBack",
        window.location.pathname + window.location.search
      );
    }
    router.push("/compare?type=health");
  };

  return (
    <div className="bgcolor min-h-screen px-4 sm:px-10 lg:px-20 py-6">
      <button
        type="button"
        onClick={() => router.push("/health/common/illness")}
        className="inline-flex items-center text-base text-indigo-700 mb-4 hover:underline gap-1"
      >
        <FiArrowLeft className="text-lg" />
        Go back to Previous
      </button>

      <FilterForm
        filterData={filterData}
        register={register}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        filters={filters}
        loadingPlans={loadingPlans}
        onFilterChange={handleFilterChange}
        setFilterChanged={setFilterChanged}
      />

      {/* ==================== UPDATED GRID LAYOUT ORDERING ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="order-2 md:order-none md:col-span-9 space-y-6 pr-0 md:pr-6">
          {livePlans.map((plan, i) => (
            <PlanCard
              key={i}
              plan={plan}
              allPlans={livePlans}
              handlePlanSubmit={handlePlanSubmit}
              onCompareChange={handleCompareChange}
              compared={isCompared(plan)}
              disableCompare={compareDisabledForOthers && !isCompared(plan)}
            />
          ))}

          {loadingPlans &&
            livePlans.length < vendorData.length &&
            Array.from({
              length: Math.max(1, vendorData.length - livePlans.length),
            }).map((_, i) => <HealthPlanCardSkeleton key={`skeleton-${i}`} />)}

          {!loadingPlans && livePlans.length === 0 && (
            <div className="text-gray-500 italic">No plans available</div>
          )}
        </div>

        <div className="order-1 md:order-none md:col-span-3">
          
          <SlidePanel
            isSlideOpen={isSlideOpen}
            setIsSlideOpen={setIsSlideOpen}
            setShowPincodePanel={setShowPincodePanel}
            setShowMemberPanel={setShowMemberPanel}
            showPincodePanel={showPincodePanel}
            showMemberPanel={showMemberPanel}
            pincode={pincode}
            memberName={memberName}
            setPincode={setPincode}
            setMemberName={setMemberName}
          />
        </div>
      </div>

      <AnimatePresence>
        {compared.length > 0 && (
          <motion.div
            key="compare-drawer"
            initial={{
              y: "-120vh",
              opacity: 0,
              scale: 0.95,
              filter: "blur(2px)",
            }}
            animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ y: "-20%", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 24,
              bounce: 1,
            }}
            className="fixed right-4 bottom-4 z-50 w-80 max-w-[88vw] rounded-xl shadow-2xl bg-white border border-gray-200"
            role="region"
            aria-label="Compare plans drawer"
            style={{ willChange: "transform" }}
          >
            <div className="px-4 py-3 border-b">
              <h3 className="text-sm font-semibold text-gray-800">Compare Plans</h3>
            </div>

            <div className="max-h-72 overflow-y-auto px-3 py-2 space-y-2">
              {compared.map((p) => (
                <motion.div
                  key={getPlanKey(p)}
                  layout="position"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 px-2 py-2"
                >
                  <div className="h-10 w-10 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                    {p?.logo ? (
                      <Image
                        src={`${constant.BASE_URL}/front/logo/${p.logo}`}
                        alt={p.productname || "logo"}
                        width={40}
                        height={40}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-gray-500">No Logo</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {p?.productname || "—"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCompared(p)}
                    className="p-1 rounded hover:bg-gray-100"
                    aria-label="Remove from compare"
                    title="Remove"
                  >
                    <MdClose className="h-4 w-4 text-gray-500" />
                  </button>
                </motion.div>
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
                  compared.length >= 2 ? "" : "cursor-not-allowed opacity-70"
                }`}
                aria-disabled={compared.length < 2}
              >
                Compare Plans
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}