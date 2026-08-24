import { showError } from "@/layouts/toaster";
import constant from "@/env";
import { CallApi } from "@/api";

const P2_SECTION1_KEYS = [
  "105","114","122","129","143","147","164",
  "205","207","232","250","222","502","503","210"
];
const P2_SECTION2_KEYS = ["H001","H002","H003","504"];
const P2_SECTION3_KEYS = ["H004"];

const P2_DESC_KEYS = new Set(["210","222","502","503","504"]);

export default async function portquestionvalidation(step3Form, steptwodata, setStepThreeData) {
  const data = step3Form.getValues();
  const members = steptwodata?.member || [];

  if (!data.agreeTnC) {
    step3Form.setFocus?.("agreeTnC");
    showError("Please agree to Terms & Conditions to continue.");
    return false;
  }

  const sectionMap = {
    1: P2_SECTION1_KEYS,
    2: P2_SECTION2_KEYS,
    3: P2_SECTION3_KEYS,
  };

  let hasError = false;
  let firstInvalidInput = null;
  let dobErrorShown = false;

  Object.values(sectionMap).flat().forEach((key) => {
    members.forEach((m, idx) => {
      const base = `${key}main${idx + 1}`;  
      const dateName = `${base}date`;
      const checked = data[base];
      const dateVal = data[dateName];
      const input = document.querySelector(`input[name="${dateName}"]`);
      const trimmed = (dateVal || "").trim();

      if (checked) {
        if (!trimmed) {
          input?.classList.add("border-red-500");
          if (!firstInvalidInput) firstInvalidInput = input;
          hasError = true;
          return;
        }

        const [mm, yyyy] = trimmed.split("/");
        const month = parseInt(mm, 10);
        const year = parseInt(yyyy, 10);

        if (!month || month < 1 || month > 12) {
          input?.classList.add("border-red-500");
          if (!firstInvalidInput) firstInvalidInput = input;
          hasError = true;
          return;
        }

        const dobStr = input?.getAttribute("data-dob");
        if (dobStr) {
          const [day, dobMM, dobYYYY] = dobStr.split("-");
          const dobDate = new Date(Number(dobYYYY), Number(dobMM) - 1, Number(day));
          const inputDate = new Date(year, month - 1);
          const today = new Date();

          const isBeforeDOB =
            inputDate.getFullYear() < dobDate.getFullYear() ||
            (inputDate.getFullYear() === dobDate.getFullYear() &&
             inputDate.getMonth() < dobDate.getMonth());

          const isInFuture =
            inputDate.getFullYear() > today.getFullYear() ||
            (inputDate.getFullYear() === today.getFullYear() &&
             inputDate.getMonth() > today.getMonth());

          if (isBeforeDOB || isInFuture) {
            input?.classList.add("border-red-500");
            if (!firstInvalidInput) firstInvalidInput = input;
            hasError = true;

            if (!dobErrorShown) {
              showError(
                isBeforeDOB
                  ? "Date cannot be before member's Date of Birth (MM/YYYY)."
                  : "Date cannot be in the future (MM/YYYY)."
              );
              dobErrorShown = true;
            }
            return;
          }
        }

        input?.classList.remove("border-red-500");
      } else {
        input?.classList.remove("border-red-500");
      }
    });
  });

  if (hasError) {
    if (firstInvalidInput) {
      firstInvalidInput.scrollIntoView({ behavior: "smooth", block: "center" });
      firstInvalidInput.focus();
    }
    showError("Please fill valid MM/YYYY (month ≤ 12, not before DOB or future) for all selected members.");
    return false;
  }

  const result = [];

members.forEach((m, idx) => {
  const memberData = { id: m.id, age: m.age, dob: m.dob, data: [] };

  Object.entries(sectionMap).forEach(([section, keys]) => {
    keys.forEach((key, keyIdx) => {
      const base = `${key}main${idx + 1}`;
      const dateName = `${base}date`;
      const descName = `${base}desc`;
      const qtyName = `${base}qty`;

      if (data[base] && data[dateName]) {
        memberData.data.push({
          did: `${section}.${keyIdx + 1}`,
          date: data[dateName],
          des: P2_DESC_KEYS.has(key) ? (data[descName] || "") : "",
          quantity: key === "504" ? (data[qtyName] || 0) : 0,
          code: key
        });
      }
    });
  });

  if (memberData.data.length > 0) result.push(memberData);
});




  try {
    const res = await CallApi(
      constant.API.HEALTH.ULTIMATECARE.SAVESTEPTHREE,
      "POST",
      result
    );
    if (res === 1 || res?.status) {
      setStepThreeData && setStepThreeData(res);
      return true;
    } else {
      console.error("Port questions Step 3 API failed:", res);
      return false;
    }
  } catch (err) {
    console.error("Port questions Step 3 API error:", err);
    return false;
  }
}
