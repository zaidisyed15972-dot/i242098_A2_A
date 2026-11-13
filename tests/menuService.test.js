import assert from "node:assert/strict";
import test from "node:test";
import { menuItems } from "../src/data/menu.js";
import { fetchMenu, loadMenu } from "../src/services/menuService.js";

test("menu data has stable IDs and the required meal and bundle fields", () => {
  const mealItems = menuItems.filter((item) => item.category === "meal");
  const bundles = menuItems.filter((item) => item.category === "bundle");
  const requiredFields = [
    "id",
    "name",
    "category",
    "description",
    "dietaryTags",
    "price",
    "ingredients",
    "portionSize",
    "stock",
    "image",
  ];

  assert.ok(mealItems.length >= 10);
  assert.ok(bundles.length >= 2);
  assert.equal(new Set(menuItems.map((item) => item.id)).size, menuItems.length);

  for (const item of menuItems) {
    for (const field of requiredFields) {
      assert.ok(Object.hasOwn(item, field), `${item.id} is missing ${field}`);
    }
    assert.equal(typeof item.id, "string");
    assert.equal(typeof item.price, "number");
    assert.ok(Array.isArray(item.dietaryTags));
    assert.ok(Array.isArray(item.ingredients));
    assert.ok(item.image === null || typeof item.image === "string");
  }

  for (const bundle of bundles) {
    assert.ok(Array.isArray(bundle.eligibleItemIds));
    assert.ok(bundle.eligibleItemIds.length > 0);
    for (const itemId of bundle.eligibleItemIds) {
      assert.ok(mealItems.some((item) => item.id === itemId));
    }
  }
});

test("loadMenu returns menu data after the simulated delay", async () => {
  const startedAt = Date.now();
  const result = await loadMenu();

  assert.ok(Date.now() - startedAt >= 750);
  assert.equal(result.error, null);
  assert.ok(Array.isArray(result.data));
  assert.equal(result.data.length, menuItems.length);
});

test("loadMenu returns an error object when the simulated request fails", async () => {
  const result = await loadMenu({ shouldFail: true });

  assert.equal(result.data, null);
  assert.ok(result.error instanceof Error);
  assert.match(result.error.message, /simulated menu could not be loaded/i);
});

test("fetchMenu rejects when failure is requested", async () => {
  await assert.rejects(
    fetchMenu({ shouldFail: true }),
    /simulated menu could not be loaded/i,
  );
});
