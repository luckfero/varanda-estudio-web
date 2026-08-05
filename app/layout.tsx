import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import AccessibilityEnhancements from "./accessibility-enhancements";
import { siteDescription, siteName, siteUrl } from "./site-config";
import "./globals.css";
import "./accessibility.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Sites para negócios brasileiros`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "criação de sites",
    "site para negócio",
    "desenvolvimento web",
    "landing page",
    "São Paulo",
  ],
  authors: [{ name: "Lucca Oliveira" }],
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: siteName,
    description: "Sites que dão espaço para o seu negócio crescer.",
    url: siteUrl,
    siteName,
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: siteName,
    description: "Sites que dão espaço para o seu negócio crescer.",
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
      <body className={geist.variable}>
        <AccessibilityEnhancements />
        {children}
      </body>
    </html>
  );
}
