# Midnight Inventory

Static product information system built with React, TypeScript, Vite, Tailwind CSS v4, and Animate UI-compatible components.

Project design and implementation rules are documented in [GUIDELINES.md](./GUIDELINES.md). Update that file when a new requirement is confirmed.

## Run locally

Requires Node.js 24 LTS or newer.

```bash
npm install
npm run dev
```

Build and preview the static site:

```bash
npm run build
npm run preview
```

Run the type checks and browser-data-layer tests with:

```bash
npm test
```

## API approach

This version is intentionally frontend-only. CRUD operations are exposed through the asynchronous API module at `client/src/lib/api.ts`, which uses the browser `localStorage` Web API for persistence. Pages call `api.list()`, `api.get()`, `api.create()`, `api.update()`, and `api.remove()` rather than accessing storage directly.

The module is the boundary for a future HTTP API integration: its implementation can later be replaced with `fetch()` calls without changing the four page components.

## Pages

- Dashboard
- Products
- Product Details
- Inventory Reports

Data can be reset by clearing the site’s local storage in the browser developer tools.
