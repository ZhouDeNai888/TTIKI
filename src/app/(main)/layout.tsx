import type { Metadata } from "next";
import Navbar from "@/component/Navbar";
import Footer from "@/component/Footer";

import "../globals.css";
import { NotifyProvider } from "@/context/NotifyContext";

export const metadata: Metadata = {
  title: "TT (I.K.I.) Autoparts",
  description: "Thailand's #1 Autoparts Company",
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NotifyProvider>
        <Navbar />
        {children}
        <Footer />
      </NotifyProvider>
    </>
  );
}
