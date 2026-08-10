import type { Metadata, Viewport } from "next";
import AccessibilityEnhancements from "./accessibility-enhancements";
import StructuredData from "./structured-data";
import { siteDescription, siteName, siteUrl } from "./site-config";
import "./fonts.css";
/* A ordem destes imports E a cascata. Foram partidos em intervalos
   contiguos do arquivo original justamente para que ela permanecesse
   identica — o responsivo por ultimo, que e quem sobrescreve. */
import "./base.css";
import "./header.css";
import "./hero.css";
import "./portfolio.css";
import "./process.css";
import "./about.css";
import "./contact.css";
import "./responsive.css";
import "./accessibility.css";

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
      <head>
        {/* Sem isto a fonte só é descoberta depois que o CSS é lido, o que
            atrasa o texto final em uma ida e volta de rede. Só a faixa
            latina: é a única que uma página em português usa de fato. */}
        <link
          rel="preload"
          href="/fonts/geist/geist-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <StructuredData />
        <AccessibilityEnhancements />
        {children}
      </body>
    </html>
  );
}
