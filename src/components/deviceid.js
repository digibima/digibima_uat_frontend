
"use client";

import { getDBData, storeDBData } from "@/api"; 

const makeNumericId = (len = 10) => {
  const L = Math.max(1, Math.min(32, Number(len) || 10));
  let out = "";
  try {
    if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
      const arr = new Uint32Array(L);
      window.crypto.getRandomValues(arr);
      out = Array.from(arr, v => (v % 10).toString()).join("");
    } else {
      for (let i = 0; i < L; i++) out += Math.floor(Math.random() * 10).toString();
    }
  } catch {
    for (let i = 0; i < L; i++) out += Math.floor(Math.random() * 10).toString();
  }
  return out.slice(0, L);
};

export const deviceId = async (token) => {
  if (!token) return null;

  try {
    const existing = await getDBData("deviceid");
    if (existing) {
      // console.log("[deviceId] existing:", existing);
      return existing;
    }

    const id = makeNumericId(10);
    await storeDBData("deviceid", id);

    const verify = await getDBData("deviceid"); 
    if (!verify) throw new Error("read-after-write failed");

    // console.log("[deviceId] stored:", verify); 
    return verify;
  } catch (err) {
    console.error("[deviceId] error:", err);
    return null;
  }
};
