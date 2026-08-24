"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FiEdit } from "react-icons/fi";
import constant from "@/env";
import questionCode from "@/context/carepedcode";
import { useRouter, useSearchParams } from "next/navigation";

export default function StepFourForm({
  stepthreedata,
  step4Form,
  onSubmitStep,
  totalPremium,
}) {
  const CARE = questionCode?.CAREPORT || {};

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleEditStep = (stepNo) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("step", stepNo);

    router.push(
      `/health/vendors/caresupereme/journey?${currentParams.toString()}`
    );
  };

  const proposer = stepthreedata?.proposar || {};
  const members = stepthreedata?.insures || [];
  const nominee = stepthreedata?.nominee || {};
  const ped = stepthreedata?.ped || [];
  const lifestyle = stepthreedata?.lifestyle || [];

  let parsedPed = [];

  try {
    stepthreedata?.insures?.forEach((member) => {
      const raw = member?.ped || "[]";
      let individualPed = [];

      if (typeof raw === "string") {
        individualPed = JSON.parse(raw);
      } else if (Array.isArray(raw)) {
        individualPed = raw;
      }

      individualPed.forEach((item) => {
        parsedPed.push({
          ...item,
          name: member.name || "Unknown",
        });
      });
    });
  } catch (err) {
    console.error("Invalid PED JSON:", err);
  }

  const medicalHistory = parsedPed.filter((item) =>
    item.code?.startsWith("1")
  );

  const lifestyleHistory = parsedPed.filter(
    (item) =>
      item.code?.startsWith("18") ||
      item.code?.startsWith("19") ||
      item.code?.startsWith("20") ||
      item.code?.startsWith("21")
  );

  const groupedMedical = {};

  medicalHistory.forEach((item) => {
    const key = item.code || item.did?.split(".")[1];

    if (!groupedMedical[key]) {
      groupedMedical[key] = [];
    }

    groupedMedical[key].push(item);
  });

  const groupedLifestyle = {};

  lifestyleHistory.forEach((item) => {
    const key = item.code || item.did?.split(".")[1];

    if (!groupedLifestyle[key]) {
      groupedLifestyle[key] = [];
    }

    groupedLifestyle[key].push(item);
  });

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="space-y-8 bg-[#f9fafb] p-4 sm:p-6 min-h-screen w-full"
    >
      <div className="max-w-5xl mx-auto space-y-10">
        <h2 className="text-3xl font-bold text-gray-800">
          📋 Proposal Summary
        </h2>

        {/* Product Details */}
        <SectionCard title="Products Details" onEdit={() => handleEditStep(1)}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Image
              src={`/images/health/vendorimage/Care_logo.png`}
              alt="carelogo"
              width={80}
              height={40}
              className="object-contain"
            />

            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                Care Supreme —{" "}
                <span className="text-green-600 font-bold">
                  ₹{totalPremium}
                </span>{" "}
                Coverage
              </h3>

              <button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm shadow">
                View All Benefits
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Proposer Details */}
        <SectionCard title="Proposer Details" onEdit={() => handleEditStep(1)}>
          <div className="overflow-hidden border border-gray-200 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-5 border-b md:border-r border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Full Name
                </p>

                <p className="text-sm font-semibold text-gray-900">
                  {proposer.name || "-"}
                </p>
              </div>

              <div className="p-5 border-b border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Mobile Number
                </p>

                <p className="text-sm font-semibold text-gray-900">
                  {proposer.mobile || "-"}
                </p>
              </div>

              <div className="p-5 border-b md:border-b-0 md:border-r border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Date of Birth
                </p>

                <p className="text-sm font-semibold text-gray-900">
                  {proposer.dob || "-"}
                </p>
              </div>

              <div className="p-5">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Email Address
                </p>

                <p className="text-sm font-semibold text-gray-900 break-all">
                  {proposer.email || "-"}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 px-5 py-4 bg-gray-50/60">
              <p className="text-xs font-medium text-gray-500 mb-1">
                Emergency Contact Number
              </p>

              <p className="text-sm font-semibold text-gray-900">
                {proposer.emergency_mobile || (
                  <span className="text-gray-400 italic font-medium">
                    Not Provided
                  </span>
                )}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Address */}
        <SectionCard title="Address" onEdit={() => handleEditStep(1)}>
          <p className="text-sm text-gray-600 mb-2">Permanent Address</p>

          <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-5 text-sm text-gray-700 leading-7 whitespace-pre-wrap">
            {(() => {
              const addr = proposer.address || {};

              const {
                address1,
                address2,
                landmark,
                city,
                state,
                pincode,
              } = addr;

              return (
                [
                  address1,
                  address2,
                  landmark,
                  city,
                  state,
                  pincode && `- ${pincode}`,
                ]
                  .filter(Boolean)
                  .join(", ") || "-"
              );
            })()}
          </div>
        </SectionCard>

        {/* Insured Members */}
        <SectionCard
          title="Insured Members Details"
          onEdit={() => handleEditStep(2)}
        >
          <Table
            headers={["Name", "Age", "Height", "Weight"]}
            rows={members.map((m) => [
              m.name,
              m.age,
              `${m.height}' ${m.inch}"`,
              m.weight,
            ])}
          />
        </SectionCard>

        {/* Nominee */}
        <SectionCard title="Nominee Details" onEdit={() => handleEditStep(2)}>
          <Table
            headers={["Name", "Relation", "Nominee DOB"]}
            rows={[
              [
                nominee.name || "-",
                nominee.relation || "-",
                nominee.dob || "-",
              ],
            ]}
          />
        </SectionCard>

        {/* Health Details */}
        <SectionCard title="Health Details" onEdit={() => handleEditStep(3)}>
          {/* Medical History */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-semibold text-gray-800">
                Medical History
              </h4>

              <span className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100">
                {medicalHistory.length} Records
              </span>
            </div>

            {medicalHistory.length > 0 ? (
              Object.entries(groupedMedical).map(([code, items], i) => {
                const questionText =
                  CARE[code] || `Question Code: ${code}`;

                return (
                  <div
                    key={i}
                    className="mb-6 overflow-hidden border border-gray-200 rounded-xl"
                  >
                    <div className="px-5 py-4 bg-gradient-to-r from-red-50 to-white border-b">
                      <div className="font-medium text-gray-800">
                        <ReadMoreText text={questionText} lines={2} />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Patient Name
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Date Of Disease
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Description
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {items.map((item, idx) => (
                            <tr
                              key={idx}
                              className="border-t hover:bg-red-50/30 transition"
                            >
                              <td className="px-4 py-4">
                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                                  {item.name}
                                </span>
                              </td>

                              <td className="px-4 py-4 text-gray-700">
                                {item.date || "-"}
                              </td>

                              <td className="px-4 py-4 text-gray-700">
                                {item.des || "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="border border-dashed border-gray-300 rounded-xl py-8 text-center text-gray-400 text-sm">
                No Medical History Found
              </div>
            )}
          </div>

          {/* Lifestyle History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-base font-semibold text-gray-800">
                Lifestyle History
              </h4>

              <span className="text-xs bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full border border-yellow-100">
                {lifestyleHistory.length} Records
              </span>
            </div>

            {lifestyleHistory.length > 0 ? (
              Object.entries(groupedLifestyle).map(([code, items], i) => {
                const questionText =
                  CARE[code] || "Unknown Lifestyle Question";

                return (
                  <div
                    key={i}
                    className="mb-6 overflow-hidden border border-gray-200 rounded-xl"
                  >
                    <div className="px-5 py-4 bg-gradient-to-r from-yellow-50 to-white border-b">
                      <div className="font-medium text-gray-800">
                        <ReadMoreText text={questionText} lines={2} />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Patient Name
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Quantity
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-gray-700">
                              Date Of Disease
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {items.map((item, idx) => (
                            <tr
                              key={idx}
                              className="border-t hover:bg-yellow-50/30 transition"
                            >
                              <td className="px-4 py-4">
                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                                  {item.name}
                                </span>
                              </td>

                              <td className="px-4 py-4 text-gray-700">
                                {item.quantity || "N/A"}
                              </td>

                              <td className="px-4 py-4 text-gray-700">
                                {item.date || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="border border-dashed border-gray-300 rounded-xl py-8 text-center text-gray-400 text-sm">
                No Lifestyle History Found
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </form>
  );
}

function SectionCard({ title, children, onEdit }) {
  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 transition overflow-hidden">
      {onEdit && (
        <button
          onClick={onEdit}
          className="absolute top-5 right-5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg transition text-xs font-medium flex items-center gap-1 border border-indigo-100"
        >
          <FiEdit className="w-4 h-4" />
          Edit
        </button>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
        {title}
      </h3>

      {children}
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-hidden border border-gray-200 rounded-2xl">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2 border-b">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length > 0 ? (
            rows.map((row, ri) => (
              <tr
                key={ri}
                className="border-t hover:bg-gray-50/70 transition"
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-4 py-3 border-b text-gray-800 font-medium"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                className="px-4 py-4 text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ReadMoreText({ text, lines = 2 }) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return "-";

  return (
    <div>
      <p
        className={`text-sm text-gray-700 break-words ${
          !expanded ? `line-clamp-${lines}` : ""
        }`}
      >
        {text}
      </p>

      {text.length > 80 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          {expanded ? "Read Less" : "Read More"}
        </button>
      )}
    </div>
  );
}