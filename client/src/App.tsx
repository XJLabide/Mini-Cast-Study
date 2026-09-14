import { Route, Routes } from "react-router-dom";
import { Sidebar } from "@/components/ui/sidebar";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { ProductDetailsPage } from "@/pages/ProductDetailsPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { ReorderCenterPage } from "@/pages/ReorderCenterPage";

export default function App() {
  return (
    <Sidebar>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reorder" element={<ReorderCenterPage />} />
          <Route path="*" element={<DashboardPage />} />
        </Routes>
      </AppShell>
    </Sidebar>
  );
}
