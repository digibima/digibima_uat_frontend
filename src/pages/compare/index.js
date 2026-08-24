"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

/** -------- type helpers (kept local to this file) -------- */
const inferTypeFromPlans = (arr) => {
  if (!Array.isArray(arr) || !arr.length) return "health";
  const one = arr[0] || {};
  // motor-ish signals
  if ("idv" in one || "IDV" in one || "coverd" in one || "title" in one) return "car";
  if ("coverage" in one || "sumInsured" in one || "productname" in one) return "health";
  return "health";
};

/** map new/old keys so legacy compare persists keep working */
const resolveStorageKeys = (type) => {
  // normalized "type"
  const t = (type || "").toLowerCase();
  if (["car", "bike", "commercial"].includes(t)) {
    return [`comparePlans:${t}`, "comparePlans:motor", "comparePlans"];
  }
  if (t === "motor") {
    return ["comparePlans:motor", "comparePlans:car", "comparePlans", "comparePlans:bike", "comparePlans:commercial"];
  }

  return ["comparePlans:health", "comparePlans"];
};

const loadPlansFromStorage = (typeGuess) => {
  const keys = resolveStorageKeys(typeGuess);
  for (const k of keys) {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem(k) : null;
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
  }
  return [];
};

/** -------- Dynamic category components -------- */
const HealthCompare = dynamic(() => import("./category/healthcompare"));
const CarCompare     = dynamic(() => import("./category/carcompare"));
// bike/commercial abhi Car UI reuse kar rahe:
const BikeCompare        = dynamic(() => import("./category/bikecompare"));
const CommercialCompare  = dynamic(() => import("./category/commercialcompare"));

export default function CompareIndex() {
  const [type, setType] = useState("health");  // "health" | "car" | "bike" | "commercial"
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // URL or session ke basis par type 
    const qs = new URLSearchParams(window.location.search);
    const qsType = (qs.get("type") || "").toLowerCase();
    const ssType = (sessionStorage.getItem("compareType") || "").toLowerCase();

    // normalize motor → car (by default)
    const initialType =
      ["health", "car", "bike", "commercial"].includes(qsType) ? qsType :
      ["health", "car", "bike", "commercial"].includes(ssType) ? ssType :
      (qsType === "motor" || ssType === "motor") ? "car" : "health";

    // load raw plans with graceful fallbacks
    const rawPlans = loadPlansFromStorage(initialType);
    const decidedType = (qsType || ssType) ? initialType : inferTypeFromPlans(rawPlans);

    setType(decidedType);
    setPlans(Array.isArray(rawPlans) ? rawPlans : []);
  }, []);

  // simple fallback
  if (!plans.length) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 italic">
        No plans selected for comparison.
      </div>
    );
  }

  // category switch
  if (type === "health") {
    return <HealthCompare plans={plans} />;
  }
  if (type === "bike") {
    return <BikeCompare plans={plans} />;
  }
  if (type === "commercial") {
    return <CommercialCompare plans={plans} />;
  }
  // default motor → car
  return <CarCompare plans={plans} />;
}
