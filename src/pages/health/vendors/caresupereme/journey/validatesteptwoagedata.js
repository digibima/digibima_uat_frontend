import { showSuccess, showError } from "@/layouts/toaster";

export const calculateAgeFromDOB = (dobString) => {
  const [dd, mm, yyyy] = dobString.split("-");
  const dob = new Date(`${yyyy}-${mm}-${dd}`);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
};

const labelFor = (name = "") => {
  const r = String(name).toLowerCase();
  if (r === "husband") return "Husband";
  if (r === "wife") return "Spouse"; 
  return name?.charAt(0).toUpperCase() + name?.slice(1);
};

const dobKeyFor = (rel = "") => {
  const r = String(rel).toLowerCase();
  if (r === "wife" || r === "husband") return "spousedob";
  if (r === "father") return "fatherdob";
  if (r === "mother") return "motherdob";
  if (r === "grandfather") return "grandfatherdob";
  if (r === "grandmother") return "grandmotherdob";
  if (r === "fatherinlaw") return "fatherinlawdob";
  if (r === "motherinlaw") return "motherinlawdob";
  return "";
};

const isFutureDate = (dateString) => {
  if (!dateString) return false;

  if (!/^\d{2}-\d{2}-\d{4}$/.test(dateString)) return false;

  const [dd, mm, yyyy] = dateString.split("-");
  const selected = new Date(`${yyyy}-${mm}-${dd}`);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);

  return selected > today;
};

const validateStepTwoData = (values, steponedata) => {
// IFSC Validation
const ifsc = values.proposarbankifsc?.toUpperCase().trim();

if (!ifsc) {
  showError("Please enter IFSC Code");
  markInvalid("proposarbankifsc");
  return false;
}

if (!isValidIFSC(ifsc)) {
  showError("Invalid IFSC Code (Format: AAAA0XXXXXX)");
  markInvalid("proposarbankifsc");
  return false;
}


  // return false;


  //  Block future dates for ALL DOB / attachment fields
for (const key in values) {
  const value = values[key];

  // Check only DD-MM-YYYY format
  if (typeof value === "string" && isFutureDate(value)) {
    showError(`${key} Date cannot be in the future `);
    markInvalid(key);
    return false;
  }
}
  // Self

  const selfMember = steponedata?.members?.find(
    (m) => m.name?.toLowerCase() === "self"
  );
  const selfDob = values.proposerdob2;

  if (!selfDob) {
    showError("Please enter Self's DOB");
    markInvalid("proposerdob2");
    return false;
  }

  if (selfMember?.age) {
    const actual = calculateAgeFromDOB(selfDob);
    const expected = parseInt(selfMember.age, 10);
    if (actual !== expected) {
      showError(`Invalid Age for Self. Expected ${expected} year.`);
      markInvalid("proposerdob2");
      return false;
    }
  }

  if (values.nomineedob && steponedata?.nominee?.age) {
    const actual = calculateAgeFromDOB(values.nomineedob);
    const expected = parseInt(steponedata.nominee.age, 10);
    if (actual !== expected) {
      showError(`Invalid Age for Nominee. Expected ${expected} year.`);
      markInvalid("nomineedob");
      return false;
    }
  }


  let childIndex = 1;
  let spouseValidated = false; 

  for (const member of steponedata?.members || []) {
    const rawName = member.name || "";
    const name = rawName.toLowerCase();
    if (name === "self") continue;


    if (name === "wife" || name === "husband") {
      if (spouseValidated) continue; 
      spouseValidated = true;

      const key = "spousedob";
      const dob = values[key];

      if (!dob) {
        const spouseKeyLabel = name === "husband" ? "husband" : "spouse";
        showError(`${spouseKeyLabel}dob is required`);
        markInvalid(key);
        return false;
      }

      const actual = calculateAgeFromDOB(dob);
      const expected = parseInt(member.age, 10);
      if (actual !== expected) {
        showError(` Invalid Age for ${labelFor(name)}. Expected ${expected} year.`);
        markInvalid(key);
        return false;
      }

      continue;
    }

   if (name === "son" || name === "daughter") {
  const key = `childdob${childIndex++}`;
  const dob = values[key];

  if (!dob) {
    showError(`Please enter DOB for ${labelFor(name)}`);
    markInvalid(key);
    return false;
  }

  // NEW: 91 days validation
  if (!isAtLeast91DaysOld(dob)) {
    showError(`${labelFor(name)} must be at least 91 days old`);
    markInvalid(key);
    return false;
  }

  const actual = calculateAgeFromDOB(dob);
  const expected = parseInt(member.age, 10);

  if (expected === 1) {
    if (actual !== 0 && actual !== 1) {
      showError(` Invalid Age for ${labelFor(name)}. Expected Below 1 or 1 year.`);
      markInvalid(key);
      return false;
    }
  } else {
    if (actual !== expected) {
      showError(` Invalid Age for ${labelFor(name)}. Expected ${expected} year.`);
      markInvalid(key);
      return false;
    }
  }

  continue;
}


    const key = dobKeyFor(name);
    if (!key) continue; 

    const dob = values[key];
    if (!dob) {
      showError(`Please enter DOB for ${labelFor(name)}`);
      markInvalid(key);
      return false;
    }

    const actual = calculateAgeFromDOB(dob);
    const expected = parseInt(member.age, 10);
    if (actual !== expected) {
      showError(` Invalid Age for ${labelFor(name)}. Expected ${expected} year.`);
      markInvalid(key);
      return false;
    }
  }

  return true;
};

const markInvalid = (fieldName) => {
  const el = document.querySelector(`[name="${fieldName}"]`);
  if (el) {
    el.classList.add("border-red-500");
    el.focus();
    setTimeout(() => el.classList.remove("border-red-500"), 2500);
  }
};
const isAtLeast91DaysOld = (dobString) => {
  if (!dobString) return false;

  const [dd, mm, yyyy] = dobString.split("-");
  const dob = new Date(`${yyyy}-${mm}-${dd}`);
  const today = new Date();

  const diffTime = today - dob;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays >= 91;
};
const isValidIFSC = (ifsc = "") => {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
};



export default validateStepTwoData;
