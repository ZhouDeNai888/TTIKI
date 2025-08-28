import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News | TT (I.K.I.) Autoparts",
  description:
    "Stay updated with the latest news, product launches, promotions, and industry insights from TT (I.K.I.) Autoparts. Don’t miss out on what’s new in the automotive world.",
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
