import type { ProductInput, ProductStatus } from "@/types/product";

const validStatuses: ProductStatus[] = ["Active", "Inactive", "Discontinued"];

export function isProductStatus(value: unknown): value is ProductStatus {
  return typeof value === "string" && validStatuses.includes(value as ProductStatus);
}

export function validateProductInput(input: ProductInput): void {
  const textFields: Array<keyof ProductInput> = ["name", "category", "description", "supplier"];
  for (const field of textFields) {
    if (typeof input[field] !== "string" || !input[field].trim()) throw new Error(`${field} is required`);
  }
  if (typeof input.price !== "number" || !Number.isFinite(input.price) || input.price < 0) throw new Error("Price must be a finite, non-negative number");
  if (typeof input.stockQuantity !== "number" || !Number.isInteger(input.stockQuantity) || input.stockQuantity < 0) throw new Error("Stock quantity must be a non-negative whole number");
  if (!isProductStatus(input.status)) throw new Error("Status is invalid");
}
