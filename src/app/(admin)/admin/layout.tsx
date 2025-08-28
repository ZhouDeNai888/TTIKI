import type { Metadata } from "next";

import Footer from "@/component/Footer";
import AdminNavbar from "@/component/AdminNavbar";
import { AdminNotifyProvider } from "@/context/AdminNotifyContext";
import "../../globals.css";

export const metadata: Metadata = {
  title: "Admin | TTIKI Autoparts",
  description: "Admin dashboard and management for TTIKI Autoparts.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminNotifyProvider>
      <AdminNavbar />
      {children}
      <Footer />
    </AdminNotifyProvider>
  );
}
