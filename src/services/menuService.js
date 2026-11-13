import { menuItems } from "../data/menu.js";

export function fetchMenu(options = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (options.shouldFail) {
        reject(new Error("The simulated menu could not be loaded."));
        return;
      }

      resolve(menuItems.map((item) => ({
        ...item,
        dietaryTags: [...item.dietaryTags],
        ingredients: [...item.ingredients],
        ...(item.eligibleItemIds
          ? { eligibleItemIds: [...item.eligibleItemIds] }
          : {}),
      })));
    }, 800);
  });
}

export async function loadMenu(options = {}) {
  try {
    const data = await fetchMenu(options);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function placeSimulatedOrder(order) {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (!order.items.length) {
        reject(new Error("Your cart is empty."));
        return;
      }

      resolve({
        reference: `SIM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        placedAt: new Date().toISOString(),
      });
    }, 350);
  });
}
