import { Link } from "react-router-dom";
import OrderPolicy from "../components/OrderPolicy.jsx";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Fresh meals, made for your study week</p>
          <h1>Good food for busy days.</h1>
          <p>Prepared meals and a flexible weekly bundle, delivered around Islamabad.</p>
          <Link className="button" to="/menu">Browse the menu</Link>
        </div>
        <div className="hero-stamp" aria-hidden="true">Eat<br />well</div>
      </section>
      <OrderPolicy />
      <p className="simulated-note">Sehat Bowl is a simulated meal-prep service for Islamabad students.</p>
    </main>
  );
}
