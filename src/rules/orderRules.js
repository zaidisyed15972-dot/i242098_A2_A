export const DELIVERY_MINIMUM = 1500;
export const DELIVERY_FEE = 150;
export const MAX_QUANTITY = 10;
export const BUNDLE_MIN = 5;
export const BUNDLE_MAX = 7;

export function formatPrice(amount) {
  return amount.toLocaleString("en-PK");
}

export function checkDeliveryMinimum(subtotal, fulfilmentType) {
  if (fulfilmentType === "collection" || subtotal >= DELIVERY_MINIMUM) {
    return { valid: true, remaining: 0, message: "" };
  }

  const remaining = Math.max(0, DELIVERY_MINIMUM - subtotal);
  return {
    valid: false,
    remaining,
    message: `Add Rs. ${formatPrice(remaining)} more to place a delivery order.`,
  };
}

export function checkQuantity(requested, stock) {
  if (!Number.isInteger(requested)) {
    return { valid: false, message: "Enter a whole-number quantity." };
  }
  if (requested === 0) {
    return { valid: true, remove: true, message: "" };
  }
  if (requested < 0) {
    return { valid: false, message: "Quantity cannot be negative." };
  }
  if (requested > MAX_QUANTITY) {
    return {
      valid: false,
      message: `You can order up to ${MAX_QUANTITY} of one item.`,
    };
  }
  if (requested > stock) {
    return {
      valid: false,
      message: `Only ${stock} available today.`,
    };
  }
  return { valid: true, message: "" };
}

export function checkBundleSize(mealCount) {
  if (
    !Number.isInteger(mealCount) ||
    mealCount < BUNDLE_MIN ||
    mealCount > BUNDLE_MAX
  ) {
    return {
      valid: false,
      message: `A weekly bundle must contain ${BUNDLE_MIN} to ${BUNDLE_MAX} meals.`,
    };
  }
  return { valid: true, message: "" };
}

export function deliveryFeeFor(fulfilmentType) {
  return fulfilmentType === "delivery" ? DELIVERY_FEE : 0;
}

export function getLineTotal(line, menu) {
  const item = menu.find((menuItem) => menuItem.id === line.itemId);
  if (!item) {
    return 0;
  }

  const unitPrice =
    item.category === "bundle"
      ? item.price * line.mealCount
      : item.price;
  return unitPrice * line.quantity;
}

export function getCartSubtotal(cart, menu) {
  return cart.reduce((total, line) => total + getLineTotal(line, menu), 0);
}
