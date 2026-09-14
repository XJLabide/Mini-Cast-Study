import { useEffect, useRef, useState } from "react";
import { IconX } from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";
import { api } from "@/lib/api";
import { useDialogFocus } from "@/lib/useDialogFocus";
import type { Product, ProductInput, ProductStatus } from "@/types/product";

const emptyProduct: ProductInput = { name: "", category: "", description: "", price: 0, stockQuantity: 0, supplier: "", status: "Active" };
const fields = [["name", "Product name", "text"], ["category", "Category", "text"], ["supplier", "Supplier", "text"], ["price", "Price", "number"], ["stockQuantity", "Stock quantity", "number"]] as const;

export function ProductModal({ value, onClose, onSaved }: { value?: Product; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<ProductInput>(value ? { name: value.name, category: value.category, description: value.description, price: value.price, stockQuantity: value.stockQuantity, supplier: value.supplier, status: value.status } : emptyProduct);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, onClose, saving);

  useEffect(() => {
    firstInputRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape" && !saving) onClose(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, saving]);

  const update = (key: keyof ProductInput, nextValue: string | number) => setForm((current) => ({ ...current, [key]: nextValue }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try { value ? await api.update(value.id, form) : await api.create(form); onSaved(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save product"); setSaving(false); }
  };

  return (
    <div role="presentation" className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onMouseDown={(event) => event.target === event.currentTarget && !saving && onClose()}>
      <motion.div ref={dialogRef} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} role="dialog" aria-modal="true" aria-labelledby="product-form-title" className="w-full max-w-xl border border-line bg-panel p-6">
        <div className="mb-6 flex items-center justify-between"><h2 id="product-form-title" className="text-lg font-semibold text-copy">{value ? "Edit product" : "Add product"}</h2><button aria-label="Close product form" onClick={onClose} className="text-muted hover:text-copy"><IconX size={19} /></button></div>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          {fields.map(([key, label, type], index) => <label key={key} className="grid gap-2 text-xs text-muted">{label}<input ref={index === 0 ? firstInputRef : undefined} required min={type === "number" ? 0 : undefined} step={key === "price" ? "0.01" : undefined} type={type} value={form[key]} onChange={(event) => update(key, type === "number" ? Number(event.target.value) : event.target.value)} className="border border-line bg-ink px-3 py-2 text-sm text-copy outline-none focus:border-lime" /></label>)}
          <label className="grid gap-2 text-xs text-muted">Status<select value={form.status} onChange={(event) => update("status", event.target.value as ProductStatus)} className="border border-line bg-ink px-3 py-2 text-sm text-copy outline-none focus:border-lime">{["Active", "Inactive", "Discontinued"].map((status) => <option key={status}>{status}</option>)}</select></label>
          <label className="grid gap-2 text-xs text-muted sm:col-span-2">Description<textarea required value={form.description} onChange={(event) => update("description", event.target.value)} rows={3} className="resize-none border border-line bg-ink px-3 py-2 text-sm text-copy outline-none focus:border-lime" /></label>
          {error && <p role="alert" className="sm:col-span-2 text-sm text-coral">{error}</p>}
          <div className="flex justify-end gap-3 border-t border-line pt-5 sm:col-span-2"><button type="button" onClick={onClose} className="border border-line px-4 py-2 text-sm text-muted hover:text-copy">Cancel</button><button disabled={saving} className="bg-lime px-4 py-2 text-sm font-semibold text-ink disabled:opacity-50">{saving ? "Saving…" : "Save product"}</button></div>
        </form>
      </motion.div>
    </div>
  );
}
