# CS4032 Web Programming — Assignment 02 Report

## Project overview

**Sehat Bowl** is a simulated restaurant meal-preparation frontend for university students in Islamabad. Customers can browse meals and weekly bundles, customize quantities, review their cart, choose delivery or collection, and place a simulated order. The app does not collect real payment details or create real orders.

## Implemented functionality

- Menu browsing with search, category filtering, and sorting.
- Meal and bundle details, stock status, quantity controls, and add-to-cart behavior.
- Shared cart and browse state, with cart persistence in browser `localStorage`.
- Cart summary with derived subtotal, fee, total, item count, and delivery-minimum remainder.
- Checkout with field-specific validation that preserves valid input.
- Confirmation page with a locally generated simulated order reference.
- Simulated menu-loading failure, retry, and stock demonstration controls.
- Responsive layouts and keyboard-accessible controls.
- Not-found handling and a confirmation fallback when no order is present.

## Business rules

| Rule | Expected behavior |
|---|---|
| Delivery minimum | Delivery is blocked below Rs. 1,500; Rs. 1,500 is allowed. Delivery fee is Rs. 150. |
| Collection | No minimum order and no fee. |
| Item quantity | Maximum 10 per item; quantity 0 removes the item. Requests above available stock are blocked. |
| Weekly bundle | Must contain 5–7 meals; 4 and 8 are blocked. |

## Technology and structure

The project uses React function components and hooks, Vite, `react-router-dom`, JavaScript ES modules, authored CSS, browser `localStorage`, and Node.js built-in tests. Business rules and cart restoration are kept in `src/rules`; reusable UI is in `src/components`; route screens are in `src/pages`.

## Cleanup completed

- Removed the unused `src/assets/.gitkeep` placeholder.
- Removed the unused `compact` prop and associated CSS rule for `OrderPolicy`.
- Centralized repeated PKR number formatting in `src/rules/orderRules.js`.
- Derived the checkout subtotal from the current cart rather than passing a redundant value from the app.
- Removed unused catch variables and consolidated duplicate test groups.

The recorded source line count decreased from **3,168 to 3,166** across `src` and `tests`.

## Verification

- `npm test`: **12 tests passed**.
- `npm run build`: completed successfully.
- Browser checks covered menu-to-confirmation ordering, Back/Forward navigation and retained browse state, cart-filter visibility, local cart restoration, simulated load failure and retry, checkout validation, and the delivery, quantity, and bundle boundaries.
- Layout checks at phone and desktop widths found no horizontal overflow on the checked routes; each checked route had one `h1`.
- The browser console showed no application errors or warnings during the final checks.

### Build warning

Vite reports two warnings from the installed React Router package: module-level `"use client"` directives in dependency files are ignored during bundling. The production build still succeeds. These are dependency warnings, not application errors.

## Deployment and repository status

GitHub publishing was skipped as requested. No public deployment URL, Git commit, or final commit hash is reported. Git was unavailable in the workspace.

The source ZIP is named `RollNo_Name_Section_A#02.zip` and excludes `node_modules` and `dist`.
