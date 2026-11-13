import { useId } from "react";

export default function QuantityControl({
  value,
  min,
  max,
  onChange,
}) {
  const inputId = useId();

  function handleInputChange(event) {
    const nextValue = event.target.value;
    onChange(nextValue === "" ? Number.NaN : Number(nextValue));
  }

  return (
    <div className="quantity-control">
      <label className="quantity-control-label" htmlFor={inputId}>
        Quantity <small>{min} to {max}</small>
      </label>
      <div className="quantity-stepper">
        <button
          className="quantity-step-button"
          type="button"
          aria-label="Decrease quantity"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          −
        </button>
        <input
          id={inputId}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={handleInputChange}
        />
        <button
          className="quantity-step-button"
          type="button"
          aria-label="Increase quantity"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}
