import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | TT (I.K.I.) Autoparts",
  description:
    "Browse our wide selection of high-quality auto parts and accessories. Whether you're a professional mechanic or a car enthusiast, we’ve got everything you need to keep your vehicle running smoothly.",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
