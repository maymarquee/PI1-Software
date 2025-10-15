import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import './globals.css';

const leangueSpartan = League_Spartan({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meu Projeto",
  description: "Projeto Integrador I",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={leangueSpartan.className}>
        {children}
      </body>
    </html>
  );
}