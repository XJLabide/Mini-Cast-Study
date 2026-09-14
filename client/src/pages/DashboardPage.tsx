import { useEffect, useState } from "react";
import { IconChevronRight, IconPackage } from "@tabler/icons-react";
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
          <section className="mt-8 grid items-stretch gap-5 lg:min-h-[430px] lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-lg border border-line bg-panel p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between"><h2 className="font-medium text-copy">Products by category</h2><Link to="/reports" className="text-xs text-muted hover:text-lime">View reports <IconChevronRight className="inline" size={14} /></Link></div>
              {data.byCategory.map((item) => <div key={item.category} className="flex items-center justify-between border-b border-line py-3 text-sm"><span className="text-muted">{item.category}</span><span className="text-copy">{item.count}</span></div>)}
            </div>
            <div className="rounded-lg border border-line bg-panel p-5 md:p-6">
              <div className="flex items-start justify-between"><div><h2 className="font-medium text-copy">Stock check</h2><p className="mt-1 text-xs text-muted">Items at or below 10 units</p></div><Link to="/reports" className="text-xs text-lime hover:underline">View all</Link></div>
              <div className="mt-6 flex items-end gap-3"><span className="text-3xl font-semibold text-amber">{report?.lowStock.length ?? 0}</span><span className="pb-1 text-sm text-muted">items need review</span></div>
            </div>
          </section>
        </>
      ) : <Loading />}
    </>
  );
}
