import { showError } from "@/layouts/toaster";
import constant from "@/env";
import questionCode from "@/context/carepedcode"
import { CallApi } from "@/api";

export default async function portquestionvalidation(
  step3Form,
  steptwodata,
  setStepThreeData,
) {
  const data = step3Form.getValues();
  const members = steptwodata?.member || [];

  if (!data.agreeTnC) {
    step3Form.setFocus?.("agreeTnC");
    showError("Please agree to Terms & Conditions to continue.");
    return false;
  }

  const sectionMap = {
    1: ["11", "12"],
    2: ["21", "22", "23", "24", "25", "26", "27", "28"],
    3: ["31"],
    4: ["41", "42", "43", "44", "45", "46", "47", "48"],
    5: ["51", "52", "53"],
    6: ["61", "62"],
    7: ["71", "72", "73", "74", "75", "76", "77", "78"],
    8: ["81", "82", "83", "84", "85"],
    9: ["91", "92", "93", "94", "95", "96"],
    10: ["101", "102", "103", "104"],
    11: ["111", "112", "113", "114", "115"],
    12: ["121", "122", "123", "124"],
    13: ["131", "132", "133", "134"],
    14: ["141", "142"],
    15: ["151"],
    16: ["161"],
    17: ["171"],
    18: ["181", "182", "183"],
    19: ["191"],
    20: ["201"],
    21: ["211"],
    22: ["221"],
    23: ["231"],
    24: ["241"],
    25: ["251"],
    26: ["261"],
  };

  let hasError = false;
  let firstInvalidInput = null;
  let dobErrorShown = false;
  let errorMessage = "";
  Object.entries(sectionMap).forEach(([section, keys]) => {
    keys.forEach((key) => {
      members.forEach((m, idx) => {
        const base = `${key}main${idx + 1}`;
        const dateName = `${base}date`;

        const toggleChecked =
          data?.[`port_group${section}_toggle_${key}`] === true ||
          data?.[`port_group${section}_master`] === true ||
          keys.length === 1;
        const meta = questionCode?.CAREPORT?.META?.[key] || {};
        const fields = meta?.fields || {};
        const hasAnyFieldValue = Object.keys(fields).some((fieldKey) => {
          let formKey = `${base}${fieldKey}`;

          if (fieldKey === "date") formKey = `${base}date`;
          if (fieldKey === "quantity" || fieldKey === "volume") {
            formKey = `${base}quantity`;
          }

          return !!data?.[formKey];
        });

        if (toggleChecked && (data?.[base] || hasAnyFieldValue)) {
          // DATE (date)
          if (fields?.date) {
            const val = data?.[`${base}date`];

            if (!val) {
              hasError = true;
              errorMessage = "Please enter date (MM/YYYY)";

              if (!firstInvalidInput) {
                firstInvalidInput = document.querySelector(
                  `[name="${base}date"]`,
                );
              }
            } else {
              const [mm, yy] = val.split("/").map(Number);
              const now = new Date();
              const input = new Date(yy, mm - 1);
              const dob = new Date(m.dob);

              if (mm < 1 || mm > 12) {
                hasError = true;
                errorMessage = "Invalid month";
                if (!firstInvalidInput) {
                  firstInvalidInput = document.querySelector(
                    `[name="${base}date"]`,
                  );
                }
              } else if (input > now) {
                hasError = true;
                errorMessage = "Future date not allowed";
                if (!firstInvalidInput) {
                  firstInvalidInput = document.querySelector(
                    `[name="${base}date"]`,
                  );
                }
              } else if (input < dob) {
                hasError = true;
                errorMessage = "Date cannot be before DOB";
                if (!firstInvalidInput) {
                  firstInvalidInput = document.querySelector(
                    `[name="${base}date"]`,
                  );
                }
              }
            }
          }

          // FURTHER
          if (fields?.further && !data?.[`${base}further`]) {
            hasError = true;
            errorMessage = "Please enter details";
            if (!firstInvalidInput) {
              firstInvalidInput = document.querySelector(
                `[name="${base}further"]`,
              );
            }
          }

          // SPECIFY

          if (fields?.specify && !data?.[`${base}specify`]) {
            hasError = true;
            errorMessage = "Please provide details";
            if (!firstInvalidInput) {
              firstInvalidInput = document.querySelector(
                `[name="${base}specify"]`,
              );
            }
          }

          if (fields?.insulin && !data?.[`${base}insulin`]) {
            hasError = true;
            errorMessage = "Select insulin option";
            if (!firstInvalidInput) {
              firstInvalidInput = document.querySelector(
                `[name="${base}insulin"]`,
              );
            }
          }

          if (fields?.drugs && !data?.[`${base}drugs`]) {
            hasError = true;
            errorMessage = "Select drugs option";
            if (!firstInvalidInput) {
              firstInvalidInput = document.querySelector(
                `[name="${base}drugs"]`,
              );
            }
          }

          if (fields?.obesity && !data?.[`${base}obesity`]) {
            hasError = true;
            errorMessage = "Select obesity option";
            if (!firstInvalidInput) {
              firstInvalidInput = document.querySelector(
                `[name="${base}obesity"]`,
              );
            }
          }

          // FREQUENCY
          if (fields?.frequency && !data?.[`${base}frequency`]) {
            hasError = true;
            errorMessage = "Select frequency";
            if (!firstInvalidInput) {
              firstInvalidInput = document.querySelector(
                `[name="${base}frequency"]`,
              );
            }
          }

          // UNIT (ONLY IF EXISTS IN META)
          if (fields?.unit && !data?.[`${base}unit`]) {
            hasError = true;
            errorMessage = "Enter unit";
            if (!firstInvalidInput) {
              firstInvalidInput = document.querySelector(
                `[name="${base}unit"]`,
              );
            }
          }

          // QUANTITY / VOLUME
          if (
            (fields?.quantity || fields?.volume) &&
            !data?.[`${base}quantity`]
          ) {
            hasError = true;
            errorMessage = "Enter quantity";
            if (!firstInvalidInput) {
              firstInvalidInput = document.querySelector(
                `[name="${base}quantity"]`,
              );
            }
          }
        }
      });
    });
  });

  if (hasError) {
    if (firstInvalidInput) {
      firstInvalidInput.scrollIntoView({ behavior: "smooth", block: "center" });
      firstInvalidInput.focus();
    }
    showError(errorMessage || "Please fill all required fields correctly.");
    return false;
  }

  const result = [];

  members.forEach((m, idx) => {
    const memberData = { id: m.id, age: m.age, dob: m.dob, data: [] };

    Object.entries(sectionMap).forEach(([section, keys]) => {
      keys.forEach((key, keyIdx) => {
        const base = `${key}main${idx + 1}`;
        const dateName = `${base}date`;
        const qtyName = `${base}qty`;

        const toggleChecked =
          data?.[`port_group${section}_toggle_${key}`] === true ||
          data?.[`port_group${section}_master`] === true ||
          keys.length === 1;
            const meta = questionCode?.CAREPORT?.META?.[key] || {};
            const fields = meta?.fields || {};
            const hasAnyFieldValue = Object.keys(fields).some((fieldKey) => {
              let formKey = `${base}${fieldKey}`;

              if (fieldKey === "date") formKey = `${base}date`;
              if (fieldKey === "quantity" || fieldKey === "volume") {
                formKey = `${base}quantity`;
              }

              return !!data?.[formKey];
            });

        if (toggleChecked && (data?.[base] || hasAnyFieldValue)) {
          memberData.data.push({
            code: key,
            questionCd: meta?.main?.questionCd,
            elementCd: meta?.main?.elementCd,
            questionSetCd: meta?.main?.questionSetCd,
          });

          Object.keys(fields).forEach((fieldKey) => {
            let formKey = `${base}${fieldKey}`;

            // mapping fixes
            if (fieldKey === "date") formKey = `${base}date`;

            if (fieldKey === "quantity" || fieldKey === "volume") {
              formKey = `${base}quantity`;
            }

            const value = data?.[formKey];

            if (value !== undefined && value !== null && value !== "") {
              const fieldMeta = fields[fieldKey];

              memberData.data.push({
                questionCd: fieldMeta?.questionCd,
                elementCd: fieldMeta?.elementCd,
                questionSetCd: fieldMeta?.questionSetCd,
                value: value,
              });
            }
          });
        }
      });
    });

    if (memberData.data.length > 0) {
      result.push(memberData);
    }
  });

  // console.log("Ped Data", result);
  // console.log(
  //   "ped data is no more than ped and without ped data is mandatory.",
  // );
  // return false;
  try {
    const res = await CallApi(
      constant.API.HEALTH.CARESUPEREME.SAVESTEPTHREE,
      "POST",
      result,
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
