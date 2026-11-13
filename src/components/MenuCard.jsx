import { Link } from "react-router-dom";
import Price from "./Price.jsx";
import {
  DELIVERY_FEE,
  DELIVERY_MINIMUM,
  formatPrice,
} from "../rules/orderRules.js";

export default function MenuCard({ item }) {
  const soldOut = item.stock === 0;

  return (
    <article className={`menu-card${soldOut ? " menu-card-sold-out" : ""}`}>
      <div className="menu-card-art" role="img" aria-label={item.imageAlt}>
        {item.image
          ? <img src={item.image} alt={item.imageAlt} />
          : <span aria-hidden="true">{item.category === "bundle" ? "📦" : "🥘"}</span>}
      </div>
      <div className="menu-card-content">
        <div className="card-title-row">
          <h2>{item.name}</h2>
          {soldOut && <span className="sold-out">Sold out</span>}
        </div>
        <p>{item.description}</p>
        {item.dietaryTags.length > 0 && (
          <div className="dietary-tags" aria-label="Dietary tags">
            {item.dietaryTags.map((tag) => (
              <span className="dietary-tag" key={tag}>{tag}</span>
            ))}
          </div>
        )}
        <p className="menu-card-policy">
          Delivery minimum Rs. {formatPrice(DELIVERY_MINIMUM)} · Delivery fee Rs. {formatPrice(DELIVERY_FEE)}
        </p>
        <div className="card-footer">
          <span>
            <Price amount={item.price} />
            {item.category === "bundle" && <small> / meal</small>}
          </span>
          <Link className="button button-small" to={`/items/${item.id}`}>
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
