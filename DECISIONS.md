# Decisions

## P1: Delivery information is visible before checkout

- **Problem:** Customers could encounter the delivery minimum and fee only at checkout.
- **Decision:** Show the delivery policy on the menu and item details, and calculate the subtotal, fee, total, and remaining minimum in a reusable order summary on cart and checkout.
- **Alternative:** Show the delivery policy only on the checkout screen.
- **Reason:** Customers can assess the delivery requirement while browsing and see the exact remaining amount before proceeding.
- **Tradeoff:** The policy is repeated near browsing decisions while calculated totals are shared through one component.
- **Code location:** `src/components/OrderPolicy.jsx`, `src/components/OrderSummary.jsx`, `src/pages/CartPage.jsx`, `src/pages/CheckoutPage.jsx`, `src/styles/global.css`.
- **Evidence:** `OrderSummary` derives the values from the cart, menu, fulfilment type, and pure rule functions. Responsive layouts stack controls and summary sections at narrow widths.

## P2: Browse controls persist across item navigation

- **Problem:** Opening an item and returning to the menu could reset the search, category filter, or sort selection.
- **Decision:** Keep those values in a React Context provider shared by the routed pages, and derive the visible list from the menu and current controls.
- **Alternative:** Keep controls as local state inside `MenuPage` or encode them in every item URL.
- **Reason:** Shared state survives route changes without duplicating query parameters or storing derived menu results.
- **Tradeoff:** The app provider owns browse state for the lifetime of the single-page app; it is not persisted across browser sessions.
- **Code location:** `src/context/BrowseContext.jsx`, `src/App.jsx`, `src/pages/MenuPage.jsx`.
- **Evidence:** `MenuPage` reads and updates the shared controls, while `App` derives results and renders the item route without unmounting the providers.

## P3: Checkout validation preserves valid fields

- **Problem:** A form error could cause valid values to be lost or make it unclear which input needs correction.
- **Decision:** Use controlled form values and a pure validator that returns field-specific errors; render each message beside its associated field and focus the first invalid input on submission.
- **Alternative:** Clear and rebuild the form after every invalid submit, or show one generic error at the top.
- **Reason:** Field-level feedback identifies the correction while preserving the student's other entered sample values.
- **Tradeoff:** The page maintains separate values and error state and uses explicit accessible label/error associations.
- **Code location:** `src/rules/checkoutValidation.js`, `src/pages/CheckoutPage.jsx`.
- **Evidence:** Tests in `tests/orderRules.test.js` assert field-specific error results and that valid name and zone values remain unchanged.
