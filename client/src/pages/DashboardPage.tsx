import { useEffect, useMemo, useState } from "react";
import { IconAlertTriangle, IconChevronRight, IconPackage } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { api, type DashboardData, type InventoryReport } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Metric } from "@/components/dashboard/Metric";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loading } from "@/components/shared/Loading";

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [report, setReport] = useState<InventoryReport | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.dashboard(), api.report()])
      .then(([dashboard, inventoryReport]) => { setData(dashboard); setReport(inventoryReport); })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load dashboard"));
  }, []);

  return (
    <>
      <PageHeader title="Dashboard" description="A current view of products, stock, and inventory value." action={<Link className="inline-flex items-center gap-2 rounded-lg bg-lime px-4 py-2 text-sm font-semibold text-ink transition-opacity hover:opacity-85" to="/products"><IconPackage size={17} /> Manage products</Link>} />
      {error ? <ErrorState message={error} /> : data ? (
        <>
          <section className="grid grid-cols-1 gap-4 border-b border-line pb-8 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
            <Metric label="Total products" value={String(data.totalProducts)} />
            <Metric label="Units in stock" value={String(data.totalStock)} />
            <Metric label="Low stock" value={String(data.lowStock)} accent />
            <Metric label="Stock value" value={formatCurrency(data.stockValue)} />
          </section>
          <section className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
            <CategoryChart categories={data.byCategory} />
            <StockCheck products={report?.lowStock ?? []} />
          </section>
        </>
      ) : <Loading />}
    </>
  );
}

function CategoryChart({ categories }: { categories: DashboardData["byCategory"] }) {
  const maxCount = Math.max(...categories.map((item) => item.count), 1);
  return (
    <section className="rounded-lg border border-line bg-panel p-5 md:p-6" aria-labelledby="category-chart-title">
      <div className="mb-6 flex items-center justify-between"><h2 id="category-chart-title" className="font-medium text-copy">Products by category</h2><Link to="/reports" className="text-xs text-muted hover:text-lime">View reports <IconChevronRight className="inline" size={14} /></Link></div>
      {categories.length ? <div className="space-y-5" role="list" aria-label="Product count by category">{categories.map((item) => <div key={item.category} role="listitem"><div className="mb-2 flex items-center justify-between gap-4 text-sm"><span className="text-muted">{item.category}</span><span className="tabular-nums text-copy">{item.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-ink"><div className="h-full rounded-full bg-lime transition-[width] duration-500" style={{ width: `${(item.count / maxCount) * 100}%` }} /></div></div>)}</div> : <p className="text-sm text-muted">No category data available.</p>}
    </section>
  );
}

function StockCheck({ products }: { products: InventoryReport["lowStock"] }) {
  return (
    <section className="rounded-lg border border-line bg-panel p-5 md:p-6" aria-labelledby="stock-check-title">
      <div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><IconAlertTriangle size={18} className="text-amber" /><h2 id="stock-check-title" className="font-medium text-copy">Stock check</h2></div><p className="mt-2 text-xs text-muted">Items at or below 10 units</p></div><Link to="/reorder" className="text-xs text-lime hover:underline">Open center</Link></div>
      {products.length ? <div className="mt-6 divide-y divide-line">{products.slice(0, 5).map((product) => <div key={product.id} className="flex items-center justify-between gap-4 py-3 first:pt-0"><div className="min-w-0"><Link to={`/products/${product.id}`} className="block truncate text-sm text-copy hover:text-lime">{product.name}</Link><span className="text-xs text-muted">{product.supplier}</span></div><span className="shrink-0 text-sm font-medium text-amber">{product.stockQuantity} units</span></div>)}{products.length > 5 && <Link to="/reorder" className="block pt-4 text-xs text-muted hover:text-lime">View {products.length - 5} more items <IconChevronRight className="inline" size={14} /></Link>}</div> : <p className="mt-6 text-sm text-muted">All products are above the reorder threshold.</p>}
    </section>
  );
}
