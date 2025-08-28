import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | TT (I.K.I.) Autoparts",
  description:
    "Review your order and complete your purchase securely. Confirm shipping details, choose a payment method, and finalize your order in just a few steps.",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
