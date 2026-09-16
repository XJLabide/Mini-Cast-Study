import { useEffect, useMemo, useState } from "react";
import { IconChevronDown, IconEdit, IconPackage, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { ProductModal } from "@/components/products/ProductModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { Product, ProductStatus } from "@/types/product";

const lowStockThreshold = 10;
const statuses: Array<"all" | ProductStatus> = ["all", "Active", "Inactive", "Discontinued"];

function ProductKpi({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="min-h-28 rounded-lg border border-line bg-panel p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className={emphasis ? "mt-3 text-2xl font-semibold text-amber" : "mt-3 text-2xl font-semibold text-copy"}>{value}</p>
    </div>
  );
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<"all" | ProductStatus>("all");
  const [modal, setModal] = useState<"create" | Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [notice, setNotice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const loadProducts = () => api.list().then(setProducts).catch((error: Error) => setNotice(error.message));

  useEffect(() => {
    void loadProducts();
  }, []);

  const categories = useMemo(() => Array.from(new Set(products.map((product) => product.category))).sort(), [products]);
  const filteredProducts = useMemo(() => products.filter((product) => {
    const searchable = `${product.name} ${product.category} ${product.supplier}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (category === "all" || product.category === category) && (status === "all" || product.status === status);
  }), [category, products, query, status]);
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [query, category, status]);
  useEffect(() => { if (currentPage > pageCount) setCurrentPage(pageCount); }, [currentPage, pageCount]);

  const metrics = useMemo(() => ({
    total: products.length,
    active: products.filter((product) => product.status === "Active").length,
    lowStock: products.filter((product) => product.stockQuantity <= lowStockThreshold).length,
    value: products.reduce((total, product) => total + product.price * product.stockQuantity, 0),
  }), [products]);

  const deleteProduct = async () => {
    if (!productToDelete) return;
    await api.remove(productToDelete.id);
    setProductToDelete(null);
    setNotice("Product deleted");
    void loadProducts();
  };

  const saveProduct = () => {
    const mode = modal === "create" ? "added" : "updated";
    setModal(null);
    setNotice(`Product ${mode}`);
    void loadProducts();
  };

  return (
    <div className="flex min-h-[calc(100svh-5rem)] flex-col">
      <PageHeader
        title="Products"
        description="Manage and review the product catalogue."
        action={<button type="button" onClick={() => setModal("create")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-lime px-4 py-2 text-sm font-semibold leading-5 text-ink transition-opacity hover:opacity-85"><IconPlus size={17} stroke={2.25} /> Add product</button>}
      />

      {notice && <p className="mb-4 text-sm text-lime">{notice}</p>}

      <section aria-label="Product overview" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProductKpi label="Total products" value={String(metrics.total)} />
        <ProductKpi label="Active products" value={String(metrics.active)} />
        <ProductKpi label="Low-stock items" value={String(metrics.lowStock)} emphasis />
        <ProductKpi label="Inventory value" value={formatCurrency(metrics.value)} />
      </section>

      <section className="mt-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-panel md:mt-12">
        <div className="flex flex-col gap-4 border-b border-line p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-lg border border-line bg-ink px-3 text-muted md:max-w-xl">
            <IconSearch size={18} className="shrink-0" />
            <input aria-label="Search products" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, category, or supplier" className="w-full min-w-0 bg-transparent text-sm text-copy outline-none placeholder:text-muted" />
          </div>
          <div className="flex w-full gap-3 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:flex-none"><select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 w-full appearance-none rounded-lg border border-line bg-ink px-3 pr-10 text-sm leading-5 text-copy outline-none focus:border-lime">
              <option value="all">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select><IconChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" /></div>
            <div className="relative min-w-0 flex-1 sm:flex-none"><select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value as "all" | ProductStatus)} className="h-11 w-full appearance-none rounded-lg border border-line bg-ink px-3 pr-10 text-sm leading-5 text-copy outline-none focus:border-lime">
              {statuses.map((item) => <option key={item} value={item}>{item === "all" ? "All statuses" : item}</option>)}
            </select><IconChevronDown aria-hidden="true" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" /></div>
          </div>
        </div>

        <div className="min-h-[12rem] flex-1 overflow-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#222426] text-xs text-muted">
              <tr>
                <th className="px-5 py-3.5 font-medium">Product</th>
                <th className="px-5 py-3.5 font-medium">Category</th>
                <th className="px-5 py-3.5 font-medium">Supplier</th>
                <th className="px-5 py-3.5 text-right font-medium">Price</th>
                <th className="px-5 py-3.5 text-right font-medium">Stock</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="border-t border-line transition-colors hover:bg-[#1b1d1f]">
                  <td className="px-5 py-4"><Link to={`/products/${product.id}`} className="font-medium text-copy hover:text-lime">{product.name}</Link><p className="mt-1 max-w-xs truncate text-xs text-muted">{product.description}</p></td>
                  <td className="px-5 py-4 text-muted">{product.category}</td>
                  <td className="px-5 py-4 text-muted">{product.supplier}</td>
                  <td className="px-5 py-4 text-right text-copy">{formatCurrency(product.price)}</td>
                  <td className={product.stockQuantity <= lowStockThreshold ? "px-5 py-4 text-right text-amber" : "px-5 py-4 text-right text-copy"}>{product.stockQuantity}</td>
                  <td className="px-5 py-4 text-muted">{product.status}</td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-2"><button aria-label={`Edit ${product.name}`} onClick={() => setModal(product)} className="p-2 text-muted hover:text-lime"><IconEdit size={17} /></button><button aria-label={`Delete ${product.name}`} onClick={() => setProductToDelete(product)} className="p-2 text-muted hover:text-coral"><IconTrash size={17} /></button></div></td>
                </tr>
              ))}
              {!filteredProducts.length && <tr><td colSpan={7} className="px-5 py-14 text-center text-sm text-muted"><IconPackage className="mx-auto mb-3" size={22} />No products match the current filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-line px-4 py-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between md:px-5">
          <span>{filteredProducts.length ? `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredProducts.length)} of ${filteredProducts.length}` : "0 products"}</span>
          <div className="flex items-center gap-2"><button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)} className="min-h-9 border border-line px-3 text-copy transition-colors hover:border-lime disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span aria-label={`Page ${currentPage} of ${pageCount}`} className="min-w-16 text-center">Page {currentPage} of {pageCount}</span><button type="button" disabled={currentPage === pageCount} onClick={() => setCurrentPage((page) => page + 1)} className="min-h-9 border border-line px-3 text-copy transition-colors hover:border-lime disabled:cursor-not-allowed disabled:opacity-40">Next</button></div>
        </div>
      </section>

      {modal && <ProductModal value={modal === "create" ? undefined : modal} onClose={() => setModal(null)} onSaved={saveProduct} />}
      {productToDelete && <ConfirmDialog productName={productToDelete.name} onCancel={() => setProductToDelete(null)} onConfirm={deleteProduct} />}
    </div>
  );
}
