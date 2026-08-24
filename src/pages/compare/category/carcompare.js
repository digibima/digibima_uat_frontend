"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Modal from "@/components/modal";
import { FaCheckCircle, FaBolt, FaStar, FaCrown } from "react-icons/fa";
import { FiCheck, FiChevronDown, FiEye,FiX } from "react-icons/fi";
import Image from "next/image";
import constant from "@/env";


/* ---------- helpers ---------- */
const toNum = (val) => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const clean = String(val).trim();
  return Number(clean.replace(/,/g, "").replace(/[^\d.]/g, "") || 0);
};

const getPlanKey = (p, i = 0) =>
  `${String(p?.productname || p?.title || "")}|${String(
    p?.premium || p?.price || ""
  )}|${i}`;

const isInternalHref = (href) =>
  typeof href === "string" && href.startsWith("/");

const getBuyHref = (p) =>
  p?.route && isInternalHref(p.route) ? p.route : p?.buyLink || "";

/* normalize motor plan */
const normalize = (p) => ({
  productname: p.title || p.planname || p.productname || "",
  premium: p.price ?? p.premium ?? "",
  idv: p.idv ?? "",
  validaddon: p.validaddon || {},
 addons: Array.isArray(p.addons)
  ? p.addons
  : p.addons?.selectedaddon
  ? Object.entries(p.addons.selectedaddon).map(([id, price]) => ({
      id,
      price,
    }))
  : Array.isArray(p.validaddon)
  ? p.validaddon
  : [],
  company: p.company || p.insurer || "",
  logo: p.logo || p.vendorimage || p.companyLogo || "",
  route: p.route || p.buyLink || "",
  premiumBreakup: p.premiumBackup || {},
  popular: p.popular || false,
  recommended: p.recommended || false,
});

/* logo */
function Logo({ src, alt = "logo", className = "h-auto w-auto object-cover" }) {
  const finalSrc = src
    ? `${constant.BASE_URL}/front/logo/${src}`
    : "/no-logo.png";
  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={80}
      height={40}
      className={className}
    />
  );
}

/* buy button */
function BuyNowButton({ href, className = "", children = "Buy Now" }) {
  if (!href)
    return (
      <button
        type="button"
        disabled
        className={`pointer-events-none opacity-60 ${className}`}
      >
        {children}
      </button>
    );

  if (isInternalHref(href))
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

/* rows for compare */
const buildRows = ({ onOpenPremium, addonMap }) => [
  {
    key: "idv",
    label: "IDV",
    pretty: (p) => `₹${p.idv?.toLocaleString() || "-"}`,
  },
  {
    key: "premiumBreakup",
    label: "Premium Break-up",
    pretty: (p) =>
      Object.keys(p.premiumBreakup || {}).length ? (
        <button
          type="button"
          onClick={() => onOpenPremium(p)}
          className="inline-flex items-center gap-2 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full hover:bg-indigo-50 text-xs font-medium"
        >
          <FiEye className="h-4 w-4" /> View
        </button>
      ) : (
        <span className="text-xs italic text-slate-400">Not Available</span>
      ),
  },
  {
  key: "addons",
  label: "Add-ons",
  pretty: (p) =>
    Array.isArray(p.addons) && p.addons.length ? (
      <div className="flex flex-col items-start gap-2">
        {p.addons.map((a, i) => {
          const isFree = Number(a.price) === 0;
          const name = addonMap?.[String(a.id)] || a.id;

          
        })}
      </div>
    ) : (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-red-50 border border-red-200 text-red-600">
        <FiX />
        Not Available
      </div>
    ),
}
];

export default function CarCompare() {
  const [plans, setPlans] = useState([]);
  const [diffOnly, setDiffOnly] = useState(false);
  const [premiumModal, setPremiumModal] = useState({ open: false, plan: null });
  const [addonMap, setAddonMap] = useState({});



  /* ----------- GET CURRENT URL & SET HEADING ----------- */
  const [path, setPath] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPath(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const map = sessionStorage.getItem("motorcarfullAddonsName");
      if (map) {
        setAddonMap(JSON.parse(map));
      }
    }
  }, []);

  const pageHeading = useMemo(() => {
    if (!path) return "Compare Insurance Plans";
    if (path.includes("bikecompare")) return "Compare Bike Insurance Plans";
    if (path.includes("carcompare")) return "Compare Car Insurance Plans";
    return "Compare Insurance Plans";
  }, [path]);

  /* ----------- LOAD PLANS ----------- */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("comparePlans:car");
      if (saved) {
        try {
          setPlans(JSON.parse(saved));
        } catch (e) {
          console.error("Invalid comparePlans:car JSON", e);
        }
      }
    }
  }, []);

  const normalized = useMemo(() => plans.map(normalize), [plans]);

  const cheapestPremium = useMemo(() => {
    if (!normalized.length) return null;
    return Math.min(...normalized.map((p) => toNum(p.premium)));
  }, [normalized]);

  const rows = useMemo(() => {
    return buildRows({
      onOpenPremium: (p) => setPremiumModal({ open: true, plan: p }),
      addonMap,
    });
  }, [addonMap]);

  const addonRows = useMemo(() => {
    const allAddonIds = new Set();

    plans.forEach((plan) => {
      if (plan?.validaddon) {
        Object.keys(plan.validaddon).forEach((id) =>
          allAddonIds.add(String(id))
        );
      }

      if (plan?.addons?.selectedaddon) {
        Object.keys(plan.addons.selectedaddon).forEach((id) =>
          allAddonIds.add(String(id))
        );
      }
    });

    return [...allAddonIds].map((id) => ({
      id,
      name: addonMap?.[id] || `Addon ${id}`,
    }));
  }, [plans, addonMap]);

  const diffMask = useMemo(() => {
  if (!normalized.length) return {};

  const mask = {};

  for (const row of rows) {
    const values = normalized.map((p) =>
      typeof row.pretty === "function"
        ? row.pretty(p)?.toString()
        : JSON.stringify(row.render?.(p) ?? p[row.key])
    );

    mask[row.key] = new Set(values).size > 1;
  }

  return mask;
}, [normalized, rows]);

  const handleProceedBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      return window.history.back();
    }
    const fallback =
      (typeof window !== "undefined" &&
        sessionStorage.getItem("compareBack")) ||
      "/motor";
    window.location.href = fallback;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50">
      <Modal
        isOpen={premiumModal.open}
        onClose={() => setPremiumModal({ open: false, plan: null })}
        title={`${premiumModal.plan?.productname || "Plan"} — Premium Break-up`}
        showCancelButton={false}
        showConfirmButton={false}
        width="max-w-2xl"
      >
        {premiumModal.plan?.premiumBreakup &&
        Object.keys(premiumModal.plan.premiumBreakup).length ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(premiumModal.plan.premiumBreakup).map(
              ([k, v], i) => (
                <li
                  key={i}
                  className="flex justify-between bg-blue-50 px-3 py-2 rounded-md"
                >
                  <span className="text-sm font-semibold text-slate-700">
                    {k}
                  </span>
                  <span className="text-sm text-slate-900">₹{v}</span>
                </li>
              )
            )}
          </ul>
        ) : (
          <div className="text-slate-500 italic">No premium breakup</div>
        )}
      </Modal>

   

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(600px_200px_at_10%_0%,rgba(59,130,246,0.15),transparent),radial-gradient(600px_200px_at_90%_0%,rgba(99,102,241,0.15),transparent)]" />
        <div className="relative px-4 md:px-10 lg:px-16 py-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 text-center drop-shadow-sm">
            {pageHeading}
          </h1>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {normalized.map((p, i) => {
              const isCheapest = toNum(p.premium) === cheapestPremium;
              const buyHref = getBuyHref(p);
              return (
                <div
                  key={getPlanKey(p, i)}
                  className="group rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200 shadow hover:shadow-lg transition p-4 flex items-center gap-4"
                >
                  <div className="h-12 w-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden">
                    <Logo src={p.logo} alt={p.company} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-800 truncate">
                      {p.productname}
                    </div>
                    <div className="text-xs text-indigo-700 font-bold">
                      ₹{p.premium}
                      {isCheapest && (
                        <span className="ml-2 inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                          <FaBolt className="h-3 w-3" /> Best Value
                        </span>
                      )}
                      {p.popular && (
                        <span className="ml-2 inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                          <FaStar className="h-3 w-3" /> Most Popular
                        </span>
                      )}
                      {p.recommended && !isCheapest && (
                        <span className="ml-2 inline-flex items-center gap-1 text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
                          <FaCrown className="h-3 w-3" /> Recommended
                        </span>
                      )}
                    </div>
                  </div>
                  <BuyNowButton
                    href={buyHref}
                    className="text-xs font-semibold rounded-lg px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow hover:from-blue-700 hover:to-indigo-700"
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setDiffOnly((v) => !v)}
              className={`inline-flex items-center gap-2 text-sm font-semibold rounded-full px-4 py-2 border transition ${
                diffOnly
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white/80 text-slate-700 border-slate-200 hover:shadow"
              }`}
            >
              {diffOnly ? <FiCheck /> : <FiChevronDown />}
              {diffOnly ? "Showing Differences" : "Show Differences Only"}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:block px-4 md:px-10 lg:px-16 pb-28">
        <div className="overflow-x-auto rounded-3xl shadow-2xl bg-white/80 backdrop-blur-lg border border-slate-200">
          {normalized.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              No plans to compare
            </div>
          ) : (
            <table className="min-w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr className="sticky top-0 z-10">
                  <th className="bg-gradient-to-r from-sky-200 to-indigo-200 sticky left-0 p-5 font-bold text-slate-800 text-left rounded-tl-3xl shadow-md">
                    Features
                  </th>
                  {normalized.map((p, i) => {
                    const buyHref = getBuyHref(p);
                    return (
                      <th
                        key={getPlanKey(p, i)}
                        className="p-5 text-center border-l bg-gradient-to-b from-white to-slate-50"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-22 h-16 rounded-xl bg-white shadow-md border border-blue-100 flex items-center justify-center overflow-hidden">
                            <Logo
                              src={p.logo}
                              alt={p.company}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <p className="font-bold text-blue-900 text-sm text-center">
                            {p.productname}
                          </p>
                          <p
                            className={`font-extrabold text-xl ${
                              toNum(p.premium) === cheapestPremium
                                ? "text-emerald-600"
                                : "text-indigo-700"
                            }`}
                          >
                            ₹{p.premium}
                          </p>
                          <BuyNowButton
                            href={buyHref}
                            className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow"
                          />
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {!diffOnly && (
                  <tr className="hover:bg-sky-50/50">
                    <td className="p-4 font-semibold sticky left-0 bg-white/70">
                      Annual Premium
                    </td>
                    {normalized.map((p, i) => (
                      <td
                        key={getPlanKey(p, i)}
                        className={`p-4 text-center font-bold ${
                          toNum(p.premium) === cheapestPremium
                            ? "text-emerald-600"
                            : "text-slate-700"
                        }`}
                      >
                        ₹{p.premium}
                      </td>
                    ))}
                  </tr>
                )}

                {rows
                  .filter((r) => (diffOnly ? diffMask[r.key] : true))
                  .map((r, idx) => (
                    <tr
                      key={r.key}
                      className={
                        idx % 2
                          ? "bg-sky-50/40 hover:bg-sky-100/40"
                          : "hover:bg-sky-50/40"
                      }
                    >
                      <td
                        className={`p-4 font-semibold sticky left-0 ${
                          idx % 2 ? "bg-sky-100/70" : "bg-white/70"
                        }`}
                      >
                        {r.label}
                      </td>
                        {normalized.map((p, i) => {
                            const visual = r.pretty ? r.pretty(p) : r.render(p);
                            const isHighlight = r.highlight
                              ? r.highlight(p)
                              : false;

                            return (
                              <td
                                key={getPlanKey(p, i)}
                                className={`p-4 text-center ${
                                  isHighlight
                                    ? "bg-emerald-50 text-emerald-700 font-semibold rounded-lg"
                                    : ""
                                }`}
                              >
                                {visual}
                              </td>
                            );
                          })}
                    </tr>
                  ))}
                  {addonRows.map((addon) => (
                      <tr key={addon.id}>
                        <td className="p-4 font-semibold sticky left-0 bg-white/70">
                          {addon.name}
                        </td>

                        {plans.map((plan, index) => {
                          const available =
                            plan?.validaddon?.[addon.id] === "y" ||
                            plan?.addons?.selectedaddon?.[addon.id] !== undefined;

                          return (
                            <td key={index} className="text-center p-4">
                              {available ? (
                                <FiCheck className="mx-auto text-green-600 text-lg" />
                              ) : (
                                <FiX className="mx-auto text-red-600 text-lg" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="md:hidden px-4 pb-8 grid gap-6">
        {normalized.map((p, i) => {
          const buyHref = getBuyHref(p);
          return (
            <div
              key={getPlanKey(p, i)}
              className="bg-white rounded-2xl shadow-md p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <Logo src={p.logo} alt={p.company} />
                <div>
                  <p className="font-bold text-blue-900 text-sm">
                    {p.productname}
                  </p>
                  <p className="font-extrabold text-lg text-indigo-700">
                    ₹{p.premium}
                  </p>
                </div>
              </div>

              <p>
                <span className="font-semibold">IDV:</span> ₹
                {p.idv?.toLocaleString() || "-"}
              </p>
              <p>
                <span className="font-semibold">Add-ons:</span>{" "}
                {Array.isArray(p.addons) && p.addons.length
                  ? `${p.addons.length} available`
                  : "No add-ons"}
              </p>

              <BuyNowButton
                href={buyHref}
                className="w-full mt-4 block text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold"
              />
            </div>
          );
        })}
      </div>

      <div className="hidden md:block fixed bottom-0 left-0 right-0 z-40">
        <div className="mx-auto max-w-7xl px-6 pb-4">
          <div className="rounded-2xl border border-indigo-200 bg-white/90 shadow px-6 py-4 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-800">
              Choose the right car insurance plan.{" "}
              <span className="text-indigo-700">Compare & Buy Now.</span>
            </div>
            <button
              type="button"
              onClick={handleProceedBack}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold px-5 py-2 shadow"
            >
              Proceed to Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
