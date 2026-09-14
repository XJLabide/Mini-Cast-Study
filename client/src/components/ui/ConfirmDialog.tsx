import { useEffect, useRef, useState } from "react";
import { IconAlertTriangle, IconX } from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";
import { useDialogFocus } from "@/lib/useDialogFocus";

type ConfirmDialogProps = { productName: string; onCancel: () => void; onConfirm: () => Promise<void> };

export function ConfirmDialog({ productName, onCancel, onConfirm }: ConfirmDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const cancelRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, onCancel, deleting);

  useEffect(() => {
    cancelRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape" && !deleting) onCancel(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [deleting, onCancel]);

  const confirm = async () => {
    setDeleting(true);
    setError("");
    try { await onConfirm(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to delete product"); setDeleting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !deleting && onCancel()}>
      <motion.div ref={dialogRef} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} role="alertdialog" aria-modal="true" aria-labelledby="delete-product-title" aria-describedby="delete-product-description" className="w-full max-w-md rounded-lg border border-line bg-panel p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#3a2824] text-coral"><IconAlertTriangle size={19} /></span><div><h2 id="delete-product-title" className="text-lg font-semibold text-copy">Delete product?</h2><p id="delete-product-description" className="mt-2 text-sm leading-6 text-muted">You are about to delete <span className="font-medium text-copy">{productName}</span>. This action cannot be undone.</p></div></div>
          <button ref={cancelRef} aria-label="Close delete dialog" onClick={onCancel} className="text-muted hover:text-copy"><IconX size={19} /></button>
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-coral">{error}</p>}
        <div className="mt-6 flex justify-end gap-3 border-t border-line pt-5"><button type="button" onClick={onCancel} className="border border-line px-4 py-2 text-sm text-muted hover:text-copy">Cancel</button><button type="button" disabled={deleting} onClick={() => void confirm()} className="bg-coral px-4 py-2 text-sm font-semibold text-ink disabled:opacity-50">{deleting ? "Deleting…" : "Delete product"}</button></div>
      </motion.div>
    </div>
  );
}
