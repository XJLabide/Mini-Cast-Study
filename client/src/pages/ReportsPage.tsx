import { useEffect, useMemo, useState, type ReactNode } from "react";
import { IconAlertTriangle, IconPackage, IconReportAnalytics } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { api, type InventoryReport } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loading } from "@/components/shared/Loading";

const priorityFor = (stock: number) => stock <= 3 ? "Critical" : stock <= 6 ? "High" : "Medium";
const priorityClass = (stock: number) => stock <= 3 ? "text-coral" : stock <= 6 ? "text-amber" : "text-copy";

export function ReportsPage() {
  const [data, setData] = useState<InventoryReport | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api.report().then(setData).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load reports")); }, []);

  const highestValueRisks = useMemo(() => data ? [...data.lowStock].sort((a, b) => b.price * b.stockQuantity - a.price * a.stockQuantity) : [], [data]);

  return <><PageHeader title="Inventory reports" description="Decision support for inventory value, replenishment risk, and supplier exposure." />{error ? <ErrorState message={error} /> : data ? <div className="space-y-6">
    <section aria-label="Inventory decision summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ReportKpi label="Total inventory value" value={formatCurrency(data.stockValue)} />
      <ReportKpi label="Value at low-stock risk" value={formatCurrency(data.lowStockValue)} warning />
      <ReportKpi label="Units on hand" value={String(data.totalUnits)} />
      <ReportKpi label="Zero-stock products" value={String(data.zeroStock.length)} warning={data.zeroStock.length > 0} />
    </section>
    <section className="rounded-lg border border-line bg-panel p-5 md:p-6">
      <div className="flex items-start gap-3"><span className="mt-0.5 text-amber"><IconAlertTriangle size={19} /></span><div><h2 className="font-medium text-copy">Replenishment risk</h2><p className="mt-1 text-xs text-muted">Prioritize action by stock severity before reviewing value exposure.</p></div></div>
      <div className="mt-5 grid grid-cols-3 gap-4 border-t border-line pt-5"><RiskStat label="Critical · 0–3 units" value={data.criticalItems} className="text-coral" /><RiskStat label="High · 4–6 units" value={data.highPriorityItems} className="text-amber" /><RiskStat label="Medium · 7–10 units" value={data.mediumPriorityItems} className="text-copy" /></div>
    </section>
    <ReportTable title="Immediate attention" description="Low-stock products ranked by current inventory value." icon={<IconPackage size={18} />}>
      <table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#202224] text-xs text-muted"><tr><th className="px-5 py-3 font-medium">Product</th><th className="px-5 py-3 font-medium">Supplier</th><th className="px-5 py-3 text-right font-medium">Stock</th><th className="px-5 py-3 text-right font-medium">Value on hand</th><th className="px-5 py-3 font-medium">Priority</th></tr></thead><tbody>{highestValueRisks.map((product) => <tr key={product.id} className="border-t border-line"><td className="px-5 py-3"><Link to={`/products/${product.id}`} className="text-copy hover:text-lime">{product.name}</Link></td><td className="px-5 py-3 text-muted">{product.supplier}</td><td className="px-5 py-3 text-right text-amber">{product.stockQuantity}</td><td className="px-5 py-3 text-right text-copy">{formatCurrency(product.price * product.stockQuantity)}</td><td className={`px-5 py-3 font-medium ${priorityClass(product.stockQuantity)}`}>{priorityFor(product.stockQuantity)}</td></tr>)}{!highestValueRisks.length && <EmptyRow columns={5} text="No low-stock products need attention." />}</tbody></table>
    </ReportTable>
    <div className="grid gap-6 lg:grid-cols-2">
      <ReportTable title="Supplier exposure" description="Where replenishment risk and inventory value are concentrated."><table className="w-full min-w-[520px] text-left text-sm"><thead className="bg-[#202224] text-xs text-muted"><tr><th className="px-5 py-3 font-medium">Supplier</th><th className="px-5 py-3 text-right font-medium">Products</th><th className="px-5 py-3 text-right font-medium">At risk</th><th className="px-5 py-3 text-right font-medium">Value</th></tr></thead><tbody>{data.bySupplier.map((item) => <tr key={item.supplier} className="border-t border-line"><td className="px-5 py-3 text-copy">{item.supplier}</td><td className="px-5 py-3 text-right text-muted">{item.products}</td><td className={`px-5 py-3 text-right ${item.lowStock ? "text-amber" : "text-muted"}`}>{item.lowStock}</td><td className="px-5 py-3 text-right text-copy">{formatCurrency(item.stockValue)}</td></tr>)}</tbody></table></ReportTable>
      <ReportTable title="Category performance" description="Stock value and low-stock count by category."><table className="w-full min-w-[520px] text-left text-sm"><thead className="bg-[#202224] text-xs text-muted"><tr><th className="px-5 py-3 font-medium">Category</th><th className="px-5 py-3 text-right font-medium">Products</th><th className="px-5 py-3 text-right font-medium">Units</th><th className="px-5 py-3 text-right font-medium">Value</th></tr></thead><tbody>{data.byCategory.map((item) => <tr key={item.category} className="border-t border-line"><td className="px-5 py-3 text-copy">{item.category}</td><td className="px-5 py-3 text-right text-muted">{item.products}</td><td className="px-5 py-3 text-right text-copy">{item.stock}</td><td className="px-5 py-3 text-right text-copy">{formatCurrency(item.stockValue)}</td></tr>)}</tbody></table></ReportTable>
    </div>
    <ReportTable title="Reorder request status" description="Current replenishment workload by workflow stage." icon={<IconReportAnalytics size={18} />}><div className="grid gap-3 p-5 sm:grid-cols-5">{data.reorderStatuses.map((item) => <div key={item.status} className="border-l border-line pl-3"><p className="text-xs text-muted">{item.status}</p><p className="mt-1 text-xl font-semibold text-copy">{item.count}</p></div>)}</div></ReportTable>
  </div> : <Loading />}</>;
}

function ReportKpi({ label, value, warning = false }: { label: string; value: string; warning?: boolean }) { return <div className="min-h-28 rounded-lg border border-line bg-panel p-5"><p className="text-xs text-muted">{label}</p><p className={`mt-3 text-2xl font-semibold ${warning ? "text-amber" : "text-copy"}`}>{value}</p></div>; }
function RiskStat({ label, value, className }: { label: string; value: number; className: string }) { return <div><p className="text-xs text-muted">{label}</p><p className={`mt-2 text-2xl font-semibold ${className}`}>{value}</p></div>; }
function ReportTable({ title, description, icon, children }: { title: string; description: string; icon?: ReactNode; children: ReactNode }) { return <section className="overflow-hidden rounded-lg border border-line bg-panel"><div className="border-b border-line p-5 md:p-6"><div className="flex items-center gap-2 text-copy">{icon}<h2 className="font-medium">{title}</h2></div><p className="mt-1 text-xs text-muted">{description}</p></div><div className="overflow-x-auto">{children}</div></section>; }
function EmptyRow({ columns, text }: { columns: number; text: string }) { return <tr><td colSpan={columns} className="px-5 py-8 text-center text-sm text-muted">{text}</td></tr>; }
