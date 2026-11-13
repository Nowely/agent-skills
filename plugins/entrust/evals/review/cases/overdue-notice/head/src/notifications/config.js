export const defaultConfig = {
  events: {
    "invoice.overdue": { enabled: true, channels: ["email"] },
  },
};

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(base, overrides) {
  const out = { ...base };
  for (const [key, value] of Object.entries(overrides ?? {})) {
    out[key] = isPlainObject(value) && isPlainObject(base[key]) ? deepMerge(base[key], value) : value;
  }
  return out;
}

export function loadConfig(overrides = {}) {
  return deepMerge(structuredClone(defaultConfig), overrides);
}
