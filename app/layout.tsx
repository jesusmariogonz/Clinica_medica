import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dra. Maggie Morales | Medicina Estética · Saltillo",
  description:
    "Medicina estética en Saltillo, Coahuila. Resultados naturales, tratamientos personalizados y mínimamente invasivos con la Dra. Maggie Morales.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-MX"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-crema text-carbon font-sans">
        {children}
      </body>
    </html>
  );
}
