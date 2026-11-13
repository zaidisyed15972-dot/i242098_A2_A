import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import OrderSummary from "../components/OrderSummary.jsx";
import {
  BUNDLE_MAX,
  BUNDLE_MIN,
  DELIVERY_MINIMUM,
  checkDeliveryMinimum,
  deliveryFeeFor,
  formatPrice,
  getCartSubtotal,
} from "../rules/orderRules.js";
import { DELIVERY_ZONES, validateForm } from "../rules/checkoutValidation.js";

const pickupAddress = "Sehat Bowl Collection, Shop 12, College Road, F-8 Markaz, Islamabad";

export default function CheckoutPage({ cart, menu, onPlaceOrder }) {
  const navigate = useNavigate();
  const { fulfilmentType, setFulfilmentType } = useCart();
  const formRef = useRef(null);
  const [values, setValues] = useState({
    name: "",
    phone: "",
    fulfilment: fulfilmentType,
    zone: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = getCartSubtotal(cart, menu);
  const deliveryResult = checkDeliveryMinimum(subtotal, values.fulfilment);
  const orderAllowed = values.fulfilment !== "delivery" || deliveryResult.valid;
  const deliveryFee = deliveryFeeFor(values.fulfilment);
  const hasCartConflicts = cart.some((line) => line.conflictMessage);

  function updateField(event) {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    if (name === "fulfilment") {
      setFulfilmentType(value);
    }
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors, [name]: "" };
      if (name === "fulfilment" && value !== "delivery") {
        nextErrors.zone = "";
      }
      return nextErrors;
    });
    setSubmitError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      const firstInvalidField = Object.keys(nextErrors)[0];
      const firstInvalidInput = formRef.current?.querySelector(
        `[name="${firstInvalidField}"]`,
      );
      firstInvalidInput?.focus();
      return;
    }
    if (values.fulfilment === "delivery" && !deliveryResult.valid) {
      setSubmitError(deliveryResult.message);
      return;
    }
    if (hasCartConflicts) {
      setSubmitError("Resolve saved cart conflicts before placing this order.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onPlaceOrder({ ...values, items: cart, subtotal, deliveryFee });
      navigate("/confirmation");
    } catch (error) {
      setSubmitError(error.message || "The simulated order could not be placed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (cart.length === 0) {
    return (
      <main className="page-shell narrow-shell">
        <h1>Checkout</h1>
        <p className="empty-state">Add a meal before checking out.</p>
        <Link className="button" to="/menu">Browse the menu</Link>
      </main>
    );
  }

  return (
    <main className="page-shell narrow-shell">
      <p className="eyebrow">Final step</p>
      <h1>Checkout</h1>
      <p className="intro-copy">
        Simulated checkout only. Use fictional sample details; nothing is saved.
      </p>

      <div className="checkout-layout">
        <form className="checkout-form" ref={formRef} onSubmit={handleSubmit} noValidate>
          <h2>Fulfilment</h2>
          <fieldset className="choice-group">
            <legend>How would you like your order?</legend>
            <label className="choice-card" htmlFor="fulfilment-delivery">
              <input
                id="fulfilment-delivery"
                type="radio"
                name="fulfilment"
                value="delivery"
                checked={values.fulfilment === "delivery"}
                onChange={updateField}
                aria-describedby={errors.fulfilment ? "fulfilment-error" : undefined}
              />
              <span>Delivery <small>Rs. {formatPrice(deliveryFeeFor("delivery"))} fee · Rs. {formatPrice(DELIVERY_MINIMUM)} minimum</small></span>
            </label>
            <label className="choice-card" htmlFor="fulfilment-collection">
              <input
                id="fulfilment-collection"
                type="radio"
                name="fulfilment"
                value="collection"
                checked={values.fulfilment === "collection"}
                onChange={updateField}
                aria-describedby={errors.fulfilment ? "fulfilment-error" : undefined}
              />
              <span>Collection <small>No minimum or fee</small></span>
            </label>
            {errors.fulfilment && (
              <small className="form-message" id="fulfilment-error" role="alert">
                {errors.fulfilment}
              </small>
            )}
          </fieldset>

          {values.fulfilment === "delivery" && (
            <div className="field-control">
              <label htmlFor="zone">Delivery zone</label>
              <select
                id="zone"
                name="zone"
                value={values.zone}
                onChange={updateField}
                aria-invalid={Boolean(errors.zone)}
                aria-describedby={errors.zone ? "zone-error" : undefined}
              >
                <option value="">Choose your zone</option>
                {DELIVERY_ZONES.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
              </select>
              {errors.zone && (
                <small className="form-message" id="zone-error" role="alert">
                  {errors.zone}
                </small>
              )}
            </div>
          )}
          {values.fulfilment === "collection" && (
            <p className="pickup-address"><strong>Collection point</strong><br />{pickupAddress}</p>
          )}

          <div className="field-control">
            <label htmlFor="name">Name <small>(fictional sample only)</small></label>
            <input
              id="name"
              name="name"
              type="text"
              value={values.name}
              onChange={updateField}
              placeholder="Sample name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <small className="form-message" id="name-error" role="alert">
                {errors.name}
              </small>
            )}
          </div>

          <div className="field-control">
            <label htmlFor="phone">Pakistani mobile <small>(fictional sample only)</small></label>
            <input
              id="phone"
              name="phone"
              type="text"
              inputMode="tel"
              value={values.phone}
              onChange={updateField}
              placeholder="0300-1234567"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
            />
            {errors.phone && (
              <small className="form-message" id="phone-error" role="alert">
                {errors.phone}
              </small>
            )}
          </div>

          <div className="field-control">
            <label htmlFor="notes">Notes <small>(optional; do not enter personal information)</small></label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              value={values.notes}
              onChange={updateField}
            />
          </div>

          {values.fulfilment === "delivery" && (
            <p className={deliveryResult.valid ? "success-message" : "minimum-message"}>
              {deliveryResult.valid
                ? `Delivery minimum met: Rs. ${formatPrice(DELIVERY_MINIMUM)}.`
                : `Warning: ${deliveryResult.message}`}
            </p>
          )}
          {submitError && <p className="form-message" role="alert">{submitError}</p>}
          {hasCartConflicts && (
            <p className="form-message" role="alert">
              Resolve saved cart conflicts before placing this order.
            </p>
          )}
          {cart.some((line) => line.mealCount) && (
            <p className="collection-note">
              Weekly bundle size: {BUNDLE_MIN} to {BUNDLE_MAX} meals.
            </p>
          )}
          <button
            className="button checkout-button"
            type="submit"
            disabled={isSubmitting || !orderAllowed || hasCartConflicts}
          >
            {isSubmitting ? "Placing simulated order…" : "Place simulated order"}
          </button>
        </form>

        <OrderSummary
          cart={cart}
          menu={menu}
          fulfilmentType={values.fulfilment}
          className="checkout-summary"
        />
      </div>
    </main>
  );
}
