"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";

export function ConditionalFooter() {
  const pathname = usePathname();

  // Hide footer on login, signup, and upload art (dashboard) pages
  const hideFooterRoutes = ["/login", "/signup", "/dashboard", "/gallery", "/upload"];

  if (hideFooterRoutes.includes(pathname)) {
    return null;
  }

  return <Footer />;
}
