// The countries the shop delivers to, as ISO 3166 codes.
export const ALLOWED = ["US", "GB", "DE"];

export const isAllowed = (code) => ALLOWED.includes(code);
