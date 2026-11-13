import { checkBundleSize, checkQuantity } from "./orderRules.js";

export function restoreCartData(storedValue, menu) {
  if (!storedValue) {
    return { cart: [], notice: "" };
  }

  try {
    const storedCart = JSON.parse(storedValue);
    if (
      !Array.isArray(storedCart) ||
      storedCart.some((line) =>
        !line ||
        typeof line.itemId !== "string" ||
        typeof line.quantity !== "number" ||
        !Number.isFinite(line.quantity) ||
        ("mealCount" in line && (
          typeof line.mealCount !== "number" ||
          !Number.isFinite(line.mealCount)
        ))
      )
    ) {
      return {
        cart: [],
        notice: "Saved cart data was invalid and has been cleared.",
        shouldRemoveSavedCart: true,
      };
    }

    const restoredCart = [];
    let removedMissingItems = false;

    for (const savedLine of storedCart) {
      const item = menu.find((menuItem) => menuItem.id === savedLine.itemId);
      if (!item) {
        removedMissingItems = true;
        continue;
      }

      const quantityResult = checkQuantity(savedLine.quantity, item.stock);
      const bundleResult = item.category === "bundle"
        ? checkBundleSize(savedLine.mealCount)
        : { valid: true, message: "" };
      const quantityConflictMessage = quantityResult.valid
        ? ""
        : savedLine.quantity > item.stock
          ? `Only ${item.stock} left. Reduce quantity to continue.`
          : quantityResult.message;
      const conflictMessages = [
        quantityConflictMessage,
        !bundleResult.valid ? bundleResult.message : "",
      ].filter(Boolean);

      if (quantityResult.remove) {
        continue;
      }

      restoredCart.push({
        itemId: savedLine.itemId,
        quantity: savedLine.quantity,
        ...(item.category === "bundle" ? { mealCount: savedLine.mealCount } : {}),
        ...(conflictMessages.length > 0
          ? { conflictMessage: conflictMessages.join(" ") }
          : {}),
      });
    }

    return {
      cart: restoredCart,
      notice: removedMissingItems
        ? "Saved items no longer on the menu were removed."
        : "",
    };
  } catch {
    return {
      cart: [],
      notice: "Saved cart data was invalid and has been cleared.",
      shouldRemoveSavedCart: true,
    };
  }
}
