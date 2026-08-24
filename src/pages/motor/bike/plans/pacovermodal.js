"use client";
import React, { useState } from "react";
import Modal from "@/components/modal";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";

export default function PaCoverModal({
  open,
  onClose,
  setPaCoverChecked,
  onSave,
}) {
  const [optOut, setOptOut] = useState({
    companyBike: false,
    noDl: false,
    existingPolicy: false,
  });

  const [showIrdai, setShowIrdai] = useState(false);
  const [showPaCover, setShowPaCover] = useState(false);

  const handleCheckboxChange = (key) => {
    const selectedKeys = Object.entries(optOut)
      .filter(([_, value]) => value)
      .map(([k]) => k);

    if (selectedKeys.length === 1 && selectedKeys[0] === key) {
      setOptOut({
        companyBike: false,
        noDl: false,
        existingPolicy: false,
      });
      return;
    }

    setOptOut({
      companyBike: false,
      noDl: false,
      existingPolicy: false,
      [key]: true,
    });
  };

  const validatePaCheckbox = () => {
    const reasons = [];

    if (optOut.companyBike)
      reasons.push({ 1: "The bike is registered in a company’s name." });
    if (optOut.noDl)
      reasons.push({ 2: "Not have effective DL With Declaration Letter." });
    if (optOut.existingPolicy)
      reasons.push({ 3: "Already CPA Policy Exists." });

    const optedOut = reasons.length > 0;
    const pacover = optedOut ? "0" : "1";

    const payload = optedOut
      ? [...reasons, { pacover }]
      : [{ pacover }];

    onSave({ payload, checked: !optedOut });
    onClose();
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Personal Accident (PA) Cover"
      onConfirm={validatePaCheckbox}
      confirmText="Save"
      showCancelButton={false}
      width="max-w-2xl"
    >
      {/* IRDAI Notice Accordion */}
      <button
        onClick={() => setShowIrdai(!showIrdai)}
        className="text-blue-600 font-medium flex items-center mb-2 mt-4"
      >
        IRDAI Notice
        {showIrdai ? (
          <RiArrowDropUpLine className="text-3xl" />
        ) : (
          <RiArrowDropDownLine className="text-3xl" />
        )}
      </button>
      {showIrdai && (
        <p className="text-gray-700 text-sm mb-4">
          As per the <strong>Insurance Regulatory and Development Authority of India (IRDAI)</strong> notice,{" "}
          <span className="text-red-600">Personal Accident (PA) Cover is mandatory</span> if the bike is owned by an individual 
          who does not have a <span className="text-red-600">Personal Accident cover of ₹15 Lakhs</span>. 
          Please opt for  &apos;Personal Accident (PA) Cover&apos;.
        </p>
      )}

      {/* Opt Out Reasons */}
      <div className="mb-4">
        <h5 className="font-semibold text-sm mb-2">You can opt out if...</h5>
        <ul className="text-sm space-y-2">
          <li>
            <label className="cursor-pointer">
              <input
                type="checkbox"
                checked={optOut.companyBike}
                onChange={() => handleCheckboxChange("companyBike")}
                className="mr-2 form-checkbox accent-pink-500 h-4 w-4 cursor-pointer"
              />
              The bike is registered in a company’s name.
            </label>
          </li>
          <li>
            <label className="cursor-pointer">
              <input
                type="checkbox"
                checked={optOut.noDl}
                onChange={() => handleCheckboxChange("noDl")}
                className="mr-2 form-checkbox accent-pink-500 h-4 w-4 cursor-pointer"
              />
              Not have effective DL With Declaration Letter.
            </label>
          </li>
          <li>
            <label className="cursor-pointer">
              <input
                type="checkbox"
                checked={optOut.existingPolicy}
                onChange={() => handleCheckboxChange("existingPolicy")}
                className="mr-2 form-checkbox accent-pink-500 h-4 w-4 cursor-pointer"
              />
              Already CPA Policy Exists.
            </label>
          </li>
        </ul>
      </div>

      {/* What is PA Cover? Accordion */}
      <button
        onClick={() => setShowPaCover(!showPaCover)}
        className="text-blue-600 font-medium flex items-center mt-2"
      >
        What is PA Cover?
        {showPaCover ? (
          <RiArrowDropUpLine className="text-3xl" />
        ) : (
          <RiArrowDropDownLine className="text-3xl" />
        )}
      </button>
      {showPaCover && (
        <div className="text-gray-700 text-sm mt-2">
          <h5 className="font-semibold">What is PA Cover?</h5>
          <p>
            This policy covers the owner for death or disability due to an accident. 
            The owner (in case of disability) or the nominee (in case of death) will receive ₹15 Lakhs.
          </p>
          <p className="italic mt-2">
            Stay protected with the right insurance coverage.
          </p>
        </div>
      )}
    </Modal>
  );
}
