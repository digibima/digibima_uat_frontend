

export function isDataChanged(original, current) {
  if (!original || !current) return true;
  if (original.length !== current.length) return true;
  const sortByName = (arr) =>
    [...arr].sort((a, b) => a.name.localeCompare(b.name));
  const o = sortByName(original);
  const c = sortByName(current);
  for (let i = 0; i < o.length; i++) {
    if (o[i].name !== c[i].name || String(o[i].age) !== String(c[i].age)) return true;
  }
  return false;
}

export function isListChanged(original, current) {
  if (!original || !current) return true;
  if (original.length !== current.length) return true;
  const o = [...original].sort();
  const c = [...current].sort();
  for (let i = 0; i < o.length; i++) {
    if (o[i] !== c[i]) return true;
  }
  return false;
}


// ✅ New helper for comparing API response objects
export function isObjectDataChanged(original, current) {
  try {
    if (!original || !current) return true;

    // remove volatile keys (like status, message, etc.)
    const excludeKeys = ["status", "timestamp", "message"];

    const filterObj = (obj) => {
      const clean = {};
      Object.keys(obj || {}).forEach((key) => {
        if (!excludeKeys.includes(key)) clean[key] = obj[key];
      });
      return clean;
    };

    const o = filterObj(original);
    const c = filterObj(current);

    // string comparison fallback (deep compare)
    return JSON.stringify(o) !== JSON.stringify(c);
  } catch (err) {
    console.error("isObjectDataChanged error:", err);
    return true;
  }
}
