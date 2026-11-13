export const DELIVERY_ZONES = ["F-7", "F-10", "G-9", "Bahria Town"];

export function validateName(name) {
  if (!name.trim()) {
    return "Enter a name for this simulated order.";
  }
  if (name.trim().length < 2) {
    return "Name must be at least 2 characters.";
  }
  return "";
}

export function validatePhone(phone) {
  if (!/^03\d{2}-\d{7}$/.test(phone.trim())) {
    return "Use Pakistani mobile format 03XX-XXXXXXX.";
  }
  return "";
}

export function validateZone(zone, fulfilmentType) {
  if (fulfilmentType !== "delivery") {
    return "";
  }
  if (!zone) {
    return "Choose a delivery zone.";
  }
  if (!DELIVERY_ZONES.includes(zone)) {
    return "Choose one of the listed delivery zones.";
  }
  return "";
}

export function validateForm(values) {
  const errors = {};
  const nameError = validateName(values.name);
  const phoneError = validatePhone(values.phone);
  const zoneError = validateZone(values.zone, values.fulfilment);

  if (nameError) {
    errors.name = nameError;
  }
  if (phoneError) {
    errors.phone = phoneError;
  }
  if (!["delivery", "collection"].includes(values.fulfilment)) {
    errors.fulfilment = "Choose delivery or collection.";
  }
  if (zoneError) {
    errors.zone = zoneError;
  }
  return errors;
}
