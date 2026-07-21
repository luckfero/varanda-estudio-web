import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Varanda Estúdio Web | Sites para pequenos negócios",
    template: "%s | Varanda Estúdio Web",
  },
  description:
    "Sites profissionais, próximos e bem pensados para pequenos negócios brasileiros. Design, conteúdo e desenvolvimento com atendimento direto.",
  keywords: [
    "criação de sites",
    "site para pequeno negócio",
    "desenvolvimento web",
    "landing page",
    "São Paulo",
  ],
  authors: [{ name: "Lucca Oliveira" }],
  creator: "Varanda Estúdio Web",
  openGraph: {
    title: "Varanda Estúdio Web",
    description: "Sites que dão espaço para o seu negócio crescer.",
    locale: "pt_BR",
    type: "website",
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4efe6",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
