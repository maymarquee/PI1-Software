
import './globals.css';
import { League_Spartan } from "next/font/google";
import type { Metadata } from "next";


const leagueSpartan = League_Spartan({
  weight: ['300', '400', '500', '700'], 
  //...
});

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
    <html lang="pt-BR" className={leagueSpartan.className}>
      <body >
        {children}
      </body>
    </html>
  );
}
