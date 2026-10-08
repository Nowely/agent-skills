// The JSON-Schema subset entrust validates: a coordinator's structured reply, a worker's five fields.

// The subset this module validates. Every keyword here is actually enforced; a schema
// that uses any other keyword is refused rather than reported as validated.
export const SCHEMA_KEYWORDS = new Set([
  "type", "properties", "required", "additionalProperties", "enum", "items",
  "maxLength", "minLength", "maxItems", "minItems", "minimum", "maximum", "pattern",
  "oneOf", "description", "title", "default", "$schema",
]);
const ANNOTATION_KEYWORDS = new Set(["description", "title", "default", "$schema"]);
const TYPES = new Set(["string", "number", "integer", "boolean", "array", "object", "null"]);

export function checkSchemaSubset(schema, where = "$") {
  const errors = [];
  const walk = (s, at) => {
    if (typeof s !== "object" || s === null || Array.isArray(s)) { errors.push(`${at}: a schema must be an object`); return; }
    for (const k of Object.keys(s)) if (!SCHEMA_KEYWORDS.has(k)) errors.push(`${at}: unsupported keyword ${k}`);
    if (s.oneOf !== undefined) {
      if (!Array.isArray(s.oneOf) || s.oneOf.length === 0) errors.push(`${at}.oneOf: must be a non-empty array of schemas`);
      else s.oneOf.forEach((branch, i) => walk(branch, `${at}.oneOf[${i}]`));
    }
    if (s.type !== undefined) {
      const types = Array.isArray(s.type) ? s.type : [s.type];
      for (const t of types) if (!TYPES.has(t)) errors.push(`${at}: unsupported type ${JSON.stringify(t)}`);
    }
    if (s.properties !== undefined) {
      if (typeof s.properties !== "object" || s.properties === null || Array.isArray(s.properties)) errors.push(`${at}.properties: must be an object`);
      else for (const [k, v] of Object.entries(s.properties)) walk(v, `${at}.properties.${k}`);
    }
    if (s.items !== undefined) {
      if (Array.isArray(s.items)) errors.push(`${at}.items: tuple form is unsupported`);
      else walk(s.items, `${at}.items`);
    }
    if (s.additionalProperties !== undefined && typeof s.additionalProperties !== "boolean")
      errors.push(`${at}.additionalProperties: only a boolean is supported`);
    if (s.required !== undefined && !(Array.isArray(s.required) && s.required.every((x) => typeof x === "string")))
      errors.push(`${at}.required: must be an array of strings`);
    if (s.enum !== undefined && !Array.isArray(s.enum)) errors.push(`${at}.enum: must be an array`);
    for (const k of ["minimum", "maximum"])
      if (s[k] !== undefined && (typeof s[k] !== "number" || !Number.isFinite(s[k])))
        errors.push(`${at}.${k}: must be a finite number`);
    for (const k of ["minLength", "maxLength", "minItems", "maxItems"])
      if (s[k] !== undefined && (!Number.isInteger(s[k]) || s[k] < 0))
        errors.push(`${at}.${k}: must be a non-negative integer`);
    if (s.pattern !== undefined && typeof s.pattern !== "string") errors.push(`${at}.pattern: must be a string`);
    if (s.pattern !== undefined) { try { new RegExp(s.pattern); } catch { errors.push(`${at}.pattern: invalid regular expression`); } }
  };
  walk(schema, where);
  return { ok: errors.length === 0, errors };
}

const typeMatches = (type, value) => {
  switch (type) {
    case "string": return typeof value === "string";
    case "number": return typeof value === "number" && Number.isFinite(value);
    case "integer": return typeof value === "number" && Number.isInteger(value);
    case "boolean": return typeof value === "boolean";
    case "array": return Array.isArray(value);
    case "object": return typeof value === "object" && value !== null && !Array.isArray(value);
    case "null": return value === null;
    default: return true;
  }
};

export function validateValue(schema, value, where = "$", errors = []) {
  if (typeof schema !== "object" || schema === null) return errors;
  if (schema.oneOf !== undefined) {
    const matches = schema.oneOf.filter((branch) => validateValue(branch, value, where, []).length === 0).length;
    if (matches !== 1) errors.push(`${where}: oneOf requires exactly one matching branch, found ${matches}`);
  }
  const types = schema.type === undefined ? [] : Array.isArray(schema.type) ? schema.type : [schema.type];
  if (types.length && !types.some((t) => typeMatches(t, value))) {
    errors.push(`${where}: expected ${types.join(" or ")}`);
    return errors;
  }
  if (schema.enum !== undefined && !schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(value)))
    errors.push(`${where}: not one of the permitted values`);
  if (typeof value === "string") {
    const n = [...value].length;
    if (schema.maxLength !== undefined && n > schema.maxLength) errors.push(`${where}: longer than ${schema.maxLength} characters`);
    if (schema.minLength !== undefined && n < schema.minLength) errors.push(`${where}: shorter than ${schema.minLength} characters`);
    if (schema.pattern !== undefined && !new RegExp(schema.pattern).test(value)) errors.push(`${where}: does not match the pattern`);
  }
  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${where}: below the minimum`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${where}: above the maximum`);
  }
  if (Array.isArray(value)) {
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${where}: more than ${schema.maxItems} items`);
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${where}: fewer than ${schema.minItems} items`);
    if (schema.items !== undefined) value.forEach((v, i) => validateValue(schema.items, v, `${where}[${i}]`, errors));
  }
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const props = schema.properties ?? {};
    for (const r of schema.required ?? []) if (!Object.hasOwn(value, r)) errors.push(`${where}: missing required ${r}`);
    if (schema.additionalProperties === false)
      for (const k of Object.keys(value)) if (!Object.hasOwn(props, k)) errors.push(`${where}: unexpected property ${k}`);
    for (const [k, s] of Object.entries(props)) if (Object.hasOwn(value, k)) validateValue(s, value[k], `${where}.${k}`, errors);
  }
  return errors;
}

export function validateOutput(schema, value) {
  const errors = validateValue(schema, value);
  return { ok: errors.length === 0, errors };
}

// The last balanced JSON object in a block of text, or null. Models wrap JSON in prose or fences;
// the answer is the object, not the wrapper.
