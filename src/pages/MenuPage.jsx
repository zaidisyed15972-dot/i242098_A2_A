import MenuCard from "../components/MenuCard.jsx";
import DemoPanel from "../components/DemoPanel.jsx";
import OrderPolicy from "../components/OrderPolicy.jsx";
import { useBrowse } from "../context/BrowseContext.jsx";

export default function MenuPage({
  status,
  menu,
  items,
  error,
  retry,
  shouldFail,
  setShouldFail,
  updateStock,
}) {
  const {
    searchText,
    setSearchText,
    categoryFilter,
    setCategoryFilter,
    sortOrder,
    setSortOrder,
  } = useBrowse();
  const categories = [...new Set(menu.map((item) => item.category))].sort();

  function clearFilters() {
    setSearchText("");
    setCategoryFilter("all");
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Fresh meals, made for your study week</p>
          <h1>Good food for busy days.</h1>
          <p>Prepared meals and a flexible weekly bundle, delivered around Islamabad.</p>
        </div>
        <div className="hero-stamp" aria-hidden="true">Eat<br />well</div>
      </section>

      <OrderPolicy />

      <section aria-labelledby="menu-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The menu</p>
            <h2 id="menu-heading">Find your next meal</h2>
          </div>
          <span className="result-count">{items.length} options</span>
        </div>

        {status === "loading" && (
          <p className="loading-message" role="status">Loading simulated menu…</p>
        )}
        {status === "error" && (
          <div className="empty-state">
            <p className="form-message" role="alert">{error}</p>
            <button className="button" type="button" onClick={retry}>Retry</button>
          </div>
        )}

        {status === "success" && (
          <>
            <div className="menu-controls">
          <label className="search-control" htmlFor="menu-search">
            <span>Search menu</span>
            <input
              id="menu-search"
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Try chicken or a bundle"
            />
          </label>
          <label>
            <span>Show</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">All options</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "bundle" ? "Bundles" : "Meals"}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Sort by</span>
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name A to Z</option>
            </select>
          </label>
            </div>

            {menu.length === 0 ? (
              <p className="empty-state">No items available</p>
            ) : items.length > 0 ? (
              <div className="menu-grid">
                {items.map((item) => <MenuCard key={item.id} item={item} />)}
              </div>
            ) : (
              <div className="empty-state">
                <p>No matches for these filters</p>
                <button className="button button-small button-secondary" type="button" onClick={clearFilters}>
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </section>
      <DemoPanel
        menu={menu}
        shouldFail={shouldFail}
        setShouldFail={setShouldFail}
        updateStock={updateStock}
      />
      <p className="simulated-note">Simulated menu and availability for this assignment.</p>
    </main>
  );
}
