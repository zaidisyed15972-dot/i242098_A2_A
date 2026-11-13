import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="page-shell centered-state">
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link className="button" to="/menu">Return to menu</Link>
    </main>
  );
}
