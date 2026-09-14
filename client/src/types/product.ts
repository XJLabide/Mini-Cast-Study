export type ProductStatus = "Active" | "Inactive" | "Discontinued";
export type Product = { id: number; name: string; category: string; description: string; price: number; stockQuantity: number; supplier: string; status: ProductStatus; createdAt: string; updatedAt: string };
export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;
export type ReorderStatus = "Draft" | "Requested" | "Ordered" | "Received" | "Cancelled";
export type ReorderRequest = { id: number; productId: number; productName: string; supplier: string; quantity: number; status: ReorderStatus; notes: string; createdAt: string; updatedAt: string };
export type ReorderRequestInput = Omit<ReorderRequest, "id" | "createdAt" | "updatedAt">;
