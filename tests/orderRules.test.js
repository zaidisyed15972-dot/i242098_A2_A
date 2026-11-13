import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BUNDLE_MAX,
  BUNDLE_MIN,
  DELIVERY_FEE,
  DELIVERY_MINIMUM,
  MAX_QUANTITY,
  checkBundleSize,
  checkDeliveryMinimum,
  checkQuantity,
  getCartSubtotal,
  deliveryFeeFor,
} from "../src/rules/orderRules.js";
import {
  DELIVERY_ZONES,
  validateForm,
  validateName,
  validatePhone,
  validateZone,
} from "../src/rules/checkoutValidation.js";
import { restoreCartData } from "../src/rules/cartPersistence.js";
import { menuItems } from "../src/data/menu.js";

test("delivery minimum accepts Rs. 1,500 and blocks Rs. 1,499", () => {
  assert.equal(DELIVERY_MINIMUM, 1500);
  assert.deepEqual(checkDeliveryMinimum(1500, "delivery"), {
    valid: true,
    remaining: 0,
    message: "",
  });
  assert.deepEqual(checkDeliveryMinimum(1499, "delivery"), {
    valid: false,
    remaining: 1,
    message: "Add Rs. 1 more to place a delivery order.",
  });
  assert.equal(DELIVERY_FEE, 150);
  assert.equal(deliveryFeeFor("delivery"), 150);
  assert.equal(deliveryFeeFor("collection"), 0);
  assert.equal(checkDeliveryMinimum(0, "collection").valid, true);
});

test("quantity validates stock, limits, removal, and whole-number input", () => {
  assert.equal(MAX_QUANTITY, 10);
  assert.deepEqual(checkQuantity(3, 20), { valid: true, message: "" });
  assert.deepEqual(checkQuantity(10, 10), { valid: true, message: "" });
  assert.deepEqual(checkQuantity(11, 20), {
    valid: false,
    message: "You can order up to 10 of one item.",
  });
  assert.match(checkQuantity(6, 5).message, /Only 5 available today/);
  assert.deepEqual(checkQuantity(0, 5), {
    valid: true,
    remove: true,
    message: "",
  });
  assert.match(checkQuantity(1.5, 5).message, /whole-number/);
  assert.match(checkQuantity(1, 0).message, /Only 0 available today/);
});

test("weekly bundles accept five and seven meals only", () => {
  assert.equal(BUNDLE_MIN, 5);
  assert.equal(BUNDLE_MAX, 7);
  assert.deepEqual(checkBundleSize(5), { valid: true, message: "" });
  assert.deepEqual(checkBundleSize(7), { valid: true, message: "" });
  assert.match(checkBundleSize(4).message, /5 to 7 meals/);
  assert.match(checkBundleSize(8).message, /5 to 7 meals/);
});

test("cart subtotal is derived from meal prices and quantities", () => {
  const menu = [
    { id: "lunch", category: "meal", price: 500 },
    { id: "bundle", category: "bundle", price: 600 },
  ];
  const cart = [
    { itemId: "lunch", quantity: 2 },
    { itemId: "bundle", mealCount: 5, quantity: 1 },
  ];
  assert.equal(getCartSubtotal(cart, menu), 4000);
});

test("checkout validators accept valid simulated contact and delivery details", () => {
  assert.equal(validateName("A"), "Name must be at least 2 characters.");
  assert.equal(validateName(" Sample "), "");
  assert.equal(validatePhone("0300-1234567"), "");
  assert.match(validatePhone("03001234567"), /03XX-XXXXXXX/);
  assert.equal(validateZone("F-7", "delivery"), "");
  assert.match(validateZone("", "delivery"), /Choose a delivery zone/);
  assert.match(validateZone("Unknown", "delivery"), /listed delivery zones/);
  assert.equal(validateZone("", "collection"), "");
  assert.deepEqual(DELIVERY_ZONES, ["F-7", "F-10", "G-9", "Bahria Town"]);
});

test("form validation reports only invalid fields and preserves entered values", () => {
  const values = {
    name: "Sample Student",
    phone: "03001234567",
    fulfilment: "delivery",
    zone: "F-7",
    notes: "Less chilli",
  };
  assert.deepEqual(validateForm(values), {
    phone: "Use Pakistani mobile format 03XX-XXXXXXX.",
  });
  assert.equal(values.name, "Sample Student");
  assert.equal(values.zone, "F-7");
});

test("form validation requires a name, phone, fulfilment, and delivery zone", () => {
  assert.deepEqual(validateForm({
    name: " ",
    phone: "",
    fulfilment: "",
    zone: "",
    notes: "",
  }), {
    name: "Enter a name for this simulated order.",
    phone: "Use Pakistani mobile format 03XX-XXXXXXX.",
    fulfilment: "Choose delivery or collection.",
  });
  assert.deepEqual(validateForm({
    name: "Sample Student",
    phone: "0300-1234567",
    fulfilment: "delivery",
    zone: "",
    notes: "",
  }), {
    zone: "Choose a delivery zone.",
  });
});

test("cart restore clears invalid data and validates restored lines", () => {
  const corrupt = restoreCartData("{bad json", menuItems);
  assert.deepEqual(corrupt.cart, []);
  assert.equal(corrupt.shouldRemoveSavedCart, true);
  assert.match(corrupt.notice, /invalid and has been cleared/);

  const malformed = restoreCartData(
    JSON.stringify([{ itemId: "chicken-grain-bowl", quantity: "2" }]),
    menuItems,
  );
  assert.deepEqual(malformed.cart, []);
  assert.equal(malformed.shouldRemoveSavedCart, true);

  const restored = restoreCartData(JSON.stringify([
    { itemId: "chicken-grain-bowl", quantity: 2 },
    { itemId: "roasted-veggie-bowl", quantity: 20 },
    { itemId: "weekly-meal-bundle", quantity: 1, mealCount: 4 },
    { itemId: "removed-menu-item", quantity: 1 },
  ]), menuItems);

  assert.deepEqual(restored.cart, [
    { itemId: "chicken-grain-bowl", quantity: 2 },
    {
      itemId: "roasted-veggie-bowl",
      quantity: 20,
      conflictMessage: "Only 8 left. Reduce quantity to continue.",
    },
    {
      itemId: "weekly-meal-bundle",
      quantity: 1,
      mealCount: 4,
      conflictMessage: "A weekly bundle must contain 5 to 7 meals.",
    },
  ]);
  assert.match(restored.notice, /no longer on the menu were removed/);
});
