const DATE = /^\d{4}-\d{2}-\d{2}$/;

function typeOf(value) {
  return value === null ? "null" : typeof value;
}

// Checks the subset of JSON Schema the contracts use: required, type, enum and the date format.
export function validate(schema, value) {
  const problems = [];
  for (const key of schema.required ?? []) {
    if (!(key in value)) problems.push(`${key} is missing`);
  }
  for (const [key, rule] of Object.entries(schema.properties ?? {})) {
    if (!(key in value)) continue;
    const field = value[key];
    if (rule.type && ![].concat(rule.type).includes(typeOf(field))) problems.push(`${key} has type ${typeOf(field)}`);
    if (rule.enum && !rule.enum.includes(field)) problems.push(`${key} is not one of ${rule.enum.join(", ")}`);
    if (rule.format === "date" && typeof field === "string" && !(DATE.test(field) && !Number.isNaN(Date.parse(field)))) {
      problems.push(`${key} is not a date`);
    }
  }
  return problems;
}
