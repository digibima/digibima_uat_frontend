export function isObjectDataChanged(original, current) {
  try {
    if (!original || !current) return true;

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
    return JSON.stringify(o) !== JSON.stringify(c);
  } catch (err) {
    console.error("isObjectDataChanged error:", err);
    return true;
  }
}
