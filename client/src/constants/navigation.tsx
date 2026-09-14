import { IconDashboard, IconPackage, IconRefresh, IconReportAnalytics } from "@tabler/icons-react";

export const navigationLinks = [
  { label: "Dashboard", href: "/", icon: <IconDashboard size={19} /> },
  { label: "Products", href: "/products", icon: <IconPackage size={19} /> },
  { label: "Reorder Center", href: "/reorder", icon: <IconRefresh size={19} /> },
  { label: "Inventory Reports", href: "/reports", icon: <IconReportAnalytics size={19} /> },
];
