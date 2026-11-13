import { useState } from "react";

export default function DemoPanel({
  menu,
  shouldFail,
  setShouldFail,
  updateStock,
}) {
  const [selectedItemId, setSelectedItemId] = useState(menu[0]?.id || "");
  const effectiveSelectedItemId = selectedItemId || menu[0]?.id;
  const selectedItem = menu.find(
    (item) => item.id === effectiveSelectedItemId
  );

  return (
    <aside className="demo-panel" aria-labelledby="demo-panel-title">
      <p className="eyebrow">Examiner tools</p>
      <h2 id="demo-panel-title">Demonstration controls (simulated)</h2>
      <label className="demo-checkbox">
        <input
          type="checkbox"
          checked={shouldFail}
          onChange={(event) => setShouldFail(event.target.checked)}
        />
        <span>Simulate loading failure</span>
      </label>
      <p className="demo-note">
        When enabled, the next menu load fails. Uncheck it and retry to load the menu again.
      </p>

      {menu.length > 0 && (
        <div className="demo-stock-control">
          <label htmlFor="demo-stock-item">Item for stock demonstration</label>
          <select
            id="demo-stock-item"
            value={selectedItem?.id || menu[0].id}
            onChange={(event) => setSelectedItemId(event.target.value)}
          >
            {menu.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          {selectedItem && (
            <label htmlFor="demo-stock-value">
              Simulated stock for {selectedItem.name}
              <input
                id="demo-stock-value"
                type="number"
                min="0"
                step="1"
                value={selectedItem.stock}
                onChange={(event) => {
                  const stock = Number(event.target.value);
                  if (Number.isInteger(stock) && stock >= 0) {
                    updateStock(selectedItem.id, stock);
                  }
                }}
              />
            </label>
          )}
        </div>
      )}
      <p className="demo-note">
        Stock changes are simulated and update menu, item details, and cart availability.
      </p>
    </aside>
  );
}
