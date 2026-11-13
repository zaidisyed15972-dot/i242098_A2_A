import { Link } from "react-router-dom";
import { useState } from "react";
import OrderPolicy from "../components/OrderPolicy.jsx";
import OrderSummary from "../components/OrderSummary.jsx";
import Price from "../components/Price.jsx";
import QuantityControl from "../components/QuantityControl.jsx";
import { useCart } from "../context/CartContext.jsx";
import {
  BUNDLE_MAX,
  BUNDLE_MIN,
  checkQuantity,
  getLineTotal,
  MAX_QUANTITY,
} from "../rules/orderRules.js";

export default function CartPage({
  cart,
  menu,
  filteredMenu,
  showAllCartItems,
  setShowAllCartItems,
}) {
  const { changeQuantity, clearCart, removeItem, fulfilmentType } = useCart();
  const [quantityMessages, setQuantityMessages] = useState({});
  const visibleProductIds = new Set(filteredMenu.map((item) => item.id));
  const hiddenLines = cart.filter((line) => !visibleProductIds.has(line.itemId));
  const shownLines = showAllCartItems
    ? cart
    : cart.filter((line) => visibleProductIds.has(line.itemId));
  function handleQuantityChange(item, itemId, quantity) {
    const result = checkQuantity(quantity, item.stock);
    setQuantityMessages((messages) => ({ ...messages, [itemId]: result.message }));
    if (result.valid && result.remove) {
      removeItem(itemId);
    } else if (result.valid) {
      changeQuantity(itemId, quantity, item.stock);
    }
  }

  return (
    <main className="page-shell narrow-shell">
      <p className="eyebrow">Your selection</p>
      <h1>Your cart</h1>
      <OrderPolicy />

      {cart.length === 0 ? (
        <section className="empty-state">
          <h2>Your cart is empty</h2>
          <p>Choose a meal or build a weekly bundle to get started.</p>
          <Link className="button" to="/menu">Browse the menu</Link>
          <button className="text-button clear-cart-button" type="button" onClick={clearCart}>
            Clear saved cart
          </button>
        </section>
      ) : (
        <>
          {cart.some((line) => line.conflictMessage) && (
            <p className="form-message" role="alert">
              Resolve saved cart conflicts before continuing to checkout.
            </p>
          )}
          {hiddenLines.length > 0 && (
            <aside className="hidden-items">
              <div>
                <strong>{hiddenLines.length} cart item{hiddenLines.length === 1 ? "" : "s"} hidden by your current menu filters</strong>
                <ul>
                  {hiddenLines.map((line) => {
                    const item = menu.find((menuItem) => menuItem.id === line.itemId);
                    return (
                      <li key={line.itemId}>
                        {item?.name}{line.mealCount ? ` (${line.mealCount} meals)` : ""} · Qty {line.quantity}
                        {line.conflictMessage ? ` — ${line.conflictMessage}` : ""}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <button
                className="text-button"
                type="button"
                onClick={() => setShowAllCartItems(!showAllCartItems)}
              >
                {showAllCartItems ? "Use current filters" : "View all cart items"}
              </button>
            </aside>
          )}
          {shownLines.length > 0 ? (
            <div className="cart-list">
              {shownLines.map((line) => {
                const item = menu.find((menuItem) => menuItem.id === line.itemId);
                if (!item) {
                  return null;
                }
                return (
                  <article className="cart-row" key={line.itemId}>
                    <div className="cart-item-name">
                      <h2>{item.name}</h2>
                      {line.conflictMessage && (
                        <p className="form-message" role="alert">{line.conflictMessage}</p>
                      )}
                      {line.mealCount && <p>{line.mealCount} meals in this bundle</p>}
                      {item.category === "bundle" && (
                        <p>Bundle size: {BUNDLE_MIN} to {BUNDLE_MAX} meals</p>
                      )}
                      <p><Price amount={getLineTotal({ ...line, quantity: 1 }, menu)} /> each</p>
                    </div>
                    <div className="cart-quantity">
                      <QuantityControl
                        value={line.quantity}
                        min={1}
                        max={MAX_QUANTITY}
                        onChange={(quantity) => handleQuantityChange(item, line.itemId, quantity)}
                      />
                      {quantityMessages[line.itemId] && (
                        <small className="form-message">{quantityMessages[line.itemId]}</small>
                      )}
                      <button
                        className="remove-button"
                        type="button"
                        onClick={() => removeItem(line.itemId)}
                      >
                        Remove
                      </button>
                    </div>
                    <strong className="line-total"><Price amount={getLineTotal(line, menu)} /></strong>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="empty-state">
              No cart items match the current menu filters. Use “View all cart items” above.
            </p>
          )}

          <div className="cart-summary">
            <OrderSummary cart={cart} menu={menu} fulfilmentType={fulfilmentType} />
            {cart.some((line) => line.conflictMessage) ? (
              <button className="button checkout-button" type="button" disabled>
                Resolve cart conflicts to continue
              </button>
            ) : (
              <Link className="button checkout-button" to="/checkout">Continue to checkout</Link>
            )}
            <button className="text-button clear-cart-button" type="button" onClick={clearCart}>
              Clear saved cart
            </button>
          </div>
        </>
      )}
      <p className="simulated-note">Your cart is saved in this browser for this simulated order.</p>
    </main>
  );
}
