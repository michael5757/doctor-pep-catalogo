import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../styles-v3.css";
import "../styles-storefront.css";
import "../styles-refinement.css";
import { analyticsSettings, baseUrl, siteConfig, structuredData } from '../data/site-config.mjs';
import { metadataFor, safeJson } from '../data/seo.mjs';

export const metadata: Metadata = {
  ...(metadataFor('home') as Metadata),
  metadataBase: new URL(baseUrl(true)),
  applicationName: "Doctor Ecupep",
  verification: siteConfig.googleVerification ? { google: siteConfig.googleVerification } : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#071F54" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <link rel="icon" type="image/png" href="/assets/doctor-ecupep-logo-oficial.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(structuredData(true)) }} />
      </head>
      <body data-whatsapp-number="593989009150">
        {children}
        <script src="/script-v2.min.js" defer />
        <script src="/analytics.js" data-config={JSON.stringify(analyticsSettings())} defer />
      </body>
    </html>
  );
}
