import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { HiPlus, HiMinus } from "react-icons/hi";
import { showSuccess, showError } from "@/layouts/toaster";
import { Controller } from "react-hook-form";
import UniversalDatePicker from "@/pages/datepicker/index";
import { parse, format } from "date-fns";
import {
  CallApi,
  VerifyToken,
  storeDBData,
  getDBData,
  deleteDBData,
} from "../../../api";
import constant from "../../../env";
import Image from "next/image";
import { healthTwo } from "@/images/Image";

export default function InsurePage() {
  const router = useRouter();
  const { reset, control } = useForm();

  const [gender, setGender] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  // const [isChildChecked, setIsChildChecked] = useState(false);
  const [showPortDropdown, setShowPortDropdown] = useState(false);
  const maxChildren = 3;

  const [showModal, setShowModal] = useState(true);
  const [planType, setPlanType] = useState("");
  const [tenure, setTenure] = useState("");
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    const getInsureDataFromDB = async () => {
      try {
        let cached = await getDBData(constant.DBSTORE.HEALTH.INSURE);
        let res;

        if (cached) {
          // console.log("insure data from IndexedDB");
          res = cached;
        } else {
          // console.log("Fetching insure data from API...");
          res = await CallApi(constant.API.HEALTH.GETINSURE);
          if (res?.status && res?.data) {
            await storeDBData(constant.DBSTORE.HEALTH.INSURE, res);
          }
        }

        if (res?.status && res?.data) {
          if (res.gender) setGender(res.gender.toLowerCase());
          setOriginalData(res.data);

          const apiData = res.data;
          const updatedMembers = [
  {
    name: "self",
    age: apiData.find((item) => item.name === "self")?.age || "",
    dob: "",
  },
  {
    name: res.gender?.toLowerCase() === "male" ? "wife" : "husband",
    age:
      apiData.find(
        (item) =>
          item.name ===
          (res.gender?.toLowerCase() === "male" ? "wife" : "husband"),
      )?.age || "",
    dob: "",
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
    dob: "",
  })),
];

       const childData = apiData
  .filter((item) => item.name === "Son" || item.name === "Daughter")
  .map((item) => ({
    name: item.name,
    age: item.age,
    dob: item.dob || "",
  }));
          setChildrenList(childData);
          // setIsChildChecked(childData.length > 0);
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

    getInsureDataFromDB();
  }, [reset]);

const addChild = (type = "") => {
  if (childrenList.length >= maxChildren) {
    showError("Maximum Four Children Allowed");
    return;
  }

  setChildrenList((prev) => [
    ...prev,
    {
      name: type,
      age: "",
      dob: "",
    },
  ]);
};
  const addChildType = (type) => {
  if (childrenList.length >= maxChildren) {
    showError("Maximum Four Children Allowed");
    return;
  }

  setIsChildChecked(true);

  setChildrenList((prev) => [
    ...prev,
    {
      name: type,
      age: "",
      dob: "",
    },
  ]);
};

const removeChild = (type) => {

  const index = childrenList
    .map((c) => c.name)
    .lastIndexOf(type);

  if (index === -1) return;

  const updated = [...childrenList];
  updated.splice(index, 1);

  setChildrenList(updated);
};

  const childChange = (index, field, value) => {
    const updated = [...childrenList];
    updated[index][field] = value;
    setChildrenList(updated);
  };
const childDobChange = (index, dob) => {

  const birthDate = parse(dob, "dd-MM-yyyy", new Date());
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  const updated = [...childrenList];

  if (!updated[index]) return;

  updated[index].dob = dob;
  updated[index].age = age;

  setChildrenList(updated);
};

  // const toggleChildCheckbox = () => {
  //   setIsChildChecked((prev) => {
  //     const newChecked = !prev;
  //     setChildrenList(newChecked ? [{ name: "", age: "" }] : []);
  //     return newChecked;
  //   });
  // };

  const handleToggle = (name) => {
    setSelectedMembers((prev) => {
      const updatedSelection = prev.includes(name)
        ? prev.filter((m) => m !== name)
        : [...prev, name];
      return updatedSelection;
    });
  };

  const ageChange = (name, age) => {
    setMembers((prev) => {
      const updatedMembers = prev.map((m) =>
        m.name === name ? { ...m, age } : m,
      );
      return updatedMembers;
    });
  };
const dobChange = (name, dob) => {
  const birthDate = parse(dob, "dd-MM-yyyy", new Date());
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  setMembers((prev) => {
    const updatedMembers = prev.map((m) =>
      m.name === name ? { ...m, dob, age } : m
    );
    return updatedMembers;
  });
};
  const getAge = (name) =>
    parseInt(members.find((m) => m.name === name)?.age || "", 10) || null;
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
      [
        "father",
        gender === "male" ? "wife" : "husband",
        18,
        "Spouse and Father",
      ],
      ["mother", "self", 18, "Self and Mother"],
      [
        "mother",
        gender === "male" ? "wife" : "husband",
        18,
        "Spouse and Mother",
      ],
      ["fatherinlaw", "self", 18, "Self and Father-in-law"],
      [
        "fatherinlaw",
        gender === "male" ? "wife" : "husband",
        18,
        "Spouse and Father-in-law",
      ],
      ["motherinlaw", "self", 18, "Self and Mother-in-law"],
      [
        "motherinlaw",
        gender === "male" ? "wife" : "husband",
        18,
        "Spouse and Mother-in-law",
      ],
      ["grandfather", "self", 36, "Self and Grandfather"],
      [
        "grandfather",
        gender === "male" ? "wife" : "husband",
        18,
        "Spouse and Grandfather",
      ],
      ["grandmother", "self", 36, "Self and Grandmother"],
      [
        "grandmother",
        gender === "male" ? "wife" : "husband",
        18,
        "Spouse and Grandmother",
      ],
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
    if (selected.length === 0) {
      return showError("Please select at least one family member.");
    }
    for (const m of selected) {
     if (!m.dob) {
  return showError(`Please select DOB for ${m.name}`);
}
    }

    if (!validateAgeGaps()) return;
  if (childrenList.length) {
      for (let i = 0; i < childrenList.length; i++) {
        const { name, age,dob } = childrenList[i];
        if (!name || !dob) {
          return showError(`Child ${i + 1}: Please fill both name and age`);
        }
        const ageNum = parseInt(age, 10);
        if (ageNum < 1 || ageNum > 24) {
          return showError(`Child ${i + 1}: Age must be between 1 and 24`);
        }
      }
    }

   let childdd = childrenList.map((child) => ({
  name: child.name,
  age: child.age,
  dob: child.dob || null,
}));
    let membersss = selected.map((m) => ({
  name: m.name,
  age: m.age,
  dob: m.dob || null,
}));
   const formData = [...membersss, ...childdd];
    console.log(formData);
    // return false;
    try {
      const response = await CallApi(
        constant.API.HEALTH.ILLNESS,
        "POST",
        formData,
      );
      if (response.status) {
        showSuccess("Data saved!");

        const changed = isDataChanged(originalData, formData);
        // console.log("Form changed:", changed);

        if (changed) {
          await Promise.all([
            deleteDBData(constant.DBSTORE.HEALTH.PLANS.HEALTHPLANDATA),
            deleteDBData(constant.DBSTORE.HEALTH.PLANS.HEALTHPLANVENDOR),
            deleteDBData(constant.DBSTORE.HEALTH.INSURE),
            deleteDBData(constant.DBSTORE.HEALTH.CARE.CARECHECKOUTDATA),
            deleteDBData(constant.DBSTORE.HEALTH.CARE.CARECHECKOUTTENUREDATA),
          ]);
          // console.log("Cleared caches (members changed)");
        } else {
          // console.log("Members unchanged, cache kept");
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
      // console.log("saved");

      if (saved === "1" || saved === "2") {
        setPlanType(saved);
        setShowModal(false);
      } else {
        localStorage.removeItem("planType");
        setShowModal(true);
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

      showSuccess("Plan submitted successfully!")

      await Promise.all([
        deleteDBData(constant.DBSTORE.HEALTH.PLANS.HEALTHPLANDATA),
        deleteDBData(constant.DBSTORE.HEALTH.PLANS.HEALTHPLANVENDOR),
        deleteDBData(constant.DBSTORE.HEALTH.CARE.CARECHECKOUTDATA),
        deleteDBData(constant.DBSTORE.HEALTH.ULTIMATE.ULTIMATECHECKOUTDATA),
        deleteDBData(constant.DBSTORE.HEALTH.BAJAJ.BAJAJCHECKOUTDATA),
      ])

    } else {
      showError(response.error || "Failed to submit plan.")
    }

  } catch (err) {
    console.error(err)
  }

}
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

    const sortByName = (arr) =>
      [...arr].sort((a, b) => a.name.localeCompare(b.name));

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
  "motherinlaw"
];

  return (
   <>
<div className="bgcolor px-4 py-10 min-h-screen flex items-center justify-center">
<section
id="slide3"
className="max-w-6xl rounded-[40px] bg-[#fff] grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] p-6 md:p-10 gap-x-10 gap-y-5"
>

{/* PLAN TYPE TABS */}

<div className="col-span-full">

<h2 className="text-[24px] md:text-[28px] font-bold mb-2 text-[#426D98]">
Select members you want to insure
</h2>

<div className="flex items-center">

<div className="flex bg-gray-200 rounded-full p-1 gap-1">

{/* NEW PLAN */}

<button
onClick={() => {
setPlanType("1")
setTenure("")
setShowPortDropdown(false)

handleplanSubmit("1", null)
}}
className={`px-6 py-2 rounded-full text-sm font-semibold transition
${planType === "1"
? "bg-pink-500 text-white shadow"
: "text-gray-700"
}`}
>
New
</button>


{/* PORT PLAN */}

<div className="relative">

<button
onClick={() => {

setPlanType("2")

const defaultTenure = tenure || "1"
setTenure(defaultTenure)

setShowPortDropdown(!showPortDropdown)

handleplanSubmit("2", defaultTenure)

}}
className={`px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-1 transition
${planType === "2"
? "bg-pink-500 text-white shadow"
: "text-gray-700"
}`}
>
Port {planType === "2" && `(${tenure}Y)`}

<svg width="10" height="10" viewBox="0 0 20 20">
<path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none"/>
</svg>

</button>


{showPortDropdown && (
<div className="absolute left-0 mt-2 bg-white border rounded-lg shadow-md w-32 z-50">

<div
onClick={()=>{
setTenure("1")
setShowPortDropdown(false)
handleplanSubmit("2","1")
}}
className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
tenure === "1" ? "bg-blue-50 font-semibold" : ""
}`}
>
1 Year
</div>

<div
onClick={()=>{
setTenure("2")
setShowPortDropdown(false)
handleplanSubmit("2","2")
}}
className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
tenure === "2" ? "bg-blue-50 font-semibold" : ""
}`}
>
2 Years
</div>

<div
onClick={()=>{
setTenure("3")
setShowPortDropdown(false)
handleplanSubmit("2","3")
}}
className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
tenure === "3" ? "bg-blue-50 font-semibold" : ""
}`}
>
3 Years
</div>

</div>
)}

</div>

</div>

</div>
</div>

<div>



<div className="grid grid-cols-3 sm:grid-cols-4 gap-6">

{orderedMembers.map((name, index) => {

if (name === "Son" || name === "Daughter") {
return (
<MemberCard
key={name}
member={{ name }}
childrenList={childrenList}
selectedMembers={selectedMembers}
addChild={addChild}
removeChild={removeChild}
maxChildren={maxChildren}
/>
)
}

const member = members.find((m) => m.name === name)
if (!member) return null

return (
<MemberCard
key={`${member.name}_${index}`}
member={member}
selectedMembers={selectedMembers}
childrenList={childrenList}
handleToggle={handleToggle}
maxChildren={maxChildren}
/>
)

})}

</div>

</div>

<div>

<div className="grid grid-cols-2 lg:grid-cols-3 gap-4">

{[
...members.filter((m) => selectedMembers.includes(m.name)),
...childrenList
].map((member, index) => {

const childIndex =
member.name === "Son" || member.name === "Daughter"
? childrenList.findIndex((c) => c === member)
: null

return (

<div
key={`${member.name}_${index}`}
className="flex flex-col border border-gray-200 p-3 rounded-xl bg-white hover:shadow-md transition"
>

<span className="text-sm font-semibold text-gray-700 capitalize mb-2 flex items-center gap-2">
{member.name.replace(/inlaw/, " in-law")}

{member.name === "Son" || member.name === "Daughter" ? (
childrenList[childIndex]?.age ? (
<span className="text-xs bg-gray-100 px-2 py-[2px] rounded">
{childrenList[childIndex].age} yrs
</span>
) : null
) : (
members.find((m) => m.name === member.name)?.age ? (
<span className="text-xs bg-gray-100 px-2 py-[2px] rounded">
{members.find((m) => m.name === member.name).age} yrs
</span>
) : null
)}

</span>

<Controller
control={control}
name={
member.name === "Son" || member.name === "Daughter"
? `dob_child_${childIndex}`
: `dob_${member.name}`
}
rules={{ required: "DOB is required" }}
render={({ fieldState }) => (

<UniversalDatePicker
name={
member.name === "Son" || member.name === "Daughter"
? `dob_child_${childIndex}`
: `dob_${member.name}`
}
id={
member.name === "Son" || member.name === "Daughter"
? `dob_child_${childIndex}`
: `dob_${member.name}`
}

value={
member.name === "Son" || member.name === "Daughter"
? childrenList[childIndex]?.dob
? parse(childrenList[childIndex].dob, "dd-MM-yyyy", new Date())
: null
: members.find((m) => m.name === member.name)?.dob
? parse(
members.find((m) => m.name === member.name).dob,
"dd-MM-yyyy",
new Date()
)
: null
}

onChange={(date) => {
if (date instanceof Date && !isNaN(date)) {

const formattedDate = format(date, "dd-MM-yyyy")

if (member.name === "Son" || member.name === "Daughter") {
childDobChange(childIndex, formattedDate)
} else {
dobChange(member.name, formattedDate)
}

}
}}

maxDate={new Date()}
placeholder="Select DOB"
error={!!fieldState.error}
errorText={fieldState.error?.message}
/>

)}
/>

</div>

)

})}

</div>

</div>

<div className="flex flex-wrap gap-3 justify-start">

<button
type="button"
onClick={() => router.push("/")}
className="px-6 py-2 thmbtn rounded-full text-sm font-semibold shadow-md hover:scale-105 transition"
>
Back
</button>

<button
type="button"
onClick={handleSubmit}
className="px-6 py-2 thmbtn rounded-full text-sm font-semibold shadow-md hover:scale-105 transition"
>
Continue
</button>

</div>

</section>
</div>
</>
  );
}

function MemberCard({ member, selectedMembers, handleToggle, childrenList, addChild, removeChild,maxChildren }) {

  const count = childrenList?.filter((c) => c.name === member.name).length || 0;

  const isChild = member.name === "Son" || member.name === "Daughter";

  const isChecked =
    selectedMembers.includes(member.name) || count > 0;

  const iconMap = {
    self: "https://cmsprodstorage.blob.core.windows.net/cms-prod/assets/Dependent_Uncle_5be70e220c.png",
    wife: "https://cmsprodstorage.blob.core.windows.net/cms-prod/assets/Dependent_Aunt_337ffb06df.png",
    husband: "https://cmsprodstorage.blob.core.windows.net/cms-prod/assets/Dependent_Uncle_5be70e220c.png",
    father: "https://cmsprodstorage.blob.core.windows.net/cms-prod/assets/Dependent_Uncle_5be70e220c.png",
    mother: "https://cmsprodstorage.blob.core.windows.net/cms-prod/assets/Dependent_Aunt_337ffb06df.png",
    fatherinlaw: "https://cmsprodstorage.blob.core.windows.net/cms-prod/assets/Dependent_Uncle_5be70e220c.png",
    motherinlaw: "https://cmsprodstorage.blob.core.windows.net/cms-prod/assets/Dependent_Aunt_337ffb06df.png",
    grandfather: "https://cmsprodstorage.blob.core.windows.net/cms-prod/assets/Dependent_Uncle_5be70e220c.png",
    grandmother: "https://cmsprodstorage.blob.core.windows.net/cms-prod/assets/Dependent_Aunt_337ffb06df.png",
    Son: "https://cmsprodstorage.blob.core.windows.net/cms-prod/assets/Dependent_Uncle_5be70e220c.png",
    Daughter: "https://cmsprodstorage.blob.core.windows.net/cms-prod/assets/Dependent_Aunt_337ffb06df.png",
  };

  return (
    <div className="flex flex-col items-center gap-2">

    <div
  onClick={() => !isChild && handleToggle(member.name)}
  className={`relative w-20 h-20 rounded-full flex items-center justify-center border-2 transition cursor-pointer
  ${
    isChecked
      ? "border-pink-500 bg-pink-50"
      : "border-gray-200 bg-gray-50"
  }`}
>
    <Image
        src={iconMap?.[member.name] || "/images/default.png"}
        alt={member.name || "member"}
        fill
        className="rounded-full object-cover"
      />

        {/* CHILD COUNTER UI */}
        {isChild && (
          <div className="absolute -bottom-2 flex items-center gap-1 bg-white shadow-md rounded-full px-1 py-[2px]">

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeChild(member.name);
              }}
               disabled={count === 0}
  className={`text-xs px-1 ${count === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <HiMinus />
            </button>

            <span className="text-xs font-semibold w-4 text-center">
              {count}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                addChild(member.name);
              }}
             disabled={count >= maxChildren}
  className={`text-xs px-1 ${count >= maxChildren ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <HiPlus />
            </button>

          </div>
        )}

      </div>

      <span className="text-sm font-medium capitalize text-gray-700">
        {member.name.replace(/inlaw/, " in law")}
      </span>

    </div>
  );
}

function ChildrenSection({
    isChildChecked,
  toggleChildCheckbox,
  childrenList,
  addChild,
  removeChild,
  childChange,
  childDobChange,
  maxChildren,
}) {
  return (
    <>
      <div
        onClick={toggleChildCheckbox}
        className="flex items-center justify-between gap-2 bg-white px-4 py-3 rounded-xl text-black w-full relative border border-gray-400"
      >
        <label
          className="flex items-center space-x-2 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
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
          <div
            className="flex items-center space-x-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={removeChild}
              type="button"
              disabled={childrenList.length === 0}
              className="thmbtn rounded disabled:opacity-50"
            >
              <HiMinus className="text-xl text-white" />
            </button>
            <span className="font-medium text-gray-700">
              {childrenList.length}
            </span>
            <button
              onClick={addChild}
              type="button"
              disabled={childrenList.length >= maxChildren}
              className="thmbtn rounded disabled:opacity-50"
            >
              <HiPlus className="text-xl text-white" />
            </button>
          </div>
        )}
      </div>
      {isChildChecked && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"
          id="childContainer"
        >
         {childrenList.map((child, index) => (
  <div
    key={index}
    className="border border-gray-400 p-3 rounded-xl bg-white shadow-sm"
  >
    {/* TOP ROW */}
    <div className="flex items-center gap-3">
      <select
        className="w-full border border-gray-400 text-sm font-medium text-gray-800 cursor-pointer px-3 py-2 rounded-md"
        value={child.name}
        onChange={(e) => childChange(index, "name", e.target.value)}
      >
        <option value="">Select Child</option>
        <option value="Son">Son</option>
        <option value="Daughter">Daughter</option>
      </select>
    </div>

    {/* DOB ROW */}
    {child.name && (
      <div className="flex items-center gap-2 mt-2">
        <input
          type="date"
          value={child.dob || ""}
          onChange={(e) => childDobChange(index, e.target.value)}
          className="w-full border border-gray-400 text-sm text-gray-800 px-3 py-2 rounded-md"
          max={new Date().toISOString().split("T")[0]}
        />

        {child.age && (
          <span className="text-xs bg-gray-100 px-2 py-1 rounded whitespace-nowrap text-black">
            {child.age} yrs
          </span>
        )}
      </div>
    )}
  </div>
))}
        </div>
      )}
    </>
  );
}
