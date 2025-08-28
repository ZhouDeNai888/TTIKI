import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up | TT (I.K.I.) Autoparts",
  description:
    "Join our community to access exclusive deals, manage your orders, track shipments, and get personalized support for all your automotive parts needs. Signing up is fast, free, and easy.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
