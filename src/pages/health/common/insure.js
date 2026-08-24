"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { HiPlus, HiMinus } from "react-icons/hi";
import { showSuccess, showError } from "@/layouts/toaster";
import { Controller } from "react-hook-form";
import UniversalDatePicker from "@/pages/datepicker/index";
import { parse, format } from "date-fns";
import Image from "next/image";
import {
  CallApi,
  storeDBData,
  getDBData,
  deleteDBData,
  clearDBData
} from "../../../api";
import constant from "../../../env";

export default function InsurePage() {
  const router = useRouter();
  const { reset, control } = useForm();

  const [gender, setGender] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [showPortDropdown, setShowPortDropdown] = useState(false);
  const maxChildren = 4;

  const [planType, setPlanType] = useState("");
  const [tenure, setTenure] = useState("");
  const [originalData, setOriginalData] = useState(null);

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

        // ==================== FIXED: REAL API RESPONSE PARSING ====================
        if (res?.status && res?.data) {
  const apiData = res.data;
  setOriginalData(apiData);

  // Check if response contains husband or wife to override fallback safely
  const hasHusband = apiData.some(item => item.name === "husband");
  const hasWife = apiData.some(item => item.name === "wife");
  
  const selfObj = apiData.find(item => item.name === "self");
  let fetchedGender = selfObj?.gender ? selfObj.gender.toLowerCase() : (res.gender ? res.gender.toLowerCase() : "male");
  
  if (!selfObj?.gender) {
    if (hasHusband) fetchedGender = "female";
    if (hasWife) fetchedGender = "male";
  }
  
  setGender(fetchedGender);
  const spouseTitle = fetchedGender === "male" ? "wife" : "husband";

          // Parse Adults Members Data
          const updatedMembers = [
            {
              name: "self",
              age: apiData.find((item) => item.name === "self")?.age ?? null,
              dob: apiData.find((item) => item.name === "self")?.dob || "",
            },
            {
              name: spouseTitle,
              age: apiData.find((item) => item.name === "wife" || item.name === "husband")?.age ?? null,
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
              age: apiData.find((item) => item.name === m)?.age ?? null,
              dob: apiData.find((item) => item.name === m)?.dob || "",
            })),
          ];

          // Parse Children Array (Sons and Daughters counts mapped dynamically)
          const childData = apiData
            .filter((item) => item.name === "Son" || item.name === "Daughter")
            .map((item) => ({
              name: item.name,
              age: item.age ?? null,
              dob: item.dob || "",
            }));

          setChildrenList(childData);
          setMembers(updatedMembers);

          // Auto-Check/Toggle Active Selected Adult Members
          const selected = apiData
            .filter((item) => item.name !== "Son" && item.name !== "Daughter")
            .map((m) => {
              if (m.name === "wife" || m.name === "husband") {
                return spouseTitle; // map response relative spouse to active local scope
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
            age: existingSpouseData?.age ?? null,
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

  const addChild = (type = "") => {
    if (childrenList.length >= maxChildren) {
      showError("Maximum Three Children Allowed");
      return;
    }

    setChildrenList((prev) => [
      ...prev,
      {
        name: type,
        age: null,
        dob: "",
      },
    ]);
  };

  const removeChild = (type) => {
    const index = childrenList.map((c) => c.name).lastIndexOf(type);
    if (index === -1) return;

    const updated = [...childrenList];
    updated.splice(index, 1);
    setChildrenList(updated);
  };

  const childDobChange = (index, dob) => {
    if (!dob || dob.length !== 10) {
      const updated = [...childrenList];
      updated[index].dob = dob;
      updated[index].age = null;
      setChildrenList(updated);
      return;
    }

    const birthDate = parse(dob, "dd-MM-yyyy", new Date());
    if (isNaN(birthDate)) return;

    const year = birthDate.getFullYear();
    const today = new Date();
    const currentYear = today.getFullYear();

    if (year < 1900 || year > currentYear) {
      const updated = [...childrenList];
      updated[index].dob = dob;
      updated[index].age = null;
      setChildrenList(updated);
      return;
    }

    let age = currentYear - year;
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    const updated = [...childrenList];
    updated[index].dob = dob;
    updated[index].age = Number(age);
    setChildrenList(updated);
  };

  const handleToggle = (name) => {
    setSelectedMembers((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  const dobChange = (name, dob) => {
    if (!dob || dob.length !== 10) {
      setMembers((prev) =>
        prev.map((m) => (m.name === name ? { ...m, dob, age: null } : m))
      );
      return;
    }

    const birthDate = parse(dob, "dd-MM-yyyy", new Date());
    if (isNaN(birthDate)) return;

    const year = birthDate.getFullYear();
    const today = new Date();
    const currentYear = today.getFullYear();

    if (year < 1900 || year > currentYear) {
      setMembers((prev) =>
        prev.map((m) => (m.name === name ? { ...m, dob, age: null } : m))
      );
      return;
    }

    let age = currentYear - year;
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    setMembers((prev) =>
      prev.map((m) => (m.name === name ? { ...m, dob, age: Number(age) } : m))
    );
  };

  const getAge = (name) => {
    const member = members.find((m) => m.name === name);
    if (!member || member.age === null || member.age === undefined || member.age === "") return null;
    return parseInt(member.age, 10);
  };

  const isSelected = (name) => selectedMembers.includes(name);

  const checkGap = (older, younger, gap, label) => {
    if (older === null || younger === null || isNaN(older) || isNaN(younger)) {
      return true; 
    }
    if (older - younger < gap) {
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
    
    if (selected.length === 0 && childrenList.length === 0) {
      return showError("Please select at least one family member.");
    }

    for (const m of selected) {
      if (!m.dob || m.dob.length !== 10 || m.age === null || m.age === "") {
        return showError(`Please select a valid DOB for ${m.name.replace(/inlaw/, " in law")}`);
      }
      
      // ==================== NEW: 18+ AGE VALIDATION FOR ALL ADULTS ====================
      const memberAge = parseInt(m.age, 10);
      if (memberAge < 18) {
        return showError(`${m.name.replace(/inlaw/, " in law")} must be at least 18 years old.`);
      }
      // ================================================================================
    }

    if (!validateAgeGaps()) return;

    const selfAge = getAge("self");
    const spouseAge = getAge(gender === "male" ? "wife" : "husband");

    if (childrenList.length) {
      for (let i = 0; i < childrenList.length; i++) {
        const { name, age, dob } = childrenList[i];
        
        if (!name || !dob || dob.length !== 10 || age === null || age === "") {
          return showError(`Child ${i + 1}: Please fill a valid DOB`);
        }
        
        const childAgeNum = parseInt(age, 10);
        
        if (isNaN(childAgeNum) || childAgeNum < 0 || childAgeNum > 30) {
          return showError(`Child ${i + 1}: Age must be between 0 and 30`);
        }

        if (selfAge !== null && !isNaN(selfAge)) {
          if (selfAge - childAgeNum < 18) {
            return showError(`Child ${i + 1}: Age gap between Self and Child must be at least 18 years.`);
          }
        }

        if (spouseAge !== null && !isNaN(spouseAge)) {
          if (spouseAge - childAgeNum < 18) {
            return showError(`Child ${i + 1}: Age gap between Spouse and Child must be at least 18 years.`);
          }
        }
      }
    }

    let childdd = childrenList.map((child) => ({
      name: child.name,
      age: child.age,
      dob: child.dob || null,
    }));

    let membersss = selected.map((m) => {
      const baseObj = {
        name: m.name,
        age: m.age,
        dob: m.dob || null,
      };
      if (m.name === "self") {
        baseObj.gender = gender;
      }
      return baseObj;
    });

    const formData = [...membersss, ...childdd];

    try {
      const response = await CallApi(constant.API.HEALTH.ILLNESS, "POST", formData);
      if (response.status) {
        showSuccess("Data saved!");
        const changed = isDataChanged(originalData, formData);
        if (changed) {
          await clearDBData();
        }
        router.push(constant.ROUTES.HEALTH.ILLNESS);
      } else {
        showError(response.error || "Failed to submit data. Please try again.");
      }
    } catch (err) {
      console.error("API error:", err);
      showError("Failed to submit data. Please try again.");
    }
  };

  useEffect(() => {
    const handleLoad = () => {
      const saved = localStorage.getItem("planType");
      if (saved === "1" || saved === "2") {
        setPlanType(saved);
      } else {
        localStorage.removeItem("planType");
      }
    };
    window.addEventListener("load", handleLoad);
    return () => window.removeEventListener("load", handleLoad);
  }, []);

  const handleplanSubmit = async (type = planType, tenureValue = tenure) => {
    try {
      const response = await CallApi(constant.API.HEALTH.PLANTYPE, "POST", {
        plantype: type,
        tenure: type === "2" ? tenureValue : null,
      });

      if (response.status) {
        showSuccess("Plan submitted successfully!");
        await clearDBData();
      } else {
        showError(response.error || "Failed to submit plan.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await CallApi(constant.API.HEALTH.GETPLANTYPE, "GET");
        if (response?.status) {
          const saved = response?.plantype;
          const backendTenure = response?.porttenure;

          setPlanType(saved);
          if (saved === "2") {
            setTenure(backendTenure ? backendTenure : "1");
          } else {
            setTenure("1");
          }
        }
      } catch (error) {
        console.error("Error fetching plan type:", error);
      }
    };
    fetchData();
  }, []);

  function isDataChanged(original, current) {
    if (!original || !current) return true;
    if (original.length !== current.length) return true;

    const sortByName = (arr) => [...arr].sort((a, b) => a.name.localeCompare(b.name));
    const o = sortByName(original);
    const c = sortByName(current);

    for (let i = 0; i < o.length; i++) {
      if (o[i].name !== c[i].name || String(o[i].age) !== String(c[i].age)) {
        return true;
      }
    }
    return false;
  }

  const spouseName = gender === "male" ? "wife" : "husband";
  const orderedMembers = [
    "self",
    spouseName,
    "Son",
    "Daughter",
    "father",
    "mother",
    "grandfather",
    "grandmother",
    "fatherinlaw",
    "motherinlaw",
  ];

  return (
    <div className="bgcolor min-h-screen px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-10 flex items-center justify-center">
      <section id="slide3" className="w-full max-w-7xl rounded-[24px] sm:rounded-[32px] md:rounded-[40px] lg:rounded-[50px] bg-white px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10 lg:px-16 lg:py-14 shadow-lg">
        <div>
          <div className="col-span-full">
            <div className="flex flex-col gap-4 md:gap-5">
              <h2 className="text-[20px] leading-snug sm:text-[22px] md:text-[26px] lg:text-[28px] font-bold text-[#426D98]">
                Select members you want to insure
              </h2>
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex flex-wrap bg-gray-200 rounded-full p-1 gap-1 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setPlanType("1");
                      setTenure("");
                      setShowPortDropdown(false);
                      handleplanSubmit("1", null);
                    }}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition ${planType === "1" ? "bg-pink-500 text-white shadow" : "text-gray-700"}`}
                  >
                    New
                  </button>

                  <div className="relative flex-1 sm:flex-none">
                    <button
                      onClick={() => {
                        setPlanType("2");
                        const defaultTenure = tenure || "1";
                        setTenure(defaultTenure);
                        setShowPortDropdown(!showPortDropdown);
                        handleplanSubmit("2", defaultTenure);
                      }}
                      className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 transition ${planType === "2" ? "bg-pink-500 text-white shadow" : "text-gray-700"}`}
                    >
                      Port {planType === "2" && `(${tenure}Y)`}
                      <svg width="10" height="10" viewBox="0 0 20 20">
                        <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                    </button>

                    {showPortDropdown && (
                      <div className="absolute left-0 top-full mt-2 bg-white border rounded-lg shadow-md w-full min-w-[120px] z-50">
                        {["1", "2", "3"].map((y) => (
                          <div
                            key={y}
                            onClick={() => {
                              setTenure(y);
                              setShowPortDropdown(false);
                              handleplanSubmit("2", y);
                            }}
                            className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${tenure === y ? "bg-blue-50 font-semibold" : ""}`}
                          >
                            {y} {y === "1" ? "Year" : "Years"}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-0 gap-y-8 sm:gap-x-0 sm:gap-y-10 mt-8 md:mt-10">
              {orderedMembers.map((name, index) => (
                <MemberCard
                  key={`${name}_${index}`}
                  member={{ name }}
                  members={members}
                  gender={gender}
                  handleGenderChange={handleGenderChange}
                  selectedMembers={selectedMembers}
                  handleToggle={handleToggle}
                  childrenList={childrenList}
                  addChild={addChild}
                  removeChild={removeChild}
                  maxChildren={maxChildren}
                  control={control}
                  dobChange={dobChange}
                  childDobChange={childDobChange}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-start mt-10">
            <button type="button" onClick={() => router.push("/")} className="w-full sm:w-auto px-6 py-2.5 thmbtn rounded-full text-sm font-semibold shadow-md hover:scale-105 transition">
              Back
            </button>
            <button type="button" onClick={handleSubmit} className="w-full sm:w-auto px-6 py-2.5 thmbtn rounded-full text-sm font-semibold shadow-md hover:scale-105 transition">
              Continue
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function MemberCard({
  member,
  members,
  gender,
  handleGenderChange,
  selectedMembers,
  handleToggle,
  childrenList,
  addChild,
  removeChild,
  maxChildren,
  control,
  dobChange,
  childDobChange,
}) {
  const count = childrenList?.filter((c) => c.name === member.name).length || 0;
  const isChild = member.name === "Son" || member.name === "Daughter";
  const isChecked = selectedMembers.includes(member.name) || count > 0;
  const currentMember = members?.find((m) => m.name === member.name);
  
  const memberAge = currentMember?.dob && currentMember?.dob.length === 10 ? currentMember?.age : null;

  const iconMap = {
    self: gender === "female" ? "/images/health/insure/wife.jpg" : "/images/health/insure/self.jpg",
    wife: "/images/health/insure/wife.jpg",
    husband: "/images/health/insure/self.jpg",
    father: "/images/health/insure/father.jpg",
    mother: "/images/health/insure/mother.jpg",
    fatherinlaw: "/images/health/insure/fatherinlaw.jpg",
    motherinlaw: "/images/health/insure/motherinlaw.jpg",
    grandfather: "/images/health/insure/grandfather.jpg",
    grandmother: "/images/health/insure/grandmother.jpg",
    Son: "/images/health/insure/son.jpg",
    Daughter: "/images/health/insure/daughter.jpg",
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div
        onClick={() => !isChild && handleToggle(member.name)}
        className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-[88px] md:h-[88px] rounded-full flex items-center justify-center border-2 transition cursor-pointer ${isChecked ? "border-pink-500 bg-pink-50" : "border-gray-200 bg-gray-50"}`}
      >
        <Image src={iconMap?.[member.name] || "/images/default.png"} alt={member.name || "member"} fill className="rounded-full object-cover" />

        {isChild && (
          <div className="absolute -bottom-2 flex items-center gap-1 bg-white shadow-md rounded-full px-1.5 py-[2px]">
            <button
              onClick={(e) => { e.stopPropagation(); removeChild(member.name); }}
              disabled={count === 0}
              className={`text-xs px-1 ${count === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <HiMinus />
            </button>
            <span className="text-xs font-semibold min-w-[16px] text-center">{count}</span>
            <button
              onClick={(e) => { e.stopPropagation(); addChild(member.name); }}
              disabled={count >= maxChildren}
              className={`text-xs px-1 ${count >= maxChildren ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <HiPlus />
            </button>
          </div>
        )}
      </div>

      <span className="text-xs sm:text-sm font-medium capitalize text-gray-700 text-center leading-snug break-words">
        {member.name.replace(/inlaw/, " in law")}
        {memberAge !== null && memberAge !== "" ? ` (${memberAge}Y)` : ""}
      </span>

      {/* ==================== SELF GENDER DROPDOWN ==================== */}
      {member.name === "self" && isChecked && (
        <div className="mt-1 w-full max-w-[170px] sm:max-w-[180px]">
          <select
            value={gender}
            onChange={(e) => handleGenderChange(e.target.value)}
            className="w-full text-xs sm:text-sm border border-gray-300 rounded-md px-2.5 py-1.5 bg-white text-gray-700 font-medium outline-none shadow-sm focus:border-pink-500 transition-all cursor-pointer"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      )}

{!isChild && isChecked && (
        <div className="mt-2 w-full max-w-[170px] sm:max-w-[180px]">
          <Controller
            control={control}
            name={`dob_${member.name}`}
            render={({ field }) => {
              const currentMember = members.find((m) => m.name === member.name);
            
              const maxAdultDate = new Date();
              maxAdultDate.setFullYear(maxAdultDate.getFullYear() - 18);

              return (
                <UniversalDatePicker
                  {...field}
                  name={`dob_${member.name}`}
                  id={`dob_${member.name}`}
                  value={currentMember?.dob ? parse(currentMember.dob, "dd-MM-yyyy", new Date()) : null}
                  onChange={(date) => {
                    if (date instanceof Date && !isNaN(date)) {
                      const formattedDate = format(date, "dd-MM-yyyy");
                      dobChange(member.name, formattedDate);
                    }
                  }}
                  maxDate={maxAdultDate}
                  placeholder="Select DOB"
                />
              );
            }}
          />
        </div>
      )}

      {isChild && count > 0 && childrenList
        .map((child, index) => ({ child, index }))
        .filter(({ child }) => child.name === member.name)
        .map(({ child, index }) => (
          <div key={index} className="mt-2 w-full max-w-[170px] flex flex-col items-center">
            <div className="w-full max-w-[170px] sm:max-w-[180px]">
              <Controller
                control={control}
                name={`dob_child_${index}`}
                render={({ field }) => (
                  <UniversalDatePicker
                    {...field}
                    name={`dob_child_${index}`}
                    id={`dob_child_${index}`}
                    value={child.dob ? parse(child.dob, "dd-MM-yyyy", new Date()) : null}
                    onChange={(date) => {
                      if (date instanceof Date && !isNaN(date)) {
                        const formattedDate = format(date, "dd-MM-yyyy");
                        childDobChange(index, formattedDate);
                      }
                    }}
                    maxDate={new Date()}
                    placeholder={`${child.name} DOB`}
                  />
                )}
              />
            </div>
          </div>
        ))
      }
    </div>
  );
}