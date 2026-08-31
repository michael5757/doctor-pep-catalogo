import type { Metadata } from "next";
import type { ReactNode } from "react";

const title = "Doctor Pep | Catálogo y atención personalizada";
const description =
  "Explora el catálogo Doctor Pep, compara presentaciones y prepara una consulta personalizada por WhatsApp.";
const siteUrl = "https://doctor-pep-catalogo.gremori57.chatgpt.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Doctor Pep",
  title,
  description,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_EC",
    siteName: "Doctor Pep",
    title,
    description,
    images: [
      {
        url: `${siteUrl}/og.png`,
        width: 1731,
        height: 909,
        alt: "Doctor Pep — Catálogo y atención personalizada",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${siteUrl}/og.png`],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#071F54" />
        <link rel="icon" type="image/webp" href="/assets/doctor-pep-logo.webp" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/styles-v3.css" />
      </head>
      <body data-whatsapp-number="593989009150">
        {children}
        <script src="/script-v2.js" defer />
      </body>
    </html>
  );
}
