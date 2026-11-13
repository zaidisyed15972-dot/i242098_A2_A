import Price from "./Price.jsx";
import {
  checkDeliveryMinimum,
  deliveryFeeFor,
  getCartSubtotal,
  getLineTotal,
} from "../rules/orderRules.js";

export default function OrderSummary({
  cart,
  menu,
  fulfilmentType,
  className = "order-summary",
}) {
  const itemCount = cart.reduce((total, line) => total + line.quantity, 0);
  const subtotal = getCartSubtotal(cart, menu);
  const deliveryFee = deliveryFeeFor(fulfilmentType);
  const total = subtotal + deliveryFee;
  const deliveryMinimum = checkDeliveryMinimum(subtotal, fulfilmentType);

  return (
    <section className={className} aria-label="Order summary">
      <h2>Order summary</h2>
      <ul className="order-summary-items">
        {cart.map((line) => {
          const item = menu.find((menuItem) => menuItem.id === line.itemId);
          return (
            <li key={line.itemId}>
              <span>
                {item?.name}
                {line.mealCount ? ` · ${line.mealCount} meals` : ""} × {line.quantity}
              </span>
              <strong><Price amount={getLineTotal(line, menu)} /></strong>
            </li>
          );
        })}
      </ul>
      <div><span>Item count</span><strong>{itemCount}</strong></div>
      <div><span>Subtotal</span><strong><Price amount={subtotal} /></strong></div>
      <div>
        <span>{fulfilmentType === "collection" ? "Collection fee" : "Delivery fee"}</span>
        <strong><Price amount={deliveryFee} /></strong>
      </div>
      <div className="summary-total"><span>Total</span><strong><Price amount={total} /></strong></div>
      <div>
        <span>Remaining to delivery minimum</span>
        <strong>
          {fulfilmentType === "collection"
            ? "No minimum"
            : <Price amount={deliveryMinimum.remaining} />}
        </strong>
      </div>
      {fulfilmentType === "delivery" && !deliveryMinimum.valid && (
        <p className="minimum-message"><strong>Warning:</strong> {deliveryMinimum.message}</p>
      )}
      {fulfilmentType === "delivery" && deliveryMinimum.valid && (
        <p className="success-message">Your subtotal meets the delivery minimum.</p>
      )}
      <p className="simulated-note">Totals are calculated from the current cart.</p>
    </section>
  );
}
