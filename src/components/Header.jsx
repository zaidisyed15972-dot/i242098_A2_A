import { Link, NavLink } from "react-router-dom";

export default function Header({ cartCount }) {
  return (
    <header className="site-header">
      <Link className="brand" to="/menu" aria-label="Sehat Bowl home">
        <span className="brand-mark" aria-hidden="true">SB</span>
        <span>Sehat Bowl</span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <NavLink to="/menu">Menu</NavLink>
        <NavLink to="/cart">Cart <span className="nav-count">{cartCount}</span></NavLink>
      </nav>
    </header>
  );
}
