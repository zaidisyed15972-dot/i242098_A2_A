import { useEffect, useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header.jsx";
import { useBrowse } from "./context/BrowseContext.jsx";
import { useCart } from "./context/CartContext.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import ConfirmationPage from "./pages/ConfirmationPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ItemPage from "./pages/ItemPage.jsx";
import MenuPage from "./pages/MenuPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import useMenu from "./hooks/useMenu.js";
import { placeSimulatedOrder } from "./services/menuService.js";

export default function App() {
  const { cart, clearCart, reconcileCart, storageError: cartStorageError } = useCart();
  const { searchText, categoryFilter, sortOrder } = useBrowse();
  const {
    status,
    data: menu,
    error: menuError,
    retry,
    shouldFail,
    setShouldFail,
    updateStock,
    storageError: menuStorageError,
  } = useMenu();
  const [showAllCartItems, setShowAllCartItems] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    if (status === "success") {
      reconcileCart(menu);
    }
  }, [menu, reconcileCart, status]);

  const filteredMenu = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();
    const searchedItems = menu.filter((item) => {
      const searchableText = [
        item.name,
        item.description,
        ...item.ingredients,
      ].join(" ").toLowerCase();
      return !normalizedSearch || searchableText.includes(normalizedSearch);
    });
    const categorizedItems = searchedItems.filter((item) =>
      categoryFilter === "all" || item.category === categoryFilter
    );

    return [...categorizedItems].sort((first, second) => {
      if (sortOrder === "price-low") {
        return first.price - second.price;
      }
      if (sortOrder === "price-high") {
        return second.price - first.price;
      }
      return first.name.localeCompare(second.name);
    });
  }, [menu, searchText, categoryFilter, sortOrder]);

  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const storageError = cartStorageError || menuStorageError;

  async function handlePlaceOrder(order) {
    const simulatedOrder = await placeSimulatedOrder(order);
    setLastOrder({
      ...simulatedOrder,
      items: order.items,
      fulfilmentType: order.fulfilment,
      menu,
    });
    clearCart();
    return simulatedOrder;
  }

  return (
    <>
      <Header cartCount={cartCount} />
      {storageError && <p className="storage-warning" role="status">{storageError}</p>}
      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/menu"
            element={
              <MenuPage
                status={status}
                menu={menu}
                items={filteredMenu}
                error={menuError}
                retry={retry}
                shouldFail={shouldFail}
                setShouldFail={setShouldFail}
                updateStock={updateStock}
              />
            }
          />
          <Route
            path="/items/:id"
            element={
              status === "success"
                ? <ItemPage menu={menu} />
                : <MenuLoadState status={status} error={menuError} retry={retry} />
            }
          />
          <Route
            path="/cart"
            element={
              status === "success" ? (
                  <CartPage
                    cart={cart}
                    menu={menu}
                    filteredMenu={filteredMenu}
                    showAllCartItems={showAllCartItems}
                    setShowAllCartItems={setShowAllCartItems}
                  />
                ) : <MenuLoadState status={status} error={menuError} retry={retry} />
            }
          />
          <Route
            path="/checkout"
            element={
              status === "success"
                ? <CheckoutPage
                    cart={cart}
                    menu={menu}
                    onPlaceOrder={handlePlaceOrder}
                  />
                : <MenuLoadState status={status} error={menuError} retry={retry} />
            }
          />
          <Route path="/confirmation" element={<ConfirmationPage order={lastOrder} />} />
          <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <footer className="site-footer">Sehat Bowl · Islamabad · Simulated assignment project</footer>
    </>
  );
}

function MenuLoadState({ status, error, retry }) {
  if (status === "loading") {
    return (
      <main className="page-shell">
        <h1>Loading menu</h1>
        <p role="status" className="loading-message">Loading simulated menu…</p>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <h1>Menu unavailable</h1>
      <p role="alert" className="form-message">{error}</p>
      <button className="button" type="button" onClick={retry}>Retry</button>
    </main>
  );
}
