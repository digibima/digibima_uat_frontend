"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { HiPlus, HiMinus } from "react-icons/hi";
import { showSuccess, showError  } from "@/layouts/toaster";
import { CallApi } from "../../../../../api";
import constant from "../../../../../env";

export default function InsureSidebarComponent({ onClose }) {
  const router = useRouter();
  const { reset } = useForm();

  const [gender, setGender] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [children, setChildren] = useState([]);
  const [isChildChecked, setIsChildChecked] = useState(false);
  const maxChildren = 4;

  useEffect(() => {
    const getInsureData = async () => {
      try {
        const res = await CallApi(constant.API.HEALTH.GETINSURE);
        if (res.status && res.data) {
          const apiData = res.data;
          const updatedMembers = [
            {
              name: "self",
              age: apiData.find((item) => item.name === "self")?.age || "",
            },
            {
              name: gender === "male" ? "wife" : "husband",
              age:
                apiData.find(
                  (item) => item.name === (gender === "male" ? "wife" : "husband")
                )?.age || "",
            },
            ...["father", "mother", "grandfather", "grandmother", "fatherinlaw", "motherinlaw"].map(
              (m) => ({
                name: m,
                age: apiData.find((item) => item.name === m)?.age || "",
              })
            ),
          ];
          const childData = apiData
            .filter((item) => item.name === "Son" || item.name === "Daughter")
            .map((item) => ({ name: item.name, age: item.age }));

          setChildren(childData);
          setIsChildChecked(childData.length > 0);
          setMembers(updatedMembers);

          const selected = apiData
            .filter((item) => item.name !== "Son" && item.name !== "Daughter")
            .map((m) => m.name);
          setSelectedMembers(selected);
        } else {
          showError("Failed to fetch data.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showError("Something went wrong while fetching data.");
      }
    };

    getInsureData();
  }, [gender, reset]);

  const addChild = () => {
    if (children.length < maxChildren) {
      setChildren([...children, { name: "", age: "" }]);
    } else {
      showError("Maximum Four Children Allowed");
    }
  };

  const removeChild = () => {
    setChildren(children.slice(0, -1));
  };

  const childChange = (index, field, value) => {
    const updated = [...children];
    updated[index][field] = value;
    setChildren(updated);
  };

  const toggleChildCheckbox = () => {
    setIsChildChecked((prev) => {
      const newChecked = !prev;
      setChildren(newChecked ? [{ name: "", age: "" }] : []);
      return newChecked;
    });
  };

  const handleToggle = (name) => {
    setSelectedMembers((prev) =>
      prev.includes(name)
        ? prev.filter((m) => m !== name)
        : [...prev, name]
    );
  };

  const ageChange = (name, age) => {
    setMembers((prev) =>
      prev.map((m) => (m.name === name ? { ...m, age } : m))
    );
  };

  const getAge = (name) => parseInt(members.find((m) => m.name === name)?.age || "", 10) || null;
  const isSelected = (name) => selectedMembers.includes(name);

  const checkGap = (older, younger, gap, label) => {
    if (older && younger && older - younger < gap) {
      showError(`The gap between ${label} should be at least ${gap} years.`);
      return false;
    }
    return true;
  };

  const validateAgeGaps = () => {
    const agePairs = [
      ["father", "self", 18, "Self and Father"],
      ["father", gender === "male" ? "wife" : "husband", 18, "Spouse and Father"],
      ["mother", "self", 18, "Self and Mother"],
      ["mother", gender === "male" ? "wife" : "husband", 18, "Spouse and Mother"],
      ["fatherinlaw", "self", 18, "Self and Father-in-law"],
      ["fatherinlaw", gender === "male" ? "wife" : "husband", 18, "Spouse and Father-in-law"],
      ["motherinlaw", "self", 18, "Self and Mother-in-law"],
      ["motherinlaw", gender === "male" ? "wife" : "husband", 18, "Spouse and Mother-in-law"],
      ["grandfather", "self", 36, "Self and Grandfather"],
      ["grandfather", gender === "male" ? "wife" : "husband", 18, "Spouse and Grandfather"],
      ["grandmother", "self", 36, "Self and Grandmother"],
      ["grandmother", gender === "male" ? "wife" : "husband", 18, "Spouse and Grandmother"],
      ["grandfather", "father", 18, "Father and Grandfather"],
      ["grandmother", "father", 18, "Father and Grandmother"],
      ["grandfather", "mother", 18, "Mother and Grandfather"],
      ["grandmother", "mother", 18, "Mother and Grandmother"],
    ];

    for (const [older, younger, gap, label] of agePairs) {
      if (isSelected(older) && isSelected(younger)) {
        if (!checkGap(getAge(older), getAge(younger), gap, label)) return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    const selected = members.filter((m) => selectedMembers.includes(m.name));
    if (selected.length === 0) return showError("Please select at least one family member.");

    for (const m of selected) {
      if (!m.age) return showError(`Please select age for ${m.name}`);
    }

    if (!validateAgeGaps()) return;

    if (isChildChecked) {
      for (let i = 0; i < children.length; i++) {
        const { name, age } = children[i];
        if (!name || !age) return showError(`Child ${i + 1}: Please fill both name and age`);
        const ageNum = parseInt(age, 10);
    if (ageNum < 0 || ageNum > 30)
          return showError(`Child ${i + 1}: Age must be between 0 and 30`);
      }
    }

    const childList = children.map((child) => ({ name: child.name, age: child.age }));
    const memberList = selected.map((m) => ({ name: m.name, age: m.age }));
    const formData = [...childList, ...memberList];
    try {
      const response = await CallApi(constant.API.HEALTH.ILLNESS, "POST", formData);
      if (response.status) {
        showSuccess("Data saved!");
        router.push(constant.ROUTES.HEALTH.PLANS);
         onClose();
      } else {
        showError(response.error || "Failed to submit data. Please try again.");
      }
    } catch (err) {
      showError("Failed to submit data. Please try again.");
    }
  };

  return (
    <div className="w-full h-full px-1 py-4  overflow-y-auto">
      <h2 className="text-lg font-semibold text-blue-900 mb-4">Select members to insure</h2>
      <div className="space-y-4">
        {["self", "wife", "husband"].map((name) => {
          const member = members.find((m) => m.name === name);
          return member ? (
            <MemberCard key={member.name} {...{ member, selectedMembers, handleToggle, ageChange }} />
          ) : null;
        })}

        <ChildrenSection {...{ isChildChecked, toggleChildCheckbox, children, addChild, removeChild, childChange, maxChildren }} />

        {members
          .filter((m) => !["self", "wife", "husband"].includes(m.name))
          .map((member) => (
            <MemberCard key={member.name} {...{ member, selectedMembers, handleToggle, ageChange }} />
          ))}

       <div className="flex justify-center">
  <button onClick={handleSubmit} className="w-[96%] text-center py-2 thmbtn">
    Continue
  </button>
</div>

      </div>
    </div>
  );
}

function MemberCard({ member, selectedMembers, handleToggle, ageChange }) {
  return (
    <div
      onClick={() => handleToggle(member.name)}
      className="flex items-center justify-between gap-2 bg-white px-4 py-2 rounded-xl text-black w-full relative border border-gray-400"
    >
      <input
        type="checkbox"
        checked={selectedMembers.includes(member.name)}
        onChange={() => handleToggle(member.name)}
        className="form-checkbox accent-pink-500 h-4 w-4 cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      />
      <label className="text-sm font-medium text-gray-800 capitalize cursor-pointer" onClick={(e) => e.stopPropagation()}>
        {member.name.replace(/inlaw/, " in-law")}
      </label>
      <select
        name={member.name}
        value={member.age}
        onChange={(e) => ageChange(member.name, e.target.value)}
        disabled={!selectedMembers.includes(member.name)}
        className="ml-auto border border-gray-400 rounded-lg px-3 py-1 text-sm text-gray-700 shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <option value="">Age</option>
        {Array.from({ length: 82 }, (_, i) => 18 + i).map((age) => (
          <option key={age} value={age}>{age}</option>
        ))}
      </select>
    </div>
  );
}

function ChildrenSection({ isChildChecked, toggleChildCheckbox, children, addChild, removeChild, childChange, maxChildren }) {
  return (
    <div>
      <div
        onClick={toggleChildCheckbox}
        className="flex items-center justify-between gap-2 bg-white px-4 py-3 rounded-xl text-black w-full relative border border-gray-400"
      >
        <label className="flex items-center space-x-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isChildChecked}
            onChange={(e) => {
              e.stopPropagation();
              toggleChildCheckbox();
            }}
            className="form-checkbox accent-pink-500 h-4 w-4"
          />
          <span className="text-sm font-medium text-gray-800">Children</span>
        </label>
        {isChildChecked && (
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            <button onClick={removeChild} type="button" disabled={children.length === 0} className="thmbtn rounded">
              <HiMinus className="text-xl text-white" />
            </button>
            <span className="font-medium text-gray-700">{children.length}</span>
            <button onClick={addChild} type="button" disabled={children.length >= maxChildren} className="thmbtn rounded">
              <HiPlus className="text-xl text-white" />
            </button>
          </div>
        )}
      </div>
      {isChildChecked && (
        <div className="grid grid-cols-1 gap-4 mt-4">
          {children.map((child, index) => (
            <div key={index} className="flex items-center gap-3 border border-gray-400 p-2 rounded-xl bg-white shadow-sm">
              <select
                className="w-1/2 border border-gray-400 text-sm font-medium text-gray-800 cursor-pointer px-3 py-2 rounded-md"
                value={child.name}
                onChange={(e) => childChange(index, "name", e.target.value)}
              >
                <option value="">Select Child</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
              </select>
              <select
                className="w-1/2 border border-gray-400 text-sm font-medium text-gray-800 cursor-pointer px-3 py-2 rounded-md"
                value={child.age}
                onChange={(e) => childChange(index, "age", e.target.value)}
              >
                <option value="">Age</option>
                {Array.from({ length: 24 }, (_, i) => i + 1).map((age) => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
