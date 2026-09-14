import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/product";
import { PageHeader } from "@/components/layout/PageHeader";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loading } from "@/components/shared/Loading";

export function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    if (!id) { setError("Product not found"); setLoading(false); return; }
    api.get(Number(id))
      .then(setProduct)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <><PageHeader title="Product details" description="Loading the selected product." /><Loading /></>;
  if (error || !product) return <><PageHeader title="Product details" description="The selected product could not be loaded." /><ErrorState message={error || "Product not found"} /><Link to="/products" className="mt-4 inline-block text-sm text-lime hover:underline">Back to products</Link></>;

  const details = [["Category", product.category], ["Supplier", product.supplier], ["Price", formatCurrency(product.price)], ["Stock quantity", String(product.stockQuantity)], ["Status", product.status], ["Last updated", new Date(product.updatedAt).toLocaleDateString()]];
  return <><PageHeader title={product.name} description={product.description} action={<button onClick={() => navigate("/products")} className="text-sm text-muted hover:text-lime">Back to products</button>} /><div className="grid gap-8 border-t border-line pt-6 sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="border-b border-line pb-4"><p className="text-xs text-muted">{label}</p><p className="mt-2 text-copy">{value}</p></div>)}</div></>;
}
