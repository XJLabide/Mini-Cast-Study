import test from "node:test";
import assert from "node:assert/strict";

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

globalThis.localStorage = new MemoryStorage();
const { api } = await import("../.test-dist/lib/api.js");

const validInput = { name: "Test Item", category: "Test", description: "A test product", price: 10, stockQuantity: 4, supplier: "Test Supplier", status: "Active" };

test("seeds products and calculates dashboard/report totals", async () => {
  const dashboard = await api.dashboard();
  const report = await api.report();
  assert.equal(dashboard.totalProducts, 4);
  assert.equal(dashboard.lowStock, 2);
  assert.equal(report.stockValue, 4068);
  assert.deepEqual(report.lowStock.map((product) => product.name), ["Harbor USB Hub", "Field Notebook Set"]);
});

test("CRUD operations persist and update aggregates", async () => {
  const created = await api.create(validInput);
  assert.equal((await api.list()).length, 5);
  await api.update(created.id, { ...validInput, stockQuantity: 20 });
  assert.equal((await api.get(created.id)).stockQuantity, 20);
  await api.remove(created.id);
  await assert.rejects(() => api.get(created.id), /Product not found/);
});

test("invalid input and malformed storage fail without mutation", async () => {
  await assert.rejects(() => api.create({ ...validInput, name: " " }), /name is required/);
  await assert.rejects(() => api.create({ ...validInput, price: Number.NaN }), /finite/);
  await assert.rejects(() => api.create({ ...validInput, stockQuantity: 1.5 }), /whole number/);
  localStorage.setItem("midnight-inventory-products", "not-json");
  await assert.rejects(() => api.list(), /unreadable/);
});
