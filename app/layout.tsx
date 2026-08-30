import type { Metadata } from "next";
import type { ReactNode } from "react";

const title = "Doctor Pep | Catálogo y atención personalizada";
const description =
  "Revisa presentaciones, cuidados de conservación y consulta disponibilidad directamente por WhatsApp.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    type: "website",
    locale: "es_EC",
    title,
    description,
    images: [
      {
        url: "/og.png",
        width: 1740,
        height: 912,
        alt: "Doctor Pep — Catálogo y atención personalizada",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#173F35" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/styles-v2.css" />
      </head>
      <body data-whatsapp-number="593989009150">
        {children}
        <script src="/script-v2.js" defer />
      </body>
    </html>
  );
}
