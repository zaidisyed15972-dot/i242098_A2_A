import { useCallback, useEffect, useState } from "react";
import { loadMenu } from "../services/menuService.js";

const FAILURE_KEY = "sehat-bowl-demo-load-failure";
const STOCK_OVERRIDES_KEY = "sehat-bowl-demo-stock";

function readFailurePreference() {
  try {
    return {
      value: window.localStorage.getItem(FAILURE_KEY) === "true",
      error: "",
    };
  } catch {
    return {
      value: false,
      error: "Demo failure setting could not be read in this browser.",
    };
  }
}

function readStockOverrides() {
  try {
    const savedOverrides = window.localStorage.getItem(STOCK_OVERRIDES_KEY);
    if (!savedOverrides) {
      return { overrides: {}, error: "" };
    }

    const parsedOverrides = JSON.parse(savedOverrides);
    if (
      !parsedOverrides ||
      typeof parsedOverrides !== "object" ||
      Array.isArray(parsedOverrides) ||
      Object.values(parsedOverrides).some(
        (stock) => !Number.isInteger(stock) || stock < 0,
      )
    ) {
      throw new Error("Saved stock controls are invalid.");
    }
    return { overrides: parsedOverrides, error: "" };
  } catch {
    let message = "Saved demo stock data was invalid and has been cleared.";
    try {
      window.localStorage.removeItem(STOCK_OVERRIDES_KEY);
    } catch {
      message = "Saved demo stock data could not be read or cleared.";
    }
    return { overrides: {}, error: message };
  }
}

export default function useMenu() {
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [failurePreference] = useState(readFailurePreference);
  const [shouldFail, setShouldFailState] = useState(failurePreference.value);
  const [requestNumber, setRequestNumber] = useState(0);
  const [stockStorageError, setStockStorageError] = useState(failurePreference.error);

  useEffect(() => {
    try {
      window.localStorage.setItem(FAILURE_KEY, String(shouldFail));
    } catch {
      setStockStorageError("Demo failure setting could not be saved.");
    }
  }, [shouldFail]);

  useEffect(() => {
    let cancelled = false;

    async function fetchMenuData() {
      setStatus("loading");
      setError("");

      try {
        const result = await loadMenu({ shouldFail });
        if (cancelled) {
          return;
        }
        if (result.error) {
          setData([]);
          setError(result.error.message);
          setStatus("error");
          return;
        }

        const { overrides: stockOverrides, error: stockError } = readStockOverrides();
        const menuWithStock = result.data.map((item) => ({
          ...item,
          ...(Object.hasOwn(stockOverrides, item.id)
            ? { stock: stockOverrides[item.id] }
            : {}),
        }));
        setData(menuWithStock);
        if (stockError) {
          setStockStorageError(stockError);
        }
        setStatus("success");
      } catch (loadError) {
        if (!cancelled) {
          setData([]);
          setError(loadError.message || "The simulated menu could not be loaded.");
          setStatus("error");
        }
      }
    }

    fetchMenuData();
    return () => {
      cancelled = true;
    };
  }, [requestNumber, shouldFail]);

  const retry = useCallback(() => {
    setStatus("loading");
    setRequestNumber((currentNumber) => currentNumber + 1);
  }, []);

  const setShouldFail = useCallback((nextValue) => {
    setShouldFailState(nextValue);
  }, []);

  const updateStock = useCallback((itemId, stock) => {
    setData((currentData) =>
      currentData.map((item) => item.id === itemId ? { ...item, stock } : item)
    );

    try {
      const { overrides: currentOverrides, error } = readStockOverrides();
      if (error) {
        setStockStorageError(error);
      }
      window.localStorage.setItem(
        STOCK_OVERRIDES_KEY,
        JSON.stringify({ ...currentOverrides, [itemId]: stock }),
      );
      setStockStorageError("");
    } catch {
      setStockStorageError("Stock change could not be saved in this browser.");
    }
  }, []);

  return {
    status,
    data,
    error,
    retry,
    shouldFail,
    setShouldFail,
    updateStock,
    storageError: stockStorageError,
  };
}
