import { formatPrice } from "../rules/orderRules.js";

export default function Price({ amount }) {
  return <span>Rs. {formatPrice(amount)}</span>;
}
