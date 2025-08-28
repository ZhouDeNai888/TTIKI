import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | TT (I.K.I.) Autoparts",
  description:
    "View and manage your personal information, shipping addresses, and account settings. Keep your profile up to date for a smoother shopping experience.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
