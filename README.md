# Sehat Bowl

## Student details

- **Name:** [Your name]
- **Roll number:** [Your roll number]
- **Section:** [Your section]
- **Course:** CS4032 Web Programming
- **Assignment:** 02

## Description

Sehat Bowl is a simulated restaurant frontend for students in Islamabad. It demonstrates menu browsing, selection, cart persistence, checkout validation, and an order confirmation. No real orders, payments, or personal data are processed.

## Requirements

- Node.js and npm
- A current web browser

## Install

```sh
npm install
```

## Run locally

```sh
npm run dev
```

## Build

```sh
npm run build
```

Vite writes the production site to `dist/`. The build script also copies `dist/index.html` to `dist/404.html` for static hosts that use a 404 document as a single-page-app route fallback. This project has not been published to a public host.

## Test

```sh
npm test
```

The test command runs Node.js's built-in test runner (`node --test`); no browser-testing framework is used.

## Repository and deployment

GitHub setup and publishing were intentionally skipped. There is no public repository or deployment URL yet. For a root-hosted static deployment, publish the contents of `dist/` and configure the host to route application URLs to `index.html` (or use the generated `404.html` fallback where supported).

## Routes

| Route | Screen |
|---|---|
| `/` | Home |
| `/menu` | Menu, search, filters, sort, and demonstration controls |
| `/items/:id` | Meal or bundle details |
| `/cart` | Selection and calculated order summary |
| `/checkout` | Simulated fulfilment and checkout form |
| `/confirmation` | Simulated order confirmation or direct-access fallback |
| `*` | Not-found page |

## Features

- Search meals by name, description, or ingredients; filter by category and sort by price or name.
- Keep browse controls in shared state when navigating between menu and item details.
- Add meals or weekly bundles to a persistent cart; adjust quantities and remove lines.
- Calculate subtotal, delivery fee, total, item count, and delivery-minimum remainder from current state.
- Enforce delivery minimum, stock/quantity limits, and weekly bundle size using shared business rules.
- Validate checkout fields individually and preserve valid input when another field has an error.
- Simulate asynchronous menu loading, failure/retry, stock changes, and order references.
- Store cart, fulfilment preference, and demonstration settings in browser localStorage.
- Use responsive authored CSS and semantic, keyboard-operable controls.

## Reproduce important cases

Use the **Demonstration controls (simulated)** panel near the bottom of `/menu`.

| Case | Steps | Expected result |
|---|---|---|
| Delivery minimum | Add meals totaling Rs. 1,499 or less, then open the cart or checkout. | The remaining amount is shown; delivery ordering is blocked until subtotal reaches Rs. 1,500. |
| Collection | In checkout choose Collection. | No minimum and no fulfilment fee apply. |
| Quantity limit | On an item page try to increase the quantity beyond 10. | The control is capped and/or the business rule shows a specific limit message; stock is also enforced. |
| Sold out | On `/menu`, set an item's simulated stock to `0`, then open its details. | The menu/item show Sold out and adding the item is disabled. |
| Stock conflict | Add an item, then lower its simulated stock below the cart quantity. | The cart shows the conflict and requires the quantity to be resolved before checkout. |
| Weekly bundle size | Open either bundle and enter `4` or `8` meals. | The bundle-size rule explains the allowed range of 5 to 7 and blocks adding. |
| Checkout field errors | Submit with an invalid phone or missing required field. | Only invalid fields show their messages; other entered values remain. |
| Simulated load failure | Enable **Simulate loading failure**, then wait for the menu load or retry. | A labeled error and Retry button appear. Disable the checkbox and retry to load successfully. |
| Confirmation fallback | Open `/confirmation` directly before placing an order. | A no-completed-order message and a menu link appear. |
| Confirmation | Complete a valid simulated checkout. | A `SIM-` reference and a summary of the completed order are displayed. |

All operations are simulated. Do not enter real personal or payment information.

## Known limitations

- Menu data and order processing are local simulations; there is no backend.
- Cart and preferences are stored only in the current browser's localStorage.
- No real payment, delivery, account, or email service is connected.
- Direct-route fallback behavior depends on the static host configuration; deployment has not been performed.
- Student details and public repository/deployment links are not supplied.

## Concept map

| Concept | File | Component or function |
|---|---|---|
| Application routes | `src/App.jsx` | `App`, route declarations |
| Browse state | `src/context/BrowseContext.jsx` | `BrowseProvider`, `useBrowse` |
| Cart state and persistence | `src/context/CartContext.jsx` | `CartProvider`, `useCart` |
| Menu records | `src/data/menu.js` | `menuItems` |
| Simulated menu and order services | `src/services/menuService.js` | `fetchMenu`, `loadMenu`, `placeSimulatedOrder` |
| Async menu states | `src/hooks/useMenu.js` | `useMenu` |
| Delivery, quantity, and bundle rules | `src/rules/orderRules.js` | `checkDeliveryMinimum`, `checkQuantity`, `checkBundleSize` |
| Checkout validation | `src/rules/checkoutValidation.js` | `validateForm` and field validators |
| Cart restore validation | `src/rules/cartPersistence.js` | `restoreCartData` |
| Reusable calculated summary | `src/components/OrderSummary.jsx` | `OrderSummary` |
| Checkout screen | `src/pages/CheckoutPage.jsx` | `CheckoutPage` |
| Rule and service tests | `tests/orderRules.test.js`, `tests/menuService.test.js` | Node.js built-in tests |

