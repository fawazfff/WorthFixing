import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorthFixing — Repair or replace?",
  description: "Upload a photo of a broken item and get a practical repair-or-replace decision.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
