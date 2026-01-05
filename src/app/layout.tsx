import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "normalized.ru — Backend для вашего приложения",
  description: "Postgres, Auth, Storage, Realtime API. Данные в России.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
