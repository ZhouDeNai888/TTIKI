import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | TT (I.K.I.) Autoparts",
  description:
    "Access your account to manage orders, view your purchase history, and get the best automotive deals tailored for you.",
};

export default function SigninLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
