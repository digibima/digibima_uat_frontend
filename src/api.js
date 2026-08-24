import { openDB } from "idb";
const DB_NAME = "DIGIBIMA";
const STORE_NAME = "digibima";
import constant from "@/env";
import { socket } from "@/utils/socket";

export async function CallApi(url, method = "POST", data = null) {
  let token = localStorage.getItem("token");
  const deviceId = await getDeviceId();
  let options = {
    method,
  headers: {
  "Content-Type": "application/json",
  Authorization: `${token}`,
  "X-Device-Id": deviceId,

  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
},

  };
  if (data) {
    options.body = JSON.stringify({ data: data });
  }
  let res = await fetch(url, options);
  if (!res.ok) throw new Error("API request failed");
  return await res.json();
}

export async function CallSocket(eventName, data = {}) {
  try {
    // LocalStorage se token nikala
    let token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    // Data ke sath Authorization token merge kiya
    const secureData = {
      ...data,
      Authorization: token || null
    };

    console.log(`Sending socket event [${eventName}] with token:`, secureData);
    const serverResponse = await socket.emitWithAck(eventName, secureData);

    return serverResponse || true;

  } catch (error) {
    console.error("CallSocket Error:", error);
    throw error;
  }
}

export async function UploadDocument(url, method = "POST", file = null) {
  const token = localStorage.getItem("token");
  let options = {
    method,
    headers: {
      Authorization: `${token}`,
    },
    body: file,
  };

  const res = await fetch(url, options);
  if (!res.ok) throw new Error("API request failed");
  return await res.json();
}

export async function getUserinfo(token = localStorage.getItem("token")) {
  return await fetch("/api/getuserinfo", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${token}`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}

export async function VerifyToken(pretoken = localStorage.getItem("token")) {
  let userid = await getDBData("userid");
  const response = await fetch("/api/verifytoken", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `${pretoken}`,
    },
  });
  return response;
}

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

// export async function getDBData(key) {
//   const db = await getDB();
//   return db.get(STORE_NAME, key);
// }

// export async function storeDBData(key, value) {
//   const db = await getDB();
//   await db.put(STORE_NAME, value, key);
// }

const DEFAULT_TTL = 2 * 60 * 1000; // 2 minutes

export async function getDBData(key) {
  const db = await getDB();
  const record = await db.get(STORE_NAME, key);

  if (!record) return null;
  if (!record.expiresAt) {
    return record;
  }

  // Expiry check
  if (Date.now() > record.expiresAt) {
    await db.delete(STORE_NAME, key);
    return null;
  }

  return record.data;
}

export async function storeDBData(key, value, ttl = DEFAULT_TTL) {
  const db = await getDB();

  const payload = {
    data: value,
    expiresAt: Date.now() + ttl,
  };

  await db.put(STORE_NAME, payload, key);
}


export async function deleteDBData(key) {
  const db = await getDB();
  await db.delete(STORE_NAME, key);
}

export async function clearDBData() {
  const db = await getDB();
  await db.clear(STORE_NAME);
}
export async function isAuth() {
  return localStorage.getItem("token") ? true : false;
}
async function getDeviceId() {
  const raw = await getDBData("deviceid");


  return Array.isArray(raw) ? raw[0] : raw || null;
}
