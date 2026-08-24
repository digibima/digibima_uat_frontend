"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { HiPlus, HiMinus } from "react-icons/hi";
import { showSuccess, showError  } from "@/layouts/toaster";
import { CallApi, VerifyToken, storeDBData, getDBData, deleteDBData  } from "../../../api";
import constant from "../../../env";
import { isDataChanged } from "@/pages/api/helpers";
import { useRef } from "react";
import { Controller } from "react-hook-form";
import UniversalDatePicker from "@/pages/datepicker/index";
import { parse, format } from "date-fns";
import { clearDBData } from "@/api";
import { FaUser, FaUserFriends, FaMale, FaFemale } from "react-icons/fa";
import Image from "next/image";


export default function InsureSidebarComponent({ onClose }) {
  const router = useRouter();
  const { reset } = useForm();

  const [gender, setGender] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [children, setChildren] = useState([]);
  const [isChildChecked, setIsChildChecked] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const maxChildren = 4;

  useEffect(() => {
    const getInsureDataFromDB = async () => {
      try {
        let cached = await getDBData(constant.DBSTORE.HEALTH.INSURE);
        let res;

        if (cached) {
          res = cached;
        } else {
          res = await CallApi(constant.API.HEALTH.GETINSURE);
          if (res?.status && res?.data) {
            await storeDBData(constant.DBSTORE.HEALTH.INSURE, res); 
          }
        }

        // ==================== REAL JSON RESPONSE PARSING ====================
       if (res?.status && res?.data) {
          const apiData = res.data;
          setOriginalData(apiData);

          const selfData = apiData.find(item => item.name === "self");
          let fetchedGender = "male"; 

          if (selfData && selfData.gender) {
            fetchedGender = selfData.gender.toLowerCase();
          } else if (res.gender) {
            fetchedGender = res.gender.toLowerCase();
          } else {
            const hasHusband = apiData.some(item => item.name === "husband");
            const hasWife = apiData.some(item => item.name === "wife");
            if (hasHusband) fetchedGender = "female";
            if (hasWife) fetchedGender = "male";
          }
          
          setGender(fetchedGender);
          
          const spouseTitle = fetchedGender === "male" ? "wife" : "husband";

          const updatedMembers = [
            {
              name: "self",
              age: apiData.find((item) => item.name === "self")?.age || "",
              dob: apiData.find((item) => item.name === "self")?.dob || "",
            },
            {
              name: spouseTitle,
              age: apiData.find((item) => item.name === "wife" || item.name === "husband")?.age || "",
              dob: apiData.find((item) => item.name === "wife" || item.name === "husband")?.dob || "",
            },
            ...[
              "father",
              "mother",
              "grandfather",
              "grandmother",
              "fatherinlaw",
              "motherinlaw",
            ].map((m) => ({
              name: m,
              age: apiData.find((item) => item.name === m)?.age || "",
              dob: apiData.find((item) => item.name === m)?.dob || "",
            })),
          ];

          const childData = apiData
            .filter((item) => item.name === "Son" || item.name === "Daughter")
            .map((item) => ({
              name: item.name,
              age: item.age,
              dob: item.dob || "",
            }));

          setChildren(childData);
          setIsChildChecked(childData.length > 0);
          setMembers(updatedMembers);

          const selected = apiData
            .filter((item) => item.name !== "Son" && item.name !== "Daughter")
            .map((m) => {
              if (m.name === "wife" || m.name === "husband") {
                return spouseTitle; 
              }
              return m.name;
            });
          setSelectedMembers(selected);
        } else {
          showError("Failed to fetch data.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showError("Something went wrong while fetching data.");
      }
    };

    getInsureDataFromDB();
  }, [reset]);

  // ==================== DYNAMIC GENDER AND SPOUSE LABELS INTERCHANGE ====================
  const handleGenderChange = (newGender) => {
    const oldSpouseName = newGender === "male" ? "husband" : "wife";
    const newSpouseName = newGender === "male" ? "wife" : "husband";

    setGender(newGender);

    setMembers((prev) => {
      const existingSpouseData = prev.find((m) => m.name === oldSpouseName);
      return prev.map((m) => {
        if (m.name === "self") return m;
        if (m.name === oldSpouseName || m.name === newSpouseName) {
          return {
            name: newSpouseName,
            age: existingSpouseData?.age || "",
            dob: existingSpouseData?.dob || "",
          };
        }
        return m;
      });
    });

    setSelectedMembers((prev) => {
      if (prev.includes(oldSpouseName)) {
        return prev.map((name) => (name === oldSpouseName ? newSpouseName : name));
      }
      return prev;
    });
  };

  const addChild = () => {
    if (children.length < maxChildren) {
      setChildren([...children, { name: "", age: "", dob: "" }]);
    } else {
      showError("Maximum Three Children Allowed");
    }
  };

  const dobChange = (name, dob) => {
    const birthDate = parse(dob, "dd-MM-yyyy", new Date());
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    setMembers((prev) =>
      prev.map((m) =>
        m.name === name ? { ...m, dob, age } : m
      )
    );
  };

  const childDobChange = (index, dob) => {
    const birthDate = parse(dob, "dd-MM-yyyy", new Date());
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const updated = [...children];
    if (!updated[index]) return;

    updated[index].dob = dob;
    updated[index].age = age;
    setChildren(updated);
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
      setChildren(newChecked ? [{ name: "", age: "", dob: "" }] : []);
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
    if (selected.length === 0 && children.length === 0) return showError("Please select at least one family member.");

    for (const m of selected) {
      if (!m.dob) return showError(`Please select DOB for ${m.name}`);
      const memberAge = parseInt(m.age, 10);
      if (memberAge < 18) {
        return showError(`${m.name.replace(/inlaw/, " in-law")} must be at least 18 years old.`);
      }
    }

    if (!validateAgeGaps()) return;

    if (isChildChecked) {
      for (let i = 0; i < children.length; i++) {
        const { name, dob } = children[i];
        if (!name || !dob) return showError(`Child ${i + 1}: Please select child and DOB`);
      }
    }

    const childList = children.map((child) => ({
      name: child.name,
      age: child.age,
      dob: child.dob || null
    }));

    // ==================== INJECT GENDER INSIDE FORM DATA PAYLOAD FOR SELF ====================
    const memberList = selected.map((m) => {
      const baseMemberObj = {
        name: m.name,
        age: m.age,
        dob: m.dob || null
      };
      if (m.name === "self") {
        baseMemberObj.gender = gender;
      }
      return baseMemberObj;
    });

    const formData = [...childList, ...memberList];

    try {
      const response = await CallApi(constant.API.HEALTH.ILLNESS, "POST", formData);
  
if (response.status) {
  const changed = isDataChanged(originalData, formData);
  if (changed) {
    await clearDBData();
  }

  showSuccess("Data saved!");
  onClose?.();
  

  router.push(constant.ROUTES.HEALTH.PLANS);
  setTimeout(() => {
    router.refresh();
  }, 100);
}
    } catch (err) {
      showError("Failed to submit data. Please try again.");
    }
  };

  const spouseName = gender === "male" ? "wife" : "husband";

  return (
    <div className="w-full h-full px-1 py-4 overflow-y-auto">
      <h2 className="text-lg font-semibold text-blue-900 mb-4">Select members to insure</h2>
      <div className="space-y-4">
        {["self", spouseName].map((name) => {
          const member = members.find((m) => m.name === name);
          return member ? (
            <MemberCard 
              key={member.name} 
              {...{ member, selectedMembers, handleToggle, dobChange, gender, handleGenderChange }} 
            />
          ) : null;
        })}

        <ChildSection 
          {...{ isChildChecked, toggleChildCheckbox, children, addChild, removeChild, childChange, childDobChange, maxChildren }} 
        />

        {members
          .filter((m) => !["self", "wife", "husband"].includes(m.name))
          .map((member) => (
            <MemberCard 
              key={member.name} 
              {...{ member, selectedMembers, handleToggle, dobChange, gender, handleGenderChange }} 
            />
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

function MemberCard({ member, selectedMembers, handleToggle, dobChange, gender, handleGenderChange }) {
  const isChecked = selectedMembers.includes(member.name);

  // ==================== DYNAMIC GRAPHICS AVATAR SWAPPING ====================
  const memberIcons = {
    self: gender === "female" ? "/images/health/insure/wife.jpg" : "/images/health/insure/self.jpg",
    wife: "/images/health/insure/wife.jpg",
    husband: "/images/health/insure/self.jpg",
    father: "/images/health/insure/father.jpg",
    mother: "/images/health/insure/mother.jpg",
    grandfather: "/images/health/insure/grandfather.jpg",
    grandmother: "/images/health/insure/grandmother.jpg",
    fatherinlaw: "/images/health/insure/fatherinlaw.jpg",
    motherinlaw: "/images/health/insure/motherinlaw.jpg",
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div
        onClick={() => handleToggle(member.name)}
        className={`flex items-center gap-3 bg-white px-4 py-3 rounded-2xl text-black w-full relative 
        border border-gray-200 hover:border-blue-500 hover:shadow-md 
        transition-all duration-200 min-h-[52px] cursor-pointer`}
      >
        <div
          className={`w-7 h-7 flex items-center justify-center rounded-full border transition-all duration-200
          ${isChecked 
            ? "bg-blue-600 border-blue-600 text-white scale-105" 
            : "border-gray-300 text-transparent"}`}
        >
          ✓
        </div>

        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 shadow-sm relative">
          <Image
            src={memberIcons?.[member.name] || "/images/health/insure/self-wife.jpg"}
            alt={member.name || "member"}
            fill
            className="object-cover"
          />
        </div>

        <span className="text-[15px] font-semibold text-gray-800 capitalize flex-1 text-left truncate">
          {member.name.replace(/inlaw/, " in-law")}
        </span>

       {isChecked && (
          <div
            className="ml-auto w-[165px] bg-gray-50 rounded-lg px-1 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <UniversalDatePicker
              name={`dob_${member.name}`}
              id={`dob_${member.name}`}
              value={
                member?.dob
                  ? parse(member.dob, "dd-MM-yyyy", new Date())
                  : null
              }
              onChange={(date) => {
                if (date instanceof Date && !isNaN(date)) {
                  const formattedDate = format(date, "dd-MM-yyyy");
                  dobChange(member.name, formattedDate);
                }
              }}
              // ==================== NEW: MAX DATE SET TO 18 YEARS AGO ====================
              maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
              // ===========================================================================
              placeholder="Select DOB"
            />
          </div>
        )}
      </div>

      {member.name === "self" && isChecked && (
        <div className="w-full pl-14 pr-2" onClick={(e) => e.stopPropagation()}>
          <select
            value={gender}
            onChange={(e) => handleGenderChange(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-slate-50 text-gray-700 font-semibold outline-none shadow-sm focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      )}
    </div>
  );
}

const childIcons = {
  Son: "/images/health/insure/son.jpg",
  Daughter: "/images/health/insure/daughter.jpg",
};

function ChildSection({
  isChildChecked,
  toggleChildCheckbox,
  children,
  addChild,
  removeChild,
  childChange,
  childDobChange,
  maxChildren
}) {
  return (
    <div>
      <div
        onClick={toggleChildCheckbox}
        className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-black w-full relative border cursor-pointer transition
        ${isChildChecked ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:border-blue-400"}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-6 h-6 flex items-center justify-center rounded-full border transition
            ${isChildChecked
              ? "bg-blue-600 border-blue-600 text-white"
              : "border-gray-400 text-transparent"}`}
          >
            ✓
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 relative">
              <Image
                src="/images/health/insure/self-wife.jpg"
                alt="Children"
                fill
                className="object-cover"
              />
            </div>

            <span className="text-[15px] font-semibold text-gray-800">
              Children
            </span>
          </div>
        </div>

        {isChildChecked && (
          <div
            className="flex items-center space-x-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={removeChild}
              type="button"
              disabled={children.length === 0}
              className="thmbtn rounded px-2 py-1"
            >
              <HiMinus className="text-sm text-white" />
            </button>

            <span className="font-medium text-gray-700 text-sm">
              {children.length}
            </span>

            <button
              onClick={addChild}
              type="button"
              disabled={children.length >= maxChildren}
              className="thmbtn rounded px-2 py-1"
            >
              <HiPlus className="text-sm text-white" />
            </button>
          </div>
        )}
      </div>

      {isChildChecked && (
        <div className="grid grid-cols-1 gap-3 mt-3">
          {children.map((child, index) => (
            <div
              key={index}
              className="flex items-center gap-3 border border-gray-200 p-3 rounded-2xl bg-white shadow-sm hover:border-blue-500 hover:shadow-md transition-all duration-200"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-300 relative shrink-0">
                <Image
                  src={
                    childIcons?.[child.name] ||
                    "/images/health/insure/self-wife.jpg"
                  }
                  alt={child.name || "child"}
                  fill
                  className="object-cover"
                />
              </div>

              <select
                className="w-1/2 border border-gray-300 text-sm font-medium text-gray-800 cursor-pointer px-3 py-2 rounded-lg bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={child.name}
                onChange={(e) =>
                  childChange(index, "name", e.target.value)
                }
              >
                <option value="">Select Child</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
              </select>

              <div className="w-1/2">
                <UniversalDatePicker
                  name={`dob_child_${index}`}
                  id={`dob_child_${index}`}
                  value={
                    child?.dob
                      ? parse(child.dob, "dd-MM-yyyy", new Date())
                      : null
                  }
                  onChange={(date) => {
                    if (date instanceof Date && !isNaN(date)) {
                      const formattedDate = format(date, "dd-MM-yyyy");
                      childDobChange(index, formattedDate);
                    }
                  }}
                  maxDate={new Date()}
                  placeholder="Select DOB"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}