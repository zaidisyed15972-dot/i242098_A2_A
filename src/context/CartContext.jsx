import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { menuItems } from "../data/menu.js";
import { restoreCartData } from "../rules/cartPersistence.js";
import { checkBundleSize, checkQuantity } from "../rules/orderRules.js";

const CartContext = createContext(null);
const STORAGE_KEY = "sehat-bowl-cart";
const FULFILMENT_STORAGE_KEY = "sehat-bowl-fulfilment";

function readStoredState() {
  const state = {
    cart: [],
    fulfilmentType: "delivery",
    notice: "",
  };

  try {
    const restoredCart = restoreCartData(
      window.localStorage.getItem(STORAGE_KEY),
      menuItems,
    );
    state.cart = restoredCart.cart;
    state.notice = restoredCart.notice;

    if (restoredCart.shouldRemoveSavedCart) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    state.notice = "Browser storage is unavailable; cart changes may not persist.";
  }

  try {
    const savedFulfilment = window.localStorage.getItem(FULFILMENT_STORAGE_KEY);
    if (savedFulfilment === "delivery" || savedFulfilment === "collection") {
      state.fulfilmentType = savedFulfilment;
    } else if (savedFulfilment !== null) {
      window.localStorage.removeItem(FULFILMENT_STORAGE_KEY);
      state.notice ||= "Saved fulfilment preference was invalid and has been cleared.";
    }
  } catch {
    state.notice ||= "Browser storage is unavailable; preferences may not persist.";
  }

  return state;
}

export function CartProvider({ children }) {
  const [initialState] = useState(readStoredState);
  const [cart, setCart] = useState(initialState.cart);
  const [fulfilmentType, setFulfilmentType] = useState(initialState.fulfilmentType);
  const [storageError, setStorageError] = useState(initialState.notice);

  useEffect(() => {
    try {
      if (cart.length === 0) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        const savedCart = cart.map(({ itemId, quantity, mealCount }) => ({
          itemId,
          quantity,
          ...(mealCount !== undefined ? { mealCount } : {}),
        }));
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCart));
      }
    } catch {
      setStorageError("Cart changes could not be saved in this browser.");
    }
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem(FULFILMENT_STORAGE_KEY, fulfilmentType);
    } catch {
      setStorageError("Fulfilment preference could not be saved in this browser.");
    }
  }, [fulfilmentType]);

  function addItem(itemId, quantity, mealCount) {
    setCart((currentCart) => {
      const existingLine = currentCart.find((line) => line.itemId === itemId);
      if (existingLine) {
        return currentCart.map((line) =>
          line.itemId === itemId
            ? {
                ...line,
                quantity: line.quantity + quantity,
                ...(mealCount ? { mealCount } : {}),
                conflictMessage: "",
              }
            : line
        );
      }

      return [
        ...currentCart,
        {
          itemId,
          quantity,
          ...(mealCount ? { mealCount } : {}),
        },
      ];
    });
  }

  function changeQuantity(itemId, quantity, currentStock) {
    setCart((currentCart) => {
      if (quantity === 0) {
        return currentCart.filter((line) => line.itemId !== itemId);
      }

      const item = menuItems.find((menuItem) => menuItem.id === itemId);
      if (!item) {
        return currentCart;
      }

      const line = currentCart.find((cartLine) => cartLine.itemId === itemId);
      const quantityResult = checkQuantity(quantity, currentStock ?? item.stock);
      if (!quantityResult.valid) {
        return currentCart;
      }

      const bundleResult = item.category === "bundle"
        ? checkBundleSize(line?.mealCount)
        : { valid: true, message: "" };
      const conflictMessage = bundleResult.valid ? "" : bundleResult.message;

      return currentCart.map((cartLine) =>
        cartLine.itemId === itemId
          ? {
              ...cartLine,
              quantity,
              conflictMessage,
            }
          : cartLine
      );
    });
  }

  const reconcileCart = useCallback((menu) => {
    setCart((currentCart) =>
      currentCart.flatMap((line) => {
        const item = menu.find((menuItem) => menuItem.id === line.itemId);
        if (!item) {
          return [];
        }

        const quantityResult = checkQuantity(line.quantity, item.stock);
        const bundleResult = item.category === "bundle"
          ? checkBundleSize(line.mealCount)
          : { valid: true, message: "" };
        const quantityMessage = quantityResult.valid
          ? ""
          : line.quantity > item.stock
            ? `Only ${item.stock} left. Reduce quantity to continue.`
            : quantityResult.message;
        const conflictMessage = [
          quantityMessage,
          !bundleResult.valid ? bundleResult.message : "",
        ].filter(Boolean).join(" ");

        return [{
          ...line,
          conflictMessage,
        }];
      })
    );
  }, []);

  function removeItem(itemId) {
    setCart((currentCart) =>
      currentCart.filter((line) => line.itemId !== itemId)
    );
  }

  function clearCart() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      setStorageError("Saved cart could not be cleared from this browser.");
    }
    setCart(() => []);
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        changeQuantity,
        reconcileCart,
        removeItem,
        clearCart,
        fulfilmentType,
        setFulfilmentType,
        storageError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }
  return context;
}
