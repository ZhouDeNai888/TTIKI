import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Details | TT (I.K.I.) Autoparts",
  description:
    "Review the full details of your order — including items purchased, shipping status, payment method, and invoice. Everything you need to know about your order, all in one place.",
};

export default function OrderDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
