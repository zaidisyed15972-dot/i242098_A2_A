import { Link } from "react-router-dom";
import OrderSummary from "../components/OrderSummary.jsx";

export default function ConfirmationPage({ order }) {
  return (
    <main className="page-shell confirmation-shell">
      <div className="confirmation-mark" aria-hidden="true">✓</div>
      <p className="eyebrow">Simulated order complete</p>
      <h1>{order ? "Thanks for your order." : "No completed order"}</h1>
      {order ? (
        <>
          <section className="confirmation-success" aria-label="Simulated order reference">
            <p>Simulated order reference</p>
            <strong className="order-reference">{order.reference}</strong>
          </section>
          <OrderSummary
            cart={order.items}
            menu={order.menu}
            fulfilmentType={order.fulfilmentType}
            className="checkout-summary confirmation-summary"
          />
          <p className="simulated-note">No real order, payment, or delivery has been created.</p>
        </>
      ) : (
        <p>This page is only available after a valid simulated order. You can start a new order below.</p>
      )}
      <Link className="button" to="/menu">Return to menu</Link>
    </main>
  );
}
