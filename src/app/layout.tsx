import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VisualClube | Sistema para Barbearias, Salões de Beleza & Estética",
  description:
    "Plataforma completa de gestão: agendamento online 24/7 integrado ao WhatsApp, comandas digitais com bar/produtos, divisão automática de comissões e controle financeiro.",
  keywords: [
    "sistema para barbearia",
    "sistema para salão de beleza",
    "software estética",
    "comandas digitais",
    "agendamento whatsapp barbearia",
    "controle financeiro salão",
    "visualclube"
  ],
  authors: [{ name: "VisualClube Tech" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
        "scroll-smooth"
      )}
    >
      <body 
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
