const UUIDv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PANRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

function ensurePresentKeys(obj, keys) {
  return keys.filter((k) => !(k in obj));
}

// Normalize Indian mobile numbers to 10 digits
function normalizeMobile(raw) {
  if (raw === undefined || raw === null) return null;
  let digits = String(raw).replace(/\D/g, '');

  if (digits.startsWith('91') && digits.length > 10) digits = digits.slice(-10);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);

  if (digits.length !== 10) return null;
  if (!/^[6-9]\d{9}$/.test(digits)) return null;

  return digits;
}

function validatePAN(pan) {
  if (typeof pan !== 'string') return null;
  const up = pan.toUpperCase().trim();
  return PANRegex.test(up) ? up : null;
}

function isUUIDv4(s) {
  if (typeof s !== 'string') return false;
  return UUIDv4Regex.test(s.trim());
}

function validateFullName(name) {
  if (typeof name !== 'string') return null;
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : null;
}

module.exports = {
  ensurePresentKeys,
  normalizeMobile,
  validatePAN,
  isUUIDv4,
  validateFullName,
};
