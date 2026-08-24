"use client";
import React from "react";
import Image from "next/image";
import { FiEdit } from "react-icons/fi";
import constant from "@/env";
import { useRouter, useSearchParams } from "next/navigation";

export default function StepFourForm({
  motortype,
  stepthreedata,
  step4Form,
  onSubmitStep,
  totalPremium,
}) {
  const { apiresponse, verify_details, proposal, paymentSummery } =
    stepthreedata || {};
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleEditStep = (stepNo) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("step", stepNo);
    router.push(`/health/journey?${currentParams.toString()}`);
  };

  return (
    <div className="p-6 bg-[#f9f9ff] rounded-2xl shadow-md space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {proposal?.planname || "Coverage Plan"}
          </h2>
          <p className="text-sm text-gray-500">{proposal?.plantype}</p>
          <p className="text-base font-medium mt-2 text-indigo-600">
            Proposal No:{" "}
            <span className="text-black font-semibold">
              {apiresponse?.PROPOSAL_NO}
            </span>
          </p>
        </div>
        <button className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-md font-medium">
          Edit
        </button>
      </div>

      <SectionCard title="Vehicle Details">
        {motortype !== "newbike" && verify_details?.make && (
          <InfoRow label="Make" value={verify_details.make} />
        )}
        {verify_details?.model && (
          <InfoRow label="Model" value={verify_details.model} />
        )}
        {motortype !== "newbike" && verify_details?.regdate && (
          <InfoRow label="Registration Date" value={verify_details.regdate} />
        )}
        {verify_details?.idv && (
          <InfoRow label="IDV" value={`₹ ${verify_details.idv}`} />
        )}
      </SectionCard>

      {/*Policy Details */}
      <SectionCard title="Policy Details">
        <InfoRow label="Product Code" value={proposal?.productcode} />
        <InfoRow label="Proposal Type" value={proposal?.proposaltype} />
        <InfoRow label="Policy Type" value={proposal?.policytpe} />
      </SectionCard>

      {/*Payment Summary */}
      <SectionCard title="Payment Summary">
        {(paymentSummery || []).map((item, idx) => {
          const label = item.CoverDesc;
          const value = item.Premium;
          const isTotal =
            label?.toLowerCase().includes("total") ||
            label?.toLowerCase().includes("final");

          return (
            <InfoRow
              key={idx}
              label={label}
              value={`₹ ${value}`}
              isTotal={isTotal}
            />
          );
        })}
      </SectionCard>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <button className="text-sm text-indigo-600 font-medium bg-indigo-100 px-3 py-1 rounded-md">
          Edit
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, isTotal = false }) {
  return (
    <div className="flex justify-between text-sm text-gray-700">
      <span className="font-medium">{label}:</span>
      <span
        className={`font-semibold ${
          isTotal ? "text-red-600 font-bold" : "text-gray-900"
        }`}
      >
        {value || "--"}
      </span>
    </div>
  );
}
