import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import OrderPolicy from "../components/OrderPolicy.jsx";
import Price from "../components/Price.jsx";
import QuantityControl from "../components/QuantityControl.jsx";
import { useCart } from "../context/CartContext.jsx";
import {
  BUNDLE_MAX,
  BUNDLE_MIN,
  checkBundleSize,
  checkQuantity,
  MAX_QUANTITY,
} from "../rules/orderRules.js";

export default function ItemPage({ menu }) {
  const { id } = useParams();
  const item = menu.find((menuItem) => menuItem.id === id);
  const { cart, addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [mealCount, setMealCount] = useState(5);
  const [message, setMessage] = useState("");

  if (!item) {
    return (
      <main className="page-shell centered-state">
        <h1>Menu item not found</h1>
        <p>That item is not in the menu.</p>
        <Link className="button" to="/menu">Back to menu</Link>
      </main>
    );
  }

  const availabilityResult = checkQuantity(1, item.stock);
  const soldOut = !availabilityResult.valid;
  const existingLine = cart.find((line) => line.itemId === item.id);
  const quantityResult = checkQuantity(
    quantity + (existingLine?.quantity || 0),
    item.stock,
  );
  const bundleResult = checkBundleSize(mealCount);

  function handleAdd() {
    if (!quantityResult.valid || (item.category === "bundle" && !bundleResult.valid)) {
      return;
    }

    addItem(item.id, quantity, item.category === "bundle" ? mealCount : undefined);
    setMessage(`${item.name} added to your cart.`);
  }

  const price = item.category === "bundle" ? item.price * mealCount : item.price;

  return (
    <main className="page-shell">
      <Link className="back-link button-secondary" to="/menu">← Back to menu</Link>
      <OrderPolicy />
      <article className="item-detail">
        <div className="detail-art" role="img" aria-label={item.imageAlt}>
          {item.image
            ? <img src={item.image} alt="" />
            : <span aria-hidden="true">{item.category === "bundle" ? "📦" : "🥘"}</span>}
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{item.category === "bundle" ? "Meal bundle" : "Prepared meal"}</p>
          <h1>{item.name}</h1>
          <p className="detail-description">{item.description}</p>
          <p className="detail-price">
            <Price amount={price} />
            {item.category === "bundle" && <small> for {mealCount} meals</small>}
          </p>
          <p className="stock-status">
            {soldOut ? "Sold out" : `${item.stock} available today`}
          </p>
          <p><strong>Portion:</strong> {item.portionSize}</p>
          <p><strong>Ingredients:</strong> {item.ingredients.join(", ")}</p>
          <p>
            <strong>Dietary tags:</strong>{" "}
            {item.dietaryTags.length > 0 ? item.dietaryTags.join(", ") : "None"}
          </p>

          {item.category === "bundle" && (
            <label className="field-control">
              <span>Meals in this bundle <small>(must be {BUNDLE_MIN} to {BUNDLE_MAX})</small></span>
              <input
                type="number"
                min="1"
                max="8"
                value={mealCount}
                onChange={(event) => setMealCount(Number(event.target.value))}
                aria-describedby="bundle-rule"
                aria-invalid={!bundleResult.valid}
              />
              <small id="bundle-rule">
                {bundleResult.valid
                  ? `Choose ${BUNDLE_MIN} to ${BUNDLE_MAX} meals.`
                  : bundleResult.message}
              </small>
            </label>
          )}

          {!soldOut && (
            <QuantityControl
              value={quantity}
              min={1}
              max={MAX_QUANTITY}
              onChange={setQuantity}
            />
          )}
          {!quantityResult.valid && (
            <p className="form-message" role="alert">{quantityResult.message}</p>
          )}
          {message && <p className="success-message" role="status">{message}</p>}
          <button
            className="button"
            type="button"
            onClick={handleAdd}
            disabled={soldOut || !quantityResult.valid || (item.category === "bundle" && !bundleResult.valid)}
          >
            {soldOut ? "Sold out" : "Add to cart"}
          </button>
          <Link className="text-link button-secondary detail-cart-link" to="/cart">Review your cart</Link>
        </div>
      </article>
      <p className="simulated-note">Simulated stock and ordering. No payment is collected.</p>
    </main>
  );
}
