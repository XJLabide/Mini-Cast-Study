import { useEffect, useMemo, useState } from "react";
import { IconEdit, IconPackage, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { ProductModal } from "@/components/products/ProductModal";
import { ReorderRequestModal } from "@/components/products/ReorderRequestModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loading } from "@/components/shared/Loading";
import { api } from "@/lib/api";
import type { Product, ReorderRequest } from "@/types/product";

const reorderThreshold = 10;

function priorityFor(stock: number) {
  if (stock <= 3) return "Critical";
  if (stock <= 6) return "High";
  return "Medium";
}

function Priority({ stock }: { stock: number }) {
  const priority = priorityFor(stock);
  const color = priority === "Critical" ? "text-coral" : priority === "High" ? "text-amber" : "text-copy";
  return <span className={color}>{priority}</span>;
}

function ReorderKpi({ label, value, warning = false }: { label: string; value: string; warning?: boolean }) {
  return <div className="min-h-28 rounded-lg border border-line bg-panel p-5"><p className="text-xs text-muted">{label}</p><p className={warning ? "mt-3 text-2xl font-semibold text-amber" : "mt-3 text-2xl font-semibold text-copy"}>{value}</p></div>;
}

export function ReorderCenterPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [supplier, setSupplier] = useState("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [requests, setRequests] = useState<ReorderRequest[]>([]);
  const [requestModal, setRequestModal] = useState<{ product?: Product; value?: ReorderRequest } | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<ReorderRequest | null>(null);

  const loadProducts = () => api.list().then(setProducts).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load reorder items"));
  const loadRequests = () => api.listReorders().then(setRequests).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load reorder requests"));
  useEffect(() => { void loadProducts(); void loadRequests(); }, []);

  const reorderProducts = useMemo(() => products.filter((product) => product.stockQuantity <= reorderThreshold), [products]);
  const categories = useMemo(() => Array.from(new Set(reorderProducts.map((product) => product.category))).sort(), [reorderProducts]);
  const suppliers = useMemo(() => Array.from(new Set(reorderProducts.map((product) => product.supplier))).sort(), [reorderProducts]);
  const filteredProducts = useMemo(() => reorderProducts.filter((product) => {
    const searchable = `${product.name} ${product.category} ${product.supplier}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (category === "all" || product.category === category) && (supplier === "all" || product.supplier === supplier);
  }), [category, query, reorderProducts, supplier]);
  const criticalItems = reorderProducts.filter((product) => product.stockQuantity <= 3).length;
  const affectedSuppliers = new Set(reorderProducts.map((product) => product.supplier)).size;
  const belowThresholdUnits = reorderProducts.reduce((sum, product) => sum + product.stockQuantity, 0);

  const saveProduct = () => { setEditing(null); setNotice("Product updated"); void loadProducts(); };
  const saveRequest = () => { setRequestModal(null); setNotice("Reorder request saved"); void loadRequests(); };
  const deleteRequest = async () => { if (!requestToDelete) return; await api.removeReorder(requestToDelete.id); setRequestToDelete(null); setNotice("Reorder request cancelled"); void loadRequests(); };

  return (
    <div className="flex min-h-[calc(100svh-5rem)] flex-col">
      <PageHeader title="Reorder Center" description="Review products that need replenishment and prioritize the next action." />
      {notice && <p className="mb-4 text-sm text-lime" role="status">{notice}</p>}
      {error ? <ErrorState message={error} /> : products.length === 0 ? <Loading /> : <>
        <section aria-label="Reorder overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReorderKpi label="Products needing reorder" value={String(reorderProducts.length)} warning />
          <ReorderKpi label="Critical items" value={String(criticalItems)} warning />
          <ReorderKpi label="Suppliers affected" value={String(affectedSuppliers)} />
          <ReorderKpi label="Units below reorder threshold" value={String(belowThresholdUnits)} />
        </section>
        <section className="mt-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-panel md:mt-12">
          <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center md:justify-between md:p-5">
            <div className="flex min-h-10 min-w-0 flex-1 items-center gap-3 border border-line bg-ink px-3 py-2 text-muted md:max-w-md"><IconSearch size={18} /><input aria-label="Search reorder products" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, category, or supplier" className="w-full min-w-0 bg-transparent text-sm text-copy outline-none placeholder:text-muted" /></div>
            <div className="grid grid-cols-2 gap-3 sm:flex"><select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-10 min-w-0 border border-line bg-ink px-3 py-2 text-sm leading-5 text-copy outline-none focus:border-lime"><option value="all">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filter by supplier" value={supplier} onChange={(event) => setSupplier(event.target.value)} className="min-h-10 min-w-0 border border-line bg-ink px-3 py-2 text-sm leading-5 text-copy outline-none focus:border-lime"><option value="all">All suppliers</option>{suppliers.map((item) => <option key={item}>{item}</option>)}</select></div>
          </div>
          <div className="min-h-[12rem] flex-1 overflow-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-[#222426] text-xs text-muted"><tr><th className="px-5 py-3.5 font-medium">Product</th><th className="px-5 py-3.5 font-medium">Category</th><th className="px-5 py-3.5 font-medium">Supplier</th><th className="px-5 py-3.5 text-right font-medium">Current Stock</th><th className="px-5 py-3.5 font-medium">Status</th><th className="px-5 py-3.5 font-medium">Reorder Priority</th><th className="px-5 py-3.5 text-right font-medium">Actions</th></tr></thead><tbody>{filteredProducts.map((product) => <tr key={product.id} className="border-t border-line transition-colors hover:bg-[#1b1d1f]"><td className="px-5 py-4"><Link to={`/products/${product.id}`} className="font-medium text-copy hover:text-lime">{product.name}</Link><p className="mt-1 max-w-xs truncate text-xs text-muted">{product.description}</p></td><td className="px-5 py-4 text-muted">{product.category}</td><td className="px-5 py-4 text-muted">{product.supplier}</td><td className="px-5 py-4 text-right text-amber">{product.stockQuantity}</td><td className="px-5 py-4 text-muted">{product.status}</td><td className="px-5 py-4 font-medium"><Priority stock={product.stockQuantity} /></td><td className="px-5 py-4 text-right"><div className="flex justify-end gap-1"><button type="button" aria-label={`Create reorder request for ${product.name}`} onClick={() => setRequestModal({ product })} className="inline-flex min-h-9 items-center gap-2 px-2 text-xs text-lime hover:underline"><IconPlus size={16} /> Request</button><button type="button" aria-label={`Edit ${product.name}`} onClick={() => setEditing(product)} className="p-2 text-muted hover:text-lime"><IconEdit size={17} /></button></div></td></tr>)}{!filteredProducts.length && <tr><td colSpan={7} className="px-5 py-14 text-center text-sm text-muted"><IconPackage className="mx-auto mb-3" size={22} />No products need replenishment for the current filters.</td></tr>}</tbody></table></div>
          <div className="border-t border-line px-4 py-3 text-sm text-muted md:px-5">Showing {filteredProducts.length} of {reorderProducts.length} products needing reorder</div>
        </section>
        <section className="mt-8 overflow-hidden rounded-lg border border-line bg-panel"><div className="flex items-center justify-between border-b border-line p-5"><div><h2 className="font-medium text-copy">Reorder requests</h2><p className="mt-1 text-xs text-muted">Track replenishment requests from draft to receipt.</p></div></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#222426] text-xs text-muted"><tr><th className="px-5 py-3 font-medium">Product</th><th className="px-5 py-3 font-medium">Supplier</th><th className="px-5 py-3 text-right font-medium">Quantity</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Notes</th><th className="px-5 py-3 text-right font-medium">Actions</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id} className="border-t border-line"><td className="px-5 py-3 text-copy">{request.productName}</td><td className="px-5 py-3 text-muted">{request.supplier}</td><td className="px-5 py-3 text-right text-copy">{request.quantity}</td><td className="px-5 py-3 text-muted">{request.status}</td><td className="max-w-xs truncate px-5 py-3 text-muted">{request.notes || "—"}</td><td className="px-5 py-3 text-right"><button type="button" aria-label={`Edit reorder request for ${request.productName}`} onClick={() => setRequestModal({ value: request })} className="p-2 text-muted hover:text-lime"><IconEdit size={17} /></button><button type="button" aria-label={`Delete reorder request for ${request.productName}`} onClick={() => setRequestToDelete(request)} className="p-2 text-muted hover:text-coral"><IconTrash size={17} /></button></td></tr>)}{!requests.length && <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-muted">No reorder requests yet.</td></tr>}</tbody></table></div></section>
      </>}
      {editing && <ProductModal value={editing} onClose={() => setEditing(null)} onSaved={saveProduct} />}
      {requestModal && <ReorderRequestModal product={requestModal.product} value={requestModal.value} onClose={() => setRequestModal(null)} onSaved={saveRequest} />}
      {requestToDelete && <ConfirmDialog productName={`reorder request for ${requestToDelete.productName}`} onCancel={() => setRequestToDelete(null)} onConfirm={deleteRequest} />}
    </div>
  );
}
