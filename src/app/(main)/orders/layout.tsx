import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders | TT (I.K.I.) Autoparts",
  description:
    "Track your current orders, view past purchases, and manage order details all in one place. Stay updated on shipping status and order history.",
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
