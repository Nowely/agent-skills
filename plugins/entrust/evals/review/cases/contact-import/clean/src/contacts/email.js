const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function isEmail(email) {
  return EMAIL.test(normalizeEmail(email));
}
