"use client";
import React from "react";
import Image from "next/image";
import { FiEdit } from "react-icons/fi";
import constant from "@/env";
import { useRouter, useSearchParams } from "next/navigation";

export default function StepFourForm({
  stepthreedata,
  step4Form,
  onSubmitStep,
  totalPremium,
}) {
  // console.log(stepthreedata)
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleEditStep = (stepNo) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("step", stepNo);
    router.push(`/health/vendors/caresupereme/journey?${currentParams.toString()}`);
  };

  const proposer = stepthreedata?.proposer || {};
  const members = stepthreedata?.insures || [];
  const nominee = stepthreedata?.nominee || {};
  const ped = stepthreedata?.ped || [];
  const lifestyle = stepthreedata?.lifestyle || [];

  let parsedPed = [];
// console.log('stepthreedata?.proposar',stepthreedata?.proposar)
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

const medicalHistory = parsedPed.filter(
  (item) => item.did?.startsWith("1.") && item.member_checked
);

const insuranceHistory = parsedPed.filter(
  (item) =>
    item.did?.startsWith("2.") &&
    item.answer === "Yes"
);

const lifestyleHistory = parsedPed.filter(
  (item) =>
    item.did?.startsWith("3.") &&
    item.member_checked &&
    (item.extra?.value || item.answer) 
);
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
              src={`/images/health/vendorimage/adityabirla_logo.jpg`}
              alt="carelogo"
              width={80}
              height={40}
              className="object-contain"
            />
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                Aditya Birla —{" "}
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
          <GridDetail
            items={[
              ["Name", proposer.name || "-"],
              ["Phone No.", proposer.mobile || "-"],
              ["Date of Birth", proposer.dob || "-"],
              ["E-Mail ID", proposer.email || "-"],
              // [
              //   "Emergency No.",
              //   proposer.emergency_mobile || (
              //     <span className="text-gray-400 italic">Not Provided</span>
              //   ),
              // ],
            ]}
          />
        </SectionCard>

        {/* Address */}
        <SectionCard title="Address" onEdit={() => handleEditStep(1)}>
          <p className="text-sm text-gray-600 mb-2">Permanent Address</p>
         <div className="bg-gray-50 p-3 rounded-md border text-sm break-words whitespace-pre-wrap">
            {(() => {
              const addr = proposer.address || {};
              const {address1,address2,landmark,city,state,pincode} = addr;
              return [address1,address2,landmark,city,state,pincode && `- ${pincode}`]
                .filter(Boolean).join(", ") || "-";}
            )()}
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
<div>
  <h4 className="text-lg font-semibold text-gray-800 mb-3">
   Medical History
  </h4>

  {medicalHistory.length > 0 ? (
    <div className="overflow-x-auto border rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-2 border">Question</th>
            <th className="p-2 border">Member</th>
            <th className="p-2 border">Disease</th>
            <th className="p-2 border">Diagnosis</th>
            <th className="p-2 border">Treatment</th>
          </tr>
        </thead>

        <tbody>
          {medicalHistory.map((item, i) => (
            <tr key={i} className="border-t">
              <td className="p-2 border text-gray-800">
               {item.question_text.replace(/^\d+\.?\s*/, "")}
              </td>

              <td className="p-2 border">{item.name}</td>

              <td className="p-2 border">
                {item.extra?.disease_name || "N/A"}
              </td>

              <td className="p-2 border">
                {item.extra?.diagnosis_date || "N/A"}
              </td>

              <td className="p-2 border">
                {item.extra?.treatment_details || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="text-gray-500 italic">No medical history</p>
  )}
</div>
<div className="mt-8">
  <h4 className="text-lg font-semibold text-gray-800 mb-3">
    Previous / Existing Insurance
  </h4>

  {insuranceHistory.length > 0 ? (
    <div className="overflow-x-auto border rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-2 border">Question</th>
            <th className="p-2 border">Member</th>
            <th className="p-2 border">Answer</th>
            <th className="p-2 border">Details</th>
          </tr>
        </thead>

        <tbody>
          {insuranceHistory.map((item, i) => {
            const extra =
              typeof item.extra === "object" && !Array.isArray(item.extra)
                ? item.extra
                : {};

            return (
              <tr key={i} className="border-t">
                <td className="p-2 border text-gray-800">
                 {item.question_text.replace(/^\d+\.?\s*/, "")}
                </td>

                <td className="p-2 border">{item.name}</td>

                <td className="p-2 border font-semibold text-green-600">
                  {item.answer}
                </td>

<td className="p-2 border text-xs">
  {Object.keys(extra).length > 0 ? (
    <div className="flex flex-col gap-2">
      {Object.entries(extra).map(([k, v], idx) =>
        v ? (
          <div key={idx} className="flex justify-between gap-3">
            
            {/* Label */}
            <span className="text-gray-500 capitalize min-w-[120px]">
              <b>{k.replace(/_/g, " ")} :</b>
            </span>

            {/* Value */}
            <span className="text-gray-900 font-medium text-left break-words">
              {v}
            </span>

          </div>
        ) : null
      )}
    </div>
  ) : (
    <span className="text-gray-400 italic">No details</span>
  )}
</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="text-gray-500 italic">No insurance details</p>
  )}
</div>

          {/* Lifestyle History */}
<div className="mt-8">
  <h4 className="text-lg font-semibold text-gray-800 mb-3">
    Lifestyle History
  </h4>

  {lifestyleHistory.length > 0 ? (
    <div className="overflow-x-auto border rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-2 border">Question</th>
            <th className="p-2 border">Member</th>
            <th className="p-2 border">Value</th>
          </tr>
        </thead>

        <tbody>
          {lifestyleHistory.map((item, i) => {
            const extra =
              typeof item.extra === "object" && !Array.isArray(item.extra)
                ? item.extra
                : {};

            return (
              <tr key={i} className="border-t">
                <td className="p-2 border text-gray-800">
                  {item.question_text}
                </td>

                <td className="p-2 border">{item.name}</td>

                <td className="p-2 border font-semibold text-indigo-600">
                  {extra.value || item.answer}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="text-gray-500 italic">No lifestyle data</p>
  )}
</div>
        </SectionCard>
      </div>
    </form>
  );
}

function SectionCard({ title, children, onEdit }) {
  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {title}
        </h3>

        {onEdit && (
          <button
            onClick={onEdit}
            className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1"
          >
            <FiEdit className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function GridDetail({ items }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
      {items.map(([label, value], i) => (
        <div key={i}>
          <p className="text-gray-500">{label}</p>
          <p className="font-medium text-gray-900 break-words whitespace-pre-wrap">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 font-semibold">
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
              <tr key={ri} className="border-t">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-4 py-2 border-b text-gray-800">
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
function Info({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2">
      <p className="text-gray-500 text-[11px] uppercase tracking-wide">
        {label}
      </p>
      <p className="font-medium text-gray-800 text-sm break-words">
        {value || "N/A"}
      </p>
    </div>
  );
}