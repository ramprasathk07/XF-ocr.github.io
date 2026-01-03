import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XFINITE-OCR | Professional Document Intelligence",
  description: "Advanced Neural OCR & Document Analysis Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
