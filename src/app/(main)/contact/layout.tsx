import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Details | TT (I.K.I.) Autoparts",
  description:
    "Find our full contact information, including phone numbers, email addresses, office locations, and business hours. We’re here to help with any inquiries or support you need.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
