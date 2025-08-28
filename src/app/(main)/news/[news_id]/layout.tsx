import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News Details | TT (I.K.I.) Autoparts",
  description:
    "Read the full article for in-depth information, announcements, and updates from TT (I.K.I.) Autoparts. Stay informed about our latest products, promotions, and industry trends.",
};

export default function NewsDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
