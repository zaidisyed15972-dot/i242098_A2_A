import {
  DELIVERY_FEE,
  DELIVERY_MINIMUM,
  formatPrice,
} from "../rules/orderRules.js";

export default function OrderPolicy() {
  return (
    <aside className="order-policy">
      <strong>Delivery rules</strong>
      <span>Minimum order: Rs. {formatPrice(DELIVERY_MINIMUM)}</span>
      <span>Delivery fee: Rs. {formatPrice(DELIVERY_FEE)}</span>
      <span>Collection: no minimum and no fee</span>
    </aside>
  );
}
