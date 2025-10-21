import './globals.css';
import { League_Spartan } from "next/font/google";
import type { Metadata } from "next";

const leagueSpartan = League_Spartan({
  weight: ['300', '400', '500', '700'], 
  subsets: ['latin'],
  variable: '--font-league-spartan', // Adicione esta linha
});

export const metadata: Metadata = {
  title: "Página Principal",
  description: "Projeto Integrador I",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Aplique a classe da variável da fonte aqui
    <html lang="pt-BR" className={leagueSpartan.variable}> 
      <body>
        {children}
      </body>
    </html>
  );
}