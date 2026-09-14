export function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="min-h-28 rounded-lg border border-line bg-panel p-5"><p className="text-xs text-muted">{label}</p><p className={accent ? "mt-3 text-2xl font-semibold text-lime" : "mt-3 text-2xl font-semibold text-copy"}>{value}</p></div>;
}
