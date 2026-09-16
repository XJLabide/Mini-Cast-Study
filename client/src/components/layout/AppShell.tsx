import { Link, useLocation } from "react-router-dom";
import { SidebarBody, SidebarLink, useSidebar } from "@/components/ui/sidebar";
import { motion } from "motion/react";
import { IconBook2 } from "@tabler/icons-react";
import { navigationLinks } from "@/constants/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { open, setOpen } = useSidebar();

  return (
    <div className="flex min-h-screen bg-ink">
      <SidebarBody className="py-7">
        <div className="flex h-full flex-col">
          <Link to="/" aria-label="Midnight Inventory dashboard" className="mb-12 flex min-h-7 items-center gap-3 px-5">
            <span className="grid h-7 w-7 place-items-center bg-lime text-sm font-black text-ink">M</span>
            <motion.span animate={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }} className="overflow-hidden whitespace-nowrap text-sm font-semibold tracking-wide text-copy">Midnight Inventory</motion.span>
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            {navigationLinks.map((link) => (
              <SidebarLink key={link.href} link={link} active={location.pathname === link.href || (link.href === "/products" && location.pathname.startsWith("/products"))} />
            ))}
          </nav>
          <div className="mb-5 border-t border-line pt-4">
            <SidebarLink link={{ label: "Documentation", href: "/documentation", icon: <IconBook2 size={19} /> }} active={location.pathname === "/documentation"} />
          </div>
          <div className="flex items-center gap-3 overflow-hidden border-t border-line px-5 pt-5 text-xs text-muted" aria-label="Inventory team">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#33372f] text-lime">MI</span>
            <motion.span animate={{ opacity: open ? 1 : 0, width: open ? "auto" : 0 }} className="overflow-hidden whitespace-nowrap">Inventory team</motion.span>
          </div>
        </div>
      </SidebarBody>
      <main className="h-svh min-h-0 min-w-0 flex-1 overflow-y-auto px-5 pb-12 pt-20 md:pt-10 md:px-10" onClick={() => setOpen(false)}>{children}</main>
    </div>
  );
}
